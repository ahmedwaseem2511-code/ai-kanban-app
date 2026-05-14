import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import taskReducer from './taskSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
  },
})

export interface RootState {
  auth: ReturnType<typeof authReducer>
  tasks: ReturnType<typeof taskReducer>
}

export type AppDispatch = typeof store.dispatch