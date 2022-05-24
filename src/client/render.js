import markdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import hljs from 'highlight.js'
import { extname, normalize, isAbsolute, join } from 'path'

class Render {
  constructor() {}

  async readFile(filePath) {
    const res = await fetch(filePath)
    return await res.text()
  }

  async renderSide(file) {
    const sidebar = await this.readFile('_sidebar.md')
    const md = markdownIt({ html: true })
    const defaultRender =
      md.renderer.rules.link_open ||
      function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options)
      }
    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      let href = tokens[idx].attrGet('href')
      if (!/^https?/.test(href)) {
        href = normalize(href).replace(extname(href), '')
        if (!href.startsWith('/')) href = '/' + href
        tokens[idx].attrSet('href', `/#${href}`)
      }
      return defaultRender(tokens, idx, options, env, self)
    }
    return md.render(sidebar)
  }

  async renderContent(file) {
    if (!file) {
      file = 'README.md'
    } else {
      file = decodeURIComponent(file)
      if (!extname(file)) file += '.md'
    }
    const content = await this.readFile(file)
    const md = markdownIt({
      html: true,
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value
          } catch (error) {
            console.log(error)
          }
        }
      },
    })
    const defaultRender =
      md.renderer.rules.image ||
      function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options)
      }
    md.renderer.rules.image = function (tokens, idx, options, env, self) {
      const src = tokens[idx].attrGet('src')
      if (!isAbsolute(src)) {
        tokens[idx].attrSet('src', join(location.hash.slice(1), '..', src))
      }
      return defaultRender(tokens, idx, options, env, self)
    }
    return md.use(markdownItAnchor).render(content)
  }
}

export default new Render()
