/*
 * Insert notes for slides that have them.
 */

var notes = {
    "pix/foo.jpg" : "notes here",
}

function checkNotes(imgname) {
  var note = notes[imgname];
  if (note) {
    var noteArea = document.getElementById("notes");
    noteArea.innerHTML = note;
  }
}
