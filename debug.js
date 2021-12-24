
export class Debug{
	constructor(){
		this.cache = {};
	}
	
	print(...args){
		console.log(...args);
	}

	printOnce(...args){
		let json = JSON.stringify(args);
		if(this.cache[json])return;
		this.cache[json] = 1;
		this.print(...args);
	}
}

Object.defineProperties(Debug, {
    DEBUG_LEVEL: { value: 'debug'},
});
