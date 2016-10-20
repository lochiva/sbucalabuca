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
function loadMap() {
  startSpinner();

    firebase.database().ref('/images/').once('value').then(function(snapshot) {

        var elements = snapshot.val();

        if (elements !== null && elements !== undefined) {

            var length = Object.keys(elements).length;
            var i = 1;
            var firstEle = elements[Object.keys(elements)[0]];
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


            paintMap(medLat,medLng);

            addMarkers(elements);
            stopSpinner();

        } else {

          paintMap();
          stopSpinner();

        }

      var centerControlDiv = document.createElement('div');
      centerControlDiv.id = 'myControlMap';
       var centerControl = new CenterMyControl(centerControlDiv, app.map);

       centerControlDiv.index = 1;
       app.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);

       centerControlDiv = document.createElement('div');
       centerControlDiv.id = 'todayControlMap';
       centerControl = new CenterTodayControl(centerControlDiv, app.map);

        centerControlDiv.index = 2;
        app.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(centerControlDiv);

    }).catch(function(error) {
        Materialize.toast('Errore connessione: ' + error, 3000);
        stopSpinner();
        return false;
    });
}

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
    firebase.database().ref('/images/').once('value').then(function(snapshot) {
        var elements = snapshot.val();

        if (elements !== null && elements !== undefined) {

            addMarkers(elements);
            google.maps.event.trigger(app.map, 'resize');
        }else{
          stopSpinner();
        }

    }).catch(function(error) {
        Materialize.toast('Errore connessione: ' + error, 3000);
        stopSpinner();
        return false;
    });
}

function reloadMarkersMy(){
  startSpinner();
  var code = '';

  if (device.uuid !== null) {
      code = device.uuid.hashCode();
  }
  if (app.firebaseConnected === false) {
      Materialize.toast('Connettività assente', 3000);
      stopSpinner();
      return false;
  }
  clearMarkers();

  firebase.database().ref('/images/').orderByChild('user').equalTo(code).once('value').then(function(snapshot) {
      var elements = snapshot.val();

      if (elements !== null && elements !== undefined) {

          addMarkers(elements);
          google.maps.event.trigger(app.map, 'resize');

      }else{
        stopSpinner();
      }

      Materialize.toast('Mappa Aggiornata ', 3000,'rounded');
  }).catch(function(error) {
      Materialize.toast('Errore connessione: ' + error, 3000);
      stopSpinner();
      return false;
  });

}

function reloadMarkersToday(){
  startSpinner();
  if (app.firebaseConnected === false) {
      Materialize.toast('Connettività assente', 3000);
      stopSpinner();
      return false;
  }
  clearMarkers();
  var start = new Date().getTime()-(60*60*24*1000);
  firebase.database().ref('/images/').orderByChild('timestamp').startAt(start).once('value').then(function(snapshot) {
      var elements = snapshot.val();

      if (elements !== null && elements !== undefined) {

          addMarkers(elements);
          google.maps.event.trigger(app.map, 'resize');
      }else{
        stopSpinner();
      }
      Materialize.toast('Mappa Aggiornata ', 3000,'rounded');
  }).catch(function(error) {
      Materialize.toast('Errore connessione: ' + error, 3000);
      stopSpinner();
      return false;
  });

}

function addMarkers(elements){
  startSpinner();
  var i = 1;
  var keys = Object.keys(elements);
  var lastIndex = keys[(keys.length-1)];
  var infowindow = new google.maps.InfoWindow;

  var marker;

  $.each(elements, function(index, element) {
      var storageRef = firebase.storage().ref("images/" + element.image);
      storageRef.getDownloadURL().then(function(url) {


          marker = new google.maps.Marker({
              position: new google.maps.LatLng(element.latitude, element.longitude),
              map: app.map
          });
          //console.log(element.latitude);

          google.maps.event.addListener(marker, 'click', (function(marker, i) {
              return function() {
                  infowindow.setContent('<div class="row"><div class="col s12">' +
                      '<div class="card">' +
                      '<div class="card-image info-image" style="height:200px;">' +
                      '<img onclick="openModal(this.src)" src="' + url + '" class="responsive-img mouse-pointer"><span class="card-title text-card"">'+ element.date + '</span></div>' +
                      '<div class="card-content"><div class="row"><p class="col s12">' + element.nota + '</p><button onclick="app.openNavigator('+element.latitude+','+element.longitude+')"'+
                      ' class="waves-effect waves-light yellow darken-3 btn col s12">Portami qua</button></div></div></div></div></div>');
                  infowindow.open(app.map, marker);
                  setTimeout(function(){ $('.info-image').css('height',''); }, 1000);
              };
          })(marker, i));
          app.markers.push(marker);
          if(index == lastIndex){
            stopSpinner();
          }

      });

      i++;
  });

}

function clearMarkers(){
  $.each(app.markers, function(index, element) {
        app.markers[index].setMap(null);
  });

  app.markers = [];
}

 /********************************************
*   END Marker functions
*********************************************/

function CenterMyControl(controlDiv, map) {

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
        controlText.style.color = 'rgb(25,25,25)';
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
        controlText.style.color = 'rgb(25,25,25)';
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

}

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
