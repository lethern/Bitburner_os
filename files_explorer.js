import { DOM_CONSTANTS, icons } from '/os/constants.js'
import { EventListener, OS_EVENT, FilesExplorerRenderer_EVENT } from '/os/event_listener.js'
import { WindowWidget } from '/os/window_widget.js'
import { Debug } from '/os/debug.js'

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
		let dir = this.currentDir ? this.currentDir + '/' : ''
		this.os.terminal.inputToTerminal(`${command} ${dir+fileName}`);
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
		this.windowWidget.addMenuItem({label: 'Debug', callback: this.onDebugMenuClick.bind(this)})
		//this.listenForTerminalHidden();
	}

	onDebugMenuClick() {
		this.os.debug.console.renderWindow()
		this.os.debug.print("MENU OPEN", Debug.DEBUG_LEVEL);
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
