import React from 'react';
import { BiTrash } from 'react-icons/bi';
import { useDispatch, useSelector } from 'react-redux';

import BlockBtn from './BlockBtn';
import { addCell } from './Helpers';

import './scss/BlockControls.scss';

function BlockControls(props) {
  const { cellIndex } = props;
  const dispatch = useDispatch();
  const clickCellIndex = useSelector((state) => state.ui.clickCellIndex);
  const deletable = useSelector(
    (state) => state.notebook.data.cells[cellIndex].metadata.deletable
  );

  function insertCell(d) {
    addCell(dispatch, clickCellIndex + d, 'code');
  }
  function moveCell(d) {
    dispatch({
      type: 'notebook/moveCell',
      payload: { index: clickCellIndex, direction: d },
    });
  }
  function deleteCell() {
    dispatch({ type: 'notebook/removeCell', payload: clickCellIndex });
  }

  const controls = (
    <div className="block-controls">
      {/* Cell move button(s) */}
      <BlockBtn callback={() => moveCell(-1)}>↑</BlockBtn>
      <BlockBtn callback={() => moveCell(1)}>↓</BlockBtn>

      {/* Cell insert button(s) */}
      <BlockBtn callback={() => insertCell(0)}>+↑</BlockBtn>
      <BlockBtn callback={() => insertCell(1)}>+↓</BlockBtn>

      {/* Delete cell button */}
      <BlockBtn
        callback={() =>
          deletable === true || deletable === undefined ? deleteCell() : null
        }
        disabled={deletable !== true && deletable !== undefined}
      >
        <BiTrash />
      </BlockBtn>
    </div>
  );

  return (clickCellIndex === cellIndex ? controls : null);
};

export default React.memo(BlockControls);
