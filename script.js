const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const glow = document.getElementById('calculatorGlow');
const calculator = document.querySelector('.calculator');

let expression = '';
let lastResult = '';
let justEvaluated = false;

function formatNumber(value) {
  if (value === '' || value === null || value === undefined) return '0';
  const str = String(value);
  if (str === 'Infinity' || str === '-Infinity' || str === 'NaN') return 'Error';
  
  // Handle very large or very small numbers
  const num = parseFloat(str);
  if (Math.abs(num) > 1e10) {
    return num.toExponential(8).replace(/\.?0+e/, 'e');
  }
  
  return str.length > 16 ? Number(str).toPrecision(12).replace(/\.?0+$/, '') : str;
}

function updateDisplay() {
  if (justEvaluated) {
    expressionEl.innerText = '';
    resultEl.innerText = expression || '0';
  } else {
    expressionEl.innerText = expression || '0';
    resultEl.innerText = '';
  }
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
  void button.offsetWidth; // Trigger reflow
  button.classList.add('is-pressed');
  
  clearTimeout(button._pressTimer);
  button._pressTimer = setTimeout(() => button.classList.remove('is-pressed'), 260);
}

function isOperatorChar(char) {
  return ['+', '-', '×', '÷', '−'].includes(char);
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
    .replace(/[+\-×÷−]{2,}$/g, (match) => match.slice(-1))
    .replace(/\s+/g, '');
}

function appendValue(value) {
  if (justEvaluated && /^[0-9.]$/.test(value)) {
    expression = '';
    lastResult = '';
    justEvaluated = false;
  }

  const lastChar = expression[expression.length - 1];

  // Handle decimal point
  if (value === '.') {
    const segments = expression.split(/[+\-×÷−]/);
    const currentSegment = segments[segments.length - 1] || '';
    
    if (currentSegment.includes('.')) return; // Already has decimal
    if (!expression || isOperatorChar(lastChar)) {
      expression += '0'; // Add 0 before decimal if needed
    }
    expression += '.';
    updateDisplay();
    return;
  }

  // Handle operators
  if (isOperatorChar(value)) {
    if (!expression && value !== '-' && value !== '−') return; // Can't start with operator (except minus)
    if (isOperatorChar(lastChar)) {
      expression = expression.slice(0, -1) + value; // Replace last operator
    } else {
      expression += value;
    }
    normalizeOperators();
    updateDisplay();
    return;
  }

  // Handle numbers
  expression += value;
  updateDisplay();
}

function evaluateExpression() {
  if (!expression) return;

  try {
    const sanitized = sanitizeExpression(expression);
    const result = new Function(`'use strict'; return (${sanitized})`)();
    
    lastResult = result;
    expression = formatNumber(result);
    justEvaluated = true;
    updateDisplay();
  } catch (error) {
    expression = 'Error';
    lastResult = '';
    justEvaluated = false;
    updateDisplay();
    
    // Reset after showing error
    setTimeout(() => {
      clearAll();
    }, 1500);
  }
}

function getButtonFromKey(key) {
  return [...document.querySelectorAll('.liquid-key')].find((btn) => {
    const value = btn.innerText.trim();
    return (
      value === key ||
      (key === '*' && value === '×') ||
      (key === '/' && value === '÷') ||
      (key === 'Enter' && value === '=')
    );
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
    if (expression.startsWith('-')) {
      expression = expression.slice(1);
    } else {
      expression = `-${expression}`;
    }
    justEvaluated = false;
    updateDisplay();
    return;
  }

  if (action === 'percent') {
    if (!expression) return;
    try {
      const sanitized = sanitizeExpression(expression);
      const result = new Function(`'use strict'; return (${sanitized})/100`)();
      expression = formatNumber(result);
      lastResult = result;
      justEvaluated = true;
      updateDisplay();
    } catch (error) {
      expression = 'Error';
      lastResult = '';
      justEvaluated = false;
      updateDisplay();
      setTimeout(() => {
        clearAll();
      }, 1500);
    }
    return;
  }

  if (/^[0-9.]$/.test(value) || ['+', '−', '×', '÷'].includes(value)) {
    appendValue(value);
  }
}

// Add event listeners to all buttons
document.querySelectorAll('.liquid-key').forEach((button) => {
  button.addEventListener('pointerdown', (event) => {
    attachPressEffects(button, event);
  });

  button.addEventListener('click', () => {
    handleButtonAction(button);
  });
});

// Mouse move glow effect
window.addEventListener('pointermove', (event) => {
  if (!calculator) return;
  const rect = calculator.getBoundingClientRect();
  const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
  const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
  setGlowPosition(x, y);
});

// Keyboard support
window.addEventListener('keydown', (event) => {
  const key = event.key;
  
  if (/^[0-9]$/.test(key)) {
    event.preventDefault();
    appendValue(key);
    const button = getButtonFromKey(key);
    if (button) attachPressEffects(button, event);
    return;
  }

  if (key === '.') {
    event.preventDefault();
    appendValue('.');
    const button = getButtonFromKey(key);
    if (button) attachPressEffects(button, event);
    return;
  }

  if (key === '+') {
    event.preventDefault();
    appendValue('+');
    const button = getButtonFromKey(key);
    if (button) attachPressEffects(button, event);
    return;
  }

  if (key === '-') {
    event.preventDefault();
    appendValue('−');
    const button = getButtonFromKey(key);
    if (button) attachPressEffects(button, event);
    return;
  }

  if (key === '*') {
    event.preventDefault();
    appendValue('×');
    const button = getButtonFromKey(key);
    if (button) attachPressEffects(button, event);
    return;
  }

  if (key === '/') {
    event.preventDefault();
    appendValue('÷');
    const button = getButtonFromKey(key);
    if (button) attachPressEffects(button, event);
    return;
  }

  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    evaluateExpression();
    const button = getButtonFromKey('=');
    if (button) attachPressEffects(button, event);
    return;
  }

  if (key === 'Backspace') {
    event.preventDefault();
    backspace();
    const button = document.querySelector('[data-action="backspace"]');
    if (button) attachPressEffects(button, event);
    return;
  }

  if (key === 'Escape') {
    event.preventDefault();
    clearAll();
    const button = document.querySelector('[data-action="clear"]');
    if (button) attachPressEffects(button, event);
  }
});

// Initialize display
updateDisplay();
