/*
 * Insert notes for slides that have them.
 */

var notes = {
    "pix/just-image.jpg" : "That way you don't have to make a zillion HTML files for all your images.",
    "pix/img-notes.jpg" : "Place note here",
}

var credits = {
    "pix/just-image.jpg" : "Image by me, using GIMP",
    "pix/img-notes.jpg" : "Image by me, using GIMP"
}

function checkNotes(imgname) {
    var note = notes[imgname];
    if (note) {
        var noteArea = document.getElementById("notes");
        noteArea.innerHTML = note;
    }
}
