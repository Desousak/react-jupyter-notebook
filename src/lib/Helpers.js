// Replace character at index
function setCharAt(str, index, chr) {
  if (index > str.length - 1) return chr;
  return str.substring(0, index) + chr + str.substring(index + 1);
}

// Generate cell name if needed
function genCellName(cell) {
  if (cell) {
    if (!cell.metadata) cell.metadata = {};
    // If name is invalid - regen
    const cellName = cell.metadata.name;
    if (cellName === undefined || cellName.length <= 0) {
      cell.metadata.name = Math.random(100).toString(36).slice(2);
    }
  }
  return cell;
}

// Generate a cell 
function genCell(type) {
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
  return genCellName(newCell);
}

// Insert cell into cell store
function addCell(dispatch, index, type = 'code') {
  
  dispatch({
    type: 'notebook/insertCell',
    payload: { index, cell: genCell(type) },
  });
}

// Insert cell offset by current index
function offsetAddCell(dispatch, offset, type) {
  dispatch({
    type: 'notebook/insertOffsetCell',
    payload: { offset, cell: genCell(type) },
  });
}

// Move two cells
function moveCell(dispatch, direction, index = null) {
  dispatch({
    type: 'notebook/moveCell',
    payload: { index, direction },
  });
}

// Delete a cell
function deleteCell(dispatch, index = null) {
  dispatch({ type: 'notebook/removeCell', payload: index });
}

export { setCharAt, genCellName, addCell, offsetAddCell, moveCell, deleteCell };
