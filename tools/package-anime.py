"""Create dependency-free source and itch.io HTML builds without legacy game files."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
OUT.mkdir(exist_ok=True)
runtime = [ROOT / 'index.html']
for folder in ['src/anime', 'src/boards', 'src/engine', 'art/hidden-leaf', 'art/straw-hats', 'art/boards-anime', 'art/identity', 'art/frames-anime']:
    runtime.extend(p for p in (ROOT / folder).rglob('*') if p.is_file())
for name in [
    'src/ai/greedy.js', 'src/cards/index.js', 'src/cards/deck-check.js',
    'src/cards/neutral.js', 'src/cards/naruto.js', 'src/cards/one-piece.js',
    'src/cards/anime-presets.js', 'src/cards/validate.js',
    'art/fonts/card-text.ttf', 'art/fonts/card-text-bold.ttf', 'art/fonts/cinzel.woff2',
    'art/frames/painted-minion.png', 'art/frames/painted-spell.png',
    'art/frames/painted-quickplay.png', 'art/frames/legendary-minion.png',
    'art/frames/legendary-spell.png', 'art/boards-v2/basic.jpg',
]:
    runtime.append(ROOT / name)
source = runtime + [ROOT / name for name in [
    'package.json', 'package-lock.json', 'Readme.md', 'ITCH.md',
    'tools/serve-anime.mjs', 'tools/package-anime.py',
    'tools/test-naruto.mjs', 'tools/test-one-piece.mjs',
]]
for name, files, prefix in [
    ('Anime-Clash-itch.zip', runtime, ''),
    ('Anime-Clash-source.zip', source, 'anime-clash/'),
]:
    with ZipFile(OUT / name, 'w', ZIP_DEFLATED) as archive:
        for path in sorted(set(files)):
            archive.write(path, prefix + str(path.relative_to(ROOT)))
    print(f'{name}: {(OUT / name).stat().st_size:,} bytes; {len(set(files))} files')
