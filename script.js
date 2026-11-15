// ATALHOS
const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2, '0');
const iso = (ano, mes, dia) => ano + '-' + pad(mes + 1) + '-' + pad(dia);
const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// CATEGORIAS 
const CATS = {
  salario:     { n: 'Salário',         c: '#3ddc97', t: 'in'  },
  freela:      { n: 'Freelance',       c: '#2dd4bf', t: 'in'  },
  extra:       { n: 'Outras entradas', c: '#86efac', t: 'in'  },
  moradia:     { n: 'Moradia',         c: '#3b82f6', t: 'out' },
  alimentacao: { n: 'Alimentação',     c: '#f4b860', t: 'out' },
  transporte:  { n: 'Transporte',      c: '#22d3ee', t: 'out' },
  lazer:       { n: 'Lazer',           c: '#f97316', t: 'out' },
  saude:       { n: 'Saúde',           c: '#34d399', t: 'out' },
  estudos:     { n: 'Estudos',         c: '#facc15', t: 'out' },
  outros:      { n: 'Outros',          c: '#94a3b8', t: 'out' }
};

// ESTADO (o que o site "lembra")
const KEY = 'cofre-v1';
const now = new Date();
let y = now.getFullYear();   // ano que está sendo mostrado
let m = now.getMonth();      // mês que está sendo mostrado (0 = janeiro)
let flt = 'all';             // filtro da lista
let type = 'out';            // tipo no formulário
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

// SALVAR E CARREGAR 
function load() {
  try {
    const r = localStorage.getItem(KEY);
    if (r) return JSON.parse(r);
  } catch (e) {}
  return null;
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(tx));
  } catch (e) {}
}

//  DADOS DE EXEMPLO 
function seed() {
  const out = [];
  let id = 1;
  for (let k = 5; k >= 0; k--) {
    const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
    const ano = d.getFullYear(), mes = d.getMonth();
    const add = (dia, desc, val, t, cat) => {
      if (k === 0 && dia > now.getDate()) return;
      out.push({ id: id++, desc, val, type: t, cat, date: iso(ano, mes, dia) });
    };
    add(5, 'Salário', 3200, 'in', 'salario');
    if (k % 2) add(18, 'Projeto freelance', 650 + k * 40, 'in', 'freela');
    add(6, 'Aluguel e condomínio', 900, 'out', 'moradia');
    add(8, 'Mercado', 210 + k * 9, 'out', 'alimentacao');
    add(14, 'Mercado', 180 + k * 7, 'out', 'alimentacao');
    add(11, 'Delivery', 46 + k * 3, 'out', 'alimentacao');
    add(9, 'Gasolina', 150, 'out', 'transporte');
    add(20, 'App de corrida', 38 + k * 2, 'out', 'transporte');
    add(15, 'Cinema e lanche', 72, 'out', 'lazer');
    add(22, 'Streaming', 39.9, 'out', 'lazer');
    add(12, 'Curso online', 89, 'out', 'estudos');
    if (k % 3 === 0) add(25, 'Farmácia', 64, 'out', 'saude');
  }
  return out;
}

let tx = load();           // tx = lista de todas as transações
if (!tx) { tx = seed(); save(); }

//  SOMAR POR MÊS 
const sum = (ano, mes, t) =>
  tx.filter(x => x.type === t && x.date.startsWith(ano + '-' + pad(mes + 1)))
    .reduce((a, x) => a + x.val, 0);

//  ANIMAÇÃO DO NÚMERO 
function countTo(el, to) {
  const from = el._v || 0;
  el._v = to;
  if (still) { el.textContent = brl(to); return; }
  const t0 = performance.now();
  const step = t => {
    const p = Math.min(1, (t - t0) / 600);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = brl(from + (to - from) * e);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// DESENHAR A TELA 
function render() {
  const key = y + '-' + pad(m + 1);
  const items = tx
    .filter(x => x.date.startsWith(key))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  $('#mlabel').textContent = new Date(y, m, 1)
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const inc = sum(y, m, 'in');
  const out = sum(y, m, 'out');
  const bal = inc - out;

  countTo($('#saldo'), bal);
  $('#saldo').className = 'big ' + (bal < 0 ? 'neg' : '');

  const pd = new Date(y, m - 1, 1);
  const po = sum(pd.getFullYear(), pd.getMonth(), 'out');
  if (po > 0) {
    const p = (out - po) / po * 100;
    $('#delta').textContent = 'Você gastou ' + Math.abs(p).toFixed(0) + '% ' +
      (p > 0 ? 'a mais' : 'a menos') + ' que no mês anterior.';
  } else {
    $('#delta').textContent = 'Sem dados do mês anterior para comparar.';
  }

  $('#inc').textContent = brl(inc);
  $('#out').textContent = brl(out);
  $('#rate').textContent = inc > 0 ? Math.round(bal / inc * 100) + '%' : '–';

    spark(items);
  donut(items);
  bars();
  list(items); 
}
  // ===== SEGURANÇA DO TEXTO =====
const esc = s => s.replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ===== GRÁFICO DE LINHA (fundo do cartão) =====
function spark(items) {
  const dias = new Date(y, m + 1, 0).getDate();   // quantos dias tem o mês
  const porDia = Array(dias).fill(0);

  items.forEach(t => {
    porDia[+t.date.slice(8) - 1] += t.type === 'in' ? t.val : -t.val;
  });

  const mesAtual = y === now.getFullYear() && m === now.getMonth();
  const limite = mesAtual ? now.getDate() : dias;

  let acc = 0;
  const pontos = porDia.map(v => acc += v).slice(0, limite);

  const min = Math.min(0, ...pontos);
  const max = Math.max(1, ...pontos);
  const X = i => (i / (dias - 1) * 400).toFixed(1);
  const Y = v => (100 - (v - min) / ((max - min) || 1) * 90).toFixed(1);

  const linha = pontos.map((v, i) => (i ? 'L' : 'M') + X(i) + ' ' + Y(v)).join('');
  const area = linha + 'L' + X(pontos.length - 1) + ' 110L0 110Z';

  $('#spark').innerHTML = `
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#7fd0ff" stop-opacity=".28"/>
        <stop offset="1" stop-color="#7fd0ff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <line x1="0" x2="400" y1="${Y(0)}" y2="${Y(0)}" stroke="#ffffff44"
          stroke-dasharray="3 4" vector-effect="non-scaling-stroke"/>
    <path d="${area}" fill="url(#g)"/>
    <path d="${linha}" fill="none" stroke="#7fd0ff" stroke-width="2"
          vector-effect="non-scaling-stroke"/>`;
}

// ===== GRÁFICO DE PIZZA =====
function donut(items) {
  const porCat = {};
  items.filter(t => t.type === 'out')
       .forEach(t => porCat[t.cat] = (porCat[t.cat] || 0) + t.val);

  const lista = Object.entries(porCat).sort((a, b) => b[1] - a[1]);
  const total = lista.reduce((a, e) => a + e[1], 0);
  const C = 2 * Math.PI * 58;   // comprimento da circunferência
  let acc = 0;

  let svg = '<circle cx="75" cy="75" r="58" fill="none" stroke="#12203f" stroke-width="14"/>';

  lista.forEach(([k, v]) => {
    const len = v / total * C;
    svg += `<circle cx="75" cy="75" r="58" fill="none" stroke="${CATS[k].c}"
      stroke-width="14" stroke-dasharray="${Math.max(len - 2, 0.5)} ${C}"
      stroke-dashoffset="${-acc}" transform="rotate(-90 75 75)"/>`;
    acc += len;
  });

  svg += `<text x="75" y="71" text-anchor="middle" fill="#7f8fb3" font-size="10"
            font-family="DM Sans, sans-serif">Gastos</text>
          <text x="75" y="89" text-anchor="middle" fill="#eaf0ff" font-size="13"
            font-weight="700" font-family="Bricolage Grotesque, sans-serif">${total ? brl(total) : '–'}</text>`;

  $('#donut').innerHTML = svg;

  $('#legend').innerHTML = lista.length
    ? lista.map(([k, v]) =>
        `<li><i style="background:${CATS[k].c}"></i>${CATS[k].n}<em>${Math.round(v / total * 100)}%</em></li>`
      ).join('')
    : '<li class="mute">Nenhum gasto neste mês.</li>';
}

// ===== GRÁFICO DE BARRAS (6 MESES) =====
function bars() {
  const meses = [];
  for (let k = 5; k >= 0; k--) {
    const d = new Date(y, m - k, 1);
    const ano = d.getFullYear(), mes = d.getMonth();
    meses.push({
      nome: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      ent: sum(ano, mes, 'in'),
      sai: sum(ano, mes, 'out')
    });
  }

  const max = Math.max(1, ...meses.flatMap(a => [a.ent, a.sai]));
  let svg = '<line x1="0" x2="360" y1="120" y2="120" stroke="#15254a"/>';

  meses.forEach((a, i) => {
    const x = i * 60 + 12;
    const hi = a.ent / max * 105;
    const ho = a.sai / max * 105;
    svg += `<rect x="${x}" y="${120 - hi}" width="16" height="${hi}" rx="3" fill="#3ddc97"/>
            <rect x="${x + 20}" y="${120 - ho}" width="16" height="${ho}" rx="3" fill="#ff6b6b"/>
            <text x="${x + 18}" y="140" text-anchor="middle" fill="#7f8fb3" font-size="11"
              font-family="DM Sans, sans-serif">${a.nome}</text>`;
  });

  $('#bars').innerHTML = svg;
}

// ===== LISTA DE TRANSAÇÕES =====
function list(items) {
  const filtradas = items.filter(t => flt === 'all' || t.type === flt);

  $('#list').innerHTML = filtradas.length
    ? filtradas.map(t => `
        <li>
          <span class="dot" style="background:${CATS[t.cat].c}">${CATS[t.cat].n[0]}</span>
          <div class="d">
            <b>${esc(t.desc)}</b>
            <small><span>${CATS[t.cat].n}</span><span>${t.date.slice(8)}/${t.date.slice(5, 7)}</span></small>
          </div>
          <span class="v ${t.type === 'in' ? 'pos' : ''}">${t.type === 'in' ? '+' : '−'}${brl(t.val)}</span>
          <button class="x" data-id="${t.id}" aria-label="Excluir">✕</button>
        </li>`).join('')
    : '<li class="empty">Nenhuma transação aqui. Use os botões acima para começar.</li>';
}

// ===== EXCLUIR TRANSAÇÃO =====
$('#list').onclick = e => {
  const b = e.target.closest('.x');
  if (!b) return;
  tx = tx.filter(t => t.id !== +b.dataset.id);
  save();
  render();
};

// ===== FILTROS (Todas / Entradas / Saídas) =====
$('#chips').onclick = e => {
  const b = e.target.closest('button');
  if (!b) return;
  flt = b.dataset.f;
  [...$('#chips').children].forEach(c => c.classList.toggle('on', c === b));
  render();
};


//  BOTÕES DE MÊS 
$('#prev').onclick = () => { m--; if (m < 0)  { m = 11; y--; } render(); };
$('#next').onclick = () => { m++; if (m > 11) { m = 0;  y++; } render(); };

render();
// ===== FORMULÁRIO DE NOVA TRANSAÇÃO =====
function fillCats() {
  $('#cat').innerHTML = Object.entries(CATS)
    .filter(([k, c]) => c.t === type)
    .map(([k, c]) => `<option value="${k}">${c.n}</option>`)
    .join('');
}

function setType(t) {
  type = t;
  $('#tin').className = t === 'in' ? 'on' : '';
  $('#tout').className = t === 'out' ? 'on o' : '';
  fillCats();
}

const fechar = () => $('#ov').classList.remove('show');

const abrir = t => {
  setType(t);
  $('#date').value = iso(now.getFullYear(), now.getMonth(), now.getDate());
  $('#ov').classList.add('show');
  $('#desc').focus();
};

$('#tin').onclick = () => setType('in');
$('#tout').onclick = () => setType('out');
$('#open').onclick = () => abrir('out');
$('#openIn').onclick = () => abrir('in');
$('#cancel').onclick = fechar;
$('#ov').onclick = e => { if (e.target.id === 'ov') fechar(); };
document.onkeydown = e => { if (e.key === 'Escape') fechar(); };

$('#form').onsubmit = e => {
  e.preventDefault();
  const valor = parseFloat($('#val').value);
  const data = $('#date').value;
  if (!(valor > 0) || !data) return;

  const cat = $('#cat').value;
  tx.push({
    id: Date.now(),
    desc: $('#desc').value.trim() || CATS[cat].n,
    val: valor,
    type,
    cat,
    date: data
  });

  y = +data.slice(0, 4);
  m = +data.slice(5, 7) - 1;
  save();
  fechar();
  $('#form').reset();
  render();
};

// ===== BOTÕES DO RODAPÉ =====
$('#reset').onclick = () => {
  tx = seed();
  y = now.getFullYear();
  m = now.getMonth();
  save();
  render();
};

$('#clear').onclick = function () {
  if (this.dataset.s) {
    tx = [];
    save();
    render();
    delete this.dataset.s;
    this.textContent = 'Apagar tudo';
  } else {
    this.dataset.s = 1;
    this.textContent = 'Clique de novo para confirmar';
    setTimeout(() => {
      delete this.dataset.s;
      this.textContent = 'Apagar tudo';
    }, 3000);
  }
};

// ===== FUNDO ANIMADO (partículas) =====
(() => {
  const c = $('#bg');
  const x = c.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let w, h, P = [];

  function size() {
    w = innerWidth;
    h = innerHeight;
    c.width = w * dpr;
    c.height = h * dpr;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    P = Array.from({ length: Math.min(Math.round(w * h / 16000), 90) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3
    }));
  }

  size();
  addEventListener('resize', size);

  function draw() {
    x.clearRect(0, 0, w, h);

    for (const p of P) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }

    for (let i = 0; i < P.length; i++) {
      const a = P[i];
      x.globalAlpha = 0.7;
      x.fillStyle = '#5aa2ff';
      x.beginPath();
      x.arc(a.x, a.y, 1.4, 0, 6.283);
      x.fill();

      for (let j = i + 1; j < P.length; j++) {
        const b = P[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          x.globalAlpha = (1 - d / 130) * 0.35;
          x.strokeStyle = '#3b82f6';
          x.beginPath();
          x.moveTo(a.x, a.y);
          x.lineTo(b.x, b.y);
          x.stroke();
        }
      }
    }

    x.globalAlpha = 1;
    if (!still) requestAnimationFrame(draw);
  }

  draw();
})();

// ===== INCLINAÇÃO 3D DOS CARTÕES =====
document.querySelectorAll('.panel, .card-main').forEach(el => {
  el.classList.add('tilt');

  el.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch' || still) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = 'transform .1s ease-out';
    el.style.transform =
      'perspective(900px) rotateX(' + (-py * 8).toFixed(2) + 'deg) rotateY(' +
      (px * 10).toFixed(2) + 'deg) scale3d(1.015,1.015,1.015)';
  });

  el.addEventListener('pointerleave', () => {
    el.style.transition = 'transform .5s ease-out';
    el.style.transform = '';
  });
});

// ===== INICIAR =====
fillCats();