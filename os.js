import { DOM_CONSTANTS } from '/os/constants.js'
import { Debug } from '/os/debug.js'
import { EventListener, OS_EVENT } from '/os/event_listener.js'
import { FilesExplorer } from '/os/files_explorer.js'
import { GUI } from '/os/gui.js'
import { Utils } from '/os/utils.js'

export class OS extends EventListener{
	constructor(ns){
		super();
		
		// private field
		let _hasAccessToNS = false;
		
		this.internal_NS = function(){
			if(_hasAccessToNS)
				return ns;
			else{
				return null;
			}
		};
		this.run = async function(){
			this.fire(OS_EVENT.INIT);
			
			while(this.doLoop){
				_hasAccessToNS = true;
				
				await this.runNSQueue();
				
				_hasAccessToNS = false;
				await ns.sleep(50);
			}
		}

		this.NSqueue = [];
		/** @type {Debug} */
		this.debug = new Debug();
		this.FilesExplorer = new FilesExplorer(this);
		this.gui = new GUI(this);
		
		this.doLoop = true;
	}		
	
	getNS(func){
		let def = new Utils.Deferred();
		this.NSqueue.push( { func, def })
		return def.promise;
	}
	
	getNS_noPromise(func){
		this.NSqueue.push( { func })
	}
	
	async runNSQueue(){
		let stopwatch = 0;
		let ns = this.internal_NS();
		while(this.NSqueue.length){
			let q = this.NSqueue;
			this.NSqueue = [];

			if(++stopwatch > 10){
				q.forEach( ({ def })  => { def && def.reject('stopwatch (there is too big recursion in getNS calls)'); })
				break;
			}

			q.forEach( ({ func, def })  => {
				let res = func(ns);
				if(res instanceof Promise)
					def && def.reject('Cannot use async callback with getNS');
				else
					def && def.resolve(res);
			});
		}
	}

	async inputToTerminal(command) {
		const doc = globalThis['document']
		let terminal = doc.getElementById(DOM_CONSTANTS.terminalInput)

		const executeTerminalCommand = () => {
			terminal = terminal || doc.getElementById(DOM_CONSTANTS.terminalInput)

			if (terminal) {
				terminal.value = command
				const handler = Object.keys(terminal)[1];
				terminal[handler].onChange({ target: terminal });
				terminal[handler].onKeyDown({ keyCode: 13, preventDefault: () => null })

				return true
			}

			return false
		}

		if (!terminal) {
			const terminalButton = doc.querySelector('.MuiList-root .MuiList-root .MuiButtonBase-root')

			if (terminalButton) {
				terminalButton.click()
				return new Promise((resolve) => setTimeout(() => resolve(executeTerminalCommand()), 300))
				// return delay(2000).then(executeTerminalCommand)
			}
		}

		return executeTerminalCommand()
	}
	
	on_exit(){
		this.debug.print("OS on_exit", Debug.DEBUG_LEVEL);
		this.doLoop = false;
		this.fire(OS_EVENT.ON_EXIT);
	}
}
