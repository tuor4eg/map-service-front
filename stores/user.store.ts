import { defineStore } from 'pinia'
import type { IUser } from '../types/types'

interface UserState {
  user: IUser | null | string
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: 'test'
  }),
  actions: {
    setUser(userData: IUser) {
      this.user = userData
    },
    clearUser() {
      this.user = null
    }
  }
})
