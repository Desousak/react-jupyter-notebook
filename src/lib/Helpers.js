function setCharAt(str, index, chr) {
  if (index > str.length - 1) return chr;
  return str.substring(0, index) + chr + str.substring(index + 1);
}

function addCellName(cell) {
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

function addCell(dispatch, index, type = 'code') {
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
  newCell = addCellName(newCell);
  // Insert cell into cell array
  dispatch({
    type: 'notebook/insertCell',
    payload: { index, cell: newCell },
  });
}

export { setCharAt, addCellName, addCell };
