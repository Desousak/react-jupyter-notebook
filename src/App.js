import React, { useState } from 'react';
import nb_test from './nb_test.json';
import { JupyterViewer } from './lib/JupyterViewer';

import ExampleMessenger from './ExampleMessenger';
import PyoliteMessenger from './PyoliteMessenger';

function App(props) {
  const [state, setState] = useState({
    rawIpynb: nb_test,
  });

  return (
    <React.Fragment>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '1rem'
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
                setState({ ...state, rawIpynb: JSON.parse(e.target.result) });
              };
              reader.onerror = (e) => {
                console.log('reader error!', e);
              };
            }
          }}
        />
      </div>

      {!state.rawIpynb ? null : (
        <JupyterViewer
          rawIpynb={state.rawIpynb}
          MessengerObj={PyoliteMessenger}
        />
      )}
    </React.Fragment>
  );
}

export default App;
