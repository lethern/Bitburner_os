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
		//this.#windowWidget.listen(WindowWidget_EVENT.SHOW, this.#onRenderVisible.bind(this));
		//this.eventListener_initLog(this.#log);
		this.#os.listen(OS_EVENT.ON_EXIT, () => this.#on_exit());
	}

	/*
	showWindow() {
		if (!this.#rendered) {
			this.#injectCSS();
			this.#renderWindow();
		}
		this.#logs.forEach(log => this.#renderLog(log));
		this.#windowWidget.show();
		this.#visible = true;
	}

	#onRenderVisible() {

	}
	*/

	// private

	#os
	#windowWidget
	#visible = false
	#rendered = false
	#log

	#on_exit() {

	}
}
