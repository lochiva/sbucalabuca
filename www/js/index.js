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
    var config = firebaseConfig;
    // firebase initialize and sign in if not logged
    firebase.initializeApp(config);
    onAuthStateChanged();
    //Parse.initialize("sbuca");
    //Parse.serverURL = 'http://localhost:1337/parse';

    //var Images = Parse.Object.extend("images");
    //var query = new Parse.Query(Images);
    //console.log(query.find());

    // Set window dimension variables and map dimension
    app.windowHeight = window.innerHeight;
    app.windowWidth = window.innerWidth;
    $('#map').css('height', (app.windowHeight - 130));

    // firebase bind of connection event
    onConnectionStateChanged();

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
        if (position < max && position !== 0) {
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
     * APPLICATION EXIT LISTENER
     */
    window.onbeforeunload = function(e) {
        setStorage('sbuca-mapImagesUrl',JSON.stringify(app.mapImagesUrl));
        setStorage('sbuca-galleryImagesUrl',JSON.stringify(app.galleryImagesUrl));
    };

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
                var onSuccess = function(){
                  var newData = {
                    user: code,
                    image: id + '.jpg',
                    nota: nota,
                    timestamp: timeStamp,
                    date: data,
                    latitude: app.position.latitude,
                    longitude: app.position.longitude
                  };
                  var onSuccess = function(){
                    stopSpinner();
                    Materialize.toast('Immagine inviata con successo!', 3000, 'rounded');
                    $('#textarea1').val("");
                    reloadMarkers();
                  };
                  databasePushImage(id,newData,onSuccess);
                };
                storagePushImage(id,fileObject,onSuccess);
            
            });

        } else {
            stopSpinner();
            Materialize.toast('Non siamo riusciti a leggere la tua posizione, controlla di avere il gps attivo!!', 4000);
            app.watchPosition();
            return false;
        }


    });

});
