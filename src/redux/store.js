import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';

const timerReducer = (state = 0, action) => {
    switch (action.type) {
        case 'SET_TIMER':
            return action.payload;
        case 'INCREMENT_TIMER':
            return state + 1;
        case 'RESET_TIMER':
            return 0;
        default:
            return state;
    }
};

const store = configureStore({
    reducer: {
        timer: timerReducer,
        user: userReducer,
    },
});

export default store;