import { OS } from '/os/os.js'

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('sleep')
	try{
		var os = new OS(ns);
		await ns.sleep(10);
		await os.run();
	}catch(e){
		if(os){
			os.on_exit();
		}
		throw e;
	}
}
