import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Desmos from 'desmos';

const DesmosCalculator = ({ height = '500px', language = 'vi' }) => {
  const calculatorRef = useRef(null);
  const calculatorInstance = useRef(null);

  useEffect(() => {
    if (calculatorRef.current && !calculatorInstance.current) {
      // Initialize Desmos Calculator
      calculatorInstance.current = Desmos.GraphingCalculator(calculatorRef.current, {
        keypad: true,
        expressions: true,
        settingsMenu: true,
        zoomButtons: true,
        expressionsTopbar: true,
        pointsOfInterest: true,
        trace: true,
        border: false,
        lockViewport: false,
        expressionsCollapsed: false,
        administerSecretFolders: false,
        images: true,
        folders: true,
        notes: true,
        sliders: true,
        links: true,
        qwertyKeyboard: true,
        restrictedFunctions: false,
        language,
      });
    }

    // Cleanup on unmount
    return () => {
      if (calculatorInstance.current) {
        calculatorInstance.current.destroy();
        calculatorInstance.current = null;
      }
    };
  }, [language]);

  return (
    <div
      ref={calculatorRef}
      style={{
        width: '100%',
        height,
        minHeight: '400px',
      }}
    />
  );
};

DesmosCalculator.propTypes = {
  height: PropTypes.string,
  language: PropTypes.string,
};

DesmosCalculator.defaultProps = {
  height: '500px',
  language: 'vi',
};

export default DesmosCalculator;
