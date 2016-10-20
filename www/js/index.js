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
/**
 * INITIALIZE OF APPLICATION
 */
$(document).ready(function() {
    startSpinner();
    // app initialize
    app.initialize();
    // set timeZone difference
    app.timeZoneDifference = new Date().getTimezoneOffset() * 60000;
    // firebase configurations
    var config = {
        apiKey: "AIzaSyBAiA4VQdynEdIgKBJJOnCY3Mz6nGhjg74",
        authDomain: "sbuca-6248d.firebaseapp.com",
        databaseURL: "https://sbuca-6248d.firebaseio.com",
        storageBucket: "gs://sbuca-6248d.appspot.com",
        messagingSenderId: "851026370852"
    };
    // firebase initialize and sign in if not logged
    firebase.initializeApp(config);
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user)  {
            startSpinner();
            firebase.auth().signInAnonymously().catch(function(error) {

                var errorCode = error.code;
                var errorMessage = error.message;
                Materialize.toast('Errore connesione: ' + error.code + " " + error.message, 5000);
                app.firebaseConnected = false;

            });
            stopSpinner();
        } else {

        }
    });
    // Set window dimension variables and map dimension
    app.windowHeight = window.innerHeight;
    app.windowWidth = window.innerWidth;
    $('#map').css('height', (app.windowHeight - 130));

    // firebase bind of connection event
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

    /********************************************
     *  SWIPE FUNCTIONS
     * Functions that detect the swipe for moving the pages.
     *********************************************/
    var pages = ["#home", "#camera", "#gallery", "#info"];
    $(document).on("swipeleft", pages, function() {
        var position = 0;
        // read actual position
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
        // read actual position
        position = pages.indexOf("#" + $(':mobile-pagecontainer').pagecontainer('getActivePage').attr('id'));

        if (position > 0) {
            position--;
            $(":mobile-pagecontainer").pagecontainer("change", pages[position], {
                transition: "slide",
                reverse: true
            });
        }

    });
    /********************************************
     * END SWIPE FUNCTIONS
     *********************************************/

    /**
     * PAGECHANGE BIND take picture if not taked
     */
    $(document).on("pagechange", function() {
        var id = $(':mobile-pagecontainer').pagecontainer('getActivePage').attr('id');
        switch (id) {
            case 'camera':
                if (app.photoCaptured === false) {
                    if (app.takePicture() !== false) {
                        app.photoCaptured = true;
                    }
                }
                break;
            case 'home':
                google.maps.event.trigger(app.map, 'resize');
                break;
            case 'gallery':
                readFirebaseGallery();
                break;
        }
    });

    /**
     * ORIENTATION CHANGE BIND  for improve css
     */
    $(window).on("orientationchange", function(event) {

        if (event.orientation == 'portrait') {
            $('.app-title').show();
            $('.center-div').css('margin-top', 100);
            $('#map').css('height', (app.windowHeight - 130));

        } else {
            $('.center-div').css('margin-top', 30);
            $('.app-title').hide();
            $('#map').css('height', (app.windowWidth - 100));

        }
        google.maps.event.trigger(app.map, 'resize');

    });

    /********************************************
     * BUTTONS LISTENERS
     *********************************************/
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
     * SEND DATA LISTENER function use firebase for send image with data to the database
     */
    document.getElementById("sendData").addEventListener("click", function() {
        var nota = $('#textarea1').val();
        if (app.photoCaptured === false) {
            Materialize.toast('Prima di inviare devi scattare una foto', 3000);
            return false;
        }
        if (app.firebaseConnected === false) {
            Materialize.toast('Connettività assente', 3000);
            return false;
        }
        startSpinner();


        if (app.position.longitude !== '' && app.position.latitude !== '') {
            /// Con firebase
            var code = '';
            var imageURI = document.getElementById('originalPicture').src;
            var fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
            //var fileUri = imageURI.substr(0,imageURI.lastIndexOf('/')+1);
            var storageRef = firebase.storage().ref();
            var timeStamp = new Date().getTime();
            var data = (new Date(timeStamp - app.timeZoneDifference)).toISOString().substring(0, 19).replace('T', ' ');
            if (device.uuid === null || device.uuid === undefined) {
                code = fileName.hashCode();
            } else {
                code = device.uuid.hashCode();
            }
            var id = data.replace(/ /g, '_') + '-' + code;
            id = id.replace(/:/g, '-');

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
                    Materialize.toast("Errore salvataggio immagine: " + error, 5000);
                }, function() {

                    firebase.database().goOnline();
                    firebase.database().ref('images/' + id).set({
                        user: code,
                        image: id + '.jpg',
                        nota: nota,
                        timestamp: timeStamp,
                        date: data,
                        latitude: app.position.latitude,
                        longitude: app.position.longitude
                    }).then(function() {

                    }).catch(function(error) {
                        Materialize.toast('Errore scrittura database: ' + error, 5000);
                        stopSpinner();

                    });
                    stopSpinner();
                    Materialize.toast('Immagine inviata con successo!', 3000, 'rounded');
                    $('#textarea1').val("");

                    reloadMarkers();


                });
            });

        } else {
            stopSpinner();
            Materialize.toast('Non siamo riusciti a leggere la tua posizione, controlla di avere il gps attivo!!', 4000);
            return false;
        }


    });

});
