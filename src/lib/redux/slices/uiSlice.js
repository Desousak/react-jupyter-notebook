import { createSlice } from '@reduxjs/toolkit';
import * as reducers from '../reducers/uiReducers';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    clickCellIndex: -1,
  },
  reducers: reducers,
});

const { actions, reducer } = uiSlice;
// TODO: REPLACE!
export const test = actions;
export default reducer;
