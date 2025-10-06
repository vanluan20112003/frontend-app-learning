import React, { useState } from 'react';
import { create, all } from 'mathjs';
import { Icon } from '@openedx/paragon';
import { Delete, History } from '@openedx/paragon/icons';
import './ModernCalculator.scss';

const math = create(all);

const ModernCalculator = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleButtonClick = (value) => {
    setExpression((prev) => prev + value);
  };

  const handleClear = () => {
    setExpression('');
    setResult('0');
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleCalculate = () => {
    try {
      const calcResult = math.evaluate(expression);
      const formattedResult = typeof calcResult === 'number'
        ? parseFloat(calcResult.toFixed(10)).toString()
        : calcResult.toString();

      setResult(formattedResult);
      setHistory((prev) => [{
        expression,
        result: formattedResult,
        timestamp: new Date().toLocaleTimeString(),
      }, ...prev].slice(0, 20)); // Keep last 20 calculations
    } catch (error) {
      setResult('Error');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCalculate();
    } else if (e.key === 'Escape') {
      handleClear();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspace();
    }
  };

  const handleHistoryClick = (item) => {
    setExpression(item.expression);
    setResult(item.result);
    setShowHistory(false);
  };

  const buttons = [
    // Row 1 - Functions
    [
      { label: 'sin', value: 'sin(' },
      { label: 'cos', value: 'cos(' },
      { label: 'tan', value: 'tan(' },
      { label: 'π', value: 'pi' },
    ],
    // Row 2 - Advanced
    [
      { label: '√', value: 'sqrt(' },
      { label: 'x²', value: '^2' },
      { label: 'xʸ', value: '^' },
      { label: 'log', value: 'log(' },
    ],
    // Row 3
    [
      { label: '7', value: '7' },
      { label: '8', value: '8' },
      { label: '9', value: '9' },
      { label: '÷', value: '/' },
    ],
    // Row 4
    [
      { label: '4', value: '4' },
      { label: '5', value: '5' },
      { label: '6', value: '6' },
      { label: '×', value: '*' },
    ],
    // Row 5
    [
      { label: '1', value: '1' },
      { label: '2', value: '2' },
      { label: '3', value: '3' },
      { label: '-', value: '-' },
    ],
    // Row 6
    [
      { label: '0', value: '0' },
      { label: '.', value: '.' },
      { label: '()', value: '(' },
      { label: '+', value: '+' },
    ],
  ];

  return (
    <div className="modern-calculator">
      <div className="calculator-header">
        <button
          type="button"
          className={`history-toggle ${showHistory ? 'active' : ''}`}
          onClick={() => setShowHistory(!showHistory)}
          title="Lịch sử tính toán"
        >
          <Icon src={History} />
        </button>
        <span className="calculator-title">Máy tính</span>
      </div>

      {showHistory ? (
        <div className="calculator-history">
          <h4>Lịch sử tính toán</h4>
          {history.length === 0 ? (
            <p className="no-history">Chưa có phép tính nào</p>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <button
                  key={`${item.timestamp}-${item.expression}`}
                  type="button"
                  className="history-item"
                  onClick={() => handleHistoryClick(item)}
                >
                  <div className="history-expression">{item.expression}</div>
                  <div className="history-result">= {item.result}</div>
                  <div className="history-time">{item.timestamp}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="calculator-display">
            <div className="expression-display">
              {expression || '0'}
            </div>
            <div className="result-display">
              {result}
            </div>
          </div>

          <div className="calculator-input">
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Nhập biểu thức..."
              className="expression-input"
            />
          </div>

          <div className="calculator-buttons">
            <div className="calculator-keypad">
              {buttons.map((row, idx) => (
                <div key={`row-${idx}`} className="button-row">
                  {row.map((button) => {
                    let buttonClass = 'number';
                    if (['÷', '×', '-', '+'].includes(button.label)) {
                      buttonClass = 'operator';
                    } else if (['sin', 'cos', 'tan', 'π', '√', 'x²', 'xʸ', 'log'].includes(button.label)) {
                      buttonClass = 'function';
                    }

                    return (
                      <button
                        key={button.label}
                        type="button"
                        className={`calc-button ${buttonClass}`}
                        onClick={() => handleButtonClick(button.value)}
                      >
                        {button.label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="action-buttons">
              <button
                type="button"
                className="action-button clear"
                onClick={handleClear}
              >
                C
              </button>
              <button
                type="button"
                className="action-button backspace"
                onClick={handleBackspace}
                title="Xóa ký tự cuối"
              >
                <Icon src={Delete} />
              </button>
              <button
                type="button"
                className="action-button equals"
                onClick={handleCalculate}
              >
                =
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModernCalculator;
