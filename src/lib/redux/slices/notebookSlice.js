import { createSlice } from '@reduxjs/toolkit';
import * as reducers from '../reducers/notebookReducer';

const initState = {
  data: { cells: [], metadata: {}, nbformat: '', nbformat_minor: '' },
  clickCellIndex: -1,
};

const notebookSlice = createSlice({
  name: 'notebook',
  initialState: initState,
  reducers: reducers,
});

export const { actions } = notebookSlice;
export default notebookSlice.reducer;
