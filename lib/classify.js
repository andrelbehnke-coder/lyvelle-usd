// Classificacao DETERMINISTICA da pergunta do cliente.
// Regra: precisao acima de cobertura. Na duvida, "sem_categoria" e o texto cru
// aparece no painel pra voce ler. Melhor um balde vazio que um balde errado.
// A ORDEM importa: o primeiro que casar vence, entao o mais especifico vem antes.

export const CATEGORIAS = [
  { id: "pedido_existente", rotulo: "Pedido já feito",
    re: /\b(my order|i ordered|already ordered|order (number|#|no)|where('s| is) my|track(ing)? (my|the|number)|hasn'?t arrived|not (yet )?(arrived|delivered))\b/i },

  { id: "golpe_confianca", rotulo: "Medo de golpe / confiança",
    re: /\b(scam|scammed|scamming|legit|legitimate|rip[- ]?off|ripoff|fraud|sketchy|shady|trust(worthy)?|safe to (buy|order)|afraid|worried|nervous|is this real site|steal my)\b/i },

  { id: "autenticidade", rotulo: "É Dyson original?",
    re: /\b(genuine|authentic|counterfeit|knock[- ]?off|knockoff|replica|fake|real dyson|actual dyson|original dyson|refurb(ished)?|serial)\b/i },

  { id: "preco_desconto", rotulo: "Preço / por que barato",
    re: /(\bwhy (is it|so) (cheap|low|129)|what'?s the catch|too good to be true|too cheap|how much|what does it cost|\bprice\b|\$ ?\d|\bdiscount\b|\b78% ?off\b|why not 597)/i },

  { id: "entrega", rotulo: "Entrega / prazo",
    re: /\b(ship(ping|s|ped)?|deliver(y|ed)?|how long.*(take|arrive)|when will (it|i)|arrive|dispatch|courier|post ?office|p\.?o\.? box|alaska|hawaii|overnight|express)\b/i },

  { id: "devolucao", rotulo: "Devolução / reembolso",
    re: /\b(return(s|ing)?|refund(ed)?|money ?back|send it back|exchange|don'?t like it|doesn'?t work for me|restocking)\b/i },

  { id: "garantia", rotulo: "Garantia / defeito",
    re: /\b(warrant(y|ies)|guarantee(d)?|breaks?|broken|defect(ive)?|repair|stops working|malfunction)\b/i },

  { id: "dano_cabelo", rotulo: "Estraga o cabelo?",
    re: /\b(damage(s|d)?|ruin|fry|frying|burn(s|t|ing)?|heat damage|breakage|split ends|safe (for|on)[\w\s]{0,18}hair|\bis it safe\b|gentle enough)\b/i },

  { id: "cabelo_tipo", rotulo: "Serve pro meu cabelo?",
    re: /\b(my hair|hair type|fine hair|thin hair|thick hair|curly|coily|kinky|wavy|straight hair|[234][abc]\b|bleach(ed)?|colou?r[- ]?treated|dyed|short hair|long hair|extensions?|frizz)\b/i },

  { id: "conteudo_caixa", rotulo: "O que vem na caixa",
    re: /\b(in the box|come(s)? with|include(d|s)?|attachment(s)?|barrel|brush|case|styling kit|accessor(y|ies)|manual|what do i get)\b/i },

  { id: "pagamento", rotulo: "Pagamento",
    re: /\b(pay(ment|ing)?|paypal|apple ?pay|google ?pay|credit card|debit|visa|mastercard|amex|american express|klarna|afterpay|affirm|instal?ments?|financing|checkout secure)\b/i },

  { id: "comparacao", rotulo: "Comparação com concorrente",
    re: /\b(revlon|shark(?! tank)|flexstyle|babyliss|conair|t3\b|amazon|versus|vs\b|compared? to|difference between|better than|instead of)\b/i },

  { id: "uso_produto", rotulo: "Como usar",
    re: /\b(how (do|to) (i )?use|instructions|tutorial|wet hair|damp hair|dry hair first|how long does it take to (style|dry)|voltage|dual ?voltage|plug|adapter|travel|noisy|loud|decibel)\b/i },

  { id: "estoque_prazo_oferta", rotulo: "Estoque / até quando",
    re: /\b(in stock|out of stock|how many left|sold out|how long.*(offer|sale|deal|price)|expire(s)?|until when|still available|colou?rs? available|other colou?rs?|(have it|comes?|available|does it come) in (blue|pink|red|black|white|gold|silver|purple|green|navy|copper|nickel|rose))\b/i },

  { id: "contato_humano", rotulo: "Quer falar com humano",
    re: /\b(real person|human|speak to someone|phone number|call you|customer service number|are you a bot|are you ai|robot|chatbot)\b/i },
];

export function classificar(texto) {
  const t = String(texto || "");
  if (t.trim().length < 2) return { id: "sem_categoria", rotulo: "Sem categoria" };
  for (const c of CATEGORIAS) if (c.re.test(t)) return { id: c.id, rotulo: c.rotulo };
  return { id: "sem_categoria", rotulo: "Sem categoria" };
}

// A Sophie admitiu que nao sabe? Isso e a sua fila de trabalho da base de conhecimento.
const DESVIO = /\b(i don'?t have (that|the|any)|i want to confirm|i'?d want to confirm|let me (double[- ])?check|i can check and email|i'?ll (check|confirm) and|don'?t have (info|details)|not sure (about|on)|outside what i handle|can'?t look (that )?up|can'?t check your order)\b/i;
export const desviou = (resposta) => DESVIO.test(String(resposta || ""));
