var gumbo = require("../"),
expect = require("expect.js"),
outcome = require("outcome");

describe("collection sync", function() {

  var c1, c2, c3;

  it("can create a collection", function() {
    c1 = gumbo.collection();
    c2 = gumbo.collection();
    c3 = gumbo.collection();
  });

  it("can synchronize a collection", function() {
    c1.syncTo({ age: {$lt:22}}, c2);
    c2.syncTo(c3);
  });

  it("can insert a few items into c1", function(done) {
    c1.insert([{ age:21, name:"craig"}, {age:20, name:"john"}, {name:"liam",age:22}, {name:"sarah",age:28}], done);
  });

  it("has synchronized items into c2", function(done) {
    c2.find({age:{$lt:25}}, outcome.e(done).s(function(items) {
      expect(items.length).to.be(2);
      done();
    }));
  });

  it("has synchronized c2 items into c3", function(done) {
    c3.find({age:{$lt:22}}, outcome.e(done).s(function(items) {
      expect(items.length).to.be(2);
      done();
    }));
  });

  it("can sync items from c1 to c3", function() {
    c1.syncTo(c3);
  });

  it("has synchronized allitems", function(done) {
    c3.findAll(outcome.e(done).s(function(items) {
      expect(items.length).to.be(4);
      done();
    }));
  });
});