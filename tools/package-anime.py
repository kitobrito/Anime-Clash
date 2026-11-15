"""Create dependency-free source and itch.io HTML builds without legacy game files."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
OUT.mkdir(exist_ok=True)
runtime = [ROOT / 'index.html']
for folder in ['src/anime', 'src/realms', 'src/boards', 'src/engine', 'art/hidden-leaf', 'art/tokyo-ghoul', 'art/straw-hats', 'art/boards-anime', 'art/identity', 'art/frames', 'art/frames-anime', 'art/ui', 'art/icons', 'art/fx/sprites', 'art/fonts']:
    runtime.extend(p for p in (ROOT / folder).rglob('*') if p.is_file())
for name in [
    'src/ai/greedy.js', 'src/cards/index.js', 'src/cards/deck-check.js',
    'src/cards/neutral.js', 'src/cards/naruto.js', 'src/cards/one-piece.js', 'src/cards/tokyo-ghoul.js',
    'src/cards/naruto-starters.js', 'src/cards/naruto-teams.js', 'src/cards/anime-presets.js', 'src/cards/validate.js',
    'art/fonts/card-text.ttf', 'art/fonts/card-text-bold.ttf', 'art/fonts/cinzel.woff2',
    'art/frames/weapon-universal.webp', 'art/frames/board-oval.png', 'art/frames/painted-minion.png', 'art/frames/painted-spell.png',
    'art/frames/painted-quickplay.png', 'art/frames/legendary-minion.png',
    'art/frames/legendary-spell.png', 'art/boards-v2/basic.jpg',
]:
    runtime.append(ROOT / name)
source = runtime + [ROOT / name for name in [
    'package.json', 'package-lock.json', 'Readme.md', 'ITCH.md', 'BOARD-ANIMATION.md',
    'tools/serve-anime.mjs', 'tools/package-anime.py',
    'tools/test-signature-quinques-browser.mjs', 'tools/test-anime-abilities-browser.mjs', 'tools/test-deck-migration-browser.mjs', 'tools/test-anime-ui-browser.mjs', 'tools/test-library-and-glossary.mjs', 'tools/test-realms-ui.mjs', 'tools/test-hero-picker.mjs', 'tools/test-hero-picker-browser.mjs', 'tools/test-weapon-frame-browser.mjs', 'tools/test-weapon-frames.mjs', 'tools/test-naruto.mjs', 'tools/test-naruto-browser.mjs', 'tools/test-one-piece.mjs', 'tools/test-boards.mjs', 'tools/test-tokyo-ghoul.mjs', 'tools/test-tokyo-ghoul-browser.mjs', 'tools/test-boards-browser.mjs', 'tools/record-board-video.mjs',
]]
for name, files, prefix in [
    ('Anime-Clash-itch.zip', runtime, ''),
    ('Anime-Clash-source.zip', source, 'anime-clash/'),
]:
    with ZipFile(OUT / name, 'w', ZIP_DEFLATED) as archive:
        for path in sorted(set(files)):
            archive.write(path, prefix + str(path.relative_to(ROOT)))
    print(f'{name}: {(OUT / name).stat().st_size:,} bytes; {len(set(files))} files')
