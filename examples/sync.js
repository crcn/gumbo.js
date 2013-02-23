var gumbo = require("../");

var source = gumbo.collection(),
target = gumbo.collection(),
target2 = gumbo.collection();


source.syncTo(target);
source.syncTo({ age: 21 }, target2);


source.insert({ name: "craig" }).sync();

console.log(target.findOne({ name: "craig" }).sync().get());
console.log(target2.findOne({ name: "craig" }).sync())

source.update({ name: "craig" }, {$set: { age: 21}}).sync();

console.log(target.findOne({ name: "craig" }).sync().get());
console.log(target2.findOne({ name: "craig" }).sync().get())



source.remove({ name: "craig" }).sync();


console.log(target.findOne({ name: "craig" }).sync());
