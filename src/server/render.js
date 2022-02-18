import markdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import hljs from 'highlight.js'
import { join, isAbsolute, extname, normalize, dirname } from 'path'
import { readFileSync, existsSync } from 'fs-extra'

class Render {
  constructor() {
    this.baseDir = process.env.DOCTT_BASE_DIR
  }

  readFile(filePath) {
    const file = join(this.baseDir, filePath)
    if (!existsSync(file)) return ''
    return readFileSync(file, { encoding: 'utf-8' })
  }

  originFile(filePath) {
    return `${decodeURIComponent(filePath)}.md`
  }

  renderSide(file) {
    let sidebar = this.readFile('_sidebar.md')
    const dir = dirname(this.originFile(file))
    //如果子目录有菜单
    const sideContent = this.readFile(`${dir}/_sidebar.md`)
    if (sideContent) sidebar = sideContent
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
        tokens[idx].attrSet('href', href)
      }
      return defaultRender(tokens, idx, options, env, self)
    }
    return md.render(sidebar)
  }

  renderContent(file) {
    if (file === '/') file = 'README'
    const content = this.readFile(this.originFile(file))
    if (!content) return ''
    const md = markdownIt({
      html: true,
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value
          } catch (error) {
            console.log(error)
            return ''
          }
        }
      },
    })
    return md.use(markdownItAnchor).render(content)
  }
}

export default Render
