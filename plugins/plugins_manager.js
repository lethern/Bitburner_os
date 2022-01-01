import { runPlugin } from '/os/plugins/plugins_utils.js'
import { WindowWidget } from '/os/window_widget.js'
import { OS_EVENT, WindowWidget_EVENT } from '/os/event_listener.js'
import { Logger } from '/os/logger.js'

/** @typedef {{path: string, pluginDir: string, pluginFile: string, pluginExtension: string}} PluginLsFile  */
/** @typedef {{result?: any, error?: any, time_diff?: number}} PluginExecution */
/** @typedef {{script?: string, configFile?, error, config?, executions: PluginExecution[]}} PluginData  */

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
	/** @type {Object.<string, PluginData>}  */
	#pluginsMap

	#init() {
		this.#injectMenuButton();

		this.#os.gui.injectCSS(plugins_manager_css);

		this.#windowWidget.init();
		this.#windowWidget.getContentDiv().innerHTML = '<div class="plugins-list" />';
		this.#windowWidget.getContentDiv().classList.add('whiteScrollbar')
		this.#windowWidget.getContentDiv().classList.add('grayBackground')
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

	/** @returns {Promise<PluginLsFile[]>} */
	async #scanForPlugins() {
		// only stuff that is in subfolders of folder /os/plugins/. Also we don't care for initial /
		return (await this.#os.getNS(ns => {
				return ns.ls('home');
			})).map(file => file.match(/^\/{0,1}os\/plugins\/(.+)\/(.*)\.(.*)/))
			.filter(res => res)
			.map(res => ({
				path: res[0],
				pluginDir: res[1],
				pluginFile: res[2],
				pluginExtension: res[3]
			}))
	}
	
	async #getPluginsData() {
		if (this.#pluginsMap) return;

		/** @type { Object.<string, PluginData>} */
		let pluginsMap = {};
		let plugins = await this.#scanForPlugins();

		plugins.forEach(p => {
			let obj = pluginsMap[p.pluginDir];
			if (!obj) pluginsMap[p.pluginDir] = obj = { error: [], executions: [] };

			if (p.pluginExtension == 'txt') {
				if (!obj.configFile) {
					this.#log.debug(`Plugin ${p.pluginDir}: config found ${p.path}`);
					obj.configFile = p.path;
				} else {
					this.#log.warn(`Plugin ${p.pluginDir}: Multiple config files ${p.path}`);
					obj.error.push('Multiple config files')
				}
			}
			if (p.pluginExtension == 'js' || p.pluginExtension == 'ns') {
				if (p.pluginFile == p.pluginDir) {
					this.#log.debug(`Plugin ${p.pluginDir}: script found ${p.path}`);
					obj.script = p.path;
				}
			}
		});

		let configs = Object.entries(pluginsMap)
			.filter(([name, { configFile, error }]) => !error.length && configFile)
			.map(([name, { configFile }]) => ([name, configFile]));

		let jsons = await this.#os.getNS(ns => {
			return configs
				.filter(([name, configFile]) => configFile && ns.fileExists(configFile))
				.map(([name, configFile]) =>
					({ name, configJSON: ns.read(configFile) }))
		});
		jsons.forEach(({ name, configJSON }) => {
			let obj = pluginsMap[name];
			try {
				obj.config = JSON.parse(configJSON);
				if (!obj.config.id) obj.error.push('Config missing id');
				if (!obj.script) obj.error.push('Script file missing');
			} catch (e) {
				this.#log.error('Error parsing JSON for file ', name, e.message);
				obj.error.push('Error parsing config');
			}
		})

		this.#pluginsMap = pluginsMap;
	}

	async #render() {
		this.#windowWidget.setTitle('Plugins Manager')

		let windowDiv = this.#windowWidget.getContainer()
		const fileList = windowDiv.querySelector('.plugins-list')

		await this.#getPluginsData();

		fileList.innerHTML = Object.entries(this.#pluginsMap)
			//.filter( ( [name, { configFile, error }] ) => !error && configFile)
			.map(([name, { config, error }]) => {
				if (!config) error.push('Missing config');
				let btn_name = error.length ? '' : 'Run';
				let id = (config || {}).id || name;
				let error_msg = error.join(' ');
				return `
				<div class="plugins-list__row ${(error.length) ? 'plugin-error' : ''}">
					<div>`
						+ (btn_name ? `<button class="plugins-list__button" data-plugin-name="${name}" >${btn_name}</button>` : '') +`
					</div >
					<div>${id}</div>
					<div>${error_msg ? error_msg : (config.description || '')}</div>
				</div>
				`
			}).join('');

		// Add btn listeners
		Array.from(fileList.querySelectorAll('.plugins-list__button')).forEach((button) => {
			button.addEventListener('click', (event) => this.#onClickPluginRun(event))
		});
	}


	#onClickPluginRun(event) {
		let button = event.currentTarget;
		event.stopPropagation()

		const pluginName = button.dataset.pluginName
		this.#log.debug(`Running ${pluginName}`);

		/* we can ignore async */
		this.#runPlugin(pluginName);
	}

	async #runPlugin(pluginName) {
		let obj = this.#pluginsMap[pluginName];
		if (!obj) return;

		let imports_path = '/os/plugins/' + pluginName;

		let res = await runPlugin(this.#os, this.#log, obj.script, imports_path)
		obj.executions.push(res);
		this.#log.debug(JSON.stringify(res));
	}

	#on_exit() {
	}
}

const plugins_manager_css = `
.grayBackground{
	background: #dadada;
}
.plugins-list {
	margin: 0;
	padding: 1px;
	width: 100%;
}
.plugins-list__row{
	padding: 0px 2px 3px;
	margin 3px 0;
}
.plugins-list__row:nth-child(2n+1){
	background: #ececec;
}
.plugin-error{
	background: #cccccc !important;
}

.plugins-list__button{
	border-left: 1px solid white;
	border-top: 1px solid white;
	border-right: 1px solid rgb(128,128,128);
	border-bottom: 1px solid rgb(128,128,128);
	background: rgb(192, 192, 192);
	margin: 0;
	padding: 1px 2px;
}
.plugins-list__button:active {
	border-left: 2px solid rgb(128,128,128);
	border-top: 1px solid rgb(128,128,128);
	border-right: 1px solid white;
	border-bottom: 1px solid white;
}
.plugins-list__row div{
	display: inline-block;
	vertical-align: middle;
}
.plugins-list__row div:nth-child(1){ /*btn*/
	width: 45px;
}
.plugins-list__row div:nth-child(2){ /*id*/
	width: 130px;
}
.plugins-list__row div:nth-child(3){ /*message/error*/
	min-width: 200px;
}
.plugins-list__row.plugin-error div:nth-child(3){ /*error*/
	color: #a90000;
}

`;