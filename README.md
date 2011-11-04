Gumbo - node.js database modeled after mongodb
----------------------------------------------

Why?
----

- Sometimes it's more appropriate to use an in-app db over something like redis, mongodb, or something else that's heavy.
- There are more reasons why, but right now I'm too lazy to list them. 


What does it support?
---------------------

Most mongodb queries


What's with the name?
----------------------

Dunno - I'm getting sick of picking out spices so I picked whatever random name I found. Gumbo sounded kinda nice.

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