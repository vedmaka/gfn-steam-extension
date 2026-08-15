(function() {
	'use strict';
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

	class SteamGFNChecker {
		constructor() {
			this.observer = null;
		}

		// Function to extract game name from individual Steam game pages
		getGameNameFromPage() {
			const selectors = [
				'.apphub_AppName',
				'#appHubAppName',
				'.page_title_area .apphub_AppName',
				'h1.apphub_AppName'
			];

			for (const selector of selectors) {
				const element = document.querySelector(selector);
				if (element && element.textContent.trim()) {
					return element.textContent.trim();
				}
			}

			// Fallback: try to get from page title
			const title = document.title;
			if (title.includes('on Steam')) {
				return title.replace(' on Steam', '').trim();
			}

			return null;
		}

		// Function to get app ID from URL or individual page
		getAppIdFromPage() {
			const match = window.location.pathname.match(/\/app\/(\d+)/);
			return match ? match[1] : null;
		}

		// Extract app ID from a link href or data attribute
		extractAppIdFromLink(linkElement) {
			// First try data-ds-appid attribute
			const dataAppId = linkElement.getAttribute('data-ds-appid');
			if (dataAppId) {
				return dataAppId;
			}

			// Then try to extract from href
			const href = linkElement.getAttribute('href');
			if (href) {
				const match = href.match(/\/app\/(\d+)/);
				if (match) {
					return match[1];
				}
			}

			return null;
		}

		// Create compact GFN link for game blocks
		createGFNButton(appId, gameName = '', game = null) {
			const button = document.createElement('span');
			button.className = 'gfn-link-button';
			let gfnUrl = 'https://play.geforcenow.com/';
			if (game) {
				gfnUrl += `games?game-id=${game.id}`;
			}
			button.setAttribute('role', 'link');
			button.tabIndex = 0;
			button.title = `Play ${gameName || 'this game'} on GeForce NOW`;

			//button.textContent = '';
			button.dataset.gfnAppId = String(appId);

			// Open GFN without triggering the surrounding Steam game link
			const openGFN = (event) => {
				event.preventDefault();
				event.stopPropagation();
				window.open(gfnUrl, '_blank', 'noopener,noreferrer');
				debugLog(`GFN Checker: User clicked to play "${gameName}" (App ID: ${appId}) on GeForce NOW`);
			};

			button.addEventListener('click', openGFN);
			button.addEventListener('keydown', (event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					openGFN(event);
				}
			});

			return button;
		}

		// Create and show the GFN label for individual game pages
		showGFNLabel(gameName = '', game = null) {
			// Remove existing label if any
			const existingLabel = document.querySelector('.gfn-available-label');
			if (existingLabel) {
				existingLabel.remove();
			}

			// Create the clickable label
			const label = document.createElement('a');
			label.className = 'gfn-available-label';
			label.href = 'https://play.geforcenow.com/';
			if (game) {
				label.href += `games?game-id=${game.id}`;
			}
			label.target = '_blank';
			label.rel = 'noopener noreferrer';
			label.title = `Play ${gameName || 'this game'} on GeForce NOW`;

			label.textContent = '⬒ Play on GeforceNOW';

			// Add click tracking
			label.addEventListener('click', () => {
				debugLog(`GFN Checker: User clicked to play "${gameName}" on GeForce NOW`);
			});

			// Find the best place to insert the label
			const insertionPoints = [
				'.apphub_AppName',
				'.page_title_area',
				'.game_area_purchase_game',
				'.rightcol'
			];

			for (const selector of insertionPoints) {
				const targetElement = document.querySelector(selector);
				if (targetElement) {
					targetElement.parentNode.insertBefore(label, targetElement.nextSibling);
					break;
				}
			}
		}

		// Check if we're on an individual game page
		isGamePage() {
			return window.location.pathname.includes('/app/');
		}

		// Process individual game page
		async checkGamePage() {
			const gameName = this.getGameNameFromPage();
			const appId = this.getAppIdFromPage();

			if (!gameName && !appId) {
				debugLog('GFN Checker: Could not extract game name or app ID from page');
				return;
			}

			debugLog(`GFN Checker: Checking individual game page for "${gameName}" (App ID: ${appId})`);

			try {
				const response = await this.checkGFNAvailability(gameName, appId, window.location.href);

				if (response?.error) {
					debugError('GFN Checker: Could not check game availability:', response.error);
					return;
				}

				if (response?.available) {
					debugLog('GFN Checker: Game is available on GeForce Now!');
					this.showGFNLabel(gameName, response.data);
				} else {
					debugLog('GFN Checker: Game is not available on GeForce Now');
				}
			} catch (error) {
				debugError('GFN Checker: Error checking game page availability:', error);
			}
		}

		// Find and process all game links on the page
		async processGameLinks() {
			// Find all links that point to Steam game pages
			const gameLinkSelector = 'a[href*="store.steampowered.com/app/"], a[data-ds-appid]';
			const gameLinks = document.querySelectorAll(gameLinkSelector);
			
			debugLog(`GFN Checker: Found ${gameLinks.length} potential game links`);

			for (const link of gameLinks) {

				if (
					link.classList.contains('screenshot') ||
					link.classList.contains('gutter_item')
				) {
					continue;
				}

				// Skip if there are both no attribute and no image inside
				if ( !link.hasAttribute('data-ds-appid') ) {
					if (
						!link.querySelector('img') &&
						!link.querySelector('.screenshot')
					) {
						debugLog(link);
						debugLog(`GFN Checker: Skipping link "${link.href}" because it doesn't look like a Steam game link`);
						continue;
					}
				}

				const popover = link.closest('div[popover]');
				if (popover) {
					const primaryLink = Array.from(popover.querySelectorAll(gameLinkSelector))
						.find(candidate => candidate.querySelector('img'));

					if (primaryLink !== link) {
						continue;
					}
				}

				const appId = this.extractAppIdFromLink(link);
				
				if (!appId) {
					debugLog(`GFN Checker: Skipping link "${link.href}" because it doesn't contain a valid App ID`);
					continue;
				}

				// Skip if we've already processed this link
				if ( link.classList.contains('gfn-link-processed') ) {
					continue;
				}

				// Check if this game is available on GFN
				try {
					const response = await this.checkGFNAvailability(null, appId, link.href);

					if (!response || response.error) {
						debugWarn(`GFN Checker: Availability check failed for App ID ${appId}`, response?.error);
						return;
					}
					
					if (response.available) {
						debugLog(`GFN Checker: Game link ${link.href} available on GFN - App ID: ${appId}`);
						this.addGFNButtonToLink(link, appId, response.data.title, response.data);
					}

					link.classList.add('gfn-link-processed');
				} catch (error) {
					debugError(`GFN Checker: Error checking link availability for App ID ${appId}:`, error);
				}
			}
		}

		// Add GFN button to a game link
		addGFNButtonToLink(linkElement, appId, gameName, game) {
			const existingButton = Array.from(linkElement.querySelectorAll('.gfn-link-button'))
				.find(button => button.dataset.gfnAppId === String(appId));
			if (existingButton) {
				debugLog(`GFN Checker: Skipping link "${linkElement.href}" because it already has a GFN button`);
				return;
			}

			if (window.getComputedStyle(linkElement).position === 'static') {
				linkElement.style.position = 'relative';
			}

			const button = this.createGFNButton(appId, gameName, game);
			debugLog(`GFN Checker: Adding GFN button beside link "${linkElement.href}"`);
			linkElement.appendChild(button);
			linkElement.classList.add('gfn-link-processed');
		}

		// Send message to background script to check GFN availability
		async checkGFNAvailability(gameName, appId, url) {
			return new Promise((resolve, reject) => {
				chrome.runtime.sendMessage({
					action: 'checkGFNAvailability',
					gameName: gameName,
					appId: appId,
					url: url
				}, (response) => {
					if (chrome.runtime.lastError) {
						reject(new Error(chrome.runtime.lastError.message));
					} else {
						resolve(response);
					}
				});
			});
		}

		// Initialize the checker
		async init() {
			debugLog('GFN Checker: Initializing...');

			// Check if we're on an individual game page
			if (this.isGamePage()) {
				await this.checkGamePage();
			}

			// Always check for game links on any Steam store page
			await this.processGameLinks();

			// Set up observer for dynamic content
			this.setupObserver();
		}

		// Set up mutation observer for dynamic content
		setupObserver() {
			this.observer = new MutationObserver((mutations) => {
				const gameLinkSelector = 'a[href*="store.steampowered.com/app/"], a[data-ds-appid]';
				let shouldRecheck = false;

				mutations.forEach((mutation) => {
					// debugLog('GFN Checker: Mutation detected', mutation);
					// Check if new nodes were added
					if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
						// Check if any added nodes contain game links
						for (const node of mutation.addedNodes) {
							if (node.nodeType === Node.ELEMENT_NODE) {
								const addsGameLink = node.matches(gameLinkSelector) || node.querySelector(gameLinkSelector);
								const completesGameLink = node.closest(gameLinkSelector) &&
									(node.matches('img') || node.querySelector('img'));

								if (addsGameLink || completesGameLink) {
									shouldRecheck = true;
									break;
								}
							}
						}
					}
				});

				if (shouldRecheck) {
					debugLog('GFN Checker: New content detected, rechecking game links...');
					this.processGameLinks();
					//setTimeout(() => { this.processGameLinks(); }, 1000);
				}
			});

			// Start observing
			this.observer.observe(document.body, {
				childList: true,
				subtree: true
			});
		}

		// Clean up
		destroy() {
			if (this.observer) {
				this.observer.disconnect();
			}
		}
	}

	function waitForElement(selector, timeout = 10000) {
		return new Promise((resolve, reject) => {
			const interval = 100;
			let elapsed = 0;

			const check = () => {
				const el = document.querySelector(selector);
				if (el) {
					resolve(el);
				} else if (elapsed >= timeout) {
					reject(new Error(`Element ${selector} not found within ${timeout}ms`));
				} else {
					elapsed += interval;
					setTimeout(check, interval);
				}
			};

			check();
		});
	}

	// Initialize the checker when the page is ready
	const checker = new SteamGFNChecker();

	// if (document.readyState === 'loading') {
	// 	document.addEventListener('DOMContentLoaded', () => checker.init());
	// } else {
	// 	checker.init();
	// }

	window.addEventListener('load', () => {
		if ( document.location.href.includes( 'store.steampowered.com/cart' ) ) {
			return;
		}
		if ( document.location.href.includes( 'store.steampowered.com' ) ) {
			checker.init();
		}
	});

	// waitForElement('#app-root-or-other-key-element')
	// 	.then(() => checker.init())
	// 	.catch(debugWarn);

	// Clean up on page unload
	window.addEventListener('beforeunload', () => checker.destroy());
})();
