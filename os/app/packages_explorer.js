import { WindowWidget } from '/os/window_widget.js'
import { OS_EVENT, WindowWidget_EVENT } from '/os/event_listener.js'
import { Logger } from '/os/logger.js'


export class PackagesExplorer {
	/** @param {import('/os/os.js').OS} os */
	constructor(os) {
		this.#os = os;
		this.#log = new Logger(this, os.logRenderer);
		this.#windowWidget = new WindowWidget(this, os);
		this.#windowWidget.listen(WindowWidget_EVENT.SHOW, () => this.#onShow());
		this.#os.listen(OS_EVENT.INIT, () => this.#init());
		this.#os.listen(OS_EVENT.ON_EXIT, () => this.#on_exit());
	}


	// private

	#os
	#windowWidget
	#rendered = false
	#log
	#aboutWindow

	#init() {
		this.#injectMenuButton();

		this.#os.gui.injectCSS(packages_explorer_css);

		this.#windowWidget.init();
		this.#windowWidget.getContentDiv().innerHTML = '<div class="packages-list" />';
		this.#windowWidget.getContentDiv().classList.add('whiteScrollbar')
		this.#windowWidget.getContentDiv().classList.add('grayBackground')
		this.#windowWidget.addMenuItem({ label: 'About', callback: () => this.#onAboutMenuClick() })
	}

	#onAboutMenuClick() {
		if (!this.#aboutWindow) {
			this.#aboutWindow = this.#os.gui.createAboutWindow({
				'Name': 'Packages Manager',
				'Author': 'degaz#3692',
				'URL': 'https://github.com/davidsiems/bitpacker',
			});
		}
		this.#aboutWindow.show()
	}

	#injectMenuButton() {
		let btn_newPath = '<path d="M17.927,5.828h-4.41l-1.929-1.961c-0.078-0.079-0.186-0.125-0.297-0.125H4.159c-0.229,0-0.417,0.188-0.417,0.417v1.669H2.073c-0.229,0-0.417,0.188-0.417,0.417v9.596c0,0.229,0.188,0.417,0.417,0.417h15.854c0.229,0,0.417-0.188,0.417-0.417V6.245C18.344,6.016,18.156,5.828,17.927,5.828 M4.577,4.577h6.539l1.231,1.251h-7.77V4.577z M17.51,15.424H2.491V6.663H17.51V15.424z">'

		this.#os.gui.addMenuButton({
			btnLabel: 'Packages',
			callback: () => this.#windowVisibilityToggle(),
			btnIconPath: btn_newPath,
			btnIconViewBox: 'viewBox="0 2 18 17"',
		});
	}

	#windowVisibilityToggle() {
		this.#windowWidget.windowVisibilityToggle()
	}

	#onShow() {
		if (this.#rendered) return;
		this.#rendered = true;

		this.#render();
	}

	async #render() {
		this.#windowWidget.setTitle('Packages Manager')

		let windowDiv = this.#windowWidget.getContainer()
		const fileList = windowDiv.querySelector('.packages-list')

		//await this.#getPluginsData();
		if (fileList) {
			fileList.innerHTML = ''
		}
	}

	#on_exit() {
	}
}

const packages_explorer_css = `
.packages-list{
}
.packages-about table{
	border: none;
}
`;
