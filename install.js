// Credit: Waffle_Attack
const baseUrl = 'https://raw.githubusercontent.com/lethern/bitrunner_os/main/'
const filesToDownload = [
	'constants.js','debug.js', 'event_listener.js', 'files_explorer.js', 'gui.js', 
	'main.js', 'os.js','terminal.js', 'utils.js', 'servers_manager.js'
]

export async function main(ns) {
	ns.tprint('HackaOS :: Install')

	let hostname = ns.getHostname()

	if (hostname !== 'home') {
		throw new Exception('Run the script from home')
	}

	for (let i = 0; i < filesToDownload.length; i++) {
		const filename = filesToDownload[i]
		const path = baseUrl + filename
		const save_filename = '/os/'+filename
		await ns.scriptKill(save_filename, 'home')
		await ns.rm(save_filename)
		await ns.sleep(20)
		ns.tprint('Trying to download:   ' + path)
		await ns.wget(path + '?ts=' + new Date().getTime(), save_filename)
	}
	terminalCommand('unalias bootOS')
	terminalCommand('alias -g bootOS="run os/main.js"')
}

function terminalCommand(message){
	const docs = eval('document')
	const terminalInput = docs.getElementById("terminal-input");
	terminalInput.value=message;
	const handler = Object.keys(terminalInput)[1];
	terminalInput[handler].onChange({target:terminalInput});
	terminalInput[handler].onKeyDown({keyCode:13,preventDefault:()=>null});
}
