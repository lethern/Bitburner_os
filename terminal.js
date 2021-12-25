import { DOM_CONSTANTS } from '/os/constants.js'
import { Utils } from '/os/utils.js'

export class Terminal {
	constructor(os){
		this.os = os;
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
			const terminalButton = doc.querySelector(DOM_CONSTANTS.terminalBtnSelector)

			if (terminalButton) {
				terminalButton.click()
				return Utils.sleep(300).then(executeTerminalCommand);
				//return new Promise((resolve) => setTimeout(() => resolve(executeTerminalCommand()), 300))
				// return delay(2000).then(executeTerminalCommand)
			}
		}

		return executeTerminalCommand()
	}


}
