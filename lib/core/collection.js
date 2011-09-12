var Structr = require('structr'),
cashew = require('cashew'),
guava = require('guava'),
utils = require('./utils'),
Indexes = require('./index'),
EventEmitter = require('sk/core/events').EventEmitter,
Janitor = require('sk/core/garbage').Janitor;



module.exports = EventEmitter.extend({
	
	/**
	 */

	'override __construct': function(name, db)
	{
        this._super();
		this.name = name;
		this.db = db;

		this._each = db.async ? utils.eachAsync : utils.each;
        
		this.idGen = cashew.register(name);

		//the database
		this._objects = [];
		this._indexes = new Indexes();
	},

    /**
     */
     
    'ensureIndex': function(name)
    {
        this._indexes.ensure(name);
    },
    
    /**
     */
     
    'on': function(listeners)
    {
        var jan = new Janitor();
        
        for(var type in listeners)
        {
            jan.addDisposable(this.on(type, listeners[type]));
        };
        
        return jan;
    },
    
    /**
     */
     
    'second on': function(event, callback)
    {
        return this.addListener(event, callback);
    },

	/**
	 */

	'insert': function(objects, callback)
	{
		if(!callback) callback = function(){};
		if(!(objects instanceof Array)) objects = [objects];

		var numInserting = objects.length, self = this,
		inserted = [];
        

		this._each(objects, function(item, index)
		{
			if(!item)
            {
                self.emit('insert', inserted);
                return callback(false, inserted);
            }

			var id = item._id = item._id || self._newId();


			//make sure there's no overlap
			if(!self._indexes.add(item))
			{
				console.warn('Item ID %s already exists. Cannot insert item.', item._id);
				return;
			}


			self._objects.push(item);
			inserted.push(item);
		});
	},

	/**
	 */

	'remove': function(query, callback)
	{
		if(!callback) callback = function(){};
		var self = this,
		stmt = guava.statement(query),
        removed = [];


		this._each(this._objects, function(item, index)
		{
			if(!item)
            {
                self.emit('remove', removed);
                return callback(false, removed);
            }

			if(stmt.test(item))
			{
				self._indexes.remove(item);
				self._objects.splice(index, 1);
			}
		});	
	},

	/**
	 */

	'update': function(query, update, callback)
	{
		if(!callback) callback = function(){};
		var self = this,
        updates = [];

		this.find(query, function(err, items)
		{
			if(!items) 
            {
                self.emit('update',updates);
                return callback(err);
            }

			self._each(items, function(item, index)
			{

				//need to make sure there's no overlap
				var updated = Structr.copy(item, true);

				self._indexes.remove(item);

				if(update.$set)
				{
					Structr.copy(update.$set, updated, true);
				}

				/*if(update.$inc)
				{
					for(var i in update.$inc) items[i]
				}*/

				if(!self._indexes.add(item))
				{
					console.warn('Cannot update item because there\'s overlap with an ensured index.');
					return;
				}
                
                updates.push(updated);

				self._objects[index] = updated;
			});
		})	
	},

	/**
	 */

	'all': function(callback)
	{
		callback(false, this._objects.concat());
	},
    

	/**
	 */

	'find': function(query, ops, callback)
	{
		if(!callback)
		{
			callback = ops;
			ops = {};
		}

		var stmt = guava.statement(query),
		found = [], self = this;

		this._each(this._objects, function(item)
		{
			if(!item) return callback(false, found);

			if(stmt.test(item))
			{
				found.push(self._item(item, ops));
			}
		});

	},

	/**
	 */

	'findOne': function(query, ops, callback)
	{
		if(!callback)
		{
			callback = ops;
			ops = {};
		}

		var stmt = guava.statement(query), self = this;

		this._each(this._objects, function(item)
		{
			if(!item) return callback(false, null);

			if(stmt.test(item))
			{
				callback(false, self._item(item, ops));
				return false;
			}
		});	
	},


	/**
	 */

	'_item': function(item, ops)
	{
		var copy = { _id: item._id };

		//return only public fields
		if(ops.fields)
		{
			for(var i in ops.fields)
			{
				copy[i] = item[i];
			}
		}
		else
		{
			copy = item;
		}


		return copy;
	},

	/**
	 */

	'_newId': function()
	{
		return this.idGen.uid();
	}
})