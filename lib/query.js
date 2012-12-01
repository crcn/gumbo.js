var structr = require("structr"),
Iterator = require("./iterator"),
sorter = require("./sorter");

module.exports = structr({

	/**
	 */

	"__construct": function(source, tester, cb) {
		this._source = source;
		this._cb = cb;
		this._tester = tester;
		this.options = {};

		if(cb) {

			var self = this;
			process.nextTick(function() {
				self.exec(cb);
			})
		}
	},

	/**
	 */

	"limit": function(value) {
		this.options.limit = value;
		return this;
	},

	/**
	 */

	"skip": function(value) {
		this.options.skip = value;
		return this;
	},

	/**
	 */

	"sort": function(value) {
		this.options.sort = value;
	},

	/**
	 */

	"exec": function(cb) {
		return this._results().exec(cb);
	},

	/**
	 */

	"sync": function() {
		return this._results().sync();
	},

	/**
	 */

	"find": function() {
		return this;
	},

	/**
	 */

	"one": function() {
		this.options.one = true;
		return this;
	},

	/**
	 */

	"_results": function() {
		var ops = this.options;

		var iter = this._iterator();

		if(ops.one) iter.one();

		return iter.transform(function(results) {


			if(typeof ops.sort != "undefined") {
				results = sorter.sort(ops.sort, results);
			}

			if(typeof ops.limit != "undefined") {
				results = results.slice(ops.skip || 0, ops.limit);
			}


			return ops.one ? results[0] : results;
		});
	},

	/**
	 */

	"_iterator": function() {

		var tester = this._tester;


		return new Iterator(this._source).
		capture().
		each(function(item) {
			return tester(item) ? item : false;
		});
	},
});