import { createSlice } from '@reduxjs/toolkit';

const timerSlice = createSlice({
    name: 'timer',
    initialState: {
        seconds: 0
    },
    reducers: {
        setTimer: (state, action) => {
            state.seconds = action.payload;
        },
        incrementTimer: (state) => {
            state.seconds += 1;
        },
        resetTimer: (state) => {
            state.seconds = 0;
        }
    }
});

export const { setTimer, incrementTimer, resetTimer } = timerSlice.actions;
export default timerSlice.reducer;
