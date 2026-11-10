// Show a readable age while the full download time remains available on hover
function formatCacheAge(lastFetch) {
	const minutes = Math.floor(Math.max(0, Date.now() - lastFetch) / 60000);
	if (minutes < 1) return 'Updated less than a minute ago';
	if (minutes < 60) return `Updated ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `Updated ${hours} hour${hours === 1 ? '' : 's'} ago`;
	const days = Math.floor(hours / 24);
	return `Updated ${days} day${days === 1 ? '' : 's'} ago`;
}

function setupCacheControls() {
	const age = document.getElementById('cache-age');
	const details = document.getElementById('cache-details');
	const button = document.getElementById('clear-cache');
	const feedback = document.getElementById('cache-feedback');
	let clearing = false;
	let hasCache = false;

	async function updateCacheStatus() {
		try {
			const status = await chrome.runtime.sendMessage({ action: 'getCacheStatus' });
			if (!status || status.error) throw new Error(status?.error || 'No cache status');
			hasCache = status.gameCount > 0;
			age.textContent = hasCache ? formatCacheAge(status.lastFetch) : 'No database cached';
			age.title = hasCache ? new Date(status.lastFetch).toLocaleString() : '';
			details.textContent = hasCache
				? `${status.gameCount.toLocaleString()} ${status.gameCount === 1 ? 'game' : 'games'} · ${status.expired ? 'Older than 24 hours' : 'Up to date'}`
				: 'The next game check will download the database';
		} catch {
			hasCache = false;
			age.textContent = 'Could not read cache information';
			age.title = '';
			details.textContent = 'Close and reopen the popup to try again';
		}
		button.disabled = clearing || !hasCache;
	}

	button.addEventListener('click', async () => {
		clearing = true;
		button.disabled = true;
		button.textContent = 'Clearing…';
		feedback.textContent = '';
		try {
			const response = await chrome.runtime.sendMessage({ action: 'clearCache' });
			if (!response?.success) throw new Error(response?.error || 'Cache was not cleared');
			await updateCacheStatus();
			feedback.textContent = 'Cache cleared. Reload a Steam page to download a fresh database';
		} catch {
			feedback.textContent = 'Could not clear the cache. Try again';
		} finally {
			clearing = false;
			button.textContent = 'Clear database cache';
			button.disabled = !hasCache;
		}
	});

	// Update the open popup when a background download replaces the cache
	const onStorageChanged = (changes, area) => {
		if (area === 'local' && ('gfnGames' in changes || 'lastFetch' in changes) && !clearing) {
			feedback.textContent = '';
			void updateCacheStatus();
		}
	};
	chrome.storage.onChanged.addListener(onStorageChanged);
	const timer = setInterval(() => { if (!clearing) void updateCacheStatus(); }, 60000);
	window.addEventListener('unload', () => {
		clearInterval(timer);
		chrome.storage.onChanged.removeListener(onStorageChanged);
	}, { once: true });
	void updateCacheStatus();
}

document.addEventListener('DOMContentLoaded', async () => {
	setupCacheControls();
	const statusDiv = document.getElementById('status');

	try {
		// Check if we're on a Steam page
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

		if (/^https:\/\/store\.steampowered\.com\//.test(tab?.url || '')) {
			statusDiv.className = 'status success';
			statusDiv.innerHTML = '<span class="status-icon">✅</span><span>Active on Steam store page</span>';
		} else {
			statusDiv.className = 'status';
			statusDiv.innerHTML = '<span class="status-icon">ℹ️</span><span>Navigate to a Steam store page to use</span>';
		}
	} catch (error) {
		statusDiv.className = 'status error';
		statusDiv.innerHTML = '<span class="status-icon">❌</span><span>Error checking page status</span>';
	}
});
