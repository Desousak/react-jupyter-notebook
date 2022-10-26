import React, { useState, useEffect } from 'react';
import nb_test from './nb_test.json';
import { JupyterViewer, useKernelMessenger } from './lib/JupyterViewer';

import ExampleMessenger from './ExampleMessenger';
import PyoliteMessenger from './PyoliteMessenger';

import Select from 'react-select';
import './lib/scss/StatusBar.scss';

// Prep kernel options
const kernelOptions = [
  { value: 'ExampleMessenger', label: 'Example', class: ExampleMessenger },
  { value: 'PyoliteMessenger', label: 'Pyolite', class: PyoliteMessenger },
];

function useKernelReady(messenger) {
  // A hook for the kernel messenger status
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Subscribe to object's ready status
    const handleStatusChange = (res) => setReady(res);
    messenger.onReady = handleStatusChange;
    // Catch events where the kernel is ready before we could even catch it...
    setReady(messenger.connected);
    return () => setReady(false);
  }, [messenger]);

  return ready;
}

function useKernelInfo(messenger) {
  // A hook for the kernel messenger status
  const [info, setInfo] = useState({});

  useEffect(() => {
    messenger.kernelInfo.then((res) => setInfo(res));
  }, [messenger]);

  return info;
}

function StatusBar(props) {
  const { kernelMessenger, changeMessenger } = props;
  const kernelReady = useKernelReady(kernelMessenger);
  const kernelInfo = useKernelInfo(kernelMessenger);
  
  // Parse names for the messenger, and the kernel itself
  const messengerName = kernelMessenger
      ? kernelMessenger.constructor.name
      : null,
    kernelName = kernelInfo.implementation ? kernelInfo.implementation : null;

  return (
    <div id="kernel-status-bar">
      <div className="add-buttons">TBD</div>
      <span id="kernel-name">
        Current Kernel: {kernelName}
        {!kernelReady ? ' (*)' : ''}
      </span>
      <div id="kernel-select">
        <Select
          name="kernels"
          id="kernel-selector"
          options={kernelOptions}
          onChange={(e) => changeMessenger(e.class)}
          value={kernelOptions.find((e) => e.value === messengerName)}
        />
      </div>
    </div>
  );
}

function App(props) {
  const [rawIpynb, setIypnb] = useState(nb_test);
  const [messenger, changeMessenger] = useKernelMessenger(
    kernelOptions[0].class
  );

  return (
    <React.Fragment>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <span>Load .ipynb file:</span>
        <input
          name="rawIpynb"
          type="file"
          onChange={(e) => {
            if (e.target.files[0]) {
              const reader = new FileReader();
              reader.readAsText(e.target.files[0], 'UTF-8');
              reader.onload = (e) => {
                setIypnb(JSON.parse(e.target.result));
              };
              reader.onerror = (e) => {
                console.log('reader error!', e);
              };
            }
          }}
        />
      </div>

      <StatusBar
        kernelMessenger={messenger}
        changeMessenger={(messenger) => changeMessenger(messenger)}
      />
      {!rawIpynb ? null : (
        <JupyterViewer rawIpynb={rawIpynb} messenger={messenger} />
      )}
    </React.Fragment>
  );
}

export default App;
