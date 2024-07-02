import { createSlice } from '@reduxjs/toolkit';

const examsSlice = createSlice({
  name: 'exams',
  initialState: {
    exams: [],
  },
  reducers: {
    setExams: (state, action) => {
      state.exams = action.payload;
    },
    // other reducers
  },
});

export const { setExams } = examsSlice.actions;
export default examsSlice.reducer;
