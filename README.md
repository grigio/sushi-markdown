# sushi-markdown (sushi 50)

A Markdown renderer for the GNOME Files previewer (sushi). Press Space on a
`.md` file and it renders as formatted HTML instead of source text.

This branch targets sushi **50** (the current stable release, GTK3). For sushi
51+ use the `sushi-51` branch.

It converts Markdown to HTML with the first available command-line converter
(`cmark-gfm`, `cmark`, `pandoc`, or `python -m markdown`) and shows it in a
WebKit2GTK 4.1 view, using the desktop light/dark theme.

## Install

Copy the single file into sushi's user viewer directory:

```
mkdir -p ~/.local/share/sushi/viewers
cp markdown.js ~/.local/share/sushi/viewers/
```

Install a converter if you don't have one (`cmark` gives the best output):

```
sudo pacman -S cmark        # or pandoc, or python-markdown
```

No restart or setting is needed. The next preview of a Markdown file uses it.

## Requirements

- sushi 50 (`extra/sushi` on Arch).
- `webkit2gtk-4.1` (usually already present).
- A Markdown converter (see above).

Handled types: `text/markdown`, `text/x-markdown`.

## License

GPL-2.0-or-later, matching sushi.
