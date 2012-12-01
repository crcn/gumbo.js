var Collection = require("./collection");

exports.collection = function(source, modelClass) {
	return new Collection(source, modelClass);
}

exports.BaseModel = require("./model").Base;