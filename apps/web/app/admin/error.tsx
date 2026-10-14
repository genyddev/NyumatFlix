"use client";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="admin-shell">
      <div className="admin-alert admin-alert-error" role="alert">
        Veprimi nuk mund të përfundohej. Kontrollo madhësinë dhe formatin e skedarëve, pastaj provo përsëri.
      </div>
      <button className="admin-secondary-button" type="button" onClick={reset}>Provo përsëri</button>
    </div>
  );
}
