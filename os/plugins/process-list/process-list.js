import { css } from "/os/plugins/process-list/process-list_css.js"
import { processListPayloads } from "/os/plugins/process-list/process-list.config.js'
// based on: https://github.com/PhilipArmstead/BitBurner-Scripts

async function mainPlugin(api) {

	let processList = new ProcessList(api);

	processList.init()

	processList.run();
}

export class AttacksMonitor {
	/** @param {import('/os/plugins/api_adapter').API_Object} api */
	constructor(api) {
		this.#os = api.os;
		//this.#classes = api.classes;
		//this.#utils = api.utils
	}

	/**
	 * @param {Boolean} disableGrouping
	 * @param {{param: String, isDescending: Boolean}} sort
	 **/
	async populateProcesses(disableGrouping, sort){
		let processes = await this.#getRunningProcesses()

		processes = processes.map(serv =>
			[
				...serv.ps
					.filter(({ args }) => args.length)
					.map(({ filename, args, threads }) => ({
						hosts: [serv.hostname],
						args,
						target: args[0],
						threads,
						filename,
						type: Object.keys(processListPayloads).find((key) => processListPayloads[key].includes(filename)),
					}))
				// .filter(({ type }) => type)
			])
			.flat();

		await this.#os.getNS(ns => {
			processes = processes.map((process) => ({ ...process, expiry: this.#getProcessExpiryDetails(ns, process) }))
		})
		

		if (!disableGrouping) {
			for (let i = 0; i < processes.length; ++i) {
				let j = processes.length
				while (--j > i) {
					if (processes[i].type === processes[j].type && JSON.stringify(processes[i].args) === JSON.stringify(processes[j].args)) {
						processes[i].threads += processes[j].threads
						processes[i].hosts = [...processes[i].hosts, ...processes[j].hosts]
						processes.splice(j, 1)
					}
				}
			}
		}

		return processes.sort((a, b) => {
			const valueA = a[sort.param]
			const valueB = b[sort.param]

			if (sort.param === "expiry") {
				return valueB.timeRunning / valueB.duration - valueA.timeRunning / valueA.duration
			} else {
				if (typeof valueA === "string") {
					return sort.isDescending ? valueB.localeCompare(valueA) : valueA.localeCompare(valueB)
				} else {
					return sort.isDescending ? valueB - valueA : valueA - valueB
				}
			}
		})
	}

	/**
	 * @param {NS} ns
	 * @param {{ filename: String, args: String[], hosts: String[] }} process
	 * @return {{duration: Number, timeRunning: Number}|null}
	 */
	#getProcessExpiryDetails(ns, { filename, hosts, args }) {
		const logs = ns.getScriptLogs(filename, hosts[0], ...args)
		let i = logs.length
		let log
		const { onlineRunningTime, offlineRunningTime } = ns.getRunningScript(filename, hosts[0], ...args)
		const timeRunning = onlineRunningTime + offlineRunningTime
		const pattern = new RegExp(/^sleep:.+?([\d.]+)/)
		const duration = logs.reduce((total, logOutput) => {
			const match = logOutput.match(pattern)
			return total + (match?.[1] ? Number(match?.[1]) : 0)
		}, 0) / 1000
		const returnValue = {
			duration,
			timeRunning
		}

		while (!log && i--) {
			if (logs[i].indexOf(": Executing") !== -1) {
				log = logs[i]
			}
		}

		if (log) {
			const time = log.match(/([0-9.])+ /g).map(Number)
			returnValue.duration += time.length > 1 ? time[0] * 60 + time[1] : time[0]
		}

		return returnValue
	}

	async #getRunningProcesses() {
		let processes = this.#getRootedServers()
			.filter(server => server.ramUsed)

		await this.#os.getNS(ns => {
			processes = processes.filter(serv => ns.serverExists(serv.hostname))
			processes.forEach(server => {
				server.ps = ns.ps(server.hostname)
			})
		})
		
		return processes;
	}

	#getRootedServers() {
		let servers = this.#os.getServersManager().serversObjFull;
		return servers.filter(serv => serv.hasAdminRights)
	}

	#os
}

class ProcessList {
	/** @param {import('/os/plugins/api_adapter').API_Object} api */
	constructor(api) {
		this.#os = api.os;
		this.#classes = api.classes;
		this.#utils = api.utils

		this.#attacksMonitor = new AttacksMonitor(api);
	}

	init() {
		this.#sort = {
			param: "expiry",
			isDescending: true,
		}
		this.#insertStylesheet()
		this.#createWidget()
	}

	async run() {
		let resizeOnce = true;
		while (this.#contentDiv.parentElement) {
			this.#contentDiv.querySelector(".process-list__body").innerHTML = await this.#renderAttacksHTML();
			//await ns.sleep(200)

			if (resizeOnce) {
				let elem = this.#contentDiv.querySelector('.process-list');
				console.log(elem.getBoundingClientRect().width, elem.getBoundingClientRect().height)
				elem.parentNode.parentNode.style.width = Math.min(Math.max(elem.getBoundingClientRect().width + 10, 200), 400) + 'px';
				elem.parentNode.parentNode.style.height = Math.min(Math.max(elem.getBoundingClientRect().height + 10, 200), 700) + 'px';
				resizeOnce = false;
			}
			await this.#utils.sleep(300)
		}
	}

	#insertStylesheet() {
		const stylesheetId = "process-list-style"
		const doc = globalThis["document"]
		let stylesheet = doc.getElementById(stylesheetId)

		if (stylesheet) {
			stylesheet.remove()
		}

		stylesheet = doc.createElement("style")
		stylesheet.id = stylesheetId
		stylesheet.innerHTML = css
		doc.head.insertAdjacentElement("beforeend", stylesheet)
	}

	#createWidget() {
		this.#createWindowWidget()
		
		this.#contentDiv.classList.add("window--script-monitor")



		const sort = this.#sort;
		Array.from(this.#contentDiv.querySelectorAll("[data-sort]")).forEach((element) => {
			const param = element.dataset.sort
			element.addEventListener("click", () => {
				if (sort.param === param) {
					sort.isDescending = !sort.isDescending
				} else {
					sort.param = param
					sort.isDescending = true
				}
			})
		})
	}

	#createWindowWidget() {
		let windowWidget = this.#classes.newWindowWidget(this);
		windowWidget.init();
		windowWidget.getContentDiv().classList.add('greenScrollbar')
		windowWidget.getContentDiv().classList.add('grayBackground')
		windowWidget.getContentDiv().classList.add('process-list__container')
		windowWidget.setTitle('Process list')
		windowWidget.getContentDiv().innerHTML =`
		<div class="process-list">
			<div class="process-list__head">
				<button class="process-cell" data-sort="target">Target</button>
				<button class="process-cell" data-sort="threads">Threads</button>
			</div>
			<div class="process-list__body"></div>
		</div>
	`

		windowWidget.show();

		this.#widget = windowWidget
		this.#contentDiv = windowWidget.getContentDiv()
	}

	async #renderAttacksHTML() {
		let disableGrouping = true;
		let attacks = await this.#attacksMonitor.populateProcesses(disableGrouping, this.#sort);

		let html = attacks.map((process) => this.#renderProcessAsRow(process)).join("")
		return html;
	}


	/**
	 * @param {{ type: String, target: String, hosts: String[], threads: Number, expiry: { duration: Number, timeRunning: Number }? }} process
	 * @return {String}
	 **/
	#renderProcessAsRow({ type, target, hosts, threads, expiry }) {
		const row = globalThis["document"].createElement("div")
		const progress = expiry ? Math.min(100, expiry.timeRunning / expiry.duration * 100).toFixed(2) : null

		row.classList.add("process", `process--type-${type}`)
		row.insertAdjacentHTML("beforeend", `
		<div class="process-cell process__item" title="Running on ${hosts.join(", ")}">
			${target}
			${progress ?
				`<span class="process__progress-bar" style="width: ${progress}%"></span>` :
				""
			}
		</div>
		<div class="process-cell process__threads">
			${threads.toLocaleString()}
		</div>
	`)

		return row.outerHTML
	}


	#os
	#classes
	#utils

	#widget
	#contentDiv
	#attacksMonitor
	#sort
}
