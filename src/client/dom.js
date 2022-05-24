import $ from 'dom7/dom7.js'
import Render from './render'

const ROOT_HTML = `
  <div class="doctt">
    <aside class="doctt-side"></aside>
    <section class="doctt-content">
      <article class="doctt-article"></article>
      <div class="doctt-anchor"></div>
    </section>
  </div>
`

export default class Dom {
  constructor() {
    this.root = $('#app')
    this.root.html(ROOT_HTML)
    this.side = $('.doctt-side')
    this.content = $('.doctt-content')
    this.article = $('.doctt-article')
    this.anchor = $('.doctt-anchor')

    $(window).on('load', this.init.bind(this))
    $(window).on('hashchange', this.insertContent.bind(this))
  }

  async insertContent() {
    const content = await Render.renderContent(location.hash.slice(1))
    this.article.html(content)
    this.setActive()
    this.insertAnchor()
  }

  async insertSide() {
    const side = await Render.renderSide()
    this.side.html(side)
  }

  async init() {
    this.insertSide()
    this.insertMenuIcon()
    this.insertContent()
  }

  setActive() {
    const links = this.side.find('a')
    links.removeClass('active')
    links.each((ele, index) => {
      const href = $(ele).attr('href')
      if (href && href.includes(location.hash)) {
        //当前链接高亮
        $(ele).addClass('active')
        //设置页面标题
        const dom = $('head').find('title')
        const title = dom.text()
        dom.text(`${title}-${$(ele).text()}`)
      }
    })
  }

  insertMenuIcon() {
    $(`
      <div class="doctt-menu">
        <div class="doctt-menu-icon"></div>
      </div>
    `).insertAfter(this.content)
    $('.doctt-menu-icon').on('click', () => {
      this.side.toggleClass('doctt-side-close')
      this.content.toggleClass('doctt-content-close')
    })
  }

  addAnchorClass(dom) {
    $('.doctt-anchor-item').removeClass('doctt-anchor-active')
    dom.addClass('doctt-anchor-active')
  }

  insertAnchor() {
    const headings = this.article.find('h2,h3,h4')
    if (!headings.length) return
    let ul = '<ul>'
    headings.each(function (ele, index) {
      const title = $(ele).text()
      ul += `<li class="doctt-anchor-item doctt-anchor-${ele.tagName.toLowerCase()}">${title}</li>`
    })
    ul += `</ul>`
    this.anchor.html(ul)
    $('.doctt-anchor-item').on('click', e => {
      this.addAnchorClass($(e.target))
      const index = $(e.target).index()
      headings[index].scrollIntoView({ behavior: 'smooth' })
    })
    this.observerAnchor()
  }

  observerAnchor() {
    const headings = this.article.find('h2,h3,h4')
    const observer = new IntersectionObserver(
      entries => {
        const io = entries[0]
        if (io.isIntersecting === true) {
          const index = Array.prototype.indexOf.call(headings, io.target)
          const anchoItem = $('.doctt-anchor-item').eq(index)
          this.addAnchorClass(anchoItem)
          //锚点区域如果高度过出现滚动条则自动滚动到可视区域
          const ul = this.anchor.children('ul')
          if (ul.offsetHeight > 600) {
            const { top } = anchoItem.offset()
            //滚动到距离列表顶部 250 位置
            this.anchor.scrollTo({
              top: top > 580 ? top - 250 : 0,
              behavior: 'smooth',
            })
          }
        }
      },
      { threshold: [1] },
    )
    headings.forEach(node => observer.observe(node))
  }
}
