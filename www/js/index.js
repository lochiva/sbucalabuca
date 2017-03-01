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

    // Set window dimension variables and map dimension
    app.windowHeight = window.innerHeight;
    app.windowWidth = window.innerWidth;
    $('#map').css('height', (app.windowHeight - 220));

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
        if (position < max && position !== 0 && position !== -1) {
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

        if (position > 0 && position !== -1) {
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
    * PAGEBEFORECHANGE BIND
    */
    $(document).on("pagebeforechange", function( event, data ) {
      
    });
    /**
     * PAGECHANGE BIND take picture if not taked
     */
    $(document).on("pagechange", function() {
        var id = $(':mobile-pagecontainer').pagecontainer('getActivePage').attr('id');
        // Nel caso che non si è in una delle pagine principali bisogna nascondere l'header fittizzio
        if(id == 'admin-album'){
          $('#false-header').hide();
        }else{
          $('#false-header').show();
        }
        // Azioni da eseguire a seconda della pagina caricata
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
                readUserGallery();
                break;
            case 'admin-album':
                var album = $('#album-admin').val();
                $('#lista-utenti').html('');
                $('#edit-AlbumName').val('');
                if(album === null || album === undefined){
                  album = app.parseEditingAlbum;
                }
                if(album === null || album === undefined){
                  Materialize.toast('Non hai selezionato un album !', 5000);
                  break;
                }
                $('#edit-AlbumName').val(app.parseUserAlbums[album].get('name'));
                var success = function(results){
                  if(results !== null){
                    for (var i = 0; i < results.length; i++) {
                      $('#lista-utenti').append('<li class="collection-item">'+results[i].get('user').get('email')+'</li>');
                    }
                  }
                  stopSpinner();
                };
                parseUserPerAlbum(app.parseUserAlbums[album],success);
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
            $('#map').css('height', (app.windowHeight - 220));

        } else {
            $('.center-div').css('margin-top', 30);
            $('.app-title').hide();
            $('#map').css('height', (app.windowWidth - 170));

        }
        google.maps.event.trigger(app.map, 'resize');

    });

    /********************************************
     * BUTTONS LISTENERS
     *********************************************/
    document.getElementById('startCameraButton').addEventListener('click', app.takePicture, false);
    document.getElementById('getPosition').addEventListener('click', app.getPosition,false);
    document.getElementById('exitApp').addEventListener('click',app.exitApp,false);
    document.getElementById("openModal").addEventListener("click", function() {
        if (app.photoCaptured === false) {
            Materialize.toast('Prima di inviare devi scattare una foto', 3000);
            return false;
        } else {
            $('#modalInvio').openModal();
        }

    });
    document.getElementById("filtri").addEventListener("click", function() {
        
        $('#modal-filtri').openModal();
       

    });
    // PARSE BUTTONS
    document.getElementById('getLogout').addEventListener('click',app.logoutParse,false);
    document.getElementById('parseLogin').addEventListener('click',function(){
      app.loginSingUpParse('login');
    },false);
    document.getElementById('parseSignUp').addEventListener('click',function(){
      app.loginSingUpParse('singup');
    },false);
    document.getElementById("getLogin").addEventListener("click", function(){
      $(":mobile-pagecontainer").pagecontainer("change", "#login-parse", {
          transition: "flip"
      });
    });
    // PARSE ADMIN BUTTONS
    document.getElementById("getAdmin").addEventListener("click", function(){
      $(":mobile-pagecontainer").pagecontainer("change", "#admin-parse", {
          transition: "flip"
      });
    });
    document.getElementById("getAdmin-album").addEventListener("click", function(){
      app.parseEditingAlbum = $('#album-admin').val();
      $(":mobile-pagecontainer").pagecontainer("change", "#admin-album", {
          transition: "flip"
      });
    });
    // Creazione Album
    document.getElementById("createAlbum").addEventListener("click", function(){
        var album = $('#newAlbum').val();
        var onSuccess =  function(){
          Materialize.toast("Album aggiunto con successo !", 3000, 'rounded');
          $('#newAlbum').val('');
          parseReadUserAlbums();
          stopSpinner();
        };
        if(album !== ''){
          parseAddAlbum(album,onSuccess);
        }else{
          Materialize.toast('Devi inserire un nome valido per l\'album.',5000);
        }
    });
    // Gestione utenti Album
    document.getElementById("addUserAlbum").addEventListener("click", function(){
      var album = app.parseEditingAlbum;
      var userEmail = $('#user-UserAlbum').val();
      var onSuccess = function(){
        if(album !== null && album !== undefined){
          if(app.parseUser == {} || app.parseUser === null ){
            Materialize.toast('Seleziona un utente presente in database !',5000);
            return false;
          }
          var success = function(){
            $(":mobile-pagecontainer").pagecontainer("change", "#admin-album", {
                transition: "fade"
            });
          };
          parseAddUserAlbum(app.parseUser, app.parseUserAlbums[album],success);
        }else{
          Materialize.toast('Devi selezionare un album !',5000);
        }

      };
      parseSearchUser(userEmail,onSuccess);

    });
    document.getElementById("removeUserAlbum").addEventListener("click", function(){
      var album = app.parseEditingAlbum;
      var userEmail = $('#user-UserAlbum').val();
      var onSuccess = function(){
        if(album !== null && album !== undefined){
          if(app.parseUser == {} || app.parseUser === null ){
            Materialize.toast('Seleziona un utente presente in database !',5000);
            return false;
          }
          var success = function(){
            $(":mobile-pagecontainer").pagecontainer("change", "#admin-album", {
                transition: "fade"
            });
          };
          parseDeleteUserAlbum(app.parseUser, app.parseUserAlbums[album],success);
        }else{
          Materialize.toast('Devi selezionare un album !',5000);
        }

      };
      parseSearchUser(userEmail,onSuccess);


    });
    // Edit Delete Album
    document.getElementById("edit-AlbumName").addEventListener('blur', function(){
      var album = app.parseEditingAlbum;
      if(album === null || album === undefined){
        Materialize.toast('Non hai selezionato un album !', 5000);
        return false;
      }
      var name = $('#edit-AlbumName').val();
      if(name === null || name === undefined || name === ''){
        Materialize.toast('Devi inserire un nome !', 5000);
        return false;
      }
      app.parseUserAlbums[album].set("name",name);
      var success = function(){
        stopSpinner();
        parseReadUserAlbums();
        Materialize.toast('Nome modificato !', 3000, 'rounded');
      };
      parseEditAlbum(app.parseUserAlbums[album],success);
    });
    document.getElementById("deleteAlbum").addEventListener("click", function(){
      var album = app.parseEditingAlbum;
      if(album === null || album === undefined){
        Materialize.toast('Non hai selezionato un album !', 5000);
        return false;
      }
      var success = function(){
        stopSpinner();
        parseReadUserAlbums();
        Materialize.toast('Album eliminato !', 3000, 'rounded');
        $(":mobile-pagecontainer").pagecontainer("change", "#admin-parse", {
            transition: "flip", reverse:true
        });
      };
      parseDeleteAlbum(app.parseUserAlbums[album],success);
    });
    /********************************************
     * OTHER LISTENERS
     *********************************************/
     document.getElementById('user-UserAlbum').addEventListener('blur',function(){
       var userEmail = $('#user-UserAlbum').val();
       if(userEmail !== ''){
         parseSearchUser(userEmail);
       }
       },false);
     document.getElementById('album-map').addEventListener('change',function(){
       reloadMarkers();
       $('#album-gallery').val($('#album-map').val());
     },false);
     document.getElementById('album-gallery').addEventListener('change',function(){
       $('#album-map').val($('#album-gallery').val());
       reloadMarkers();
       readUserGallery();
     },false);
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
        if (app.firebaseConnected === false && app.serverType == 'firebase') {
            Materialize.toast('Connettività assente', 3000);
            return false;
        }
        startSpinner();


        if (app.position.longitude !== '' && app.position.latitude !== '') {
            /// Con firebase
            var code = app.userCode;
            var imageURI = document.getElementById('originalPicture').src;
            var fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
            //var fileUri = imageURI.substr(0,imageURI.lastIndexOf('/')+1);

            var timeStamp = new Date().getTime();
            var data = (new Date(timeStamp - app.timeZoneDifference)).toISOString().substring(0, 19).replace('T', ' ');
            /*if (device.uuid === null || device.uuid === undefined) {
                code = fileName.hashCode();
            } else {
                code = device.uuid.hashCode();
            }*/
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
              var newData = {
                user: code,
                image: id + '.jpg',
                nota: nota,
                timestamp: timeStamp,
                date: data,
                latitude: app.position.latitude,
                longitude: app.position.longitude
              };
              var onSuccessData = function(){
                stopSpinner();
                Materialize.toast('Immagine inviata con successo!', 3000, 'rounded');
                $('#textarea1').val("");
                document.getElementById('closeModal').click();
                reloadMarkers();
              };
              if(app.serverType == 'firebase'){
                  var onSuccess = function(){

                    databasePushImage(id,newData,onSuccessData);
                  };
                  storagePushImage(id,fileObject,onSuccess);
              }else{
                  newData.user = Parse.User.current();
                  newData.album = app.parseUserAlbums[$('#album-list').val()];
                  if(newData.album === null || newData.album  === '' || newData.album === undefined){
                    Materialize.toast('Devi selezionare un album !', 5000);
                    stopSpinner();
                    return false;
                  }
                  parseUploadImage(id,fileObject,newData,onSuccessData);
              }

            });

        } else {
            stopSpinner();
            Materialize.toast('Non siamo riusciti a leggere la tua posizione, controlla di avere il gps attivo!!', 4000);
            app.watchPosition();
            return false;
        }


    });

});
