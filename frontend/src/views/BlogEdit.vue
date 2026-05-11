<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import { renderMarkdown } from '@/utils/markdown'

const route = useRoute()
const router = useRouter()

const editId = route.params.id
const title = ref('')
const content = ref('')
const saving = ref(false)
const importing = ref(false)
const saved = ref(false)

onMounted(async () => {
  if (editId) {
    try {
      const { data } = await api.get(`/blog/${editId}`)
      title.value = data.title
      content.value = data.content
    } catch {}
  }
})

const previewHtml = computed(() => renderMarkdown(content.value))

async function save(publish = false) {
  if (!title.value.trim() || saving.value) return
  saving.value = true
  const payload = {
    title: title.value,
    content: content.value,
    published: publish ? 1 : 0,
  }
  try {
    if (editId) {
      await api.put(`/blog/${editId}`, payload)
    } else {
      const { data } = await api.post('/blog', payload)
      router.replace(`/admin/blog/${data.id}/edit`)
    }
    if (publish) {
      saved.value = true
      setTimeout(() => router.push('/admin'), 600)
    }
  } catch {}
  saving.value = false
}

async function importFile() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.txt,.md,.docx'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    importing.value = true
    const formData = new FormData()
    formData.append('file', file)
    try {
      const { data } = await api.post('/upload/parse', formData)
      title.value = data.title
      content.value = data.content
    } catch {}
    importing.value = false
  }
  input.click()
}
</script>

<template>
  <div class="blog-edit">
    <div class="edit-header">
      <input
        v-model="title"
        type="text"
        placeholder="博客标题"
        class="title-input"
      />
      <div class="edit-actions">
        <button class="btn-secondary" @click="importFile" :disabled="importing">
          {{ importing ? '解析中...' : '导入文档' }}
        </button>
        <button class="btn-secondary" @click="save(false)" :disabled="saving">
          {{ saving ? '保存中...' : '保存草稿' }}
        </button>
        <button class="btn-primary" @click="save(true)" :disabled="saving">
          {{ saving ? '发布中...' : '发布' }}
        </button>
        <router-link to="/admin" class="btn-secondary">返回</router-link>
      </div>
    </div>

    <div v-if="saved" class="success-overlay">
      <div class="success-card">
        <div class="success-icon">✓</div>
        <p>博客已发布成功！</p>
      </div>
    </div>

    <div class="editor-container">
      <div class="editor-pane">
        <textarea
          v-model="content"
          placeholder="在此输入 Markdown 内容..."
          class="editor-textarea"
        ></textarea>
      </div>
      <div class="preview-pane">
        <div class="preview-content" v-html="previewHtml"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-edit {
  min-height: 100vh;
  background: var(--bg);
  padding: 24px;
  display: flex;
  flex-direction: column;
}
.edit-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}
.title-input {
  flex: 1;
  min-width: 200px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 1.1rem;
  background: var(--bg);
  color: var(--text);
  outline: none;
  font-family: var(--sans);
}
.title-input:focus {
  border-color: var(--accent);
}
.edit-actions {
  display: flex;
  gap: 8px;
}
.btn-primary {
  padding: 10px 20px;
  background: var(--accent);
  color: var(--bg);
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 500;
  transition: opacity 0.15s;
}
.btn-primary:hover:not(:disabled) { opacity: 0.85; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary {
  padding: 10px 20px;
  background: none;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s;
}
.btn-secondary:hover { background: var(--hover); }

.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.success-card {
  background: var(--bg);
  padding: 48px 64px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 12px 40px rgba(0,0,0,0.2);
}
.success-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #38a169;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  margin: 0 auto 16px;
}
.success-card p {
  font-size: 1.1rem;
  color: var(--text);
  margin: 0;
}

.editor-container {
  display: flex;
  flex: 1;
  gap: 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  min-height: 500px;
}
.editor-pane, .preview-pane {
  flex: 1;
  overflow-y: auto;
}
.editor-pane {
  border-right: 1px solid var(--border);
}
.editor-textarea {
  width: 100%;
  height: 100%;
  min-height: 500px;
  padding: 20px;
  border: none;
  resize: none;
  font-family: var(--mono);
  font-size: 0.95rem;
  line-height: 1.7;
  background: var(--bg);
  color: var(--text);
  outline: none;
}
.preview-pane {
  padding: 20px;
  background: var(--bg);
}
.preview-content {
  line-height: 1.8;
  max-width: 720px;
}
.preview-content :deep(p) {
  margin: 0 0 1em;
}
.preview-content :deep(br) {
  display: block;
  margin-top: 0.4em;
}
.preview-content :deep(h1),
.preview-content :deep(h2),
.preview-content :deep(h3),
.preview-content :deep(h4) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}
@media (max-width: 768px) {
  .blog-edit {
    padding: 12px;
  }
  .edit-header {
    flex-direction: column;
  }
  .title-input {
    font-size: 1rem;
  }
  .edit-actions {
    flex-wrap: wrap;
  }
  .btn-primary, .btn-secondary {
    padding: 8px 14px;
    font-size: 0.85rem;
  }
  .editor-container {
    flex-direction: column;
  }
  .editor-pane {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  .editor-textarea {
    min-height: 300px;
    font-size: 0.9rem;
  }
  .preview-content {
    max-width: 100%;
  }
}
</style>
