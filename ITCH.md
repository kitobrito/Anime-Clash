# itch.io HTML upload

Upload `dist/Anime-Clash-itch.zip` as an **HTML** game and select **This file will be played in the browser**. `index.html` is at the ZIP root. The build includes both Naruto and One Piece and needs no Node server, installation, or build process on itch.io.

Recommended settings:

- Embed dimensions: **1280 × 720**.
- Enable the fullscreen button.
- Mark the game as mobile friendly. The game owns its internal vertical scroll area and does not depend on the itch page or iframe scrolling setting.
- The game adapts to portrait mobile viewports. Vertical game scrolling and horizontal battle-hand swiping are intentional.

Artwork stays at **512 × 512** independently of the embed dimensions. Collections and decks are stored in the visitor's browser; storage is tied to the game's origin and browser. Local AI practice is available. Online multiplayer and account systems are not connected in this build.

For local preview, extract `Anime-Clash-source.zip`, run `npm start`, and open `http://localhost:8080`. Run `npm test` for engine checks or `npm run package` to recreate both ZIPs (Python 3 required only for packaging).

The Boards tab offers portrait (9:16), landscape (16:9), or automatic orientation. Both orientations have animated interactive corners. Sound is opt-in. The new ZIP must replace the previous HTML upload for the iPhone scrolling fix to take effect; reload the game after replacing it.

## Automatic publishing

Every change merged into `main` rebuilds the zip (`.github/workflows/itch-build.yml`) and attaches it to the `itch-latest` GitHub release. To have it pushed to the itch page automatically, add in the repository's Settings → Secrets and variables → Actions:

- Secret `BUTLER_API_KEY`: an itch.io API key (itch.io → Settings → API keys).
- The page is already set to `fadeawaytoday/anime-clash` (an `ITCH_GAME` variable can override it).
