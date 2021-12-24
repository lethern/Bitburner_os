import { OS } from '/os/os.js'

/** @param {NS} ns **/
export async function main(ns) {
	try{
		var os = new OS(ns);
		await os.run();
	}catch(e){
		if(os){
			os.on_exit();
		}
		throw e;
	}
}