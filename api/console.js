// API do painel. Tudo passa pelo codigo de acesso.
import { ler, driver } from "../lib/store.js";
import { classificar, CATEGORIAS } from "../lib/classify.js";

const CODIGO = process.env.CONSOLE_CODE || "decadura1";
const JANELAS = { hoje: 1, "7d": 7, "30d": 30, tudo: 3650 };

export function autorizado(codigo) {
  const a = String(codigo || ""), b = CODIGO;
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function inicioDe(janela) {
  const dias = JANELAS[janela] ?? 30;
  const d = new Date();
  if (janela === "hoje") d.setHours(0, 0, 0, 0);
  else d.setTime(d.getTime() - dias * 864e5);
  return d.toISOString();
}

export async function painel({ janela = "7d", sessao = null } = {}) {
  const evs = (await ler({ desde: inicioDe(janela), limite: 20000 })).sort((a, b) => (a.ts < b.ts ? -1 : 1));

  // --- agrupa por sessao
  const S = new Map();
  for (const e of evs) {
    if (!S.has(e.sessao)) S.set(e.sessao, { sessao: e.sessao, inicio: e.ts, fim: e.ts, nome: null, email: null, msgs: 0, clicou: false, botoes: 0, desvios: 0, fallback: 0, categorias: [], linhas: [] });
    const s = S.get(e.sessao);
    s.fim = e.ts;
    if (e.nome && !s.nome) s.nome = e.nome;
    if (e.email && !s.email) s.email = e.email;
    if (e.tipo === "botao_clicado") s.clicou = true;
    if (e.tipo === "botao_exibido") s.botoes++;
    if (e.tipo === "msg_cliente") {
      s.msgs++;
      if (e.categoria) s.categorias.push(e.categoria);
      s.linhas.push({ ts: e.ts, quem: "cliente", texto: e.texto, categoria: e.categoria });
    }
    if (e.tipo === "msg_sophie") {
      if (e.meta?.desviou) s.desvios++;
      if (e.meta?.fallback) s.fallback++;
      s.linhas.push({ ts: e.ts, quem: "sophie", texto: e.texto, desviou: !!e.meta?.desviou, fallback: !!e.meta?.fallback });
    }
    if (e.tipo === "lead") s.linhas.push({ ts: e.ts, quem: "sistema", texto: `Contato: ${e.nome || "?"} · ${e.email || "?"}` });
  }
  const sessoes = [...S.values()].sort((a, b) => (a.fim < b.fim ? 1 : -1));

  if (sessao) return { conversa: S.get(sessao) || null };

  // --- ranking de perguntas, so sobre mensagens de cliente
  const rot = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c.rotulo]));
  rot.sem_categoria = "Sem categoria";
  const cont = {};
  const exemplos = {};
  for (const e of evs) {
    if (e.tipo !== "msg_cliente" || !e.categoria) continue;
    cont[e.categoria] = (cont[e.categoria] || 0) + 1;
    (exemplos[e.categoria] ||= []).push(e.texto);
  }
  const totalPerg = Object.values(cont).reduce((a, b) => a + b, 0);
  const categorias = Object.entries(cont)
    .map(([id, n]) => ({ id, rotulo: rot[id] || id, n, pct: totalPerg ? Math.round((n / totalPerg) * 100) : 0, exemplos: exemplos[id].slice(-4) }))
    .sort((a, b) => b.n - a.n);

  // --- problemas: onde ela nao soube, onde a IA caiu, e o que nao deu pra classificar
  const problemas = {
    desvios: evs.filter((e) => e.tipo === "msg_sophie" && e.meta?.desviou).length,
    fallback: evs.filter((e) => e.tipo === "msg_sophie" && e.meta?.fallback).length,
    naoClassificadas: (exemplos.sem_categoria || []).slice(-25).reverse(),
    perguntasSemResposta: [],
  };
  // a pergunta que gerou o desvio: a msg de cliente imediatamente anterior
  for (let i = 0; i < evs.length; i++) {
    if (evs[i].tipo !== "msg_sophie" || !evs[i].meta?.desviou) continue;
    for (let j = i - 1; j >= 0; j--) {
      if (evs[j].sessao === evs[i].sessao && evs[j].tipo === "msg_cliente") { problemas.perguntasSemResposta.push(evs[j].texto); break; }
    }
  }
  problemas.perguntasSemResposta = problemas.perguntasSemResposta.slice(-25).reverse();

  // --- contatos capturados
  const vistos = new Set();
  const leads = [];
  for (let i = evs.length - 1; i >= 0; i--) {
    const e = evs[i];
    if (e.tipo !== "lead" || !e.email || vistos.has(e.email.toLowerCase())) continue;
    vistos.add(e.email.toLowerCase());
    const s = S.get(e.sessao);
    leads.push({ nome: e.nome, email: e.email, ts: e.ts, sessao: e.sessao, msgs: s?.msgs || 0, clicou: !!s?.clicou });
  }

  const agora = Date.now();
  const aoVivo = sessoes.filter((s) => agora - new Date(s.fim).getTime() < 18e4);
  const comMsg = sessoes.filter((s) => s.msgs > 0);
  const cliques = sessoes.filter((s) => s.clicou).length;

  return {
    driver, janela,
    resumo: {
      conversas: comMsg.length,
      mensagens: evs.filter((e) => e.tipo === "msg_cliente").length,
      contatos: leads.length,
      cliques,
      taxaClique: comMsg.length ? Math.round((cliques / comMsg.length) * 100) : 0,
      aoVivo: aoVivo.length,
      desvios: problemas.desvios,
    },
    aoVivo: aoVivo.map((s) => ({ sessao: s.sessao, nome: s.nome, msgs: s.msgs, fim: s.fim, ultima: s.linhas.filter((l) => l.quem === "cliente").slice(-1)[0]?.texto || null })),
    categorias, problemas, leads,
    conversas: sessoes.filter((s) => s.msgs > 0 || s.email).slice(0, 300).map((s) => ({
      sessao: s.sessao, nome: s.nome, email: s.email, msgs: s.msgs, clicou: s.clicou,
      desvios: s.desvios, inicio: s.inicio, fim: s.fim,
      principal: s.categorias.length ? (rot[s.categorias[0]] || s.categorias[0]) : null,
    })),
  };
}

export default async function handler(req, res) {
  const q = new URL(req.url, "http://x").searchParams;
  const codigo = req.headers["x-console-code"] || q.get("codigo");
  if (!autorizado(codigo)) return res.status(401).json({ error: "codigo" });
  try {
    res.status(200).json(await painel({ janela: q.get("janela") || "7d", sessao: q.get("sessao") }));
  } catch (e) {
    console.error("[console]", e.message);
    res.status(500).json({ error: e.message });
  }
}
