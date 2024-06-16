//create redux slice
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

//make http req using redux-thunk middleware
export const userLoginThunk=createAsyncThunk("user-login", async (userCred, thunkApi) => {
  try {
      const res = await axios.post(
        "http://localhost:5000/faculty-api/login",
        userCred
      );
      if (res.data.message === "Login success") {
        //store token in local/session storage
        localStorage.setItem("token", res.data.token);
        return res.data;
        //return data
      } else {
        return thunkApi.rejectWithValue(res.data.message);
      }
  } catch (err) {
    return thunkApi.rejectWithValue(err);
  }
});

export const userSlice = createSlice({
  name: "user-login",
  initialState: {
    isPending:false,
    loginUserStatus:false,
    currentUser:{},
    errorOccurred:false,
    errMsg:''
  },
  reducers: {
    resetState:(state,action)=>{
        state.isPending=false;
        state.currentUser={};
        state.loginUserStatus=false;
        state.errorOccurred=false;
        state.errMsg=''
    }
  },
  extraReducers: builder=>builder
  .addCase(userLoginThunk.pending,(state,action)=>{
    state.isPending=true;
  })
  .addCase(userLoginThunk.fulfilled,(state,action)=>{
        state.isPending=false;
        state.currentUser=action.payload.user;
        state.loginUserStatus=true;
        state.errMsg=''
        state.errorOccurred=false;
        
  })
  .addCase(userLoginThunk.rejected,(state,action)=>{
        state.isPending=false;
        state.currentUser={};
        state.loginUserStatus=false;
        state.errMsg=action.payload;
        state.errorOccurred=true;
  }),
});

//export action creator functions
export const {resetState} = userSlice.actions;
//export root reducer of this slice
export default userSlice.reducer;