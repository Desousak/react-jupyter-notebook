import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './scss/ToggleVisibilityBar.scss';

function ToggleVisibilityBar(props) {
  const { target, cellIndex } = props;

  const dispatch = useDispatch();
  const { metadata } = useSelector(
    (state) => state.notebook.data.cells[cellIndex]
  );
  const clickCellIndex = useSelector((state) => state.ui.clickCellIndex);

  const highlighted = clickCellIndex === cellIndex;
  const { jupyter } = metadata;

  function toggleVisibility() {
    let hidden, collapse;
    switch (target) {
      case 'source_hidden':
        hidden =
          jupyter && jupyter.source_hidden ? jupyter.source_hidden : false;
        dispatch({
          type: 'notebook/changeCellVisibility',
          payload: {
            index: cellIndex,
            target,
            value: Boolean(1 - hidden),
          },
        });
        break;

      case 'outputs_hidden':
        hidden =
          jupyter && jupyter.outputs_hidden ? jupyter.outputs_hidden : false;
        collapse = hidden === false && !metadata.collapsed;

        dispatch({
          type: 'notebook/changeCellVisibility',
          payload: {
            index: cellIndex,
            // If note hidden, we first collapse and THEN hide on next call
            target: collapse ? 'collapsed' : target,
            value: Boolean(collapse ? 1 : 1 - hidden),
          },
        });
        break;
      default:
    }
  }
  return (
    <div
      className={highlighted ? 'block-light-selected' : 'block-light'}
      onClick={toggleVisibility}
    />
  );
}

export default React.memo(ToggleVisibilityBar);
