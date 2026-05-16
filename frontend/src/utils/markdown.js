import MarkdownIt from 'markdown-it'
import katex from 'katex'
import hljs from 'highlight.js'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch {}
    }
    return ''
  },
})

// Inline LaTeX: $...$
md.inline.ruler.before('escape', 'math_inline', (state, silent) => {
  const start = state.pos
  if (state.src[start] !== '$') return false
  const end = state.src.indexOf('$', start + 1)
  if (end === -1) return false
  if (!silent) {
    const token = state.push('math_inline', '', 0)
    token.content = state.src.slice(start + 1, end)
    token.markup = '$'
  }
  state.pos = end + 1
  return true
})

md.renderer.rules.math_inline = (tokens, idx) => {
  try {
    return katex.renderToString(tokens[idx].content, { throwOnError: false, displayMode: false })
  } catch {
    return `<code>${tokens[idx].content}</code>`
  }
}

// Block LaTeX: $$...$$
md.block.ruler.before('fence', 'math_block', (state, startLine, endLine, silent) => {
  const line = state.getLines(startLine, startLine + 1, 0, false)
  if (!line || !line.startsWith('$$')) return false
  const end = state.getLines(startLine + 1, -1, 0, false)
  const endIdx = end ? end.indexOf('$$') : -1
  if (endIdx === -1) return false
  if (!silent) {
    const token = state.push('math_block', '', 0)
    token.content = line.slice(2) + '\n' + end.slice(0, endIdx)
  }
  state.line += 2
  return true
})

md.renderer.rules.math_block = (tokens, idx) => {
  try {
    return katex.renderToString(tokens[idx].content + '\n', { throwOnError: false, displayMode: true })
  } catch {
    return `<pre><code>${tokens[idx].content}</code></pre>`
  }
}

function splitCodeBlocks(content) {
  // Split by fenced code blocks (```...```) so we only transform non-code text
  const parts = content.split(/(```[\s\S]*?```)/g)
  return {
    parts,
    processNonCode(fn) {
      return parts.map((part, i) => (i % 2 === 0 ? fn(part) : part)).join('')
    },
  }
}

function preserveSpaces(content) {
  const { processNonCode } = splitCodeBlocks(content)
  return processNonCode((text) =>
    text.replace(/ {2,}/g, (match) => ' &nbsp;'.repeat(match.length - 1))
  )
}

function preserveBlankLines(content) {
  const { processNonCode } = splitCodeBlocks(content)
  return processNonCode((text) =>
    text.replace(/\n{3,}/g, (match) =>
      '\n\n' + '<br>\n'.repeat(match.length - 2) + '\n'
    )
  )
}

function normalize(content) {
  return content.replace(/\r\n/g, '\n')
}

export function renderMarkdown(content) {
  let text = normalize(content || '')
  text = preserveSpaces(text)
  text = preserveBlankLines(text)
  return md.render(text)
}

export default md
