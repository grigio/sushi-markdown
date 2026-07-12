# sushi-markdown

A Markdown renderer for the GNOME Files previewer (sushi). Press Space on a
`.md` file and it renders as formatted HTML instead of source text.

Requires sushi **51** or newer (the version with the plugin loader). It converts
Markdown to HTML with the first available command-line converter (`cmark-gfm`,
`cmark`, `pandoc`, or `python -m markdown`) and shows it in a WebKit view, using
the desktop light/dark theme.

## Install

Copy the single file into sushi's user plugin directory:

```
mkdir -p ~/.local/share/sushi/plugins-1
cp markdown.js ~/.local/share/sushi/plugins-1/
```

Nothing else may go in that directory: sushi imports every file there, so a
stray file breaks plugin loading.

Install a converter if you don't have one (`cmark` gives the best output):

```
sudo pacman -S cmark        # or pandoc, or python-markdown
```

No restart or setting is needed. The next preview of a Markdown file uses it.

## Notes

- The interface is imported from `resource:///org/gnome/NautilusPreviewer/js/core/renderer.js`,
  which matches a release build. If your sushi was built with the development
  profile (app id `org.gnome.NautilusPreviewerDevel`), change that path in
  `markdown.js` to match.
- Handled types: `text/markdown`, `text/x-markdown`.

## License

GPL-2.0-or-later, matching sushi.
