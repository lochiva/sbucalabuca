$(document).ready(function() {
    window.markersList = [];
    window.map = '';
    var GlobalmarkersUrls = {};
    var markersUrls = getStorage('sbuca-markersUrls');
    if(markersUrls !== false){
      GlobalmarkersUrls = JSON.parse(markersUrls);
    }

    //$('.my-carousel').carousel();
    //$('.carousel').carousel();


    var config = {
        apiKey: "AIzaSyBAiA4VQdynEdIgKBJJOnCY3Mz6nGhjg74",
        authDomain: "sbuca-6248d.firebaseapp.com",
        databaseURL: "https://sbuca-6248d.firebaseio.com",
        storageBucket: "gs://sbuca-6248d.appspot.com",
        messagingSenderId: "851026370852"
    };
    firebase.initializeApp(config);
    firebase.auth().signInWithEmailAndPassword('sbuca.hosting@email.com', 'sbucahosting').catch(function(error) {

        var errorCode = error.code;
        var errorMessage = error.message;
        Materialize.toast('Connettività assente', 3000);

    });

    return firebase.database().ref('/images/').limitToLast(1500).once('value').then(function(snapshot) {
        var prova = snapshot.val();

        if (prova !== null && prova !== undefined) {

            var length = Object.keys(prova).length;
            var i = 0;
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


            window.map = new google.maps.Map(document.getElementById('map'), {
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
                if(GlobalmarkersUrls[index] === undefined){

                  var storageRef = firebase.storage().ref("images/" + element.image);
                  storageRef.getDownloadURL().then(function(url) {
                      /*$('.container-iamges').append('<div class="col s3">'+
                      '<div class="card">'+
                       '<div class="card-image">'+
                        '<img src="'+url+'"><span class="card-title">'+element.timestamp+'</span></div>'+
                        '<div class="card-content"><p>'+element.nota+'</p></div></div></div>');*/

                      marker = new google.maps.Marker({
                          position: new google.maps.LatLng(element.latitude, element.longitude),
                          map: map
                      });
                      //console.log(element.latitude);
                      marker.firebaseElement = element;
                      marker.firebaseUrlImage = url;
                      GlobalmarkersUrls[index] = url;

                      google.maps.event.addListener(marker, 'click', (function(marker, i) {
                          return function() {
                              infowindow.setContent('<div class="row"><div class="col s8">' +
                                  '<div class="card">' +
                                  '<div class="card-image info-image">' +
                                  '<img onclick="openModal(this.src)" src="' + url + '" class="responsive-img mouse-pointer"><span class="card-title">' + element.date + '</span></div>' +
                                  '<div class="card-content"><p>' + element.nota + '</p></div></div></div></div>');
                              infowindow.open(map, marker);
                          };
                      })(marker, i));
                      window.markersList[i] = marker;
                      i++;
                      if(i == length){console.log(GlobalmarkersUrls);
                        addMarkerCluster();
                        setStorage('sbuca-markersUrls',JSON.stringify(GlobalmarkersUrls));
                      }
                });

              }else{

                var url = GlobalmarkersUrls[index];
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(element.latitude, element.longitude),
                    map: map
                });
                //console.log(element.latitude);
                marker.firebaseElement = element;
                marker.firebaseUrlImage = url;


                google.maps.event.addListener(marker, 'click', (function(marker, i) {
                    return function() {
                        infowindow.setContent('<div class="row"><div class="col s8">' +
                            '<div class="card">' +
                            '<div class="card-image info-image">' +
                            '<img onclick="openModal(this.src)" src="' + url + '" class="responsive-img mouse-pointer"><span class="card-title">' + element.date + '</span></div>' +
                            '<div class="card-content"><p>' + element.nota + '</p></div></div></div></div>');
                        infowindow.open(map, marker);
                    };
                })(marker, i));
                window.markersList[i] = marker;
                i++;
                if(i == length){console.log(GlobalmarkersUrls);
                  addMarkerCluster();
                  setStorage('sbuca-markersUrls',JSON.stringify(GlobalmarkersUrls));
                }

              }


            });
        }else{
          var map = new google.maps.Map(document.getElementById('map'), {
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
    });



});

function openModal(src) {
    $('#modal-image').openModal();
    $('#modal-img').attr("src", src);

}

function addMarkerCluster(){
  markerCluster = new MarkerClusterer(window.map, window.markersList,
  {imagePath: 'img/markercluster/m'});
  markerCluster.setMaxZoom(21);
  markerCluster.onClickZoom = function(_cluster) { multiChoice(_cluster); };
  //app.markerCluster.onClickZoom = function() { return multiChoice(markerCluster); };
}

function multiChoice(_cluster) {

     // if more than 1 point shares the same lat/long
     // the size of the cluster array will be 1 AND
     // the number of markers in the cluster will be > 1
     // REMEMBER: maxZoom was already reached and we can't zoom in anymore

     var contentString = '<div class="row"><ul class="collection col s12"><li class="collection-header"><h4>Lista foto: </h4></li>';
     var element = '';

     if ( _cluster.markers_.length >= 1)
     {
        var markers = _cluster.markers_;
          for (var i=0; i < markers.length; i++)
          {     element = markers[i].firebaseElement;
                contentString +='<li class="collection-item avatar "> <img onclick="openModal(this.src)" src="' + markers[i].firebaseUrlImage + '" alt="" class="mouse-pointer circle">'+
                      '<b>Nota:</b> '+element.nota+' <b>Data:</b>: '+ element.date+'</li>';

          }

          /*contentString += '</ul><button onclick="app.openNavigator('+element.latitude+','+element.longitude+')" '+
          'class="waves-effect waves-light yellow darken-3 btn col s12">Portami qua</button></div>';*/

          var infowindow = new google.maps.InfoWindow({
            content: contentString,
            position: new google.maps.LatLng(_cluster.center_.lat(), _cluster.center_.lng()),
          });

          infowindow.open(window.map);

          return false;
     }

     return true;
}

function checkStorage() {
    if (typeof window.localStorage !== undefined) {
        return true;
    } else {
        return false;
    }
}

function setStorage(name, val) {
    if (checkStorage()) {
        if(val !== undefined && val !== null && val !== ''){
          localStorage.setItem(name, val);
          return true;
        }else{
          return false;
        }
    } else {
        return false;
    }
}

function getStorage(name) {
    var val = localStorage.getItem(name);
    if (val != undefined && val != null) {
        return val;
    } else {
        return false;
    }
}

function deleteStorage(name) {
    localStorage.removeItem(name);
}
