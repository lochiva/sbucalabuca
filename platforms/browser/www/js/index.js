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
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    /**
     * TAKE PICTURE FUNCTION
     */
    takePicture: function() {
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 50,
            correctOrientation: true,
            destinationType: Camera.DestinationType.FILE_URI
        });

        function onSuccess(imageURI) {
            document.getElementById('originalPicture').src = imageURI;
            return imageURI;
        }

        function onFail(message) {
            Materialize.toast('Errore scatto foto: ' + message, 3000);
            return false;
        }

    },
    /**
     * GET POSITION FUNCTION FOR GEOLOCALIZATION
     */
    getPosition: function(dialog) {
        startSpinner();

        var options = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 10000
        };

        var watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

        function onSuccess(position) {
            stopSpinner();
            if (dialog !== false) {
                alert('Latitude: ' + position.coords.latitude + '\n' +
                    'Longitude: ' + position.coords.longitude + '\n' +
                    'Altitude: ' + position.coords.altitude + '\n' +
                    'Accuracy: ' + position.coords.accuracy + '\n' +
                    'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
                    'Heading: ' + position.coords.heading + '\n' +
                    'Speed: ' + position.coords.speed + '\n' +
                    'Timestamp: ' + position.timestamp + '\n');
            } else {
                return [position.coords.latitude, position.coords.longitude];
            }
        }

        function onError(error) {
            stopSpinner();
            Materialize.toast('Non siamo riusciti a leggere la tua posizione, controlla di avere il gps attivo!!', 5000);
            return false;
        }
    },

    createFile: function(name, dataObj){
      var uri = window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {


          var url = fs.root.getFile(name, { create: true, exclusive: false }, function (fileEntry) {


              app.writeFile(fileEntry, dataObj);
              return fileEntry.fullPath;

          }, onErrorCreateFile);
          return url;
      }, onErrorLoadFs);
      function onErrorCreateFile(error){
        Materialize.toast('Errore creazione file: '+error.code+' nome: '+name, 3000);
        return false;

      }
      function onErrorLoadFs(error){
        Materialize.toast('Errore caricamento directory: '+error.code, 3000);
        return false;
      }

      return uri;

    },

    writeFile: function(fileEntry, dataObj) {
    // Create a FileWriter object for our FileEntry (log.txt).
        fileEntry.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function() {
                //console.log("Successful file write...");
                //readFile(fileEntry);
                Materialize.toast("File scritto: " + fileEntry.toURL(), 3000);
                return fileEntry.fullPath;
            };

            fileWriter.onerror = function (e) {
                Materialize.toast("Errore scrittura file: " + e.toString(), 3000);
            };

            // If data object is not passed in,
            // create a new Blob instead.
            if (!dataObj) {
                Materialize.toast('Errore file non trovato!', 3000);
            }

            fileWriter.write(dataObj);
        });
    },

    saveFileDownload: function(url,name) {

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';

        xhr.onload = function() {
            if (this.status == 200) {

                var blob = new Blob([this.response], { type: 'image/jpg' });
                app.createFile(name,blob);
            }
        };
        xhr.send();
    },

    readFile: function(name) {

      var uri = window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {


          var url = fs.root.getFile(name, {}, function (fileEntry) {
              return fileEntry.toURL();
          }, onErrorCreateFile);

          return url;

      }, onErrorLoadFs);
      function onErrorCreateFile(error){
        Materialize.toast('Errore lettura file: '+error.code+' nome: '+name, 3000);
        return false;

      }
      function onErrorLoadFs(error){
        Materialize.toast('Errore caricamento directory: '+error.code, 3000);
        return false;
      }

      return uri;

    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        //app.init();
        //console.log($(document).height()+" ---  "+$(document).width());
    },
    photoCaptured: false,
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

$(document).ready(function() {
    app.initialize();
    var config = {
        apiKey: "AIzaSyBd10R4YgN46rRg6w3gkOvwi4KvRvxkFNE",
        authDomain: "iotaapp-da647.firebaseapp.com",
        databaseURL: "https://iotaapp-da647.firebaseio.com/",
        storageBucket: "gs://iotaapp-da647.appspot.com",
    };
    firebase.initializeApp(config);
    firebase.auth().signInWithEmailAndPassword('info@itoa.it', 'passworditoa').catch(function(error) {

        var errorCode = error.code;
        var errorMessage = error.message;
        Materialize.toast('Connettività assente', 3000);

    });
    var connectedRef = firebase.database().ref(".info/connected");
      connectedRef.on("value", function(snap) {
        if (snap.val() === true) {
          Materialize.toast('Connettività ritrovata', 3000);
        } else {
          Materialize.toast('Connettività assente', 3000);
        }
      });

    /**
     *  SWIPE FUNCTIONS
     * Functions that detect the swipe for moving the pages.
     */
    var pages = ["#home", "#camera", "#info"];
    $(document).on("swipeleft", pages, function() {
        var position = 0;
        //$( ":mobile-pagecontainer" ).pagecontainer( "change", pages[0] );
        position = pages.indexOf("#" + $(':mobile-pagecontainer').pagecontainer('getActivePage').attr('id'));
        max = pages.length - 1;
        if (position < pages.length - 1) {
            position++;
            $(":mobile-pagecontainer").pagecontainer("change", pages[position], {
                transition: "slide"
            });
        }

    });

    $(document).on("swiperight", pages, function() {
        var position = 0;
        //$( ":mobile-pagecontainer" ).pagecontainer( "change", pages[0] );
        position = pages.indexOf("#" + $(':mobile-pagecontainer').pagecontainer('getActivePage').attr('id'));
        if (position > 0) {
            position--;
            $(":mobile-pagecontainer").pagecontainer("change", pages[position], {
                transition: "slide",
                reverse: true
            });
        }

    });
    /**
     * END SWIPE FUNCTIONS
     */

    /**
     * PAGECHANGE BIND take picture if not taked
     */
    $(document).on("pagechange", function() {
        var id = $(':mobile-pagecontainer').pagecontainer('getActivePage').attr('id');
        if (id == 'camera' && app.photoCaptured === false) {
            if (app.takePicture() !== false) {
                app.photoCaptured = true;
            }
        }
    });

    /**
     * ORIENTATION CHANGE BIND  for improve css
     */
    $(window).on("orientationchange", function(event) {
        if (event.orientation == 'portrait') {
            $('.center-div').css('margin-top', 100);

        } else {
            $('.center-div').css('margin-top', 30);

        }
        //Materialize.toast( "This device is in " + event.orientation + " mode!", 3000 );
    });

    /**
     * BUTTONS LISTENERS
     */
    document.getElementById('startCameraButton').addEventListener('click', app.takePicture, false);
    document.getElementById("getPosition").addEventListener("click", app.getPosition);
    document.getElementById("openModal").addEventListener("click", function() {
        if (app.photoCaptured === false) {
            Materialize.toast('Prima di inviare devi scattare una foto', 3000);
            return false;
        } else {
            $('#modalInvio').openModal();
        }

    });
    /**
     * Gallery Page function
     */
    document.getElementById('openGallery').addEventListener('click', function() {
        startSpinner();
        var code = '';
        $(":mobile-pagecontainer").pagecontainer("change", '#gallery', {
            transition: "flip"
        });
        firebase.database().goOnline();
        var ref = firebase.database().ref('/images/');
        if(device.uuid !== null){
          code = device.uuid.hashCode();
        }

        ref.orderByChild('user').equalTo(code).once('value').then(function(snapshot) {
            var prova = snapshot.val();
            $('#image-container').html('');
            if(prova !== null && prova !== ''){
              $.each(prova, function(index, element) {
                /*window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
                    var url = fs.root.getFile(element.image, {}, function (fileEntry) {

                        appendGalleryContent(fileEntry.toURL(),element);
                        return fileEntry.toURL();
                    }, onErrorReadFile);
                }, onErrorLoadFs);
                function onErrorReadFile(error){
                  readFirebaseGallery(element);
                }
                function onErrorLoadFs(error){
                  readFirebaseGallery(element);
                }*/
                readFirebaseGallery(element);


              });
              stopSpinner();
            }else{
              stopSpinner();
              return false;
            }

        }).catch(function(error) {
          Materialize.toast('Errore connessione: '+error, 3000);
          stopSpinner();
        });

    }, false);
    /**
     * SEND DATA LISTENER function use firebase for send image with data to database
     */
    document.getElementById("sendData").addEventListener("click", function() {
        var nota = $('#textarea1').val();
        if (app.photoCaptured === false) {
            Materialize.toast('Prima di inviare devi scattare una foto', 3000);
            return false;
        }
        startSpinner();
        var optionsPos = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 20000
        };

        var watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, optionsPos);

        function onSuccess(position) {

            /// Con firebase
            var code = '';
            var imageURI = document.getElementById('originalPicture').src;
            var fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
            //var fileUri = imageURI.substr(0,imageURI.lastIndexOf('/')+1);
            var storageRef = firebase.storage().ref();
            var data = (new Date(position.timestamp)).toISOString().substring(0, 19).replace('T', ' ');
            if (device.uuid === null || device.uuid === undefined) {
                code = fileName.hashCode();
            } else {
                code = device.uuid.hashCode();
            }
            var id = data.replace(/ /g, '_') + '-' + code;
            id = id.replace(/:/g,'-');

            var getFileBlob = function(url, cb) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url);
                xhr.responseType = "blob";
                xhr.addEventListener('load', function() {
                    cb(xhr.response);
                });
                xhr.send();
            };

            var blobToFile = function(blob, name) {
                blob.lastModifiedDate = new Date();
                blob.name = name;
                return blob;
            };

            var getFileObject = function(filePathOrUrl, cb) {
                getFileBlob(filePathOrUrl, function(blob) {
                    cb(blobToFile(blob, 'test.jpg'));
                });
            };

            getFileObject(imageURI, function(fileObject) {
                var uploadTask = storageRef.child('images/' + id + '.jpg').put(fileObject);
                //app.createFile(  id + '.jpg',fileObject);

                uploadTask.on('state_changed', function(snapshot) {
                    //console.log(snapshot);
                }, function(error) {
                    stopSpinner();
                    Materialize.toast("Errore salvataggio immagine: " + error, 3000);
                }, function() {
                    /*firebase.database().ref('images/'+id).set({
                        user: code,
                        image: id+'.jpg',
                        nota: nota,
                        timestamp: data,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                      },function(error) {
                          if (error) {
                            Materialize.toast("Errore salvataggio dati: "+error, 3000);
                            stopSpinner();
                          } else {
                            stopSpinner();
                            Materialize.toast('Immagine inviata con successo!', 3000 , 'rounded') ;
                            $('#textarea1').val("");
                          }
                        });*/
                    firebase.database().goOnline();
                    firebase.database().ref('images/' + id).set({
                        user: code,
                        image: id + '.jpg',
                        nota: nota,
                        timestamp: data,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }).then(function() {


                    }).catch(function(error) {
                      Materialize.toast('Errore scrittura database: '+error, 3000);
                      stopSpinner();

                    });
                    stopSpinner();
                    Materialize.toast('Immagine inviata con successo!', 3000, 'rounded');
                    $('#textarea1').val("");


                });
            });

        }

        function onError(error) {
            stopSpinner();
            Materialize.toast('Non siamo riusciti a leggere la tua posizione, controlla di avere il gps attivo!!', 4000);
            return false;
        }


    });

});

function deleteImage(elem){

  var storageRef = firebase.storage().ref();
  var desertRef = storageRef.child('images/'+elem);
  startSpinner();
  // Delete the file
  desertRef.delete().then(function() {
    firebase.database().ref('images/' + elem.substring(0,(elem.length-4)) ).remove();
    Materialize.toast('Immagine cancellata con successo!', 3000, 'rounded');
    document.getElementById(elem).parentElement.parentElement.parentElement.innerHTML = '';
    stopSpinner();

  }).catch(function(error) {
    Materialize.toast('Errore cancellazione immagine: '+error, 3000);
    stopSpinner();
  });
}



function readFirebaseGallery(element)
{
  startSpinner();
  var storageRef = firebase.storage().ref("images/" + element.image);
  storageRef.getDownloadURL().then(function(url) {

      //app.saveFileDownload(url,element.image);
      appendGalleryContent(url,element);

  }).catch(function(error) {
    Materialize.toast('Errore connessione: '+error, 3000);
    stopSpinner();
    return false;
  });
  stopSpinner();

}

function appendGalleryContent(url,element)
{
  $('#image-container').append('<div class="col s12 m6"><div class="card"><div class="card-image">' +
      '<img class="responsive-img" src="' + url + '"><span class="card-title">' + element.timestamp + '</span></div>' +
      '<div class="card-content"><p>' + element.nota + '</p></div>' + '<div class="card-action">' +
      '<a class="delete-image" onclick="deleteImage(this.id)" id="' + element.image + '" href="#">Cancella Immagine</a></div>'
  );

}

function cleanString(string) {
    return string.replace(/[|&;$%@"<>()+,./]/g, "");
}

/**
 * SIMPLE HASH CODE FUNCTION FOR STRING
 */
String.prototype.hashCode = function() {
    var hash = 0;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

/**
 * START AND STOP SPINNER FUNCTIONS
 */
function startSpinner() {
    $('.custom-spinner').css('z-index', 10);
}

function stopSpinner() {
    $('.custom-spinner').css('z-index', -10);
}
