
import { BP_LIB } from '/os/plugins/bitpacker/bp_lib.js'

async function mainPlugin(api) {
	let bitpacker = new BitpackerPlugin(api);

	bitpacker.init()

	bitpacker.run();
}

class BitpackerPlugin {
	/** @param {import('/os/plugins/api_adapter').API_Object} api */
	constructor(api) {
		this.os = api.os;
		this.#classes = api.classes;
		this.#utils = api.utils

		this.#windowWidget = this.#classes.newWindowWidget(this);
		//this.#windowWidget.listen(WindowWidget_EVENT.SHOW, () => this.#onShow());

		this.adapter = new BitpackerAdapter(api);
	}

	init() {
		this.os.getGUI().injectCSS(bitpacker_css, 'bitpacker_css');
		this.#createWidget()

		this.#availableLibrary = new BitpackerAvailableLibrary(this.#contentDiv, this);
		this.#installedLibrary = new BitpackerInstalledLibrary(this.#contentDiv, this);
		this.#myPacksLibrary = new BitpackerMyPacksLibrary(this.#contentDiv, this);
		this.#currentVisible = this.#availableLibrary;
	}

	async run() {
		await this.#currentVisible.render()
	}

	#classes
	#utils
	/** @type {import('/os/window_widget.js').WindowWidget} */
	#windowWidget
	#contentDiv
	#aboutWindow
	adapter
	#availableLibrary
	#installedLibrary
	#myPacksLibrary
	/** @type {LibraryList} */
	#currentVisible


	#createWidget() {
		let windowWidget = this.#windowWidget;
		windowWidget.init();
		windowWidget.getContentDiv().classList.add('whiteScrollbar')
		windowWidget.getContentDiv().classList.add('grayBackground')
		windowWidget.setTitle('Bitpacker')

		windowWidget.addMenuItem({ label: 'Available', callback: () => this.#onAvailableClick() })
		windowWidget.addMenuItem({ label: 'Installed', callback: () => this.#onInstalledClick() })
		windowWidget.addMenuItem({ label: 'My Packs', callback: () => this.#onMyPacksClick() })

		windowWidget.addMenuItem({ label: 'About', callback: () => this.#onAboutMenuClick() })
		windowWidget.show();

		this.#contentDiv = windowWidget.getContentDiv()
	}

	#onAvailableClick() {
		if (this.#currentVisible == this.#availableLibrary) return;
		this.#currentVisible = this.#availableLibrary;
		this.#currentVisible.render();
	}

	#onInstalledClick() {
		if (this.#currentVisible == this.#installedLibrary) return;
		this.#currentVisible = this.#installedLibrary;
		this.#currentVisible.render();
	}

	#onMyPacksClick() {
		if (this.#currentVisible == this.#myPacksLibrary) return;
		this.#currentVisible = this.#myPacksLibrary;
		this.#currentVisible.render();
	}

	#onAboutMenuClick() {
		if (!this.#aboutWindow) {
			this.#aboutWindow = this.os.getGUI().createAboutWindow({
				'Name': 'Packages Manager',
				'MyPacks': 'degaz#3692',
				'URL': 'https://github.com/davidsiems/bitpacker',
			});
		}
		this.#aboutWindow.show()
	}
}


class LibraryList {
	constructor(contentDiv) {
		this.contentDiv = contentDiv;
	}

	// interface
	/** @returns {Promise<any>} */
	async getBitpacks() { }
	printRow(row, lis) { }

	async render() {
		try {
			let data = await this.getBitpacks();
			this.listData = {};
			this.renderBitpacks(data);
		} catch (e) {
			this.renderError(e);
		}
	}

	renderBitpacks(data) {
		this.contentDiv.innerHTML = '';
		let list = LibraryList.createTable(this.contentDiv, 'bitpacks-list')

		data.forEach(row => {
			this.printRow(row, list);
		});
	}

	showMore(rowData) {
		console.log('showMore', rowData)
		if (!rowData || !rowData.detailsRow) return;

		if (this.lastShownDetails) {
			this.lastShownDetails.style['display'] = 'none';
		}

		console.log('showMore ok');
		rowData.detailsRow.style['display'] = '';
		this.lastShownDetails = rowData.detailsRow;
	}

	renderError(e) {
		console.error(e);
		this.contentDiv.innerHTML = `
<div>There was an error: ${e}</div>`;
	}

	static separateMainAndDetails(row, mainCells, detailsCells, columns) {
		Object.entries(row).forEach(([key, val]) => {
			let indx = columns.findIndex(col => col == key);
			if (indx != -1) {
				mainCells[indx] = val;
			} else {
				detailsCells.push([key, val]);
			}
		});
	}

	static createTable(parent, css) {
		let div = globalThis['document'].createElement('table');
		if (parent) parent.appendChild(div);
		if (css) div.classList.add(css);
		return div;
	}

	static createRow(parent, css) {
		let div = globalThis['document'].createElement('tr');
		if (parent) parent.appendChild(div);
		if (css) div.classList.add(css);
		return div;
	}

	static createCell(text, parent) {
		let div = globalThis['document'].createElement('td');
		div.textContent = text;
		if (parent) parent.appendChild(div);
		return div;
	}

	static createButton(text, callback, parent) {
		let cell = LibraryList.createCell('', parent);
		let btn = globalThis['document'].createElement('button');
		btn.type = 'button';
		btn.textContent = text;
		btn.addEventListener('click', callback);
		cell.appendChild(btn);
		return btn;
	}
}

class BitpackerAvailableLibrary extends LibraryList{
	/** @param {BitpackerPlugin} bitpackerPlugin */
	constructor(contentDiv, bitpackerPlugin) {
		super(contentDiv)
		this.#bitpackerPlugin = bitpackerPlugin;
	}

	async getBitpacks() {
		try {
			this.owned = await this.#bitpackerPlugin.adapter.getInstalledBitpacks();
		} catch (e) {
			this.owned = {};
		}
		
		return await BP_LIB.ListBitpacks();
	}

	printRow(row, parent) {
		let uniqueName = row.uniqueName;
		let data = {};
		if (uniqueName) {
			data = this.listData[uniqueName] = { name: uniqueName };
		}

		let mainRow = data.mainRow = LibraryList.createRow(parent);
		let detailsRow = data.detailsRow = LibraryList.createRow(parent, 'bpDetails');
		detailsRow.style['display'] = 'none';

		// buttons
		if (!this.owned[uniqueName]) {
			LibraryList.createCell('installed', mainRow);
		} else {
			LibraryList.createButton('install', () => this.#bitpackerPlugin.adapter.addPack(data), mainRow);
		}
		LibraryList.createButton('more', () => this.showMore(data), mainRow);

		// info
		let mainCells = [];
		let detailsCells = [];
		let columns = ["uniqueName", "shortDescription", "myPacks"];
		LibraryList.separateMainAndDetails(row, mainCells, detailsCells, columns)

		for (let i = 0; i < columns.length; ++i) {
			LibraryList.createCell(mainCells[i] || '', mainRow);
		}

		// details
		let cell = LibraryList.createCell(
			detailsCells.map(d => d[0]+": "+d[1]).join("; "),
			detailsRow);
		cell.colSpan = 4;
	}

	#bitpackerPlugin
}

class BitpackerInstalledLibrary extends LibraryList {
	/** @param {BitpackerPlugin} bitpackerPlugin */
	constructor(contentDiv, bitpackerPlugin) {
		super(contentDiv)
		this.#bitpackerPlugin = bitpackerPlugin;
	}

	async getBitpacks() {
		let bitpacks = await this.#bitpackerPlugin.adapter.getInstalledBitpacks();
		return Object.entries(bitpacks).map(([v, k]) => ({
			uniqueName: v,
			version: k
		}));
	}

	printRow(row, parent) {
		let uniqueName = row.uniqueName;
		let data = {};
		if (uniqueName) {
			data = this.listData[uniqueName] = {};
		}

		let mainRow = data.mainRow = LibraryList.createRow(parent);
		let detailsRow = data.detailsRow = LibraryList.createRow(parent, 'bpDetails');
		detailsRow.style['display'] = 'none';

		// buttons
		LibraryList.createButton('install', () => this.#bitpackerPlugin.adapter.addPack(this.listData[name]), mainRow);
		LibraryList.createButton('more', () => this.showMore(this.listData[name]), mainRow);

		// info
		let mainCells = [];
		let detailsCells = [];
		let columns = ["uniqueName", "shortDescription", "myPacks"];
		LibraryList.separateMainAndDetails(row, mainCells, detailsCells, columns)

		for (let i = 0; i < columns.length; ++i) {
			LibraryList.createCell(mainCells[i] || '', mainRow);
		}

		// details
		let cell = LibraryList.createCell(
			detailsCells.map(d => d[0] + ": " + d[1]).join("; "),
			detailsRow);
		cell.colSpan = 4;
	}

	#bitpackerPlugin
}

class BitpackerMyPacksLibrary extends LibraryList {
	/** @param {BitpackerPlugin} bitpackerPlugin */
	constructor(contentDiv, bitpackerPlugin) {
		super(contentDiv)
		this.#bitpackerPlugin = bitpackerPlugin;
	}

	async getBitpacks() {
		return await BP_LIB.ListBitpacks();
	}

	printRow(row, parent) {
		let uniqueName = row.uniqueName;
		let data = {};
		if (uniqueName) {
			data = this.listData[uniqueName] = {};
		}

		let mainRow = data.mainRow = LibraryList.createRow(parent);
		let detailsRow = data.detailsRow = LibraryList.createRow(parent, 'bpDetails');
		detailsRow.style['display'] = 'none';

		// buttons
		LibraryList.createButton('install', () => this.#bitpackerPlugin.adapter.addPack(this.listData[name]), mainRow);
		LibraryList.createButton('more', () => this.showMore(this.listData[name]), mainRow);

		// info
		let mainCells = [];
		let detailsCells = [];
		let columns = ["uniqueName", "shortDescription", "myPacks"];
		LibraryList.separateMainAndDetails(row, mainCells, detailsCells, columns)

		for (let i = 0; i < columns.length; ++i) {
			LibraryList.createCell(mainCells[i] || '', mainRow);
		}

		// details
		let cell = LibraryList.createCell(
			detailsCells.map(d => d[0] + ": " + d[1]).join("; "),
			detailsRow);
		cell.colSpan = 4;
	}

	#bitpackerPlugin
}

class BitpackerAdapter {
	constructor(api) {
		this.#api = api;
		this.#os = api.os;
	}

	async addPack(data) {
		if (!data) return;

		try {
			let options = {};
			let bitpack = data.name;
			let version = "";
			await BP_LIB.BitpackAdd(this.#os, options, bitpack, version);
		} catch (e) {
			console.error(e);
		}
	}

	async getInstalledBitpacks() {
		let manifest = await BP_LIB.LoadManifest(this.#os)
		if (!manifest) throw "Missing or empty file packages.txt";
		return manifest.bitpacks;
	}

	#api
	#os
}

const bitpacker_css = `
.bitpacks-list {
	border-spacing: 0;
	border-collapse: collapse;
	border: none;
}
.bitpacks-list tr {
}
.bitpacks-list td {
	padding: 2px 5px;
	border: none;
}
.bitpacks-list td:nth-child(3){ /*id*/
	white-space: nowrap;
}
.bitpacks-list tr:nth-child(4n+1){
	background: #ececec;
}
.bitpacks-list button{
	border-left: 1px solid white;
	border-top: 1px solid white;
	border-right: 2px solid rgb(128,128,128);
	border-bottom: 1px solid rgb(128,128,128);
	background: rgb(192, 192, 192);
	margin: 0;
	padding: 1px 3px;
}
.bitpacks-list button:active {
	border-left: 2px solid rgb(128,128,128);
	border-top: 1px solid rgb(128,128,128);
	border-right: 1px solid white;
	border-bottom: 1px solid white;
}
.bitpacks-list .bpDetails{
	background: #cbdcda;
}
`;
