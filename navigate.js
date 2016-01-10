// JavaScript Slide Presentation software.
// Copyright 2003-2014 by Akkana Peck.
// This software is licensed under the GNU public license v2 (or later) --
// Share and enjoy!

// See a presentation on how to use it at
// http://shallowsky.com/linux/presentations/

//
// Slide navigation. List your slides here, in order.
//
var slides = new Array ("index.html",
                         "what.html",
                         "navigation.html",
                         "settingup.html",
                         "eachslide.html",
                         "navspan.html", "navspan2.html", "navspan3.html",
                         "lists.html",
                         "lists-how.html", "lists-how2.html",
                         "lists-nobullets.html",
                         "cssclasses.html",
                         "notes.html",
                         "img.html?pix/just-image.jpg",
                         "img.html?pix/img-notes.jpg",
                         "tips.html",
                         "download.html",
                         "conclusion.html"
);

//
// Add the event listener.
// This has to be on keydown or keyup because webkit doesn't
// generate keypress events for nonprintable keys.
if (document.addEventListener) {	// DOM way
  //document.addEventListener("keypress", onKeyPress, false);
  //document.addEventListener("keyup", onKeyPress, false);
  document.addEventListener("keydown", onKeyPress, false);
}
else if (document.all)			// IE way
  document.attachEvent("onkeypress", onKeyPress);

/*
function onKeyUp(e)
{
  alert("key up, char code " + e.charCode + ", key code " + e.keyCode );
}
*/

//
// Keypress navigation
function onKeyPress(e)
{
  // IE doesn't see the event argument passed in, so get it this way:
  if (window.event) e = window.event;

  //alert("key press, char code " + e.charCode + ", key code " + e.keyCode
  //      + ", " + e.ctrlKey + ", " + e.altKey + ", " + e.metaKey );
  /* For debugging, turn this on:
  if (typeof console != "undefined")
    console.log("key press, char code " + e.charCode + ", key code " + e.keyCode
                + ", " + e.ctrlKey + ", " + e.altKey + ", " + e.metaKey );
   */

  // Make sure things like desktop switching don't get caught here:
  if (e.ctrlKey || e.altKey || e.metaKey) {
    return;
  }

  // We only use shift for one thing: the table of contents.
  if (e.shiftKey) {
    switch (e.keyCode) {
      case 33:    // e.DOM_VK_PAGE_UP:
      case 33:    // e.DOM_VK_PAGE_UP:
        tableOfContents();
        e.preventDefault();
    }
    return;
  }

  // Mozilla uses charCode for printable characters, keyCode for unprintables:
  if (e.charCode) {
    switch (e.charCode) {
      case 32:
        nextSlide();
        e.preventDefault();
        return;
      // The Logitech Presenter sends a period from the "blank screen" btn
      case 46:
        blankScreen();
        e.preventDefault();
        return;
    }
  }

  // Use numeric values rather than DOM_VK_* so that non-mozilla browsers
  // might work.
  switch (e.keyCode) {
    case 32:    // e.DOM_VK_SPACE:
    case 34:    // e.DOM_VK_PAGE_DOWN:
    case 39:    // e.DOM_VK_RIGHT:
      nextSlide();
      e.preventDefault();
      return;
    case 8:     // e.DOM_VK_BACK_SPACE:
    case 33:    // e.DOM_VK_PAGE_UP:
    case 37:    // e.DOM_VK_LEFT:
      prevSlide();
      e.preventDefault();
      return;
    case 36:    // e.DOM_VK_HOME:
    //case 38:    // e.DOM_VK_UP:
      firstSlide();
      e.preventDefault();
      return;
    case 35:    // e.DOM_VK_END:
      lastSlide();
      e.preventDefault();
      return;
    // The Logitech Presenter's F5/ESC button sometimes sends ESC,
    // sometimes F5. I can't figure out the rule, so treat them the same:
    case 27:     // e.DOM_VK_ESC:
    case 116:    // e.DOM_VK_F5:
      firstSlide();
      e.preventDefault();
      return;
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
  initpage();
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
  var text = "<h2>Table of Contents</h2>\n<small>\n";
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

function initpage() {
  var body = document.getElementsByTagName("body")[0];
  var nextdiv = document.createElement("div");
  nextdiv.id = "nextdiv";
  nextdiv.style.position = "absolute";
  body.appendChild(nextdiv);

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
