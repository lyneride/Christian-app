"use client";

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="de">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem 1.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Da ist etwas schiefgelaufen.</h1>
        <p style={{ color: "#6b645b", marginTop: "0.75rem" }}>
          {error.digest ? `Fehlercode: ${error.digest}` : "Bitte lade die Seite neu."}
        </p>
        <button
          onClick={() => retry()}
          style={{ marginTop: "2rem", padding: "0.6rem 1.2rem", borderRadius: "999px", background: "#27416f", color: "#fff", border: 0 }}
        >
          Noch einmal versuchen
        </button>
      </body>
    </html>
  );
}
