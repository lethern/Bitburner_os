import { DOM_CONSTANTS, GENERAL_CSS } from '/os/constants.js'
import { OS_EVENT } from '/os/event_listener.js'
import { Logger } from '/os/logger.js'
import { WindowWidget } from '/os/window_widget.js'

export class GUI {
	/** @param {import('/os/os.js').OS} os */
	constructor(os){
		this.#os = os;
		this.#log = new Logger(this, os.logRenderer);
		this.#doc = globalThis['document'];
		this.#buttons = [];
		this.#styles = [];
		this.#os.listen(OS_EVENT.INIT, () => this.#init());
		this.#os.listen(OS_EVENT.ON_EXIT, () => this.#on_exit());
	}

	createButton(params) {
		let { btnOptions, btnLabel, callback } = params;

		let btn = this.#doc.createElement('button');
		btn.type = 'button';
		btn.style['color'] = 'rgb(0, 204, 0)';
		btn.style['background-color'] = 'rgb(51, 51, 51)';
		btn.style['border'] = '1px solid rgb(34, 34, 34)';
		btn.textContent = btnLabel;

		for (let it in btnOptions) {
			btn.style[it] = btnOptions[it];
		}

		btn._gui_listener = callback;
		btn.addEventListener('click', btn._gui_listener)

		this.#buttons.push({ btn });
		return btn;
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

	injectCSS(css_string, css_id) {
		if (!css_id) throw "injectCSS: css_id missing";

		let stylesheet = this.#doc.getElementById(css_id);
		if (!stylesheet) {
			stylesheet = this.#doc.createElement('style')
			stylesheet.innerHTML = css_string
			stylesheet.id = css_id;
		}

		this.#styles.push(stylesheet);
		this.#doc.head.insertAdjacentElement('beforeend', stylesheet)
	}

	createAboutWindow(data) {
		let aboutWindow = new WindowWidget(this, this.#os);
		aboutWindow.init();
		aboutWindow.getContentDiv().innerHTML =
			"<div class='window-about'><table><tbody><tr>" +
			Object.entries(
				data).map(([k, v]) => {
					if (v.startsWith("https")) v = `<a target='_blank' href=${v}>${v}</a>`;
					return `<td><b>${k}</b></td><td>${v}</td>`
				}).join('</tr><tr>')
			+ "</tr></tbody></table></div>";
		aboutWindow.setTitle('About')
		return aboutWindow;
	}

	// private fields, methods

	#os
	#doc
	#buttons
	#styles
	#log

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
		this.injectCSS(GENERAL_CSS, 'GENERAL_CSS')
		this.injectCSS(GUI_CSS, 'GUI_CSS');
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

const GUI_CSS = `
.window-about table{
	border: none;
	user-select: text;
}
`
