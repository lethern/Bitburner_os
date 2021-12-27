
export class EventListener{
	constructor(parent, log){
		this.#parent = parent || this;
		this.#listeners = {};
		this.#log = log;
	}

	/** @param {import('/os/debug').Logger} log */
	eventListener_initLog(log) {
		this.#log = log;
	}

	listen(event, func){
		if(!event) console.log('empty event for listen', func);
		if(!this.#listeners[event]) this.#listeners[event] = [];
		this.#listeners[event].push(func);
	}

	fire(event, ...args){
		if(!event) console.log('empty event for fire');
		if(!this.#listeners[event]){
			if (this.#log) this.#log.warn('No listener for event ', event);
			return;
		}
		this.#listeners[event].forEach(listener => listener.call(this.#parent, ...args));
	}

	// private fields, methods

	#parent
	#listeners
	/** @type {import('/os/debug').Logger} */
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
    SHOW: { value: 'show'},
});

