import { configureStore, combineReducers } from '@reduxjs/toolkit';
import ui from './slices/uiSlice';
import notebook from './slices/notebookSlice';

const store = configureStore({
  reducer: {
    notebook,
    ui,
  },
});

export default store;
