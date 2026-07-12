# sushi-markdown (sushi 50)

A Markdown renderer for the GNOME Files previewer (sushi). Press Space on a
`.md` file and it renders as formatted HTML instead of source text.

This branch targets sushi **50** (the current stable release, GTK3). For sushi
51+ use the `sushi-51` branch.

> **Personal build.** I wrote this for my own NVIDIA + sway machine as an
> experiment; it is not really meant for general consumption. On that setup sushi
> needs the workarounds in the NVIDIA note below. On a normal GNOME/Mutter or
> non-NVIDIA setup the plugin works with no extra steps.

It converts Markdown to HTML with the first available command-line converter
(`cmark-gfm`, `cmark`, `pandoc`, or `python -m markdown`) and shows it in a
WebKit2GTK 4.1 view, using the desktop light/dark theme.

## Install

Copy the single file into sushi's user viewer directory:

```
mkdir -p ~/.local/share/sushi/viewers
cp markdown.js ~/.local/share/sushi/viewers/
```

Install a converter if you don't have one. For full GitHub Markdown (tables,
strikethrough) use `cmark-gfm`, `pandoc`, or `python-markdown`; plain `cmark`
works but omits tables:

```
sudo pacman -S python-markdown     # or pandoc; cmark-gfm is on the AUR
```

No restart or setting is needed. The next preview of a Markdown file uses it.

## Requirements

- sushi 50 (`extra/sushi` on Arch).
- `webkit2gtk-4.1` (usually already present).
- A Markdown converter (see above).

Handled types: `text/markdown`, `text/x-markdown`.

## NVIDIA / wlroots note

On my NVIDIA + sway setup sushi will not render a WebKit view out of the box: it
crashes on native Wayland (`Error 71`), and WebKit's DMABUF renderer fails on the
proprietary driver (blank preview). Scope both fixes to sushi alone with a
user-level D-Bus override, so nothing else on the system is affected:

`~/.local/share/dbus-1/services/org.gnome.NautilusPreviewer.service`

```
[D-BUS Service]
Name=org.gnome.NautilusPreviewer
Exec=/usr/bin/env GDK_BACKEND=x11 WEBKIT_DISABLE_DMABUF_RENDERER=1 /usr/lib/org.gnome.NautilusPreviewer
```

Float it in a tiling WM (sway/i3), matched on the XWayland class:

```
for_window [class="Org.gnome.NautilusPreviewer"] floating enable, move position center
```

None of this is needed on Mutter/GNOME or non-NVIDIA systems.

## License

GPL-2.0-or-later, matching sushi.
