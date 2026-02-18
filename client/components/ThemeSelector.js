import { useRouter } from "next/router";

export default function ThemeSelector() {
  const router = useRouter();

  const themes = ["dev", "games", "negocios", "musica", "filmes"];

  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h1>Nexora</h1>
      {themes.map(t => (
        <button
          key={t}
          onClick={() => router.push(`/chat?theme=${t}`)}
          style={{ margin: 10, padding: 15 }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
