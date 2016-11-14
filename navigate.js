// JavaScript Slide Presentation software.
// Copyright 2003-2016 by Akkana Peck.
// This software is licensed under the GNU public license v2 (or later) --
// Share and enjoy!

// See a presentation on how to use it at
// http://shallowsky.com/linux/presentations/

//
// Add the event listener.
// This has to be on keydown or keyup because webkit doesn't
// generate keypress events for nonprintable keys.
if (document.addEventListener) {	// DOM way
  document.addEventListener("keydown", onKeyDown, false);

  //document.addEventListener("keypress", onKeyPress, false);
}
else if (document.all)			// IE way
  document.attachEvent("onkeydown", onKeyDown);

/*
function onKeyPress(e) {
    alert("KeyPress: key = " + e.key + ", keyCode = " + e.keyCode + ", charCode = " + e.charCode);
    return;
}
*/

//
// Keypress navigation
function onKeyDown(e)
{
  // IE doesn't see the event argument passed in, so get it this way:
  if (window.event) e = window.event;

  /* Debugging stuff:
  if (typeof console != "undefined")
    console.log("key press, char code " + e.charCode + ", key code " + e.keyCode
                + ", " + e.ctrlKey + ", " + e.altKey + ", " + e.metaKey );
   */

  // Make sure things like desktop switching don't get caught here:
  if (e.ctrlKey || e.altKey || e.metaKey) {
    return;
  }
  // Don't do anything for Shift, Ctrl, Alt or Windows on their own:
  switch (e.keyCode) {
    case 16: case 17: case 18: case 91:
      return;
  }

  /*
  alert("key down: char code " + e.charCode + ", key code " + e.keyCode
        + ", " + e.shiftKey + ", " + e.ctrlKey + ", "
        + e.altKey + ", " + e.metaKey );
   */

  // We only use shift for one thing: the table of contents.
  // But some wireless presenters can send shift-F5,
  // which also calls up some performance window thing in firefox.
  if (e.shiftKey) {
    // alert("shift key! Plus " + e.keyCode);
    switch (e.keyCode) {
      case 33:    // Page Up
        tableOfContents();
        e.preventDefault();
        return false;

      case 116:   // F5, sent by some presenters, in Webkit
        // alert("Shift+F5: Supposedly called preventDefault()");
        tableOfContents();
        e.preventDefault();
        return false;
    }
    return;
  }

  // Mozilla uses charCode for printable characters, keyCode for unprintables.
  // Pull out the charCodes first:
  if (e.charCode) {
    switch (e.charCode) {
      case 32:
        nextSlide();
        e.preventDefault();
        return false;
      // The Logitech Presenter sends a period from the "blank screen" btn.
      // But most presenters seem to send b.
      case 46:
        blankScreen();
        e.preventDefault();
        return false;
    }
  }

  // Now keyCodes. There don't seem to be any cross-browser symbols for these.
  switch (e.keyCode) {
    case 32:    // Space
    case 34:    // Page Down
    case 40:    // Arrow Down
    case 39:    // Arrow Right
      nextSlide();
      e.preventDefault();
      return false;

    case 8:     // Backspace
    case 33:    // Page Up
    case 38:    // Arrow Up
    case 37:    // Arrow Left
      prevSlide();
      e.preventDefault();
      return false;

    case 36:    // Home
      firstSlide();
      e.preventDefault();
      return false;

    case 35:    // End
      lastSlide();
      e.preventDefault();
      return false;

      case 66:    // b
        blankScreen();
        e.preventDefault();
        return false;

    // Many presenters toggle between ESC and Shift-F5.
    // I think on PowerPoint it's supposed to toggle slideshow mode.
    // It's not clear if we need to watch for unshifted F5 like this.
    // Here, we could show a table of contents.
    case 27:     // Escape
    case 116:    // F5
      tableOfContents();
      e.preventDefault();
      return false;
  }
}

//
// Initialize anything needed to show points one by one.
// To use this, set up an ol or ul with id="points"
// and in the HTML body, call onload="initPoints()"
// By default nothing will be visible to begin with;
// if you want something visible, pass 1 or more as the argument.
//
var points;
var curPoint = 0;
var lastPoint;
function initPoints(num_vis)
{
  var numvis = (typeof(num_vis) == 'undefined' ? 1 : num_vis)

  // Set up the point nav:
  var pointList = document.getElementById("points");
  if (pointList) {
    points = pointList.getElementsByTagName("li");
    // Make the first point visible (they should all be invisible initially)
    //points[curPoint].style.visibility = "visible";
  }
  while (numvis > 0) {
    points[curPoint].style.visibility = "visible";
    curPoint = curPoint + 1;
    numvis = numvis - 1;
  }

  // Do any other page initialization we need:
  initPage();
}

function indexOfPage() {
  var url = document.URL;
  var question = document.URL.lastIndexOf("?");
  var lastslash;
  if (question > 0)
    lastslash = document.URL.lastIndexOf("/", question);
  else
    lastslash = document.URL.lastIndexOf("/");
  var filename = url.substring(lastslash+1, url.length);

  // JS 1.6 has Array.indexOf, but that doesn't work in Opera/Konq/etc.
  if (slides.indexOf) return slides.indexOf(filename);
  var i;
  for (i=0; i<slides.length; ++i) {
    if (slides[i] == filename) return i;
  }
  return 0;
}

function nextSlide() {
  // If there are multiple points on this slide, show the next point:
  if (points && curPoint < points.length) {
    // Make old-current point a more subtle color,
    // to emphasize only the new-current point.
    if (curPoint > 0)
        points[curPoint-1].setAttribute("class", "greyed");
    points[curPoint].style.visibility = "visible";
    curPoint = curPoint + 1;

    return;
  }

  // No next point -- go to the next slide instead.
  var i = indexOfPage();
  if (i >= slides.length - 1) {    // last slide
    //window.alert("That's the last slide");
    return;
  }
  window.location = slides[i+1];
}

function firstSlide() {
  window.location = slides[0];
}

function lastSlide() {
  window.location = slides[slides.length-1];
}

/* Toggle the screen black or not */
function blankScreen() {
  var allblack = document.getElementById("allblack");
  if (allblack) {
    var vis = allblack.style.visibility;
    if (vis == "hidden") {
      allblack.style.visibility = "visible";
    }
    else {
      allblack.style.visibility = "hidden";
    }
  }
  else {
    var body = document.getElementsByTagName("body")[0];
    allblack = document.createElement("div");
    allblack.id = "allblack";
    allblack.style.position = "absolute";
    allblack.style.left = "0";
    allblack.style.top = "0";
    allblack.style.width = "100%";
    allblack.style.height = "100%";
    allblack.style.background = "black";
    allblack.style.zIndex = 100;
    allblack.style.visibility = "visible";
    body.appendChild(allblack);
  }
}

function tableOfContents() {
  // First make a list of all our slides:
  var text = '<div id="contentspage">\n<div id="content">\n<h2>Table of Contents</h2>\n<small>';
  var i;
  for (i=0; i<slides.length; ++i)
    text += '<a href="' + slides[i] + '">' + slides[i] + '</a><br>\n'
  text += "</small>\n"
  body = document.getElementsByTagName("body")[0];
  body.innerHTML = text;
}

function prevSlide() {
  var i = indexOfPage();
  if (i <= 0) {    // last slide
    //window.alert("Already on the first slide");
    return;
  }
  window.location = slides[i-1];
}

function initPage() {
  var body = document.getElementsByTagName("body")[0];
  var nextdiv = document.createElement("div");
  nextdiv.id = "nextdiv";
  nextdiv.style.position = "absolute";
  body.appendChild(nextdiv);

  headers = document.getElementsByTagName("h1");
  if (headers && headers[0]) {
    // Add a title if there isn't already one, from the first H1:
    if (!document.title) {
      document.title = headers[0].innerHTML;
    }

    // Add a handler to <h1 class="title"> so that clicking on the
    // title will go to the next slide.
    if (headers[0].getAttribute("class") == "title") {
      headers[0].setAttribute("onClick", "nextSlide();");
    }
  }

  // Add the navigation span just inside the body tag.
  // On firefox, accesskeys use alt-shift.
  var navspan = document.createElement("span");
  navspan.setAttribute("id", "navigation");
  navspan.innerHTML = '<a href="#" accesskey="P" onclick="prevSlide(); return false;">Previous</a> | <a href="#" accesskey="N" onclick="nextSlide(); return false;">Next</a>';
  // Insert it at the beginning of the body, before the first child node:
  document.body.insertBefore(navspan, body.childNodes[0]);

  var i = indexOfPage();
  //window.alert("This is slide " + i);
  if (i >= slides.length - 1) {    // last slide
    nextdiv.innerHTML = "The end";
    return;
  }
  var nextname = slides[i+1];
  //nextname = new String(slides[i+1]);
  var slash = nextname.lastIndexOf('/');
  if (slash < 0)
    slash = 0;
  else
    slash += 1;
  var dot = nextname.lastIndexOf('.');
  if (dot < 0)
    nextdiv.innerHTML = "Next: " + nextname.substring(slash);
  else
    nextdiv.innerHTML = "Next: " + nextname.substring(slash, dot);
}
