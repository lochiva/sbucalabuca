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
 * APPLICATION CORE
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

    createFile: function(name, dataObj) {
        var uri = window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {


            var url = fs.root.getFile(name, {
                create: true,
                exclusive: false
            }, function(fileEntry) {


                app.writeFile(fileEntry, dataObj);
                return fileEntry.fullPath;

            }, onErrorCreateFile);
            return url;
        }, onErrorLoadFs);

        function onErrorCreateFile(error) {
            Materialize.toast('Errore creazione file: ' + error.code + ' nome: ' + name, 3000);
            return false;

        }

        function onErrorLoadFs(error) {
            Materialize.toast('Errore caricamento directory: ' + error.code, 3000);
            return false;
        }

        return uri;

    },

    writeFile: function(fileEntry, dataObj) {
        // Create a FileWriter object for our FileEntry (log.txt).
        fileEntry.createWriter(function(fileWriter) {

            fileWriter.onwriteend = function() {
                //console.log("Successful file write...");
                //readFile(fileEntry);
                Materialize.toast("File scritto: " + fileEntry.toURL(), 3000);
                return fileEntry.fullPath;
            };

            fileWriter.onerror = function(e) {
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

    saveFileDownload: function(url, name) {

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';

        xhr.onload = function() {
            if (this.status == 200) {

                var blob = new Blob([this.response], {
                    type: 'image/jpg'
                });
                app.createFile(name, blob);
            }
        };
        xhr.send();
    },

    readFile: function(name) {

        var uri = window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {


            var url = fs.root.getFile(name, {}, function(fileEntry) {
                return fileEntry.toURL();
            }, onErrorCreateFile);

            return url;

        }, onErrorLoadFs);

        function onErrorCreateFile(error) {
            Materialize.toast('Errore lettura file: ' + error.code + ' nome: ' + name, 3000);
            return false;

        }

        function onErrorLoadFs(error) {
            Materialize.toast('Errore caricamento directory: ' + error.code, 3000);
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
    //
    photoCaptured: false,
    //
    firebaseConnected: true,
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
