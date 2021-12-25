import { DOM_CONSTANTS, icons, windowIcon } from '/os/constants.js'
import { EventListener, OS_EVENT, FilesExplorerRenderer_EVENT } from '/os/event_listener.js'

export class FilesExplorer {
	/** @param {import('/os/os.js').OS} os */
	constructor(os) {
		this.os = os;
		this.winRenderer = new FilesExplorerRenderer(os, this);

		this.currentServer = 'home'; // current rendered server
		this.currentDir = '';
		this.isRendered = false;

		this.os.listen(OS_EVENT.INIT, this.init.bind(this));
		this.winRenderer.listen(FilesExplorerRenderer_EVENT.SHOW, this.onRenderVisible.bind(this));
		this.os.listen(OS_EVENT.ON_EXIT, this.on_exit.bind(this));
	}

	init() {
		this.injectFileExplorerButton();
	}

	injectFileExplorerButton() {
		let fileExplorer_newPath = '<path d="M17.927,5.828h-4.41l-1.929-1.961c-0.078-0.079-0.186-0.125-0.297-0.125H4.159c-0.229,0-0.417,0.188-0.417,0.417v1.669H2.073c-0.229,0-0.417,0.188-0.417,0.417v9.596c0,0.229,0.188,0.417,0.417,0.417h15.854c0.229,0,0.417-0.188,0.417-0.417V6.245C18.344,6.016,18.156,5.828,17.927,5.828 M4.577,4.577h6.539l1.231,1.251h-7.77V4.577z M17.51,15.424H2.491V6.663H17.51V15.424z">'

		this.os.gui.injectButton({
			btnLabel: 'File Explorer',
			btnId: DOM_CONSTANTS.fileExplorerBtnId,
			callback: () => this.winRenderer.windowVisibilityToggle(),
			btnIconPath: fileExplorer_newPath,
			btnIconViewBox: 'viewBox="0 2 18 17"',
		});
	}

	onRenderVisible() {
		// runs only one time
		if (this.isRendered) return;
		this.isRendered = true;

		//this.winRenderer.showWindow();
		this.render()
	}

	setCurrentServer(server) {
		this.currentDir = '';
		this.currentServer = server;
	}

	render() {
		if (this.currentServer != this.os.serversManager.connectedServer) {
			this.setCurrentServer(this.os.serversManager.connectedServer);
		}

		this.readServerFiles().then((files) => {
			this.files = files;
			let currentFiles = this.narrowFilesToGivenDir(this.files, this.currentDir);
			if (!currentFiles) currentFiles = [];
			this.winRenderer.renderFiles(currentFiles, this.currentDir);
		});
	}

	async readServerFiles() {
		let mainDirs = { files: [], dirs: {} };
		if (!this.currentServer) return mainDirs;

		let files = await this.os.getNS((ns) => {
			return ns.ls(this.currentServer);
		});

		for (let file of files) {
			let arr = file.split('/');
			let { files, dirs } = mainDirs;
			for (let i = 0; i < arr.length - 1; ++i) {
				let part = arr[i];
				if (!part) continue;

				if (!dirs[part]) dirs[part] = { files: [], dirs: {} };
				files = dirs[part].files;
				dirs = dirs[part].dirs;
			}
			files.push(arr[arr.length - 1]);
		}
		return mainDirs;
	}

	changeDirectory_oneUp() {
		let currentDirectory = this.currentDir.replace(/\/+$/g, '')

		currentDirectory = currentDirectory.substring(0, currentDirectory.lastIndexOf('/') + 1);

		this.changeCurrentDir(currentDirectory);
	}

	changeDirectoryTo(dir) {
		let targetPath = this.currentDir + '/' + dir;
		targetPath = targetPath.replace(/^\/+/g, '')

		this.changeCurrentDir(targetPath);
	}

	changeCurrentDir(dir) {
		if (this.currentDir == dir) return;

		this.currentDir = dir;

		let currentFiles = this.narrowFilesToGivenDir(this.files, this.currentDir);
		if (!currentFiles) currentFiles = { files: [], dirs: {} };
		this.winRenderer.renderFiles(currentFiles, this.currentDir);
	}

	narrowFilesToGivenDir(files, currentDirName) {
		let arr = currentDirName.split('/');
		let currDir = files;
		arr.forEach(part => {
			if (!part) return;
			currDir = currDir && currDir.dirs[part];
		});
		return currDir;
	}

	openFile(fileName) {
		const fileHandlers = {
			nano: ['.js', '.ns', '.script'],
			run: ['.exe', '.cct'],
		}

		let command = Object.entries(fileHandlers).find(([, extensions]) => extensions.find((extension) => fileName.endsWith(extension)))?.[0]

		if (!command) {
			command = 'cat'
		}

		this.os.terminal.inputToTerminal(`${command} ${this.currentDir+'/'+fileName}`);
		this.winRenderer.windowVisibility(false);
	}

	on_exit() {
	}
}

class FilesExplorerRenderer extends EventListener {
	/** @param {import('/os/os.js').OS} os, @param {FilesExplorer} filesExplorer */
	constructor(os, filesExplorer) {
		super();
		this.os = os;
		this.debug = os.debug;
		this.filesExplorer = filesExplorer;

		this.terminal_visible = false;
		this.windowWidget = new WindowWidget(this, DOM_CONSTANTS.myCustomWindowId);

		this.os.listen(OS_EVENT.ON_EXIT, this.on_exit.bind(this));
		this.os.listen(OS_EVENT.INIT, this.init.bind(this));
	}

	/** @return {String} */
	get title() {
		return `${this.filesExplorer.currentServer}: /${this.filesExplorer.currentDir}`
	}

	
	renderFiles(currentFiles, currentDirName) {
		this.windowWidget.setTitle(this.title)

		let windowDiv = this.windowWidget.getContainer()

		// Update file list
		const fileList = windowDiv.querySelector('.file-list')

		fileList.innerHTML =
			(currentDirName ? this.#renderIcon('..', 'upDirectory') : '') +
			Object.keys(currentFiles.dirs).map((elem) => this.#renderIcon(elem, 'directory')).join('') +
			currentFiles.files.map((elem) => this.#renderIcon(elem, 'file')).join('');

		// Add icon event listeners
		Array.from(windowDiv.querySelectorAll('.file-list__button')).forEach((button) => {
			button.addEventListener('dblclick', this.fileListedOnClick.bind(this))
		});
	}

	#renderIcon(name, type) {
		return `
			<li class="file-list__item">
				<button class="file-list__button" data-file-name="${name}" data-file-type="${type}">
					${icons[type]}
					<span class="file-list__label">${name}</span>
				</button>
			</li>
		`
	}

	fileListedOnClick(event) {
		let button = event.currentTarget;

		event.stopPropagation()
		const fileName = button.dataset.fileName

		switch (button.dataset.fileType) {
			case 'upDirectory':
				this.filesExplorer.changeDirectory_oneUp()
				break
			case 'directory':
				this.filesExplorer.changeDirectoryTo(fileName)
				break
			case 'file':
				this.filesExplorer.openFile(fileName)
				break
		}
	}

	init() {
		this.windowWidget.init();
		this.windowWidget.setContentHTML('<ul class="file-list file-list--layout-icon-row" />');
		//this.listenForTerminalHidden();
	}

	windowVisibilityToggle() {
		this.windowVisibility(!this.terminal_visible);
	}

	/** @param {boolean} visible */
	windowVisibility(visible) {
		this.windowWidget.windowVisibility(visible);
		if (visible) this.fire(FilesExplorerRenderer_EVENT.SHOW);
	}

	on_exit() {
		this.windowWidget.dispose();
		Object.keys(this).forEach(key => this[key] = null);
	}
}

function stealFocusHandler() {
	Array.from(globalThis['document'].querySelectorAll(`.windowWidget.${DOM_CONSTANTS.windowFocusedClass}`)).forEach((win) =>
		win.classList.remove(DOM_CONSTANTS.windowFocusedClass)
	)
}


class WindowWidget {
	#left
	#top
	#elementWidth
	#elementHeight
	#windowWidth
	#windowHeight
	#grabStart = {}
	#modalStart = {}
	#boundBeginGrabbing = this.#beginGrabbing.bind(this)
	#boundEndGrabbing = this.#endGrabbing.bind(this)
	#boundMouseMove = this.#mouseMove.bind(this)

	constructor(parent, id) {
		this.parent = parent;
		this.windowId = id;
		this.doc = globalThis['document'];
	}

	init() {
		this.#initialiseWindow(this.windowId)
	}

	windowVisibility(visible) {
		if (visible != this.isVisible) {
			this.isVisible = visible;

			if (!this.container) return;

			if (this.isVisible) {
				this.container.style.display = ''
				this.#initialiseWindowPosition()
			} else {
				this.container.style.display = 'none'
			}
		}
	}

	dispose() {
		if (!this.container) return;
		this.container.remove()
	}

	createWindow(id) {
		const element = this.createBodyDiv();
		element.id = id
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
		this.renderMenu(element);
		return element
	}

	createBodyDiv() {
		let div = this.doc.createElement('div');
		this.doc.body.appendChild(div);
		return div;
	}

	renderMenu(element) {
//		let menuDiv = element.querySelector('.window__menu')
//
//		for (let item of this.menuItems) {
//
//		}
//		// TMP
//		let menuItem = this.doc.createElement('span');
//		menuItem.textContent = 'Debug'
//		menuDiv.appendChild(menuItem)
	}

	setTitle(title) {
		this.container.querySelector('.window__title').textContent = title
	}

	setContentHTML(html) {
		this.container.querySelector('.window__content').innerHTML = html
	}

	getContainer() {
		return this.container
	}

	#initialiseWindow(id) {
		this.container = this.createWindow(id)
		/** @type {HTMLElement} */
		this.explorerWindow = this.container.querySelector('.window')
		//this.container.style.display = 'none';
	}

	#initialiseWindowPosition() {
		this.container.classList.add(DOM_CONSTANTS.hiddenClass)

		setTimeout(() => {
			this.#left = globalThis.innerWidth / 2 - this.explorerWindow.offsetWidth / 2
			this.#top = globalThis.innerHeight / 2 - this.explorerWindow.offsetHeight / 2

			this.#updateWindowPosition()

			this.container.classList.remove(DOM_CONSTANTS.hiddenClass)
		}, 50)
	}

	#updateWindowPosition() {
		this.explorerWindow.style.transform = `translate(${this.#left}px, ${this.#top}px)`
	}

	/** @param {HTMLElement} element */
	#addWindowEventListeners(element) {
		element.querySelector('.window__cta-close').addEventListener('click', () => {
			if(this.parent.windowVisibility)
				this.parent.windowVisibility(false)
		})
		element.querySelector('.window__toolbar').addEventListener('mousedown', this.#boundBeginGrabbing)
		element.querySelector('.window').addEventListener('click', (e) => {
			e.stopPropagation()
			this.explorerWindow.classList.add(DOM_CONSTANTS.windowFocusedClass)
		})

		if (!globalThis.hasBoundWindowFocusListener) {
			globalThis.hasBoundWindowFocusListener = true
			this.doc.body.addEventListener('click', stealFocusHandler)
		}
	}

	#beginGrabbing({ x, y, button }) {
		if (!button) {
			const win = globalThis['window']
			this.#grabStart = { x, y }
			this.#elementWidth = this.explorerWindow.offsetWidth
			this.#elementHeight = this.explorerWindow.offsetHeight
			this.#modalStart = { x: this.#left, y: this.#top }
			this.#windowWidth = win.innerWidth
			this.#windowHeight = win.innerHeight

			const body = this.doc.body
			body.addEventListener('mousemove', this.#boundMouseMove)
			body.addEventListener('mouseup', this.#boundEndGrabbing)
			body.addEventListener('mouseleave', this.#boundEndGrabbing)
		}
	}

	#endGrabbing() {
		const body = this.doc.body
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
}