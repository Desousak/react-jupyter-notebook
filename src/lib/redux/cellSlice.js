import { createSlice } from '@reduxjs/toolkit';
import * as reducers from './cellReducers';

/*
Items to be placed under redux management:
- Cells (and everything contained: i.e. source & output updates)
- KernelMessenger ?
- Cell Clicked Index
*/

const initState = {
  cells: [],
  clickCellIndex: -1,
  KernelMessenger: null,
};

const cellSlice = createSlice({
  name: 'cells',
  initialState: initState,
  reducers: reducers,
});

const { actions, reducer } = cellSlice;
// TODO: REPLACE!
export const test = actions;
export default reducer;
