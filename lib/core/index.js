var Structr = require('structr');

module.exports = Structr({

    /**
     */
     
    '__construct': function()
    {
        this._ensured = {};
        
        this.ensure('_id');
    },
    
    /**
     */
     
    'ensure': function(name)
    {
        if(!this._ensured[name]) this._ensured[name] = { };
    },
    
    /**
     */
     
    'add': function(item)
    {
        for(var index in this._ensured)
        {
            if(this._ensured[index][item[index]]) return false;
            
            this._ensured[index][item[index]] = 1;
        }
        
        return true;
    },
    
    /**
     */
     
    'remove': function(item)
    {
        for(var index in this._ensured)
        {
            delete this._ensured[index][item[index]];
        }
    }
});