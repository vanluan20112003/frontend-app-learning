import React, { useState } from 'react';
import './SimpleCalculator.scss';

const SimpleCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : `${display}${digit}`);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(`${display}.`);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay('0');
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let newValue = currentValue;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '×':
          newValue = currentValue * inputValue;
          break;
        case '÷':
          newValue = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        case '%':
          newValue = currentValue % inputValue;
          break;
        default:
          break;
      }

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const toggleSign = () => {
    const value = parseFloat(display);
    setDisplay(String(value * -1));
  };

  const inputPercent = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  const sqrt = () => {
    const value = parseFloat(display);
    setDisplay(String(Math.sqrt(value)));
  };

  const square = () => {
    const value = parseFloat(display);
    setDisplay(String(value * value));
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const buttons = [
    // Row 1
    [
      { label: 'C', onClick: clear, className: 'function-btn' },
      { label: 'CE', onClick: clearEntry, className: 'function-btn' },
      { label: '⌫', onClick: backspace, className: 'function-btn' },
      { label: '÷', onClick: () => performOperation('÷'), className: 'operator-btn' },
    ],
    // Row 2
    [
      { label: '7', onClick: () => inputDigit(7) },
      { label: '8', onClick: () => inputDigit(8) },
      { label: '9', onClick: () => inputDigit(9) },
      { label: '×', onClick: () => performOperation('×'), className: 'operator-btn' },
    ],
    // Row 3
    [
      { label: '4', onClick: () => inputDigit(4) },
      { label: '5', onClick: () => inputDigit(5) },
      { label: '6', onClick: () => inputDigit(6) },
      { label: '-', onClick: () => performOperation('-'), className: 'operator-btn' },
    ],
    // Row 4
    [
      { label: '1', onClick: () => inputDigit(1) },
      { label: '2', onClick: () => inputDigit(2) },
      { label: '3', onClick: () => inputDigit(3) },
      { label: '+', onClick: () => performOperation('+'), className: 'operator-btn' },
    ],
    // Row 5
    [
      { label: '±', onClick: toggleSign, className: 'function-btn' },
      { label: '0', onClick: () => inputDigit(0) },
      { label: '.', onClick: inputDecimal },
      { label: '=', onClick: () => performOperation(null), className: 'equals-btn' },
    ],
    // Row 6 - Advanced functions
    [
      { label: '%', onClick: inputPercent, className: 'function-btn' },
      { label: '√', onClick: sqrt, className: 'function-btn' },
      { label: 'x²', onClick: square, className: 'function-btn' },
      { label: '', className: 'empty-btn', disabled: true },
    ],
  ];

  return (
    <div className="simple-calculator">
      <div className="calculator-display">
        <div className="display-value">{display}</div>
        {operation && (
          <div className="display-operation">
            {previousValue} {operation}
          </div>
        )}
      </div>
      <div className="calculator-keypad">
        {buttons.map((row, idx) => (
          <div key={`row-${idx}`} className="calculator-row">
            {row.map((button) => (
              <button
                key={button.label || `empty-${button.className}`}
                type="button"
                className={`calculator-btn ${button.className || 'number-btn'}`}
                onClick={button.onClick}
                disabled={button.disabled}
              >
                {button.label}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="calculator-info">
        <small className="text-muted">Máy tính học tập</small>
      </div>
    </div>
  );
};

export default SimpleCalculator;
