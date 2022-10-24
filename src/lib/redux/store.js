import { configureStore } from '@reduxjs/toolkit';
import notebook from './slices/notebookSlice';

const store = configureStore({
  reducer: {
    notebook,
  },
});

export default store;
