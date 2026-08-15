document.addEventListener('DOMContentLoaded', async () => {
	const statusDiv = document.getElementById('status');

	try {
		// Check if we're on a Steam page
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

		if (tab.url && tab.url.includes('store.steampowered.com/app/')) {
			statusDiv.className = 'status success';
			statusDiv.innerHTML = '<span class="status-icon">✅</span><span>Active on Steam store page</span>';
		} else {
			statusDiv.className = 'status';
			statusDiv.innerHTML = '<span class="status-icon">ℹ️</span><span>Navigate to a Steam game page to use</span>';
		}
	} catch (error) {
		statusDiv.className = 'status error';
		statusDiv.innerHTML = '<span class="status-icon">❌</span><span>Error checking page status</span>';
	}
});