import { configureStore , combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import storage from "redux-persist/lib/storage";
import {persistReducer , persistStore} from "redux-persist";

const persistConfig = {
  key: "root",
  version : 1,
  storage
}
const reducer = combineReducers({
  userLoginReducer: userReducer,
})

const persistedReducer = persistReducer(persistConfig,reducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware : (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck : false }),
  });

  export const persistor = persistStore(store)
