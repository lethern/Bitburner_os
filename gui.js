import { DOM_CONSTANTS, GENERAL_CSS } from '/os/constants.js'
import { OS_EVENT } from '/os/event_listener.js'
import { Logger } from '/os/logger.js'

export class GUI {
	/** @param {import('/os/os.js').OS} os */
	constructor(os){
		this.#os = os;
		this.#log = new Logger(this, os.logRenderer);
		this.#doc = globalThis['document'];
		this.#buttons = [];
		this.#styles = [];
		this.#cssUsedMap = {};
		this.#os.listen(OS_EVENT.INIT, this.#init.bind(this));
		this.#os.listen(OS_EVENT.ON_EXIT, this.#on_exit.bind(this));
	}
	
	addMenuButton(params) {
		let { btnLabel, btnIconPath, btnIconViewBox, btnId, callback } = params;
		
		const siblingButton = Array.from(this.#doc.querySelectorAll(DOM_CONSTANTS.siblingBtnSelector))
			.find(({ textContent }) => textContent === DOM_CONSTANTS.siblingButtonLabel)
			
		if (!siblingButton) {
			this.#log.debug("GUI.injectButton: can't find siblingButton");
			return;
		}
		
		let newButtonMarkup = siblingButton.outerHTML.replace(DOM_CONSTANTS.siblingButtonLabel, btnLabel)
		
		let path_from = newButtonMarkup.indexOf('<path')
		let path_to = newButtonMarkup.indexOf('</path>')
		
		if(btnIconPath && btnIconPath.length){
			newButtonMarkup = newButtonMarkup.substr(0, path_from) + btnIconPath + newButtonMarkup.substr(path_to);
		}
		if(btnIconViewBox && btnIconViewBox.length){
			newButtonMarkup = newButtonMarkup.replace('viewBox="0 0 24 24"', btnIconViewBox)
		}
		
		siblingButton.insertAdjacentHTML('afterend', newButtonMarkup)
		
		let btn = siblingButton.nextElementSibling
		btn.id = btnId
		
		btn._gui_listener = callback;
		btn.addEventListener('click', btn._gui_listener)
		
		this.#buttons.push( { btn } );
	}

	injectCSS(css_string) {
		if (this.#cssUsedMap[css_string]) return;

		const stylesheet = this.#doc.createElement('style')
		stylesheet.innerHTML = css_string

		this.#styles.push(stylesheet);
		this.#doc.head.insertAdjacentElement('beforeend', stylesheet)
		this.#cssUsedMap[css_string] = 1;
	}

	// private fields, methods

	#os
	#doc
	#buttons
	#styles
	#log
	#cssUsedMap

	#init() {
		this.#injectStartBtn()
		this.#injectDefaultCSS()
	}

	#onStartBtnClick() {
		this.#doc.addEventListener('click', () => {
			// if clicked elment = menu, activate
			// else, hide
		});
	}

	#injectStartBtn() {
		return;
		/*
		// make sure that our text (that is wider than menu) is visible outside Menu div
		let menu = this.#doc.querySelectorAll('.MuiDrawer-paperAnchorLeft')
		if (!menu) {
			this.#log.warn('injectStartBtn');
			return;
		}
		//let { btnLabel, btnIconPath, btnIconViewBox, btnId, callback } = params;
		let btnLabel = "OS";
		let btnIconPath = "";
		let btnIconViewBox = "";
		let btnId = "";
		let callback = this.#onStartBtnClick.bind(this);

		const siblingButton = Array.from(this.#doc.querySelectorAll(DOM_CONSTANTS.siblingBtnSelector))
			.find(({ textContent }) => textContent === DOM_CONSTANTS.siblingButtonLabel)

		if (!siblingButton) {
			this.#log.warn("GUI.injectButton: can't find siblingButton");
			return;
		}

		let newButtonMarkup = siblingButton.outerHTML.replace(DOM_CONSTANTS.siblingButtonLabel, btnLabel)

		let path_from = newButtonMarkup.indexOf('<path')
		let path_to = newButtonMarkup.indexOf('</path>')

		if (btnIconPath && btnIconPath.length) {
			newButtonMarkup = newButtonMarkup.substr(0, path_from) + btnIconPath + newButtonMarkup.substr(path_to);
		}
		if (btnIconViewBox && btnIconViewBox.length) {
			newButtonMarkup = newButtonMarkup.replace('viewBox="0 0 24 24"', btnIconViewBox)
		}

		siblingButton.insertAdjacentHTML('afterend', newButtonMarkup)

		let btn = siblingButton.nextElementSibling
		btn.id = btnId

		btn._gui_listener = callback;
		btn.addEventListener('click', btn._gui_listener)

		this.#buttons.push({ btn });
		*/
	}

	#injectDefaultCSS() {
		this.injectCSS(GENERAL_CSS)
		
	}

	#on_exit() {
		this.#clearInjected();
	}

	#clearInjected() {
		this.#buttons.forEach(({ btn }) => {
			if (btn._gui_listener) {
				btn.removeEventListener('click', btn._gui_listener)
				btn._gui_listener = null
			}
			btn.remove()
		});
		this.#styles.forEach(elem => {
			elem.remove()
		});
	}
};

// class GUI_Injector {
// };
