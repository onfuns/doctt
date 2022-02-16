import { join } from 'path'
import cheerio from 'cheerio'

export const root = (name = '.') => join(process.cwd(), name)
export const parseHtml = html => {
  const $ = cheerio.load(html)
  $('h1,h2,h3,h4,h5,h6').each(function (index, ele) {
    const text = $(this).text()
    $(this).html(`<span>${text}</span>`)
  })
  return $.html()
}
