var Collection = require("./collection");

exports.collection = function(source, modelClass) {
	return new Collection(source, modelClass);
}

exports.Collection = Collection;
exports.BaseModel  = require("./model").Base;
exports.BaseLoader = require("./loaders/baseSync");
exports.FnLoader   = require("./loaders/fn");