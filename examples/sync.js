var gumbo = require("../");

var source = gumbo.collection(),
target = gumbo.collection();


source.syncTo(target);


source.insert({ name: "craig" }).sync();

console.log(target.findOne({ name: "craig" }).sync().get());

source.update({ name: "craig" }, {$set: { age: 21}}).sync();

console.log(target.findOne({ name: "craig" }).sync().get());



source.remove({ name: "craig" }).sync();


console.log(target.findOne({ name: "craig" }).sync());
