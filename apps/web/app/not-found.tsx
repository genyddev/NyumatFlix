import Link from "next/link";

export default function NotFound() {
  return <div className="catalogue-shell not-found"><p className="eyebrow">404</p><h1>Faqja nuk u gjet</h1><p>Ky titull nuk është pjesë e katalogut demonstrues.</p><Link className="primary-button" href="/">Kthehu në ballinë</Link></div>;
}
