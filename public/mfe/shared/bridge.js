/*
 * Micro-frontend bridge. Each remote is a standalone document loaded inside a
 * sandboxed iframe by the portfolio (the host). Contract:
 *   host -> remote   { type: 'theme', theme: 'light' | 'dark' }
 *   remote -> host   { source: 'mfe', type: 'ready' }
 *                    { source: 'mfe', type: 'open', href }   (external links)
 * Classic script on purpose: a sandboxed frame has an opaque origin, which
 * rules out ES modules (they need CORS).
 */
;(function () {
  var host = window.parent
  var root = document.documentElement

  function setTheme(theme) {
    if (theme === 'light' || theme === 'dark') root.dataset.theme = theme
  }

  setTheme(new URLSearchParams(location.search).get('theme'))

  window.addEventListener('message', function (event) {
    if (event.source !== host) return
    var data = event.data || {}
    if (data.type === 'theme') setTheme(data.theme)
  })

  function post(message) {
    host.postMessage(Object.assign({ source: 'mfe' }, message), '*')
  }

  // External links never navigate the frame: the host opens them safely.
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href^="http"]')
    if (!link) return
    event.preventDefault()
    post({ type: 'open', href: link.href })
  })

  // Accessible tabs: arrow keys move, Home/End jump, one panel visible at a time.
  function tabs(list) {
    var buttons = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'))
    function select(button, focus) {
      buttons.forEach(function (b) {
        var on = b === button
        b.setAttribute('aria-selected', String(on))
        b.tabIndex = on ? 0 : -1
        document.getElementById(b.getAttribute('aria-controls')).hidden = !on
      })
      if (focus) button.focus()
    }
    buttons.forEach(function (b, i) {
      b.addEventListener('click', function () {
        select(b, false)
      })
      b.addEventListener('keydown', function (e) {
        var next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: buttons.length - 1 }[e.key]
        if (next === undefined) return
        e.preventDefault()
        select(buttons[(next + buttons.length) % buttons.length], true)
      })
    })
    select(buttons[0], false)
  }

  // Repository languages: live from the GitHub API, with the values captured on 2026-10-24 as fallback.
  function languages(target, repo, fallback) {
    function draw(bytes, live) {
      var total = Object.keys(bytes).reduce(function (sum, k) {
        return sum + bytes[k]
      }, 0)
      if (!total) return
      var names = Object.keys(bytes).sort(function (a, b) {
        return bytes[b] - bytes[a]
      })
      var bar = document.createElement('div')
      bar.className = 'bar'
      bar.setAttribute('role', 'img')
      bar.setAttribute('aria-label', 'Linguagens do repositório')
      var legend = document.createElement('ul')
      legend.className = 'legend'
      names.forEach(function (name) {
        var pct = (bytes[name] / total) * 100
        var color = 'var(--lang-' + name.toLowerCase() + ', var(--lang-other))'
        var seg = document.createElement('span')
        seg.style.width = pct + '%'
        seg.style.background = color
        bar.appendChild(seg)
        var li = document.createElement('li')
        var dot = document.createElement('i')
        dot.style.background = color
        li.appendChild(dot)
        li.appendChild(document.createTextNode(name + ' ' + pct.toFixed(1).replace('.', ',') + '%'))
        legend.appendChild(li)
      })
      target.replaceChildren(bar, legend)
      target.dataset.source = live ? 'github-api' : 'snapshot'
    }
    draw(fallback, false)
    fetch('https://api.github.com/repos/gaboel0/' + encodeURIComponent(repo) + '/languages')
      .then(function (r) {
        return r.ok ? r.json() : Promise.reject()
      })
      .then(function (bytes) {
        draw(bytes, true)
      })
      .catch(function () {})
  }

  window.mfe = { post: post, tabs: tabs, languages: languages }

  window.addEventListener('load', function () {
    post({ type: 'ready' })
  })
})()
