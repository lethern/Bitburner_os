import { processListPayloads } from "/os/plugins/rgraph/process-list.config.js"

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
	async populateProcesses(disableGrouping, sort) {
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
		let scriptData = ns.getRunningScript(filename, hosts[0], ...args)
		if (!scriptData)
			return { duration: 0, timeRunning: 0 };

		const { onlineRunningTime, offlineRunningTime } = scriptData
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
