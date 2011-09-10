var Structr = require('structr'),
cashew = require('cashew'),
guava = require('guava'),
utils = require('./utils');



module.exports = Structr({
	
	/**
	 */

	'__construct': function(name, db)
	{
		this.name = name;
		this.db = db;

		this._each = db.async ? utils.eachAsync : utils.each;

		this._idGen = cashew.register(name);

		//the database
		this._objects = [];
		this._ids = {};
	},

	/**
	 */

	'insert': function(objects, callback)
	{
		if(!(objects instanceof Array)) objects = [objects];

		var numInserting = objects.length, self = this,
		inserted = [];

		this._each(objects, function(item, index)
		{
			if(!item) return callback(false, inserted);

			//id exists? make sure there's no overlap
			if(item._id && self._ids[item._id])
			{
				console.warn('Item ID %s already exists. Cannot insert item.', item._id);
				return;
			}

			var id = item._id = item._id || self._newId();

			//insert for overlap check
			self._ids[id] = 1; 

			self._objects.push(item);
			inserted.push(item);
		});
	},

	/**
	 */

	'remove': function(query, callbacks)
	{
		var self = this;

		this._each(this._objects, function(item, index)
		{
			if(!item) return callback(false);

			if(stmt.test(item))
			{
				delete self._ids[item._id];
				self._objects.splice(index, 1);
			}
		});	
	},

	/**
	 */

	'update': function(query, update, callback)
	{
		var self = this;

		this.find(query, function(err, items)
		{
			if(!items) return callback(err);

			self._each(items, function(item)
			{
				if(update.$set)
				{
					Structr.copy(item, update.$set, true);
				}

				/*if(update.$inc)
				{
					for(var i in update.$inc) items[i]
				}*/
			});
		})	
	},

	/**
	 */

	'find': function(query, callback)
	{
		var stmt = guava.statement(query),
		found = [];

		this._each(this._objects, function(item)
		{
			if(!item) return callback(false, found);

			if(stmt.test(item))
			{
				found.push(item);
			}
		});

	},

	/**
	 */

	'findOne': function(query, callback)
	{
		var stmt = guava.statement(query);

		this._each(this._objects, function(item)
		{
			if(!item) return callback(false, null);

			if(stmt.test(item))
			{
				callback(false, item);
				return false;
			}
		});	
	},


	/**
	 */

	'_newId': function()
	{
		return this._idGen.uid();
	}
})