async function getSearchEngines() {
	return (await browser.search.get()).sort((searchEngine1, searchEngine2) => {
		if (searchEngine1.name > searchEngine2.name) {
			return 1;
		} else if (searchEngine1.name < searchEngine2.name) {
			return -1;
		} else {
			return 0;
		}
	});
}

async function getSearchEngine(tab) {
	return (await getSearchEngines()).find((searchEngine) => {
		return tab.title.indexOf(searchEngine.name) !== -1;
	});
}

async function togglePageAction(tab) {
	const searchEngine = await getSearchEngine(tab);
	if (searchEngine !== undefined) {
		return browser.pageAction.show(tab.id);
	} else {
		return browser.pageAction.hide(tab.id);
	}
}

browser.tabs.onUpdated.addListener(
	async (tabId) => {
		togglePageAction(await browser.tabs.get(tabId));
	},
	{
		properties: ["url"]
	}
);
(async function () {
	for (tab of await browser.tabs.query({})) {
		togglePageAction(tab);
	}
})();

browser.pageAction.onClicked.addListener(async (tab) => {
	const searchEngines = await getSearchEngines();

	const currentSearchEngine = await getSearchEngine(tab);
	const currentSearchEngineIndex =
		(searchEngines.map((se) => {
			return se.name;
		})).indexOf(currentSearchEngine.name);
	let nextSearchEngine = searchEngines[currentSearchEngineIndex + 1];
	if (nextSearchEngine === undefined) {
		nextSearchEngine = searchEngines[0];
	}

	const query =
		decodeURIComponent(
			tab.url.match(
				/[?&]q=([^?&]+)/
			)[1]
		).replace(/\+/g, ' ');

	return browser.search.search({
		engine: nextSearchEngine.name,
		tabId: tab.id,
		query: query
	});
});
