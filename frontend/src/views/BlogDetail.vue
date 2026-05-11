<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'
import { renderMarkdown } from '@/utils/markdown'

const route = useRoute()
const authStore = useAuthStore()
const blog = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get(`/blog/${route.params.id}`)
    blog.value = data
  } catch {}
  loading.value = false
})

const renderedContent = computed(() => {
  if (!blog.value) return ''
  return renderMarkdown(blog.value.content)
})

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>

<template>
  <div class="blog-detail">
    <div v-if="loading" class="empty">加载中...</div>
    <div v-else-if="!blog" class="empty">博客不存在</div>
    <template v-else>
      <div class="top-bar">
        <router-link to="/" class="back-link">← 返回首页</router-link>
        <router-link
          v-if="authStore.isLoggedIn"
          :to="`/admin/blog/${blog.id}/edit`"
          class="edit-btn"
        >编辑</router-link>
      </div>
      <h1 class="title">{{ blog.title }}</h1>
      <div class="meta">
        <span>发布于 {{ formatDate(blog.created_at) }}</span>
        <span v-if="blog.updated_at !== blog.created_at">
          · 更新于 {{ formatDate(blog.updated_at) }}
        </span>
      </div>
      <div class="content" v-html="renderedContent"></div>
    </template>
  </div>
</template>

<style scoped>
.blog-detail {
  max-width: 1200px;
  margin: 0 auto;
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.back-link {
  font-size: 0.95rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.15s;
}
.back-link:hover {
  color: var(--text);
}
.edit-btn {
  padding: 6px 18px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.9rem;
  color: var(--text);
  text-decoration: none;
  transition: background 0.15s;
}
.edit-btn:hover {
  background: var(--hover);
}
.empty {
  text-align: center;
  color: var(--text-secondary);
  padding: 48px 0;
}
.title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 8px;
}
.meta {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 36px;
}
.content {
  line-height: 1.9;
  font-size: 1.05rem;
}
.content :deep(p) {
  margin: 0 0 1em;
}
.content :deep(br) {
  display: block;
  margin-top: 0.4em;
}
.content :deep(h1),
.content :deep(h2),
.content :deep(h3),
.content :deep(h4) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}
.content :deep(pre) {
  background: var(--muted);
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
}
.content :deep(code) {
  font-family: var(--mono);
  font-size: 0.9rem;
}
.content :deep(img) {
  max-width: 100%;
}
.content :deep(blockquote) {
  margin: 0;
  padding-left: 16px;
  border-left: 3px solid var(--border);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .blog-detail {
    max-width: 100%;
  }
  .title {
    font-size: 1.4rem;
  }
  .content {
    font-size: 0.95rem;
    line-height: 1.8;
  }
  .top-bar {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
