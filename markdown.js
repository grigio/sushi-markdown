/* SPDX-License-Identifier: GPL-2.0-or-later
 * sushi-markdown (sushi 50): a Markdown renderer for the GNOME Files previewer.
 *
 * Drop this single file into ~/.local/share/sushi/viewers/. Markdown is
 * converted to HTML by the first available command-line converter (cmark-gfm,
 * cmark, pandoc, or python -m markdown) and shown in a WebKit2 view.
 *
 * This is the sushi 50 (GTK3) variant: legacy gjs imports, WebKit2GTK 4.1,
 * imports.ui.renderer. For sushi 51+ use the sushi-51 branch.
 */

const {Gio, GLib, GObject, Gtk} = imports.gi;

var WebKit2;
try {
    imports.gi.versions.WebKit2 = '4.1';
    WebKit2 = imports.gi.WebKit2;
} catch (e) {
}

function _isAvailable() {
    return WebKit2 !== undefined;
}

const Renderer = imports.ui.renderer;

const CONVERTERS = [
    ['cmark-gfm', p => ['cmark-gfm', '--unsafe', '-e', 'table', '-e', 'strikethrough', '-e', 'autolink', p]],
    ['cmark',     p => ['cmark', p]],
    ['pandoc',    p => ['pandoc', '-f', 'gfm', '-t', 'html', p]],
    ['python3',   p => ['python3', '-m', 'markdown', '-x', 'extra', '-x', 'codehilite', '-x', 'sane_lists', p]],
];

function toHtml(path) {
    for (let [bin, argv] of CONVERTERS) {
        if (!GLib.find_program_in_path(bin))
            continue;
        try {
            let proc = Gio.Subprocess.new(argv(path),
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_SILENCE);
            let [, stdout] = proc.communicate_utf8(null, null);
            if (proc.get_successful() && stdout)
                return stdout;
        } catch (e) {
            // converter missing or failed; try the next one
        }
    }
    return null;
}

function page(body, dark) {
    let c = dark
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

var Klass = _isAvailable() ? GObject.registerClass({
    Implements: [Renderer.Renderer],
    Properties: {
        fullscreen: GObject.ParamSpec.boolean('fullscreen', '', '',
            GObject.ParamFlags.READABLE, false),
        ready: GObject.ParamSpec.boolean('ready', '', '',
            GObject.ParamFlags.READABLE, false),
    },
}, class MarkdownRenderer extends WebKit2.WebView {
    get ready() {
        return !!this._ready;
    }

    get fullscreen() {
        return !!this._fullscreen;
    }

    get moveOnClick() {
        return false;
    }

    _init(file) {
        super._init();
        this.connect('context-menu', () => true);

        let path = file.get_path();
        let html = path ? toHtml(path) : null;
        let settings = Gtk.Settings.get_default();
        let dark = settings && settings.gtk_application_prefer_dark_theme;

        if (html === null) {
            this.load_html(page(
                '<p style="color:#8b949e">Install cmark, pandoc, or python-markdown ' +
                'to preview Markdown.</p>', dark), null);
        } else {
            let parent = file.get_parent();
            this.load_html(page(html, dark), parent ? `${parent.get_uri()}/` : null);
        }

        this.connect('load-failed', (_view, _loadEvent, _uri, error) => {
            this.emit('error', error);
        });
        this.isReady();
    }

    static {
        WebKit2.WebContext.get_default().set_sandbox_enabled(true);
    }
}) : undefined;

var mimeTypes = [];
if (_isAvailable())
    mimeTypes = [
        'text/markdown',
        'text/x-markdown',
    ];
