"""Compare two seat-balanced baseline tournaments, with paired seed-block bootstrap CIs."""
import argparse, collections, csv, html, json, random
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('before',type=Path);p.add_argument('after',type=Path);args=p.parse_args()
def read(root):return [r for line in (root/'matches.jsonl').read_text().splitlines() if (r:=json.loads(line))['stage']=='baseline']
before,after=read(args.before),read(args.after)
assert len(before)==len(after)==4050
assert all(r['completed'] and not r['error'] for r in before+after)
def key(r):return (tuple(p['id'] for p in r['players']),r['seed'])
assert {key(r) for r in before}=={key(r) for r in after}
def metrics(rows):
 m=collections.defaultdict(lambda:collections.defaultdict(lambda:[0,0]))
 for r in rows:
  if r['players'][0]['faction']==r['players'][1]['faction']:continue
  for seat,pl in enumerate(r['players']):
   labels=[pl['faction']]
   if pl['faction']=='Naruto':labels += [pl['name'],'Naruto vs '+r['players'][1-seat]['faction']]
   for label in labels:
    m[label][r['block']][0]+=int(r['winner']==seat);m[label][r['block']][1]+=1
 return m
old,new=metrics(before),metrics(after);results=[]
for label in new:
 blocks=sorted(new[label]);ow=sum(old[label][b][0] for b in blocks);nw=sum(new[label][b][0] for b in blocks);n=sum(new[label][b][1] for b in blocks)
 rng=random.Random(721);changes=[]
 for _ in range(3000):
  sample=rng.choices(blocks,k=len(blocks));changes.append(100*sum(new[label][b][0]-old[label][b][0] for b in sample)/sum(new[label][b][1] for b in sample))
 changes.sort();results.append(dict(group=label,beforeWins=ow,afterWins=nw,games=n,beforePct=100*ow/n,afterPct=100*nw/n,changePoints=100*(nw-ow)/n,paired95Low=changes[75],paired95High=changes[2924]))
old_by={key(r):r for r in before};unaffected=[r for r in after if all(p['faction']!='Naruto' for p in r['players'])];identical=sum(all(r[k]==old_by[key(r)][k] for k in ['winner','completed','turn','steps']) for r in unaffected)
summary=dict(gamesPerVersion=len(after),errors=0,capped=0,unchangedNonNarutoGames=identical,totalNonNarutoGames=len(unaffected),metrics=results)
(args.after/'comparison.json').write_text(json.dumps(summary,indent=2))
with (args.after/'comparison.csv').open('w') as f:
 w=csv.DictWriter(f,fieldnames=list(results[0]));w.writeheader();w.writerows(results)
lines=['# Naruto update: before and after balance tests','','4,050 games per version; 50 shared seeds, both seat orders, all nine starter decks. No errors or capped games. Cross-faction figures use equally weighted starters and seats. Paired 95% intervals resample complete seed blocks (3,000 resamples).','','| Faction / deck | Before | After | Change (percentage points) | Paired 95% interval | Games per version |','|---|---:|---:|---:|---:|---:|']
for r in results:lines.append(f"| {r['group']} | {r['beforePct']:.1f}% | {r['afterPct']:.1f}% | {r['changePoints']:+.1f} | {r['paired95Low']:+.1f} to {r['paired95High']:+.1f} | {r['games']} |")
lines += ['',f'{identical}/{len(unaffected)} games with no Naruto player retained identical winners, turn counts and action counts.','','Changes include all four once-per-game team rewards, Hyuga Jammed Mana, minion-first Palms, Shino Mana theft, and Palm Rotation replacing one spell in each Naruto starter. The AI now values pending Jammed Mana; this term is zero under the old rules. Other faction decks and rules remain unchanged. Custom saved decks are preserved.','','These are deterministic one-ply AI starter-deck tests. The AI does not plan multi-turn team setups and can inspect hidden information and RNG when simulating. Results measure this test setup, not human win rates or optimal competitive decks. Naruto improved but remains below an even matchup overall; do not call the factions balanced from these results.','','Source versions and SHA-256 digests are in each run’s metadata.json. Raw per-game results are in matches.jsonl. Reproduce the updated run with `node tools/balance-anime.mjs --seeds=50 --hero-seeds=0 --sensitivity-seeds=0 --workers=2 --out=dist/balance-naruto-buff-2026-11-14`, then run this comparison script against the original result directory.']
(args.after/'NARUTO-BALANCE-COMPARISON.md').write_text('\n'.join(lines)+'\n')
body='<h1>Naruto balance update</h1><p>4,050 games per version · 50 shared seeds · both seats · nine starters · zero errors</p><table><thead><tr>'+''.join('<th>'+v+'</th>' for v in ['Faction / deck','Before','After','Change','Paired 95% interval','Games'])+'</tr></thead><tbody>'
for r in results:body+='<tr>'+''.join('<td>'+html.escape(str(v))+'</td>' for v in [r['group'],f"{r['beforePct']:.1f}%",f"{r['afterPct']:.1f}%",f"{r['changePoints']:+.1f} pp",f"{r['paired95Low']:+.1f} to {r['paired95High']:+.1f}",r['games']])+'</tr>'
body+='</tbody></table><p>Naruto improved but still trails. These results use one-ply AI starter-deck matches, not human play or optimized decks. The AI underuses multi-turn combos and simulates hidden information. Buffs, new Palm Rotation starter substitutions, and awareness of Jammed Mana are included.</p>'
(args.after/'NARUTO-BALANCE-COMPARISON.html').write_text('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Naruto balance update</title><style>body{font:16px system-ui;max-width:1100px;margin:40px auto;padding:20px;color:#eee;background:#101713}h1{color:#d8e9b4}table{width:100%;border-collapse:collapse}td,th{padding:12px;text-align:left;border-bottom:1px solid #455348}p{line-height:1.6;color:#bccabf}@media(max-width:700px){table{font-size:12px}td,th{padding:6px}}</style>'+body)
print(json.dumps(summary,indent=2))
