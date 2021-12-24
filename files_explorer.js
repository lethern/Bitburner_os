import { DOM_CONSTANTS, directorySvg, jsSvg, windowIcon } from '/os/constants.js'
import { EventListener, OS_EVENT, FilesExplorerRenderer_EVENT } from '/os/event_listener.js'

export class FilesExplorer {
	/** @param {OS} os */
	constructor(os){
		this.os = os;
		
		this.winRenderer = new FilesExplorerRenderer(os, this);

		this.currentServer = 'home';
		
		let _this = this;
		this.os.getNS_noPromise(function (ns){
			_this.setCurrentServer(ns.getHostname());
		});
		
		this.currentDir = '';
		this.isRendered = false;

		this.os.listen(OS_EVENT.INIT, this.init.bind(this));
		this.winRenderer.listen(FilesExplorerRenderer_EVENT.SHOW, this.onRenderVisible.bind(this));
		this.os.listen(OS_EVENT.ON_EXIT, this.on_exit.bind(this));
	}
	
	setCurrentServer(server){
		let old = this.currentServer;
		this.currentServer = 'home';
		if(old != this.currentServer){
			// re-render
		}
	}
	
	init(){
		this.injectFileExplorerButton();
		
		/*
		let renderer = this.winRenderer;
		let width = renderer.windowWidth - 2;
		let menu_height = 50;
		this.menu_svg = renderer.createSVGElement('svg', { x: 1, y: 1, width: width+'px', height: menu_height+'px' }, renderer.svg);
		this.renderMenu(menu_height);

		let dirs_height = renderer.windowHeight - 2 - menu_height;
		this.dirs_svg = renderer.createSVGElement('svg', { x: 1, y: 1+menu_height+1, width: width+'px', height: dirs_height+'px' }, renderer.svg);
		*/
	}
	
	injectFileExplorerButton(){
		let fileExplorer_newPath = '<path d="M17.927,5.828h-4.41l-1.929-1.961c-0.078-0.079-0.186-0.125-0.297-0.125H4.159c-0.229,0-0.417,0.188-0.417,0.417v1.669H2.073c-0.229,0-0.417,0.188-0.417,0.417v9.596c0,0.229,0.188,0.417,0.417,0.417h15.854c0.229,0,0.417-0.188,0.417-0.417V6.245C18.344,6.016,18.156,5.828,17.927,5.828 M4.577,4.577h6.539l1.231,1.251h-7.77V4.577z M17.51,15.424H2.491V6.663H17.51V15.424z">'
		
		this.os.gui.injectButton( { 
			btnLabel:		'File Explorer', 
			btnId:			DOM_CONSTANTS.fileExplorerBtnId,
			callback:		() => this.winRenderer.terminalVisibilityToggle(),
			btnIconPath:	fileExplorer_newPath,
			btnIconViewBox: 'viewBox="0 2 18 17"',
			} );
	}
	
	onRenderVisible(){
		// runs only one time
		if(this.isRendered) return;
		this.isRendered= true;
		
		this.winRenderer.showWindow();
		
		this.readServerFiles().then( (files)=>{
			this.files = files;
			let currentFiles = this.narrowFilesToGivenDir(this.files, this.currentDir);
			if(!currentFiles) currentFiles=[];
			this.winRenderer.renderFiles(currentFiles, this.currentDir);
		});
	}
		
	async readServerFiles(){
		let files = await this.os.getNS((ns)=>{
			return ns.ls(this.currentServer);
		});
		
		let mainDirs = { files: [], dirs: {} };
		for(let file of files){
			let arr = file.split('/');
			let { files, dirs } = mainDirs;
			for(let i=0; i<arr.length-1; ++i){
				let part = arr[i];
				if(!part) continue;
				
				if(!dirs[part]) dirs[part] = { files: [], dirs: {} };
				files = dirs[part].files;
				dirs = dirs[part].dirs;
			}
			files.push(arr[arr.length-1]);
		}
		console.log("mainDirs ", mainDirs);
		return mainDirs;
	}

	changeDirectory_oneUp(){
		let currentDirectory = this.currentDir.replaceAll(/\/+$/g, '')
		
		currentDirectory = currentDirectory.substring(0, currentDirectory.lastIndexOf('/') + 1);
		
		console.log(`going up from ${this.currentDir} to ${currentDirectory}`)
		this.changeCurrentDir(currentDirectory);
	}
	
	changeDirectoryTo(dir){
		let targetPath = this.currentDir + '/' + dir;
		targetPath = targetPath.replaceAll(/^\/+/g, '')
		console.log(`changeCurrentDir from ${this.currentDir} to ${targetPath}`);
		
		this.changeCurrentDir(targetPath);
	}
	
	changeCurrentDir(dir){
		if(this.currentDir == dir) return;
		
		this.currentDir = dir;

		let currentFiles = this.narrowFilesToGivenDir(this.files, this.currentDir);
		if(!currentFiles) currentFiles= { files: [], dirs: {} };
		this.winRenderer.renderFiles(currentFiles, this.currentDir);
		/*
		if (await this.os.inputToTerminal(`cd ${this.currentDir}`)) {
			this.render()
		}
		*/
	}
	
	narrowFilesToGivenDir(files, currentDirName){
		let arr = currentDirName.split('/');
		let currDir = files;
		console.log('narrow ', files, currentDirName, arr);
		arr.forEach(part => {
			if(!part) return;
			currDir = currDir && currDir.dirs[part];
		});
		console.log(`narrowFiles -> `, currDir);
		return currDir;
	}

	/*
	renderMenu(menu_height){
		let renderer = this.winRenderer;
		let parent = this.menu_svg;
		this.path_bar = renderer.createSVGElement('text', { x: 1, y: 32+3, fill: 'black', 'alignment-baseline': "hanging" }, parent);
		renderer.createSVGElement('rect', { x: 1, y: 33, width: 298, height: menu_height-2-33, fill: "transparent", stroke: "gray" }, parent)

		this.server_bar = renderer.createSVGElement('text', { x: 300, y: 32+3, fill: 'black', 'alignment-baseline': "hanging" }, parent);
		renderer.createSVGElement('rect', { x: 300, y: 33, width: 298, height: menu_height-2-33, fill: "transparent", stroke: "gray" }, parent)
		this.server_bar.textContent = 'Connected: '+this.currentServer;
	}
	*/

	openFile(fileName){
		//
		const fileHandlers = {
			nano: ['.js', '.ns', '.script'],
			run: ['.exe', '.cct'],
		}

		let command = Object.entries(fileHandlers).find(([, extensions]) => extensions.find((extension) => fileName.endsWith(extension)))?.[0]
		
		if (!command) {
			command = 'cat'
		}
		/*
		if (await this.os.inputToTerminal(`${command} ${fileName}`)) {
			if (command === 'cd') {
				this.currentDirectory += fileName + '/' //`${this.currentDirectory}` + fileName
				this.render()
			} else if (command === 'nano') {
				this.isVisible = false
			}
		}
		//*/
	}
	on_exit(){
	}
}

class FilesExplorerRenderer extends EventListener {
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

	/** @param {OS} os */
	constructor(os, filesExplorer){
		super();
		this.os = os;
		this.debug = os.debug;
		this.filesExplorer = filesExplorer;
		this.doc = globalThis['document'];

		this.animationCallback = this.onAnimationFrame.bind(this);
		this.terminal_visible = false;

		this.os.listen(OS_EVENT.ON_EXIT, this.on_exit.bind(this));
		this.os.listen(OS_EVENT.INIT, this.init.bind(this));

		this.#initialiseWindow()
	}
	
	#initialiseWindow() {
		this.container = this.createWindow(DOM_CONSTANTS.myCustomWindowId)
		this.explorerWindow = this.container.querySelector('.window')
		this.container.style.display = 'none';
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
		element.querySelector('.window__cta-close').addEventListener('click', () => this.terminalVisibility(false))
		element.querySelector('.window__content').addEventListener('dblclick', async () => {
			this.filesExplorer.changeDirectory_oneUp();
			// currentDir = currentDir.replaceAll(/\/+$/g, '')
			// this.currentDirectory = currentDirectory ?
			// 	currentDirectory.substring(0, currentDirectory.lastIndexOf('/') + 1) :
			// 	'/'

			// if (await this.os.inputToTerminal(`cd ${this.currentDirectory}`)) {
			// 	this.render()
			// }
		})
		element.querySelector('.window__toolbar').addEventListener('mousedown', this.#boundBeginGrabbing)
	}

	showWindow() {
		console.log('show window');
	}
	
	createWindow(id) {
		const element = this.createBodyDiv();
		element.id = DOM_CONSTANTS.myCustomWindowId
		element.classList.add('window-container')
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
			<div class="window__content">
				<ul class="file-list file-list--layout-icon-row" />
			</div>
		</div>
		`
		
		this.#addWindowEventListeners(element)
               
		return element
	}
	
	renderFiles(currentFiles, currentDirName){
		console.log('renderFiles ', currentDirName, currentFiles);
		// Update title
		let windowDiv = this.container;
		windowDiv.querySelector('.window__title').textContent = `${this.filesExplorer.currentServer}: ${this.filesExplorer.currentDir}`

		// Update file list
		//windowDiv.querySelector('.file-list').innerHTML = Object.entries(files).map(([name, { isDirectory }]) => `
		windowDiv.querySelector('.file-list').innerHTML = Object.keys(currentFiles.dirs).map((elem) => renderIcons(elem, true)).join('') +
			currentFiles.files.map((elem) => renderIcons(elem, false)).join('');
		
		function renderIcons(name, isDirectory){
			return `<li class="file-list__item">
				<button class="file-list__button" data-file-name="${name}" data-file-type="${isDirectory ? 'directory' : 'file'}">
					${isDirectory ? directorySvg : jsSvg}
					<span class="file-list__label">${name}</span>
				</button>
			</li>`
		}

		// Add icon event listeners
		Array.from(windowDiv.querySelectorAll('.file-list__button')).forEach((button) => {
			button.addEventListener('dblclick', this.fileListedOnClick.bind(this) )
			});
	}
	
	fileListedOnClick(event) {
		let button = event.currentTarget;
		console.log(`btn click ${button.dataset.fileType}  ${button.dataset.fileName}`, button);
		
		event.stopPropagation()
		const isDirectory = button.dataset.fileType === 'directory'
		const fileName = button.dataset.fileName


		if (isDirectory) {
			this.filesExplorer.changeDirectoryTo(fileName);
		} else {
			this.filesExplorer.openFile(fileName);
		}
	}
	
	createSVGElement(tag, attribs, parent, dont_attach){
		let elem = this.doc.createElementNS('http://www.w3.org/2000/svg', tag);
		if(attribs){
			for(let it in attribs){
				elem.setAttributeNS(null, it, attribs[it]);
			}
		}
		if(!dont_attach){
			(parent || this.svg).appendChild(elem);
		}
		return elem;
	}

	init(){
		//this.listenForTerminalHidden();

		/*
		this.svg = this.createSVGElement('svg', {
			width: this.windowWidth+'px',
			height: this.windowHeight+'px',
		}, null, true);
		this.svg.style.position= 'fixed';
		this.svg.style['z-index']= '9999';
		this.svg.style.top= '10%';
		this.svg.style.left= '10%';
		this.svg.style['background-color']= 'rgb(186, 186, 186)';
		globalThis['window'].requestAnimationFrame(this.animationCallback);
		*/
		//this.terminalVisibility(true);
	}

	onAnimationFrame(){
		//this.svg
		//globalThis['window'].requestAnimationFrame(this.animationCallback);
	}

	/*
	listenForTerminalHidden(){
		if(this.observer) return;

		const targetNode = this.doc.getElementById(DOM_CONSTANTS.terminalInputId);
		if(!targetNode) return;

		// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe
		const callback = function(mutationsList, observer) {
			let terminal_removed = false;
			let terminal_added = false;
			for(const mutation of mutationsList) {
				if (mutation.type === 'childList') {
					mutation.removedNodes.forEach(elem => {
						if(elem.classList && elem.classList.contains('MuiBox-root'))
							terminal_removed = true;
					});
					mutation.addedNodes.forEach(elem => {
						if(elem.classList && elem.classList.contains('MuiBox-root')){
							let res = !!elem.querySelector('#'+DOM_CONSTANTS.terminalInputId);
							if(res)
								terminal_added = true;
						}
					});
				}
			}
			//if(terminal_removed){
			//	this.terminalVisibility(false);
			//}else if(terminal_added){
			//	this.terminalVisibility(true);
			//}
		};

		this.observer = new MutationObserver(callback.bind(this));
		let target = targetNode.parentNode.parentNode.parentNode.parentNode;
		this.observer.observe(target, { childList: true });
		this.debug.print('added observer');
	}
	*/
	
	createBodyDiv(){
		let div = this.doc.createElement('div');
		this.doc.body.appendChild(div);
		return div;
	}
	
	/** @param {boolean} visible */
	terminalVisibilityToggle(visible){
		this.terminalVisibility(!this.terminal_visible);
	}

	terminalVisibility(visible){
		if(visible != this.terminal_visible){
			this.terminal_visible = visible;


			if(this.terminal_visible) this.fire(FilesExplorerRenderer_EVENT.SHOW);
			/*
			if(this.terminal_visible){
				if(this.svg) this.doc.body.appendChild(this.svg);
				
				//this.listenForTerminalHidden();
			}else if(this.svg && this.svg.parentNode){
				this.svg.parentNode.removeChild(this.svg);
			}
			*/
			
			if (this.container) {
				if(this.terminal_visible){
					this.container.style.display = ''
					this.#initialiseWindowPosition()
				}else{
					this.container.style.display = 'none'
				}
			}
		}
	}

	on_exit(){
		this.terminalVisibility(false);
		if(this.observer) this.observer.disconnect();
		if (this.container) {
			this.container.remove()
		}
		Object.keys(this).forEach(key => this[key] = null);
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
