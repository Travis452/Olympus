import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUserEXP, updateUserEXP } from "../../config/firebase";

export const fetchUserEXP = createAsyncThunk(
  "user/fetchEXP",
  async (userId, { rejectWithValue }) => {
    try {
      const userData = await getUserEXP(userId);
      if (userData) {
        return userData;
      } else {
        return rejectWithValue("User data not found");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addEXP = createAsyncThunk(
  "user/addEXP",
  async ({ userId, expToAdd }, { rejectWithValue }) => {
    try {
      const updatedData = await updateUserEXP(userId, expToAdd);
      return updatedData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    firstName: "",
    lastName: "",
    email: "",
    completedWorkouts: 0,
    exp: 0,
    level: 1,
    status: "idle",
    error: null,
  },

  reducers: {
    setUser(state, action) {
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.email = action.payload.email;
      state.completedWorkouts = action.payload.completedWorkouts;
      state.exp = action.payload.exp ?? 0;
      state.level = action.payload.level ?? 1;
    },
    clearUser(state) {
      state.firstName = "";
      state.lastName = "";
      state.email = "";
      state.completedWorkouts = 0;
      state.exp = 0;
      state.level = 1;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchUserEXP.pending, (state) => {
        state.status = "laoding";
      })

      .addCase(fetchUserEXP.fulfilled, (state, action) => {
        state.status = "success";
        state.exp = action.payload.exp;
        state.level = action.payload.level;
      })

      .addCase(fetchUserEXP.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
      })

      .addCase(addEXP.fulfilled, (state, action) => {
        state.exp = action.payload.exp;
        state.level = action.payload.level;
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
