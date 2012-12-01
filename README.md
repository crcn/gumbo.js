## mongodb-like collections

```javascript
var Collection = require("gumbo").Collection;


var col = new Collection([
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


col.findSync({ age: { $lt: 100 } }).limit(1).exec().watch({
		insert: function(item, index) {

		},
		remove: function(item, index) {

		},
		update: function(item, index) {

		}
});


```