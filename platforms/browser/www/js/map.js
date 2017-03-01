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
  BEIGN MAP FUNCTIONS
*********************************************/
/**
*  Function that read images from database, load the map and add the buttons of
* the map.
*/
function loadMap(timeOut) {
  startSpinner();
    // In caso di assenza di connessione setto un timeout
    if(app.serverType == 'firebase' && app.firebaseConnected === false){
      setTimeout(function(timeOut){
        loadMap((timeOut+1));
      },500*timeOut);
      return false;
    }
    var onSuccess = function(elements){
      if (elements !== null && elements !== undefined) {
        var length = Object.keys(elements).length;
        var i = 1;
        //var firstEle = elements[Object.keys(elements)[0]];
        var sumLat = 0,
            sumLng = 0,
            medLat = 0,
            medLng = 0;
        for (var key in elements) {
            sumLat += Number(elements[key].latitude);
            sumLng += Number(elements[key].longitude);
        }
        medLat = sumLat / length;
        medLng = sumLng / length;

        var callback = function(){
              google.maps.event.addListenerOnce(app.map, 'idle', function () {
              // Fire when map tiles are completly loaded
              setZoomVisibleMarkers();
           });
        };
        paintMap(medLat,medLng);
        addMarkers(elements,callback);
        stopSpinner();

      } else {
        paintMap();
        stopSpinner();
      }
      /*var centerControlDiv = document.createElement('div');
      centerControlDiv.id = 'myControlMap';
       var centerControl = new CenterMyControl(centerControlDiv, app.map);

       centerControlDiv.index = 1;
       app.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);

       centerControlDiv = document.createElement('div');
       centerControlDiv.id = 'todayControlMap';
       centerControl = new CenterTodayControl(centerControlDiv, app.map);

      centerControlDiv.index = 2;
        app.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(centerControlDiv);*/
    };
    if(app.serverType == 'firebase'){
      readImagesForMap(onSuccess);
    }else{
      parseReadImagesForMap(onSuccess);
    }

}
/**
*  Function thta paint the map
*/
function paintMap(lat,lng){
  if(lat === undefined || lng === undefined){
    lat = 45.1075;
    lng = 7.6690;
  }
  app.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: new google.maps.LatLng(lat, lng),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      draggable: true,
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM,
      },
      styles: [{
          "featureType": "administrative",
          "elementType": "all",
          "stylers": [{
              "visibility": "on"
          }, {
              "lightness": 33
          }]
      }, {
          "featureType": "landscape",
          "elementType": "all",
          "stylers": [{
              "color": "#f2e5d4"
          }]
      }, {
          "featureType": "poi.park",
          "elementType": "geometry",
          "stylers": [{
              "color": "#c5dac6"
          }]
      }, {
          "featureType": "poi.park",
          "elementType": "labels",
          "stylers": [{
              "visibility": "on"
          }, {
              "lightness": 20
          }]
      }, {
          "featureType": "road",
          "elementType": "all",
          "stylers": [{
              "lightness": 20
          }]
      }, {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [{
              "color": "#c5c6c6"
          }]
      }, {
          "featureType": "road.arterial",
          "elementType": "geometry",
          "stylers": [{
              "color": "#e4d7c6"
          }]
      }, {
          "featureType": "road.local",
          "elementType": "geometry",
          "stylers": [{
              "color": "#fbfaf7"
          }]
      }, {
          "featureType": "water",
          "elementType": "all",
          "stylers": [{
              "visibility": "on"
          }, {
              "color": "#acbcc9"
          }]
      }]

  });
}
 /********************************************
*  END map functions
*********************************************/

 /********************************************
*   BEING MARKER FUNCTIONS
*********************************************/

function reloadMarkers() {
  startSpinner();
  if (app.firebaseConnected === false && app.serverType == 'firebase') {
      Materialize.toast('Connettività assente', 3000);
      stopSpinner();
      return false;
  }
    var callback = function(){
        var onSuccess = function(elements){
          if (elements !== null && elements !== undefined) {
            addMarkers(elements);
            google.maps.event.trigger(app.map, 'resize');
          }else{
            stopSpinner();
          }
        };
        if(app.serverType == 'firebase'){
          readImagesForMap(onSuccess);
        }else{
          parseReadImagesForMap(onSuccess);
        }

  };
  clearMarkers(callback);
}

function reloadMarkersMy(){
  startSpinner();
  if (app.firebaseConnected === false && app.serverType == 'firebase') {
      Materialize.toast('Connettività assente', 3000);
      stopSpinner();
      return false;
  }
  clearMarkers();

  var onSuccess = function(elements){
    if (elements !== null && elements !== undefined) {
      addMarkers(elements);
      google.maps.event.trigger(app.map, 'resize');
    }else{
      stopSpinner();
    }
    Materialize.toast('Mappa Aggiornata ', 3000,'rounded');
  };
  if(app.serverType == 'firebase'){
    readUserImagesForMap(onSuccess);
  }else{
    parseReadUserImagesForMap(onSuccess);
  }

}

function reloadMarkersToday(){
  startSpinner();
  if (app.firebaseConnected === false && app.serverType == 'firebase') {
      Materialize.toast('Connettività assente', 3000);
      stopSpinner();
      return false;
  }
  var callback = function(){

    var onSuccess = function(elements){
      if (elements !== null && elements !== undefined) {
        addMarkers(elements);
        google.maps.event.trigger(app.map, 'resize');
      }else{
        stopSpinner();
      }
      Materialize.toast('Mappa Aggiornata ', 3000,'rounded');
    };
    if(app.serverType == 'firebase'){
      readTodayImagesForMap(onSuccess);
    }else{
      parseReadTodayImagesForMap(onSuccess);
    }

  };

  clearMarkers(callback);

}

function addMarkers(elements,callback){
  startSpinner();
  var l = 0;
  var keys = Object.keys(elements);
  var lastIndex = keys[(keys.length-1)];
  var length =  Object.keys(elements).length;

  var marker;
  var height = 200;
  if(app.windowHeight >= 800){
    height = 250;
  }
  $.each(elements, function(index, element) {

      var url = '';
      if(app.serverType == "firebase"){
          if(app.mapImagesUrl[index] !== undefined){

              url = app.mapImagesUrl[index];
              marker = setMarkerAndInfoWindow(element,url);
              app.markers[l++] = marker;

              if(l == length){

                addMarkerCluster();
                if(callback !== undefined){
                  callback();
                }
              }

          }else{
            var onSuccess = function(url){
              app.mapImagesUrl[index] = url;
              marker = setMarkerAndInfoWindow(element,url);
              app.markers[l++] = marker;

              if(l == length){

                addMarkerCluster();
                if(callback !== undefined){
                  callback();
                }

              }
            };
            readImageUrl(element.image,onSuccess);

          }
      }else{
        url = element.image.url;//console.log(element);
        marker = setMarkerAndInfoWindow(element,url);
        app.markers[l++] = marker;

        if(l == length){

          addMarkerCluster();
          if(callback !== undefined){
            callback();
          }
        }

      }

  });

}
/**
* Add the MarkerClusterer class to the map, and personal function onClickZoom,
* for multiple Choiche when markers are in the same spot.
*/
function addMarkerCluster(){
  app.markerCluster = new MarkerClusterer(app.map, app.markers,
  {imagePath: 'js/assets/img/markercluster/m', maxZoom:21});
  app.markerCluster.setOnClickZoom(function(cluster) { multiChoice(cluster); }) ;
  //app.markerCluster.onClickZoom = function() { return multiChoice(markerCluster); };
  stopSpinner();

}

function setMarkerAndInfoWindow(element, url)
{
  app.infowindow = new google.maps.InfoWindow;
  var height = 200;
  if(app.windowHeight >= 800){
    height = 250;
  }

  marker = new google.maps.Marker({
      position: new google.maps.LatLng(element.latitude, element.longitude),
      map: app.map
  });

  marker.firebaseElement = element;
  marker.firebaseUrlImage = url;
  google.maps.event.addListener(marker, 'click', (function(marker) {
      return function() {
          app.infowindow.setContent('<div class="row"><div class="col s12">' +
              '<div class="card">' +
              '<div class="card-image info-image" style="height:'+height+'px;">' +
              '<img onclick="openModal(this.src)" src="' + url + '" class="responsive-img mouse-pointer"><span class="card-title text-card"">'+ element.date +
              (app.serverType == 'parse' ?' - Album: '+element.album.name:'' )+'</span></div>' +
              '<div class="card-content"><div class="row"><p class="col s12">' + escapeHtml(element.nota) + '</p><button onclick="app.openNavigator('+element.latitude+','+element.longitude+')"'+
              ' class="waves-effect waves-light yellow darken-3 btn col s12">Portami qua</button></div></div></div></div></div>');
          app.infowindow.open(app.map, marker);
          setTimeout(function(){ $('.info-image').css('height',''); }, 1000);
      };
  })(marker));

  return marker;

}

function clearMarkers(callback){
  if(app.markerCluster !== ''){
    app.markerCluster.clearMarkers();
  }
  $.each(app.markers, function(index, element) {
        app.markers[index].setMap(null);
  });
  app.markers = [];
  if(callback !== undefined){
    callback();
  }
}

 /********************************************
*   END Marker functions
*********************************************/

/********************************************
*   MAP CONTROL functions
*********************************************/
// Non usate più
/*function CenterMyControl(controlDiv, map) {

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = '#f9a825';
        controlUI.style.border = '2px solid #f9a825';
        controlUI.style.borderRadius = '3px';
        controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '22px';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Clicca per mostrare solo le mie';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.id = 'CenterMyControl-text';
        controlText.style.color = '#FFFFFF';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '16px';
        controlText.style.lineHeight = '38px';
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.innerHTML = 'Solo le mie';
        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function() {
          if($(this).children().html() == 'Solo le mie'){
            $(this).children().html('<i class="material-icons">undo</i>Annulla');
            reloadMarkersMy();
          }else{
            $(this).children().html('Solo le mie');
            $('#CenterTodayControl-text').html('Solo oggi');
            reloadMarkers();
          }

        });

}

function CenterTodayControl(controlDiv, map) {

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = '#f9a825';
        controlUI.style.border = '2px solid #f9a825';
        controlUI.style.borderRadius = '3px';
        controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '22px';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Clicca per mostrare solo quelle di oggi';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.id = 'CenterTodayControl-text';
        controlText.style.color = '#FFFFFF';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '16px';
        controlText.style.lineHeight = '38px';
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.innerHTML = 'Solo oggi';
        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function() {
          if($(this).children().html() == 'Solo oggi'){
            $(this).children().html('<i class="material-icons">undo</i>Annulla');
            reloadMarkersToday();
          }else{
            $(this).children().html('Solo oggi');
            $('#CenterMyControl-text').html('Solo le mie');
            reloadMarkers();
          }

        });

}*/

function showMapControls(){
  $('#myControlMap').css('z-index',0);
  $('#todayControlMap').css('z-index',0);
}
function hideMapControls(){
  $('#myControlMap').css('z-index',-1);
  $('#todayControlMap').css('z-index',-1);
}

function openModal(src) {
    $('#modal-image').openModal();
    $('#modal-img').attr("src", src);

}

function multiChoice(cluster) {

     // if more than 1 point shares the same lat/long
     // the size of the cluster array will be 1 AND
     // the number of markers in the cluster will be > 1
     // REMEMBER: maxZoom was already reached and we can't zoom in anymore

     var contentString = '<div class="row"><ul class="collection col s12"><li class="collection-header"><h4>Lista foto: </h4></li>';
     var element = '';
     var markers = cluster.getMarkers();
     //console.log(_cluster);
     if ( markers.length >= 1)
     {
        //markers = _cluster.markers_;
          for (var i=0; i < markers.length; i++)
          {     element = markers[i].firebaseElement;
                contentString +='<li class="collection-item avatar "> <img onclick="openModal(this.src)" src="' + markers[i].firebaseUrlImage + '" alt="" class="mouse-pointer circle">'+
                      '<b>Nota:</b> '+escapeHtml(element.nota)+' <b>Data:</b>: '+ element.date+(app.serverType == 'parse' ?' <b>Album:</b> '+element.album.name:'' )+'</li>';

          }

          contentString += '</ul><button onclick="app.openNavigator('+element.latitude+','+element.longitude+')" '+
          'class="waves-effect waves-light yellow darken-3 btn col s12">Portami qua</button></div>';

          app.infowindow = new google.maps.InfoWindow({
            content: contentString,
            position: new google.maps.LatLng(cluster.getCenter().lat(), cluster.getCenter().lng()),
          });

          app.infowindow.open(app.map);

          return false;
     }

     return true;
}
/**
*  Function for zoom out if no marker is found.
*/
function setZoomVisibleMarkers() {
    var bounds = app.map.getBounds(),
        count = 0;

    for (var i = 0; i < app.markers.length; i++) {
        //var marker = app.markers.markers[i];
            //infoPanel = $('.info-' + (i+1) ); // array indexes start at zero, but not our class names :)

        if(bounds.contains(app.markers[i].getPosition())===true) {

            count++;
        }

    }
    if(count === 0){
    	var zoom = app.map.getZoom();
      app.map.setZoom(zoom-1);
      setZoomVisibleMarkers();
    }

}
