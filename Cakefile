{ spawnSync } = require 'child_process'
coffee = require 'coffeescript'
coffeelint = require '@coffeelint/cli'
cson = require 'cson'
fs = require 'fs-extra'
web_ext = require 'web-ext'

task 'lint', ->
	fs.writeFileSync(
		'coffeelint.json'
		cson.createJSONString(
			cson.parseCSONFile('coffeelint.cson')
		)
	)

	linters =
		coffeelint:
			spawnSync(
				'coffeelint'
				[
					'-f', 'coffeelint.json'
					'Cakefile'
					'src/'
				]
				stdio: 'inherit'
			).status == 0

	fs.removeSync('coffeelint.json')

	process.exit(
		if (success for _key, success of linters).every((x) -> x) then 0 else 1
	)

task 'clean', ->
	fs.removeSync('build')
	fs.removeSync('dist')

task 'build', ->
	find_files = (pattern) ->
		spawnSync(
			'find'
			['build/', '-name', pattern]
		).stdout.toString().split('\n').filter (file) -> /\S/.test(file)

	fs.removeSync('build')

	fs.copySync('src', 'build')

	for file in find_files('*.coffee')
		fs.writeFileSync(
			file.replace(/\.coffee$/, '.js')
			coffee._compileFile(file)
		)
		fs.removeSync(file)

	for file in find_files('*.cson')
		fs.writeFileSync(
			file.replace(/\.cson$/, '.json')
			cson.createJSONString(
				cson.parseCSONFile(file)
			)
		)
		fs.removeSync(file)

	fs.copySync(
		'node_modules/webextension-polyfill/dist/browser-polyfill.js'
		'build/js/lib/webextension-polyfill/browser-polyfill.js'
	)

task 'package', ->
	invoke 'build'

	await web_ext.cmd.build(
		sourceDir: 'build'
		artifactsDir: 'dist'
		overwriteDest: true
	)
