import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyzeCodeRequest } from '../../services/aiApi';

const initialState = {
  loading: false,
  error: null,
  suggestions: {
    summary: '',
    problems: [],
    suggestions: [],
    modifications: [],
    improvedCode: '',
  },
  lastAnalyzedAt: null,
  panelOpen: false,
  lastRequestedCode: '',
  lastRequestedLanguage: '',
};

export const analyzeCode = createAsyncThunk(
  'ai/analyzeCode',
  async ({ code, language }, thunkAPI) => {
    const payload = await analyzeCodeRequest({ code, language });
    return {
      summary: payload.summary || '',
      problems: Array.isArray(payload.problems) ? payload.problems : [],
      suggestions: Array.isArray(payload.suggestions) ? payload.suggestions : [],
      modifications: Array.isArray(payload.modifications) ? payload.modifications : [],
      improvedCode: payload.improvedCode || '',
      analyzedAt: new Date().toISOString(),
      requestedCode: code,
      requestedLanguage: language,
    };
  },
  {
    condition: ({ code, language }, { getState }) => {
      if (!code || typeof code !== 'string' || !code.trim()) {
        return false;
      }
      const state = getState();
      const { ai } = state;
      if (ai.loading && ai.lastRequestedCode === code && ai.lastRequestedLanguage === language) {
        return false;
      }
      return true;
    },
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    openPanel: (state) => {
      state.panelOpen = true;
      state.error = null;
    },
    closePanel: (state) => {
      state.panelOpen = false;
    },
    clearSuggestions: (state) => {
      state.suggestions = initialState.suggestions;
      state.error = null;
      state.lastAnalyzedAt = null;
      state.lastRequestedCode = '';
      state.lastRequestedLanguage = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzeCode.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.lastRequestedCode = action.meta.arg.code;
        state.lastRequestedLanguage = action.meta.arg.language;
      })
      .addCase(analyzeCode.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.suggestions = {
          summary: action.payload.summary,
          problems: action.payload.problems,
          suggestions: action.payload.suggestions,
          modifications: action.payload.modifications,
          improvedCode: action.payload.improvedCode,
        };
        state.lastAnalyzedAt = action.payload.analyzedAt;
      })
      .addCase(analyzeCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'AI analysis failed. Please try again.';
      });
  },
});

export const { openPanel, closePanel, clearSuggestions } = aiSlice.actions;
export default aiSlice.reducer;
