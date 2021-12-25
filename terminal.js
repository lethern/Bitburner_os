import { DOM_CONSTANTS } from '/os/constants.js'
import { Utils } from '/os/utils.js'

export class Terminal {
	constructor() {
		this.doc = globalThis['document'];
	}
	async inputToTerminal(command) {
		let terminal = this.doc.getElementById(DOM_CONSTANTS.terminalInputId)

		if (!terminal) {
			console.log('no terminal');
			const terminalButton = this.doc.querySelector(DOM_CONSTANTS.terminalBtnSelector)

			if (terminalButton) {
				console.log('terminalButton');
				terminalButton.click()
				return Utils.sleep(300).then(Terminal.executeTerminalCommand.bind(this, terminal, command));
			}
		}

		return Terminal.executeTerminalCommand(terminal, command);
	}

	/** @param {HTMLElement} terminal  @param {string} command */
	static executeTerminalCommand(terminal, command) {
		terminal = terminal || globalThis['document'].getElementById(DOM_CONSTANTS.terminalInputId)

		console.log('terminal ', !!terminal, command);

		if (terminal) {
			terminal.value = command
			const handler = Object.keys(terminal)[1];
			terminal[handler].onChange({ target: terminal });
			terminal[handler].onKeyDown({ keyCode: 13, preventDefault: () => null })

			return true
		}

		return false
	}
}
