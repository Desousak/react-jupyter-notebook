import { createSlice } from '@reduxjs/toolkit';
import * as reducers from '../reducers/notebookReducer';

/*
Items to be placed under redux management:
- Cells (and everything contained: i.e. source & output updates)
- KernelMessenger ?
- Cell Clicked Index
*/

const initState = {
  data: { cells: [], metadata: {}, nbformat: '', nbformat_minor: '' },
  clickCellIndex: -1,
  KernelMessenger: null,
};

const notebookSlice = createSlice({
  name: 'notebook',
  initialState: initState,
  reducers: reducers,
});

const { actions, reducer } = notebookSlice;
// TODO: REPLACE!
export const test = actions;
export default reducer;
