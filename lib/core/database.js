var Structr = require('structr'),
Collection = require('./collection');



module.exports = Structr({
	
	/**
	 */

	'__construct': function(ops)
	{
        if(!ops) ops = {};
        
		this._collections = {};
        
        this.async = ops.async;
	},


	/**
	 */

	'collection': function(name)
	{
		return this._collections[name] || (this._collections[name] = new Collection(this, name));
	},

	/**
	 */

	'drop': function()
	{
		this._collections = {};
	}
})