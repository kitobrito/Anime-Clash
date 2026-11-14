# Animated environments

The dependency-free Canvas/SVG renderer in `src/boards/scene.js` remains the common renderer. Its existing Naruto and One Piece artwork, play rectangles, and mechanics are preserved. All six themes can be selected from **Boards** or the board selector during a match, independently of deck faction. Two separate Tokyo Ghoul layouts use the four supplied originals.

## Configuration and rendering

`catalog.js` defines board identity, native portrait/landscape assets, protected play surface, and four primary interaction contours. The Sunny lion is an existing secondary interaction. `tokyo-config.js` adds independently traced source-pixel contours, articulated parts, pivots, sequence IDs, sound IDs, duration, cooldown and rare-event configuration. New board definitions can use the same contract; `validateEnvironment` checks its four-corner structure.

`TokyoRig` extracts the original object pixels into separate Canvas layers. AI underpainting is used **only inside the exact masks behind moving pieces**. The rest of the original remains intact. The center is restored from the original and all particles and lighting are clipped out of the card-placement rectangle. Generated full-board plates are never displayed as replacement boards. If an underpainting fails, the original remains visible and shaped interactions fall back to local lighting effects, with a diagnostic `data-asset-fallback` attribute.

The Gourmet board has lid lift/reveal/mist, rotating glowing mask, chandelier crystal swing with sparks and lighting dip, and hinged door with interior eyes. Cochlea has Quinque arcing, a lunging cell silhouette with impact pulse, lever movement with monitor warnings, and specimen expansion with bubbles and tube energy. All use anticipation, easing and a return to rest. Corners have independent cooldowns covering the entire sequence plus 650ms. Pointer drags and scroll gestures do not activate them. Keyboard Enter/Space works on the same shaped controls.

## Lifecycle and performance

One existing requestAnimationFrame loop drives effects. `environment.js` supplies a fixed-capacity reusable particle pool and quality profiles: high up to 60fps / 80 particles / 1.5 DPR, low up to 30fps / 36 particles / 1 DPR. Automatic mode selects a lower budget on small-memory/fewer-core devices and can lower Canvas resolution after sustained expensive frames. Quality is adjustable and saved. These are budgets, not a guarantee of measured 60fps on every device.

Intersection and document visibility pause effects and Web Animations. Reparenting the same scene during UI updates preserves interactions. Board changes destroy the old scene, observers, animation handles, sound resources and particle state. `setActivity(true)` suppresses idle movement and postpones rare events while selecting cards/targets or resolving a pending decision. Reduced motion disables idle drift, swinging and rare events and substitutes a short stationary illumination response. Rare events are decorative, silent, wait 65–115 seconds of visible unoccupied time and never update game state.

## Audio and remaining optional assets

The existing sound toggle controls board audio and defaults off. No autoplay occurs. `audio-assets.js` declares eight hook IDs with an intentionally empty asset map; register licensed clips as `{src, volume}`. Only a user activation can play a configured clip, one foreground clip at a time, with a 500ms sound debounce and maximum 0.35 volume. A `board-audio-request` event exposes the requested ID and availability. **No recorded clink, creak, chain, whisper, electrical, impact, alarm or bubbling assets were supplied, so these Tokyo Ghoul sounds are hooks only.** Existing older-board synthesized sounds are preserved.

The four primary interactions have usable source layers and prepared underpainting. Further art needed for optional detail: independently painted spectator heads/neck backgrounds for convincing head turns; an actual security-camera sprite and mount (none is clearly separable in these paintings); extra door Kagune and tank appendage sprites for the optional rare variants. Until supplied, spectators use localized eye glints and rare events use existing masks or cell silhouettes. These missing optional layers are not represented as finished articulated animations.

## Verification

`npm test` includes configuration, mapping, cooldown, assets, particle reuse, quality and all existing gameplay suites. `node tools/test-boards-browser.mjs` runs optional Playwright integration checks (install Playwright separately or pass `PLAYWRIGHT_MODULE`), against the running app at `BOARD_TEST_URL` (default http://127.0.0.1:4173). It exercises all sixteen Tokyo Ghoul corner/layout combinations, desktop clicks, mobile taps, cooldowns, reset, resizing, gameplay pass-through, rare events, mute, reduced motion, missing optional assets and disposal. Screenshots are written to `dist/board-checks/`.
