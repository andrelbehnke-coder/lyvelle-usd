// Eventos que vem do widget: abriu, deixou contato, viu o botao, clicou no botao.
import { gravar } from "../lib/store.js";

const TIPOS = ["abriu", "lead", "atendente_entrou", "botao_exibido", "botao_clicado", "fechou", "encerrou"];

export async function registrar(b = {}) {
  if (!b.sessao || !TIPOS.includes(b.tipo)) return { ok: false };
  await gravar({
    sessao: String(b.sessao).slice(0, 64),
    tipo: b.tipo,
    nome: b.nome ? String(b.nome).slice(0, 80) : null,
    email: b.email ? String(b.email).slice(0, 160) : null,
    texto: b.texto ? String(b.texto).slice(0, 300) : null,
    meta: b.meta || {},
  });
  return { ok: true };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  try {
    const b = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    res.status(200).json(await registrar(b));
  } catch (e) {
    res.status(400).json({ ok: false });
  }
}
