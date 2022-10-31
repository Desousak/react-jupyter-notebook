import React, { useState, useEffect } from 'react';
import nb_test from './nb_test.json';
import JupyterViewer, { useKernelMessenger, useKernelReady } from './lib/index';

import ExampleMessenger from './ExampleMessenger';
import PyoliteMessenger from './PyoliteMessenger';

import Select from 'react-select';
import './lib/scss/StatusBar.scss';

// Prep kernel options
const kernelOptions = [
  { value: 'ExampleMessenger', label: 'Example', class: ExampleMessenger },
  { value: 'PyoliteMessenger', label: 'Pyolite', class: PyoliteMessenger },
];

function useKernelInfo(messenger) {
  // A hook for the kernel messenger status
  const [info, setInfo] = useState({});

  useEffect(() => {
    messenger.kernelInfo.then((res) => setInfo(res));
  }, [messenger]);

  return info;
}

function StatusBar(props) {
  const { kernelMessenger, changeMessenger, setIypnb } = props;
  const kernelReady = useKernelReady(kernelMessenger);
  const kernelInfo = useKernelInfo(kernelMessenger);

  // Parse names for the messenger, and the kernel itself
  const messengerName = kernelMessenger
      ? kernelMessenger.constructor.name
      : null,
    kernelName = kernelInfo.implementation ? kernelInfo.implementation : null;

  return (
    <div id="kernel-status-bar">
      <div className="load-file">
        <span>Load notebook:</span>
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
      <span id="kernel-name">
        Current Kernel: {kernelName}&nbsp;
        {/* Change chars on state */}
        {(() => {
          switch (kernelReady) {
            case null:
              return '(*)';
            case false:
              return '(!)';
            default:
            case true:
              return '';
          }
        })()}
      </span>
      <div id="kernel-select">
        <span>Available Kernels:</span>
        <Select
          name="kernels"
          id="kernel-selector"
          options={kernelOptions}
          isDisabled={kernelReady === null}
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
      <StatusBar
        setIypnb={setIypnb}
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
