var structr = require("structr");
module.exports = new (structr({

	"sort": function(sort, stack) {

		var self = this;

		sort = this._fixSort(sort);

		return stack.sort(function(a, b) {

			var i = 0;

			for(var field in sort) {
				i += self._compareField(sort[field], a.get(field), b.get(field));
			}

			return i == 0 ? 0 :

			i < 0 ? -1 : 1;
		});

	},

	/**
	 */

	"_compareField": function(sort, av, bv) {
		return av == bv ? 0 :

		(av > bv ? -1 : 1) * sort;
	},

	/**
	 */

	"_fixSort": function(sort) {
		var fixedSort = {};
		for(var field in sort) {
			var sv = sort[field];
			if(sv == "desc") sv = -1;
			if(sv == "asc") sv = 1;
			fixedSort[field] = sv;
		}
		return fixedSort;
	}
}));