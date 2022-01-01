let baseUrl = 'https://raw.githubusercontent.com/lethern/Bitburner_os/main/';
let json_filename = 'install_files_json.txt';

/** @param {NS} ns */
export async function main(ns) {
	let { welcomeLabel, filesToDownload } = await fetchConfig(ns)
	
	ns.tprint(welcomeLabel)

	let hostname = ns.getHostname()

	if (hostname !== 'home') {
		throw 'Run the script from home'
	}

	let count = 0;
	for (let filename of filesToDownload) {
		const path = baseUrl + filename
		const save_filename = '/os/'+filename
		
		try{
			await ns.scriptKill(save_filename, 'home')
			await ns.rm(save_filename)
			await ns.sleep(20)
			await ns.wget(path + '?ts=' + new Date().getTime(), save_filename)
			
			if(++count % 5 ==0){
				ns.tprint(`Installed [${(count+'').padStart(2)}/${filesToDownload.length}]`);
			}
		}catch(e){
			ns.tprint(`ERROR (tried to download  ${path})`)
			throw e;
		}
	}

	terminalCommand('unalias bootOS')
	terminalCommand('alias -g bootOS="run /os/main.js"')

	ns.tprint("Install complete! To start, type: bootOS")
}

async function fetchConfig(ns) {
	try {
		let local_filename = '/os/' + json_filename;
		await ns.rm(local_filename)
		await ns.wget(baseUrl + json_filename + '?ts=' + new Date().getTime(), local_filename)
		return JSON.parse(ns.read(local_filename));
	}catch(e){
		ns.tprint(`ERROR: Downloading and reading config file failed ${json_filename}`);
		throw e;
	}
}

function terminalCommand(message){
	const docs = globalThis['document']
	const terminalInput = /** @type {HTMLInputElement} */ (docs.getElementById("terminal-input"));
	terminalInput.value=message;
	const handler = Object.keys(terminalInput)[1];
	terminalInput[handler].onChange({target:terminalInput});
	terminalInput[handler].onKeyDown({keyCode:13,preventDefault:()=>null});
}