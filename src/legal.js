/* ============================================================
   Legal pages (privacy policy): static text only, so no 3D
   background, contact form or EmailJS — just the shared styles.
   ============================================================ */

import './style.css'
import './legal.css'

const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = new Date().getFullYear()
