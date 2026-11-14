"""Compare two seat-balanced baseline tournaments, with paired seed-block bootstrap CIs."""
import argparse, collections, csv, html, json, random
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('before',type=Path);p.add_argument('after',type=Path);p.add_argument('--tuned',action='store_true');p.add_argument('--holdout',type=Path);args=p.parse_args()
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
holdout_summary=[]
if args.holdout:
 hrows=[json.loads(line) for line in (args.holdout/'matches.jsonl').read_text().splitlines()]
 assert all(r['completed'] and not r['error'] for r in hrows)
 assert not {r['seed'] for r in hrows}&{r['seed'] for r in before+after},'Holdout seeds overlap matching/screening bank'
 assert json.loads((args.holdout/'metadata.json').read_text())['gameSourceSha256']==json.loads((args.after/'metadata.json').read_text())['gameSourceSha256']
 for policy in ['shipped','pressure','control']:
  selected=[r for r in hrows if r['policy']==policy]
  hm=metrics(selected)
  for label in hm:
   if label!='Naruto' and policy!='shipped':continue
   if label in ['One Piece','Tokyo Ghoul']:continue
   blocks=sorted(hm[label]);wins=sum(hm[label][b][0] for b in blocks);n=sum(hm[label][b][1] for b in blocks)
   rng=random.Random(1141);pct=[]
   for _ in range(3000):
    sample=rng.choices(blocks,k=len(blocks));pct.append(100*sum(hm[label][b][0] for b in sample)/sum(hm[label][b][1] for b in sample))
   pct.sort();holdout_summary.append(dict(group=label,policy=policy,wins=wins,games=n,winPct=100*wins/n,low95=pct[75],high95=pct[2924]))
changes=('Five targeted cost reductions (Naruto, Sasuke, Ino, Neji and Shino: 4 → 3 Mana), plus rebuilt Team 7 and Ino–Shika–Cho starter lineups. Stats, abilities, once-per-game team rewards, Jammed rules, Palm Rotation, AI, Will of Fire, One Piece and Tokyo Ghoul are unchanged. Custom saved decks are preserved; choose an updated preset to load its new lineup.' if args.tuned else 'Changes include all four once-per-game team rewards, Hyuga Jammed Mana, minion-first Palms, Shino Mana theft, and Palm Rotation replacing one spell in each Naruto starter. The AI now values pending Jammed Mana; this term is zero under the old rules. Other faction decks and rules remain unchanged. Custom saved decks are preserved.')
limits='These are deterministic one-ply AI starter-deck tests. The AI does not plan multi-turn team setups and can inspect hidden information and RNG when simulating. Results measure this test setup, not human win rates or optimal competitive decks. Fresh seeds test generalization; alternate policies probe dependence on AI priorities. Neither proves universal competitive balance.'
summary=dict(gamesPerVersion=len(after),errors=0,capped=0,unchangedNonNarutoGames=identical,totalNonNarutoGames=len(unaffected),metrics=results,holdout=holdout_summary)
(args.after/'comparison.json').write_text(json.dumps(summary,indent=2))
with (args.after/'comparison.csv').open('w') as f:
 w=csv.DictWriter(f,fieldnames=list(results[0]));w.writeheader();w.writerows(results)
lines=['# Naruto update: before and after balance tests','','4,050 games per version; 50 shared seeds, both seat orders, all nine starter decks. No errors or capped games. Cross-faction figures use equally weighted starters and seats. Paired 95% intervals resample complete seed blocks (3,000 resamples).','','| Faction / deck | Before | After | Change (percentage points) | Paired 95% interval | Games per version |','|---|---:|---:|---:|---:|---:|']
for r in results:lines.append(f"| {r['group']} | {r['beforePct']:.1f}% | {r['afterPct']:.1f}% | {r['changePoints']:+.1f} | {r['paired95Low']:+.1f} to {r['paired95High']:+.1f} | {r['games']} |")
lines += ['',f'{identical}/{len(unaffected)} games with no Naruto player retained identical winners, turn counts and action counts.','',changes,'',limits]
if holdout_summary:
 lines += ['','## Fresh-seed validation','','The candidate was selected using seeds 0–11; the matched full run uses seeds 0–49. This separate validation uses seed indexes 1000–1049 (50 seeds; 1,800 matches) and two alternate policies on the first 12 fresh seeds (432 matches each). These seeds were excluded from candidate selection. Confidence intervals resample whole seed blocks.','','| Group | Policy | Win rate | 95% interval | Wins / games |','|---|---|---:|---:|---:|']
 for r in holdout_summary:lines.append(f"| {r['group']} | {r['policy']} | {r['winPct']:.1f}% | {r['low95']:.1f}% to {r['high95']:.1f}% | {r['wins']} / {r['games']} |")
lines += ['','Source versions and SHA-256 digests are in each run’s metadata.json. Raw per-game results are in matches.jsonl. Reproduce the matched run with `node tools/balance-anime.mjs --seeds=50 --hero-seeds=0 --sensitivity-seeds=0 --workers=2 --out=dist/balance-naruto-tuned-2026-11-14` and the fresh-seed run with `--only=naruto-cross --seeds=50 --seed-offset=1000 --hero-seeds=0 --sensitivity-seeds=12`. Run this script against the previous release and tuned result directories with `--tuned --holdout=path/to/fresh-seed-results`.']
(args.after/'NARUTO-BALANCE-COMPARISON.md').write_text('\n'.join(lines)+'\n')
body='<h1>Naruto balance update</h1><p>4,050 games per version · 50 shared seeds · both seats · nine starters · zero errors</p><table><thead><tr>'+''.join('<th>'+v+'</th>' for v in ['Faction / deck','Before','After','Change','Paired 95% interval','Games'])+'</tr></thead><tbody>'
for r in results:body+='<tr>'+''.join('<td>'+html.escape(str(v))+'</td>' for v in [r['group'],f"{r['beforePct']:.1f}%",f"{r['afterPct']:.1f}%",f"{r['changePoints']:+.1f} pp",f"{r['paired95Low']:+.1f} to {r['paired95High']:+.1f}",r['games']])+'</tr>'
body+='</tbody></table><p>'+html.escape(changes)+'</p><p>'+html.escape(limits)+'</p>'
if holdout_summary:
 body+='<h2>Fresh-seed validation</h2><p>50 fresh seeds; 1,800 shipped-policy games. Two alternate policies: 432 games each on 12 fresh seeds. No overlap with candidate selection or matched comparison. No errors or capped matches.</p><table><tr><th>Group</th><th>Policy</th><th>Win rate</th><th>95% interval</th><th>Games</th></tr>'
 for r in holdout_summary:body+='<tr>'+''.join('<td>'+html.escape(str(v))+'</td>' for v in [r['group'],r['policy'],f"{r['winPct']:.1f}%",f"{r['low95']:.1f}% to {r['high95']:.1f}%",r['games']])+'</tr>'
 body+='</table>'
(args.after/'NARUTO-BALANCE-COMPARISON.html').write_text('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Naruto balance update</title><style>body{font:16px system-ui;max-width:1100px;margin:40px auto;padding:20px;color:#eee;background:#101713}h1{color:#d8e9b4}table{width:100%;border-collapse:collapse}td,th{padding:12px;text-align:left;border-bottom:1px solid #455348}p{line-height:1.6;color:#bccabf}@media(max-width:700px){table{font-size:12px}td,th{padding:6px}}</style>'+body)
print(json.dumps(summary,indent=2))
