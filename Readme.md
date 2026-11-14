# Anime Clash — Naruto, One Piece & Tokyo Ghoul

A separate anime card game derived from [Shattered Realms TCG](https://github.com/kitobrito/Shattered-Realms-TCG), based on source commit `4c51640`. **Anime Clash** is a working title. The original repository is untouched. This repository contains only the standalone anime game.

## Play or upload

- **itch.io build:** `dist/Anime-Clash-itch.zip`; upload as HTML with `index.html` at the root. Recommended embed: **1280 × 720**, fullscreen enabled. See `ITCH.md`.
- **Source:** `dist/Anime-Clash-source.zip`. Node.js 20+; no dependencies or build step required. Run `npm start`, then visit `http://localhost:8080`.
- **Engine verification:** `npm test`.
- **Repackage:** `npm run package` (Python 3 required).

## Included

Three separate factions with three editable 30-card starter decks each (Naruto: 46 collectibles; One Piece and Tokyo Ghoul: 45 each):

| Faction | Minions | Spells | Legendary cards | Hero Spell |
| --- | --- | --- | --- | --- |
| Naruto | 27 | 18 | 7 | Shadow Clone Technique |
| One Piece | 22 | 23 | 11 | Nakama! |
| Tokyo Ghoul | 21 | 10 | 13 | Predatory Instinct / Investigator variants |

Tokyo Ghoul also includes 3 Investigator Hero cards, 5 traps and 6 Quinque weapons, for 45 total collectibles.

A deck contains exactly 30 cards from one faction, at most two of an ordinary card and one of each Legendary. Tokens, Gear forms, generated neutral potions, and Hero Spells cannot be added to decks. Fusion cards, charging, and fusion actions are absent from the active engine.

The game supports collection search, token/form galleries, full card inspection, mana filters, separate saved faction decks, import/export, mulligans, saved matches, summon positioning, AI rivals from all three factions, reactions, triggered effects, and activated abilities. All gameplay state is serializable for saves and AI simulations.

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

The Boards tab previews four environments in both 9:16 portrait and 16:9 landscape: Forest of Death, Village Overlook, Thousand Sunny, and Sea King Tempest. Each orientation has independently traced corner geometry. All 32 corner objects and the Sunny lion in both orientations have isolated sprite layers, passive motion, repeatable click animations, optional synthesized sound, and keyboard controls. Generated clean background plates prevent duplicate props during movement; the central platform retains the uploaded artwork.

Canvas raster alpha defines each sprite’s tight bounds and final hit validation. SVG fill/stroke geometry lets empty regions, coil holes, and web gaps pass through without activating objects; handlers stop propagation. Decorative Canvas layers never accept pointer events. Effects clip away from the card-placement rectangle. Particle counts and render resolution are capped, hidden boards pause, and reduced-motion preferences are respected. Actual frame rate depends on device performance.

Everything else on each board has its own idle animation (`src/boards/ambient.js`, recipes in `src/boards/ambient-config.js`, prepared layers in `art/boards-anime/ambient/`). On the Thousand Sunny the sea and sky gently rock and ripple behind a perfectly steady ship, the pennant garland swings, the sail breathes and the seagulls glide. On the Sea King board the water ripples (never the boats, raft or monsters), the serpent and crocodiles breathe and lean over inpainted backgrounds so no outline ever ghosts, bubbles wobble, lightning flickers and light shafts drift underwater. The forest's vines, moss and ferns sway with light rays, mist, lamps and fireflies; the village's trees sway, lanterns flicker, chimney smoke rises, birds pass and the painted leaves lift in the breeze. Two extra canvases hold this motion: one between the painting and the platform, one between the platform and the corner objects (never over the card area). Reduced-motion settings show a still frame that matches the painting.

The app uses one internal native scroll viewport so it remains scrollable inside itch’s iframe even when the surrounding page cannot scroll. UI updates preserve scroll position and wait for momentum scrolling to settle. Safari/WebKit layout scrolling and Chromium touch gestures were checked in embedded and full-viewport configurations; physical iPhone testing remains useful.

The replacement Thousand Sunny boards use the supplied 1280×720 and 720×1280 paintings. Corner bases retain their original pixels, with separately traced hat, fruit, flag, telescope, food and Log Pose layers. Reconstructed surfaces appear only inside the concealed object footprints. The lion figurehead sways, blinks and reacts to clicks. Hit tests use each moving layer’s current screen transform and raster alpha; visual effects leave the central card rectangle clear.

## Tokyo Ghoul rules and implementation

- Choose one of four Ghoul Heroes (Kaneki/Rinkaku, Touka/Ukaku, Tsukiyama/Koukaku, Nishiki/Bikaku) or a generic Investigator. Include at most one named Investigator Hero card (Arima, Amon or Akira) to replace that choice. Its card counts toward the 30-card deck and starts outside the draw pile, leaving 29 drawable cards. Named Heroes cannot be cast or summoned. Hero selection survives deck export/import.
- Ghouls and Half-Ghouls gain Hunger at their controller’s turn end unless they consumed that turn. At Hunger 3 or more, starvation deals 1 damage. Feed costs 1 Mana and the minion’s remaining attacks, once per turn, requiring that it can attack. It can consume an allied Human token or a damaged enemy minion with at most 2 current Health; Heroes and itself are never targets. Silence removes printed abilities, while species and Hunger remain.
- Consuming a Human or Half-Human heals the consumer for 3; a Half-Ghoul heals for 3 and grants +0/+1; a Ghoul grants +1/+2 without a separate heal. Stat buffs increase current Health with maximum Health as usual. Feed and consume spells reset Hunger; spell consumption does not spend the consumer’s attack. Enemy Human Civilians cannot be consumed during their summon turn.
- A Ghoul Hero receives a Cannibalism stack when an ally consumes a Ghoul/Half-Ghoul, capped at four. Once per game, spend four stacks and 4 Mana to choose a distinct second Kagune type. The original Hero and equipment identity persist; the hybrid gains 6 Armor, +2 weapon Attack, +3 maximum Durability, a full repair and Lifesteal. A newly added Ukaku grants Evade; a newly added Koukaku grants 2 Armor. Kakuja Awakening can evolve for its printed spell cost and adds temporary Attack, otherwise it summons a Ravenous Ghoul and draws.
- Kagunes persist at zero Durability, exhausted and unable to attack until repaired. They cannot be replaced with Quinques. Investigator Quinques use ordinary breakage; Jason’s kill repair resolves before its final attack would break it. Hero spells are once per own turn and discover only Quinques remaining in the deck, removing the chosen card. With no available Quinque and no equipped weapon, the fallback grants 2 Armor. Durability increases from Hero powers can exceed the printed maximum; Maintenance caps at the current maximum.
- Card text saying **Ghoul** uses the Ghoul species; text saying **Ghoul or Half-Ghoul** uses both. The Hero’s Ghoul path includes either. Yoshimura suppresses Hunger gain for Ghouls while remaining Half-Ghouls still gain Hunger. Named Humans/Half-Humans and ordinary living Naruto/One Piece humans are classified for consume/target effects; wooden bodies, drawn beasts and illusion tokens are excluded.
- Traps are automatic and use the existing three-trap limit. Hidden in Plain Sight can invalidate either target of a two-target spell. All 45 cards and eight Hero paths have executable effects; the UI provides Feed targeting, two-step spell targeting, Kakuja choices, equipment durability/attack controls, Armor, Hunger and Cannibalism status.
- Artwork: supplied collages were separated with AI cleanup, and borders/labels removed. Aogiri Ghoul shares the hooded Masked Ghoul image because a separate source was not identified. The Investigator power variants share the supplied Quinque Arsenal image; Predatory Instinct uses its supplied image. Source mapping is in `art/tokyo-ghoul/provenance.json`. Tokyo Ghoul uses the supplied animated Gourmet/Cochlea boards; see `BOARD-ANIMATION.md` for sound hooks and optional missing environment layers.
- Verification: 34 Tokyo Ghoul engine tests cover all collectibles, traps, Hero selection, Hunger, consuming, hybrid choices, durability, deterministic saves and AI progression. `tools/test-tokyo-ghoul-browser.mjs` exercises desktop/mobile collection filters, saved Hero choices, deck export, both Hero paths and complete Feed/spell/evolution/weapon interactions. Browser tests use optional Playwright and do not add a runtime dependency.

### Naruto team and Hyuga update

Controlling a complete team grants its current teammates permanent +3/+3 and summons its mentor from hand (first) or deck, once per team per player per game:

- Naruto, Sasuke, Sakura → Kakashi.
- Neji, Rock Lee, Tenten → Might Guy.
- Shino, Hinata, Kiba, Akamaru → Kurenai.
- Shikamaru, Ino, Choji → Asuma.

Duplicate teammates present at completion also receive the buff. Summoning a mentor does not trigger Arrival. A full board still receives the team buff but leaves the mentor in its original zone; missing mentors are never generated. Reassembling the team does not trigger another reward, including after saving and loading.

**Jammed** blocks Mana on its owner's next refill, then clears. Maximum crystals remain unchanged. Pending Jammed Mana is excluded from Quick Play borrowing. Neji and Hinata Jam 1 on a successful direct Hero attack; Gentle Fist adds 1 on its next successful direct Hero hit that turn. Prevented damage and attacks into minions do not Jam. Sixty-Four Palms resolves eight separate 1-damage hits, checking living enemy minions before every hit; only when none remain does it hit the Hero and Jam 1 per successful Hero hit (up to 8). Shino replaces its old Attack drain with stealing 1 available next-turn Mana crystal whenever it damages an enemy, granting its controller 1 temporary Mana on their next turn.

**Eight Trigrams: Palm Rotation** is a 2-Mana Quick Play Jutsu using the supplied artwork. On an opponent's turn, it prevents the incoming attack's damage to your Hero or minion, or the triggering targeted spell's damage to its friendly target(s). Neji adds 3 damage to an attacking character. Defender retaliation still occurs; it does not make characters Immune for the turn or cancel nondamage spell effects. Off-turn reflex discount and borrowed Mana follow the existing rules. Each updated Naruto starter includes one copy; custom saved decks are retained.

Verification: `npm test`; browser flow: `PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tools/test-naruto-browser.mjs` against the local server on port 4174. The browser test checks desktop and touch layouts, the supplied image, all three presets, a real reaction, Neji's counter, team progress and the Jammed HUD.
