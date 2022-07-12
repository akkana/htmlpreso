/* -*- mode: javascript; indent-tabs-mode: nil; js-indent-level: 4 -*- */

// JavaScript Slide Presentation software.
// Copyright 2003-2020 by Akkana Peck.
// This software is licensed under the GNU public license v2 (or later) --
// Share and enjoy!

// See a presentation on how to use it at
// http://shallowsky.com/linux/presentations/

// OPTIONAL: Use a separate notes window.
var useNotesWin = false;

var curSlide = indexOfPage();

// Variables used for "live demo" typing
if (stuff2type == undefined)
    var stuff2type = null;
var stuffTypingIndex = 0;

//
// Keypress navigation
function onKeyDown(e)
{
    var targetWin = window.opener;
    if (!targetWin)
        targetWin = window;

    // IE doesn't see the event argument passed in, so get it this way:
    if (window.event) e = window.event;

    /* Debugging stuff:
    if (typeof console != "undefined")
        console.log("key press, char code " + e.charCode
                    + ", key code " + e.keyCode
                    + ", " + e.ctrlKey + ", " + e.altKey + ", " + e.metaKey );
     */

    // Make sure things like desktop switching don't get caught here:
    if (e.ctrlKey || e.altKey || e.metaKey) {
        return true;
    }
    // Don't do anything for Shift, Ctrl, Alt or W/Meta on their own:
    switch (e.keyCode) {
      case 16: case 17: case 18: case 91:
        return true;
    }

    /*
    console.log("key down: char code " + e.charCode + ", key code " + e.keyCode
                + ", " + e.shiftKey + ", " + e.ctrlKey + ", "
                + e.altKey + ", " + e.metaKey );
     */

    // We only use shift for one thing: the table of contents.
    // But some wireless presenters can send shift-F5,
    // which also calls up some performance window thing in firefox.
    if (e.shiftKey) {
        //alert("shift key! keycode " + e.keyCode + ", charcode " + e.charCode);
        switch (e.keyCode) {
          case 33:    // Page Up
            targetWin.tableOfContents();
            e.preventDefault();
            return false;

          case 116:   // F5, sent by some presenters, in Webkit
            // alert("Shift+F5: Supposedly called preventDefault()");
            targetWin.tableOfContents();
            e.preventDefault();
            return false;

          case 68:    // shift-D, to initiate drawing
            targetWin.initCanvas();
            e.preventDefault();
            return false;
        }

        return true;
    }

    // Next couple clauses shouldn't handle space or printable characters;
    // wait til after the "live demo typing" clause for that.

    // keyCodes. There don't seem to be any cross-browser symbols for these.
    switch (e.keyCode) {
      case 32:    // Space
        // In auto-advance mode on the first slide, spacebar starts the countdown.
        if (countdownSecs > 0 && curSlide == 0 && !countdown) {
            console.log("First spacebar clause");
            countdown = true;
            targetWin.startCountdown(curSlide);
            return false;
        }
        // Else break; there's another spacebar clause after we're
        // done with "live typing demo" mode.
        break

      case 34:    // Page Down
      case 40:    // Arrow Down
      case 39:    // Arrow Right
        targetWin.nextSlide();
        e.preventDefault();
        return false;

      case 8:     // Backspace
      case 33:    // Page Up
      case 38:    // Arrow Up
      case 37:    // Arrow Left
        targetWin.prevSlide();
        e.preventDefault();
        return false;

      case 36:    // Home
        targetWin.firstSlide();
        e.preventDefault();
        return false;

      case 35:    // End
        targetWin.lastSlide();
        e.preventDefault();
        return false;

      // Many presenters toggle between ESC and Shift-F5.
      // I think on PowerPoint it's supposed to toggle slideshow mode.
      // It's not clear if we need to watch for unshifted F5 like this.
      // Here, we could show a table of contents.
      case 27:     // Escape
      case 116:    // F5
        targetWin.tableOfContents();
        e.preventDefault();
        return false;

      case 46:      // Delete
        countdown = !countdown;
        if (countdown)
            targetWin.startCountdown(null);
        return false;
    }

    // Handle "live" typing demo: pound on the keyboard randomly
    // and the string in stuff2type gets added one character at a time,
    // making you look like a super-accurate typist. :-)
    const typedstuff = document.getElementById("typedstuff");
    if (typedstuff && stuff2type) {
        var c = stuff2type[stuffTypingIndex++];
        if (c == undefined) {
            // Some say "delete stuff2type" works, but it doesn't work for me.
            stuff2type = null;
        } else {
            typedstuff.innerHTML += c;
        }
        return false;
    }

    // Mozilla uses charCode for printable characters, keyCode for unprintables.
    // Pull out the charCodes:
    if (e.charCode) {
        switch (e.charCode) {
          case 32:
            targetWin.nextSlide();
            e.preventDefault();
            return false;
          // The Logitech Presenter sends a period from the "blank screen" btn.
          // But most presenters seem to send b.
          case 46:
            targetWin.blankScreen();
            e.preventDefault();
            return false;
        }
    }

    switch (e.keyCode) {
      case 32:    // Spacebar
        targetWin.nextSlide();
        e.preventDefault();
        return false;

      case 66:    // b
      case 190:   // firefox quantum now sends this for .
        targetWin.blankScreen();
        e.preventDefault();
        return false;

      case 83:      // s
        countdown = !countdown;
        if (countdown)
            targetWin.startCountdown(null);
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
        while (numvis > 0) {
            points[curPoint].style.visibility = "visible";
            curPoint = curPoint + 1;
            numvis = numvis - 1;
        }
    }

    // Do any other page initialization we need:
    initPage();
}


//
// Figure out where we are in the presentation from the URL.
// This assumes all HTML files are in the same base directory
// and that the list in slides.js does not use subdirectories.
// There also can't be any slashes after the filename or image file name
//
function indexOfPage() {
    var url = document.URL;

    // First strip out any #notes
    const ISNOTES = "#notes";
    const ISNOTESLEN = ISNOTES.length;
    var isnotes = url.indexOf(ISNOTES, url.length - ISNOTESLEN);
    if (isnotes > 0)
        url = url.substring(0, url.length - ISNOTESLEN);

    // Are there query params starting with ? ?
    const queryString = window.location.search;
    var startPos;
    if (queryString)
        startPos = url.length - queryString.length;
    else
        startPos = url.length;
    var lastslash = url.lastIndexOf("/", startPos);
    url = url.substring(lastslash+1);

    // In case someone starts at /path/to/ without specifying index.html,
    // treat a directory URL without a filename as a special case
    // and assume it's the first slide:
    if (!url)
        return 0;

    // JS 1.6 has Array.indexOf, but that doesn't work in Opera/Konq/etc.
    if (slides.indexOf) return slides.indexOf(url);
    for (var i=0; i<slides.length; ++i) {
        if (slides[i] == url) return i;
    }
    return 0;
}

function nextSlide() {
    // If there are multiple points on this slide, show the next point:
    if (points && curPoint < points.length) {
        // Make old-current point a more subtle color,
        // to emphasize only the new-current point.
        if (curPoint > 0)
            for (var i=0; i < curPoint; ++i)
                points[i].setAttribute("class", "greyed");
        points[curPoint].style.visibility = "visible";
        curPoint = curPoint + 1;

        return;
    }

    // No next point.
    /*
    // If we're in auto-advance mode and still on the first slide,
    // start the countdown.
    if (countdownSecs > 0 && curSlide == 0 && !countdown) {
        countdown = true;
        startCountdown(curSlide);
        return;
    }
    */

    // Otherwise, go to the next slide.

    if (curSlide >= slides.length - 1) {    // last slide
        //window.alert("That's the last slide");
        return;
    }
    window.location = slides[curSlide+1];
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
        //var body = document.getElementsByTagName("body")[0];
        var body = document.getElementById("page");
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
    if (curSlide <= 0) {    // last slide
        //window.alert("Already on the first slide");
        return;
    }
    window.location = slides[curSlide-1];
}

//
// Parse a single named parameter from the page URL
//
function getURLParameter(name) {
    return decodeURIComponent(
        (new RegExp('[?|&]' + name + '='
                    + '([^&;]+?)(&|#|;|$)').exec(location.search)
         || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

// Given a URL, an image name, etc. strip off the part between
// the last / and the last ., for display purposes.
function stripSlidename(name) {
    slash = name.lastIndexOf("/");
    if (slash >= 0)
        slash += 1;
    else
        slash = 0;
    dot = name.lastIndexOf(".");
    if (dot >= 0)
        return (name.substring(slash, dot));
    else
        return (name.substring(slash));
}

//
// initPage is called from both main windows and note windows,
// but does very different things in the two cases.
//
function initPage() {
    var isPresoWin = (window.location.hash.indexOf('#notes') === -1)
        || !useNotesWin;

    //
    // Add the key event listener, if this isn't a notes window.
    // This has to be on keydown or keyup because webkit doesn't
    // generate keypress events for nonprintable keys.
    //
    if (document.addEventListener) {        // DOM way
        document.addEventListener("keydown", onKeyDown, false);

        //document.addEventListener("keypress", onKeyPress, false);
    }
    else if (document.all)                  // IE way
        document.attachEvent("onkeydown", onKeyDown);

    // Things to do only in the main preso window,
    // whether or not there's a notes window::
    if (isPresoWin)
        initPresoPage();

    //console.log("isPresoWin?", isPresoWin, "useNotesWin?", useNotesWin);
    // Using a separate notes window?
    if (useNotesWin) {
        // In the main window, remove all the notes/hints pieces.
        if (isPresoWin)
            removeNoteElements();
        // In the notes window, add and populate them.
        else
            initNotesWin();
    }

    // Else all in one window
    else {
        initNotesElements();
    }


    // OPTIONAL:
    // For Ignite or similar auto-advancing talks, uncomment the next line
    // and pass the number of seconds per slide (15 for Ignite):
    //initAutoAdvance(15);
}

//
// Initialize the slide content the audience sees, plus navigation, etc.
//
function initPresoPage() {
    // Add a title if there isn't already one, from the first H1:
    headers = document.getElementsByTagName("h1");
    if (headers && headers[0]) {
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
    document.body.insertBefore(navspan, document.body.childNodes[0]);

    // Pop up the notes window, if applicable.
    // This uses the clever method at
    // https://remysharp.com/2013/04/02/creating-popups-without-html-files :
    // use the same page for slide and notes, but with #notes appended
    // to the URL in the popup, in which case we'll remove most of the
    // page content except for notes.
    if (useNotesWin)
        window.open(window.location + '#notes', 'noteWin',
                    'width=300,height=300');
}

//
// If in the main window when using a noteswin, hide the notes and related::
//
function removeNoteElements() {
    var node = document.getElementById("notes");
    //node.style.visibility = "hidden";
    if (node)
        node.remove();

    node = document.getElementById("nexthint");
    if (node)
        node.remove();
}

//
// Create the nexthint div if it doesn't already exist,
// and fill it will a hint on the name of the next slide.
//
function hintNextSlide(hintname) {
    var nexthint = document.getElementById(hintname);
    if (! nexthint) {
        nexthint = document.createElement("div");
        nexthint.id = hintname;
        nexthint.classList.add("nexthint");
        document.body.appendChild(nexthint);
    }

    if (curSlide >= slides.length - 1)    // last slide
        nexthint.innerHTML = "The end";

    else {
        var nextname = stripSlidename(slides[curSlide+1]);
        var slash = nextname.lastIndexOf('/');
        if (slash < 0)
            slash = 0;
        else
            slash += 1;
        var dot = nextname.lastIndexOf('.');
        if (dot < 0)
            nexthint.innerHTML = "Next: " + nextname.substring(slash);
        else
            nexthint.innerHTML = "Next: " + nextname.substring(slash, dot);
    }
}

//
// Things to do only if this is a separate notes window:
// remove the slide presentation elements, size the body appropriately.
//
function initNotesWin() {
    //console.log("initNotesWin");

    // If here, it's the popup notes window, not the main preso window.
    // Replace most of the window that isn't notes.
    var node = document.getElementById("body");
    if (node) {
        // Let the size follow the window.
        node.style.width = "100%";
        node.style.height = "100%";
    }
    var node = document.getElementById("page");
    if (node)
        node.remove();
    node = document.getElementById("navigation");
    if (node)
        node.remove();

    // Finally, rename the notes div so it gets a more fullpage style.
    node = document.getElementById("notes");
    if (node)
        node.id = "fullnotes";

    hintNextSlide("nexthint_noteswin");
}

//
// Initialize the elements that should only show in the notes area,
// whether in a separate window or a #notes area of the preso window..
//
function initNotesElements() {
    // Add a note if there's one specified in the URL.
    note = getURLParameter("note");
    if (note) {
        var noteArea = document.getElementById("notes");
        noteArea.innerHTML = note;
    }

    hintNextSlide("nexthint");
}


function checkCredits(imgname) {
    try {
        var credit = credits[imgname];
        if (credit) {
            var creditArea = document.getElementById("imgcredit");
            creditArea.innerHTML = credit;
        }
    }
    catch(err) { }
}


////////////////////////////////////////////////////////////////
// Optional Ignite/autoadvance code:
//

// It would be lovely to define an object and not have to have
// all these global variables, but Javascript is such a total
// piece of crap in how it handles "this" with timeouts
// that I gave up trying to make it work.
// And, of course, we can't load another file conditionally,
// because Javascript has no "include" or "require" or "load".
// So make everything global instead, because Javascript.

var countdown = false;
var countdownSecs = 0;
var countdown_txt;
var secPerSlide;
var slideno_span;
var slideno_txt;

function updateCountdownText() {
    countdown_txt.nodeValue = "" + countdownSecs;
}

function updateTime() {
    countdownSecs -= 1;
    updateCountdownText();

    if (countdownSecs <= 0) {
        if (curSlide+1 < slides.length)
            nextSlide();
        return;
    }

    if (countdown)
        setTimeout("updateTime();", 1000);
}

function startCountdown(curSlide) {
    //console.log("startCountdown");

    countdown = true;

    setTimeout("updateTime();", 1000);
}

function initAutoAdvance(secs) {
    secPerSlide = secs;
    //console.log("initAutoAdvance, curSlide=" + curSlide);
    countdownSecs = secPerSlide;

    // We're currently on slide # curSlide.
    // If that's 0 (the first slide), don't start advancing yet;
    // wait for a nextSlide event.

    if (curSlide == 0)
        countdown = false;
    else
        startCountdown(curSlide);

    // Now add the slide number
    slideno_span = document.createElement("span");
    slideno_span.setAttribute("id", "slideno");
    document.body.appendChild(slideno_span);
    slideno_txt = document.createTextNode("[Slide " + (curSlide+1)
                                          + "/" + slides.length + "]");
    slideno_span.appendChild(slideno_txt);

    // and the countdown
    var countdown_span = document.createElement("span");
    countdown_span.setAttribute("id", "countdown");
    document.body.appendChild(countdown_span);
    countdown_txt = document.createTextNode("");
    countdown_span.appendChild(countdown_txt);
    updateCountdownText();
}


////////////////////////////////////////////////////////////////
// Optional drawing code, to allow drawing on slides:
//
// https://codepen.io/medo001/pen/FIbza

var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var x = "black";

var linewidth = 4;

function createCanvas()
{
    var content = document.getElementById('content');

    var canvas = document.createElement("canvas");
    canvas.id = "can";
    //canvas.style.position = "absolute";
    canvas.width = 1024;
    canvas.height = 768;
    canvas.style.position = "absolute";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.left = "0px";
    canvas.style.border = "2px solid";
    canvas.style.zindex = 100;
    content.appendChild(canvas);

    var colors = new Array("black", "red", "green", "yellow", "blue", "orange");
    var startpos = 920;   // pixels from the left edge
    var top = 0;          // pixels from the top
    var ncol = 3;         // number of colums of color swatches
    var swatchsize = 15;  // pixels square
    for (i=0; i < colors.length; ++i) {
        swatch = document.createElement("div");
        swatch.id = colors[i];
        swatch.style.background = colors[i];
        swatch.classname = "swatch";
        swatch.style.position = "absolute";
        if (i % ncol == 0)
            top += swatchsize + 5;
        swatch.style.left = startpos + (i % ncol) * (swatchsize + 5) + "px";
        swatch.style.top = top + "px";
        swatch.style.width = swatchsize + "px";
        swatch.style.height = swatchsize + "px";
        swatch.addEventListener("click", function (e) {color(this); });
        content.appendChild(swatch);
    }
    top += swatchsize + 5;

    var eraseBtn = document.createElement("input");
    eraseBtn.type = "button";
    eraseBtn.value="clear";
    eraseBtn.id = "clear";
    //eraseBtn.size = "6";
    eraseBtn.style.position = "absolute";
    eraseBtn.style.left = startpos + "px";
    eraseBtn.style.top = top + "px";
    eraseBtn.onclick = erase;
    content.appendChild(eraseBtn);
}

function initCanvas() {
    createCanvas();

    canvas = document.getElementById('can');
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;

    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);
}

function color(obj) {
    switch (obj.id) {
        case "green":
            x = "green";
            break;
        case "blue":
            x = "blue";
            break;
        case "red":
            x = "red";
            break;
        case "yellow":
            x = "yellow";
            break;
        case "orange":
            x = "orange";
            break;
        case "black":
            x = "black";
            break;
        case "white":
            x = "white";
            break;
    }
}

function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = linewidth;
    ctx.stroke();
    ctx.closePath();
}

function erase() {
    ctx.clearRect(0, 0, w, h);
}

function findxy(res, e) {
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = x;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            draw();
        }
    }
}

