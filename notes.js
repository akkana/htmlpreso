/*
 * Insert notes for slides that have them.
 */

var notes = {
    "pix/just-image.jpg" : "Currently notes are per image, so if you show it once without a title and later with one, the notes will be the same.",
    "pix/img-notes.jpg" : "Place note here",
}

function checkNotes(imgname) {
    var note = notes[imgname];
    if (note) {
        var noteArea = document.getElementById("notes");
        noteArea.innerHTML = note;
    }
}
