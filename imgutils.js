
function getSingleArg() {
    var url = document.URL;   // could also use window.location
    var titlestr = null;

    // Is there a title specified?
    var ampersand = url.lastIndexOf("&");
    if (ampersand > 0) {
        titlestr = url.substring(ampersand+1, url.length);
        // Then remove it from the URL
        url = url.substring(0, ampersand);

        // titlestr might be specified as &title= so look for title=
        if (titlestr.indexOf("title=") == 0) {
            titlestr = titlestr.substring(6, titlestr.len);
        }
        h1 = document.getElementById("imgtitle");
        // I never fail to be amazed by JS's lack of ability to
        // handle URI encoding/decoding natively.
        // I mean, it's not like it's meant to be used on the web or anything.
        if (h1)
            h1.innerHTML = decodeURIComponent(titlestr.replace(/\+/g, '%20'));
    }

    var question = url.lastIndexOf("?");
    if (question > 0) {
        imgname = url.substring(question+1, url.length);
        imgname = imgname.replace("#notes", "");
    }

    return imgname;
}

function setupImage() {
  if (checkNotes && imgname) {
    checkNotes(imgname);
  }
  if (checkCredits && imgname) {
    checkCredits(imgname);
  }

  img = document.getElementById("fullpage");
  img.addEventListener('load', function() {
      var imgAspect = this.naturalWidth / this.naturalHeight;
      var page = document.getElementById("page");
      var pageWidth = page.clientWidth;
      var pageHeight = page.clientHeight;
      if (this.naturalWidth > pageWidth || this.naturalHeight > pageHeight) {
          var pageAspect = pageWidth / pageHeight;
          if (imgAspect >= pageAspect) {
              // width is the determining factor
              this.style.height *= pageWidth / this.style.width;
              this.style.width = pageWidth;
          } else {
              // height is the determining factor
              this.style.width *= pageHeight / this.style.height;
              this.style.height = pageHeight;
          }
      }
  });
  if (imgname) {
    img.src = imgname;

    // Also add the image's basename to the title,
    // if there's no title specified.
    if (typeof(titlestr) == "undefined" || !titlestr) {
      titlestr = document.title + ": "
        + imgname.substring(imgname.lastIndexOf('/') + 1);
    }
    document.title = titlestr;
  }
  else alert("No imgname!");
}
