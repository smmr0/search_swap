get_search_engines = ->
	(await browser.search.get()).sort (search_engine_1, search_engine_2) ->
		if search_engine_1.name > search_engine_2.name
			1
		else if search_engine_1.name < search_engine_2.name
			-1
		else
			0

get_search_engine = (tab) ->
	(await get_search_engines()).find (search_engine) ->
		tab.title.indexOf(search_engine.name) != -1

toggle_page_action = (tab) ->
	search_engine = await get_search_engine(tab)
	if search_engine?
		browser.pageAction.show(tab.id)
	else
		browser.pageAction.hide(tab.id)

browser.tabs.onUpdated.addListener (tab_id) ->
	toggle_page_action(
		await browser.tabs.get(tab_id)
	)
do ->
	for tab in await browser.tabs.query({})
		toggle_page_action(tab)

browser.pageAction.onClicked.addListener (tab) ->
	search_engines = await get_search_engines()

	current_search_engine = await get_search_engine(tab)
	current_search_engine_index =
		(search_engines.map (se) -> se.name).indexOf(
			current_search_engine.name
		)
	next_search_engine = search_engines[current_search_engine_index + 1]
	next_search_engine ?= search_engines[0]

	query =
		decodeURIComponent(
			tab.url.match(
				/[?&]q=([^?&]+)/
			)[1]
		).replace(/\+/g, ' ')

	await browser.search.search(
		engine: next_search_engine.name
		tabId: tab.id
		query: query
	)
