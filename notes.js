/*
 * Insert notes for slides that have them.
 */

var notes = {
    "pix/img-notes.jpg" : "Place note here",
}

function checkNotes(imgname) {
  var note = notes[imgname];
  if (note) {
    var noteArea = document.getElementById("notes");
    noteArea.innerHTML = note;
  }
}
