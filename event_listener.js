
export class EventListener{
	/** @param {object} [parent] - only in case this class was not derivered */
	constructor(parent){
		this.#parent = parent || this;
		this.#listeners = {};
	}

	/**
	 * this method is needed, because classes extending from EventListener cannot create a Logger object before super()
	 * @param {import('/os/logger').Logger} log */
	eventListener_initLog(log) {
		this.#log = log;
	}

	listen(event, func){
		if(!event) console.log('empty event for listen', func);
		if(!this.#listeners[event]) this.#listeners[event] = [];
		this.#listeners[event].push(func);
	}

	fire(event, ...args) {
		try {
			if (!event) console.log('empty event for fire');
			if (!this.#listeners[event]) {
				if (this.#log) this.#log.warn('No listener for event ', event);
				return;
			}
			this.#listeners[event].forEach(listener => listener.call(this.#parent, ...args));
		} catch (e) {
			this.#log.error(`Event listener for ${this.#parent.constructor.name} - error for event ${event}`, e.message, e);
		}
	}

	// private fields, methods

	#parent
	#listeners
	/** @type {import('/os/logger').Logger} */
	#log
}


export const OS_EVENT = {};
Object.defineProperties(OS_EVENT, {
	INIT: { value: 'init' },
	LOOP_STEP: { value: 'loop_step' },
    ON_EXIT: { value: 'on_exit' },
});

export const WindowWidget_EVENT = {};
Object.defineProperties(WindowWidget_EVENT, {
	SHOW: { value: 'show' },
	HIDE: { value: 'hide' },
	CLOSE: { value: 'close' },
});

