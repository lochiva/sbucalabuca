/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/********************************************
  BEIGN FIREBASE FUNCTIONS GENERAL FUNCTIONS
*********************************************/

function firebaseInit(){
  // firebase configurations
  var config = firebaseConfig;
  // firebase initialize and sign in if not logged
  firebase.initializeApp(config);
  onAuthStateChanged();

  // firebase bind of connection event
  onConnectionStateChanged();
}
/**
 * Firebase auth change bind
 */
function onAuthStateChanged() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            startSpinner();
            firebase.auth().signInAnonymously().catch(function(error) {

                var errorCode = error.code;
                var errorMessage = error.message;
                Materialize.toast('Errore connesione: ' + error.code + " " + error.message, 5000);
                app.firebaseConnected = false;

            });
            stopSpinner();
        } else {
            app.firebaseConnected = true;
        }
    });
}
/**
 * Firebase connection change bind
 */
function onConnectionStateChanged() {
    var connectedRef = firebase.database().ref(".info/connected");
    connectedRef.on("value", function(snap) {
        if (snap.val() === true) {
            if (app.strating !== true) {
                Materialize.toast('Connettività presente', 3000);
            }
            app.firebaseConnected = true;
        } else {
            if (app.strating !== true) {
                Materialize.toast('Connettività assente', 3000);
            }
            app.firebaseConnected = false;
        }
    });
}
/**
 * Push image to storage
 */
function storagePushImage(id, fileObject, onSuccess) {
    var storageRef = firebase.storage().ref();
    if (app.firebaseConnected === false) {
        Materialize.toast('Connettività assente', 3000);
        return false;
    }
    var uploadTask = storageRef.child('images/' + id + '.jpg').put(fileObject);
    //app.createFile(  id + '.jpg',fileObject);
    //parseUploadImage(id,fileObject);
    uploadTask.on('state_changed', function(snapshot) {
        //console.log(snapshot);
    }, function(error) {
        stopSpinner();
        Materialize.toast("Errore salvataggio immagine: " + error, 5000);
    }, function() {
        if (onSuccess !== undefined) {
            onSuccess(id);
        }

    });
}
/**
 * Push image data to database
 */
function databasePushImage(id, data, onSuccess) {
    firebase.database().goOnline();

    if (app.firebaseConnected === false) {
        Materialize.toast('Connettività assente, errore scrittura database', 3000);
        return false;
    }
    firebase.database().ref('images/' + id).set(data).then(function() {
        data.firebaseId = id;
        //parseSaveImagesData(data);
        if (onSuccess !== undefined) {
            onSuccess();
        }

    }).catch(function(error) {
        Materialize.toast('Errore scrittura database: ' + error, 5000);
        stopSpinner();

    });
}

/**
* Function that read the info data from firebase
*/
function readInfoFirebase(){
  var ref = firebase.database().ref('/info').once('value').then(function(snapshot) {
      var prova = snapshot.val();
      if (prova !== null && prova !== '') {
          $('#info-text').html(prova);

          stopSpinner();
      } else {

          stopSpinner();
          return false;
      }

  }).catch(function(error) {
      Materialize.toast('Errore connessione: ' + error, 5000);
      stopSpinner();
  });
}
/********************************************
 *  END general functions
 *********************************************/
/********************************************
  BEIGN FIREBASE FUNCTIONS MAP FUNCTIONS
*********************************************/
/**
 *  Function that read images from database for the map
 */
function readImagesForMap(onSuccess, onError) {
  
    firebase.database().ref('/images/').limitToLast(1000).once('value').then(function(snapshot) {

        var elements = snapshot.val();

        if (onSuccess !== undefined) {
            onSuccess(elements);
        }


    }).catch(function(error) {
        if (onError !== undefined) {
            onError();
        }
        Materialize.toast('Errore connessione: ' + error, 3000);
        stopSpinner();
        return false;
    });
}
/**
 *  Function that read user images from database for the map
 */
function readUserImagesForMap(onSuccess, onError) {
    var code = '';

    if (device.uuid !== null) {
        code = device.uuid.hashCode();
    }
    firebase.database().ref('/images/').orderByChild('user').equalTo(code).once('value').then(function(snapshot) {

        var elements = snapshot.val();
        if (onSuccess !== undefined) {
            onSuccess(elements);
        }

    }).catch(function(error) {
        if (onError !== undefined) {
            onError();
        }
        Materialize.toast('Errore connessione: ' + error, 3000);
        stopSpinner();
        return false;
    });
}
/**
 *  Function that read today images from database for the map
 */
function readTodayImagesForMap(onSuccess, onError) {
    var start = new Date().getTime() - (60 * 60 * 24 * 1000);
    firebase.database().ref('/images/').orderByChild('timestamp').startAt(start).limitToLast(1000).once('value').then(function(snapshot) {

        var elements = snapshot.val();

        if (onSuccess !== undefined) {
            onSuccess(elements);
        }

    }).catch(function(error) {
        if (onError !== undefined) {
            onError();
        }
        Materialize.toast('Errore connessione: ' + error, 3000);
        stopSpinner();
        return false;
    });
}
/**
 *  Function that read images url
 */
function readImageUrl(url, onSuccess, onError) {
    var storageRef = firebase.storage().ref("images/" + url);
    storageRef.getDownloadURL().then(function(url) {
        if (onSuccess !== undefined) {
            onSuccess(url);
        }

    }).catch(function(error) {
        if (onError !== undefined) {
            onError();
        }
        Materialize.toast('Errore connessione: ' + error, 3000);
        stopSpinner();
        return false;
    });

}
/********************************************
 *  END map functions
 *********************************************/
/********************************************
 BEIGN FIREBASE FUNCTIONS USER GALLERY
*********************************************/
/**
 * Function that read the list of personal image
 */
function readFirebaseUserGallery(onSuccess, onError) {

    var code = '';

    firebase.database().goOnline();
    var ref = firebase.database().ref('/images/');
    if (device.uuid !== null) {
        code = device.uuid.hashCode();
    }
    if (app.firebaseConnected === false) {
        Materialize.toast('Connettività assente', 3000);
        stopSpinner();
        return false;
    }

    ref.orderByChild('user').equalTo(code).limitToLast(20).once('value').then(function(snapshot) {
        var elements = snapshot.val();
        if (onSuccess !== undefined) {
            onSuccess(elements);
        }

    }).catch(function(error) {
        if (onError !== undefined) {
            onError();
        }
        Materialize.toast('Errore connessione: ' + error, 5000);
        stopSpinner();
    });

}
