// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import tokensReducer from './tokensSlice';

export const store = configureStore({
  reducer: {
    tokensUI: tokensReducer,
  },
  // middleware: (getDefault) => getDefault(), // add custom middleware here if needed
});

// typed hooks & types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
