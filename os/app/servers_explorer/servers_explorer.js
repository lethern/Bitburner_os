import { EventListener, OS_EVENT, WindowWidget_EVENT } from '/os/event_listener.js'
import { WindowWidget } from '/os/window_widget.js'
import { Utils } from '/os/utils.js'
import { Logger } from '/os/logger.js'
import { servers_explorer_css, server_icons } from '/os/app/servers_explorer/servers_explorer_css.js'

// |-----------------------------------------------------------------------|
// |				servers_explorer.js
// |			Created by: TheDroidUrLookingFor
// |
// |	Github: https://github.com/TheDroidYourLookingFor/BitBurner-Scripts
// |
// |      Last Modified by: TheDroidUrLookingFor
// |
// |		Version:	1.0.3
// |
// | Information: Currently you can only connect, backdoor, or NUKE targets.
// |	More features will be added in future versions.
// |
// |-----------------------------------------------------------------------|

export class ServersExplorer {
	/** @param {import('/os/os.js').OS} os */
	constructor(os) {
		this.#os = os;

		this.#winRenderer = new ServersExplorerRenderer(os, this);

		this.#os.listen(OS_EVENT.INIT, () => this.#init());
		this.#os.listen(OS_EVENT.ON_EXIT, () => this.#on_exit());
	}

	async loop() {
		if (this.#isRendered) return;
		this.#isRendered = true;

		while (this.#isRendered) {
			let serverObjs = await this.#getServers();
			this.#winRenderer.renderServers(serverObjs);
			await Utils.sleep(5000);
		}
	}

	async svConnect(serverName) {

		if (this.#os.serversManager.connectedServer == serverName) return;

		let command = 'home'
		this.#os.terminal.inputToTerminal(`${command}`);
		await Utils.sleep(250);

		let serversObj = this.#os.serversManager.serversObj;
		let stack = [];
		let serverTarget = serversObj[serverName];
		let watchdog = 0;

		while (serverName != 'home') {
			stack.push(`connect ${serverName}`);

			serverName = serverTarget.parent;
			serverTarget = serversObj[serverName];
			if (watchdog++ > 100) throw "svConnect watchdog";
		}
		stack.reverse();

		this.#os.terminal.inputToTerminal(`${stack.join('; ')}`);
		//command = 'run /os/app/servers_explorer/connect.js'
		//this.#os.terminal.inputToTerminal(`${command} ${svName}`);
		//this.#winRenderer.hide();
	}

	async svBackdoor(svName) {
		await this.svConnect(svName)
		await Utils.sleep(250);
		this.#os.terminal.inputToTerminal('backdoor');
	}

	async svHack(svName) {
		await this.svConnect(svName)
		await Utils.sleep(250);
		this.#os.terminal.inputToTerminal('run BruteSSH.exe;run FTPCrack.exe;run HTTPWorm.exe;run SQLInject.exe;run relaySMTP.exe;run NUKE.exe');
	}

	/** @returns {Promise<{name: string, rooty: boolean, backy: boolean}[]>} */
	async #getServers() {
		return this.#os.serversManager.serversObjFull
			.map(serverObj => ({
				name: serverObj.hostname,
				rooty: serverObj.hasAdminRights,
				backy: serverObj.backdoorInstalled,
			}))
			.sort((a, b) => a.name.localeCompare(b.name))
	}

	// private

	#os
	#winRenderer
	#isRendered = false

	#init() {
		this.#injectMenuButton();
	}

	#injectMenuButton() {
		let btn_newPath = '<path d="M17.927,5.828h-4.41l-1.929-1.961c-0.078-0.079-0.186-0.125-0.297-0.125H4.159c-0.229,0-0.417,0.188-0.417,0.417v1.669H2.073c-0.229,0-0.417,0.188-0.417,0.417v9.596c0,0.229,0.188,0.417,0.417,0.417h15.854c0.229,0,0.417-0.188,0.417-0.417V6.245C18.344,6.016,18.156,5.828,17.927,5.828 M4.577,4.577h6.539l1.231,1.251h-7.77V4.577z M17.51,15.424H2.491V6.663H17.51V15.424z">'

		this.#os.gui.addMenuButton({
			btnLabel: 'Network Explorer',
			callback: () => this.#winRenderer.windowVisibilityToggle(),
			btnIconPath: btn_newPath,
			btnIconViewBox: 'viewBox="0 2 18 17"',
		});
	}

	#on_exit() {
		this.#isRendered = false;
	}
}

class ServersExplorerRenderer extends EventListener {
	/** @param {import('/os/os.js').OS} os, @param {ServersExplorer} serversExplorer */
	constructor(os, serversExplorer) {
		super();
		this.#os = os;
		this.#serversExplorer = serversExplorer;

		this.#log = new Logger(this, os.logRenderer);
		this.eventListener_initLog(this.#log);

		this.#windowWidget = new WindowWidget(this, os);
		this.#windowWidget.listen(WindowWidget_EVENT.SHOW, () => this.#onShow());

		this.#os.listen(OS_EVENT.ON_EXIT, () => this.#on_exit());
		this.#os.listen(OS_EVENT.INIT, () => this.#init());
	}

	/** @return {String} */
	get title() {
		return `Network Explorer`
	}

	/** @param {{name: string, rooty: boolean, backy: boolean}[]} serverObjs */
	renderServers(serverObjs) {
		if (!this.#windowWidget.isVisible) return;
		
		let windowDiv = this.#windowWidget.getContainer()
		serverObjs.unshift({
			name: 'home',
			rooty: true,
			backy: true,
		});

		const serverList = windowDiv.querySelector('.server-list')
		serverList.innerHTML = serverObjs.map(({ name, rooty, backy }) => this.#renderIcon(name, rooty, backy)).join('');

		Array.from(windowDiv.querySelectorAll('.server-connect__button')).forEach((button) => {
			button.addEventListener('dblclick', (event) => this.svConnectOnClick(event))
		});
		Array.from(windowDiv.querySelectorAll('.server-run__backdoor')).forEach((button) => {
			button.addEventListener('dblclick', (event) => this.svBackdoorOnClick(event))
		});
		Array.from(windowDiv.querySelectorAll('.server-run__status')).forEach((button) => {
			button.addEventListener('dblclick', (event) => this.svHackOnClick(event))
		});
	}

	/*
	async rootCheck(svName) {
		var checkRoot = await this.#os.getNS((ns) => {
				return ns.hasRootAccess(svName)
			});
		return checkRoot;
	}
	*/

	svConnectOnClick(event) {
		let button = event.currentTarget;

		event.stopPropagation()
		const serverName = button.dataset.serverName

		this.#serversExplorer.svConnect(serverName)
	}

	svBackdoorOnClick(event) {
		let button = event.currentTarget;

		event.stopPropagation()
		const serverName = button.dataset.serverName

		this.#serversExplorer.svBackdoor(serverName)

	}

	svHackOnClick(event) {
		let button = event.currentTarget;

		event.stopPropagation()
		const serverName = button.dataset.serverName

		this.#serversExplorer.svHack(serverName)
	}

	hide() {
		this.#windowWidget.hide();
	}

	windowVisibilityToggle() {
		this.#windowWidget.windowVisibilityToggle();
	}

	// private

	#os
	#log
	#serversExplorer
	#windowWidget
	#aboutWindow

	#init() {
		this.#os.gui.injectCSS(servers_explorer_css, 'servers_explorer_css');

		this.#windowWidget.init();
		this.#windowWidget.getContentDiv().innerHTML = '<ul class="server-list server-list--layout-icon-row" />';
		this.#windowWidget.getContentDiv().classList.add('whiteScrollbar')
		this.#windowWidget.addMenuItem({ label: 'About', callback: () => this.#onAboutMenuClick() })
	}

	#onAboutMenuClick() {
		if (!this.#aboutWindow) {
			this.#aboutWindow = this.#os.gui.createAboutWindow({
				'Name': 'Servers Explorer',
				'Main author': 'TheDroidUrLookingFor#4655',
				'Contributor': 'lethern',
			});
		}
		this.#aboutWindow.show()
	}

	#onShow() {
		// We allow no-await on async
		this.#windowWidget.setTitle(this.title)
		this.#serversExplorer.loop();
	}

	#renderIcon(name, svhacked, svbackdoored) {
		let facServers = [
			"CSEC",
			"avmnite-02h",
			"I.I.I.I",
			"run4theh111z",
			"The-Cave",
			"w0r1d_d43m0n"
		];

		let type = 'server'
		var systemColor = "server-connect__button";
		let rootStatus = "red";
		let backdoorStatus = "red";
		let backdoorSVG = 'doorClosed';
		let statusSVG = 'xmark';
		let canHack = 'black';
		if (facServers.includes(name)) {
			type = 'firewall'
			if (["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"].includes(name)) systemColor += " gold";
			if (name == "The-Cave") systemColor += " darkorange";
			if (name == "w0r1d_d43m0n") systemColor += " red";
		}
		if (name == "home") {
			type = 'networkPC'
		}
		if (name == "n00dles") {
			type = 'noodles'
		}
		if (svhacked) {
			rootStatus = "green";
			statusSVG = 'check';
		}
		if (svbackdoored) {
			backdoorStatus = "green";
			backdoorSVG = 'doorOpen';
		}
		return `
			<li class="server-list__item">
			<div class="server-list__item-title">
				<button class="server-run__backdoor" style="color:${backdoorStatus}" data-server-name="${name}">
					${server_icons[backdoorSVG]}
				</button>
				<button class="server-run__scripts" data-server-name="${name}">
					${server_icons['ihack']}
				</button>
				<button class="server-run__status" style="color:${rootStatus}" data-server-name="${name}">
					${server_icons[statusSVG]}
				</button>
			</div>
			<button class="${systemColor}" data-server-name="${name}" data-server-type="${type}">
					${server_icons[type]}
				<div class="server-list__label">${name}</div>
				</button>
				</div>
			</li>
		`
	}

	#on_exit() {
	}
}