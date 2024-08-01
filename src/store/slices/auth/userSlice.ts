import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

export type UserState = {
    avatar?: string
    userName?: string
    email?: string
    authority?: string[]
}

const initialState: UserState = {
    avatar: '',
    userName: '',
    email: '',
    authority: [],
}

const userSlice = createSlice({
    name: `${SLICE_BASE_NAME}/user`,
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<UserState>) {
            return action.payload
        },
        clear() {
            return { avatar: '', userName: '', email: '', authority: [] }
        },
    },
})

export const { setUser, clear } = userSlice.actions
export default userSlice.reducer
