# Maintainer: Luigi Grillo <luigi@grigio.org>
pkgname=sushi-markdown
pkgver=51.r1.g0000000
pkgrel=1
pkgdesc="Rendered Markdown plugin for GNOME Sushi (Nautilus spacebar previewer)"
arch=('any')
url="https://github.com/grigio/sushi-markdown"
license=('GPL-2.0-or-later')
depends=('sushi>=51' 'webkitgtk-6.0')
optdepends=(
  'python-markdown: converter with tables/strikethrough (default)'
  'pandoc: alternative converter'
  'cmark-gfm: alternative converter (AUR)'
  'cmark: minimal converter (no tables)'
)
makedepends=('git')
source=("$pkgname::git+https://github.com/grigio/sushi-markdown.git#branch=sushi-51")
sha256sums=('SKIP')

pkgver() {
  cd "$pkgname"
  printf "51.r%s.%s" "$(git rev-list --count HEAD)" "$(git rev-parse --short=7 HEAD)"
}

package() {
  cd "$pkgname"
  # Sushi 51 loads plugins from the system dir first, then ~/.local/share/sushi/plugins-1
  install -Dm644 markdown.js "$pkgdir/usr/lib/sushi/plugins-1/markdown.js"
}
