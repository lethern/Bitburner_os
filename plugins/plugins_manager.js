import { runPlugin } from '/os/plugins/plugins_utils.js'
import { WindowWidget } from '/os/window_widget.js'
import { OS_EVENT, WindowWidget_EVENT } from '/os/event_listener.js'
import { Logger } from '/os/logger.js'

export class PluginsManager {
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

	#init() {
		this.#injectMenuButton();

		this.#os.gui.injectCSS(plugins_manager_css);

		this.#windowWidget.init();
		this.#windowWidget.getContentDiv().innerHTML = '<div class="plugins-list" />';
		this.#windowWidget.getContentDiv().classList.add('whiteScrollbar')
		//this.#windowWidget.addMenuItem({ label: 'Debug', callback: this.#onDebugMenuClick.bind(this) })
	}

	#injectMenuButton() {
		let btn_newPath = '<path d="M17.927,5.828h-4.41l-1.929-1.961c-0.078-0.079-0.186-0.125-0.297-0.125H4.159c-0.229,0-0.417,0.188-0.417,0.417v1.669H2.073c-0.229,0-0.417,0.188-0.417,0.417v9.596c0,0.229,0.188,0.417,0.417,0.417h15.854c0.229,0,0.417-0.188,0.417-0.417V6.245C18.344,6.016,18.156,5.828,17.927,5.828 M4.577,4.577h6.539l1.231,1.251h-7.77V4.577z M17.51,15.424H2.491V6.663H17.51V15.424z">'

		this.#os.gui.addMenuButton({
			btnLabel: 'Plugins Manager',
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

	#render() {
		this.#windowWidget.setTitle('Plugins Manager')

		let windowDiv = this.#windowWidget.getContainer()

		let plugins = ["test", "test2"];

		const fileList = windowDiv.querySelector('.plugins-list')

		fileList.innerHTML = plugins.map(plugin => {
			return `
<div class=".plugins-list__row">
	<div>
	<div>${plugin}</div>
</div>
`
		}).join('');

		// Add btn listeners
		Array.from(windowDiv.querySelectorAll('.file-list__button')).forEach((button) => {
			button.addEventListener('dblclick', () => this.fileListedOnClick)
		});
	}

	#on_exit() {

	}
}

const plugins_manager_css = `
.plugins-list {
	align-content: flex-start;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	list-style: none;
	margin: 0;
	padding: 0;
}
.plugins-list__row{
}
.plugins-list__row div{
	display: inline-block;
}
.plugins-list__row div:nth-child(1){
	width: 100px;
}
.plugins-list__row div:nth-child(1){
	width: (100%-100px);
}

`;