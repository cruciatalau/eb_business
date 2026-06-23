# John Doe — Portfolio

Sito personale per uno sviluppatore software freelance. Tema dark con accent
arancio, sfondo 3D in **Three.js** (griglia wireframe synthwave ondulata, con
bloom), full responsive e form di contatto.

## Avvio

```bash
npm install
npm run start    # dev server con hot reload su http://localhost:3013 (apre il browser)
npm run build    # build di produzione in /dist
npm run preview  # anteprima della build
```

> **Nota su Node:** il progetto è fissato a **Vite 2.9** e **Three r149** per
> restare compatibile con la tua versione di Node (v14). Quando aggiorni Node a
> 18+ (consigliato, v14 è EOL) puoi passare a Vite 5 e a una Three più recente.

## Struttura

```
index.html             markup e sezioni (hero, about, servizi, progetti, contatti)
src/style.css          tema, layout responsive, animazioni
src/main.js            navbar, scroll-reveal, contatori, logica del form
src/scene.js           orchestratore 3D (renderer, bloom, loop, resize)
src/backgrounds/
  wavegrid.js          sfondo: griglia wireframe synthwave
  shaders.js           noise GLSL condiviso
```

## Personalizzazione rapida

- **Colori:** variabili CSS in cima a `src/style.css` (`--accent`, `--bg`, …).
  I colori della griglia 3D sono in `src/backgrounds/wavegrid.js` negli uniform
  `uColorNear` / `uColorFar`.
- **Testi/progetti:** modifica direttamente `index.html` (sono placeholder).
- **Effetto 3D:** parametri in `src/backgrounds/wavegrid.js` — ampiezza/velocità
  delle onde nel vertex shader e i valori del `UnrealBloomPass` (forza/raggio/soglia).

## Form di contatto (importante)

Attualmente è una **demo frontend**: valida i campi e mostra un messaggio di
successo, ma **non invia nulla**. Per renderlo reale, nel blocco `form.addEventListener('submit', …)`
di `src/main.js` sostituisci il `setTimeout` con una vera chiamata, es. Formspree:

```js
await fetch('https://formspree.io/f/IL_TUO_ID', {
  method: 'POST',
  body: new FormData(form),
  headers: { Accept: 'application/json' }
})
```
