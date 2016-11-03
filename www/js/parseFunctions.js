function parseUploadImage(id,file){//console.log(id);console.log(file);
  var name = id+'.jpg';
  var newFile = new File([file], name);
  //file = blobToFile(file,name);
  var parseFile = new Parse.File(name, newFile);

    parseFile.save().then(function() {
      console.log("parse-file slavato");
    }, function(error) {
      console.log(error);
      // The file either could not be read, or could not be saved to Parse.
    });
}

function parseSaveImagesData(data){
    var Images = Parse.Object.extend("images");
  var image = new Images();

  image.save(data, {
    success: function(image) {
      console.log("parse-data slavato");
      // The object was saved successfully.
    },
    error: function(image, error) {
      console.log(error);
      // The save failed.
      // error is a Parse.Error with an error code and message.
    }
  });
}
