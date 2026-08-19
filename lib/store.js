// Armazenamento dos eventos do chat.
// Local: arquivo JSONL (zero setup). Producao: Postgres/Neon via DATABASE_URL.
// A Vercel apaga o disco a cada deploy, entao em producao TEM que ser o Postgres.
import fs from "node:fs";
import path from "node:path";

const ARQ = path.join(process.cwd(), ".data", "eventos.jsonl");
const TEM_PG = !!process.env.DATABASE_URL;

let sql = null;
async function pg() {
  if (sql) return sql;
  const { neon } = await import("@neondatabase/serverless");
  sql = neon(process.env.DATABASE_URL);
  await sql`CREATE TABLE IF NOT EXISTS chat_eventos (
    id BIGSERIAL PRIMARY KEY,
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    sessao TEXT NOT NULL,
    tipo TEXT NOT NULL,
    nome TEXT, email TEXT,
    texto TEXT, categoria TEXT,
    meta JSONB
  )`;
  await sql`CREATE INDEX IF NOT EXISTS chat_eventos_ts ON chat_eventos (ts DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS chat_eventos_sessao ON chat_eventos (sessao)`;
  return sql;
}

export async function gravar(ev) {
  const linha = { ts: new Date().toISOString(), ...ev };
  if (TEM_PG) {
    const s = await pg();
    await s`INSERT INTO chat_eventos (sessao, tipo, nome, email, texto, categoria, meta)
            VALUES (${linha.sessao}, ${linha.tipo}, ${linha.nome || null}, ${linha.email || null},
                    ${linha.texto || null}, ${linha.categoria || null}, ${JSON.stringify(linha.meta || {})})`;
    return;
  }
  fs.mkdirSync(path.dirname(ARQ), { recursive: true });
  fs.appendFileSync(ARQ, JSON.stringify(linha) + "\n");
}

export async function ler({ desde, limite = 5000 } = {}) {
  if (TEM_PG) {
    const s = await pg();
    const r = desde
      ? await s`SELECT * FROM chat_eventos WHERE ts >= ${desde} ORDER BY ts DESC LIMIT ${limite}`
      : await s`SELECT * FROM chat_eventos ORDER BY ts DESC LIMIT ${limite}`;
    return r.map((x) => ({ ...x, ts: new Date(x.ts).toISOString() }));
  }
  if (!fs.existsSync(ARQ)) return [];
  const linhas = fs.readFileSync(ARQ, "utf8").trim().split("\n").filter(Boolean);
  const out = [];
  for (let i = linhas.length - 1; i >= 0 && out.length < limite; i--) {
    try {
      const e = JSON.parse(linhas[i]);
      if (desde && e.ts < desde) break;
      out.push(e);
    } catch {}
  }
  return out;
}

export const driver = TEM_PG ? "postgres" : "arquivo";
