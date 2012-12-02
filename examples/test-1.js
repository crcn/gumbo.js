var gumbo = require("../");


var col = gumbo.collection([
	{
		name: "tim",
		age: 104
	},
	{
		name: "craig",
		age: 99
	}
]);




col.watch({ age: {$gt:100}}, {
	insert: function(item) {
		console.log("insert %s", item.get("_id"));
	},
	update: function(item) {
		console.log("update %s", item.get("_id"))
	}
});


col.find({ name: "craig" }).sync();

// for(var i = 10; i--; ) col.insert({ name: "craig", age: 101 }).sync();


col.find({age:{$gt:100}}).exec(function(err, results) {
	console.log(results.length);
});


console.log(col.findOne({$or:[{name:"craig"},{name:"tim"}]}).sync().get("name"));