# ECHOFORM

**ECHOFORM** is a browser-based procedural sound lab. It generates synthetic, voice-like textures from oscillators, filtered noise, formant-style resonances and modulation. It does not use human voice recordings, upload audio, or attempt to recognize speech.

## Features

- Real-time Web Audio synthesis with a waveform display
- Mutable sound genome: fundamental, formant resonances, noise, motion and articulation
- Evolution via parameter mutation
- Auto-evolution
- Local snapshots stored in browser localStorage
- Export genome as JSON
- Responsive interface; no build step or external JavaScript dependencies

## Run locally

Open `index.html` in a modern browser. If local-file restrictions interfere, run a static server from this directory (for example, `python -m http.server 8000`) and open `http://localhost:8000`.

## Publish on GitHub Pages

This repository includes a GitHub Actions workflow at `.github/workflows/pages.yml`.

1. Push the files to the `main` branch.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, select **GitHub Actions** as the source.
4. Open the **Actions** tab and wait for “Deploy ECHOFORM to GitHub Pages” to finish.
5. Your site should appear at `https://miguelog1813-source.github.io/ECHOFORM/`.

## How evolution works

Each specimen is a parameter object (a “genome”). The Evolve button mutates a subset of its parameters. This is intentionally a sound-design playground, not a true evolutionary speech model: it does not measure whether a sound resembles human speech, and the generated output is not intelligible language.

## Privacy

Audio is generated in the browser. Snapshots remain in the current browser's local storage unless you export them manually. No analytics or server calls are included in the app code. Google Fonts are referenced by CSS for typography; the rest of the app works without them if offline.

## License

MIT. See `LICENSE`.
