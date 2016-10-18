function loadMap() {

    firebase.database().ref('/images/').once('value').then(function(snapshot) {

        var prova = snapshot.val();

        if (prova !== null && prova !== undefined) {

            var length = Object.keys(prova).length;
            var i = 1;
            var firstEle = prova[Object.keys(prova)[0]];
            var sumLat = 0,
                sumLng = 0,
                medLat = 0,
                medLng = 0;
            for (var key in prova) {
                sumLat += Number(prova[key].latitude);
                sumLng += Number(prova[key].longitude);
            }
            medLat = sumLat / length;
            medLng = sumLng / length;


            app.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 12,
                center: new google.maps.LatLng(medLat, medLng),
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

            var infowindow = new google.maps.InfoWindow;

            var marker;

            $.each(prova, function(index, element) {
                var storageRef = firebase.storage().ref("images/" + element.image);
                storageRef.getDownloadURL().then(function(url) {
                    /*$('.container-iamges').append('<div class="col s3">'+
                    '<div class="card">'+
                     '<div class="card-image">'+
                      '<img src="'+url+'"><span class="card-title">'+element.timestamp+'</span></div>'+
                      '<div class="card-content"><p>'+element.nota+'</p></div></div></div>');*/

                    marker = new google.maps.Marker({
                        position: new google.maps.LatLng(element.latitude, element.longitude),
                        map: app.map
                    });
                    //console.log(element.latitude);

                    google.maps.event.addListener(marker, 'click', (function(marker, i) {
                        return function() {
                            infowindow.setContent('<div class="row"><div class="col s12">' +
                                '<div class="card">' +
                                '<div class="card-image info-image">' +
                                '<img onclick="openModal(this.src)" src="' + url + '" class="responsive-img mouse-pointer"><span class="card-title">' + element.timestamp + '</span></div>' +
                                '<div class="card-content"><p>' + element.nota + '</p></div></div></div></div>');
                            infowindow.open(app.map, marker);
                        };
                    })(marker, i));

                });

                i++;
            });
        } else {
            app.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 12,
                center: new google.maps.LatLng(45.1075, 7.6690),
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
    }).catch(function(error) {
        Materialize.toast('Errore connessione: ' + error, 3000);
        stopSpinner();
        return false;
    });
}

function reloadMarkers(){
  firebase.database().ref('/images/').once('value').then(function(snapshot) {
      var prova = snapshot.val();

      if (prova !== null && prova !== undefined) {

          var i = 1;

          var infowindow = new google.maps.InfoWindow;

          var marker;

          $.each(prova, function(index, element) {
              var storageRef = firebase.storage().ref("images/" + element.image);
              storageRef.getDownloadURL().then(function(url) {
                  /*$('.container-iamges').append('<div class="col s3">'+
                  '<div class="card">'+
                   '<div class="card-image">'+
                    '<img src="'+url+'"><span class="card-title">'+element.timestamp+'</span></div>'+
                    '<div class="card-content"><p>'+element.nota+'</p></div></div></div>');*/

                  marker = new google.maps.Marker({
                      position: new google.maps.LatLng(element.latitude, element.longitude),
                      map: app.map
                  });
                  //console.log(element.latitude);

                  google.maps.event.addListener(marker, 'click', (function(marker, i) {
                      return function() {
                          infowindow.setContent('<div class="row"><div class="col s12">' +
                              '<div class="card">' +
                              '<div class="card-image info-image">' +
                              '<img onclick="openModal(this.src)" src="' + url + '" class="responsive-img mouse-pointer"><span class="card-title">' + element.timestamp + '</span></div>' +
                              '<div class="card-content"><p>' + element.nota + '</p></div></div></div></div>');
                          infowindow.open(app.map, marker);
                      };
                  })(marker, i));

              });

              i++;
          });
          google.maps.event.trigger(app.map,'resize');
      }
    }).catch(function(error) {
        Materialize.toast('Errore connessione: ' + error, 3000);
        stopSpinner();
        return false;
    });
}

function openModal(src) {
    $('#modal-image').openModal();
    $('#modal-img').attr("src", src);

}
