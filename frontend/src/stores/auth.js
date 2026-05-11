import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const isLoggedIn = computed(() => !!token.value)

  async function login(password) {
    const { data } = await api.post('/auth/login', { password })
    token.value = data.token
    localStorage.setItem('token', data.token)
  }

  function logout() {
    token.value = ''
    localStorage.removeItem('token')
  }

  async function verify() {
    try {
      await api.get('/auth/verify')
      return true
    } catch {
      logout()
      return false
    }
  }

  return { token, isLoggedIn, login, logout, verify }
})
