import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchSessions = createAsyncThunk('sessions/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/sessions');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const createSession = createAsyncThunk('sessions/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/sessions', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchSession = createAsyncThunk('sessions/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/sessions/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const sessionSlice = createSlice({
  name: 'sessions',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentSession: (state, action) => { state.current = action.payload; },
    clearCurrentSession: (state) => { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.pending, (state) => { state.loading = true; })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.sessions;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.list.unshift(action.payload.session);
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.current = action.payload.session;
      });
  },
});

export const { setCurrentSession, clearCurrentSession } = sessionSlice.actions;
export default sessionSlice.reducer;
