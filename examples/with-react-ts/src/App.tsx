import React, { useEffect } from 'react';
import '@skax/picker/dist/style/index';
import Picker from '@skax/picker';
import logo from './logo.svg';
import './App.css';

console.log(Picker);

function App() {
  const pickerRef = React.useRef<Picker | null>(null);
  const $containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    pickerRef.current = new Picker($containerRef.current, {
      content: '<p>123</p>',
      placement: 'bottom',
      trigger: 'click',
      triggerClose: true,
      onOpenChange: open => {
        console.log('open:', open);
      },
    });
    return () => {
      if (pickerRef.current) {
        pickerRef.current.destroy();
        pickerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <div className="App-link" ref={$containerRef}>
          Picker
        </div>
      </header>
    </div>
  );
}

export default App;
