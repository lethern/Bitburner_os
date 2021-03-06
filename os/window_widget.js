import { DOM_CONSTANTS, windowIcon, WINDOW_WIDGET_CSS } from '/os/constants.js'
import { EventListener, WindowWidget_EVENT, OS_EVENT  } from '/os/event_listener.js'
import { Logger } from '/os/logger.js'

export class WindowWidgetFactory extends EventListener {
}

export class WindowWidget extends EventListener {
	/**
	 * @param {object} parent
	 * @param {import('/os/os.js').OS} os
	 * @param {string} [id]
	 */
	constructor(parent, os, id) {
		super();
		this.#parent = parent;
		this.#windowId = id;
		this.#doc = globalThis['document'];
		this.#menuItems = [];
		this.#os = os;

		this.#log = new Logger(this, os.logRenderer);
		this.eventListener_initLog(this.#log);

		os.listen(OS_EVENT.ON_EXIT, () => this.on_exit());
	}
	
	init() {
		this.#os.gui.injectCSS(WINDOW_WIDGET_CSS, 'window_widget_css');
		this.#initialiseWindow(this.#windowId)
	}

	get isVisible() {
		return this.#isVisible
	}

	show() {
		this.windowVisibility(true);
	}

	hide() {
		this.windowVisibility(false);
	}

	windowVisibilityToggle() {
		this.windowVisibility(!this.#isVisible);
	}

	windowVisibility(visible) {
		if (visible != this.#isVisible) {
			this.#isVisible = visible;

			if (!this.#container) return;

			if (this.#isVisible) {
				this.#container.style.display = ''
				this.#initialiseWindowPosition()
				this.fire(WindowWidget_EVENT.SHOW);
			} else {
				this.#container.style.display = 'none'
				this.fire(WindowWidget_EVENT.HIDE);
			}
		}
	}

	/** @param { {label: string, callback: Function} } params */
	addMenuItem(params) {
		this.#menuItems.push({ ...params, div: null });

		if (!this.menuDiv) return;

		let item = this.#menuItems[this.#menuItems.length - 1];
		this.#renderMenuItem(item);
	}

	setTitle(title) {
		this.#container.querySelector('.window__title').textContent = title
	}

	getContentDiv() {
		return this.#contentWindow
	}

	getContainer() {
		return this.#container
	}


	// private fields, methods

	#parent
	#windowId
	#doc
	#menuItems
	#os
	#log
	#container
	#contentWindow
	#explorerWindow
	#isVisible

	#left
	#top
	#elementWidth
	#elementHeight
	#windowWidth
	#windowHeight
	#grabStart = {}
	#modalStart = {}
	#boundBeginGrabbing = (event) => this.#beginGrabbing(event)
	#boundEndGrabbing = (event) => this.#endGrabbing(event)
	#boundMouseMove = (event) => this.#mouseMove(event)


	#initialiseWindow(id) {
		if (this.#container) throw new Error("Window: already initialised");
		this.#container = this.#createWindow(id)
		/** @type {HTMLElement} */
		this.#explorerWindow = this.#container.querySelector('.window')
		/** @type {HTMLElement} */
		this.#contentWindow = this.#container.querySelector('.window__content')
	}

	#createWindow(id) {
		const element = this.#createBodyDiv();
		if(id) element.id = id
		element.classList.add('window-container')
		element.style.display = 'none';
		element.innerHTML = `
			<div class="window">
			<div class="window__toolbar">
				<img src="${windowIcon}" alt="" class="window__icon">
				<h1 class="window__title"></h1>
				<div class="window__cta-group">
					<button class="btn btn--small window__cta-minimise">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
							<path d="m3 13h12v2h-12z" fill="#000" />
						</svg>
					</button>
					<button class="btn btn--small window__cta-maximise">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
							<path d="m3 3h12v2h-12z" fill="#000" />
							<path d="m3 3h12v12h-12z" stroke="#000" fill='none' />
						</svg>

					</button>
					<button class="btn btn--small window__cta-close">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
							<g stroke="#000" stroke-width="1.5">
								<line x1="3" y1="3" x2="15" y2="15" />
								<line x2="3" y1="3" x1="15" y2="15" />
							</g>
						</svg>
					</button>
				</div>
			</div>
			<div class="window__menu">
			</div>
			<div class="window__content">
			</div>
		</div>
		`

		this.#addWindowEventListeners(element)
		this.#renderMenu(element);
		return element
	}

	#createBodyDiv() {
		let div = this.#doc.createElement('div');
		this.#doc.body.appendChild(div);
		return div;
	}

	/** @param {HTMLElement} element */
	#addWindowEventListeners(element) {
		element.querySelector('.window__cta-minimise').addEventListener('click', () => {
			this.hide();
		})
		element.querySelector('.window__cta-close').addEventListener('click', () => {
			this.hide();
			this.fire(WindowWidget_EVENT.CLOSE);
		})
		element.querySelector('.window__toolbar').addEventListener('mousedown', this.#boundBeginGrabbing)
		element.querySelector('.window__toolbar').addEventListener('mousedown', () => {
			WindowWidget.stealFocusHandler()
			this.#explorerWindow.classList.add(DOM_CONSTANTS.windowFocusedClass)
		})
		element.querySelector('.window').addEventListener('click', (e) => {
			e.stopPropagation()
			WindowWidget.stealFocusHandler()
			this.#explorerWindow.classList.add(DOM_CONSTANTS.windowFocusedClass)
		})

		if (!globalThis.hasBoundWindowFocusListener) {
			globalThis.hasBoundWindowFocusListener = true
			this.#doc.body.addEventListener('click', WindowWidget.stealFocusHandler)
		}
	}

	#renderMenu(parentDiv) {
		this.menuDiv = parentDiv.querySelector('.window__menu')

		for (let item of this.#menuItems) {
			this.#renderMenuItem(item);
		}
	}

	#renderMenuItem(menuItem) {
		let { label, callback } = menuItem;
		let div = this.#doc.createElement('span');
		menuItem.div = div;
		div.textContent = label
		div.addEventListener('click', callback);
		this.menuDiv.appendChild(div)
	}

	#initialiseWindowPosition() {
		this.#container.classList.add(DOM_CONSTANTS.hiddenClass)

		setTimeout(() => {
			this.#left = globalThis.innerWidth / 2 - this.#explorerWindow.offsetWidth / 2
			this.#top = globalThis.innerHeight / 2 - this.#explorerWindow.offsetHeight / 2

			this.#updateWindowPosition()

			this.#container.classList.remove(DOM_CONSTANTS.hiddenClass)
		}, 50)
	}

	#updateWindowPosition() {
		this.#explorerWindow.style.transform = `translate(${this.#left}px, ${this.#top}px)`
	}

	#beginGrabbing({ x, y, button }) {
		if (!button) {
			const win = globalThis['window']
			this.#grabStart = { x, y }
			this.#elementWidth = this.#explorerWindow.offsetWidth
			this.#elementHeight = this.#explorerWindow.offsetHeight
			this.#modalStart = { x: this.#left, y: this.#top }
			this.#windowWidth = win.innerWidth
			this.#windowHeight = win.innerHeight

			const body = this.#doc.body
			body.addEventListener('mousemove', this.#boundMouseMove)
			body.addEventListener('mouseup', this.#boundEndGrabbing)
			body.addEventListener('mouseleave', this.#boundEndGrabbing)
		}
	}

	#endGrabbing(event) {
		const body = this.#doc.body
		body.removeEventListener('mousemove', this.#boundMouseMove)
		body.removeEventListener('mouseup', this.#boundEndGrabbing)
		body.removeEventListener('mouseleave', this.#boundEndGrabbing)
	}

	#mouseMove({ x, y }) {
		let leftFinal = this.#modalStart.x + (x - this.#grabStart.x)
		let topFinal = this.#modalStart.y + (y - this.#grabStart.y)

		const leftIsBeforeScreen = leftFinal < 0
		const leftIsAfterScreen = leftFinal + this.#elementWidth > this.#windowWidth
		if (leftIsBeforeScreen || leftIsAfterScreen) {
			if (leftIsBeforeScreen) {
				leftFinal = 0
			} else {
				leftFinal = this.#windowWidth - this.#elementWidth
			}

			this.#modalStart.x = leftFinal
			this.#grabStart.x = Math.max(Math.min(x, this.#windowWidth - 5), 5)
		}

		const topIsBeforeScreen = topFinal < 0
		const topIsAfterScreen = topFinal + this.#elementHeight > this.#windowHeight
		if (topIsBeforeScreen || topIsAfterScreen) {
			if (topIsBeforeScreen) {
				topFinal = 0
			} else {
				topFinal = this.#windowHeight - this.#elementHeight
			}

			this.#modalStart.y = topFinal
			this.#grabStart.y = Math.max(Math.min(y, this.#windowHeight), 5)
		}

		this.#left = leftFinal
		this.#top = topFinal
		this.#updateWindowPosition()
	}


	on_exit() {
		this.#dispose()
	}

	#dispose() {
		if (!this.#container) return;
		this.#container.remove()
		this.#container = null;
		this.#contentWindow = null;
		this.#parent = null;
		this.#os = null;
		this.#log = null;
		this.#explorerWindow = null;
		this.#isVisible = false;
	}

	static stealFocusHandler() {
		Array.from(globalThis['document'].querySelectorAll(`.window.${DOM_CONSTANTS.windowFocusedClass}`)).forEach((win) =>
			win.classList.remove(DOM_CONSTANTS.windowFocusedClass)
		)
	}
}
