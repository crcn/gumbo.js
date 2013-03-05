var structr = require("structr"),
EventEmitter = require("events").EventEmitter,
cstep = require("cstep"),
async = require("async"),
outcome = require("outcome");

module.exports = structr(EventEmitter, {

	/**
	 */

	"__construct": function(source, ops) {

		this.options = ops = ops || {};
		this._source = source    || [];

		//default chunk size
		if(!this.options.chunkSize) this.options.chunkSize =  20;

		//default transformer
		this.transform(function(v){ return v; });

		if(ops.next) {
			var self = this;
			process.nextTick(function() {
				self.exec(ops.next);
			});
		}	
	},

	/**
	 */

	"queue": function(value) {
		if(arguments.length) {
			this._queue = value;
			return this;
		}
		return this._queue;
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

	"wait": function() {
		this.options.wait = true;
		return this;
	},

	/**
	 */

	"exec": function(cb) {
		var self = this;
		if(!cb) cb = function(){};

		function run(next) {
			self._exec(outcome.e(function(err) {
				cb(err);
				next();
			}).s(function() {
				cb(null, self.options.transform(self._results));
				next();
			}));
		}

		if(this.options.wait && this._queue) {
			this._queue.push(run);
		} else {
			run(function(){});
		}
	},

	/**
	 */

	"_exec": function(callback) {

		var i = 0, self = this;

		async.eachSeries(this._source, function(item, next) {

			self._each(i++, function(err, item) {
				if(item !== false) {
					if(self._results) {
						self._results.push(item);
						if(self.options.one) {
							return callback(null, item);
						}
					}
				}

				process.nextTick(next);
			});

		}, callback);
	},

	/**
	 */

	"_each": function(index, callback) {
		if(this.options.each.length === 3) {
			this.options.each(this._source[index], index, callback);
		} else {
			callback(null, this.options.each(this._source[index], index));
		}
	},

	/**
	 */

	"stop": function() {
		this._stop = true;
		return this;
	}
});