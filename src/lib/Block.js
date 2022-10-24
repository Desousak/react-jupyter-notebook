import React from 'react';
import { useSelector } from 'react-redux';

import Source from './Source';
import BlockOutput from './Output';
import BlockControls from './BlockControls';
import ToggleVisibilityBar from './ToggleVisibilityBar';

import './scss/Block.scss';

function Block(props) {
  // Parse props
  const { cellIndex } = props;
  const cellType = useSelector(
    (state) => state.notebook.data.cells[cellIndex].cell_type
  );

  return (
    <React.Fragment>
      {/* Display text box */}
      <div className="block-source">
        <ToggleVisibilityBar cellIndex={cellIndex} target="source_hidden" />
        <Source cellIndex={cellIndex} />
      </div>

      {/* Display output */}
      {cellType !== 'markdown' && (
        <div className="block-output">
          <ToggleVisibilityBar cellIndex={cellIndex} target="outputs_hidden" />
          <BlockOutput cellIndex={cellIndex} />
        </div>
      )}

      {/* Controls bar */}
      <BlockControls cellIndex={cellIndex} />
    </React.Fragment>
  );
}

export default React.memo(Block);