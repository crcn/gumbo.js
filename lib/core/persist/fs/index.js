var lazyCallback = require('sk/core/lazy').callback,
nodefs = require('node-fs'),
fs = require('fs');



exports.db = function(db, outputDir)
{

    try
    {
        nodefs.mkdirSync(outputDir, 0755, true);
    }
    catch(e)
    {
    }
    
    db.addListener('collection', function(collection)
    {
        var output = outputDir + '/'+ collection.name +'.json';
        
        
        var saveNow = function()
        {

            fs.writeFileSync(output, JSON.stringify(collection.objects()));
        }
        
        try
        {
            collection.objects(JSON.parse(fs.readFileSync(output)));
        }
        catch(e)
        {
        }
        
        var save = lazyCallback(saveNow, 50);
        
        collection.addListener("insert", save);
        collection.addListener("remove", save);
        collection.addListener("update", save);
        //collection.addListener("findOne", save);
    });
}