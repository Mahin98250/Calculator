const screen = document.getElementById('screen');
const historyEl = document.getElementById('history');

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

document.querySelectorAll('button').forEach((button) => {
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

    expression += value;
    updateDisplay();
  });
});

updateDisplay();