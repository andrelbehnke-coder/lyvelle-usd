// Serverless da Sophie. Roda na Vercel e tambem no dev-server local.
// Prefere Anthropic. Se so tiver OPENAI_API_KEY, usa OpenAI. Sem chave, o widget cai no fallback local.
import { SYSTEM_PROMPT } from "../lib/knowledge.js";
import { gravar } from "../lib/store.js";
import { classificar, desviou } from "../lib/classify.js";

const MAX_TURNS = 24;      // memoria da conversa
const MAX_CHARS = 700;     // limite do que o cliente pode mandar por vez

// Faxina: o modelo escorrega em muleta de script. Aqui a gente tira na saida.
const TICS = [
  // tirar a muleta deixa a proxima palavra em minuscula - devolve a maiuscula junto
  [/(^|\.\s+)(Plus|Additionally|Furthermore|Moreover),\s*([a-z])/gim,
    (_m, pre, _t, c) => pre + c.toUpperCase()],
  [/^(Of course|Certainly|Absolutely|Sure thing)[!,.]\s*/gim, ""],
  [/\b(I'd be happy to|I would be happy to)\b/gi, "I can"],
  [/\b(rest assured|hope this helps)\b[,.]?\s*/gi, ""],
  [/\bfeel free to\b/gi, "you can"],
  [/\bgreat (fit|choice)\b/gi, "a good call"],
  [/\*\*(.+?)\*\*/g, "$1"],
  [/^[-*]\s+/gm, ""],
  [/!+/g, "."],
];
function scrub(t) {
  let s = String(t || "");
  for (const [re, to] of TICS) s = s.replace(re, to);
  s = s.replace(/([.!?]\s+)([a-z])/g, (_m, p, c) => p + c.toUpperCase());
  s = s.split(/\n{2,}/).map((x) => x.trim()).filter(Boolean).slice(0, 4)
    // tirar a muleta do inicio deixa a frase com minuscula - devolve a maiuscula
    .map((x) => x.replace(/^([a-z])/, (c) => c.toUpperCase()))
    .join("\n\n");
  return s.replace(/[ \t]{2,}/g, " ").trim();
}

// O modelo esquece de fechar em ~1 a cada 3 respostas. Aqui a gente garante.
// Cada frase abre com uma palavra diferente, e nunca repetimos uma ja usada na conversa.
const FECHOS = [
  "Want me to get this moving for you today?",
  "If you'd like it, the $129 holds while today's stock does.",
  "Yours is sat there at $129 whenever you're ready.",
  "Say the word and I'll have it with dispatch today.",
  "Whenever you want it, the button is right below.",
  "Grab it at $129 today and I'll see it goes out.",
  "I can get it dispatched today if you order now.",
  "Ready when you are. That 70% lasts while stock does.",
  "Order comes through and it goes straight to dispatch.",
  "The button below locks in today's price.",
];

function precisaFechar(texto, turns) {
  if (/\[\[CHECKOUT\]\]/.test(texto)) return false;          // ja fechou
  if (!turns.some((t) => t.role === "assistant")) return false; // 1a resposta da conversa
  if (/\?\s*$/.test(texto)) return false;                      // devolveu pergunta
  const ultima = [...turns].reverse().find((t) => t.role === "user");
  const u = (ultima && ultima.content) || "";
  if (/\b(my order|i ordered|already ordered|order #?\d|where is my|tracking)\b/i.test(u)) return false;
  return true;
}

function fechar(texto, turns) {
  const ditos = turns.filter((t) => t.role === "assistant").map((t) => t.content).join(" ");
  const livres = FECHOS.filter((f) => !ditos.includes(f.slice(0, 22)));
  const pool = livres.length ? livres : FECHOS;
  const f = pool[Math.floor(Math.random() * pool.length)];
  return texto + "\n\n" + f + "\n[[CHECKOUT]]";
}

export async function reply({ messages, firstName, sessao, email }) {
  const system = SYSTEM_PROMPT({ firstName });
  const turns = (messages || [])
    .filter((m) => m && typeof m.text === "string" && m.text.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({
      role: m.role === "agent" ? "assistant" : "user",
      content: String(m.text).slice(0, MAX_CHARS),
    }));

  const acabar = (t) => (precisaFechar(t, turns) ? fechar(t, turns) : t);

  // registra a pergunta do cliente ja classificada
  const ultima = [...turns].reverse().find((t) => t.role === "user");
  if (sessao && ultima) {
    gravar({ sessao, tipo: "msg_cliente", nome: firstName, email,
             texto: ultima.content, categoria: classificar(ultima.content).id }).catch(() => {});
  }

  let texto, fallback = false;
  try {
    if (process.env.ANTHROPIC_API_KEY) texto = acabar(scrub(await anthropic(system, turns)));
    else if (process.env.OPENAI_API_KEY) texto = acabar(scrub(await openai(system, turns)));
    else throw new Error("no_api_key");
  } catch (e) {
    fallback = true;
    if (sessao) gravar({ sessao, tipo: "msg_sophie", texto: "(IA indisponivel: " + e.message.slice(0, 90) + ")", meta: { fallback: true } }).catch(() => {});
    throw e;
  }

  if (sessao) {
    gravar({ sessao, tipo: "msg_sophie", nome: firstName, email,
             texto: texto.replace(/\[\[CHECKOUT\]\]/g, "").trim(),
             meta: { desviou: desviou(texto), fallback, cta: /\[\[CHECKOUT\]\]/.test(texto) } }).catch(() => {});
  }
  return texto;
}

async function anthropic(system, turns) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.CHAT_MODEL || "claude-haiku-4-5",
      max_tokens: 500,
      temperature: 0.85,
      system,
      messages: turns,
    }),
  });
  if (!r.ok) throw new Error("anthropic " + r.status + " " + (await r.text()).slice(0, 300));
  const j = await r.json();
  return (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("").trim();
}

async function openai(system, turns) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer " + process.env.OPENAI_API_KEY,
    },
    body: JSON.stringify({
      model: process.env.CHAT_MODEL_OPENAI || "gpt-4o-mini",
      max_tokens: 500,
      temperature: 0.85,
      messages: [{ role: "system", content: system }, ...turns],
    }),
  });
  if (!r.ok) throw new Error("openai " + r.status + " " + (await r.text()).slice(0, 300));
  const j = await r.json();
  return (j.choices?.[0]?.message?.content || "").trim();
}

// Handler no formato Vercel
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const text = await reply({ messages: body.messages, firstName: body.firstName, sessao: body.sessao, email: body.email });
    res.status(200).json({ text });
  } catch (e) {
    console.error("[chat]", e.message);
    res.status(502).json({ error: "upstream" });
  }
}
