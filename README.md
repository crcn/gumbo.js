## mongodb-like collections [![Build Status](https://secure.travis-ci.org/crcn/gumbo.js.png)](https://secure.travis-ci.org/crcn/gumbo.js)

```javascript
var gumbo = require("gumbo");


var col = gumbo.collection([
	{
		name: "craig",
		age: 99
	},
	{
		name: "tim",
		age: 104
	}
}
]);

col.find({ age: { $gt: 100 } }).limit(10).skip(1).sort({ age: -1 }).exec(function(err, people) {
	
});


//watching 
col.watch({ age: {$gt: 100 } }, {
	insert: function(item) {
		console.log("insert %s", item.get("_id"));
	},
	update: function(item) {

	},
	remove: function(item) {

	}
});


```

## API

### gumbo.collection(source, modelClass)

creates a new collection

`source` - the source for the collection.
`modelClass` - the model class for the source.

## Collection API

### Iterator collection.insert(items)

### Iterator collection.update(search, set)

### Query collection.find(search)

### Query collection.findOne(search)

### Query collection.watch(search, observers)

watches the collection for any particular changes

### Synchronizer collection.syncTo(targetCollection)

synchronizes the data from one collection to another collection

## Iterator API

basic example:

```javascript

//update, and return the modified items
collection.update({ name: "craig" }, { $set: { age: 55 }}).capture().exec(function(err, modifiedItems) {
	
});


```

### iterator.chunkSize(count)

defines the chunk size when executing asynchronous tasks 

### iterator.capture()

captures any found / modified items  

### iterator.exec(cb)

executes the iterator asynchronously

### Array iterator.sync()

exetures the iterator synchronously, and returns the result




