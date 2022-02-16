import $ from 'dom7/dom7.js'
class Client {
  constructor() {
    this.side = $('.doctt-side')
    this.content = $('.doctt-content')
    this.article = $('.doctt-article')
    this.anchor = $('.doctt-anchor')

    $(window).on('load', () => {
      this.setActive()
      this.insertMenuIcon()
      this.insertAnchor()
    })
  }

  getCurrentLinkDom() {
    const links = this.side.find('a')
    for (let i = 0; i < links.length; i++) {
      const ele = $(links[i])
      const href = ele.attr('href')
      if (decodeURIComponent(href) === decodeURIComponent(location.pathname)) {
        return ele
      }
    }
    return null
  }

  setActive() {
    const link = this.getCurrentLinkDom()
    if (!link) return
    link.addClass('active')
    const { top } = link.offset()
    this.side.scrollTop(top - 300)
    this.setTitle(link.text())
  }

  setTitle(text) {
    const dom = $('head').find('title')
    const title = dom.text()
    dom.text(`${title}-${text}`)
  }

  insertMenuIcon() {
    $(`
      <div class="doctt-menu">
        <div class="doctt-menu-icon"></div>
      </div>
    `).insertBefore(this.side)
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
    const headings = this.article.find('h2,h3')
    if (!headings.length) return
    let ul = '<ul>'
    headings.each(function (ele, index) {
      const title = $(ele).text()
      ul += `<li class="doctt-anchor-item doctt-anchor-${ele.tagName.toLowerCase()}">${title}</li>`
    })
    ul += `</ul>`
    this.anchor.append(ul)
    $('.doctt-anchor-item').on('click', e => {
      this.addAnchorClass($(e.target))
      const index = $(e.target).index()
      headings[index].scrollIntoView({ behavior: 'smooth' })
    })
    this.observerAnchor()
  }

  observerAnchor() {
    const headings = this.article.find('h2,h3')
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

new Client()
