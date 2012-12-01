var Collection = require("./collection");

exports.collection = function(source) {
	return new Collection(source);
}

exports.BaseModel = require("./model").Base;