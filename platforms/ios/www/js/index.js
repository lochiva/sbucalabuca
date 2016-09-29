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
    startCamera: function(){
      document.getElementById('originalPicture').src = "";
      $('#originalPicture').attr("width",$(document).width()-50);
      var physicalScreenWidth = $(document).width();
      var physicalScreenHeight = $(document).height();
      width = physicalScreenWidth - 80;
      if(screen.orientation.angle === 0 || screen.orientation.angle == 180){
        heigth = physicalScreenHeight - $('#footerCamera').height() - $('#headerCamera').height() -30;

        //$('#originalPicture').attr("height","");
      }else{
        heigth = physicalScreenHeight - $('#footerCamera').height() - $('#headerCamera').height() -30;
        //$('#originalPicture').attr("width",$(document).width()-50);
        //$('#originalPicture').attr("height",height);
      }
      cordova.plugins.camerapreview.startCamera({x: 40, y: 70, width: width, height:heigth, camera: "back", tapPhoto: true, previewDrag: true, toBack: false});
      cordova.plugins.camerapreview.switchCamera();
      cordova.plugins.camerapreview.switchCamera();
    },

    stopCamera: function(){
      cordova.plugins.camerapreview.stopCamera();
    },

    takePicture: function(){
      cordova.plugins.camerapreview.takePicture();
    },

    switchCamera: function(){
      cordova.plugins.camerapreview.switchCamera();
    },

    show: function(){
      cordova.plugins.camerapreview.show();
    },

    hide: function(){
      cordova.plugins.camerapreview.hide();
    },
    initCamera: function(){

      //document.getElementById('originalPicture').src = "";
      this.startCamera();

      //console.log(physicalScreenWidth+" --- "+physicalScreenHeight);
        document.getElementById('startCameraButton').addEventListener('click', this.startCamera, false);
        //document.getElementById('stopCameraButton').addEventListener('click', this.stopCamera, false);
        document.getElementById('takePictureButton').addEventListener('click', this.takePicture, false);
        document.getElementById('switchCameraButton').addEventListener('click', this.switchCamera, false);
        //document.getElementById('showButton').addEventListener('click', this.show, false);
        //document.getElementById('hideButton').addEventListener('click', this.hide, false);
        //window.addEventListener('orientationchange', this.onStopCamera, false);

        //console.log(screen.orientation.angle);



        cordova.plugins.camerapreview.setOnPictureTakenHandler(function(result){

          document.getElementById('originalPicture').src = result[0]; //originalPicturePath;
          //document.getElementById('previewPicture').src = result[1]; //previewPicturePath;
          cordova.plugins.camerapreview.stopCamera();
        });
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
    var pages = ["#home","#info","#camera"];
    $( document ).on( "swipeleft", pages,function() {
      var position = 0;
          //$( ":mobile-pagecontainer" ).pagecontainer( "change", pages[0] );
      position = pages.indexOf("#"+$(':mobile-pagecontainer').pagecontainer( 'getActivePage' ).attr( 'id' ));
      max = pages.length-1;
      if(position < pages.length-1){
        position++;
        $( ":mobile-pagecontainer" ).pagecontainer( "change", pages[position], { transition: "slide" } );
      }

    });

    $( document ).on( "swiperight", pages, function() {
      var position = 0;
          //$( ":mobile-pagecontainer" ).pagecontainer( "change", pages[0] );
      position = pages.indexOf("#"+$(':mobile-pagecontainer').pagecontainer( 'getActivePage' ).attr( 'id' ));
        if(position > 0){
          position--;
          $( ":mobile-pagecontainer" ).pagecontainer( "change", pages[position], { transition: "slide", reverse: true } );
        }

    });

  $(document).on("pagechange",function(){
    var id = $(':mobile-pagecontainer').pagecontainer( 'getActivePage' ).attr( 'id' );
    if(id == 'camera'){
      app.initCamera();
    }else{

      app.stopCamera();
    }
  });
  window.addEventListener("orientationchange", function(){
    if(screen.orientation.angle === 0 || screen.orientation.angle == 180){
      $('.center-div').css('margin-top',100);
    }else{
      $('.center-div').css('margin-top',50);
    }
    var id = $(':mobile-pagecontainer').pagecontainer( 'getActivePage' ).attr( 'id' );
    if(id == 'camera'){

      app.stopCamera();
      //app.initCamera();
    }
  });
  document.getElementById("getPosition").addEventListener("click", getPosition);
  document.getElementById("watchPosition").addEventListener("click", watchPosition);

  function getPosition() {

     var options = {
        enableHighAccuracy: true,
        timeout: 3000,
        maximumAge: 3600000
     };

     var watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

     function onSuccess(position) {

        alert('Latitude: '          + position.coords.latitude          + '\n' +
           'Longitude: '         + position.coords.longitude         + '\n' +
           'Altitude: '          + position.coords.altitude          + '\n' +
           'Accuracy: '          + position.coords.accuracy          + '\n' +
           'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
           'Heading: '           + position.coords.heading           + '\n' +
           'Speed: '             + position.coords.speed             + '\n' +
           'Timestamp: '         + position.timestamp                + '\n');
     }

     function onError(error) {
        Materialize.toast('Non siamo riusciti a leggere la tua posizione, controlla di avere il gps attivo!!', 5000) ;
     }
  }

  function watchPosition() {

     var options = {
        maximumAge: 3600000,
        timeout: 3000,
        enableHighAccuracy: true,
     };

     var watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);

     function onSuccess(position) {

        alert('Latitude: '          + position.coords.latitude          + '\n' +
           'Longitude: '         + position.coords.longitude         + '\n' +
           'Altitude: '          + position.coords.altitude          + '\n' +
           'Accuracy: '          + position.coords.accuracy          + '\n' +
           'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
           'Heading: '           + position.coords.heading           + '\n' +
           'Speed: '             + position.coords.speed             + '\n' +
           'Timestamp: '         + position.timestamp                + '\n');
     }

     function onError(error) {
        alert('code: '    + error.code    + '\n' +'message: ' + error.message + '\n');
     }

  }
});
function takePhoto()
{
  navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
      destinationType: Camera.DestinationType.FILE_URI });
}

function onSuccess(imageURI) {
    var image = document.getElementById('myImage');
    image.src = imageURI;
}

function onFail(message) {
    alert('Failed because: ' + message);
}

/*
public void setCamera(Camera camera, int cameraId) {
    mCamera = camera;
    this.cameraId = cameraId;
    if (mCamera != null) {
      List<String> mFocusModes = mCamera.getParameters().getSupportedFocusModes();

      Camera.Parameters params = mCamera.getParameters();
      if (mFocusModes.contains("continuous-picture")) {
        params.setFocusMode(Camera.Parameters.FOCUS_MODE_CONTINUOUS_PICTURE);
      } else if (mFocusModes.contains("continuous-video")){
        params.setFocusMode(Camera.Parameters.FOCUS_MODE_CONTINUOUS_VIDEO);
      } else if (mFocusModes.contains("auto")){
        params.setFocusMode(Camera.Parameters.FOCUS_MODE_AUTO);
      }
      mCamera.setParameters(params);
        mSupportedPreviewSizes = mCamera.getParameters().getSupportedPreviewSizes();
        setCameraDisplayOrientation();
        //mCamera.getParameters().setRotation(getDisplayOrientation());
        //requestLayout();
    }
}
*/
