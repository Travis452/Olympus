import {createSlice} from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        firstName: '',
        lastName: '',
        email: '',
        completedWorkouts: 0,
    },

    reducers: {
        setUser(state, action) {
            state.firstName = action.payload.firstName;
            state.lastName = action.payload.lastName;
            state.email = action.payload.email;
            state.completedWorkouts = action.payload.completedWorkouts;
        },
        clearUser(state) {
            state.firstName = '';
            state.lastName = '';
            state.email = '';
            state.completedWorkouts = 0;
        },
    },
});

export const {setUser, clearUser} = userSlice.actions;
export default userSlice.reducer;