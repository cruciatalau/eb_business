/* ============================================================
   Med Data Hub product page: shared site logic (navbar, reveal,
   contact form, 3D background) plus the feature tabs and the
   screenshot lightbox.
   ============================================================ */

import './main.js'
import './mdh.css'

/* ---------- Feature showcase (tabs) ---------- */
// Without JS every panel stays visible, one under the other.
document.querySelectorAll('[data-showcase]').forEach((showcase) => {
  const tabs = Array.from(showcase.querySelectorAll('[role="tab"]'))
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')))

  const select = (index, focus) => {
    tabs.forEach((tab, i) => {
      const active = i === index
      tab.setAttribute('aria-selected', String(active))
      tab.tabIndex = active ? 0 : -1
      panels[i].hidden = !active
    })
    if (focus) {
      tabs[index].focus()
      tabs[index].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
    }
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i, false))
    tab.addEventListener('keydown', (e) => {
      const last = tabs.length - 1
      let next = null
      if (e.key === 'ArrowRight') next = i === last ? 0 : i + 1
      else if (e.key === 'ArrowLeft') next = i === 0 ? last : i - 1
      else if (e.key === 'Home') next = 0
      else if (e.key === 'End') next = last
      if (next === null) return
      e.preventDefault()
      select(next, true)
    })
  })

  select(0, false)
  showcase.classList.add('is-ready')
})

/* ---------- Screenshot lightbox ---------- */
const lightbox = document.getElementById('lightbox')
const lightboxImg = document.getElementById('lightbox-img')

if (lightbox && lightboxImg && typeof lightbox.showModal === 'function') {
  document.querySelectorAll('[data-zoom]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const img = trigger.querySelector('img')
      if (!img) return
      lightboxImg.src = img.currentSrc || img.src
      lightboxImg.alt = img.alt
      lightbox.showModal()
    })
  })

  // Clicking anywhere (image, backdrop or the close button) closes it.
  lightbox.addEventListener('click', () => lightbox.close())
  lightbox.addEventListener('close', () => lightboxImg.removeAttribute('src'))
} else {
  // No <dialog> support: the screenshots are simply not zoomable.
  document.querySelectorAll('[data-zoom]').forEach((trigger) => {
    trigger.style.cursor = 'default'
  })
}
