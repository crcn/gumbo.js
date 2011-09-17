var Structr = require('structr'),
Collection = require('./collection'),
EventEmitter = require('sk/core/events').EventEmitter;



module.exports = EventEmitter.extend({
	
	/**
	 */

	'override __construct': function(ops)
	{
        this._super();
        
        if(!ops) ops = {};
        
        this.ops = ops;
        
		this._collections = {};
        
        
        if(ops.persist)
        {
            for(var transport in ops.persist)
            {
                require(__dirname + '/persist/' + transport).db(this, ops.persist[transport]);
            }
        }
        
        this.async = ops.async;
	},


	/**
	 */

	'collection': function(name)
	{
		return this._collections[name] || this._newCollection(name);
	},
    
    /**
     */
     
    '_newCollection': function(name)
    {
        var col = this._collections[name] = new Collection(this, name);
        
        this.emit('collection', col);
        
        return col;
    },

	/**
	 */

	'drop': function()
	{
		this._collections = {};
	}
})