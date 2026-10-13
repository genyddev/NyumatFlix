"use client";

export function DeleteMovieForm({ id, action }: { id: string; action: (formData: FormData) => void | Promise<void> }) {
  return (
    <form action={action} onSubmit={(event) => {
      if (!window.confirm("A je i sigurt se dëshiron ta fshish këtë film? Ky veprim nuk mund të zhbëhet.")) event.preventDefault();
    }}>
      <input type="hidden" name="id" value={id} />
      <button className="admin-danger-button" type="submit">Fshi</button>
    </form>
  );
}
