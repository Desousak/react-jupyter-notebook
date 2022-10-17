import { configureStore, applyMiddleware } from '@reduxjs/toolkit';
import rootReducer from './cellSlice';
import kernelMiddleware from './kernelMiddleware';

const store = configureStore({
  reducer: rootReducer,
  middleware: [kernelMiddleware],
});

export default store;
