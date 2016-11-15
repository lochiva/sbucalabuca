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
    Parse.serverURL = parseConfig.url;
    pasreInitPush();

}

function parseLogin(email,pass,onSuccess,onError) {

    var userInfo = {};
    if(email === undefined || pass === undefined){
      userInfo = generateUserPass();
    }else{
      userInfo.code = email;
      userInfo.pass = pass;
    }
    Parse.User.logIn(userInfo.code, userInfo.pass, {
        success: function(user) {
            if(onSuccess !== undefined){
              onSuccess();
            }
            return true;
        },
        error: function(user, error) {
            Materialize.toast("Errore Login: " + error.message , 5000);
            stopSpinner();
            if(onError !== undefined){
              onError();
            }
            return false;

        }
    });

}

function parseSignUp(email,pass,onSuccess) {
    var userInfo = {};
    userInfo = generateUserPass();
    //console.log(userInfo.code+" - "+userInfo.pass);
    var user = new Parse.User();

    if(email === undefined || pass === undefined){
      user.set("username", userInfo.code);
      user.set("password", userInfo.pass);
    }else{
      user.set("username", email);
      user.set("password", pass);
      user.set("email", email);
    }

    user.signUp(null, {
        success: function(user) {
            if(onSuccess !== undefined){
              onSuccess();
            }
            return true;
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
    var Image = Parse.Object.extend("Image");
    var query = new Parse.Query(Image);
    query.descending("createdAd").limit(1000);
    album = $('#album-map').val();
    if(album !== null && album  != -1 && album !== undefined){
      query.equalTo('album',app.parseUserAlbums[album]);
    }else{
      query.containedIn('album',app.parseUserAlbums);
    }
    query.include('album');
    query.find({
        success: function(results) {
            for (var i = 0; i < results.length; i++) {
                results[i] = results[i].toJSON();

            }
            if (results.length === 0) {
                results = null;
            }
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
    var code = app.userCode;

    /*if (device.uuid !== null) {
        code = device.uuid.hashCode();
    }*/
    var Image = Parse.Object.extend("Image");
    var query = new Parse.Query(Image);
    query.descending("createdAd").equalTo('user', Parse.User.current()).limit(1000);
    query.include('album');
    album = $('#album-map').val();
    if(album !== null && album  != -1  && album !== undefined){
      query.equalTo('album',app.parseUserAlbums[album]);
    }
    query.find({
        success: function(results) {
            for (var i = 0; i < results.length; i++) {
                results[i] = results[i].toJSON();

            }
            if (results.length === 0) {
                results = null;
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
function parseReadTodayImagesForMap(onSuccess, onError) {

    var start = new Date().getTime() - (60 * 60 * 24 * 1000);
    var Image = Parse.Object.extend("Image");
    var query = new Parse.Query(Image);

    query.greaterThan("timestamp", start).limit(1000);
    album = $('#album-map').val();
    if(album !== null && album  != -1  && album !== undefined){
      query.equalTo('album',app.parseUserAlbums[album]);
    }else{
      query.containedIn('album',app.parseUserAlbums);
    }
    query.include('album');
    query.find({
        success: function(results) {
            for (var i = 0; i < results.length; i++) {
                results[i] = results[i].toJSON();

            }
            if (results.length === 0) {
                results = null;
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
function parseUploadImage(id, file, data,success) {

    var name = id + ((id.substr(id.length - 4) == '.jpg') ? '' : '.jpg');

    var onSuccess = function(base64) {
        var parseFile = new Parse.File(name, {
            base64: base64
        });
        parseFile.save().then(function() {

            data.image = parseFile;
            parseSaveImagesData(data,success);

        }, function(error) {

            Materialize.toast("Errore connessione: " + error.code + " Controlla la connetività. ", 5000);
            stopSpinner();
            return false;
            // The file either could not be read, or could not be saved to Parse.
        });
    };
    blobToBase64(file, onSuccess);

}


function parseSaveImagesData(data,onSuccess) {
    var Image = Parse.Object.extend("Image");
    var image = new Image();

    var acl = generateUserACL();
    image.setACL(acl);

    image.save(data, {
        success: function(image) {

            if (onSuccess !== undefined) {
                onSuccess(image);
            }
        },
        error: function(image, error) {

            Materialize.toast("Errore: " + error.message + " Controlla la connetività. ", 5000);
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

function parseDeleteImage(id, onSuccess) {
    var Image = Parse.Object.extend("Image");
    var query = new Parse.Query(Image);
    var file = '';
    query.get(id, {
        success: function(myObject) {
            file = myObject.get("image");

            myObject.destroy({
                success: function(myObject) {

                    if (onSuccess !== undefined) {
                        onSuccess(id);
                    }
                },
                error: function(myObject, error) {
                    //console.log(myObject);
                    if(error !== undefined){
                      Materialize.toast("Errore cancellazione: " + error.code + " Controlla la connetività. ", 5000);
                    }else{
                      Materialize.toast("Errore cancellazione: " + myObject.message + " ", 5000);
                    }
                    stopSpinner();
                    return false;
                }
            });
        },
        error: function(object, error) {
            Materialize.toast("Errore connessione: " + error.code + " Controlla la connetività. ", 5000);
            stopSpinner();
            return false;
        }
    });

}

function parseReadUserAlbums(onSuccess){
  var UserAlbum = Parse.Object.extend("UserAlbum");
  var query = new Parse.Query(UserAlbum);
  query.equalTo("user",Parse.User.current());
  query.include('album');
  query.find({
      success: function(results){
        app.parseUserAlbums = [];
        $('.album-list').html('<option data-role="none" value="" disabled selected>Seleziona un album</option>');
        $('#album-map').append('<option data-role="none" value="-1">Qualsiasi</option>');
        $('#album-gallery').append('<option data-role="none" value="-1">Qualsiasi</option>');
        for (var i = 0; i < results.length; i++) {
          album = results[i].get("album");
          app.parseUserAlbums[i] = album;
          $('.album-list').append('<option data-role="none" value="'+i+'" >'+album.get("name")+'</option>');
        }
        if(onSuccess !== undefined){
          onSuccess();
        }

      },
      error: function(){

      }
    });
}
/********************************************
 *  ADMIN FUNCTIONS
 *********************************************/
 function parseCheckIfCustomer(){
     var Customer = Parse.Object.extend("Customer");
     var query = new Parse.Query(Customer);
     query.equalTo("user",Parse.User.current());
     query.equalTo("active",true);
     query.first({
       success: function(object) {
         if(object === null || object === undefined){
               $('#getAdmin').hide();
               return false;
             }else{
               app.parseCustomer = object;
               return true;
             }
           },
           error: function(error) {
             Materialize.toast("Errore connessione: " + error.code + " Controlla la connetività. ", 5000);
             $('#getAdmin').hide();
             stopSpinner();
             return false;
           }
         });
 }

function parseAddAlbum(name,onSuccess){
  startSpinner();
  var Album = Parse.Object.extend("Album");
  var album = new Album();

  var acl = generateUserACL();
  album.setACL(acl);
  album.set("name",name);
  album.set("customer",app.parseCustomer);
  console.log(app.parseCustomer);
  album.save(null, {
      success: function(image) {
        if(onSuccess !== undefined){
          onSuccess();
        }

        return true;
      },
      error:function(image,error){
        Materialize.toast("Errore: " + error.message + " Controlla la connetività. ", 5000);
        stopSpinner();
        return false;

      }
    });

}

function parseAddUserAlbum(user,album){
  startSpinner();
  var UserAlbum = Parse.Object.extend("UserAlbum");
  var user_album = new UserAlbum();


  user_album.set("user",user);
  user_album.set("album",album);
  user_album.save(null, {
      success: function(image) {
        $('#user-UserAlbum').val('');
        Materialize.toast("Utente aggiunto all'album!", 3000, 'rounded');
        stopSpinner();
        return true;
      },
      error:function(image,error){
        console.log(error);
        Materialize.toast("Errore: " + error.message + " ", 5000);
        stopSpinner();
        return false;

      }
    });

}

function parseDeleteUserAlbum(user, album){
  startSpinner();
      var UserAlbum = Parse.Object.extend("UserAlbum");
      var query = new Parse.Query(UserAlbum);
      var file = '';
      query.equalTo("user",user);
      query.equalTo("album",album);
      query.first({
          success: function(myObject) {
              if(myObject !== null && myObject !== undefined){
                myObject.destroy({
                    success: function(myObject) {
                      $('#user-UserAlbum').val('');
                      Materialize.toast("Cancellazione avvenuta con successo !", 3000, 'rounded');
                      stopSpinner();
                    },
                    error: function(myObject, error) {
                        //console.log(myObject);
                        if(error !== undefined){
                          Materialize.toast("Errore cancellazione: " + error.message + " Controlla la connetività. ", 5000);
                        }else{
                          Materialize.toast("Errore cancellazione: " + myObject.message + " ", 5000);
                        }
                        stopSpinner();
                        return false;
                    }
                });
              }else{
                Materialize.toast("Errore cancellazione: l'utente non è presente nell'album !", 5000);
                stopSpinner();
              }
          },
          error: function(object, error) {
              Materialize.toast("Errore connessione: " + error.code + " Controlla la connetività. ", 5000);
              stopSpinner();
            return false;
          }
      });


}

function parseSearchUser(email){
    startSpinner();
    var query = new Parse.Query(Parse.User);
    query.equalTo("email",email);
    query.first({
      success: function(object){

        stopSpinner();
        app.parseUser = object;
        if(object === null || object === undefined){
              Materialize.toast("L'email inserita non corrisponde a nessun utente registrato !", 5000);

              return false;
            }else{

              return true;
            }
      },
      error: function(){
        app.parseUser = {};
        Materialize.toast("Errore: " + error.message + " Controlla la connetività. ", 5000);
        stopSpinner();
        return false;
      }
    });
}
/********************************************
 *  END admin functions
 *********************************************/
function pasreInitPush(){

//

}
