const screen = document.getElementById('screen');
const historyEl = document.getElementById('history');
const glow = document.getElementById('calculatorGlow');
const calculator = document.querySelector('.calculator');

let expression = '';
let lastResult = '';
let justEvaluated = false;

function formatNumber(value) {
  if (value === '' || value === null || value === undefined) return '0';
  const str = String(value);
  if (str === 'Infinity' || str === '-Infinity' || str === 'NaN') return 'Error';
  return str.length > 16 ? Number(str).toPrecision(12).replace(/\.?0+$/, '') : str;
}

function updateDisplay() {
  screen.innerText = expression || '0';
  historyEl.innerText = lastResult ? `= ${formatNumber(lastResult)}` : '';
}

function sanitizeExpression(value) {
  return value
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\s+/g, '');
}

function setGlowPosition(x, y) {
  if (!glow) return;
  glow.style.setProperty('--glow-x', `${x}%`);
  glow.style.setProperty('--glow-y', `${y}%`);
}

function flashButton(button, xPercent = 50, yPercent = 35) {
  button.style.setProperty('--press-x', `${xPercent}%`);
  button.style.setProperty('--press-y', `${yPercent}%`);
  button.classList.remove('is-pressed');
  void button.offsetWidth;
  button.classList.add('is-pressed');
  clearTimeout(button._pressTimer);
  button._pressTimer = setTimeout(() => button.classList.remove('is-pressed'), 260);
}

function isOperatorChar(char) {
  return ['+', '-', '×', '÷'].includes(char);
}

function clearAll() {
  expression = '';
  lastResult = '';
  justEvaluated = false;
  updateDisplay();
}

function backspace() {
  if (justEvaluated) {
    clearAll();
    return;
  }
  expression = expression.slice(0, -1);
  updateDisplay();
}

function normalizeOperators() {
  expression = expression
    .replace(/[+\-×÷]{2,}$/g, (match) => match.slice(-1))
    .replace(/\s+/g, '');
}

function appendValue(value) {
  if (justEvaluated && /^[0-9.]$/.test(value)) {
    expression = '';
    lastResult = '';
    justEvaluated = false;
  }

  const lastChar = expression[expression.length - 1];

  if (value === '.') {
    const segments = expression.split(/[+\-×÷]/);
    const currentSegment = segments[segments.length - 1] || '';
    if (currentSegment.includes('.')) return;
    if (!expression || isOperatorChar(lastChar)) {
      expression += '0';
    }
    expression += '.';
    updateDisplay();
    return;
  }

  if (isOperatorChar(value)) {
    if (!expression && value !== '-') return;
    if (isOperatorChar(lastChar)) {
      expression = expression.slice(0, -1) + value;
    } else {
      expression += value;
    }
    normalizeOperators();
    updateDisplay();
    return;
  }

  expression += value;
  updateDisplay();
}

function evaluateExpression() {
  if (!expression) return;

  try {
    const result = Function(`'use strict'; return (${sanitizeExpression(expression)});`)();
    lastResult = result;
    expression = formatNumber(result);
    screen.innerText = expression;
    historyEl.innerText = `= ${formatNumber(result)}`;
    justEvaluated = true;
  } catch {
    expression = '';
    lastResult = '';
    justEvaluated = false;
    screen.innerText = 'Error';
    historyEl.innerText = '';
  }
}

function getButtonFromKey(key) {
  return [...document.querySelectorAll('.liquid-key')].find((btn) => {
    const value = btn.innerText.trim();
    return value === key || (key === '*' && value === '×') || (key === '/' && value === '÷') || (key === 'Enter' && value === '=');
  });
}

function attachPressEffects(button, event) {
  const rect = button.getBoundingClientRect();
  const clientX = event?.clientX ?? rect.left + rect.width / 2;
  const clientY = event?.clientY ?? rect.top + rect.height / 2;
  const xPercent = ((clientX - rect.left) / rect.width) * 100;
  const yPercent = ((clientY - rect.top) / rect.height) * 100;
  flashButton(button, xPercent, yPercent);
  setGlowPosition(xPercent, yPercent);
}

function handleButtonAction(button) {
  const value = button.innerText.trim();
  const action = button.dataset.action;

  if (action === 'clear') {
    clearAll();
    return;
  }

  if (action === 'backspace') {
    backspace();
    return;
  }

  if (action === 'equals') {
    evaluateExpression();
    return;
  }

  if (value === '±') {
    if (!expression) return;
    if (expression.startsWith('-')) expression = expression.slice(1);
    else expression = `-${expression}`;
    updateDisplay();
    return;
  }

  if (action === 'percent') {
    if (!expression) return;
    try {
      const result = Function(`'use strict'; return (${sanitizeExpression(expression)})/100;`)();
      expression = formatNumber(result);
      lastResult = result;
      justEvaluated = true;
      updateDisplay();
    } catch {
      expression = '';
      lastResult = '';
      screen.innerText = 'Error';
      historyEl.innerText = '';
    }
    return;
  }

  if (/^[0-9.]$/.test(value) || ['+', '−', '×', '÷'].includes(value)) {
    appendValue(value);
  }
}

document.querySelectorAll('.liquid-key').forEach((button) => {
  button.addEventListener('pointerdown', (event) => {
    attachPressEffects(button, event);
  });

  button.addEventListener('click', () => {
    handleButtonAction(button);
  });
});

window.addEventListener('pointermove', (event) => {
  if (!calculator) return;
  const rect = calculator.getBoundingClientRect();
  const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
  const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
  setGlowPosition(x, y);
});

window.addEventListener('keydown', (event) => {
  const key = event.key;
  const button = getButtonFromKey(key);

  if (button) attachPressEffects(button, event);

  if (/^[0-9]$/.test(key)) {
    appendValue(key);
    return;
  }

  if (key === '.') {
    appendValue('.');
    return;
  }

  if (key === '+') {
    appendValue('+');
    return;
  }

  if (key === '-') {
    appendValue('−');
    return;
  }

  if (key === '*') {
    appendValue('×');
    return;
  }

  if (key === '/') {
    appendValue('÷');
    return;
  }

  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    evaluateExpression();
    return;
  }

  if (key === 'Backspace') {
    backspace();
    return;
  }

  if (key === 'Escape') {
    clearAll();
  }
});

updateDisplay();