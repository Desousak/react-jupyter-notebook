function setClickedIndex(state, action) {
  state.clickCellIndex = action.payload;
}

function setData(state, action) {
  state.data = action.payload;
}

function insertCell(state, action) {
  const { index, cell } = action.payload;
  if (index !== undefined && index > -1 && index < state.data.cells.length + 1) {
    // Insert cell into cell array
    let newCells = [...state.data.cells];
    newCells.splice(index, 0, cell);
    state.data.cells = newCells;
    state.clickCellIndex = index;
  }
}

function removeCell(state, action) {
  const index = action.payload;
  if (index >= 0 && index < state.data.cells.length) {
    const { cells } = state.data;
    const newCells = cells.filter((c, i) => i !== index);
    state.data.cells = newCells;
  }
}

function moveCell(state, action) {
  // Swaps two cells and highlights the moved cell
  const { index, direction } = action.payload;
  const newIndex = index !== -1 ? index + direction : -1;

  if (newIndex >= 0 && newIndex < state.data.cells.length) {
    let newCells = [...state.data.cells];
    let tmpCell = newCells[index];

    newCells[index] = newCells[newIndex];
    newCells[newIndex] = tmpCell;
    state.data.cells = newCells;
    state.clickCellIndex = newIndex;
  }
}

export { setClickedIndex, setData, insertCell, removeCell, moveCell };
