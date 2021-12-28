import { DOM_CONSTANTS } from '/os/constants.js'
import { EventListener, OS_EVENT, WindowWidget_EVENT } from '/os/event_listener.js'
import { WindowWidget } from '/os/window_widget.js'
import { Utils } from '/os/utils.js'
import { Logger } from '/os/logger.js'

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

		this.#isRendered = false;

		this.#os.listen(OS_EVENT.INIT, this.init.bind(this));
		this.#winRenderer.listen(WindowWidget_EVENT.SHOW, this.onRenderVisible.bind(this));
		this.#os.listen(OS_EVENT.ON_EXIT, this.#on_exit.bind(this));
	}

	init() {
		this.injectFileExplorerButton();
	}

	injectFileExplorerButton() {
		let fileExplorer_newPath = '<path d="M17.927,5.828h-4.41l-1.929-1.961c-0.078-0.079-0.186-0.125-0.297-0.125H4.159c-0.229,0-0.417,0.188-0.417,0.417v1.669H2.073c-0.229,0-0.417,0.188-0.417,0.417v9.596c0,0.229,0.188,0.417,0.417,0.417h15.854c0.229,0,0.417-0.188,0.417-0.417V6.245C18.344,6.016,18.156,5.828,17.927,5.828 M4.577,4.577h6.539l1.231,1.251h-7.77V4.577z M17.51,15.424H2.491V6.663H17.51V15.424z">'

		this.#os.gui.addMenuButton({
			btnLabel: 'Network Explorer',
			btnId: DOM_CONSTANTS.fileExplorerBtnId,
			callback: () => this.#winRenderer.windowVisibilityToggle(),
			btnIconPath: fileExplorer_newPath,
			btnIconViewBox: 'viewBox="0 2 18 17"',
		});
	}

	onRenderVisible() {
		if (this.#isRendered) return;
		this.#isRendered = true;
		this.render()
	}

	render() {
		this.#winRenderer.renderServers();
	}

	async svConnect(svName) {
		let command = 'home'
		this.#os.terminal.inputToTerminal(`${command}`);
		await Utils.sleep(250);
		command = 'run /os/plugins/servers_explorer/connect.js'
		this.#os.terminal.inputToTerminal(`${command} ${svName}`);
		this.#winRenderer.hide();
	}

	async svBackdoor(svName) {
		let command = 'home'
		this.#os.terminal.inputToTerminal(`${command}`);
		await Utils.sleep(250);
		command = 'run /os/plugins/servers_explorer/connect.js '
		this.#os.terminal.inputToTerminal(`${command}` + svName);
		await Utils.sleep(250);
		command = 'backdoor'
		this.#os.terminal.inputToTerminal(`${command}`);
		this.#winRenderer.hide();
	}
	async svHack(svName) {
		let command = 'home'
		this.#os.terminal.inputToTerminal(`${command}`);
		await Utils.sleep(250);
		command = 'run /os/plugins/servers_explorer/connect.js '
		this.#os.terminal.inputToTerminal(`${command}` + svName);
		await Utils.sleep(250);
		command = 'run NUKE.exe'
		this.#os.terminal.inputToTerminal(`${command}`);
		this.#winRenderer.hide();
	}

	#on_exit() {
	}

	#os
	#winRenderer
	#isRendered
}

class ServersExplorerRenderer extends EventListener {
	/** @param {import('/os/os.js').OS} os, @param {ServersExplorer} serversExplorer */
	constructor(os, serversExplorer) {
		super();
		this.#os = os;
		this.#log = new Logger(this, os.logRenderer);
		this.eventListener_initLog(this.#log);
		this.#serversExplorer = serversExplorer;

		this.#windowWidget = new WindowWidget(this, os, DOM_CONSTANTS.myCustomWindowId);

		this.#os.listen(OS_EVENT.ON_EXIT, this.#on_exit.bind(this));
		this.#os.listen(OS_EVENT.INIT, this.#init.bind(this));
	}

	/** @return {String} */
	get title() {
		return `Network Explorer`
	}

	async renderServers() {
		this.#windowWidget.setTitle(this.title)
		let windowDiv = this.#windowWidget.getContainer()
		const fileList = windowDiv.querySelector('.server-list')

		let result = [];
		let visited = { 'home': 0 };
		let queue = Object.keys(visited);
		let name;
		let svObj = (name = 'home', depth = 0) => ({ name: name, depth: depth });
		var scanRes;
		var svNames = [];
		var svRoot = [];
		while ((name = queue.pop())) {
			svNames.push(name);
			svRoot.push(name);
			let rooty = await this.#os.getNS((ns) => {
				return ns.hasRootAccess(name)
			});
			let backy = await this.#os.getNS((ns) => {
				return ns.getServer(name).backdoorInstalled
			});
			fileList.innerHTML = svRoot.map((elem) => this.#renderIcon(elem, rooty, backy)).join('');
			let depth = visited[name];
			result.push(svObj(name, depth));
			scanRes = await this.#os.getNS((ns) => {
				return ns.scan(name)
			});
			for (let i = scanRes.length; i >= 0; i--) {
				if (visited[scanRes[i]] === undefined) {
					queue.push(scanRes[i]);
					visited[scanRes[i]] = depth + 1;
				}
			}
		}

		// svNames.sort();
		// var homeIndex = svNames.indexOf("home");
		// svNames.splice(homeIndex,1);
		// svNames.unshift("home")

		Array.from(windowDiv.querySelectorAll('.server-connect__button')).forEach((button) => {
			button.addEventListener('dblclick', this.svConnectOnClick.bind(this))
		});
		Array.from(windowDiv.querySelectorAll('.server-run__backdoor')).forEach((button) => {
			button.addEventListener('dblclick', this.svBackdoorOnClick.bind(this))
		});
		Array.from(windowDiv.querySelectorAll('.server-run__status')).forEach((button) => {
			button.addEventListener('dblclick', this.svHackOnClick.bind(this))
		});
	}


	async rootCheck(svName) {
		var checkRoot = await this.#os.getNS((ns) => {
				return ns.hasRootAccess(svName)
			});
		return checkRoot;
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
		let backdoorSVG = 'doorOpen';
		let statusSVG = 'check';
		if (facServers.includes(name)) {
			type = 'firewall'
			if (["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"].includes(name)) systemColor = "server-connect__button_gold";
			if (name == "The-Cave") systemColor = "server-connect__button_orange";
			if (name == "w0r1d_d43m0n") systemColor = "server-connect__button_red";
		}
		if (name == "home") {
			type = 'networkPC'
		}
		if (name == "n00dles") {
			type = 'noodles'
		}
		if (svhacked) {
			rootStatus = "green";
		}
		if (svbackdoored) {
			backdoorStatus = "green";
		}
		return `
			<li class="server-list__item">
			<center>
			<table>
				<tr>
					<td>
						<button class="server-run__backdoor" style="color:${backdoorStatus}" data-file-name="${name}">
					${server_icons[backdoorSVG]}
						</button>
					</td>
					<td>
						<button class="server-run__scripts" data-file-name="${name}">
							${server_icons['ihack']}
						</button>
					</td>
					<td>
						<button class="server-run__status" style="color:${rootStatus}" data-file-name="${name}">
					${server_icons[statusSVG]}
						</button>
					</td>
				</tr>
			</table>
			</center>
			<button class="${systemColor}" data-file-name="${name}" data-file-type="${type}">
					${server_icons[type]}
				<span class="server-list__label">${name}</span>
				</button>
				</div>
			</li>
		`
	}

	svConnectOnClick(event) {
		let button = event.currentTarget;

		event.stopPropagation()
		const fileName = button.dataset.fileName

		this.#serversExplorer.svConnect(fileName)
	}

	svBackdoorOnClick(event) {
		let button = event.currentTarget;

		event.stopPropagation()
		const fileName = button.dataset.fileName

		this.#serversExplorer.svBackdoor(fileName)

	}

	svHackOnClick(event) {
		let button = event.currentTarget;

		event.stopPropagation()
		const fileName = button.dataset.fileName

		this.#serversExplorer.svHack(fileName)
	}

	hide() {
		this.#windowWidget.hide();
	}

	windowVisibilityToggle() {
		this.#windowWidget.windowVisibilityToggle();
	}

	onWindowClose() {
		this.#os.closeAndExit();
	}


	// private

	#os
	#log
	#serversExplorer
	#windowWidget

	#init() {
		this.#os.gui.injectCSS(servers_explorer_css);

		this.#windowWidget.init();
		this.#windowWidget.getContentDiv().innerHTML = '<ul class="server-list server-list--layout-icon-row" />';
		//this.#windowWidget.addMenuItem({ label: 'Debug', callback: this.onDebugMenuClick.bind(this) })
	}

	#on_exit() {
		Object.keys(this).forEach(key => this[key] = null);
	}
}

const servers_explorer_css = `
.server-list {
	align-content: flex-start;
	display: flex;
	flex-wrap: wrap;
	list-style: none;
	margin: 0;
	height: 40em;
	width: 100em;
	padding: 0;
}
.server-list__item {
	margin-bottom: 8px;
	text-align: center;
	width: 100px;
}
.server-list__icon {
	height: 20px;
	width: 20px;
}

.server-list__label {
	color: #222;
	text-shadow: none;
	word-wrap: anywhere;
}

.server-connect__button {
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
.server-connect__button_gold {
	align-items: center;
	fill: gold;
	color: gold;
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
.server-connect__button_orange {
	align-items: center;
	fill: orange;
	color: orange;
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
.server-connect__button_red {
	align-items: center;
	fill: red;
	color: red;
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
.server-list__bs_center {
	margin-left:-10px;
  	marin-right:-10px;
	text-align:center;
    display: flex;
	flex-direction: row;
    align-items: center;
    justify-content: center;
}
.server-run__backdoor {
	align-items: center;
	appearance: none;
	fill: red;
	color: red;
	border: 1px dotted transparent;
	border-radius: 2px;
	background: none;
	display: flex;
	flex-direction: column;
	margin: 0;
	padding: 2px;
	width: 100%;
	height: 100%;
}
.server-run__backdoor_complete {
	align-items: center;
	appearance: none;
	fill: green;
	color: green;
	border: 1px dotted transparent;
	border-radius: 2px;
	background: none;
	display: flex;
	flex-direction: column;
	margin: 0;
	padding: 2px;
	width: 100%;
	height: 100%;
}
.server-run__scripts {
	align-items: center;
	appearance: none;
	border: 1px dotted transparent;
	border-radius: 2px;
	background: none;
	display: flex;
	flex-direction: column;
	margin: 0;
	padding: 2px;
	width: 100%;
	height: 100%;
}
.server-run__status {
	align-items: center;
	appearance: none;
	fill: red;
	color: red;
	border: 1px dotted transparent;
	border-radius: 2px;
	background: none;
	display: flex;
	flex-direction: column;
	margin: 0;
	padding: 2px;
	width: 100%;
	height: 100%;
}
.server-run__status_rooted {
	align-items: center;
	appearance: none;
	fill: green;
	color: green;
	border: 1px dotted transparent;
	border-radius: 2px;
	background: none;
	display: flex;
	flex-direction: column;
	margin: 0;
	padding: 2px;
	width: 100%;
	height: 100%;
}
.server-connect__button:focus {
	background: rgba(15, 75, 255, .3);
	border-color: #222;
}
.server-run__scripts:focus {
	background: rgba(15, 75, 255, .3);
	border-color: #222;
}
.server-run__status:focus {
	background: rgba(15, 75, 255, .3);
	border-color: #222;
}
.server-run__backdoor:focus {
	background: rgba(15, 75, 255, .3);
	border-color: #222;
}`;

/*
dstar: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-labelledby="title"
aria-describedby="desc" role="img" xmlns:xlink="http://www.w3.org/1999/xlink">
  <title>Classic Computer</title>
  <desc>A line styled icon from Orion Icon Library.</desc>
  <path data-name="layer2"
  fill="none" stroke="#202020" stroke-linecap="round" stroke-linejoin="round"
  stroke-width="2" d="M6 44h52m0 18H6V2h52v60zm-8-10H38"></path>
  <rect data-name="layer1" x="14" y="10" width="36" height="26" rx="2"
  ry="2" fill="none" stroke="#202020" stroke-linecap="round" stroke-linejoin="round"
  stroke-width="2"></rect>
</svg>
	`,
 */

const server_icons = {
	networkPC: `
		<svg class="svg-icon" viewBox="0 0 20 20">
			<path d="M17.237,3.056H2.93c-0.694,0-1.263,0.568-1.263,1.263v8.837c0,0.694,0.568,1.263,1.263,1.263h4.629v0.879c-0.015,0.086-0.183,0.306-0.273,0.423c-0.223,0.293-0.455,0.592-0.293,0.92c0.07,0.139,0.226,0.303,0.577,0.303h4.819c0.208,0,0.696,0,0.862-0.379c0.162-0.37-0.124-0.682-0.374-0.955c-0.089-0.097-0.231-0.252-0.268-0.328v-0.862h4.629c0.694,0,1.263-0.568,1.263-1.263V4.319C18.5,3.625,17.932,3.056,17.237,3.056 M8.053,16.102C8.232,15.862,8.4,15.597,8.4,15.309v-0.89h3.366v0.89c0,0.303,0.211,0.562,0.419,0.793H8.053z M17.658,13.156c0,0.228-0.193,0.421-0.421,0.421H2.93c-0.228,0-0.421-0.193-0.421-0.421v-1.263h15.149V13.156z M17.658,11.052H2.509V4.319c0-0.228,0.193-0.421,0.421-0.421h14.308c0.228,0,0.421,0.193,0.421,0.421V11.052z"></path>
		</svg>
	`,
	firewall: `
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 512.023 512.023" style="enable-background:new 0 0 512.023 512.023;" xml:space="preserve">
		<path d="M465.773,266.105c-1.707-1.707-5.12-2.56-8.533-1.707c-3.413,0.853-5.973,3.413-5.973,6.827
			c-1.707,13.653-5.973,26.453-10.24,37.547c-5.886-55.18-26.348-89.403-32.427-98.888v-65.805V75.811v-51.2
			c0-14.507-11.093-25.6-25.6-25.6H263.533H92.867H24.6C10.093-0.989-1,10.105-1,24.611v51.2v68.267v68.267v68.267v68.267v51.2
			c0,14.507,11.093,25.6,25.6,25.6h119.467h133.981c5.105,15.926,13.371,30.798,24.739,43.52
			c23.04,26.453,57.173,41.813,93.013,41.813c35.84,0,69.12-14.507,92.16-40.96C532.333,421.411,505.88,307.065,465.773,266.105z
			 M144.067,340.345H101.4v-51.2h42.667H255v51.2H144.067z M16.067,340.345v-51.2h68.267v51.2H16.067z M92.867,84.345h42.667v51.2
			H92.867h-76.8v-51.2H92.867z M263.533,84.345H306.2v51.2h-42.667H152.6v-51.2H263.533z M391.533,84.345v51.2h-68.267v-51.2
			H391.533z M92.867,272.078h-76.8v-51.2h76.8h42.667v51.2H92.867z M16.067,152.611h68.267v51.2H16.067V152.611z M144.067,152.611
			H255v51.2H144.067H101.4v-51.2H144.067z M314.733,152.611h76.8v51.2h-76.8h-42.667v-51.2H314.733z M152.6,220.878h110.933H306.2
			v51.2h-42.667H152.6V220.878z M323.267,272.078v-51.2h53.379c-15.822,15.496-28.323,32.636-37.533,51.2H323.267z M297.667,314.745
			c-2.56,0-5.973,1.707-6.827,1.707c-1.707,3.413-4.267,7.68-5.973,11.947l-1.707,3.413c-0.492,1.477-0.985,2.949-1.477,4.263
			c-0.257,0.636-0.527,1.269-0.773,1.908c-0.103,0.23-0.206,0.45-0.309,0.656h-8.533v-49.493h42.667h16.437
			c-2.344,6.384-4.63,13.361-6.197,19.627v1.707c-1.707,5.12-5.12,29.867-5.12,36.693c0,3.413,0,5.973,0,9.387
			c-1.707-3.413-4.267-7.68-5.973-11.947c-0.359-0.717-0.717-1.479-1.076-2.264c-2.885-6.754-5.565-14.059-7.457-21.629
			c-0.853-3.413-3.413-5.12-6.827-5.973H297.667z M391.533,24.611v42.667h-76.8h-42.667v-51.2H383
			C388.12,16.078,391.533,19.491,391.533,24.611z M255,67.278H144.067H101.4v-51.2H255V67.278z M16.067,24.611
			c0-5.12,3.413-8.533,8.533-8.533h59.733v51.2H16.067V24.611z M16.067,400.078v-42.667h76.8h42.667v51.2H24.6
			C19.48,408.611,16.067,405.198,16.067,400.078z M152.6,408.611v-51.2h110.933h11.523c-3.747,17.006-4.104,34.448-1.192,51.2H152.6
			z M475.16,459.811c-20.48,22.187-48.64,34.987-79.36,34.987h-0.853c-29.867-0.853-58.88-13.653-79.36-36.693
			c-10.322-11.987-17.641-25.796-21.936-40.457c0.148-1.021,0.089-2.042-0.251-3.063c-5.062-20.25-5.108-42.165,1.491-62.452
			c0.083-0.227,0.157-0.457,0.216-0.693c0-0.001,0-0.001,0.001-0.002v0l0,0c0.683-1.366,0.825-2.731,1.29-4.097
			c11.034,25.933,25.208,45.124,28.577,50.177c1.707,2.56,5.12,4.267,8.533,3.413c2.544-0.509,4.474-2.235,5.624-4.446
			c1.645-1.798,2.541-4.222,2.056-6.647c-2.56-13.653-3.413-27.307-2.56-40.96c0-5.12,3.413-29.013,4.267-33.28v-0.853
			c2.189-8.755,5.007-17.506,8.443-25.728c10.105-23.348,25.801-44.402,47.023-63.018c8.533,16.213,27.307,56.32,27.307,115.2
			c0,4.267,2.56,7.68,5.973,8.533c3.413,0.853,7.68,0,9.387-3.413c0-0.853,15.36-23.893,23.04-52.907
			C492.227,336.931,507.587,423.118,475.16,459.811z"/>
	`,
	server: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-labelledby="title"
aria-describedby="desc" role="img" xmlns:xlink="http://www.w3.org/1999/xlink">
  <title>Server</title>
  <desc>A line styled icon from Orion Icon Library.</desc>
  <rect data-name="layer2"
  x="2" y="14" width="60" height="48" rx="2" ry="2" fill="none" stroke="#202020"
  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></rect>
  <path data-name="layer2" d="M2.4 14.8L7.4 4A3 3 0 0 1 10 2h44a2.9 2.9 0 0 1 2.5 2l5.2 10.8"
  fill="none" stroke="#202020" stroke-linecap="round" stroke-linejoin="round"
  stroke-width="2"></path>
  <path data-name="layer1" fill="none" stroke="#202020" stroke-linecap="round"
  stroke-linejoin="round" stroke-width="2" d="M54 54H34"></path>
  <path data-name="layer2" fill="none" stroke="#202020" stroke-linecap="round"
  stroke-linejoin="round" stroke-width="2" d="M2 46h60"></path>
  <path data-name="layer1" fill="none" stroke="#202020" stroke-linecap="round"
  stroke-linejoin="round" stroke-width="2" d="M54 38H34m20-16H34"></path>
  <path data-name="layer2" fill="none" stroke="#202020" stroke-linecap="round"
  stroke-linejoin="round" stroke-width="2" d="M2 30h60"></path>
  <circle data-name="layer1" cx="11" cy="22" r="2" fill="none" stroke="#202020"
  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></circle>
  <circle data-name="layer1" cx="11" cy="38" r="2" fill="none"
  stroke="#202020" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></circle>
  <circle data-name="layer1" cx="11" cy="54" r="2" fill="none"
  stroke="#202020" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></circle>
</svg>
	`,
	noodles: `
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-labelledby="title"
aria-describedby="desc" role="img" xmlns:xlink="http://www.w3.org/1999/xlink">
  <title>Asian Cuisine</title>
  <desc>A line styled icon from Orion Icon Library.</desc>
  <path data-name="layer2"
  fill="none" stroke="#202020" stroke-linecap="round" stroke-linejoin="round"
  stroke-width="2" d="M46 2L32.1 30M58 10L40 30M22 62h20"></path>
  <path data-name="layer1" d="M2.1 30a30 30 0 0 0 59.8 0z" fill="none"
  stroke="#202020" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
	`,
	check: `
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
			<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
			<path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
		</svg>
	`,
	doorClosed: `
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-door-closed" viewBox="0 0 16 16">
			<path d="M3 2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v13h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V2zm1 13h8V2H4v13z"/>
			<path d="M9 9a1 1 0 1 0 2 0 1 1 0 0 0-2 0z"/>
		</svg>
	`,
	doorOpen: `
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-door-open" viewBox="0 0 16 16">
			<path d="M8.5 10c-.276 0-.5-.448-.5-1s.224-1 .5-1 .5.448.5 1-.224 1-.5 1z"/>
			<path d="M10.828.122A.5.5 0 0 1 11 .5V1h.5A1.5 1.5 0 0 1 13 2.5V15h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V1.5a.5.5 0 0 1 .43-.495l7-1a.5.5 0 0 1 .398.117zM11.5 2H11v13h1V2.5a.5.5 0 0 0-.5-.5zM4 1.934V15h6V1.077l-6 .857z"/>
		</svg>
	`,
	ihack: `
	<svg width="32px" height="32px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M 15.998047 3 C 14.225047 3 5.5352031 7.9839062 4.6582031 9.5039062 C 3.7802031 11.024906 3.7802031 20.983047 4.6582031 22.498047 C 5.5392031 24.017047 14.229047 29 15.998047 29 C 17.762047 29 26.451938 24.019953 27.335938 22.501953 C 28.222938 20.979953 28.222938 11.014047 27.335938 9.4980469 L 27.335938 9.4960938 C 26.444937 7.9790937 17.756047 3 15.998047 3 z M 15.996094 5.0117188 C 17.693094 5.3647187 24.417703 9.2167656 25.595703 10.509766 C 26.135703 12.150766 26.134703 19.844281 25.595703 21.488281 C 24.425703 22.779281 17.695094 26.636281 15.996094 26.988281 C 14.298094 26.638281 7.5723906 22.783234 6.4003906 21.490234 C 5.8653906 19.842234 5.8653906 12.155766 6.4003906 10.509766 C 7.5693906 9.2167656 14.297094 5.3617187 15.996094 5.0117188 z M 13 9 L 11 11 L 12 11 L 12 21 L 14 21 L 14 17 L 18 17 L 18 21 L 17 21 L 19 23 L 21 21 L 20 21 L 20 12 L 18 12 L 18 15 L 14 15 L 14 11 L 15 11 L 13 9 z"/></svg>
	`,

	/*
	 * unused
	droid: `
		<svg class="svg-icon" viewBox="0 0 20 20">
			<path fill="none" d="M18.21,16.157v-8.21c0-0.756-0.613-1.368-1.368-1.368h-1.368v1.368v1.368v6.841l-1.368,3.421h5.473L18.21,16.157z"></path>
			<path fill="none" d="M4.527,9.316V7.948V6.579H3.159c-0.756,0-1.368,0.613-1.368,1.368v8.21l-1.368,3.421h5.473l-1.368-3.421V9.316z"></path>
			<path fill="none" d="M14.766,5.895h0.023V5.21c0-2.644-2.145-4.788-4.789-4.788S5.211,2.566,5.211,5.21v0.685h0.023H14.766zM12.737,3.843c0.378,0,0.684,0.307,0.684,0.684s-0.306,0.684-0.684,0.684c-0.378,0-0.684-0.307-0.684-0.684S12.358,3.843,12.737,3.843z M10,1.448c0.755,0,1.368,0.613,1.368,1.368S10.755,4.185,10,4.185c-0.756,0-1.368-0.613-1.368-1.368S9.244,1.448,10,1.448z"></path>
			<path fill="none" d="M14.789,6.579H5.211v9.578l1.368,1.368h6.841l1.368-1.368V6.579z M12.052,12.052H7.948c-0.378,0-0.684-0.306-0.684-0.684c0-0.378,0.306-0.684,0.684-0.684h4.105c0.378,0,0.684,0.306,0.684,0.684C12.737,11.746,12.431,12.052,12.052,12.052z M12.052,9.316H7.948c-0.378,0-0.684-0.307-0.684-0.684s0.306-0.684,0.684-0.684h4.105c0.378,0,0.684,0.307,0.684,0.684S12.431,9.316,12.052,9.316z"></path>
		</svg>
	`,
	xmark: `
		<svg class="svg-icon" viewBox="0 0 20 20">
								<path d="M10.185,1.417c-4.741,0-8.583,3.842-8.583,8.583c0,4.74,3.842,8.582,8.583,8.582S18.768,14.74,18.768,10C18.768,5.259,14.926,1.417,10.185,1.417 M10.185,17.68c-4.235,0-7.679-3.445-7.679-7.68c0-4.235,3.444-7.679,7.679-7.679S17.864,5.765,17.864,10C17.864,14.234,14.42,17.68,10.185,17.68 M10.824,10l2.842-2.844c0.178-0.176,0.178-0.46,0-0.637c-0.177-0.178-0.461-0.178-0.637,0l-2.844,2.841L7.341,6.52c-0.176-0.178-0.46-0.178-0.637,0c-0.178,0.176-0.178,0.461,0,0.637L9.546,10l-2.841,2.844c-0.178,0.176-0.178,0.461,0,0.637c0.178,0.178,0.459,0.178,0.637,0l2.844-2.841l2.844,2.841c0.178,0.178,0.459,0.178,0.637,0c0.178-0.176,0.178-0.461,0-0.637L10.824,10z"></path>
							</svg>
		`,

	*/
};