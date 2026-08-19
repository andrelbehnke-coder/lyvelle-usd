/* Luvdaly live chat - Sophie.  Autocontido: injeta CSS + DOM, sem dependencia. */
(function () {
  "use strict";
  if (window.__lvdChat) return;
  window.__lvdChat = true;

  var CFG = window.LVD_CHAT_CONFIG || {};
  var API = CFG.api || "/api/chat";
  var CHECKOUT = CFG.checkout || "https://xd80cg-pf.myshopify.com/cart/49022193107114:1";
  var AGENT = CFG.agent || "Sophie";
  var STORE = CFG.store || "Luvdaly";
  var KEY = "lvd_chat_v1";
  var IDLE = (CFG.idleMin || 10) * 60 * 1000;   // 10 min parado encerra o atendimento
  function novoSid() {
    var v = "s_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    try { localStorage.setItem("lvd_sid", v); } catch (e) {}
    return v;
  }
  var SID = (function () {
    try { return localStorage.getItem("lvd_sid") || novoSid(); } catch (e) { return novoSid(); }
  })();
  function evento(tipo, extra) {
    try {
      fetch((CFG.eventApi || "/api/event"), { method: "POST", keepalive: true,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.assign({ sessao: SID, tipo: tipo, nome: S.name, email: S.email }, extra || {})) }).catch(function () {});
    } catch (e) {}
  }
  var FOTO = "data:image/webp;base64,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";
  // 1 = ritmo humano medido (~115 palavras/min). 0.7 = 30% mais rapido. 1.3 = mais lento.
  var SPEED = CFG.speed || 1;

  /* ---------------------------------------------------------------- estilo */
  var CSS = `
  .lvd-wrap{position:fixed;right:20px;bottom:20px;z-index:2147483000;font-family:'Poppins',system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.45;color:#0d0d0d}
  .lvd-wrap *{box-sizing:border-box;margin:0;padding:0}
  .lvd-wrap button{font-family:inherit;font-size:inherit;font-weight:inherit;cursor:pointer;border:0;background:transparent;color:inherit;text-transform:none;letter-spacing:normal}

  /* launcher */
  .lvd-wrap .lvd-launch{display:flex;align-items:center;gap:10px;background:#0d0d0d;color:#fff;border-radius:999px;padding:13px 20px 13px 17px;box-shadow:0 6px 26px rgba(0,0,0,.22);transition:transform .18s ease,box-shadow .18s ease;font-weight:400;letter-spacing:.01em;white-space:nowrap}
  .lvd-wrap .lvd-launch:hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(0,0,0,.28)}
  .lvd-launch svg{width:19px;height:19px;flex:none}
  .lvd-dot{width:7px;height:7px;border-radius:50%;background:#3ec46d;box-shadow:0 0 0 0 rgba(62,196,109,.6);animation:lvdPulse 2.4s infinite;flex:none}
  @keyframes lvdPulse{0%{box-shadow:0 0 0 0 rgba(62,196,109,.55)}70%{box-shadow:0 0 0 7px rgba(62,196,109,0)}100%{box-shadow:0 0 0 0 rgba(62,196,109,0)}}
  .lvd-badge{position:absolute;top:-4px;right:-4px;min-width:19px;height:19px;border-radius:999px;background:#b8472e;color:#fff;font-size:11px;font-weight:600;display:none;align-items:center;justify-content:center;padding:0 5px}
  .lvd-launch-box{position:relative}

  /* teaser */
  .lvd-teaser{position:absolute;right:0;bottom:62px;width:262px;background:#fff;border:1px solid #ece7df;border-radius:14px;padding:13px 15px;box-shadow:0 10px 34px rgba(0,0,0,.14);opacity:0;transform:translateY(8px);pointer-events:none;transition:opacity .3s ease,transform .3s ease}
  .lvd-teaser.on{opacity:1;transform:none;pointer-events:auto}
  .lvd-teaser p{font-size:13.5px;color:#1a1a1a}
  .lvd-teaser b{font-weight:500}
  .lvd-wrap .lvd-teaser-x{position:absolute;top:6px;right:8px;font-size:17px;line-height:1;color:#b5aca0}

  /* painel */
  .lvd-panel{position:absolute;right:0;bottom:64px;width:376px;max-width:calc(100vw - 32px);height:588px;max-height:calc(var(--lvdvh, 1vh) * 100 - 110px);background:#faf6f0;border-radius:18px;box-shadow:0 22px 64px rgba(0,0,0,.26);display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(14px) scale(.985);pointer-events:none;transition:opacity .22s ease,transform .22s ease}
  .lvd-panel.on{opacity:1;transform:none;pointer-events:auto}

  .lvd-head{background:#0d0d0d;color:#fff;padding:15px 16px;display:flex;align-items:center;gap:11px;flex:none}
  .lvd-av{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#c9a98d,#8a5a3b) center/cover;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;color:#fff;flex:none;position:relative}
  .lvd-av img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block}
  .lvd-av i{position:absolute;right:-1px;bottom:-1px;width:10px;height:10px;border-radius:50%;background:#3ec46d;border:2px solid #0d0d0d}
  .lvd-head-t{flex:1;min-width:0}
  .lvd-head-t strong{display:block;font-size:14.5px;font-weight:500}
  .lvd-head-t span{display:block;font-size:11.5px;color:rgba(255,255,255,.62);margin-top:1px}
  .lvd-wrap .lvd-x{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.7);font-size:20px;line-height:1;flex:none}
  .lvd-wrap .lvd-x:hover{background:rgba(255,255,255,.1);color:#fff}

  .lvd-body{flex:1;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:18px 16px;display:flex;flex-direction:column;gap:9px;scroll-behavior:smooth}
  .lvd-body::-webkit-scrollbar{width:5px}
  .lvd-body::-webkit-scrollbar-thumb{background:#ddd5c8;border-radius:9px}

  /* form */
  .lvd-form{padding:6px 2px;display:flex;flex-direction:column;gap:13px}
  .lvd-form h4{font-size:15.5px;font-weight:500}
  .lvd-form p{font-size:13px;color:#6b665e}
  .lvd-fld label{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.09em;color:#8e8a83;margin-bottom:5px}
  .lvd-fld input{width:100%;border:1px solid #e4ddd2;background:#fff;border-radius:9px;padding:11px 13px;font-size:14px;font-family:inherit;color:#0d0d0d;outline:none;transition:border-color .15s}
  .lvd-fld input:focus{border-color:#8a5a3b}
  .lvd-fld input.bad{border-color:#c4543a}
  .lvd-err{font-size:11.5px;color:#c4543a;margin-top:4px;display:none}
  .lvd-wrap .lvd-go{background:#0d0d0d;color:#fff;border-radius:9px;padding:13px;font-size:14px;font-weight:500;width:100%;transition:opacity .15s}
  .lvd-wrap .lvd-go:hover{opacity:.87}
  .lvd-fine{font-size:11px;color:#a29c92;text-align:center}

  /* fila */
  .lvd-q{display:flex;flex-direction:column;align-items:center;gap:14px;padding:40px 12px;text-align:center}
  .lvd-spin{width:34px;height:34px;border:2px solid #e4ddd2;border-top-color:#8a5a3b;border-radius:50%;animation:lvdSpin .85s linear infinite}
  @keyframes lvdSpin{to{transform:rotate(360deg)}}
  .lvd-q h5{font-size:14.5px;font-weight:400;color:#1a1a1a}
  .lvd-q-n{font-size:13px;color:#6b665e}
  .lvd-q-n b{color:#8a5a3b;font-weight:600}

  /* mensagens */
  .lvd-msg{max-width:83%;padding:10px 14px;border-radius:16px;font-size:13.8px;word-wrap:break-word;overflow-wrap:anywhere;animation:lvdIn .26s ease both}
  @keyframes lvdIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
  .lvd-a{align-self:flex-start;background:#fff;border:1px solid #ece7df;border-bottom-left-radius:5px;color:#1a1a1a}
  .lvd-u{align-self:flex-end;background:#0d0d0d;color:#fff;border-bottom-right-radius:5px}
  .lvd-sys{align-self:center;font-size:11.5px;color:#a29c92;text-align:center;padding:5px 0;animation:lvdIn .26s ease both}
  .lvd-time{font-size:10px;color:#b5aca0;align-self:flex-start;margin:-4px 0 3px 3px}
  .lvd-time.u{align-self:flex-end;margin-right:3px}

  .lvd-typing{align-self:flex-start;background:#fff;border:1px solid #ece7df;border-radius:16px;border-bottom-left-radius:5px;padding:13px 15px;display:flex;gap:4px;animation:lvdIn .2s ease both}
  .lvd-typing span{width:6px;height:6px;border-radius:50%;background:#c4bcb0;animation:lvdBounce 1.3s infinite}
  .lvd-typing span:nth-child(2){animation-delay:.18s}
  .lvd-typing span:nth-child(3){animation-delay:.36s}
  @keyframes lvdBounce{0%,60%,100%{transform:translateY(0);opacity:.45}30%{transform:translateY(-4px);opacity:1}}

  .lvd-cta{align-self:stretch;background:#12a150;color:#fff;border-radius:12px;padding:15px 18px;font-size:14.5px;font-weight:600;letter-spacing:.01em;text-align:center;display:block;text-decoration:none;box-shadow:0 3px 14px rgba(18,161,80,.32);animation:lvdIn .26s ease both;transition:background .15s,transform .15s}
  .lvd-cta:hover{background:#0e8b44;transform:translateY(-1px)}

  .lvd-chips{display:flex;flex-wrap:wrap;gap:6px;padding:3px 0 1px}
  .lvd-wrap .lvd-chip{border:1px solid #ddd5c8;background:#fff;border-radius:999px;padding:7px 13px;font-size:12.3px;color:#4a4a4a;transition:all .15s}
  .lvd-wrap .lvd-chip:hover{border-color:#8a5a3b;color:#8a5a3b}

  /* composer */
  .lvd-foot{flex:none;border-top:1px solid #ece7df;background:#fff;padding:10px 11px 9px}
  .lvd-in{display:flex;align-items:flex-end;gap:8px}
  .lvd-in textarea{flex:1;border:0;outline:none;resize:none;font-family:inherit;font-size:14px;line-height:1.4;max-height:96px;padding:8px 2px;color:#0d0d0d;background:none}
  .lvd-in textarea::placeholder{color:#b5aca0}
  .lvd-wrap .lvd-send{width:35px;height:35px;border-radius:50%;background:#0d0d0d;color:#fff;display:flex;align-items:center;justify-content:center;flex:none;transition:opacity .15s}
  .lvd-wrap .lvd-send:disabled{opacity:.28;cursor:default}
  .lvd-send svg{width:16px;height:16px}
  .lvd-brand{text-align:center;font-size:10px;color:#c4bcb0;letter-spacing:.05em;margin-top:6px}

  @media(max-width:520px), (max-height:520px) and (max-width:900px){
    .lvd-wrap{right:max(12px, env(safe-area-inset-right));bottom:max(12px, env(safe-area-inset-bottom))}
    /* tela cheia de verdade: dvh acompanha a barra do navegador aparecendo e sumindo */
    .lvd-panel{position:fixed;top:0;left:0;right:0;bottom:0;width:100%;max-width:100%;
      height:calc(var(--lvdvh, 1vh) * 100);max-height:none;border-radius:0}
    @supports (height:100dvh){ .lvd-panel{height:100dvh} }
    .lvd-head{padding-top:max(15px, env(safe-area-inset-top))}
    .lvd-foot{padding-bottom:max(9px, env(safe-area-inset-bottom))}
    .lvd-body{padding:15px 13px}
    .lvd-msg{max-width:88%;font-size:15px}
    /* abaixo de 16px o iOS da zoom sozinho no campo e desalinha a pagina inteira */
    .lvd-in textarea, .lvd-fld input{font-size:16px}
    .lvd-cta{font-size:15px;padding:16px}
    .lvd-teaser{width:min(258px, calc(100vw - 34px))}
    .lvd-wrap .lvd-launch span.lvd-txt{display:none}
    .lvd-wrap .lvd-launch{padding:15px}
    .lvd-wrap.lvd-open .lvd-launch-box{display:none}
  }
  @media(max-height:520px) and (max-width:900px){
    .lvd-head{padding:9px 14px}
    .lvd-av{width:30px;height:30px}
    .lvd-head-t span{display:none}
    .lvd-body{padding:10px 13px;gap:7px}
    .lvd-brand{display:none}
  }
  /* tela bem estreita (iPhone SE / 320px) */
  @media(max-width:360px){
    .lvd-wrap .lvd-launch{padding:13px}
    .lvd-msg{max-width:91%}
    .lvd-chip{font-size:12px;padding:6px 11px}
  }
  @media(prefers-reduced-motion:reduce){.lvd-wrap *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
  `;

  /* ---------------------------------------------------------------- markup */
  var el = document.createElement("div");
  el.className = "lvd-wrap";
  el.innerHTML = `
  <style>${CSS}</style>
  <div class="lvd-panel" id="lvdPanel" role="dialog" aria-label="Customer support chat">
    <div class="lvd-head">
      <div class="lvd-av" id="lvdAv">${STORE.slice(0, 1)}<i></i></div>
      <div class="lvd-head-t"><strong id="lvdTitle">${STORE} Support</strong><span id="lvdSub">Typically replies in under a minute</span></div>
      <button class="lvd-x" id="lvdClose" aria-label="Close chat">&times;</button>
    </div>
    <div class="lvd-body" id="lvdBody"></div>
    <div class="lvd-foot" id="lvdFoot" style="display:none">
      <div class="lvd-in">
        <textarea id="lvdText" rows="1" placeholder="Write a message..." maxlength="700"></textarea>
        <button class="lvd-send" id="lvdSend" disabled aria-label="Send">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </button>
      </div>
      <div class="lvd-brand">Secure chat &middot; ${STORE}</div>
    </div>
  </div>
  <div class="lvd-launch-box">
    <div class="lvd-teaser" id="lvdTeaser">
      <button class="lvd-teaser-x" id="lvdTeaserX" aria-label="Dismiss">&times;</button>
      <p><b>Question about the Airwrap?</b><br>An advisor is online now.</p>
    </div>
    <button class="lvd-launch" id="lvdLaunch">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-3.8-.9L3 21l2-4.9A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/></svg>
      <span class="lvd-txt">Chat Support</span>
      <span class="lvd-dot"></span>
    </button>
    <span class="lvd-badge" id="lvdBadge">1</span>
  </div>`;
  document.body.appendChild(el);

  var $ = function (id) { return document.getElementById(id); };
  var panel = $("lvdPanel"), body = $("lvdBody"), foot = $("lvdFoot"),
      input = $("lvdText"), send = $("lvdSend"), badge = $("lvdBadge"),
      teaser = $("lvdTeaser"), sub = $("lvdSub"), title = $("lvdTitle"), av = $("lvdAv");

  /* ---------------------------------------------------------------- estado */
  var S = { open: false, name: "", email: "", started: false, log: [], busy: false, unread: 0 };
  try { var raw = localStorage.getItem(KEY); if (raw) S = Object.assign(S, JSON.parse(raw), { open: false, busy: false }); } catch (e) {}
  function save() { S.ts = Date.now(); try { localStorage.setItem(KEY, JSON.stringify({ name: S.name, email: S.email, started: S.started, ts: S.ts, log: S.log.slice(-30) })); } catch (e) {} }
  function expirou() { return S.started && S.ts && Date.now() - S.ts > IDLE; }
  // atendimento encerrado: joga fora a conversa e comeca uma sessao nova do zero
  function zerar() {
    evento("encerrou");
    S.name = ""; S.email = ""; S.started = false; S.log = []; S.unread = 0; S.ts = 0; S.busy = false;
    SID = novoSid();
    try { localStorage.removeItem(KEY); } catch (e) {}
    clearTimeout(relogio);
    body.innerHTML = ""; foot.style.display = "none";
    badge.style.display = "none";
    title.textContent = STORE + " Support";
    av.innerHTML = STORE.slice(0, 1) + "<i></i>";
    sub.textContent = "Typically replies in under a minute";
  }
  var relogio = null;
  function marcar() { clearTimeout(relogio); if (S.started) relogio = setTimeout(encerrar, IDLE); }
  function encerrar() {
    if (!S.started) return;
    typingOff();
    sys(AGENT + " has left the chat");
    sys("This conversation has ended after 10 minutes of inactivity.");
    foot.style.display = "none";
    sub.textContent = "Chat ended";
    var av2 = av.querySelector("i"); if (av2) av2.style.background = "#c4bcb0";
  }

  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var clock = function () { var d = new Date(), h = d.getHours(), m = d.getMinutes(); var ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return h + ":" + (m < 10 ? "0" : "") + m + " " + ap; };
  function down() { requestAnimationFrame(function () { body.scrollTop = body.scrollHeight; }); }
  function track(ev, data) { try { if (window.fbq) window.fbq("trackCustom", ev, data || {}); } catch (e) {} }

  /* ------------------------------------------------------------ renderizar */
  function bubble(who, text) {
    var d = document.createElement("div");
    d.className = "lvd-msg " + (who === "user" ? "lvd-u" : "lvd-a");
    d.textContent = text;
    body.appendChild(d);
    var t = document.createElement("div");
    t.className = "lvd-time" + (who === "user" ? " u" : "");
    t.textContent = clock();
    body.appendChild(t);
    down();
  }
  function sys(text) {
    var d = document.createElement("div");
    d.className = "lvd-sys";
    d.textContent = text;
    body.appendChild(d);
    down();
  }
  // o rotulo do botao tambem varia, senao a repeticao entrega o script
  var CTAS = [
    "Complete your order &mdash; $179",
    "Secure yours &mdash; $179",
    "Get it at $179 today",
    "Order now &mdash; 70% off",
    "Claim the $179 price",
  ];
  var ctaVistos = [];
  function cta() {
    if (ctaVistos.length >= CTAS.length) ctaVistos = [];
    var i;
    do { i = Math.floor(Math.random() * CTAS.length); } while (ctaVistos.indexOf(i) > -1);
    ctaVistos.push(i);
    var a = document.createElement("a");
    a.className = "lvd-cta";
    a.href = CHECKOUT; a.target = "_blank"; a.rel = "noopener";
    a.innerHTML = CTAS[i];
    a.addEventListener("click", function () { track("ChatCheckoutClick"); evento("botao_clicado", { texto: CTAS[i].replace(/&[a-z]+;/g, "") }); });
    body.appendChild(a);
    evento("botao_exibido");
    down();
  }
  function chips(list) {
    var w = document.createElement("div");
    w.className = "lvd-chips";
    list.forEach(function (q) {
      var b = document.createElement("button");
      b.className = "lvd-chip"; b.textContent = q;
      b.addEventListener("click", function () { w.remove(); push(q); });
      w.appendChild(b);
    });
    body.appendChild(w);
    down();
  }
  function typingOn() {
    var j = $("lvdTyping"); if (j) { sub.textContent = AGENT + " is typing..."; return j; }
    var d = document.createElement("div");
    d.className = "lvd-typing"; d.id = "lvdTyping";
    d.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(d);
    sub.textContent = AGENT + " is typing...";
    down();
    return d;
  }
  function typingOff() {
    var d = $("lvdTyping"); if (d) d.remove();
    sub.textContent = "Online";
  }

  /* ------------------------------------------------------ fala como gente */
  // ritmo de digitacao humano.
  // ~100ms por caractere = 120 wpm, que e um atendente rapido de verdade.
  // A velocidade varia por mensagem, do mesmo jeito que uma pessoa varia.
  var CPS = 0;  // ms por caractere nesta mensagem
  function tempoDeDigitar(text) {
    if (!CPS) CPS = rnd(80, 110) * SPEED;
    return Math.min(10000 * SPEED, Math.max(1000, text.length * CPS));
  }
  // pausa pra LER a pergunta antes de comecar a digitar
  function tempoDeLer() {
    var gasto = window.__lvdJaEsperou || 0;
    var ult = "";
    for (var i = S.log.length - 1; i >= 0; i--) { if (S.log[i].role === "user") { ult = S.log[i].text; break; } }
    var ideal = Math.min(3000, 800 + ult.length * 8) * rnd(0.85, 1.2);
    return Math.max(250, ideal - gasto);
  }

  async function say(text, first, jaLeu) {
    if (!(first && jaLeu)) await wait(first ? tempoDeLer() : rnd(400, 900));
    typingOn();
    var t = tempoDeDigitar(text);
    // em frase longa a pessoa para no meio pra pensar - o "digitando" pisca
    if (text.length > 105 && Math.random() < 0.55) {
      var corte = t * rnd(0.4, 0.65);
      await wait(corte);
      typingOff();
      await wait(rnd(500, 950));
      typingOn();
      await wait(t - corte);
    } else {
      await wait(t);
    }
    typingOff();
    bubble("agent", text);
    S.log.push({ role: "agent", text: text });
    if (!S.open) { S.unread++; badge.textContent = S.unread; badge.style.display = "flex"; }
    save();
  }
  // O paragrafo que o modelo escreveu JA e a fronteira certa do balao.
  // Aqui so quebramos paragrafo grande demais, sempre em fim de frase. Nunca juntamos.
  var MAX = 125;
  function embalar(raw) {
    var out = [];
    raw.split(/\n{2,}/).forEach(function (par) {
      par = par.replace(/\s+/g, " ").trim();
      if (!par) return;
      if (par.length <= MAX) { out.push(par); return; }
      var frases = par.match(/[^.!?]+[.!?]*\s*/g) || [par];
      var atual = "";
      frases.forEach(function (f) {
        f = f.trim(); if (!f) return;
        if (!atual) atual = f;
        else if ((atual + " " + f).length <= MAX) atual += " " + f;
        else { out.push(atual); atual = f; }
      });
      if (atual) out.push(atual);
    });
    if (out.length > 5) out = out.slice(0, 4).concat(out.slice(4).join(" "));
    return out;
  }

  async function speak(raw, jaEsperou) {
    CPS = 0;
    window.__lvdJaEsperou = jaEsperou > 0 ? jaEsperou : 0;
    var wantsCta = /\[\[CHECKOUT\]\]/.test(raw);
    var parts = embalar(raw.replace(/\[\[CHECKOUT\]\]/g, ""));
    if (!parts.length) parts = ["Sorry, could you say that again?"];
    var jaLeu = (jaEsperou === -1);
    for (var i = 0; i < parts.length; i++) await say(parts[i], i === 0, jaLeu);
    if (wantsCta) { await wait(430); cta(); }
  }

  /* ------------------------------------------------------------- cerebro */
  async function think(text) {
    try {
      var ctl = new AbortController();
      var to = setTimeout(function () { ctl.abort(); }, 20000);
      var r = await fetch(API, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firstName: S.name, email: S.email, sessao: SID, messages: S.log.slice(-24) }),
        signal: ctl.signal,
      });
      clearTimeout(to);
      if (!r.ok) throw new Error(r.status);
      var j = await r.json();
      if (j && j.text) return j.text;
      throw new Error("empty");
    } catch (e) {
      return local(text);
    }
  }
  // rede de seguranca: se a API cair, ela ainda responde o essencial
  function local(text) {
    var FB = window.LVD_FALLBACK || [];
    for (var i = 0; i < FB.length; i++) {
      if (new RegExp(FB[i].re, "i").test(text)) return FB[i].a.join("\n\n");
    }
    return "Let me double-check that one so I don't give you the wrong answer.\n\nI'll send it to " + (S.email || "your email") + " shortly. Anything else I can help with in the meantime?";
  }

  /* ---------------------------------------------------------------- fluxo */
  async function push(text) {
    text = (text || "").trim();
    if (!text || S.busy) return;
    S.busy = true; send.disabled = true;
    var c = body.querySelector(".lvd-chips"); if (c) c.remove();
    bubble("user", text);
    S.log.push({ role: "user", text: text });
    save(); marcar();
    input.value = ""; input.style.height = "auto";
    // ela le a mensagem primeiro. so depois de uns 3s e que aparece o "digitando".
    var t0 = Date.now();
    var jaDigitando = false;
    var aviso = setTimeout(function () { typingOn(); jaDigitando = true; }, rnd(2600, 3600));
    var out = await think(text);
    clearTimeout(aviso);
    // se ja estava digitando, nao desliga - desligar aqui era o que fazia piscar
    if (!jaDigitando) typingOff();
    await speak(out, jaDigitando ? -1 : Date.now() - t0);
    S.busy = false; sync();
  }

  async function queue() {
    body.innerHTML = "";
    var q = document.createElement("div");
    q.className = "lvd-q";
    q.innerHTML = '<div class="lvd-spin"></div><h5>Connecting you to the next available advisor</h5><div class="lvd-q-n" id="lvdQn">You are number <b>3</b> in the queue</div>';
    body.appendChild(q);
    var n = $("lvdQn");
    await wait(3400); n.innerHTML = "You are number <b>2</b> in the queue";
    await wait(3300); n.innerHTML = "You are number <b>1</b> in the queue";
    await wait(3100); n.innerHTML = "An advisor is joining...";
    await wait(900);
    q.remove();
    title.textContent = AGENT; av.innerHTML = '<img src="' + FOTO + '" alt="' + AGENT + '"><i></i>';
    sub.textContent = "Online";
    sys(AGENT + " has joined the chat");
    track("ChatAgentJoined"); evento("atendente_entrou");
    await wait(700);
    await say("Hi " + S.name + ", I'm " + AGENT + " from the " + STORE + " team.", true);
    await say("What can I help you with on the Airwrap?");
    await wait(400);
    chips(["Is it a genuine Dyson?", "Why is it $179?", "How fast is shipping?", "Will it work on my hair?"]);
    S.busy = false; sync();
  }

  function form() {
    body.innerHTML = "";
    var f = document.createElement("div");
    f.className = "lvd-form";
    f.innerHTML = `
      <h4>Chat with our team</h4>
      <p>Tell us who you are and an advisor will be with you in a moment.</p>
      <div class="lvd-fld"><label for="lvdN">First name</label><input id="lvdN" type="text" autocomplete="given-name" placeholder="Emma"><div class="lvd-err" id="lvdNE">Please enter your first name</div></div>
      <div class="lvd-fld"><label for="lvdE">Email</label><input id="lvdE" type="email" autocomplete="email" inputmode="email" placeholder="emma@email.com"><div class="lvd-err" id="lvdEE">Please enter a valid email</div></div>
      <button class="lvd-go" id="lvdStart">Start chat</button>
      <div class="lvd-fine">We only use this to follow up on your question.</div>`;
    body.appendChild(f);
    var n = $("lvdN"), e = $("lvdE");
    function go() {
      var okN = n.value.trim().length >= 2;
      var okE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(e.value.trim());
      n.classList.toggle("bad", !okN); $("lvdNE").style.display = okN ? "none" : "block";
      e.classList.toggle("bad", !okE); $("lvdEE").style.display = okE ? "none" : "block";
      if (!okN || !okE) return;
      S.name = n.value.trim().split(/\s+/)[0].replace(/^./, function (c) { return c.toUpperCase(); });
      S.email = e.value.trim(); S.started = true; S.busy = true;
      save();
      try { if (window.fbq) window.fbq("track", "Lead", { content_name: "Live chat", value: 0, currency: "USD" }); } catch (er) {}
      evento("lead");
      foot.style.display = "block";
      marcar();
      queue();
    }
    $("lvdStart").addEventListener("click", go);
    e.addEventListener("keydown", function (ev) { if (ev.key === "Enter") go(); });
    n.addEventListener("keydown", function (ev) { if (ev.key === "Enter") e.focus(); });
    setTimeout(function () { n.focus(); }, 260);
  }

  function restore() {
    body.innerHTML = "";
    title.textContent = AGENT; av.innerHTML = '<img src="' + FOTO + '" alt="' + AGENT + '"><i></i>'; sub.textContent = "Online";
    sys("Conversation with " + AGENT);
    S.log.forEach(function (m) { bubble(m.role === "agent" ? "agent" : "user", m.text); });
    foot.style.display = "block";
    marcar();
    sync();
  }

  function sync() { send.disabled = S.busy || !input.value.trim(); }

  /* ------------------------------------------------------------- abre/fecha */
  function open() {
    S.open = true; panel.classList.add("on"); el.classList.add("lvd-open");
    S.unread = 0; badge.style.display = "none";
    teaser.classList.remove("on");
    if (expirou()) zerar();
    track("ChatOpened"); evento("abriu");
    if (!S.started) form();
    else if (!body.children.length) restore();
    down();
    travarFundo(true); alturaReal();
    if (S.started && !compacto()) setTimeout(function () { input.focus(); }, 240);
  }
  function close() { S.open = false; panel.classList.remove("on"); el.classList.remove("lvd-open"); panel.style.height = ""; panel.style.transform = ""; travarFundo(false); alturaReal(); }

  $("lvdLaunch").addEventListener("click", function () { S.open ? close() : open(); });
  $("lvdClose").addEventListener("click", close);
  $("lvdTeaserX").addEventListener("click", function (e) { e.stopPropagation(); teaser.classList.remove("on"); try { sessionStorage.setItem("lvd_teaser", "1"); } catch (er) {} });
  teaser.addEventListener("click", function () { open(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && S.open) close(); });

  input.addEventListener("input", function () { this.style.height = "auto"; this.style.height = Math.min(96, this.scrollHeight) + "px"; sync(); });
  input.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.keyCode === 13) && !e.shiftKey) { e.preventDefault(); push(this.value); } });
  send.addEventListener("click", function () { push(input.value); });

  // ---- mobile: altura real e teclado ----
  // mesmo criterio da media query acima: telinha, deitada ou nao
  function compacto() { return window.innerWidth <= 520 || (window.innerHeight <= 520 && window.innerWidth <= 900); }
  var vv = window.visualViewport;
  function alturaReal() {
    el.style.setProperty("--lvdvh", window.innerHeight / 100 + "px");
    // No iOS o teclado nao mexe em innerHeight nem em dvh: o campo de digitar fica
    // atras do teclado. So o visualViewport enxerga. Estilo inline pra vencer a folha.
    if (compacto() && S.open && vv) {
      panel.style.height = Math.round(vv.height) + "px";
      panel.style.transform = vv.offsetTop ? "translateY(" + Math.round(vv.offsetTop) + "px)" : "";
    } else {
      panel.style.height = "";
      panel.style.transform = "";
    }
  }
  alturaReal();
  window.addEventListener("resize", alturaReal);
  window.addEventListener("orientationchange", function () { setTimeout(alturaReal, 260); });
  if (vv) { vv.addEventListener("resize", alturaReal); vv.addEventListener("scroll", alturaReal); }
  // teclado abriu: garante que a ultima mensagem continua visivel
  input.addEventListener("focus", function () { setTimeout(function () { alturaReal(); down(); }, 320); });

  // ---- trava a rolagem da pagina enquanto o chat esta aberto no celular ----
  var scrollY = 0;
  function travarFundo(t) {
    if (!compacto()) return;
    var b = document.body;
    if (t) {
      scrollY = window.pageYOffset;
      b.style.position = "fixed"; b.style.top = -scrollY + "px";
      b.style.left = "0"; b.style.right = "0"; b.style.width = "100%";
    } else if (b.style.position === "fixed") {
      b.style.position = ""; b.style.top = ""; b.style.left = ""; b.style.right = ""; b.style.width = "";
      window.scrollTo(0, scrollY);
    }
  }

  // convite depois de 18s de pagina, uma vez por sessao
  try {
    if (!sessionStorage.getItem("lvd_teaser")) {
      setTimeout(function () { if (!S.open) { teaser.classList.add("on"); sessionStorage.setItem("lvd_teaser", "1"); } }, 18000);
    }
  } catch (e) {}
})();
