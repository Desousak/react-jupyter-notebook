function setClickedCell(state, action) {
  state.clickCellIndex = action.payload;
}

export { setClickedCell };
