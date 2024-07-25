import {createSlice} from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        firstName: '',
        lastName: '',
        email: '',
    },

    reducers: {
        setUser(state, action) {
            state.firstName = action.payload.firstName;
            state.lastName = action.payload.lastName;
            state.email = action.payload.email;
        },
        clearUser(state) {
            state.firstName = '';
            state.lastName = '';
            state.email = '';
        },
    },
});

export const {setUser, clearUser} = userSlice.actions;
export default userSlice.reducer;