import React, { useCallback, useEffect, useRef } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './redux/store';
import PropTypes from 'prop-types';

import Block from './Block';
import BlockBtn from './BlockBtn';
import { addCellName, addCell } from './Helpers';
import { buildMessengerProxy } from './MessengerProxy';
import KernelMessenger from './KernelMessenger';

import './scss/JupyterViewer.scss';

function JupyterViewer(props) {
  const { rawIpynb, MessengerObj } = props;
  const dispatch = useDispatch();
  const cells = useSelector((state) => state.notebook.data.cells);
  const clickCellIndex = useRef(-1);

  // Update clicked cell
  const updateCellIndex = useCallback(
    (i) => {
      dispatch({
        type: 'ui/setClickedCell',
        payload: i,
      });
      clickCellIndex.current = i;
    },
    [dispatch]
  );

  // Update cells (from raw)
  useEffect(() => {
    const loadCells = (ipynb) => {
      return { ...ipynb, cells: ipynb.cells.map((cell) => addCellName(cell)) };
    };
    const processed = loadCells(rawIpynb);

    // Reset cell index
    updateCellIndex(-1);
    // Load the store with the needed props
    dispatch({ type: 'notebook/setData', payload: processed });
  }, [dispatch, updateCellIndex, rawIpynb]);

  // Update Kernel Messenger
  useEffect(() => {
    buildMessengerProxy(MessengerObj);
  }, [dispatch, MessengerObj]);

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

function ReduxWrap(props) {
  return (
    <Provider store={store}>
      <JupyterViewer {...props} />{' '}
    </Provider>
  );
}

JupyterViewer.defaultProps = {
  rawIpynb: { cells: [] },
  MessengerObj: KernelMessenger,
};

JupyterViewer.propTypes = {
  rawIpynb: PropTypes.object,
  MessengerObj: PropTypes.func,
};

export { ReduxWrap as JupyterViewer, KernelMessenger };
