/********************************************
  BEIGN PARSE GENERAL FUNCTIONS
*********************************************/
function generateUserACL() {
    var userACL = new Parse.ACL();
    userACL.setPublicReadAccess(true);
    userACL.setWriteAccess(Parse.User.current(), true);

    return userACL;
}

function parseInit() {
    Parse.initialize("sbuca");
    Parse.serverURL = 'http://localhost:1337/parse';

    parseLogin();
}

function parseLogin() {

    var userInfo = {};
    userInfo = generateUserPass();
    Parse.User.logIn(userInfo.code, userInfo.pass, {
        success: function(user) {

        },
        error: function(user, error) {
            console.log(error.message);
            parseSignUp();
            //Materialize.toast("Errore connessione: " + error.code + " Controlla la connetività. ", 5000);
        }
    });

}

function parseSignUp() {
    var userInfo = {};
    userInfo = generateUserPass();
    //console.log(userInfo.code+" - "+userInfo.pass);
    var user = new Parse.User();


    user.set("username", userInfo.code);
    user.set("password", userInfo.pass);

    user.signUp(null, {
        success: function(user) {
            // Hooray! Let them use the app now.
        },
        error: function(user, error) {
            console.log(error.message);
            // Show the error message somewhere and let the user try again.
            Materialize.toast("Errore connessione: " + error.code + " Controlla la connetività. ", 5000);
            stopSpinner();
            return false;
        }
    });
}

function generateUserPass() {
    var user = {};
    user.code = "provaprova";
    user.pass = "provaprova";
    if (device.uuid === undefined || device.uuid === null) {
        user.code = sha256(user.code);
    } else {
        user.code = sha256(device.uuid);
    }

    if (device.serial === undefined || device.serial === null) {
        user.pass = sha256(user.pass);
    } else {
        user.pass = sha256(device.serial);
    }
    //console.log(user);
    return user;

}
/********************************************
 *  END general functions
 *********************************************/
 /********************************************
   BEIGN PARSE MAP FUNCTIONS
 *********************************************/
 /**
 *  Function that read images from database for the map
 */
 function parseReadImagesForMap(onSuccess, onError) {
     var Images = Parse.Object.extend("images");
     var query = new Parse.Query(Images);
     query.descending("createdAd").limit(1000);
     query.find({
         success: function(results) {
             for (var i = 0; i < results.length; i++) {
                 results[i] = results[i].toJSON();

             }
             //console.log(results);
             if (onSuccess !== undefined) {
                 onSuccess(results);
             }

         },
         error: function(error) {
             if (onError !== undefined) {
                 onError();
             }
             Materialize.toast("Errore connessione: " + error.code + " Controlla la connetività. ", 5000);
             stopSpinner();
             return false;
         }
     });

 }

 /**
  *  Function that read user images from database for the map
  */
 function parseReadUserImagesForMap(onSuccess, onError) {
     var code = '';

     if (device.uuid !== null) {
         code = device.uuid.hashCode();
     }
     var Images = Parse.Object.extend("images");
     var query = new Parse.Query(Images);
     query.descending("createdAd").equalTo('user',code).limit(1000);
     query.find({
         success: function(results) {
             for (var i = 0; i < results.length; i++) {
                 results[i] = results[i].toJSON();

             }
             //console.log(results);
             if (onSuccess !== undefined) {
                 onSuccess(results);
             }

         },
         error: function(error) {
             if (onError !== undefined) {
                 onError();
             }
             Materialize.toast("Errore connessione: " + error.code + " Controlla la connetività. ", 5000);
             stopSpinner();
             return false;
         }
     });
 }
 /**
 *  Function that read today images from database for the map
 */
 function parseReadTodayImagesForMap(onSuccess,onError){

   var start = new Date().getTime()-(60*60*24*1000);
   var Images = Parse.Object.extend("images");
   var query = new Parse.Query(Images);

   query.greaterThan("timestamp",start).limit(1000);
   query.find({
       success: function(results) {
           for (var i = 0; i < results.length; i++) {
               results[i] = results[i].toJSON();

           }
           //console.log(results);
           if (onSuccess !== undefined) {
               onSuccess(results);
           }

       },
       error: function(error) {
           if (onError !== undefined) {
               onError();
           }
           Materialize.toast("Errore connessione: " + error.code + " Controlla la connetività. ", 5000);
           stopSpinner();
           return false;
       }
   });
 }
 /********************************************
  *  END map functions
  *********************************************/
/********************************************
  BEIGN PARSE UPLOAD FUNCTIONS
*********************************************/
function parseUploadImage(id, file, data) {

    var name = id + ((id.substr(id.length - 4) == '.jpg') ? '' : '.jpg');

    var onSuccess = function(base64) {
        var parseFile = new Parse.File(name, {
            base64: base64
        });
        parseFile.save().then(function() {
            console.log("parse-file slavato");
            data.image = parseFile;
            parseSaveImagesData(data);

        }, function(error) {
            console.log(error.message);
            Materialize.toast("Errore connessione: " + error.code + " Controlla la connetività. ", 5000);
            stopSpinner();
            return false;
            // The file either could not be read, or could not be saved to Parse.
        });
    };
    blobToBase64(file, onSuccess);

}


function parseSaveImagesData(data) {
    var Images = Parse.Object.extend("images");
    var image = new Images();

    var acl = generateUserACL();
    image.setACL(acl);

    image.save(data, {
        success: function(image) {
            console.log("parse-data slavato");
            // The object was saved successfully.
        },
        error: function(image, error) {
            console.log(error.message);
            Materialize.toast("Errore connessione: " + error.code + " Controlla la connetività. ", 5000);
            stopSpinner();
            return false;
            // The save failed.
            // error is a Parse.Error with an error code and message.
        }
    });
}



function saveImageFromFirebase(imageURI, data) {
    //var file = new File(imageURI);
    //var myBlob = new Blob([imageURI],{type: "image/jpeg"});
    var id = data.image;
    data.firebaseId = id.substr(0, id.length - 4);
    data.image = '';

    var blob = null;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "img/" + id);
    xhr.responseType = "blob"; //force the HTTP response, response-type header to be blob
    xhr.onload = function() {
        blob = xhr.response; //xhr.response is now a blob object
        //console.log(blob);
        if (blob.type != "text/html") {
            parseUploadImage(id, blob, data);
        }

    };
    xhr.send();

}
/********************************************
 *  END upload functions
 *********************************************/
