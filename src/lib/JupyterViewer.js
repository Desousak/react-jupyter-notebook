import React, { useCallback, useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './redux/store';
import PropTypes from 'prop-types';

import Block from './Block';
import BlockBtn from './BlockBtn';
import { genCellName, addCell } from './Helpers';
import MessengerProxy from './MessengerProxy';

import './scss/JupyterViewer.scss';

function JupyterViewer(props) {
  const { rawIpynb, messenger } = props;
  const dispatch = useDispatch();
  const cells = useSelector((state) => state.notebook.data.cells);
  const clickCellIndex = useSelector((state) => state.notebook.clickCellIndex);

  // Update clicked cell
  const updateCellIndex = useCallback(
    (i) => {
      dispatch({
        type: 'notebook/setClickedCell',
        payload: i,
      });
    },
    [dispatch]
  );

  // Update cells (from raw)
  useEffect(() => {
    const loadCells = (ipynb) => {
      return { ...ipynb, cells: ipynb.cells.map((cell) => genCellName(cell)) };
    };
    const processed = loadCells(rawIpynb);

    // Reset cell index
    updateCellIndex(-1);
    // Load the store with the needed props
    dispatch({ type: 'notebook/setData', payload: processed });
  }, [dispatch, updateCellIndex, rawIpynb]);

  // Update Kernel Messenger
  useEffect(() => {
    // Initialize the singleton
    const kernelMessenger = new MessengerProxy(messenger);
    kernelMessenger.messenger = messenger;
  }, [messenger]);

  return (
    <div className="jupyter-viewer">
      {cells.map((cell, index) => {
        return (
          <div
            key={cell.metadata.name}
            className="block"
            onMouseDown={() => {
              if (clickCellIndex.current !== index) updateCellIndex(index);
            }}
          >
            {!('cell_type' in cell) ? null : <Block cellIndex={index} />}
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

const ReduxWrap = React.memo((props) => (
  <Provider store={store}>
    <JupyterViewer {...props} />{' '}
  </Provider>
));

JupyterViewer.defaultProps = {
  rawIpynb: { cells: [] },
};

JupyterViewer.propTypes = {
  rawIpynb: PropTypes.object,
  messenger: PropTypes.object,
};

export { ReduxWrap as JupyterViewer };
