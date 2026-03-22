/**
 * ─────────────────────────────────────────────────────────────
 * DADOS REBOLADOS — Lógica da aplicação
 * ─────────────────────────────────────────────────────────────
 */

/* ── Constantes ──────────────────────────────────────────── */

const DICE_TYPES = [
  { type: 'D4',  faces: 4,  emoji: '▲' },
  { type: 'D6',  faces: 6,  emoji: '⬛' },
  { type: 'D8',  faces: 8,  emoji: '◆' },
  { type: 'D10', faces: 10, emoji: '⬟' },
  { type: 'D12', faces: 12, emoji: '⬠' },
  { type: 'D20', faces: 20, emoji: '⬡' },
];

const THEMES = ['dark', 'medieval', 'modern', 'cyberpunk', 'bw'];

const MAX_DICE          = 20;
const ROLL_ANIM_DURATION = 1700; // ms — inclui margem para stagger por dado

/** Níveis de zoom em pixels (tamanho do dado) */
const ZOOM_LEVELS = [48, 56, 64, 72, 80, 96, 112];
const ZOOM_DEFAULT_INDEX = 3; // 72 px

/* ── Estado global ───────────────────────────────────────── */

// Quantidade de cada tipo de dado na mesa
const diceState = Object.fromEntries(DICE_TYPES.map(d => [d.type, 0]));

let isRolling   = false;
let zoomIndex   = ZOOM_DEFAULT_INDEX;

/* ── Utilitários ─────────────────────────────────────────── */

/**
 * Retorna um inteiro aleatório entre 1 e `faces` (inclusivo).
 * @param {number} faces
 * @returns {number}
 */
function rollDie(faces) {
  return Math.floor(Math.random() * faces) + 1;
}

/** Calcula o total de dados na mesa. */
function getTotalDice() {
  return Object.values(diceState).reduce((sum, n) => sum + n, 0);
}

/** Mostra um toast temporário de notificação. */
function showToast(message, duration = 2200) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/* ── Gerenciamento de estado dos dados ──────────────────── */

function addDie(type) {
  if (isRolling) return;
  if (getTotalDice() >= MAX_DICE) {
    showToast(`⚠️ Limite de ${MAX_DICE} dados atingido!`);
    return;
  }
  diceState[type]++;
  renderAll();
}

function removeDie(type) {
  if (isRolling) return;
  if (diceState[type] > 0) {
    diceState[type]--;
    renderAll();
  }
}

function clearTable() {
  if (isRolling) return;
  DICE_TYPES.forEach(d => { diceState[d.type] = 0; });
  renderAll();
}

/* ── Zoom ────────────────────────────────────────────────── */

function applyZoom() {
  const size = ZOOM_LEVELS[zoomIndex];
  document.documentElement.style.setProperty('--die-size', `${size}px`);
  const pct = Math.round((size / ZOOM_LEVELS[ZOOM_DEFAULT_INDEX]) * 100);
  document.getElementById('zoomLevel').textContent = `${pct}%`;
  document.getElementById('btnZoomOut').disabled = (zoomIndex === 0);
  document.getElementById('btnZoomIn').disabled  = (zoomIndex === ZOOM_LEVELS.length - 1);
  localStorage.setItem('drZoom', zoomIndex);
}

function zoomIn() {
  if (zoomIndex < ZOOM_LEVELS.length - 1) {
    zoomIndex++;
    applyZoom();
  }
}

function zoomOut() {
  if (zoomIndex > 0) {
    zoomIndex--;
    applyZoom();
  }
}

/* ── Temas ───────────────────────────────────────────────── */

function applyTheme(theme) {
  if (!THEMES.includes(theme)) theme = 'dark';
  document.documentElement.setAttribute('data-theme', theme);

  // Atualiza botões ativos
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });

  localStorage.setItem('drTheme', theme);
}

/* ── Renderização ────────────────────────────────────────── */

function renderAll() {
  renderControlsPanel();
  renderTableDice();
}

function renderControlsPanel() {
  const total = getTotalDice();

  DICE_TYPES.forEach(({ type }) => {
    const countEl = document.querySelector(`[data-counter="${type}"]`);
    if (countEl) countEl.textContent = diceState[type];

    const card = document.querySelector(`.die-card[data-type="${type}"]`);
    if (card) {
      card.style.borderColor = diceState[type] > 0 ? 'var(--accent-dim)' : '';
    }
  });

  const totalEl = document.querySelector('#totalCount span');
  if (totalEl) totalEl.textContent = total;

  document.getElementById('btnRoll').disabled = (total === 0 || isRolling);
}

function renderTableDice() {
  const container   = document.getElementById('diceTableContainer');
  const placeholder = document.getElementById('tablePlaceholder');
  const total       = getTotalDice();

  container.innerHTML = '';

  if (total === 0) {
    placeholder.style.display = 'flex';
    return;
  }

  placeholder.style.display = 'none';

  let globalIndex = 0;
  DICE_TYPES.forEach(({ type, faces }) => {
    for (let i = 0; i < diceState[type]; i++) {
      container.appendChild(createDieElement(type, faces, globalIndex));
      globalIndex++;
    }
  });
}

/**
 * Cria e retorna um elemento DOM para um dado visual.
 * @param {string} type  - Tipo (ex: "D20")
 * @param {number} faces - Número de faces
 * @param {number} index - Índice global para variação de animação
 * @returns {HTMLElement}
 */
function createDieElement(type, faces, index) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('die-visual');
  wrapper.dataset.type  = type;
  wrapper.dataset.faces = faces;
  wrapper.dataset.index = index;

  const face = document.createElement('div');
  face.classList.add('die-face');

  const dieInfo = DICE_TYPES.find(d => d.type === type);
  const symbol  = document.createElement('span');
  symbol.classList.add('die-symbol');
  symbol.textContent = dieInfo ? dieInfo.emoji : type.toLowerCase();

  face.appendChild(document.createTextNode(type));
  face.appendChild(symbol);
  wrapper.appendChild(face);
  return wrapper;
}

/* ── Animação e sorteio ──────────────────────────────────── */

/**
 * Função principal de rolagem:
 * 1. Sorteia os valores.
 * 2. Define variáveis CSS físicas (rotação, slide, duração) por dado.
 * 3. Aplica animação realista em múltiplas fases.
 * 4. Cicla números aleatórios na face durante o giro.
 * 5. Exibe resultados finais e atualiza o log.
 */
function rollDice() {
  if (isRolling || getTotalDice() === 0) return;

  isRolling = true;
  document.getElementById('btnRoll').disabled = true;

  const diceEls = document.querySelectorAll('.die-visual');
  const results = [];

  diceEls.forEach(dieEl => {
    const faces = parseInt(dieEl.dataset.faces, 10);
    const type  = dieEl.dataset.type;
    const value = rollDie(faces);
    results.push({ type, faces, value, el: dieEl });
  });

  const randSignedAngle = (min, max) =>
    (Math.random() < 0.5 ? -1 : 1) * (min + Math.random() * (max - min));

  const cycleTimers = [];

  results.forEach(({ el, faces }, i) => {
    const delay    = i * 55 + Math.random() * 70;
    const duration = 1380 + Math.random() * 320;

    const r1x = randSignedAngle(130, 220), r1y = randSignedAngle(100, 190), r1z = randSignedAngle(70, 140);
    const r2x = r1x + randSignedAngle(70, 130),  r2y = r1y + randSignedAngle(55, 110),  r2z = r1z + randSignedAngle(35, 70);
    const r3x = r2x + randSignedAngle(35, 72),   r3y = r2y + randSignedAngle(26, 62),   r3z = r2z + randSignedAngle(16, 42);
    const r4x = r3x + randSignedAngle(16, 36),   r4y = r3y + randSignedAngle(12, 30),   r4z = r3z + randSignedAngle(8, 20);
    const r5x = r4x + randSignedAngle(7, 15),    r5y = r4y + randSignedAngle(5, 12),    r5z = r4z + randSignedAngle(3, 8);
    const r6x = r5x + randSignedAngle(2, 5),     r6y = r5y + randSignedAngle(1, 4),     r6z = r5z + randSignedAngle(1, 3);

    const tx = randSignedAngle(5, 12);

    [[r1x,r1y,r1z],[r2x,r2y,r2z],[r3x,r3y,r3z],
     [r4x,r4y,r4z],[r5x,r5y,r5z],[r6x,r6y,r6z]]
      .forEach(([rx, ry, rz], phase) => {
        const p = phase + 1;
        el.style.setProperty(`--r${p}x`, `${rx}deg`);
        el.style.setProperty(`--r${p}y`, `${ry}deg`);
        el.style.setProperty(`--r${p}z`, `${rz}deg`);
      });

    el.style.setProperty('--tx', `${tx}px`);
    el.style.setProperty('--roll-duration', `${duration}ms`);

    setTimeout(() => {
      el.classList.add('rolling');
      const face = el.querySelector('.die-face');
      const cycleTimer = setInterval(() => { face.textContent = rollDie(faces); }, 100);
      cycleTimers.push(cycleTimer);
    }, delay);
  });

  setTimeout(() => {
    cycleTimers.forEach(id => clearInterval(id));

    const totals   = {};
    let grandTotal = 0;

    results.forEach(({ type, faces, value, el }) => {
      el.classList.remove('rolling');

      const face    = el.querySelector('.die-face');
      const dieInfo = DICE_TYPES.find(d => d.type === type);
      const emoji   = dieInfo ? dieInfo.emoji : type.toLowerCase();
      face.innerHTML = `${value}<span class="die-symbol">${emoji}</span>`;

      if (value === faces) {
        el.classList.add('glowing');
        face.style.boxShadow = '0 0 24px var(--gold), inset 0 1px 0 rgba(255,255,255,0.2)';
        setTimeout(() => {
          el.classList.remove('glowing');
          face.style.boxShadow = '';
        }, 3000);
      }

      if (!totals[type]) totals[type] = [];
      totals[type].push({ value, isMax: value === faces, isMin: value === 1 });
      grandTotal += value;
    });

    addLogEntry(totals, grandTotal, results.length);

    isRolling = false;
    document.getElementById('btnRoll').disabled = false;
  }, ROLL_ANIM_DURATION + 200);
}

/* ── Log / Histórico ─────────────────────────────────────── */

/**
 * Cria e insere uma entrada no histórico de rolagens.
 * @param {Object} totals     - Resultados agrupados por tipo
 * @param {number} grandTotal - Soma total
 * @param {number} diceCount  - Quantidade de dados rolados
 */
function addLogEntry(totals, grandTotal, diceCount) {
  const logHistory = document.getElementById('logHistory');

  const emptyMsg = logHistory.querySelector('.log-empty');
  if (emptyMsg) emptyMsg.remove();

  const prevLatest = logHistory.querySelector('.log-entry.latest');
  if (prevLatest) prevLatest.classList.remove('latest');

  const entry = document.createElement('div');
  entry.classList.add('log-entry', 'latest');

  const rollsLine = document.createElement('div');
  rollsLine.classList.add('log-rolls');

  DICE_TYPES.forEach(({ type }) => {
    if (totals[type]) {
      totals[type].forEach(({ value, isMax, isMin }) => {
        const tag = document.createElement('span');
        tag.classList.add('roll-tag');
        tag.dataset.type = type;
        tag.textContent  = `${type}:${value}`;
        if (isMax) tag.classList.add('is-max');
        if (isMin) tag.classList.add('is-min');
        rollsLine.appendChild(tag);
      });
    }
  });

  const totalLine = document.createElement('div');
  totalLine.classList.add('log-total');
  totalLine.innerHTML = `
    <span class="total-label">${diceCount}d →</span>
    <span>⚡ Total: ${grandTotal}</span>
  `;

  entry.appendChild(rollsLine);
  entry.appendChild(totalLine);
  logHistory.prepend(entry);

  const entries = logHistory.querySelectorAll('.log-entry');
  if (entries.length > 10) entries[entries.length - 1].remove();
}

/* ── Inicialização ───────────────────────────────────────── */

/** Constrói os cards de dado no painel de controles. */
function buildDiceGrid() {
  const grid = document.getElementById('diceGrid');
  grid.innerHTML = '';

  DICE_TYPES.forEach(({ type }) => {
    const card = document.createElement('div');
    card.classList.add('die-card');
    card.dataset.type = type;

    card.innerHTML = `
      <span class="die-label">${type}</span>
      <span class="die-count" data-counter="${type}">0</span>
      <div class="die-btns">
        <button class="btn-die minus" aria-label="Remover ${type}" data-action="remove" data-type="${type}">−</button>
        <button class="btn-die plus"  aria-label="Adicionar ${type}" data-action="add"   data-type="${type}">+</button>
      </div>
    `;

    grid.appendChild(card);
  });
}

/** Registra todos os event listeners. */
function bindEvents() {
  // Grade de dados
  document.getElementById('diceGrid').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, type } = btn.dataset;
    if (action === 'add')    addDie(type);
    if (action === 'remove') removeDie(type);
  });

  // Botão Rolar
  document.getElementById('btnRoll').addEventListener('click', rollDice);

  // Botão Limpar
  document.getElementById('btnClear').addEventListener('click', () => {
    clearTable();
    showToast('🗑️ Mesa limpa!');
  });

  // Controles de zoom
  document.getElementById('btnZoomIn').addEventListener('click',  zoomIn);
  document.getElementById('btnZoomOut').addEventListener('click', zoomOut);

  // Seletor de temas
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
  });

  // Atalho de teclado: Espaço ou Enter no body para rolar
  document.addEventListener('keydown', e => {
    if ((e.code === 'Space' || e.code === 'Enter') && e.target === document.body) {
      e.preventDefault();
      if (!document.getElementById('btnRoll').disabled) rollDice();
    }
  });
}

/** Ponto de entrada da aplicação. */
function init() {
  // Restaura tema salvo
  const savedTheme = localStorage.getItem('drTheme') || 'dark';
  applyTheme(savedTheme);

  // Restaura zoom salvo
  const savedZoom = parseInt(localStorage.getItem('drZoom'), 10);
  if (!isNaN(savedZoom) && savedZoom >= 0 && savedZoom < ZOOM_LEVELS.length) {
    zoomIndex = savedZoom;
  }
  applyZoom();

  buildDiceGrid();
  bindEvents();
  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
