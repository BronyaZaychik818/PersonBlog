<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'

const route = useRoute()
const blogs = ref([])
const loading = ref(true)
const mode = ref('all')
const searchQuery = ref('')

onMounted(() => {
  const q = route.query
  mode.value = q.mode || 'all'
  searchQuery.value = q.q || ''
  if (q.q) {
    searchLocal(q.q)
  } else {
    loadBlogs()
  }
})

watch(() => route.query, (q) => {
  mode.value = q.mode || 'all'
  searchQuery.value = q.q || ''
  if (q.q) {
    searchLocal(q.q)
  } else {
    loadBlogs()
  }
})

async function loadBlogs() {
  loading.value = true
  try {
    let url = '/blog/list'
    if (mode.value === 'recent') url = '/blog/recent'
    const { data } = await api.get(url)
    blogs.value = data
  } catch {
    blogs.value = []
  }
  loading.value = false
}

async function searchLocal(q) {
  loading.value = true
  try {
    const { data } = await api.get(`/blog/search?q=${encodeURIComponent(q)}`)
    blogs.value = data
  } catch {
    blogs.value = []
  }
  loading.value = false
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>

<template>
  <div class="blog-list">
    <div v-if="loading" class="empty">加载中...</div>

    <!-- TOC mode: title-only list -->
    <template v-else-if="mode === 'toc'">
      <div v-if="blogs.length === 0" class="empty">暂无文章</div>
      <ul v-else class="toc-list">
        <li v-for="blog in blogs" :key="blog.id">
          <router-link :to="`/blog/${blog.id}`" class="toc-link">
            <span class="toc-title">{{ blog.title }}</span>
            <span class="toc-date">{{ formatDate(blog.created_at) }}</span>
          </router-link>
        </li>
      </ul>
    </template>

    <!-- Normal / recent / search results -->
    <template v-else>
      <div v-if="searchQuery" class="search-hint">
        搜索 "{{ searchQuery }}" 的结果（{{ blogs.length }} 篇）
      </div>
      <div v-if="blogs.length === 0" class="empty">
        {{ searchQuery ? '未找到匹配文章' : mode === 'recent' ? '最近 30 天暂无文章' : '暂无博客' }}
      </div>
      <router-link
        v-for="blog in blogs"
        :key="blog.id"
        :to="`/blog/${blog.id}`"
        class="blog-card"
      >
        <span class="blog-title">{{ blog.title }}</span>
        <div class="blog-meta">{{ formatDate(blog.created_at) }}</div>
        <p v-if="blog.summary" class="blog-summary">{{ blog.summary }}</p>
      </router-link>
    </template>
  </div>
</template>

<style scoped>
.blog-list {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.empty {
  text-align: center;
  color: var(--text-secondary);
  padding: 48px 0;
}
.search-hint {
  font-size: 0.9rem;
  color: var(--text-secondary);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

/* Cards */
.blog-card {
  display: block;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.15s;
}
.blog-card:hover {
  opacity: 0.7;
}
.blog-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text);
}
.blog-meta {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 4px 0;
}
.blog-summary {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: 8px;
  line-height: 1.5;
}

/* TOC */
.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.toc-list li {
  border-bottom: 1px solid var(--border);
}
.toc-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  color: var(--text);
  text-decoration: none;
  transition: color 0.15s;
}
.toc-link:hover {
  color: var(--text-secondary);
}
.toc-title {
  font-size: 1rem;
  font-weight: 500;
}
.toc-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: nowrap;
  margin-left: 16px;
}

@media (max-width: 768px) {
  .blog-list {
    max-width: 100%;
    gap: 16px;
  }
  .blog-title {
    font-size: 1rem;
  }
  .blog-summary {
    font-size: 0.85rem;
  }
  .toc-link {
    padding: 10px 0;
  }
  .toc-title {
    font-size: 0.95rem;
  }
}
</style>
