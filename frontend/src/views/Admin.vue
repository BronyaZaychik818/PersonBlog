<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const router = useRouter()
const authStore = useAuthStore()
const blogs = ref([])
const loading = ref(true)

function logout() {
  if (!confirm('确定要登出吗？')) return
  authStore.logout()
  router.push('/')
}

onMounted(async () => {
  await fetchBlogs()
})

async function fetchBlogs() {
  loading.value = true
  try {
    const { data } = await api.get('/blog/all')
    blogs.value = data
  } catch {}
  loading.value = false
}

const searchText = ref('')

const filteredBlogs = computed(() => {
  if (!searchText.value.trim()) return blogs.value
  const q = searchText.value.trim().toLowerCase()
  return blogs.value.filter(b => b.title.toLowerCase().includes(q))
})

const publishedBlogs = computed(() => filteredBlogs.value.filter(b => b.published))
const draftBlogs = computed(() => filteredBlogs.value.filter(b => !b.published))

async function deleteBlog(id) {
  if (!confirm('确定删除此博客？')) return
  try {
    await api.delete(`/blog/${id}`)
    blogs.value = blogs.value.filter((b) => b.id !== id)
  } catch {}
}

function formatDate(d) {
  return d ? new Date(d).toLocaleString('zh-CN') : ''
}

function goEdit(id) {
  router.push(`/admin/blog/${id}/edit`)
}
</script>

<template>
  <div class="admin">
    <div class="admin-header">
      <h1>管理后台</h1>
      <div class="admin-actions">
        <router-link to="/admin/blog/new" class="btn-primary">新建博客</router-link>
        <router-link to="/admin/profile" class="btn-secondary">个人信息</router-link>
        <button class="btn-secondary danger" @click="logout">登出</button>
        <router-link to="/" class="btn-secondary">返回首页</router-link>
      </div>
    </div>

    <div class="search-row">
      <input
        v-model="searchText"
        type="text"
        placeholder="搜索博客标题..."
        class="search-input"
      />
    </div>

    <div v-if="loading" class="empty">加载中...</div>

    <template v-else>
      <section v-if="draftBlogs.length > 0" class="section">
        <h2 class="section-title">草稿</h2>
        <table class="blog-table">
          <thead>
            <tr>
              <th>标题</th>
              <th>创建时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="blog in draftBlogs" :key="blog.id">
              <td>{{ blog.title }}</td>
              <td>{{ formatDate(blog.created_at) }}</td>
              <td><span class="status draft">草稿</span></td>
              <td class="actions">
                <button @click="goEdit(blog.id)" class="action-btn">编辑</button>
                <button @click="deleteBlog(blog.id)" class="action-btn danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="section">
        <h2 class="section-title">已发布</h2>
        <div v-if="publishedBlogs.length === 0" class="empty">暂无已发布博客</div>
        <table v-else class="blog-table">
          <thead>
            <tr>
              <th>标题</th>
              <th>发布时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="blog in publishedBlogs" :key="blog.id">
              <td>{{ blog.title }}</td>
              <td>{{ formatDate(blog.created_at) }}</td>
              <td><span class="status published">已发布</span></td>
              <td class="actions">
                <button @click="goEdit(blog.id)" class="action-btn">编辑</button>
                <button @click="deleteBlog(blog.id)" class="action-btn danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </div>
</template>

<style scoped>
.admin {
  min-height: 100vh;
  background: var(--bg);
  max-width: 1500px;
  margin: 0 auto;
  padding: 32px 40px;
}
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 12px;
}
.admin-header h1 {
  margin: 0;
  font-size: 1.6rem;
  color: var(--text);
  font-weight: 700;
}
.admin-actions {
  display: flex;
  gap: 8px;
}
.search-row {
  margin-bottom: 24px;
}
.search-input {
  width: 100%;
  max-width: 400px;
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
.btn-primary {
  padding: 10px 20px;
  background: var(--accent);
  color: var(--bg);
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.15s;
}
.btn-primary:hover { opacity: 0.85; }
.btn-secondary {
  padding: 10px 20px;
  background: none;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s;
}
.btn-secondary:hover { background: var(--hover); }
.btn-secondary.danger {
  color: #e53e3e;
  border-color: #e53e3e;
}
.btn-secondary.danger:hover {
  background: #fef2f2;
}
.empty {
  text-align: center;
  color: var(--text-secondary);
  padding: 48px 0;
}
.section {
  margin-bottom: 40px;
}
.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.blog-table {
  width: 100%;
  border-collapse: collapse;
}
.blog-table th, .blog-table td {
  text-align: left;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
}
.blog-table th {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}
.blog-table td {
  font-size: 0.95rem;
}
.status.published {
  color: #38a169;
  font-size: 0.85rem;
  font-weight: 500;
}
.status.draft {
  color: #d69e2e;
  font-size: 0.85rem;
  font-weight: 500;
}
.actions {
  display: flex;
  gap: 8px;
}
.action-btn {
  background: none;
  border: none;
  padding: 6px 14px;
  font-size: 0.85rem;
  color: var(--text);
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.15s;
}
.action-btn:hover {
  background: var(--hover);
}
.action-btn.danger {
  color: #e53e3e;
}

/* ---- Mobile ---- */
@media (max-width: 768px) {
  .admin {
    padding: 16px 12px;
  }
  .admin-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .admin-header h1 {
    font-size: 1.3rem;
  }
  .admin-actions {
    flex-wrap: wrap;
    gap: 6px;
  }
  .admin-actions .btn-primary,
  .admin-actions .btn-secondary {
    padding: 8px 14px;
    font-size: 0.85rem;
  }
  .search-input {
    max-width: 100%;
    font-size: 0.9rem;
  }
  .blog-table {
    font-size: 0.8rem;
  }
  .blog-table th,
  .blog-table td {
    padding: 10px 8px;
  }
  .blog-table th:nth-child(2),
  .blog-table td:nth-child(2),
  .blog-table th:nth-child(3),
  .blog-table td:nth-child(3) {
    display: none;
  }
  .actions {
    gap: 4px;
  }
  .action-btn {
    padding: 4px 8px;
    font-size: 0.8rem;
  }
  .section-title {
    font-size: 1rem;
  }
}
</style>
