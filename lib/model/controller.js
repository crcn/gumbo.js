var structr = require("structr");


module.exports = structr({

	/**
	 */

	"__construct": function(data) {
		this._data = data;
	},

	/**
	 */

	"toObject": function() {
		return this._data;
	},

	/**
	 */

	"dispose": function() {
		
	}
});