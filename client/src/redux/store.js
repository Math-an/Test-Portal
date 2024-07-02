import usersSlice from "./usersSlice";
import { configureStore } from "@reduxjs/toolkit";
import loaderSlice  from "./loaderSlice";
import examsReducer from './examSlice';

const store = configureStore({
    reducer: {
        users: usersSlice,
        loader : loaderSlice,
        exams: examsReducer
    }
});

export default store;