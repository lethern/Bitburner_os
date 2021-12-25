
export class EventListener{
	constructor(parent){
		this.e_parent = parent || this;
		this.e_listeners = {};
	}
	listen(event, func){
		if(!event) console.log('empty event for listen', func);
		if(!this.e_listeners[event]) this.e_listeners[event] = [];
		this.e_listeners[event].push(func);
	}
	fire(event, ...args){
		if(!event) console.log('empty event for fire', func);
		if(!this.e_listeners[event]){
			this.e_parent.debug.printOnce('No listener for event ', event);
			return;
		}
		this.e_listeners[event].forEach(listener => listener.call(this.e_parent, ...args));
	}
}

export const OS_EVENT = {};
Object.defineProperties(OS_EVENT, {
	INIT: { value: 'init' },
	LOOP_STEP: { value: 'loop_step' },
    ON_EXIT: { value: 'on_exit' },
});

export const FilesExplorerRenderer_EVENT = {};
Object.defineProperties(FilesExplorerRenderer_EVENT, {
    SHOW: { value: 'show'},
});

