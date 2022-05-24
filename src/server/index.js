import chalk from 'chalk'
import express from 'express'
import http from 'http'
import { readFileSync } from 'fs-extra'
import reload from 'reload'
import chokidar from 'chokidar'
import { extname, join } from 'path'
import cheerio from 'cheerio'

export const root = (name = '.') => join(process.cwd(), name)

export const createServer = (dir, options = {}) => {
  if (!dir) throw Error('base dir must be set!')
  const { port = 3001, watch = false } = options
  const app = express()
  const baseDir = root(dir)

  app.use(express.static(baseDir, { index: false }))
  app.use(express.static(join(__dirname, '..')))

  app.get('/*', (req, res, next) => {
    const { originalUrl } = req
    if (extname(originalUrl)) return next()
    let html = readFileSync(`${baseDir}/index.html`)

    if (watch) {
      const $ = cheerio.load(html)
      $('body').append(`<script src="/reload/reload.js"></script>`)
      html = $.html()
    }
    return res.send(html)
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
