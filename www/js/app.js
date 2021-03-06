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
  /********************************************
   PROPRIETIES
 *********************************************/
    photoCaptured: false,

    position: {
        longitude: '',
        latitude: '',
        timestamp: ''
    },
    map: '',
    markers: [],
    infoWinodw: '',
    mapImagesUrl: {},
    galleryImagesUrl: {},
    markerCluster: '',
    windowHeight: '',
    windowWidth: '',
    timeZoneDifference: '',
    strating: true,
    serverType: 'firebase',
    userCode: new Date().toString(),
    parseUserAlbums: [],
    parseUser:{},
    parseCustomer:{},
    parseEditingAlbum: '',
    //
    firebaseConnected: false,
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    cleanCache: function(length){
      var i = 0;
      $.each(app.mapImagesUrl, function(index,element){
        i++;
        if(i<length/2){
          delete app.mapImagesUrl[index];
        }

      });
    },
    generateUserCode : function(){
      if(device.uuid !== undefined && device.uuid !== null){
        app.userCode = device.uuid.hashCode();
      }else if(device.serial !== undefined && device.serial !== null){
        app.userCode = device.serial.hashCode();
      }else{
        app.userCode = app.userCode.hashCode();
      }
    },
    /**
     * TAKE PICTURE FUNCTION
     */
    takePicture: function() {
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 40,
            correctOrientation: true,
            destinationType: Camera.DestinationType.FILE_URI
        });

        function onSuccess(imageURI) {
            document.getElementById('originalPicture').src = imageURI;
            return imageURI;
        }

        function onFail(message) {
            Materialize.toast('Errore scatto foto: ' + message, 5000);
            return false;
        }

    },
    /**
     * GET POSITION FUNCTION FOR GEOLOCALIZATION
     */
    getPosition: function(dialog) {
        startSpinner();
        if (app.position.longitude !== '' && app.position.latitude !== '') {

            alert('Latitudine: ' + app.position.longitude + '\n' +
                'Longitudine: ' + app.position.latitude + '\n' +
                'Data ed ora della posizione: ' + (new Date(app.position.timestamp - app.timeZoneDifference)).toISOString().substring(0, 19).replace('T', ' '));
            stopSpinner();

        } else {

            stopSpinner();
            Materialize.toast('Non siamo riusciti a leggere la tua posizione, controlla di avere il gps attivo!!', 5000);
            app.watchPosition();
            return false;

        }



    },

    watchPosition: function() {
        function onSuccess(position) {
            app.position.latitude = position.coords.latitude;
            app.position.longitude = position.coords.longitude;
            app.position.timestamp = position.timestamp;

        }

        // onError Callback receives a PositionError object
        //
        function onError(error) {

        }

        // Options: throw an error if no update is received every 30 seconds.
        //
        var watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
            maximumAge: 20000,
            timeout: 30000,
            enableHighAccuracy: true
        });

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
    /**
     * Function that check the info and read from localstorage or firebase
     */
    readInfo: function() {
        if ( app.firebaseConnected === false) {

            var info = getStorage('sbuca.info-text');
            if (info === false) {
              if(app.serverType == 'firebase'){
                readInfoFirebase();
              }
            } else {
                $('#info-text').html(info);
            }

        } else {
            readInfoFirebase();
        }

    },

    loginSingUpParse: function(type){
      startSpinner();
      var email = $("#email").val();
      var pass = $('#password').val();
      if(email === '' || pass === ''){
        Materialize.toast("Assicurati di aver inserito un email o una password." , 5000);
        return false;
      }
      parseInit();
      var onSuccess = function(){
        var success = function(){reloadMarkers();};
        parseReadUserAlbums(success);
        app.serverType = 'parse';


        $('.showIfParse').show();
        $('.showIfFirebase').hide();
        parseCheckIfCustomer();
        $('.filter-map').attr('checked', false);
        $(":mobile-pagecontainer").pagecontainer("change", "#home", {transition: "flip",reverse:true});
      };
      if(type == 'login'){
        parseLogin(email,pass,onSuccess);
      }else{
        parseSignUp(email,pass,onSuccess);
      }
    },

    logoutParse: function(){
      startSpinner();
      Parse.User.logOut();

      $('.showIfParse').hide();
      $('.showIfFirebase').show();
      app.serverType = 'firebase';
      if(app.firebaseConnected === false){
        firebaseInit();
      }
      setTimeout(function() {
          $('.filter-map').attr('checked', false);
          $(":mobile-pagecontainer").pagecontainer("change", "#home", {transition: "flip",reverse:true});
          reloadMarkers();
      }, 1500);
    },

    onOnline: function() {
        app.loadMapsApi();
    },

    onResume: function() {

        app.loadMapsApi();
    },
    onPause: function(){
      setStorage('sbuca-mapImagesUrl',JSON.stringify(app.mapImagesUrl));
      setStorage('sbuca-galleryImagesUrl',JSON.stringify(app.galleryImagesUrl));
    },
    loadMapsApi: function() {
        if (navigator.connection.type === Connection.NONE || app.map !== '') {
          if(app.map === ''){
            $('#map').html('<h5>Connessione assente</h5>');
          }
            return;
        }
        if(app.map === ''){
          $('#map').html('');
        }
        $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyDQRGGpSnZPgJBYhC1UaEfjXAJ6BUCuBBQ&libraries=geometry&sensor=true&callback=app.onMapsApiLoaded');
    },

    onMapsApiLoaded: function() {
        // Maps API loaded and ready to be used.
        loadMap(1);

    },

    openNavigator: function(cord1,crod2){
      launchnavigator.navigate([cord1, crod2]);
    },

    exitApp: function()
    {
        navigator.app.exitApp();
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
        var imagesUrl = getStorage('sbuca-mapImagesUrl');
        if(imagesUrl !== false){
          app.mapImagesUrl = JSON.parse(imagesUrl);
          var length = Object.keys(app.mapImagesUrl).length;
          if(length > 1200){
            app.cleanCache(length);
          }
        }
        var myImagesUrl = getStorage('sbuca-galleryImagesUrl');
        if(myImagesUrl !== false){
          app.galleryImagesUrl = JSON.parse(myImagesUrl);
        }
        parseInit();
        if(Parse.User.current() !== null && Parse.User.current().authenticated() ){
          var success = function(){reloadMarkers();};
          parseReadUserAlbums(success);
          app.serverType = 'parse';

          $('.showIfParse').show();
          $('.showIfFirebase').hide();
          parseCheckIfCustomer();
        }else{
          firebaseInit();
        }


        app.generateUserCode();
        //parseInit();parseLogin();
        stopSpinner();
        setTimeout(function() {
            app.strating = false;
            app.readInfo();
        }, 2000);
        app.receivedEvent('deviceready');
        document.addEventListener("online", app.onOnline, false);
        document.addEventListener("resume", app.onResume, false);
        document.addEventListener("pause", app.onPause, false);
        app.loadMapsApi();
        app.watchPosition();

        //app.init();
        //console.log($(document).height()+" ---  "+$(document).width());
    },
    //
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        /*var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');*/

        console.log('Received Event: ' + id);
    }
};
