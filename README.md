# sushi-markdown

A Markdown renderer for the GNOME Files previewer (sushi). Press Space on a
`.md` file and it renders as formatted HTML instead of source text.

Requires sushi **51** or newer (the version with the plugin loader). It converts
Markdown to HTML with the first available command-line converter (`cmark-gfm`,
`pandoc`, `python -m markdown`, or `cmark`) and shows it in a WebKit view, using
the desktop light/dark theme.

> **Personal build.** I wrote this for my own NVIDIA + sway machine as an
> experiment; it is not really meant for general consumption. On that setup sushi
> needs the workarounds in the NVIDIA note below. This branch is written against
> the sushi 51 API but has not yet been run against a built sushi 51 (the 50
> variant on the `sushi-50` branch is verified).

## Install

Copy the single file into sushi's user plugin directory:

```
mkdir -p ~/.local/share/sushi/plugins-1
cp markdown.js ~/.local/share/sushi/plugins-1/
```

Nothing else may go in that directory: sushi imports every file there, so a
stray file breaks plugin loading.

Install a converter if you don't have one. For full GitHub Markdown (tables,
strikethrough) use `cmark-gfm`, `pandoc`, or `python-markdown`; plain `cmark`
works but omits tables:

```
sudo pacman -S python-markdown     # or pandoc; cmark-gfm is on the AUR
```

No restart or setting is needed. The next preview of a Markdown file uses it.

## Notes

- The interface is imported from `resource:///org/gnome/NautilusPreviewer/js/core/renderer.js`,
  which matches a release build. If your sushi was built with the development
  profile (app id `org.gnome.NautilusPreviewerDevel`), change that path in
  `markdown.js` to match.
- Handled types: `text/markdown`, `text/x-markdown`.

## NVIDIA / wlroots note

On my NVIDIA + sway setup sushi's WebKit view needs the DMABUF renderer disabled
(and the GTK3 line also needs XWayland). Scope the fixes to sushi alone with a
user-level D-Bus override so nothing else is affected:

`~/.local/share/dbus-1/services/org.gnome.NautilusPreviewer.service`

```
[D-BUS Service]
Name=org.gnome.NautilusPreviewer
Exec=/usr/bin/env WEBKIT_DISABLE_DMABUF_RENDERER=1 GDK_BACKEND=x11 /usr/lib/org.gnome.NautilusPreviewer
```

GTK4 sushi 51 may not need `GDK_BACKEND=x11`; drop it if native Wayland works.
Float it in a tiling WM (sway/i3), matched on the XWayland class:

```
for_window [class="Org.gnome.NautilusPreviewer"] floating enable, move position center
```

None of this is needed on Mutter/GNOME or non-NVIDIA systems.

## License

GPL-2.0-or-later, matching sushi.
