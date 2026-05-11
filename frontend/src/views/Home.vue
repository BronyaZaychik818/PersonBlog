<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const profile = ref({
  username: 'Xiaodu',
  email: '',
  avatar: '/avatar.jpeg',
  banner: '',
  github: '',
  bilibili: '',
  gitee: '',
})

const showMore = ref(false)
const showSearch = ref(false)
const searchQuery = ref('')
const isDark = ref(false)

onMounted(async () => {
  try {
    const { data } = await api.get('/profile')
    if (data) profile.value = data
  } catch {}
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.body.classList.add('dark')
  }
})

function toggleMore() {
  showMore.value = !showMore.value
}

function toggleTheme() {
  isDark.value = !isDark.value
  document.body.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function toggleSearch() {
  showSearch.value = !showSearch.value
  searchQuery.value = ''
  if (showSearch.value) {
    setTimeout(() => {
      const el = document.querySelector('.search-input')
      if (el) el.focus()
    }, 100)
  } else {
    // Clear search when closing
    router.push({ query: {} })
  }
}

function goTo(url) {
  showMore.value = false
  router.push(url)
}

function closeDropdown() {
  showMore.value = false
}

function setMode(mode) {
  const query = { mode }
  if (searchQuery.value.trim()) {
    query.q = searchQuery.value.trim()
  }
  router.push({ path: '/', query })
}

function searchBlogs() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/', query: { mode: route.query.mode || 'all', q: searchQuery.value.trim() } })
  } else {
    router.push({ path: '/', query: { mode: route.query.mode || 'all' } })
  }
}

function clearSearch() {
  searchQuery.value = ''
  router.push({ path: '/', query: { mode: route.query.mode || 'all' } })
}
</script>

<template>
  <div class="home" @click="closeDropdown">
    <!-- Top Navbar -->
    <header class="navbar">
      <div class="navbar-inner">
        <router-link to="/" class="site-name">Xiaodu</router-link>
        <div class="navbar-right">
          <button class="nav-btn" @click="setMode('all')">文章</button>
          <button class="nav-btn" @click="toggleSearch">搜索</button>
          <div class="more-wrap" @click.stop>
            <button class="nav-btn" @click="toggleMore">更多</button>
            <div v-if="showMore" class="dropdown">
              <template v-if="authStore.isLoggedIn">
                <button class="dropdown-item" @click="goTo('/admin')">管理后台</button>
                <button class="dropdown-item" @click="goTo('/admin/profile')">个人信息设置</button>
              </template>
              <template v-else>
                <button class="dropdown-item" @click="goTo('/login')">登录</button>
              </template>
            </div>
          </div>
        </div>
      </div>
      <!-- Search bar -->
      <div v-if="showSearch" class="search-bar">
        <div class="search-inner">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索博客标题和内容..."
            class="search-input"
            @keyup.enter="searchBlogs"
          />
          <button class="search-btn" @click="searchBlogs">搜索</button>
          <button class="search-close" @click="clearSearch(); toggleSearch()">✕</button>
        </div>
      </div>
    </header>

    <!-- Hero: Banner + Profile Card -->
    <section class="hero">
      <div class="banner">
        <img
          v-if="profile.banner"
          :src="profile.banner"
          alt="banner"
          class="banner-img"
        />
        <div v-else class="banner-placeholder">Banner</div>
      </div>

      <div class="profile-card">
        <img :src="profile.avatar" alt="avatar" class="avatar" />
        <h1 class="username">{{ profile.username }}</h1>
        <div class="info-row" v-if="profile.email || profile.github || profile.bilibili || profile.gitee">
          <span class="info-line"></span>
          <div class="info-content">
            <p v-if="profile.email" class="email">邮箱: {{ profile.email }}</p>
            <div class="social-links" v-if="profile.github || profile.bilibili || profile.gitee">
              <span class="links-label">链接: </span>
              <template v-if="profile.github">
                <a :href="profile.github" target="_blank">GitHub</a>
                <span v-if="profile.bilibili || profile.gitee" class="sep"> / </span>
              </template>
              <template v-if="profile.bilibili">
                <a :href="profile.bilibili" target="_blank">Bilibili</a>
                <span v-if="profile.gitee" class="sep"> / </span>
              </template>
              <template v-if="profile.gitee">
                <a :href="profile.gitee" target="_blank">Gitee</a>
              </template>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Content -->
    <main class="main-content">
      <router-view :key="route.fullPath" />
    </main>

    <!-- Bottom Navbar -->
    <footer class="bottom-nav">
      <div class="bottom-inner">
        <div class="bottom-left">
          <button class="nav-btn" @click="setMode('recent')">最近文章</button>
          <button class="nav-btn" @click="setMode('toc')">文章目录</button>
        </div>
        <div class="bottom-right">
          <button class="nav-btn" @click="toggleTheme">
            {{ isDark ? '浅色模式' : '深色模式' }}
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ---- Navbar ---- */
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}
.navbar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  height: 60px;
}
.site-name {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text);
  text-decoration: none;
  letter-spacing: 0.5px;
}
.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-btn {
  background: none;
  border: none;
  padding: 8px 18px;
  font-size: 0.95rem;
  color: var(--text);
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.15s;
}
.nav-btn:hover {
  background: var(--hover);
}
.more-wrap {
  position: relative;
}
.dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  min-width: 160px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  z-index: 100;
  overflow: hidden;
}
.dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 12px 18px;
  background: none;
  border: none;
  color: var(--text);
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.1s;
}
.dropdown-item:hover {
  background: var(--hover);
}

/* Search bar */
.search-bar {
  border-top: 1px solid var(--border);
  background: var(--bg);
}
.search-inner {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 12px 40px;
}
.search-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.95rem;
  background: var(--bg);
  color: var(--text);
  outline: none;
  font-family: var(--sans);
}
.search-input:focus {
  border-color: var(--accent);
}
.search-btn {
  padding: 10px 20px;
  background: var(--accent);
  color: var(--bg);
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
}
.search-btn:hover { opacity: 0.8; }
.search-close {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
}

/* ---- Hero: Banner + Profile Card ---- */
.hero {
  position: relative;
  padding: 0;
}

/* Banner */
.banner {
  width: 100%;
  overflow: hidden;
}
.banner-img {
  display: block;
  width: 100%;
  height: 500px;
  object-fit: cover;
  object-position: center 30%;
}
.banner-placeholder {
  width: 100%;
  height: 500px;
  background: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 1rem;
}

/* Profile card */
.profile-card {
  position: relative;
  margin-top: -120px;
  margin-left: 100px;
  max-width: 680px;
  padding: 28px 36px 32px;
  z-index: 10;
}
.avatar {
  border-radius: 4px;
  width: 124.32px;
  height: 124.32px;
  object-fit: cover;
}
.username {
  margin: 24px 0 18px;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  font-family: var(--sans);
}

.info-row {
  display: flex;
  align-items: flex-start;
}
.info-line {
  display: block;
  width: 3px;
  border-radius: 2px;
  background: var(--border);
  flex-shrink: 0;
  align-self: stretch;
  margin-right: 16px;
  min-height: 36px;
}
.info-content {
  flex: 1;
}
.email {
  color: var(--text);
  margin: 0 0 10px;
  font-size: 1.0rem;
}
.social-links {
  font-size: 1.0rem;
}
.links-label {
  color: var(--text);
}
.social-links a {
  color: var(--text);
  text-decoration: underline;
  font-weight: 500;
  transition: color 0.15s;
}
.social-links a:hover {
  color: var(--text-secondary);
}
.sep {
  color: var(--text-secondary);
  white-space: pre;
}

/* ---- Mobile ---- */
@media (max-width: 768px) {
  .navbar-inner {
    padding: 0 16px;
    height: 52px;
  }
  .site-name {
    font-size: 1.15rem;
  }
  .nav-btn {
    padding: 6px 10px;
    font-size: 0.85rem;
  }
  .search-inner {
    padding: 10px 16px;
  }
  .banner-img {
    height: 280px;
  }
  .banner-placeholder {
    height: 280px;
  }
  .profile-card {
    margin-top: -60px;
    margin-left: auto;
    margin-right: auto;
    max-width: calc(100% - 32px);
    padding: 20px 20px 24px;
  }
  .avatar {
    width: 80px;
    height: 80px;
  }
  .username {
    margin: 16px 0 12px;
    font-size: 1.5rem;
  }
  .info-line {
    margin-right: 12px;
    min-height: 28px;
  }
  .email, .social-links {
    font-size: 0.9rem;
  }
  .main-content {
    padding: 0 16px 32px;
  }
  .bottom-inner {
    padding: 10px 16px;
  }
}

/* ---- Main Content ---- */
.main-content {
  flex: 1;
  width: 100%;
  padding: 0 40px 48px;
}

/* ---- Bottom Nav ---- */
.bottom-nav {
  position: sticky;
  bottom: 0;
  z-index: 1000;
  background: var(--bg);
  border-top: 1px solid var(--border);
}
.bottom-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 40px;
}
.bottom-left, .bottom-right {
  display: flex;
  gap: 8px;
}
</style>
