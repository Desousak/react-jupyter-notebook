// Initial load
function setData(state, action) {
  state.data = action.payload;
}

// Single cell management
function updateCell(state, action) {
  const { index, cell } = action.payload;
  if (index >= 0 && index < state.data.cells.length) {
    state.data.cells[index] = { ...state.data.cells[index], ...cell };
  }
}

function changeCellVisibility(state, action) {
  const { index, target, value } = action.payload;

  if (index >= 0 && index < state.data.cells.length) {
    const cell = state.data.cells[index];
    if (!cell.metadata.jupyter) cell.metadata.jupyter = {};

    switch (target) {
      case 'outputs_hidden':
        cell.metadata['collapsed'] = false;
      // Fall through
      case 'source_hidden':
        cell.metadata.jupyter[target] = value;
        break;
      case 'collapsed':
        cell.metadata.jupyter['outputs_hidden'] = false;
        cell.metadata[target] = value;
        break;
      default:
    }
  }
}

function addOutput(state, action) {
  const { index, output } = action.payload;
  if (index >= 0 && index < state.data.cells.length) {
    state.data.cells[index].outputs.push(output);
  }
}

// Multi-cell management
function insertCell(state, action) {
  const { index, cell } = action.payload;
  if (
    index !== undefined &&
    index > -1 &&
    index < state.data.cells.length + 1
  ) {
    // Insert cell into cell array
    let newCells = [...state.data.cells];
    newCells.splice(index, 0, cell);
    state.data.cells = newCells;

    setClickedCell(state, { payload: index });
  }
}

function insertOffsetCell(state, action) {
  const { offset, cell } = action.payload;
  const index = state.clickCellIndex + offset;
  insertCell(state, { payload: { index, cell } });
}

function removeCell(state, action) {
  // const index = action.payload;
  const index = action.payload ? action.payload : state.clickCellIndex;
  if (index >= 0 && index < state.data.cells.length) {
    const { cells } = state.data;
    const newCells = cells.filter((c, i) => i !== index);
    state.data.cells = newCells;
    setClickedCell(state, { payload: -1 });
  }
}

function moveCell(state, action) {
  // Swaps two cells and highlights the moved cell
  const direction = action.payload.direction;
  const index = action.payload.index
    ? action.payload.index
    : state.clickCellIndex;
  const newIndex = index !== -1 ? index + direction : -1;

  if (newIndex >= 0 && newIndex < state.data.cells.length) {
    let newCells = [...state.data.cells];
    let tmpCell = newCells[index];

    newCells[index] = newCells[newIndex];
    newCells[newIndex] = tmpCell;
    state.data.cells = newCells;
    state.clickCellIndex = newIndex;

    // Update active cell
    setClickedCell(state, { payload: newIndex });
  }
}

function setClickedCell(state, action) {
  state.clickCellIndex = action.payload;
}

export {
  setData,
  updateCell,
  changeCellVisibility,
  addOutput,
  insertCell,
  insertOffsetCell,
  removeCell,
  moveCell,
  setClickedCell,
};
