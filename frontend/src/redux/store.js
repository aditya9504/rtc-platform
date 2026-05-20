import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import sessionReducer from './slices/sessionSlice';
import editorReducer from './slices/editorSlice';
import uiReducer from './slices/uiSlice';
import aiReducer from './slices/aiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sessions: sessionReducer,
    editor: editorReducer,
    ui: uiReducer,
    ai: aiReducer,
  },
});
