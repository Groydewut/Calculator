import './style.css';
import './app.css';

document.querySelector('#app').innerHTML = `
    <div class="calculator-container">
        <div class="calculator">
            <h2>Калькулятор</h2>
            
            <div class="display-container">
                <input type="text" id="calcDisplay" class="calc-display" placeholder="0" readonly />
                <div class="result" id="result">0</div>
            </div>
            
            <div class="calc-grid">
                <button class="btn btn-action btn-clear" data-key="Clear">C</button>
                <button class="btn btn-action btn-backspace" data-key="Backspace">←</button>
                <button class="btn btn-op" data-op="^">^</button>
                <button class="btn btn-op" data-op="/">÷</button>
                
                <button class="btn btn-num" data-num="7">7</button>
                <button class="btn btn-num" data-num="8">8</button>
                <button class="btn btn-num" data-num="9">9</button>
                <button class="btn btn-op" data-op="*">×</button>
                
                <button class="btn btn-num" data-num="4">4</button>
                <button class="btn btn-num" data-num="5">5</button>
                <button class="btn btn-num" data-num="6">6</button>
                <button class="btn btn-op" data-op="-">−</button>
                
                <button class="btn btn-num" data-num="1">1</button>
                <button class="btn btn-num" data-num="2">2</button>
                <button class="btn btn-num" data-num="3">3</button>
                <button class="btn btn-op" data-op="+">+</button>
                
                <button class="btn btn-num btn-zero" data-num="0">0</button>
                <button class="btn btn-num" data-num=".">.</button>
                <button class="btn btn-equals" id="calculateBtn">=</button>
            </div>
        </div>

        <div class="history-panel">
            <div class="history-header">
                <h3>История</h3>
                <button class="btn-clear-history" id="clearHistoryBtn">Очистить</button>
            </div>
            <ul id="history" class="history-list"></ul>
        </div>
    </div>
`;

const goApp = window.go?.main?.App;
if (!goApp) console.error('Go bindings не найдены!');

let operand1 = '';
let operand2 = '';
let currentOperation = '';
let isResetDisplayOnNextInput = false;

const displayEl = document.getElementById('calcDisplay');
const resultEl = document.getElementById('result');

function updateDisplay() {
    if (!operand1 && !currentOperation) {
        displayEl.value = '0';
        return;
    }
    let opSymbol = currentOperation;
    if (opSymbol === '*') opSymbol = ' × ';
    if (opSymbol === '/') opSymbol = ' ÷ ';
    if (opSymbol === '+' || opSymbol === '-' || opSymbol === '^') opSymbol = ` ${opSymbol} `;

    displayEl.value = `${operand1}${opSymbol}${operand2}`;
    displayEl.scrollLeft = displayEl.scrollWidth;
}

function inputDigit(digit) {
    if (isResetDisplayOnNextInput) {
        clearCalculator();
        isResetDisplayOnNextInput = false;
    }

    if (!currentOperation) {
        if (digit === '.' && operand1.includes('.')) return;
        if (operand1 === '0' && digit !== '.') operand1 = digit;
        else operand1 += digit;
    } else {
        if (digit === '.' && operand2.includes('.')) return;
        if (operand2 === '0' && digit !== '.') operand2 = digit;
        else operand2 += digit;
    }
    updateDisplay();
}

function inputOperation(op) {
    if (!operand1) {
        if (resultEl.innerText !== "0" && !resultEl.innerText.startsWith("Ошибка") && !resultEl.innerText.startsWith("Вычисление")) {
            operand1 = resultEl.innerText;
        } else {
            operand1 = '0';
        }
    }
    
    // ИСПРАВЛЕНИЕ: Если ввели число и операцию, но передумали и нажали другую операцию
    if (operand1 && currentOperation && !operand2) {
        currentOperation = op;
        updateDisplay();
        return;
    }

    if (operand1 && currentOperation && operand2) {
        processCalculation().then(() => {
            if (!resultEl.innerText.startsWith("Ошибка")) {
                operand1 = resultEl.innerText;
                operand2 = '';
                currentOperation = op;
                isResetDisplayOnNextInput = false;
                updateDisplay();
            }
        });
        return;
    }

    currentOperation = op;
    isResetDisplayOnNextInput = false;
    updateDisplay();
}

// НОВАЯ ФУНКЦИЯ: Посимвольное удаление (Backspace)
function handleBackspace() {
    if (isResetDisplayOnNextInput) {
        clearCalculator();
        isResetDisplayOnNextInput = false;
        return;
    }

    if (operand2) {
        operand2 = operand2.slice(0, -1);
    } else if (currentOperation) {
        currentOperation = '';
    } else if (operand1) {
        operand1 = operand1.slice(0, -1);
    }
    updateDisplay();
}

function clearCalculator() {
    operand1 = '';
    operand2 = '';
    currentOperation = '';
    displayEl.value = '0';
}

async function processCalculation() {
    const num1 = parseFloat(operand1);
    const num2 = parseFloat(operand2);
    
    if (isNaN(num1) || isNaN(num2) || !currentOperation) {
        resultEl.innerText = "Ошибка";
        return;
    }

    try {
        resultEl.innerText = "...";
        const res = await goApp.Calculate(num1, num2, currentOperation);
        resultEl.innerText = res;
        isResetDisplayOnNextInput = true;
        await updateHistory();
    } catch (error) {
        console.error(error);
        resultEl.innerText = "Ошибка";
    }
}

async function updateHistory() {
    const historyEl = document.getElementById('history');
    try {
        const historyData = await goApp.GetHistory();
        if (!historyData || historyData.length === 0) {
            historyEl.innerHTML = '<li class="empty-state">История пуста</li>';
        } else {
            const recentHistory = historyData.slice(-15).reverse();
            historyEl.innerHTML = recentHistory.map(item => `<li>${item}</li>`).join('');
        }
    } catch (error) {
        historyEl.innerHTML = '<li class="empty-state">Ошибка истории</li>';
    }
}

async function clearHistory() {
    try {
        await goApp.ClearHistory();
        clearCalculator();
        resultEl.innerText = "0";
        await updateHistory();
    } catch (error) {
        console.error(error);
    }
}

// Слушатели событий
document.querySelectorAll('.btn-num').forEach(btn => {
    btn.addEventListener('click', () => inputDigit(btn.getAttribute('data-num')));
});
document.querySelectorAll('.btn-op').forEach(btn => {
    btn.addEventListener('click', () => inputOperation(btn.getAttribute('data-op')));
});
document.querySelector('[data-key="Clear"]').addEventListener('click', clearCalculator);
document.querySelector('[data-key="Backspace"]').addEventListener('click', handleBackspace);
document.getElementById('calculateBtn').addEventListener('click', processCalculation);
document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);

window.addEventListener('keydown', (e) => {
    const key = e.key;
    if ((key >= '0' && key <= '9') || key === '.') {
        e.preventDefault();
        inputDigit(key);
    } else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '^') {
        e.preventDefault();
        inputOperation(key);
    } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        processCalculation();
    } else if (key === 'Escape') {
        e.preventDefault();
        clearCalculator();
    } else if (key === 'Backspace') { // Поддержка клавиши Backspace
        e.preventDefault();
        handleBackspace();
    }
});

updateHistory();
