import { DOM_CONSTANTS, INJECTED_CSS } from '/os/constants.js'
import { OS_EVENT } from '/os/event_listener.js'

export class GUI {
	constructor(os){
		this.os = os;
		this.doc = globalThis['document'];
		this.buttons = [];
		this.styles = [];
		this.os.listen(OS_EVENT.INIT, this.init.bind(this));
		this.os.listen(OS_EVENT.ON_EXIT, this.on_exit.bind(this));
	}
	init(){
		this.injectDefaultCSS()
	}
	
	injectButton(params) {
		let { btnLabel, btnIconPath, btnIconViewBox, btnId, callback } = params;
		
		const siblingButton = Array.from(this.doc.querySelectorAll(DOM_CONSTANTS.siblingBtnSelector))
			.find(({ textContent }) => textContent === DOM_CONSTANTS.siblingButtonLabel)
			
		if (!siblingButton){
			this.os.debug.print("GUI.injectButton: can't find siblingButton");
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
		
		this.buttons.push( { btn } );
	}

	injectDefaultCSS () {
		const doc = this.doc
		const stylesheetId = 'window-styles'

		const stylesheet = doc.createElement('style')
		stylesheet.id = stylesheetId

		stylesheet.innerHTML = INJECTED_CSS

		this.styles.push(stylesheet);
		doc.head.insertAdjacentElement('beforeend', stylesheet)
	}
	on_exit(){
		this.clearInjected();
	}
	clearInjected(){
		this.buttons.forEach( ({ btn }) => {
			if(btn._gui_listener){
				btn.removeEventListener('click', btn._gui_listener)
				btn._gui_listener = null
			}
			btn.remove()
		});
		this.styles.forEach( elem => {
			elem.remove()
		});
	}

};

class GUI_Injector {
	
};
