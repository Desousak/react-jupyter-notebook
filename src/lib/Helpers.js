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

export { setCharAt, addCellName };
