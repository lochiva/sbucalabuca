$(document).ready(function() {

    //$('.my-carousel').carousel();
    //$('.carousel').carousel();


    var config = {
        apiKey: "AIzaSyBd10R4YgN46rRg6w3gkOvwi4KvRvxkFNE",
        authDomain: "iotaapp-da647.firebaseapp.com",
        databaseURL: "https://iotaapp-da647.firebaseio.com/",
        storageBucket: "gs://iotaapp-da647.appspot.com",
      };
    firebase.initializeApp(config);
    firebase.auth().signInWithEmailAndPassword('info@itoa.it', 'passworditoa').catch(function(error) {

        var errorCode = error.code;
        var errorMessage = error.message;
        Materialize.toast('Connettività assente', 3000 );

      });

  return firebase.database().ref('/images/').once('value').then(function(snapshot) {
    var prova = snapshot.val();
    var length =Object.keys(prova).length;
    var i = 1;
    var firstEle = prova[Object.keys(prova)[0]];

    var map = new google.maps.Map(document.getElementById('map'), {
         zoom: 14,
         center: new google.maps.LatLng(firstEle.latitude,firstEle.longitude),
         mapTypeId: google.maps.MapTypeId.ROADMAP,
         draggable: true

    });

    var infowindow = new google.maps.InfoWindow;

    var marker;

    $.each(prova, function( index, element ) {
      var storageRef = firebase.storage().ref("images/"+element.image);
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

          google.maps.event.addListener(marker, 'click', (function(marker, i) {
               return function() {
                   infowindow.setContent('<div class="row"><div class="col s8">'+
                       '<div class="card">'+
                        '<div class="card-image">'+
                         '<img src="'+url+'"><span class="card-title">'+element.timestamp+'</span></div>'+
                         '<div class="card-content"><p>'+element.nota+'</p></div></div></div></div>');
                   infowindow.open(map, marker);
               };
          })(marker, i));

      });

      i++;
    });
  });



});
