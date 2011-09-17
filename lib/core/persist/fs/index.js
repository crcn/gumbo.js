var lazyCallback = require('sk/core/lazy').callback,
nodefs = require('node-fs'),
fs = require('fs');



exports.db = function(db, outputDir)
{
    nodefs.mkdirSync(outputDir, 0755, true);
    
    db.addListener('collection', function(collection)
    {
        var output = outputDir + '/'+ collection.name +'.json';
        
        
        var saveNow = function()
        {
            fs.writeFileSync(output, JSON.stringify(collection._objects));
        }
        
        try
        {
            collection._objects = JSON.parse(fs.readFileSync(output));
        }
        catch(e)
        {
        }
    
        var save = lazyCallback(saveNow, 1000);
        
        collection.addListener("insert", save);
        collection.addListener("remove", save);
        collection.addListener("findOne", save);
    });
}