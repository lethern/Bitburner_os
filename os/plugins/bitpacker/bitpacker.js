
import { listBitpacks } from '/os/plugins/bitpacker/bp_lib.js'

/*
async function mainPlugin(api) {
	let os = api.os;
	let classes = api.classes;

	let windowWidget = classes.newWindowWidget(this);
	windowWidget.init();
	windowWidget.getContentDiv().classList.add('greenScrollbar')
	windowWidget.getContentDiv().classList.add('grayBackground')
	windowWidget.setTitle('Bitpacker')
	windowWidget.show();

	// script logic
	await os.getNS(ns => {

		windowWidget.getContentDiv().textContent = data.join('\n')
		
	});
}
*/

async function mainPlugin(api) {
	let bitpacker = new BitpackerPlugin(api);

	bitpacker.init()

	bitpacker.run();
}

class BitpackerPlugin {
	/** @param {import('/os/plugins/api_adapter').API_Object} api */
	constructor(api) {
		this.#os = api.os;
		this.#classes = api.classes;
		this.#utils = api.utils

		this.#windowWidget = this.#classes.newWindowWidget(this);
		//this.#windowWidget = new WindowWidget(this, this.#os);
		//this.#windowWidget.listen(WindowWidget_EVENT.SHOW, () => this.#onShow());
	}

	init() {
		this.#os.getGUI().injectCSS(bitpacker_css);
		this.#createWidget()
	}

	async run() {
		await this.#render()
	}

	#os
	#classes
	#utils

	/** @type {import('/os/window_widget.js').WindowWidget} */
	#windowWidget
	#contentDiv
	#attacksMonitor
	#sort

	#createWidget() {
		let windowWidget = this.#windowWidget;
		windowWidget.init();
		windowWidget.getContentDiv().classList.add('whiteScrollbar')
		windowWidget.getContentDiv().classList.add('grayBackground')
		//windowWidget.getContentDiv().classList.add('process-list__container')
		windowWidget.setTitle('Bitpacker')
/*		windowWidget.getContentDiv().innerHTML = `
		<div class="process-list">
			<div class="process-list__head">
				<button class="process-cell" data-sort="target">Target</button>
				<button class="process-cell" data-sort="threads">Threads</button>
			</div>
			<div class="process-list__body"></div>
		</div>
	`
*/
		windowWidget.show();

		this.#contentDiv = windowWidget.getContentDiv()
	}

	async #render() {
		let div = this.#contentDiv;

		try {
			let data = await listBitpacks();
			this.#renderBitpacks(data);
		} catch (e) {
			this.#renderError(e);
		}
	}

	#renderBitpacks(data){

	}

	#renderError(e) {
		this.#contentDiv.innerHTML = `
<div>There was an error: ${e.message}</div>`;
	}
}


const bitpacker_css = `
`;
