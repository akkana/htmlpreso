/*
 * Insert notes for slides that have them.
 */

var notes = {
    "pix/just-image.jpg" : "That way you don't have to make a zillion HTML files for all your images.<p>Also notice the image attribution in the lower right.",
    "pix/img-notes.jpg" : "Place note here.<p>The attribution goes in the same file, but in the variable <i>credits</i> rather than <i>notes</i> (see the next slide).",
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
