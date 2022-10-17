import { configureStore } from '@reduxjs/toolkit';
import notebook from './slices/notebookSlice';
import kernelMiddleware from './kernelMiddleware';
    
const store = configureStore({
  reducer: {
    notebook
  },
  middleware: [kernelMiddleware],
});

export default store;
