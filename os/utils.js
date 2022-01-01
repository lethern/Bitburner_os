
export const Utils = {
	sleep : (ms) => {
		return new Promise(resolve => setTimeout(resolve, ms));
	},
	
	// usage: x = new Utils.Deferred()
	// x.promise.then(...)
	// x.resolve(args)
	Deferred: function () {
		var self = this;
		this.promise = new Promise(function(resolve, reject) {
			self.reject = reject
			self.resolve = resolve
		})
	},
}
