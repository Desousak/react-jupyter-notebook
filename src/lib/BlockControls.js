import React from 'react';
import { BiTrash } from 'react-icons/bi';
import BlockBtn from './BlockBtn';
import './scss/BlockControls.scss';

const BlockControls = React.memo(function BlockControls(props) {
  const { deletable, onMove, onInsert, onDelete } = props;
  return (
    <div className="block-controls">
      {/* Cell move button(s) */}
      <BlockBtn callback={() => onMove(-1)}>↑</BlockBtn>
      <BlockBtn callback={() => onMove(1)}>↓</BlockBtn>

      {/* Cell insert button(s) */}
      <BlockBtn callback={() => onInsert(0)}>+↑</BlockBtn>
      <BlockBtn callback={() => onInsert(1)}>+↓</BlockBtn>

      {/* Delete cell button */}
      <BlockBtn
        callback={() =>
          deletable === true || deletable === undefined ? onDelete() : null
        }
        disabled={deletable !== true && deletable !== undefined}
      >
        <BiTrash />
      </BlockBtn>
    </div>
  );
});

export default BlockControls;
