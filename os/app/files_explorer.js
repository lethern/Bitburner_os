import { DOM_CONSTANTS } from '/os/constants.js'
import { EventListener, OS_EVENT, WindowWidget_EVENT, ServersManager_EVENT } from '/os/event_listener.js'
import { WindowWidget } from '/os/window_widget.js'
import { Logger } from '/os/logger.js'

export class FilesExplorer {
	/** @param {import('/os/os.js').OS} os */
	constructor(os) {
		this.#os = os;

		this.#winRenderer = new FilesExplorerRenderer(os, this);

		this.#os.listen(OS_EVENT.INIT, () => this.#init());
		this.#os.listen(OS_EVENT.ON_EXIT, () => this.#on_exit());
		//this.#os.filesExplorer.render()
	}

	changeDirectory_oneUp() {
		let currentDirectory = this.#currentDir.replace(/\/+$/g, '')

		currentDirectory = currentDirectory.substring(0, currentDirectory.lastIndexOf('/') + 1);

		this.changeCurrentDir(currentDirectory);
	}

	changeDirectoryTo(dir) {
		let targetPath = this.#currentDir + '/' + dir;
		targetPath = targetPath.replace(/^\/+/g, '')

		this.changeCurrentDir(targetPath);
	}

	changeCurrentDir(dir) {
		if (this.#currentDir == dir) return;

		if (dir.endsWith('/')) dir = dir.substring(0, dir.length - 1);
		console.log('changing to ', dir);
		this.#currentDir = dir;

		let currentFiles = FilesExplorer.narrowFilesToGivenDir(this.#files, this.#currentDir) ?? { files: [], dirs: {} };
		//this.#winRenderer.renderFiles(currentFiles, this.#currentDir);
		this.#winRenderer.rerender();
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
		let dir = this.#currentDir ? this.#currentDir + '/' : ''
		this.#os.terminal.inputToTerminal(`${command} ${dir+fileName}`);
		this.#winRenderer.hide();
	}

	get currentServer() {
		return this.#currentServer
	}

	get currentDir() {
		return this.#currentDir
	}

	async readServerFiles() {
		if (this.#currentServer != this.#os.serversManager.connectedServer) {
			this.#setCurrentServer(this.#os.serversManager.connectedServer);
		}

		let mainDirs = { files: [], dirs: {} };
		if (!this.#currentServer) return mainDirs;

		let files = await this.#os.getNS((ns) => {
			return ns.ls(this.#currentServer);
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
		this.#files = mainDirs;
		return mainDirs;
	}


	// private fields, methods

	#os
	#winRenderer
	#currentServer = 'home'; // current rendered server
	#currentDir = ''
	#files

	#init() {
		this.#injectFileExplorerButton();
		this.#os.serversManager.listen(ServersManager_EVENT.CONNECTED_SERV_CHANGED, () => this.#winRenderer.rerender());
	}

	#injectFileExplorerButton() {
		let fileExplorer_newPath = '<path d="M17.927,5.828h-4.41l-1.929-1.961c-0.078-0.079-0.186-0.125-0.297-0.125H4.159c-0.229,0-0.417,0.188-0.417,0.417v1.669H2.073c-0.229,0-0.417,0.188-0.417,0.417v9.596c0,0.229,0.188,0.417,0.417,0.417h15.854c0.229,0,0.417-0.188,0.417-0.417V6.245C18.344,6.016,18.156,5.828,17.927,5.828 M4.577,4.577h6.539l1.231,1.251h-7.77V4.577z M17.51,15.424H2.491V6.663H17.51V15.424z">'

		this.#os.gui.addMenuButton({
			btnLabel: 'File Explorer',
			callback: () => this.#windowVisibilityToggle(),
			btnIconPath: fileExplorer_newPath,
			btnIconViewBox: 'viewBox="0 2 18 17"',
		});
	}

	/** when something (button) wants us to be shown or hiden */
	#windowVisibilityToggle() {
		this.#winRenderer.windowVisibilityToggle()
	}

	#setCurrentServer(server) {
		this.#currentDir = '';
		this.#currentServer = server;
	}

	#on_exit() {
	}

	static narrowFilesToGivenDir(files, currentDirName) {
		let arr = currentDirName.split('/');
		let currDir = files;
		arr.forEach(part => {
			if (!part) return;
			currDir = currDir && currDir.dirs[part];
		});
		return currDir;
	}
}

class FilesExplorerRenderer extends EventListener {
	/** @param {import('/os/os.js').OS} os, @param {FilesExplorer} filesExplorer */
	constructor(os, filesExplorer) {
		super();
		this.#os = os;
		this.#filesExplorer = filesExplorer;

		this.#log = new Logger(this, os.logRenderer);
		this.eventListener_initLog(this.#log);

		this.#windowWidget = new WindowWidget(this, os);
		this.#windowWidget.listen(WindowWidget_EVENT.SHOW, () => this.#onShow());

		this.#os.listen(OS_EVENT.ON_EXIT, () => this.#on_exit());
		this.#os.listen(OS_EVENT.INIT, () => this.#init());
	}

	/** @return {String} */
	get title() {
		return `${this.#filesExplorer.currentServer}: /${this.#filesExplorer.currentDir}`
	}

	hide() {
		this.#windowWidget.hide();
	}

	windowVisibilityToggle() {
		this.#windowWidget.windowVisibilityToggle();
	}

	rerender() {
		this.#render(true);
	}

	// private fields, methods

	#os
	#filesExplorer
	#windowWidget
	#log
	#isRendered = false
	#aboutWindow

	#onShow() {
		this.#render();
	}

	#render(rerender = false) {
		if (this.#isRendered && !rerender) return;

		this.#isRendered = true;

		this.#filesExplorer.readServerFiles().then((files) => {
			let currentFiles = FilesExplorer.narrowFilesToGivenDir(files, this.#filesExplorer.currentDir) || [];
			this.#renderFiles(currentFiles, this.#filesExplorer.currentDir);
		});
	}

	#renderFiles(currentFiles, currentDirName) {
		this.#windowWidget.setTitle(this.title)

		let windowDiv = this.#windowWidget.getContainer()

		// Update file list
		const fileList = windowDiv.querySelector('.file-list')

		fileList.innerHTML =
			(currentDirName ? this.#renderIcon('..', 'upDirectory') : '') +
			Object.keys(currentFiles.dirs).map((elem) => this.#renderIcon(elem, 'directory')).join('') +
			currentFiles.files.map((elem) => this.#renderIcon(elem, 'file')).join('');

		// Add icon event listeners
		Array.from(windowDiv.querySelectorAll('.file-list__button')).forEach((button) => {
			button.addEventListener('dblclick', (event) => this.#fileListedOnClick(event))
		});
	}

	#fileListedOnClick(event) {
		this.#log.debug("file on click", event.target);
		let button = event.currentTarget;

		event.stopPropagation()
		const fileName = button.dataset.fileName

		switch (button.dataset.fileType) {
			case 'upDirectory':
				this.#filesExplorer.changeDirectory_oneUp()
				break
			case 'directory':
				this.#filesExplorer.changeDirectoryTo(fileName)
				break
			case 'file':
				this.#filesExplorer.openFile(fileName)
				break
		}
	}


	#renderIcon(name, type) {
		return `
			<li class="file-list__item">
				<button class="file-list__button" data-file-name="${name}" data-file-type="${type}">
					${files_icons[type]}
					<span class="file-list__label">${name}</span>
				</button>
			</li>
		`
	}

	#init() {
		this.#os.gui.injectCSS(files_explorer_css);
		
		this.#windowWidget.init();
		this.#windowWidget.getContentDiv().innerHTML = '<ul class="file-list" />';
		this.#windowWidget.getContentDiv().classList.add('whiteScrollbar')
		this.#windowWidget.addMenuItem({ label: 'Debug', callback: () => this.#onDebugMenuClick() })
		this.#windowWidget.addMenuItem({ label: 'Test', callback: () => this.#onTestMenuClick() })
		this.#windowWidget.addMenuItem({ label: 'About', callback: () => this.#onAboutMenuClick() })
		//this.listenForTerminalHidden();
	}

	#onDebugMenuClick() {
		this.#log.debug("MENU OPEN");
		this.#os.logRenderer.showWindow()
	}

	#onTestMenuClick() {
		this.#log.debug("test dbg");
		this.#log.info("test info");
		this.#log.warn("test warn");
		this.#log.error("test error");
	}

	#onAboutMenuClick() {
		if (!this.#aboutWindow) {
			this.#aboutWindow = this.#os.gui.createAboutWindow({
				'Name': 'Files Explorer',
				'Author': 'Phil#7068',
				'Contributor': 'lethern',
			});
		}
		this.#aboutWindow.show()
	}

	#on_exit() {
		Object.keys(this).forEach(key => this[key] = null);
	}
}


const files_explorer_css = `
.file-list {
	align-content: flex-start;
	display: flex;
	flex-wrap: wrap;
	list-style: none;
	margin: 0;
	padding: 6px;
}

.file-list__item {
	margin-bottom: 8px;
	text-align: center;
	width: 100px;
}

.file-list__button {
	align-items: center;
	appearance: none;
	border: 1px dotted transparent;
	border-radius: 2px;
	background: none;
	display: flex;
	flex-direction: column;
	margin: 0;
	padding: 2px;
	width: inherit;
}

.file-list__button:focus {
	background: rgba(15, 75, 255, .3);
	border-color: #222;
}

.file-list__icon {
	height: 38px;
	width: 32px;
}

.file-list__label {
	color: #222;
	text-shadow: none;
	word-wrap: anywhere;
}`;

const files_icons = {
	upDirectory: `
		<svg viewBox="0 0 64 64" class="file-list__icon">
			<path d="M5 8v43a4 4 0 0 0 4 4h46a4 4 0 0 0 4-4V13H25l-5-5H5zm50 11v32H9V20l46-1zm-15.84 4-12.965 1.586 3.494 3.492C27.62 30.333 26 33.221 26 36.814 26 43.711 31 48 31 48l3-2s-3-3.977-3-8c0-2.346 1.18-4.115 3.037-5.574l3.54 3.539L39.16 23z" />
		</svg>
	`,
	directory: `
		<svg viewBox="0 0 64 64" class="file-list__icon">
			<path d="M5 8v43a4 4 0 0 0 4 4h46a4 4 0 0 0 4-4V13H25l-5-5H5zm50 11v32H9V20l46 0z" />
		</svg>
	`,
	file: `
		<svg viewBox="0 0 24 24" class="file-list__icon">
			<path
				fill="#5B5B5B"
				d="M11.5 12h-3a.5.5 0 0 0 0 1H11v3.5c0 .827-.673 1.5-1.5 1.5S8 17.327 8 16.5a.5.5 0 0 0-1 0C7 17.879 8.121 19 9.5 19s2.5-1.121 2.5-2.5v-4a.5.5 0 0 0-.5-.5zM14.736 13H16.5c.275 0 .5.225.5.5a.5.5 0 0 0 1 0c0-.827-.673-1.5-1.5-1.5h-1.764c-.957 0-1.736.779-1.736 1.736 0 .661.368 1.256.96 1.553l2.633 1.316A.737.737 0 0 1 16.264 18H14.5a.501.501 0 0 1-.5-.5.5.5 0 0 0-1 0c0 .827.673 1.5 1.5 1.5h1.764c.957 0 1.736-.779 1.736-1.736a1.73 1.73 0 0 0-.96-1.553l-2.633-1.316A.737.737 0 0 1 14.736 13z"
			/>
			<path
				fill="#5B5B5B"
				d="M22.5 10H21V1.5a.5.5 0 0 0-.5-.5h-11c-.023 0-.044.01-.066.013a.509.509 0 0 0-.288.133l-5 5a.505.505 0 0 0-.133.289C4.01 6.457 4 6.477 4 6.5V10H2.5a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5H4v2.5a.5.5 0 0 0 .5.5h16a.5.5 0 0 0 .5-.5V21h1.5a.5.5 0 0 0 .5-.5v-10a.5.5 0 0 0-.5-.5zM9 2.707V6H5.707L9 2.707zM5 7h4.5a.5.5 0 0 0 .5-.5V2h10v8H5V7zm15 16H5v-2h15v2zm2-3H3v-9h19v9z"
			/>
		</svg>
	`
};