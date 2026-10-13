import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="KokoMax — Ballina">
        <span className="brand-logo-window">
          <img className="brand-logo" src="/koko-logo.png" alt="KokoMax" width="5000" height="3508" />
        </span>
      </Link>
      <nav className="main-nav" aria-label="Navigimi kryesor">
        <Link href="/">Ballina</Link>
        <Link href="/movies">Filma</Link>
        <Link href="/search">Kërko</Link>
      </nav>
      <form className="header-search" action="/search" role="search">
        <label className="sr-only" htmlFor="header-query">Kërko filma</label>
        <input id="header-query" name="q" placeholder="Kërko..." autoComplete="off" />
        <button type="submit" aria-label="Kërko">⌕</button>
      </form>
    </header>
  );
}
