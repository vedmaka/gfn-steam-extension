const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');

const source = readFileSync(new URL('../src/background.js', `file://${__filename}`), 'utf8');
const game = { title: 'Cached game', appId: '570' };

// Run the real worker with in-memory Chrome storage and a controlled NVIDIA response
async function worker() {
	const storage = { gfnGames: [game], lastFetch: Date.now(), otherSetting: true };
	let handler;
	let fetchCount = 0;
	const icons = new Map();
	const titles = new Map();
	const tabListeners = {};
	const context = vm.createContext({
		console, setTimeout, clearTimeout, AbortController,
		chrome: {
			action: {
				setIcon: async ({ tabId, path }) => icons.set(tabId, path),
				setTitle: async ({ tabId, title }) => titles.set(tabId, title)
			},
			tabs: {
				query: async () => [{ id: 1, url: 'https://store.steampowered.com/app/570/' }],
				get: async id => ({ id, url: 'https://example.com/' }),
				onUpdated: { addListener: listener => { tabListeners.updated = listener; } },
				onActivated: { addListener: listener => { tabListeners.activated = listener; } }
			},
			storage: { local: {
				get: async () => ({ ...storage }),
				set: async values => Object.assign(storage, values),
				remove: async keys => keys.forEach(key => delete storage[key])
			} },
			runtime: { onMessage: { addListener: listener => { handler = listener; } } }
		},
		fetch: async () => {
			fetchCount++;
			return {
				ok: true,
				json: async () => ({ data: { apps: {
					items: [{ title: 'Fresh game', variants: [{ appStore: 'STEAM', storeId: '730' }] }],
					pageInfo: { hasNextPage: false }
				} } })
			};
		}
	});
	vm.runInContext(source, context);
	const checker = vm.runInContext('gfnChecker', context);
	await checker.ensureGamesLoaded();
	return {
		checker, storage, context, icons, titles, tabListeners,
		fetchCount: () => fetchCount,
		message: request => new Promise((resolve, reject) => {
			if (handler(request, {}, resolve) !== true) reject(new Error('Message channel was not kept open'));
		})
	};
}

test('cache status reports stored timestamp and game count without fetching', async () => {
	const app = await worker();
	const status = await app.message({ action: 'getCacheStatus' });
	assert.equal(status.lastFetch, app.storage.lastFetch);
	assert.equal(status.gameCount, 1);
	assert.equal(status.expired, false);
	app.checker.lastFetch = Date.now() - 86400001;
	assert.equal((await app.message({ action: 'getCacheStatus' })).expired, true);
	assert.equal(app.fetchCount(), 0);
});

test('clear removes disk and memory cache, preserves settings, and next check fetches fresh games', async () => {
	const app = await worker();
	assert.equal((await app.message({ action: 'clearCache' })).success, true);
	assert.equal(app.storage.gfnGames, undefined);
	assert.equal(app.storage.lastFetch, undefined);
	assert.equal(app.storage.otherSetting, true);
	assert.equal(app.checker.isGameAvailable('', '570', '').available, false);
	const status = await app.message({ action: 'getCacheStatus' });
	assert.equal(status.lastFetch, 0);
	assert.equal(status.gameCount, 0);
	assert.equal(app.fetchCount(), 0);
	const result = await app.message({ action: 'checkGFNAvailability', appId: '730' });
	assert.equal(result.available, true);
	assert.equal(app.fetchCount(), 1);
});

test('clear waits for an active download so it cannot repopulate storage after clearing', async () => {
	const app = await worker();
	let finishFetch;
	app.context.fetch = () => new Promise(resolve => { finishFetch = resolve; });
	app.checker.lastFetch = 0;
	const loading = app.checker.ensureGamesLoaded();
	await new Promise(resolve => setImmediate(resolve));
	const clearing = app.message({ action: 'clearCache' });
	finishFetch({ ok: true, json: async () => ({ data: { apps: {
		items: [{ title: 'Downloaded game', variants: [{ appStore: 'STEAM', storeId: '730' }] }],
		pageInfo: { hasNextPage: false }
	} } }) });
	await loading;
	assert.equal((await clearing).success, true);
	assert.equal(app.storage.gfnGames, undefined);
	assert.equal(app.checker.isGameAvailable('', '730', '').available, false);
});

test('failed storage removal returns an error and keeps the usable cache', async () => {
	const app = await worker();
	app.context.chrome.storage.local.remove = async () => { throw new Error('Storage unavailable'); };
	const result = await app.message({ action: 'clearCache' });
	assert.equal(result.error, 'Storage unavailable');
	assert.equal(app.checker.isGameAvailable('', '570', '').available, true);
});

test('toolbar uses a green icon for existing Steam tabs and resets it after navigation', async () => {
	const app = await worker();
	await new Promise(resolve => setImmediate(resolve));
	assert.equal(app.icons.get(1)[16], 'images/icon-active-16.png');
	app.tabListeners.updated(1, { status: 'loading' }, { id: 1, url: 'https://example.com/' });
	await new Promise(resolve => setImmediate(resolve));
	assert.equal(app.icons.get(1)[16], 'images/icon-idle-16.png');
	assert.match(app.titles.get(1), /Open a Steam store page/);
});

test('toolbar handles Steam listings, tab switches, restricted URLs, and lookalike hosts', async () => {
	const app = await worker();
	for (const url of ['https://store.steampowered.com/search/', 'https://store.steampowered.com/']) {
		app.tabListeners.updated(2, { status: 'complete' }, { id: 2, url });
		await new Promise(resolve => setImmediate(resolve));
		assert.equal(app.icons.get(2)[32], 'images/icon-active-32.png');
	}
	for (const url of [undefined, 'chrome://extensions/', 'https://store.steampowered.com.evil.test/', 'http://store.steampowered.com/']) {
		app.tabListeners.updated(2, { status: 'loading' }, { id: 2, url });
		await new Promise(resolve => setImmediate(resolve));
		assert.equal(app.icons.get(2)[32], 'images/icon-idle-32.png');
	}
	app.tabListeners.activated({ tabId: 3 });
	await new Promise(resolve => setImmediate(resolve));
	assert.equal(app.icons.get(3)[16], 'images/icon-idle-16.png');
});
