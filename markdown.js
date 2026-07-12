/* SPDX-License-Identifier: GPL-2.0-or-later
 * sushi-markdown: a Markdown renderer for the GNOME Files previewer (sushi 51+).
 *
 * Drop this single file into ~/.local/share/sushi/plugins-1/. The previewer
 * imports every file in that directory, so nothing else may live beside it.
 *
 * Markdown is converted to HTML by the first available command-line converter
 * (cmark-gfm, cmark, pandoc, or python -m markdown) and shown in a WebKit view.
 */

import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import WebKit from 'gi://WebKit?version=6.0';

import {Renderer, ResizePolicy} from 'resource:///org/gnome/NautilusPreviewer/js/core/renderer.js';

export const mimeTypes = ['text/markdown', 'text/x-markdown'];

// GFM-capable converters first; plain cmark last (it lacks tables/strikethrough).
const CONVERTERS = [
    ['cmark-gfm', p => ['cmark-gfm', '--unsafe', '-e', 'table', '-e', 'strikethrough', '-e', 'autolink', p]],
    ['pandoc',    p => ['pandoc', '-f', 'gfm', '-t', 'html', p]],
    ['python3',   p => ['python3', '-m', 'markdown', '-x', 'extra', '-x', 'codehilite', '-x', 'sane_lists', p]],
    ['cmark',     p => ['cmark', p]],
];

function toHtml(path) {
    for (const [bin, argv] of CONVERTERS) {
        if (!GLib.find_program_in_path(bin))
            continue;
        try {
            const proc = Gio.Subprocess.new(argv(path),
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_SILENCE);
            const [, stdout] = proc.communicate_utf8(null, null);
            if (proc.get_successful() && stdout)
                return stdout;
        } catch {
            // converter missing or failed; try the next one
        }
    }
    return null;
}

function rgba(hex) {
    const c = new Gdk.RGBA();
    c.parse(hex);
    return c;
}

function page(body, dark) {
    const c = dark
        ? {fg: '#e6edf3', bg: '#0d1117', muted: '#8b949e', border: '#30363d', codebg: '#161b22', link: '#4493f8'}
        : {fg: '#1f2328', bg: '#ffffff', muted: '#59636e', border: '#d1d9e0', codebg: '#f4f6f8', link: '#0969da'};
    return `<!doctype html><html><head><meta charset="utf-8">
<style>
  :root { color-scheme: ${dark ? 'dark' : 'light'}; }
  html, body { margin: 0; background: ${c.bg}; color: ${c.fg}; }
  body { font: 15px/1.6 system-ui, "Cantarell", sans-serif; padding: 24px 32px 48px;
         max-width: 900px; margin: 0 auto; -webkit-font-smoothing: antialiased; }
  h1, h2 { border-bottom: 1px solid ${c.border}; padding-bottom: .3em; }
  a { color: ${c.link}; }
  code { font-family: "JetBrains Mono", monospace; font-size: .88em;
         background: ${c.codebg}; padding: .15em .4em; border-radius: 6px; }
  pre { background: ${c.codebg}; padding: 14px 16px; border-radius: 8px; overflow: auto;
        border: 1px solid ${c.border}; }
  pre code { background: none; padding: 0; }
  blockquote { margin: 0 0 1em; padding: 0 1em; color: ${c.muted};
               border-left: .25em solid ${c.border}; }
  table { border-collapse: collapse; }
  th, td { border: 1px solid ${c.border}; padding: 6px 13px; }
  th { background: ${c.codebg}; }
  img { max-width: 100%; }
  hr { border: 0; border-top: 1px solid ${c.border}; }
</style></head><body>${body}</body></html>`;
}

export const Klass = class MarkdownRenderer extends Adw.Bin {
    static {
        GObject.registerClass({Implements: [Renderer]}, this);
    }

    constructor(file, _fileInfo, constructProperties = {}) {
        super(constructProperties);
        this._policy = ResizePolicy.MAX_SIZE;

        const path = file.get_path();
        const html = path ? toHtml(path) : null;

        if (html === null) {
            this._policy = ResizePolicy.STATUS_PAGE;
            this.set_child(new Adw.StatusPage({
                icon_name: 'text-x-generic-symbolic',
                title: 'No Markdown converter',
                description: 'Install cmark, pandoc, or python-markdown to preview Markdown.',
            }));
            this.isReady();
            return;
        }

        const dark = Adw.StyleManager.get_default().get_dark();
        const view = new WebKit.WebView();
        view.set_background_color(rgba(dark ? '#0d1117' : '#ffffff'));
        const parent = file.get_parent();
        view.load_html(page(html, dark), parent ? `${parent.get_uri()}/` : null);
        view.connect('load-changed', (_v, ev) => {
            if (ev === WebKit.LoadEvent.FINISHED)
                this.isReady();
        });
        this.set_child(view);
    }

    get resizePolicy() {
        return this._policy;
    }

    get topBarStyle() {
        return Adw.ToolbarStyle.FLAT;
    }
};
