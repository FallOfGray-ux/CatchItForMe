# Catch It For Me 🐭

A sarcastic cat brings you a mouse and refuses to catch it. Your job: tap the mouse before it escapes. Mobile-first, hackathon-ready.

## Run it locally

No build step, no npm. Two options:

### Option 1 — Open directly
Just double-click `index.html`. It loads React + Babel from a CDN.
> Some browsers block `file://` CDN fetches. If you see a blank page, use Option 2.

### Option 2 — Tiny local server (recommended)
From this folder:

```bash
# Python 3
python3 -m http.server 5173
# or Node
npx serve .
```

Then open `http://localhost:5173` on your phone (same Wi-Fi) or desktop.

To test the mobile feel in a desktop browser, open DevTools → device toolbar (⌘⇧M / Ctrl+Shift+M) → pick an iPhone/Pixel preset.

## Project structure

```
catch-it-for-me/
├── index.html      # Shell — loads React, Babel, styles, and app.jsx
├── styles.css      # All styling (mobile-first, bright palette, shake/bubble animations)
├── app.jsx         # All React components + game logic (single-file, clearly sectioned)
└── README.md
```

Everything is in one JSX file but split into labeled sections that act as components:

1. Constants & content (cat lines, skins, backgrounds, sound packs)
2. Sound helper (Web Audio — no asset files)
3. `CatCharacter` — sarcastic cat + speech bubble
4. `Mouse` — the tappable prey
5. `HomeScreen`
6. `GameScreen` — timer, random jumps, rare-mouse spawn
7. `ResultScreen` — win / fail + share
8. `ShopScreen` — Skins / Backgrounds / Sounds tabs
9. `App` — state, persistence (localStorage)

## Gameplay notes

- Round length: random 5–10 seconds
- Mouse jumps every ~500–1200ms (faster each round, floor of 300ms)
- Rare (gold) mouse: ~12% chance per round → +50 coins (vs +10)
- Streak bonus: +2 coins per consecutive win (capped +20); resets on fail or when you return to Home
- Coins + unlocks persist via `localStorage`

## Shop

- **Skins**: Default (free), Business (100), Vampire (250), DJ (500)
- **Backgrounds**: Basic (free), Luxury (150), Haunted (300), Neon (600)
- **Sound packs**: Default (free), Meme (200), Techno (400) — changes synth waveform

Buying auto-equips. You can re-equip anything you already own from the shop.

## Stretch goals included

- Tap sound effect (Web Audio)
- Shake animation on fail
- Share result button (uses Web Share API, falls back to clipboard)

## Swap emoji art for real art

Every cat skin and mouse uses an emoji as placeholder. To use actual images, replace the `emoji` field in `CAT_SKINS` with an image URL and render an `<img>` inside `CatCharacter` / `Mouse` instead of a text node.
