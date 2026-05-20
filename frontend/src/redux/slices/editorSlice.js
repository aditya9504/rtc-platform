import { createSlice } from '@reduxjs/toolkit';

const editorSlice = createSlice({
  name: 'editor',
  initialState: {
    code: '// Welcome to RTC Code Review Platform\n// Start typing or join a session...\n\nconsole.log("Hello, World!");\n',
    language: 'javascript',
    theme: 'vs-dark',
    fontSize: 14,
    wordWrap: 'on',
    minimap: true,
    output: [],
    isRunning: false,
    activeFile: 'main.js',
    files: [
      { name: 'main.js', language: 'javascript', code: '// Welcome to RTC Code Review Platform\n// Start typing or join a session...\n\nconsole.log("Hello, World!");\n' },
    ],
    collaborators: [],
    isSaving: false,
    lastSaved: null,
  },
  reducers: {
    setCode: (state, action) => { state.code = action.payload; },
    setLanguage: (state, action) => {
      state.language = action.payload;
      // Update active file extension
      const extMap = { javascript: 'js', typescript: 'ts', python: 'py', java: 'java', c: 'c', cpp: 'cpp', html: 'html', css: 'css', json: 'json' };
      const ext = extMap[action.payload] || 'txt';
      const file = state.files.find(f => f.name === state.activeFile);
      if (file) file.language = action.payload;
    },
    setOutput: (state, action) => { state.output = action.payload; },
    appendOutput: (state, action) => { state.output.push(action.payload); },
    clearOutput: (state) => { state.output = []; },
    setIsRunning: (state, action) => { state.isRunning = action.payload; },
    setFontSize: (state, action) => { state.fontSize = action.payload; },
    setWordWrap: (state, action) => { state.wordWrap = action.payload; },
    setMinimap: (state, action) => { state.minimap = action.payload; },
    setCollaborators: (state, action) => { state.collaborators = action.payload; },
    addCollaborator: (state, action) => {
      if (!state.collaborators.find(c => c.socketId === action.payload.socketId)) {
        state.collaborators.push(action.payload);
      }
    },
    removeCollaborator: (state, action) => {
      state.collaborators = state.collaborators.filter(c => c.socketId !== action.payload);
    },
    setActiveFile: (state, action) => {
      state.activeFile = action.payload;
      const file = state.files.find(f => f.name === action.payload);
      if (file) { state.code = file.code; state.language = file.language; }
    },
    addFile: (state, action) => {
      state.files.push(action.payload);
      state.activeFile = action.payload.name;
      state.code = action.payload.code || '';
      state.language = action.payload.language || 'javascript';
    },
    updateFileCode: (state, action) => {
      const file = state.files.find(f => f.name === state.activeFile);
      if (file) file.code = action.payload;
    },
    setIsSaving: (state, action) => { state.isSaving = action.payload; },
    setLastSaved: (state, action) => { state.lastSaved = action.payload; },
  },
});

export const {
  setCode, setLanguage, setOutput, appendOutput, clearOutput, setIsRunning,
  setFontSize, setWordWrap, setMinimap, setCollaborators, addCollaborator,
  removeCollaborator, setActiveFile, addFile, updateFileCode, setIsSaving, setLastSaved,
} = editorSlice.actions;
export default editorSlice.reducer;
