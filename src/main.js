/* ============================================================
   UI logic: navbar, scroll reveal, stat counters, contact form
   (frontend-only demo) and the Three.js hero init.
   ============================================================ */

import './style.css'
import { initScene } from './scene.js'

/* ---------- 3D hero ---------- */
const canvas = document.getElementById('bg-canvas')
if (canvas) initScene(canvas)

/* ---------- Footer year ---------- */
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = new Date().getFullYear()

/* ---------- Navbar: scrolled state + mobile menu ---------- */
const nav = document.getElementById('nav')
const navToggle = document.getElementById('nav-toggle')
const navLinks = document.getElementById('nav-links')

const onScroll = () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 24)
}
onScroll()
window.addEventListener('scroll', onScroll, { passive: true })

const closeMenu = () => {
  nav.classList.remove('is-open')
  navToggle.setAttribute('aria-expanded', 'false')
  navToggle.setAttribute('aria-label', 'Apri menu')
}

navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open')
  navToggle.setAttribute('aria-expanded', String(open))
  navToggle.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu')
})

// Close the mobile menu after tapping a link.
navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu))

// Close on Escape.
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu()
})

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal')
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
          if (entry.target.querySelector('[data-count]')) runCounters(entry.target)
        }
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  )
  revealEls.forEach((el) => io.observe(el))
} else {
  // Fallback: just show everything.
  revealEls.forEach((el) => el.classList.add('is-visible'))
  document.querySelectorAll('[data-count]').forEach((el) => (el.textContent = el.dataset.count))
}

/* ---------- Animated stat counters ---------- */
function runCounters(scope) {
  scope.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseInt(el.dataset.count, 10)
    if (Number.isNaN(target)) return
    const duration = 1400
    const start = performance.now()
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
      el.textContent = Math.round(eased * target).toString()
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })
}

/* ---------- Contact form (frontend-only demo) ---------- */
const form = document.getElementById('contact-form')
const statusEl = document.getElementById('form-status')
const submitBtn = document.getElementById('submit-btn')

const validators = {
  name: (v) => (v.trim().length >= 2 ? '' : 'Inserisci il tuo nome.'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Inserisci un indirizzo email valido.'),
  subject: (v) => (v.trim().length >= 3 ? '' : 'Aggiungi un oggetto.'),
  message: (v) => (v.trim().length >= 10 ? '' : 'Il messaggio deve avere almeno 10 caratteri.')
}

function setFieldError(name, msg) {
  const field = form.querySelector(`[name="${name}"]`).closest('.field')
  const errorEl = form.querySelector(`.field__error[data-for="${name}"]`)
  field.classList.toggle('is-invalid', Boolean(msg))
  errorEl.textContent = msg
}

function validateField(name) {
  const input = form.querySelector(`[name="${name}"]`)
  const msg = validators[name](input.value)
  setFieldError(name, msg)
  return !msg
}

// Live-clear errors as the user fixes a field.
Object.keys(validators).forEach((name) => {
  const input = form.querySelector(`[name="${name}"]`)
  input.addEventListener('input', () => {
    if (input.closest('.field').classList.contains('is-invalid')) validateField(name)
  })
})

form.addEventListener('submit', (e) => {
  e.preventDefault()
  statusEl.textContent = ''
  statusEl.className = 'form__status'

  const allValid = Object.keys(validators).map(validateField).every(Boolean)
  if (!allValid) {
    statusEl.textContent = 'Controlla i campi evidenziati.'
    statusEl.classList.add('is-error')
    return
  }

  // --- DEMO ONLY: no real request is sent. ---
  // To make this live, POST `new FormData(form)` to a service like
  // Formspree/EmailJS or your own endpoint here.
  submitBtn.disabled = true
  submitBtn.textContent = 'Invio in corso…'

  setTimeout(() => {
    submitBtn.disabled = false
    submitBtn.textContent = 'Invia richiesta'
    form.reset()
    statusEl.textContent = '✓ Grazie! Messaggio ricevuto (demo). Ti risponderò entro 24 ore.'
    statusEl.classList.add('is-success')
  }, 1100)
})
