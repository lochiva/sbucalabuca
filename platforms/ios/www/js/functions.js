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
 *  FUNCTIONS
 */

/**
 * Function that delete image in the firebase storage and the corresponding
 * data in the firebase database
 */
function deleteImage(elem) {

    var storageRef = firebase.storage().ref();
    var desertRef = storageRef.child('images/' + elem);
    startSpinner();
    // Delete the file
    desertRef.delete().then(function() {
        firebase.database().ref('images/' + elem.substring(0, (elem.length - 4))).remove();
        Materialize.toast('Immagine cancellata con successo!', 3000, 'rounded');
        document.getElementById(elem).parentElement.parentElement.parentElement.innerHTML = '';
        stopSpinner();

    }).catch(function(error) {
        Materialize.toast('Errore cancellazione immagine: ' + error, 3000);
        stopSpinner();
    });
}

/**
 * Function that read a image from firebase storage
 */
function readFirebaseGallery(element) {
    startSpinner();
    var storageRef = firebase.storage().ref("images/" + element.image);
    storageRef.getDownloadURL().then(function(url) {

        //app.saveFileDownload(url,element.image);
        appendGalleryContent(url, element);

    }).catch(function(error) {
        Materialize.toast('Errore connessione: ' + error, 3000);
        stopSpinner();
        return false;
    });
    stopSpinner();

}

/**
 * Function that append gallery content
 */
function appendGalleryContent(url, element) {
    $('#image-container').append('<div class="col s12 m6"><div class="card"><div class="card-image">' +
        '<img class="responsive-img" src="' + url + '"><span class="card-title">' + element.timestamp + '</span></div>' +
        '<div class="card-content"><p>' + element.nota + '</p></div>' + '<div class="card-action">' +
        '<a class="delete-image" onclick="deleteImage(this.id)" id="' + element.image + '" href="#">Cancella Immagine</a></div>'
    );

}

function cleanString(string) {
    return string.replace(/[|&;$%@"<>()+,./]/g, "");
}
/**
 * SIMPLE HASH CODE FUNCTION FOR STRING
 */
String.prototype.hashCode = function() {
    var hash = 0;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

/**
 * START AND STOP SPINNER FUNCTIONS
 */
function startSpinner() {
    $('.custom-spinner').css('z-index', 10);
}

function stopSpinner() {
    $('.custom-spinner').css('z-index', -10);
}
