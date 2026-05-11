<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!password.value) return
  error.value = ''
  loading.value = true
  try {
    await authStore.login(password.value)
    router.push('/admin')
  } catch (e) {
    error.value = e.response?.data?.error || '登录失败，请重试'
  }
  loading.value = false
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Xiaodu</h1>
      <p class="subtitle">管理员登录</p>
      <form @submit.prevent="handleLogin">
        <input
          v-model="password"
          type="password"
          placeholder="请输入密码"
          class="input"
          :disabled="loading"
        />
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" class="btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      <router-link to="/" class="back">返回首页</router-link>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg);
  margin: 0;
  padding: 0;
}
.login-card {
  width: 360px;
  padding: 40px 32px;
  text-align: center;
  border: 1px solid var(--border);
  border-radius: 8px;
}
h1 {
  margin: 0 0 4px;
  font-size: 1.5rem;
  color: var(--text);
}
.subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0 0 24px;
}
.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.95rem;
  background: var(--bg);
  color: var(--text);
  outline: none;
}
.input:focus {
  border-color: var(--accent);
}
.error {
  color: #e53e3e;
  font-size: 0.85rem;
  margin: 8px 0 0;
}
.btn {
  width: 100%;
  margin-top: 16px;
  padding: 10px;
  background: var(--accent);
  color: var(--bg);
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
}
.btn:hover {
  opacity: 0.85;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.back {
  display: inline-block;
  margin-top: 16px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}
</style>
