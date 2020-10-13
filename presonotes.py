#!/usr/bin/env python3

# Go through an htmlpreso (as in https://github.com/akkana/htmlpreso)
# and extract all the notes, in order, printing to stdout
# an HTML file you can save or print in case of emergency.

import re
import sys, os
from bs4 import BeautifulSoup


# Simple comment remover, from https://stackoverflow.com/a/241506
def comment_remover(text):
    def replacer(match):
        s = match.group(0)
        if s.startswith('/'):
            return " " # note: a space and not an empty string
        else:
            return s
    pattern = re.compile(
        r'//.*?$|/\*.*?\*/|\'(?:\\.|[^\\\'])*\'|"(?:\\.|[^\\"])*"',
        re.DOTALL | re.MULTILINE
    )
    return re.sub(pattern, replacer, text)


def remove_quotes_and_comma(s):
    if s.endswith(','):
        s = s[:-1]
    if s.startswith('"') or s.startswith('"'):
        s = s[1:]
    if s.endswith('"') or s.startswith('"'):
        s = s[:-1]
    return s

def clean_lines(wholefile, start_pat, end_pat):
    """Remove everything before the start and after the end pattern
       (including the patterns themselves), and comments and whitespace.
       Return a dictionary (if there are colons) or list (if not)
       of what's left in each line.
    """
    # Remove everything up to and including the start_pat:
    wholefile = re.sub(re.compile(start_pat,
                                  re.DOTALL | re.MULTILINE),
                       "", wholefile)

    # and from the end_pat to the end of the file:
    wholefile = re.sub(re.compile(end_pat,
                                  re.DOTALL | re.MULTILINE),
                       "", wholefile)

    # Remove C-style comments
    wholefile = comment_remover(wholefile)

    # Remove blank lines. This doesn't work, but it's easy enough
    # to ignore them later.
    # whoefile = re.sub(re.compile(r"\n\n*", re.DOTALL | re.MULTILINE),
    #                   "\n", wholefile)
    # print("=========== Removed blank lines:", wholefile)

    # Loop over lines, removing whitespace and quotes:
    linelist = None
    for line in wholefile.split('\n'):
        line = line.strip()
        if not line:
            continue
        if ':' in line:
            if not linelist:
                linelist = {}
            parts = [ remove_quotes_and_comma(p.strip())
                                              for p in line.split(':') ]
            linelist[parts[0]] = parts[1]
        else:
            if not linelist:
                linelist = []
            line = remove_quotes_and_comma(line)
            linelist.append(line)

    return linelist


def parse_slldelist(filename):
    return clean_lines(open(filename).read(),
                       start_pat=r'.*var slides = new Array \( *\n',
                       end_pat=r"\n\);\n.*$")

notelist = None

def parse_notes_file():
    global notelist

    notelist = clean_lines(open("notes.js").read(),
                           start_pat=r'.*var notes = {\n',
                           end_pat=r'\n\}\n.*$')


def find_notes_in_file(filename):
    with open(filename) as fp:
        soup = BeautifulSoup(fp, 'lxml')
        notesdiv = soup.find('div', id="notes")
        if not notesdiv:
            return 'NO NOTESDIVDIV'
        return str(notesdiv)

    return "Couldn't open", filename


def find_notes(slide):
    if not notelist:
        parse_notes_file()

    if os.path.exists(slide):
        return find_notes_in_file(slide)
    else:
        if '?' not in slide:
            return f"{slide} is not a file or img/video, not sure what to do"

        slide = re.sub(r'.*\?', '', slide)

        try:
            # First try the whole thing including title
            return notelist[slide]
        except KeyError:
            pass

        # Strip off title and try again
        shortslide = re.sub("\&title=.*", "", slide)
        try:
            return notelist[shortslide]
        except KeyError:
            return f"No notes for either {slide} or {shortslide}"


if __name__ == '__main__':
    print("""<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Notes</title>
</head>

<body>
""")
    slidelist = parse_slldelist(sys.argv[1])

    for slide in slidelist:
        print(f"""
<h2>{slide}:</h2>
{find_notes(slide)}
""")

    print("</body>\n</html>")


