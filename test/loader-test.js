var gumbo = require("../"),
Loader    = gumbo.BaseLoader,
expect = require("expect.js"),
outcome = require("outcome");

var loadable = [
  {
    name: "craig",
    age: 21
  },
  {
    name: "sarah",
    age: 22
  }
];


var JSONLoader = Loader.extend({

  /**
   */

  "_load": function(query, callback) {
    setTimeout(function() {
      callback(null, loadable.map(function(obj) {
        obj = JSON.parse(JSON.stringify(obj));
        obj._id = obj.name;
        return obj;
      }));
    }, 500);
  }
});


describe("collection loaders", function() {

  var col;

  it("can create a collection", function() {
    col = gumbo.collection();
    col.loader(new JSONLoader()).load();
  });

  it("can find items", function(done) {
    col.find({ age: {$lt: 25}}, outcome.e(done).s(function(items) {
      expect(items.length).to.be(2);
      done();
    }));
  });

  it("can insert items", function() {
    loadable.push({
      name: "Sam",
      age: 25
    });
    col.loader().load();
  });
  

  it("can find new people ages > 25", function(done) {
    col.find({ age: {$gte:25}}, outcome.e(done).s(function(items) {
      expect(items.length).to.be(1);
      done();
    }));
  });

  it("can find people < 25", function(done) {
    col.find({ age: {$lt: 25}}, outcome.e(done).s(function(items) {
      expect(items.length).to.be(2);
      done();
    }));
  });


  it('can remove items', function() {
    loadable.shift();
    loadable.shift();
    col.loader().load();
  });


  it("can't find people ages < 25", function(done) {
    col.find({ age: {$lt: 25}}, outcome.e(done).s(function(items) {
      expect(items.length).to.be(0);
      done();
    }));
  })
});