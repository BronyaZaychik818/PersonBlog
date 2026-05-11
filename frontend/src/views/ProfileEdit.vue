<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const profile = ref({
  username: 'Xiaodu',
  email: '',
  avatar: '/avatar.jpeg',
  banner: '',
  github: '',
  bilibili: '',
  gitee: '',
})

const message = ref('')
const uploadMsg = ref('')
const uploading = ref(false)

const MAX_SIZE = 50 * 1024 * 1024 // 50MB

function checkFileSize(file) {
  if (file.size > MAX_SIZE) {
    uploadMsg.value = `图片过大（${(file.size / 1024 / 1024).toFixed(1)}MB），上限 50MB`
    return false
  }
  uploadMsg.value = ''
  return true
}

const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')
const pwMessage = ref('')
const pwError = ref('')
const savingPw = ref(false)

onMounted(async () => {
  try {
    const { data } = await api.get('/profile')
    if (data) profile.value = data
  } catch {}
})

async function saveProfile() {
  message.value = ''
  try {
    await api.put('/profile', profile.value)
    message.value = '保存成功'
  } catch {
    message.value = '保存失败'
  }
}

async function changePassword() {
  pwMessage.value = ''
  pwError.value = ''
  if (!currentPassword.value || !newPassword.value) {
    pwError.value = '请填写所有密码字段'
    return
  }
  if (newPassword.value.length < 6) {
    pwError.value = '新密码至少 6 位'
    return
  }
  if (newPassword.value !== newPasswordConfirm.value) {
    pwError.value = '两次新密码不一致'
    return
  }
  savingPw.value = true
  try {
    await api.put('/auth/password', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    })
    pwMessage.value = '密码修改成功'
    currentPassword.value = ''
    newPassword.value = ''
    newPasswordConfirm.value = ''
  } catch (e) {
    pwError.value = e.response?.data?.error || '修改失败'
  }
  savingPw.value = false
}

async function uploadAvatar(e) {
  const file = e.target.files[0]
  if (!file) return
  if (!checkFileSize(file)) return
  uploading.value = true
  const formData = new FormData()
  formData.append('avatar', file)
  try {
    const { data } = await api.post('/profile/avatar', formData)
    profile.value.avatar = data.avatar + '?t=' + Date.now()
    uploadMsg.value = '头像上传成功'
  } catch {
    uploadMsg.value = '上传失败'
  }
  uploading.value = false
}

async function uploadBanner(e) {
  const file = e.target.files[0]
  if (!file) return
  if (!checkFileSize(file)) return
  uploading.value = true
  const formData = new FormData()
  formData.append('banner', file)
  try {
    const { data } = await api.post('/profile/banner', formData)
    profile.value.banner = data.banner + '?t=' + Date.now()
    uploadMsg.value = 'Banner 上传成功'
  } catch {
    uploadMsg.value = '上传失败'
  }
  uploading.value = false
}
</script>

<template>
  <div class="profile-edit">
    <h1>个人信息设置</h1>

    <div class="section">
      <label class="label">头像</label>
      <div class="avatar-row">
        <img :src="profile.avatar" alt="avatar" class="avatar-preview" />
        <input type="file" accept="image/*" @change="uploadAvatar" :disabled="uploading" />
      </div>
    </div>

    <div class="section">
      <label class="label">顶部 Banner</label>
      <div class="banner-row">
        <img v-if="profile.banner" :src="profile.banner" alt="banner" class="banner-preview" />
        <input type="file" accept="image/*" @change="uploadBanner" :disabled="uploading" />
      </div>
    </div>

    <p v-if="uploadMsg" class="upload-msg" :class="{ 'upload-error': uploadMsg.includes('过大') || uploadMsg.includes('失败') }">{{ uploadMsg }}</p>

    <div class="section">
      <label class="label">用户名</label>
      <input v-model="profile.username" class="input" />
    </div>
    <div class="section">
      <label class="label">邮箱</label>
      <input v-model="profile.email" class="input" placeholder="email@example.com" />
    </div>
    <div class="section">
      <label class="label">GitHub</label>
      <input v-model="profile.github" class="input" placeholder="https://github.com/..." />
    </div>
    <div class="section">
      <label class="label">Bilibili</label>
      <input v-model="profile.bilibili" class="input" placeholder="https://space.bilibili.com/..." />
    </div>
    <div class="section">
      <label class="label">Gitee</label>
      <input v-model="profile.gitee" class="input" placeholder="https://gitee.com/..." />
    </div>

    <div class="footer-actions">
      <p v-if="message" class="message">{{ message }}</p>
      <button class="btn-primary" @click="saveProfile">保存</button>
      <router-link to="/admin" class="btn-secondary">返回</router-link>
    </div>

    <hr class="divider" />
    <h2 class="section-heading">修改登录密码</h2>
    <div class="section">
      <label class="label">当前密码</label>
      <input v-model="currentPassword" type="password" class="input" placeholder="输入当前密码" />
    </div>
    <div class="section">
      <label class="label">新密码</label>
      <input v-model="newPassword" type="password" class="input" placeholder="至少 6 位" />
    </div>
    <div class="section">
      <label class="label">确认新密码</label>
      <input v-model="newPasswordConfirm" type="password" class="input" placeholder="再次输入新密码" />
    </div>
    <div class="footer-actions">
      <p v-if="pwError" class="message error">{{ pwError }}</p>
      <p v-if="pwMessage" class="message">{{ pwMessage }}</p>
      <button class="btn-primary" @click="changePassword" :disabled="savingPw">
        {{ savingPw ? '修改中...' : '修改密码' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.profile-edit {
  min-height: 100vh;
  background: var(--bg);
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 24px;
}
h1 {
  margin: 0 0 32px;
  font-size: 1.6rem;
  color: var(--text);
  font-weight: 700;
}
.section-heading {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 20px;
}
.section {
  margin-bottom: 20px;
}
.label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 6px;
}
.input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.95rem;
  background: var(--bg);
  color: var(--text);
  outline: none;
  font-family: var(--sans);
}
.input:focus {
  border-color: var(--accent);
}
.upload-msg {
  font-size: 0.9rem;
  color: #38a169;
  margin: 8px 0 0;
}
.upload-msg.upload-error {
  color: #e53e3e;
}
.avatar-row, .banner-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}
.banner-preview {
  width: 320px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--border);
}
.footer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
}
.btn-primary {
  padding: 10px 24px;
  background: var(--accent);
  color: var(--bg);
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.15s;
}
.btn-primary:hover:not(:disabled) { opacity: 0.85; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary {
  padding: 10px 24px;
  background: none;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s;
}
.btn-secondary:hover { background: var(--hover); }
.message {
  flex: 1;
  font-size: 0.9rem;
  color: #38a169;
  margin: 0;
}
.message.error {
  color: #e53e3e;
}
.divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 40px 0 32px;
}

@media (max-width: 768px) {
  .profile-edit {
    padding: 20px 12px;
  }
  .banner-preview {
    width: 100%;
    max-width: 320px;
  }
}
</style>
