// app.js
var db = (function() {
	//create an object which will be our public API
	var api = {};

	//maintain a database connection we can use
	var db = Titanium.Database.open('blobs.db');

	//Initialize the database
	db.execute('CREATE TABLE IF NOT EXISTS blobs (id INTEGER PRIMARY KEY, image BLOB)');

	//This will delete all data from our table
	db.execute('DELETE FROM blobs');

	//Create a to-do item - db.create(item)
	api.create = function(file) {
		var blob = file.read();
		
		db.execute('INSERT INTO blobs (image) VALUES(?)', blob);
		return db.lastInsertRowId;
		//return the primary key for the last insert
	};

	//List all images - db.read()
	api.all = function() {
		var results = [];
		//Get to-do items from database
		var resultSet = db.execute('SELECT * FROM blobs');
		while(resultSet.isValidRow()) {
			var blob = resultSet.fieldByName('image');
			results.push(blob);
			resultSet.next();
		}
		resultSet.close();
		//return an array of JavaScript objects reflecting the to-do items
		return results;
	};
	
	//Get an image by a specific ID
	api.get = function(id) {
		var result = null;
		var resultSet = db.execute('SELECT * FROM blobs WHERE id = ?', id);
		if(resultSet.isValidRow()) {
			result = resultSet.fieldByName("image");
		}
		resultSet.close();
		return result;
	};
	
	//Update an exisiting blob - db.update(item)
	api.update = function(blob) {
		db.execute("UPDATE blobs SET image = ? WHERE id = ?", blob.image, blob.id);
		//return the number of rows affected by the last query
		return db.rowsAffected;
	};
	
	//Delete a blob - db.del(item)
	api.del = function(id) {
		db.execute("DELETE FROM blobs WHERE id = ?", id);
		//return the number of rows affected by the last query
		return db.rowsAffected;
	};
	
	//return our public API
	return api;
}());


var uiImage = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "KS_nav_ui.png");
var viewsImage = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "KS_nav_views.png");

db.create(uiImage);
db.create(viewsImage);

/*
mat@augustus:~/pkgs$ /opt/android-sdk/platform-tools/adb -s emulator-5560 shell
# sqlite3 /data/data/com.matmannion.dbblogs/databases/blobs.db
SQLite version 3.6.22
Enter ".help" for instructions
Enter SQL statements terminated with a ";"
sqlite> select * from blobs;
1|[object TiBlob]
2|[object TiBlob]
 */

var win = Ti.UI.createWindow({
	layout: 'vertical',
	backgroundColor: '#000'
});

win.add(Ti.UI.createImageView({
	width: 'auto',
	height: 'auto',
	image: uiImage
}));

win.add(Ti.UI.createImageView({
	width: 'auto',
	height: 'auto',
	image: viewsImage
}));

db.all().forEach(function(blob) {
	win.add(Ti.UI.createImageView({
		width: 'auto',
		height: 'auto',
		image: blob
	}));
});

win.open();
