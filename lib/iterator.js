var structr = require("structr");

module.exports = structr({

	/**
	 */

	"__construct": function(source, ops) {

		this.options = ops || {};
		this._source = source || [];
		if(!this.options.chunkSize) this.options.chunkSize =  20;
		this.transform(function(v){ return v });

		if(this.options.next) {
			this.options.next();
		}

	},

	/**
	 */

	"chunkSize": function(value) {
		this.options.chunkSize = value;
		return this;
	},

	/**
	 */

	"each": function(each) {
		this.options.each = each;
		return this;
	},

	/**
	 */

	"count": function() {

		return this.
		capture().
		transform(function(results) {
			return results.length;
		});
	},

	/**
	 */

	"capture": function() {
		this._results = [];
		return this;
	},

	/**
	 */

	"one": function() {
		this._results = [];
		this.options.one = true;
		return this;
	},


	/**
	 */

	"transform": function(fn) {
		this.options.transform = fn;
		return this;
	},

	/**
	 */

	"sync": function() {
		this._chunk(this._source.length - 1, 0);
		try {
		return this.options.transform(this._results);
	}catch(e) {
		console.error(e.stack)
	}
	},


	/**
	 */

	"exec": function(cb) {

		if(!cb) cb = function(){ };

		var ci = this._source.length - 1,
		chunkSize = Math.max(1, this.options.chunkSize),
		self = this;

		function next() {
			if(self._chunk(ci, ci = Math.max(0, ci - chunkSize)) === false) return cb(null, self.options.transform(self._results));
			process.nextTick(next);
		}

		process.nextTick(next);
	},

	/**
	 */


	"stop": function() {
		this._stop = true;
		return this;
	},


	/**
	 */

	"_chunk": function(ci, ni) {
		var result, j = ci;
		for(; j >= ni; j--) {
			result = this.options.each.call(this, this._source[j], j);
			if(result !== false) {
				if(this._results) {
					this._results.push(result);
					if(this.options.one) this.stop();
				}
			}
			if(this._stop) return false;
		}
		return ni ? true : false;
	}
});