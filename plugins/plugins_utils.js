import { API_Adapter } from '/os/plugins/api_adapter.js'

/** @param {import('/os/os.js').OS} os @param {string} filepath @param {string} imports_path
  @returns {Promise<{result?: any, error?: any, stack?: any, time_diff?: number}>} */
export async function runPlugin(os, filepath, imports_path) {
	console.log("runPlugin", imports_path, filepath)
	try {
		let sources = await os.getNS(ns => {
			let js = ns.read(filepath)
			
			let watchdog = 0;
			let filesToCheck = [js];
			let importsMap = {};

			let sources = [];

			while (true) {
				if (filesToCheck.length == 0) break;

				let file_js = filesToCheck.pop();

				// find import
				Array.from(file_js.matchAll(/(^|\n)(\s*)import(\s+)[^'"]*['"](?<file>.*)['"]/g))
				//Array.from(file_js.matchAll(/(^|\n)(\s*)import(\s+)(?<file>.*)\n/g))
					.map(res => (res.groups.file))
					.filter(path => path)
					//.map(path => path.replace(/['"]/g, ''))
					.forEach(path => {
						if (importsMap[path]) return;

						importsMap[path] = 1;

						// get file from path
						let res = path.match(/^[a-zA-Z0-9_\/\-]*(^|\/)(?<file>[a-zA-Z0-9_\.\-]+)$/)
						if (!res) return;
						let file = imports_path+'/'+res.groups.file;
						console.log("Reading ", file, path)
						let import_js = ns.read(file)
						filesToCheck.push(import_js);
					});

				// remove import
				sources.push(file_js.replace(/(^|\n)(\s*)import(\s+)[^'"]*['"](.*)['"]/g, '\n'));
				//sources.push(file_js.replace(/(^|\n)(\s*)import(\s+)[^'"](?<file>.*)\n/g, '\n'));

				if (watchdog++ > 50) throw "runPlugin - watchdog - too much recursive imports";
			}

			console.log("sources: ", sources.length, " importsMap: ", Object.keys(importsMap));
			return sources;
		})

		sources.reverse();
		let js = sources.join('\n');

		js = js.replace(/(^|\n)(\s*)export /g, '\n')

		let adapter = new API_Adapter(os, filepath);
		let API = adapter.getAPI_Object();
		let start_time = performance.now();

		let wrap_js = `
{
	const os = null;
	const runPlugin = null;
	(async function(){ 
		${js}
		;return await mainPlugin(API)
	}).bind({})()
}`
		let result = await eval(wrap_js)

		let end_time = performance.now();
		return { result, time_diff: (end_time - start_time) };
	} catch (e) {
		return { error: e.message, stack: e.stack }
	}
}