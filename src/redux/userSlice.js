import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUserEXP, updateUserEXP } from "../../config/firebase";
import { LEVELS } from "../../config/levels";

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

const calculateLevel = (exp) => {
  let currentLevel = LEVELS[0].name;
  for (let i = 0; i < LEVELS.length; i++) {
    if (exp >= LEVELS[i].expRequired) {
      currentLevel = LEVELS[i].name;
    } else {
      break;
    }
  }
  return currentLevel;
};

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
      state.level = calculateLevel(state.exp);
    },
    clearUser(state) {
      state.firstName = "";
      state.lastName = "";
      state.email = "";
      state.completedWorkouts = 0;
      state.exp = 0;
      state.level = LEVELS[0].name;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchUserEXP.pending, (state) => {
        state.status = "loading";
      })

      .addCase(fetchUserEXP.fulfilled, (state, action) => {
        state.status = "success";
        state.exp = action.payload.exp;
        state.level = calculateLevel(action.payload.exp);
      })

      .addCase(fetchUserEXP.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
      })

      .addCase(addEXP.fulfilled, (state, action) => {
        state.exp = action.payload.exp;
        state.level = calculateLevel(action.payload.exp);
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
