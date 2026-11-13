# Anime Clash — Naruto & One Piece

A separate anime card game derived from [Shattered Realms TCG](https://github.com/kitobrito/Shattered-Realms-TCG), based on source commit `4c51640`. **Anime Clash** is a working title. The original repository is untouched. This repository contains only the standalone anime game.

## Play or upload

- **itch.io build:** `dist/Anime-Clash-itch.zip`; upload as HTML with `index.html` at the root. Recommended embed: **1280 × 720**, fullscreen enabled. See `ITCH.md`.
- **Source:** `dist/Anime-Clash-source.zip`. Node.js 20+; no dependencies or build step required. Run `npm start`, then visit `http://localhost:8080`.
- **Engine verification:** `npm test`.
- **Repackage:** `npm run package` (Python 3 required).

## Included

Two separate factions, each with 45 collectibles and three editable 30-card starter decks:

| Faction | Minions | Spells | Legendary cards | Hero Spell |
| --- | --- | --- | --- | --- |
| Naruto | 27 | 18 | 7 | Shadow Clone Technique |
| One Piece | 22 | 23 | 11 | Nakama! |

A deck contains exactly 30 cards from one faction, at most two of an ordinary card and one of each Legendary. Tokens, Gear forms, generated neutral potions, and Hero Spells cannot be added to decks. Fusion cards, charging, and fusion actions are absent from the active engine.

The game supports collection search, token/form galleries, full card inspection, mana filters, separate saved faction decks, import/export, mulligans, saved matches, summon positioning, AI rivals from either faction, reactions, triggered effects, and activated abilities. All gameplay state is serializable for saves and AI simulations.

**Local AI practice is supported.** The original account/multiplayer/economy code and old factions are excluded. No online account or ranked integration is claimed.

## Shattered Realms-style interface and mobile scrolling

The interface retains Shattered Realms’ stone-and-bronze styling and now uses the uploaded hero portraits, card backs, basic frames and faction-specific Legendary frames. All 12 frames have real transparent artwork windows, rather than visible checkerboards. Card art is cropped square.

Mobile pages use native vertical scrolling. The deck list expands into the page instead of trapping scrolling in a nested box. The hand supports native horizontal swipes while allowing vertical page scroll. Swipes do not activate card taps. Page and hand positions are preserved when the battle UI updates. Portrait layouts account for the bottom navigation and device safe area.

## One Piece rules and interpretations

- The individual descriptions specify **10 Legendary minions plus The Will of D.**, totaling **11 Legendary collectibles** rather than the overview's 10. These individual rarities are used.
- Only Base Luffy is collectible. Five transformation tokens complete the six-form progression, including both Gear 4 branches. Every form has Luffy identity and the natural Devil Fruit User status.
- Gear Shift is an engine-validated activated action: once per turn, after the summon turn, for the stated cost. It preserves UID, owner, damage, permanent and temporary enchantments, status, and attack usage. Transformation does not summon, trigger Arrival, or grant fresh attacks.
- Gear 3 presents an explicit Gear 4 branch choice. Gear 5 counts the turn of entry if entered on your turn; at its third own-turn end it returns to Base Luffy at 1 Health. The following own turn is a recovery turn.
- Emergency Gear Shift may bypass the summon delay and cost, but respects once-per-turn usage, Petrify/disable, Silence, and Gear 5 recovery. It reacts only to an enemy attack or a targeted enemy spell against an eligible Luffy. It does not refresh attacks.
- The Will of D. refreshes Gear Shift usage and discounts the next paid activation by 2; it does not refresh attacks or bypass recovery/summon-delay restrictions.
- Devil Fruit powers, bonuses, keywords, and drawbacks live in a separate protected layer. Silence removes the minion's original abilities and unrelated enchantments while retaining that layer. Evade still consumes itself on preventing damage; Reborn still produces a fresh minion.
- Natural Users and consumed Fruit Users are excluded from Fruit targeting before a legal action can exist. Fruit effects disappear on bounce, death, and fresh copies/resummons; ordinary bodies returning through Phoenix Reborn have no Fruit powers. Temporary in-play body transformations retain Fruit powers.
- The defined Weather pool currently contains **Thunderbolt Tempo** only. Nami therefore generates it. No extra Weather card designs have been invented. Fire spells currently tagged for Ace are Red Hawk and Diable Jambe.
- Crew cards 1–12, Fleet Captain, Crewman, Fleet Pirates, and Luffy's forms carry the Straw Hat tribe. Supporting allies do not. Jinbe carries Fish-Man. Sunny does not buff itself on its own Arrival.
- Unqualified "if an ally is on the battlefield, gain stats" clauses on Zoro, Bepo, Yamato, and Carrot check on Arrival. Sanji and Sabo check their conditions when attacking.
- Thunderbolt chooses up to three distinct enemies. Gatling resolves each random hit separately, processing deaths and damage triggers between hits.
- Robin produces a 1/1 Flower Hand with Taunt; Flower Fruit produces a 1/1 Hand without Taunt. Both count as Flower Hands for the Fruit drawback. Generated tokens reuse relevant supplied art.
- Petrify prevents attacking and activated abilities through the target controller's next turn. Law swaps two minions on the same battlefield; it does not change control across sides.
- Gear 5 Rubber Toys restore the saved body if that same instance survives through its owner's next turn. Leaving play prevents restoration. Protected Fruit powers remain active even on a Toy, and a Fruit consumed during Toy form survives body restoration.
- Burn follows the inherited Burn 1 system. Off-turn Quick Plays retain the original one-Mana discount (minimum one) and can borrow Mana from the next refill. Observation's newly granted Evade expires after that attack, including redirection/fizzle cleanup.
- Sea-Prism damage is doubled against Users. Silence and the temporary Attack setting do not delete the protected Fruit layer; after the setting expires, Fruit Attack bonuses apply normally.

## Naruto rulings retained

- The individual rarities total 7 Legendaries and 38 ordinary cards, rather than the overview's 8 Legendaries.
- Sasuke's Team 7 bonus checks on Arrival. Hiruzen's ongoing +1/+1 is an aura.
- Arrival triggers only from hand. Naruto's end-turn copy does not generate further Arrival copies. A pending copy uses the saved snapshot if its original is gone.
- Sexy Jutsu buffs the leftmost Naruto; Harem Jutsu buffs all Narutos. Their Health/Taunt grants are permanent; enemy Attack reductions expire at the caster's next turn.
- Evade prevents the first damage instance. Poisonous retains Shattered Realms' definition: the enemy killer dies when its bearer dies.
- Substitution's Log takes the same slot and becomes the attack target. Minato interception offers an explicit choice. Flying Thunder God removes the defender so combat fizzles after its retaliation.

## Artwork and source

Both uploads are preserved separately in `/workspace/anime-tcg-prep/art-originals` and `/workspace/one-piece-prep/originals`. In-game crops are 512 × 512. Crop coordinates, original dimensions, and source hashes are recorded under each art folder.

The One Piece upload has 50 source images. Chopper has no separate portrait, so his card crops him from the supplied crew image. Tokens reuse related artwork; no external art was downloaded.

- `src/cards/naruto.js`, `src/cards/one-piece.js`: definitions, tags, and artwork references.
- `src/cards/anime-presets.js`: six valid starter decks.
- `src/cards/deck-check.js`: one-faction and copy-limit validation.
- `src/engine/naruto.js`, `src/engine/one-piece.js`: faction abilities, timers, and transformations.
- `src/anime/main.js`: interface and touch handling.
- `src/anime/realms-theme.css`: original-style frames, theme, and mobile scrolling.

## Verification

64 automated engine scenarios (28 Naruto and 36 One Piece) cover every collectible, deck legality, permanent Fruit layers and drawbacks, Gear timing and branches, damage/attack preservation, reactions, body restoration, fresh copies, six preset decks, serialized replay parity, and complete AI matches both within and across factions.

Chromium browser checks cover both collections, all 11 One Piece Legendaries, form/token inspection, per-faction saved decks, export, mulligans, practice matches, native mobile vertical swipes, native horizontal hand swipes, accidental-tap prevention, Gear 4 choices, and Law's activation. No page errors or failed asset requests were observed in the completed run.

## Interactive boards

The Boards tab previews four environments in both 9:16 portrait and 16:9 landscape: Forest of Death, Village Overlook, Sunny at Sea, and Sea King Tempest. Each orientation has independently traced corner geometry. All 32 corner objects have isolated sprite layers, passive motion, repeatable click animations, optional synthesized sound, and keyboard controls. Generated clean background plates prevent duplicate props during movement; the central platform retains the uploaded artwork.

Canvas raster alpha defines each sprite’s tight bounds and final hit validation. SVG fill/stroke geometry lets empty regions, coil holes, and web gaps pass through without activating objects; handlers stop propagation. Decorative Canvas layers never accept pointer events. Effects clip away from the card-placement rectangle. Particle counts and render resolution are capped, hidden boards pause, and reduced-motion preferences are respected. Actual frame rate depends on device performance.

Everything else on each board has its own idle animation (`src/boards/ambient.js`, recipes in `src/boards/ambient-config.js`, prepared layers in `art/boards-anime/ambient/`). On the Thousand Sunny the sea and sky gently rock and ripple behind a perfectly steady ship, the pennant garland swings, the sail breathes and the seagulls glide. On the Sea King board the water ripples (never the boats, raft or monsters), the serpent and crocodiles breathe and lean over inpainted backgrounds so no outline ever ghosts, bubbles wobble, lightning flickers and light shafts drift underwater. The forest's vines, moss and ferns sway with light rays, mist, lamps and fireflies; the village's trees sway, lanterns flicker, chimney smoke rises, birds pass and the painted leaves lift in the breeze. Two extra canvases hold this motion: one between the painting and the platform, one between the platform and the corner objects (never over the card area). Reduced-motion settings show a still frame that matches the painting.

The app uses one internal native scroll viewport so it remains scrollable inside itch’s iframe even when the surrounding page cannot scroll. UI updates preserve scroll position and wait for momentum scrolling to settle. Safari/WebKit layout scrolling and Chromium touch gestures were checked in embedded and full-viewport configurations; physical iPhone testing remains useful.
