function setClickedIndex(state, action) {
  state.clickCellIndex = action.payload;
}

function setKernelMessenger(state, action) {
  const messenger = new action.payload();
  state.KernelMessenger = messenger;
}

function setCells(state, action) {
  state.cells = action.payload;
}

function insertCell(state, action) {
  const { index, cell } = action.payload;
  if (index !== undefined && index > -1 && index < state.cells.length + 1) {
    // Insert cell into cell array
    let newCells = [...state.cells];
    newCells.splice(index, 0, cell);
    state.cells = newCells;
    state.clickCellIndex = index;
  }
}

function removeCell(state, action) {
  const index = action.payload;
  if (index >= 0 && index < state.cells.length) {
    const { cells } = state;
    const newCells = cells.filter((c, i) => i !== index);
    state.cells = newCells;
  }
}

function moveCell(state, action) {
  // Swaps two cells and highlights the moved cell
  const { index, direction } = action.payload;
  const newIndex = index !== -1 ? index + direction : -1;

  if (newIndex >= 0 && newIndex < state.cells.length) {
    let newCells = [...state.cells];
    let tmpCell = newCells[index];

    newCells[index] = newCells[newIndex];
    newCells[newIndex] = tmpCell;
    state.cells = newCells;
    state.clickCellIndex = newIndex;
  }
}

export { setClickedIndex, setKernelMessenger, setCells, insertCell, removeCell, moveCell };
