import { defineStore } from 'pinia'
import type { TUser } from '../types/types'

interface UserState {
    user: TUser | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null
  }),
  actions: {
    setUser(userData: TUser) {
      this.user = userData
    },
    clearUser() {
      this.user = null
    }
  }
})
