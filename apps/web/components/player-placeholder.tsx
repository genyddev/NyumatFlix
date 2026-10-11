export function PlayerPlaceholder() {
  return (
    <section className="player-placeholder" aria-labelledby="player-status">
      <div className="player-icon" aria-hidden="true"><span>▶</span></div>
      <div>
        <p className="eyebrow">Pamje paraprake</p>
        <h2 id="player-status">Burimi i videos nuk është konfiguruar ende.</h2>
        <p>Kjo faqe demonstrimi nuk ngarkon video, iframe ose burime të jashtme.</p>
      </div>
    </section>
  );
}
