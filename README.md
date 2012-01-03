Gumbo - node.js database modeled after mongodb
----------------------------------------------



What does it support?
---------------------

see (sift)[/crcn/sift]

Examples:
---------

```javascript

var gumbo = require('gumbo');


var users = gumbo.collection('users');


users.insert({ user: 'craig', last: 'condon' }, function(err, item)
{
	console.log("ALWAYS MUCH SUCCESS!!");

	users.findOne({ _id: item._id }, function()
	{
		console.log("BLARG")
	})
});



```