
// define a startup script that 
// reads the JSON data files from the filesystem 
// and inserts them into the database if needed

if (Meteor.isServer){
	Meteor.startup(function(){
		if (!Polet.findOne()){
		console.log("no drinks yet... creating from filesystem");
		// pull in the NPM package 'fs' which provides
		// file system functions
		var fs = Meteor.npmRequire('fs');
		// get a list of files in the folder private/jsonfiles, which
		// ends up as assets/app/jsonfiles in the app once it is built
		var files = fs.readdirSync('./assets/app/jsonfiles/');
		// iterate the files, each of which should be a 
		// JSON file containing song data.
		var inserted_songs = 0;
		for (var i=0;i<files.length; i++){
		//for (var i=0;i<1; i++){

		 	var filename = 'jsonfiles/'+files[i];

		 	console.log(filename);
		 	if(filename === 'jsonfiles/vinmonopolet.json') {
		 		var poletArray = JSON.parse(Assets.getText(filename));
      			for (var k=0;k<poletArray.length;k++){
			 		Polet.insert(poletArray[k]);
				}
		 	}
		 			 	// in case the file does not exist, put it in a try catch
		}
	}
	})
}
