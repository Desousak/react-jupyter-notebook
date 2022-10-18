import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './redux/store';
import PropTypes from 'prop-types';

import Block from './Block';
import BlockBtn from './BlockBtn';
import { addCellName, addCell } from './Helpers';
import { buildMessengerProxy } from './MessengerProxy.js';

import './scss/JupyterViewer.scss';

function JupyterViewer(props) {
  const { rawIpynb, MessengerObj } = props;
  const dispatch = useDispatch();
  const cells = useSelector((state) => state.notebook.data.cells);
  const clickCellIndex = useSelector((state) => state.ui.clickCellIndex);

  // Update cells (from raw)
  useEffect(() => {
    const loadCells = (ipynb) => {
      return { ...ipynb, cells: ipynb.cells.map((cell) => addCellName(cell)) };
    };
    const processed = loadCells(rawIpynb);

    // Load the store with the needed props
    dispatch({ type: 'notebook/setData', payload: processed });
  }, [dispatch, rawIpynb]);

  // Update Kernel Messenger
  useEffect(() => {
    console.log('Updating messenger...');
    buildMessengerProxy(MessengerObj);
  }, [dispatch, MessengerObj]);

  return (
    <div className="jupyter-viewer">
      {cells.map((cell, index) => {
        return (
          <div
            key={cell.metadata.name}
            className="block"
            onMouseDown={() =>
              clickCellIndex !== index
                ? dispatch({
                    type: 'ui/setClickedCell',
                    payload: index,
                  })
                : null
            }
          >
            {!('cell_type' in cell) ? null : (
              <Block cellIndex={index} />
            )}
          </div>
        );
      })}
      <div className="add-buttons">
        <BlockBtn
          text="+ Code"
          callback={() => addCell(dispatch, cells.length, 'code')}
        />
        <BlockBtn
          text="+ Markdown"
          callback={() => addCell(dispatch, cells.length, 'markdown')}
        />
      </div>
    </div>
  );
}

class DefaultKernelMessenger {
  // eslint-disable-next-line no-useless-constructor
  constructor() {
    // Init connection here
    // Constructor is not passed any parameters, set them here instead
  }
  get ready() {
    // Returns a promise which resolves when the kernel loads in initially
    return Promise.resolve();
  }

  get kernelInfo() {
    // Return a promise containing info about the kernel
    return Promise.resolve({
      status: 'ok',
      protocol_version: 'X.Y.Z',
      implementation: '',
      implementation_version: 'X.Y.Z',
      language_info: {
        name: '',
        version: 'X.Y.Z',
        mimetype: '',
        file_extension: '',
        pygments_lexer: '',
        codemirror_mode: '',
        nbconvert_exporter: '',
      },
      banner: '',
      debugger: false,
      help_links: [{ text: '', url: '' }],
    });
  }

  get connected() {
    // Returns true if connected, false otherwise
    return false;
  }

  // %%%%%%%%%%%%%%%%%%%%%%
  // Code-Cell Interactions
  // Functions here MUST be implemented
  // %%%%%%%%%%%%%%%%%%%%%%
  runCode(code, callback) {
    // Run the code
  }

  signalKernel(signal) {
    // Returns true if successful, false otherwise
    return false;
  }
}

function ReduxWrap(props) {
  return (
    <Provider store={store}>
      <JupyterViewer {...props} />{' '}
    </Provider>
  );
}

JupyterViewer.defaultProps = {
  rawIpynb: { cells: [] },
  MessengerObj: DefaultKernelMessenger,
};

JupyterViewer.propTypes = {
  rawIpynb: PropTypes.object,
  MessengerObj: PropTypes.func,
};

export { ReduxWrap as JupyterViewer, DefaultKernelMessenger };
