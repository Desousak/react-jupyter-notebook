import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './scss/JupyterViewer.scss';

import { Provider, useSelector, useDispatch } from 'react-redux';
import store from './redux/store';

import Block from './Block';
import BlockBtn from './BlockBtn';

// TODO: CREATE A STATUS BAR THAT ALLOWS FOR KERNEL STATUS, SWITCHING, AND SIGNALLING
function JupyterViewer(props) {
  const { rawIpynb, MessengerObj } = props;
  const dispatch = useDispatch();
  // Prep store connections
  const cells = useSelector((state) => state.cells);
  const clickCellIndex = useSelector((state) => state.clickCellIndex);

  // Update cells (from raw)
  useEffect(() => {
    function loadCells(ipynb) {
      return ipynb.cells.map((cell) => {
        if (cell && cell.metadata) {
          // If name is invalid - regen 
          const cellName = cell.metadata.name;
          if (cellName === undefined || cellName.length <= 0) {
            cell.metadata.name = genCellName();
          }
        }
        return cell;
      });
    }
    function genCellName() {
      return Math.random(100).toString(36).slice(2);
    }

    // Load the store with the needed props
    const processedIpynb = loadCells(rawIpynb);
    dispatch({ type: 'cells/setCells', payload: processedIpynb });
  }, [dispatch, rawIpynb]);

  // Update Kernel Messenger
  useEffect(() => {
    dispatch({ type: 'cells/setKernelMessenger', payload: MessengerObj });
  }, [dispatch, MessengerObj]);

  // Prep callbacks
  function addCell(index = clickCellIndex + 1, type = 'code') {
    if (index !== undefined && index > -1 && index < cells.length + 1) {
      let newCell = {};
      switch (type) {
        default:
        case 'code':
          newCell = {
            cell_type: type,
            execution_count: null,
            metadata: {},
            source: [],
            outputs: [],
          };
          break;
        case 'markdown':
          newCell = {
            cell_type: type,
            metadata: {},
            source: [],
          };
          break;
      }
      // Add a cell name
      newCell.metadata.name = this.genCellName();

      // Insert cell into cell array
      dispatch({ type: 'cells/insertCell', payload: { index, cell: newCell } });
    }
  }

  const moveCell = (d) =>
    dispatch({
      type: 'cells/moveCell',
      payload: { index: this.state.clickCellIndex, direction: d },
    });
  const deleteCell = () =>
    dispatch({ type: 'cells/removeCell', payload: clickCellIndex });
  const updateClicked = (i) =>
    dispatch({ type: 'cells/setClickedIndex', payload: i });
  const insertCell = (d) => addCell(this.state.clickCellIndex + d, 'code');

  return (
    <div className="jupyter-viewer">
      {cells.map((cell, index) => {
        return (
          <div
            key={cell.metadata.name}
            className="block"
            onMouseDown={() =>
              clickCellIndex !== index ? updateClicked(index) : null
            }
          >
            {!('cell_type' in cell) ? null : (
              <Block
                cell={cell}
                moveCell={moveCell}
                deleteCell={deleteCell}
                insertCell={insertCell}
                highlighted={clickCellIndex === index}
              />
            )}
          </div>
        );
      })}
      <div className="add-buttons"> 
        <BlockBtn
          text="+ Code"
          callback={() => addCell(cells.length, 'code')}
        />
        <BlockBtn
          text="+ Markdown"
          callback={() => addCell(cells.length, 'markdown')}
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
