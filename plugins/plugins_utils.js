import { API_Adapter } from '/os/plugins/api_adapter.js'

/** @param {import('/os/os.js').OS} os @param {string} filepath
  @returns {Promise<{result?: any, error?: any, time_diff?: number}>} */
export async function runPlugin(os, filepath) {
	
	try {
		let js = await os.getNS(ns => {
			return ns.read(filepath)
		})

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
		return await mainPlugin(API)
	}).bind({})()
}`
		let result = await eval(wrap_js)

		let end_time = performance.now();
		return { result, time_diff: (end_time - start_time) };
	} catch (e) {
		return { error: e.message }
	}
}