import { root } from './utils'
import chalk from 'chalk'
import express from 'express'
import Render from './render'
import http from 'http'
import { readFileSync } from 'fs-extra'
import reload from 'reload'
import chokidar from 'chokidar'
import { extname, join } from 'path'
import cheerio from 'cheerio'

export const createServer = (dir, options = {}) => {
  if (!dir) throw Error('base dir must be set!')
  const { port = 3001, watch = false } = options
  const app = express()
  const baseDir = root(dir)
  process.env.DOCTT_BASE_DIR = baseDir

  app.use(express.static(baseDir, { index: false }))
  app.use(express.static(join(__dirname, '..')))

  const render = new Render()
  app.get('/*', (req, res, next) => {
    const { originalUrl } = req
    if (extname(originalUrl)) return next()
    const html = render.readFile('index.html')
    const side = render.renderSide(originalUrl)
    const content =
      render.renderContent(originalUrl) || '<div class="error_404">404 NOT FOUND</div>'
    let data = html.replace(
      '<!--DOCTT-->',
      `
      <div class="doctt">
        <aside class="doctt-side">${side}</aside>
        <section class="doctt-content">
          <article class="doctt-article">${content}</article>
          <div class="doctt-anchor"></div>
        </section>
      </div>
    `,
    )
    if (watch) {
      const $ = cheerio.load(data)
      $('body').append(`<script src="/reload/reload.js"></script>`)
      data = $.html()
    }
    return res.send(data)
  })

  const startServer = () => {
    http.createServer(app).listen(port, () => {
      console.log(chalk.green(`Serving at http://127.0.0.1:${port}`))
    })
  }
  if (watch) {
    reload(app)
      .then(reloadReturned => {
        startServer()
        console.log(`watch files in ${baseDir}`)
        chokidar.watch(baseDir).on('all', (event, path) => {
          reloadReturned.reload()
        })
      })
      .catch(err => {
        console.error('Reload could not start, could not start server', err)
      })
  } else {
    startServer()
  }
}
