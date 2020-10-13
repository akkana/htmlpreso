#!/usr/bin/env python3

# Go through an htmlpreso (as in https://github.com/akkana/htmlpreso)
# and extract all the notes, in order, producing a printable file
# for emergencies.

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


def parse_slldelist(filename):
    wholefile = open(filename).read()

    # Remove everything up to "var slides = new Array ("
    if "var slides = new Array (" not in wholefile:
        raise RuntimeError("Missing expected 'var slides' line")
    wholefile = re.sub(re.compile(r'.*var slides = new Array \( *\n',
                                  re.DOTALL | re.MULTILINE),
                       "", wholefile)

    # Remove C-style comments
    wholefile = comment_remover(wholefile)

    # Remove the closing ); and everything after
    # wholefile = re.sub(re.compile(r"\n\);\n.*", re.MULTILINE), "", wholefile)
    wholefile = re.sub(re.compile(r'\n\);\n.*$', re.DOTALL | re.MULTILINE),
                       "", wholefile)

    # Remove blank lines. This doesn't work, but it's easy enough
    # to ignore them later.
    # whoefile = re.sub(re.compile(r"\n\n*", re.DOTALL | re.MULTILINE),
    #                   "\n", wholefile)
    # print("=========== Removed blank lines:", wholefile)

    slidelist = []
    for line in wholefile.split('\n'):
        line = line.strip()
        if not line:
            continue
        if line.endswith(','):
            line = line[:-1]
        if line.startswith('"') or line.startswith('"'):
            line = line[1:]
        if line.endswith('"') or line.startswith('"'):
            line = line[:-1]
        slidelist.append(line)

    return slidelist


def parse_notes_file():
    allnotestxt = open('notes.js').read()


def find_notes_in_file(filename):
    with open(filename) as fp:
        soup = BeautifulSoup(fp, 'lxml')
        notesdiv = soup.find('div', id="notes")
        if not notesdiv:
            return 'NO NOTESDIVDIV'
        return str(notesdiv)

    return "Couldn't open", filename


def find_notes(slide):
    if os.path.exists(slide):
        return find_notes_in_file(slide)
    else:
        if '?' not in slide:
            print(slide, "is not a file or img/video, not sure what to do")
            return
        slide = re.sub(r'.*\?', '', slide)
        return(f"want to find notes for {slide}")


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


