const screen = document.getElementById('screen');
const historyEl = document.getElementById('history');
const glow = document.getElementById('calculatorGlow');

let expression = '';
let lastResult = '';

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

function clearAll() {
  expression = '';
  lastResult = '';
  updateDisplay();
}

function backspace() {
  expression = expression.slice(0, -1);
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
  } catch {
    expression = '';
    lastResult = '';
    screen.innerText = 'Error';
    historyEl.innerText = '';
  }
}

function handleValue(value) {
  expression += value;
  updateDisplay();
}

document.querySelectorAll('.liquid-key').forEach((button) => {
  button.addEventListener('pointerdown', (event) => {
    const rect = button.getBoundingClientRect();
    const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100;
    flashButton(button, xPercent, yPercent);
    setGlowPosition(xPercent, yPercent);
  });

  button.addEventListener('click', () => {
    const value = button.innerText;

    if (value === 'AC') {
      clearAll();
      return;
    }

    if (value === '⌫') {
      backspace();
      return;
    }

    if (value === '=') {
      evaluateExpression();
      return;
    }

    handleValue(value);
  });
});

window.addEventListener('pointermove', (event) => {
  const rect = document.querySelector('.calculator').getBoundingClientRect();
  const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
  const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
  setGlowPosition(x, y);
});

window.addEventListener('keydown', (event) => {
  const key = event.key;
  const button = [...document.querySelectorAll('.liquid-key')].find((btn) => btn.innerText === key || (key === '*' && btn.innerText === '×') || (key === '/' && btn.innerText === '÷'));

  if (button) flashButton(button);

  if (/^[0-9]$/.test(key)) {
    handleValue(key);
    return;
  }

  if (key === '.') {
    handleValue('.');
    return;
  }

  if (key === '+') {
    handleValue('+');
    return;
  }

  if (key === '-') {
    handleValue('−');
    return;
  }

  if (key === '*') {
    handleValue('×');
    return;
  }

  if (key === '/') {
    handleValue('÷');
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
