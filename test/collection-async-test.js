var gumbo = require("../"),
expect = require("expect.js"),
outcome = require("outcome");

describe("collection async", function() {
  
  var collection;

  it("can be created", function() {
    collection = gumbo.collection();
  });

  it("can insert an item", function(done) {
    collection.insert({ name: "craig" }, done);
  });

  it("can find the inserted item", function(done) {
    collection.findOne({ name: "craig" }, outcome.e(done).s(function(item) {
      expect(item).not.to.be(undefined);
      done();
    }));
  });


  it("can remove an item", function(done) {
    collection.remove({ name: "craig" }, done);
  });

  it("doesn't have an item", function(done) {
    collection.findOne({ name: "craig" }, outcome.e(done).s(function(item) {
      expect(item).to.be(undefined);
      done();
    }));
  });


  it("can insert many items", function(done) {
    collection.insert([{name:"john", age: 21, friends:3},{name:"craig", age:21, friends:2}, {name:"liam", age:27, friends:2}, {name:"Usamah", age:28, friends:2}], done);
  });

  it("can count items", function(done) {
    collection.count({age:21}, function(err, n) {
      expect(n).to.be(2);
      done();
    }); 
  });

  it("can find one item", function(done) {
    collection.findOne({age:21}, function(err, item) {
      expect(item.get("age")).to.be(21);
      done();
    }); 
  });

  it("can find 2 items", function(done) {
    collection.find({age:21}, function(err, items) {
      expect(items.length).to.be(2);
      done();
    }); 
  });

  it("can sort ages", function(done) {
    collection.findAll().sort({age:1}).exec(outcome.e(done).s(function(items) {
      var prev, curr;


      for(var i = items.length; i--;) {
        curr = items[i];

        if(prev) {
          expect(prev.get("age") <= curr.get("age")).to.be(true);
        }

        prev = curr;
      }
      done();
    }));
  });

  it("can limit items", function(done) {
    collection.findAll().limit(1).exec(outcome.e(done).s(function(items) {
      expect(items.length).to.be(1);
      expect(items[0].get("age")).to.be(28);
      done();
    }));
  });

  it("can skip items", function(done) {
    collection.findAll().skip(2).limit(1).exec(outcome.e(done).s(function(items) {
      expect(items.length).to.be(1);
      expect(items[0].get("age")).to.be(21);
      done();
    }));
  })


  it("can remove certain ages", function(done) {
    collection.remove({age:21}, done);
  });

  it("has still has ages > 21", function(done) {
    collection.find({age:{$gt:21}}, outcome.e(done).s(function(items) {
      expect(items.length).to.be(2);
      done();
    }));
  });
});