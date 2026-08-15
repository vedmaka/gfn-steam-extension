const isDebug = false;
const debugLog = (...args) => {
	if (isDebug) console.log(...args);
};
const debugWarn = (...args) => {
	if (isDebug) console.warn(...args);
};
const debugError = (...args) => {
	if (isDebug) console.error(...args);
};

class GFNChecker {
	constructor() {
		this.gfnGames = [];
		this.gamesByAppId = new Map();
		this.lastFetch = 0;
		this.cacheTime = 1000 * 60 * 60 * 24; // 24 hour cache
		this.cacheLoaded = false;
		this.cacheLoadingPromise = null;
		this.loadingPromise = null;
		this.apiUrl = 'https://api-prod.nvidia.com/services/gfngames/v1/gameList';
	}

	// GraphQL query to fetch games
	buildGraphQLQuery(cursor = null) {
		const afterClause = cursor ? `, after:"${cursor}"` : '';
		return `{
      apps(country:"US" language:"en_US"${afterClause}) {
        numberReturned
        pageInfo {
          endCursor
          hasNextPage
        }
        items {
          title
          id
          sortName
          variants {
            appStore
            publisherName
            id
            storeId
            storeUrl
          }
        }
      }
    }`;
	}

	async fetchGFNGamesGraphQL() {
		try {
			debugLog('GFN Checker: Fetching games from GraphQL API...');

			let allGames = [];
			let hasNextPage = true;
			let cursor = null;
			let pageCount = 0;

			while (hasNextPage && pageCount < 20) { // Safety limit to prevent infinite loops
				pageCount++;
				debugLog(`GFN Checker: Fetching page ${pageCount}${cursor ? ` (cursor: ${cursor})` : ''}`);

				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

				const response = await fetch(this.apiUrl, {
					method: 'POST',
					headers: {
						'Accept': '*/*',
						'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,ru;q=0.7',
						'Content-Type': 'application/json',
						'Origin': 'https://www.nvidia.com',
						'Priority': 'u=1, i',
						'Referer': 'https://www.nvidia.com/',
						'Sec-CH-UA': '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
						'Sec-CH-UA-Mobile': '?0',
						'Sec-CH-UA-Platform': '"macOS"',
						'Sec-Fetch-Dest': 'empty',
						'Sec-Fetch-Mode': 'cors',
						'Sec-Fetch-Site': 'same-site',
						'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
					},
					body: this.buildGraphQLQuery(cursor),
					signal: controller.signal
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					throw new Error(`GraphQL API error! status: ${response.status}`);
				}

				const data = await response.json();

				if (!data.data || !data.data.apps) {
					throw new Error('Invalid GraphQL response format');
				}

				const appsData = data.data.apps;
				allGames = allGames.concat(appsData.items || []);

				hasNextPage = appsData.pageInfo?.hasNextPage || false;
				cursor = appsData.pageInfo?.endCursor || null;

				debugLog(`GFN Checker: Page ${pageCount} - ${appsData.numberReturned} games, hasNextPage: ${hasNextPage}`);
			}

			debugLog(`GFN Checker: Successfully fetched ${allGames.length} total games from GraphQL API`);
			return allGames;

		} catch (error) {
			debugError('GFN Checker: GraphQL API failed:', error);
			throw error;
		}
	}

	async fetchGFNGames() {
		try {
			// Try GraphQL API first
			const allGames = await this.fetchGFNGamesGraphQL();

			// Filter and normalize Steam games from GraphQL response
			this.gfnGames = allGames
				.filter(game => {
					// Check if any variant is from Steam
					return game.variants && game.variants.some(variant =>
						variant.appStore === 'STEAM'
					);
				})
				.map(game => {
					const steamVariant = game.variants.find(variant => variant.appStore === 'STEAM');
					const storeId = steamVariant?.storeId == null
						? null
						: String(steamVariant.storeId).trim();

					return {
						title: game.title,
						sortName: game.sortName,
						variants: game.variants,
						id: game.id,
						steamUrl: steamVariant?.storeUrl,
						// NVIDIA's store ID is authoritative; older records may only provide a URL
						appId: storeId || this.extractAppIdFromUrl(steamVariant?.storeUrl)
					};
				})
				.filter(game => game.title); // Remove games without titles

			if (!this.gfnGames.length) {
				throw new Error('NVIDIA API returned no supported Steam games');
			}

			this.rebuildGameIndex();
			this.lastFetch = Date.now();

			// Cache the games list
			await chrome.storage.local.set({
				gfnGames: this.gfnGames,
				lastFetch: this.lastFetch
			});

			debugLog(`GFN Checker: Successfully processed ${this.gfnGames.length} Steam games from GraphQL API`);

		} catch (error) {
			debugError('GFN Checker: Failed to load games from GraphQL API:', error);
			throw error;
		}
	}

	extractAppIdFromUrl(steamUrl) {
		if (!steamUrl) return null;
		const match = steamUrl.match(/\/app\/(\d+)/);
		return match ? match[1] : null;
	}

	rebuildGameIndex() {
		this.gamesByAppId = new Map();

		for (const game of this.gfnGames) {
			const appId = game.appId == null ? '' : String(game.appId).trim();
			if (appId && !this.gamesByAppId.has(appId)) {
				this.gamesByAppId.set(appId, game);
			}
		}
	}

	async loadCachedGames() {
		if (this.cacheLoaded) return;

		if (!this.cacheLoadingPromise) {
			this.cacheLoadingPromise = chrome.storage.local
				.get(['gfnGames', 'lastFetch'])
				.then(cached => {
					if (cached.gfnGames && cached.lastFetch) {
						this.gfnGames = cached.gfnGames;
						this.lastFetch = cached.lastFetch;
						this.rebuildGameIndex();
					}

					this.cacheLoaded = true;
				})
				.finally(() => {
					this.cacheLoadingPromise = null;
				});
		}

		await this.cacheLoadingPromise;
	}

	async ensureGamesLoaded() {
		// Load from cache first
		await this.loadCachedGames();

		// Fetch fresh data if cache is old or empty
		if (!this.gfnGames.length || (Date.now() - this.lastFetch) > this.cacheTime) {
			if (!this.loadingPromise) {
				this.loadingPromise = this.fetchGFNGames()
					.finally(() => {
						this.loadingPromise = null;
					});
			}

			await this.loadingPromise;
		}

		if (!this.gfnGames.length) {
			throw new Error('No GeForce NOW games are available for matching');
		}
	}

	isGameAvailable(gameName, appId, steamUrl) {
		if (!this.gfnGames.length) {
			debugLog('GFN Checker: No games loaded yet');
			return { available: false, data: null };
		}

		const normalizedAppId = appId == null ? '' : String(appId).trim();
		const indexedGame = normalizedAppId ? this.gamesByAppId.get(normalizedAppId) : null;

		if (indexedGame) {
			debugLog(`GFN Checker: Match found by App ID: ${normalizedAppId}`);
			return { available: true, data: indexedGame };
		}

		let foundGame = null;

		const found = this.gfnGames.some(game => {
			// For fallback API data (has steamUrl and appId)
			if (game.steamUrl || game.appId) {
				// Check by Steam URL
				if (steamUrl && game.steamUrl && game.steamUrl.includes(steamUrl)) {
					debugLog(`GFN Checker: Match found by URL: ${steamUrl}`);
					foundGame = game;
					return true;
				}
			}

			// commented out because provides bad results
			// Name matching (works for both GraphQL and fallback data)
			// if (gameName && game.title) {
			// 	const normalizedGameName = this.normalizeGameName(gameName);
			// 	const normalizedGFNName = this.normalizeGameName(game.title);
			//
			// 	// Exact match
			// 	if (normalizedGameName === normalizedGFNName) {
			// 		debugLog(`GFN Checker: Exact name match: "${gameName}" = "${game.title}"`);
			// 		foundGame = game;
			// 		return true;
			// 	}
			//
			// 	// Contains match (for games with subtitles, editions, etc.)
			// 	if (normalizedGFNName.includes(normalizedGameName) ||
			// 		normalizedGameName.includes(normalizedGFNName)) {
			// 		debugLog(`GFN Checker: Fuzzy name match: "${gameName}" ≈ "${game.title}"`);
			// 		foundGame = game;
			// 		return true;
			// 	}
			//
			// 	// Check sortName for GraphQL data (more normalized form)
			// 	if (game.sortName) {
			// 		const normalizedSortName = this.normalizeGameName(game.sortName.replace(/_/g, ' '));
			// 		if (normalizedGameName === normalizedSortName ||
			// 			normalizedSortName.includes(normalizedGameName) ||
			// 			normalizedGameName.includes(normalizedSortName)) {
			// 			debugLog(`GFN Checker: Sort name match: "${gameName}" ≈ "${game.sortName}"`);
			// 			foundGame = game;
			// 			return true;
			// 		}
			// 	}
			// }

			return false;
		});

		if (found) {
			return { available: true, data: foundGame };
		} else {
			debugLog(`GFN Checker: No match found for "${gameName}"`);
			return { available: false, data: null };
		}

	}

	// Normalize game names for better matching
	normalizeGameName(name) {
		return name
			.toLowerCase()
			.trim()
			.replace(/[^\w\s]/g, '') // Remove punctuation
			.replace(/\s+/g, ' ') // Normalize whitespace
			.replace(/\b(the|a|an)\b/g, '') // Remove articles
			.replace(/\b(edition|goty|game of the year|definitive|ultimate|deluxe|premium|standard)\b/g, '') // Remove edition words
			.trim();
	}
}

// Initialize the GFN checker
const gfnChecker = new GFNChecker();

// Handle messages from content script - FIXED VERSION
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'checkGFNAvailability') {
		// Handle the async operation properly
		(async () => {
			try {
				await gfnChecker.ensureGamesLoaded();

				const { available, data } = gfnChecker.isGameAvailable(
					request.gameName,
					request.appId,
					request.url
				);

				sendResponse({ available: available, data: data });

			} catch (error) {
				debugError('GFN Checker: Error in message handler:', error);
				sendResponse({ available: false, error: error.message });
			}
		})();

		return true; // Keep the message channel open for async response
	}
});

// Preload games list when extension starts
gfnChecker.ensureGamesLoaded().catch(error => {
	debugError('GFN Checker: Initial game preload failed:', error);
});
