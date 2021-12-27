import { Debug } from '/os/debug.js'

export class EventListener{
	constructor(parent){
		this.#parent = parent || this;
		this.#listeners = {};
	}

	listen(event, func){
		if(!event) console.log('empty event for listen', func);
		if(!this.#listeners[event]) this.#listeners[event] = [];
		this.#listeners[event].push(func);
	}

	fire(event, ...args){
		if(!event) console.log('empty event for fire');
		if(!this.#listeners[event]){
			if (this.#parent.debug) this.#parent.debug.logOnce(Debug.WARN_LEVEL, 'No listener for event ', event);
			return;
		}
		this.#listeners[event].forEach(listener => listener.call(this.#parent, ...args));
	}

	// private fields, methods

	#parent
	#listeners
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

