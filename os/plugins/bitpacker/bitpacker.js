
import { listBitpacks } from '/os/plugins/bitpacker/bp_lib.js'

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

	#createWidget() {
		let windowWidget = this.#windowWidget;
		windowWidget.init();
		windowWidget.getContentDiv().classList.add('whiteScrollbar')
		windowWidget.getContentDiv().classList.add('grayBackground')
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

	#renderBitpacks(data) {
		let list = BitpackerPlugin.createRow(this.#contentDiv, 'bitpacks-list')

		this.listData = {};

		data.forEach(row => {
			this.#printRow(row, list);
		});
	}

	
	#printRow(row, parent) {
		

		let columns = ["uniqueName", "shortDescription", "author"];

		let uniqueName = row.uniqueName;
		let data = {};
		if (uniqueName) {
			data = this.listData[uniqueName] = {};
		}

		let mainRow = data.mainRow = BitpackerPlugin.createRow(parent);
		let detailsRow = data.detailsRow = BitpackerPlugin.createRow(parent);
		detailsRow.style['display'] = 'none';

		// buttons
		BitpackerPlugin.createButton('add', () => this.addPack(uniqueName), mainRow);
		BitpackerPlugin.createButton('more', () => this.showMore(uniqueName), mainRow);

		// info
		let mainCells = [];
		let detailsCells = [];
		Object.entries(row).forEach(([key, val]) => {
			let indx = columns.findIndex(col => col == key);
			if (indx != -1) {
				mainCells[indx] = val;
			} else {
				detailsCells.push([key, val]);
			}
		});

		for (let i = 0; i < columns.length; ++i) {
			BitpackerPlugin.createCell(mainCells[i] || '', mainRow);
		}

		// details
		for (let detail of detailsCells) {
			BitpackerPlugin.createCell(detail[0] + ": " + detail[1], detailsRow);
		}
	}

	addPack(name) {
		let data = this.listData[name];
		if (!data) return;


	}

	showMore(name) {
		let data = this.listData[name];
		if (!data) return;

		if (this.lastShownDetails) {
			this.lastShownDetails.style['display'] = 'none';
		}

		if (!data.detailsRow) return;

		data.detailsRow.style['display'] = '';
		this.lastShownDetails = data.detailsRow;
	}

	static createRow(parent, css) {
		let div = globalThis['document'].createElement('div');
		if (parent) parent.appendChild(div);
		if (css) div.classList.add(css);
		return div;
	}

	static createCell(text, parent) {
		let div = globalThis['document'].createElement('div');
		div.textContent = text;
		if (parent) parent.appendChild(div);
		return div;
	}

	static createButton(text, callback, parent) {
		let cell = BitpackerPlugin.createCell('', parent);
		let btn = globalThis['document'].createElement('button');
		btn.type = 'button';
		btn.textContent = text;
		btn.addEventListener('click', callback);
		cell.appendChild(btn);
		return btn;
	}

	#renderError(e) {
		this.#contentDiv.innerHTML = `
<div>There was an error: ${e.message}</div>`;
	}
}


const bitpacker_css = `
.bitpacks-list {
    display: table;
}
.bitpacks-list > div {
    display: table-row;
}
.bitpacks-list > div > div {
    display: table-cell;
    padding: 2px 5px;
}
.bitpacks-list > div:nth-child(2n+1){
	background: #ececec;
}
.bitpacks-list button{
	border-left: 1px solid white;
	border-top: 1px solid white;
	border-right: 1px solid rgb(128,128,128);
	border-bottom: 1px solid rgb(128,128,128);
	background: rgb(192, 192, 192);
	margin: 0;
	padding: 1px 2px;
}
.bitpacks-list button:active {
	border-left: 2px solid rgb(128,128,128);
	border-top: 1px solid rgb(128,128,128);
	border-right: 1px solid white;
	border-bottom: 1px solid white;
}
`;
