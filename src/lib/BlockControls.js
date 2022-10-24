import React from 'react';
import { BiTrash } from 'react-icons/bi';
import { useDispatch, useSelector } from 'react-redux';

import BlockBtn from './BlockBtn';
import { offsetAddCell, moveCell, deleteCell } from './Helpers';

import './scss/BlockControls.scss';

function BlockControls(props) {
  const { cellIndex } = props;
  const dispatch = useDispatch();
  const shown = useSelector(
    (state) => state.notebook.clickCellIndex === cellIndex
  );
  const deletable = useSelector(
    (state) => state.notebook.data.cells[cellIndex].metadata.deletable
  );

  // Injects dispatch into the function at arg 0
  function dispatchWrapper(func, ...args) {
    func(dispatch, ...args);
  }

  const controls = (
    <div className="block-controls">
      {/* Cell move button(s) */}
      <BlockBtn callback={() => dispatchWrapper(moveCell, -1)}>↑</BlockBtn>
      <BlockBtn callback={() => dispatchWrapper(moveCell, 1)}>↓</BlockBtn>

      {/* Cell insert button(s) */}
      <BlockBtn callback={() => dispatchWrapper(offsetAddCell, 0, 'code')}>
        +↑
      </BlockBtn>
      <BlockBtn callback={() => dispatchWrapper(offsetAddCell, 1, 'code')}>
        +↓
      </BlockBtn>

      {/* Delete cell button */}
      <BlockBtn
        callback={() =>
          deletable === true || deletable === undefined
            ? dispatchWrapper(deleteCell)
            : null
        }
        disabled={deletable !== true && deletable !== undefined}
      >
        <BiTrash />
      </BlockBtn>
    </div>
  );

  return shown ? controls : null;
}

export default React.memo(BlockControls);
