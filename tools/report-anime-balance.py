"""Report a completed Anime Clash tournament; requires matplotlib for exportable plots."""
from pathlib import Path
from collections import defaultdict, Counter
import base64, csv, html, json, random, re, statistics, sys
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

root=Path(sys.argv[1] if len(sys.argv)>1 else 'dist/balance-2026-11-14')
meta=json.loads((root/'metadata.json').read_text())
rows=[json.loads(s) for s in (root/'matches.jsonl').read_text().splitlines() if s.strip()]
supp=root/'hero-tg-supplement'
extra=[json.loads(s) for s in (supp/'matches.jsonl').read_text().splitlines() if s.strip()] if (supp/'matches.jsonl').exists() else []
assert len(rows)==meta['total'] and meta.get('finished'),'Wait for the main tournament to finish.'
sm=json.loads((supp/'metadata.json').read_text()) if extra else None
if sm: assert sm.get('finished') and len(extra)==sm['total'],'Wait for the Hero supplement to finish.'
allrows=rows+extra
good=[g for g in rows if g['completed'] and not g['error']]
baseline=[g for g in good if g['stage']=='baseline']
cross=[g for g in baseline if g['players'][0]['faction']!=g['players'][1]['faction']]
mirrors=[g for g in baseline if g['players'][0]['id']==g['players'][1]['id']]
factions=['Naruto','One Piece','Tokyo Ghoul']
profiles=meta['profiles'];byid={p['id']:p for p in profiles}

def observation(g,p):
    return {'block':g['block'],'score':.5 if g['winner'] is None else int(g['winner']==p),'draw':g['winner'] is None,'turn':g['turn'],'stats':g['stats'][p],'final':g['final'][p]}
def selected(games,predicate):
    return [observation(g,p) for g in games for p in [0,1] if predicate(g,p)]
def interval(obs):
    if not obs:return {'games':0,'wins':0,'draws':0,'rate':None,'ci':[None,None]}
    blocks=defaultdict(list)
    for o in obs:blocks[o['block']].append(o['score'])
    keys=sorted(blocks);r=random.Random(20261114);samples=[]
    totals=[(sum(blocks[k]),len(blocks[k])) for k in keys]
    for _ in range(3000):
        chosen=[totals[r.randrange(len(totals))] for _ in totals]
        samples.append(sum(x for x,n in chosen)/sum(n for x,n in chosen))
    samples.sort()
    return {'games':len(obs),'wins':sum(o['score']==1 for o in obs),'draws':sum(o['draw'] for o in obs),'rate':sum(o['score'] for o in obs)/len(obs),'ci':[samples[75],samples[2924]]}
def pct(n):return '—' if n is None else f'{n*100:.1f}%'
def ci(v):return f"{pct(v['rate'])} ({v['ci'][0]*100:.1f}–{v['ci'][1]*100:.1f}%)"
def table(headers,body):return '\n'.join(['| '+' | '.join(headers)+' |','| '+' | '.join(['---']*len(headers))+' |']+['| '+' | '.join(map(str,row))+' |' for row in body])
def writecsv(name,headers,values):
    with (root/name).open('w',newline='') as f:
        w=csv.writer(f);w.writerow(headers);w.writerows(values)

summary={'metadata':meta,'supplementMetadata':sm,'games':len(allrows),'errors':sum(bool(g['error']) for g in allrows),'unfinished':sum(not g['completed'] and not g['error'] for g in allrows),'factions':{},'matchups':{},'decks':{},'heroes':{},'sensitivity':{}}
for f in factions:summary['factions'][f]=interval(selected(cross,lambda g,p:g['players'][p]['faction']==f))
for f in factions:
    for other in factions:
        if f==other:continue
        games=[g for g in cross if {p['faction'] for p in g['players']}=={f,other}]
        summary['matchups'][f+' vs '+other]=interval(selected(games,lambda g,p:g['players'][p]['faction']==f))
for p in profiles[:9]:summary['decks'][p['id']]=interval(selected(cross,lambda g,i:g['players'][i]['id']==p['id']))
first=interval([observation(g,0) for g in baseline]);mirrorfirst=interval([observation(g,0) for g in mirrors]);summary['firstPlayer']=first;summary['mirrorFirstPlayer']=mirrorfirst
summary['mirrorByFaction']={f:interval([observation(g,0) for g in mirrors if g['players'][0]['faction']==f]) for f in factions}
summary['length']={'medianHalfTurns':statistics.median(g['turn'] for g in baseline),'medianRounds':statistics.median((g['turn']+1)//2 for g in baseline),'meanHalfTurns':statistics.mean(g['turn'] for g in baseline),'minHalfTurns':min(g['turn'] for g in baseline),'maxHalfTurns':max(g['turn'] for g in baseline),'earlyGamesByTurn12':sum(g['turn']<=12 for g in baseline),'fatigueGames':sum(any(p['fatigue'] for p in g['final']) for g in baseline),'draws':sum(g['winner'] is None for g in baseline)}

hero_games=[g for g in baseline if g['block']<meta['config']['heroSeeds']]+[g for g in good if g['stage']=='hero-sweep']+[g for g in extra if g['completed'] and not g['error']]
hero_table=[]
for p in profiles:
    if p['faction']!='Tokyo Ghoul':continue
    focal=[g for g in hero_games if g['stage']=='baseline'] if p['id'] in {q['id'] for q in profiles[:9]} else hero_games
    obs=selected(focal,lambda g,i:g['players'][i]['id']==p['id']);v=interval(obs);vs={f:interval(selected(focal,lambda g,i:g['players'][i]['id']==p['id'] and g['players'][1-i]['faction']==f)) for f in factions};summary['heroes'][p['id']]={'overall':v,'opponents':vs}
    assert v['games']==meta['config']['heroSeeds']*18,(p['id'],v['games'])
    hero_table.append([p['name'],p['hero'],v['games'],ci(v)]+[pct(vs[f]['rate']) for f in factions])
for policy in ['shipped','pressure','control']:
    games=[g for g in cross if g['block']<meta['config']['sensitivitySeeds']] if policy=='shipped' else [g for g in good if g['stage']=='sensitivity' and g['policy']==policy]
    summary['sensitivity'][policy]={f:interval(selected(games,lambda g,p:g['players'][p]['faction']==f)) for f in factions}

mechanics={};cards=defaultdict(lambda:{'played':0,'gamesPlayed':0,'gamesDrawn':0,'winsPlayed':0})
for f in factions:
    obs=selected(cross,lambda g,p:g['players'][p]['faction']==f);n=len(obs)
    mechanics[f]={'games':n,'heroAttacksPerGame':sum(o['stats']['heroAttacks'] for o in obs)/n,'feedPerGame':sum(o['stats']['feed'] for o in obs)/n,'gearShiftsPerGame':sum(o['stats']['gears'] for o in obs)/n,'kakujaGames':sum(o['final']['evolved'] for o in obs),'heroSpellsPerGame':sum(o['stats']['actions'].get('heroSpell',0) for o in obs)/n,'unusedManaPerTurn':sum(o['stats']['unusedMana'] for o in obs)/sum(o['stats']['turns'] for o in obs)}
    for o in obs:
        for card in o['stats']['drawn']:cards[card]['gamesDrawn']+=1
        for card,n in o['stats']['played'].items():cards[card]['played']+=n;cards[card]['gamesPlayed']+=1;cards[card]['winsPlayed']+=o['score']
summary['mechanics']=mechanics
(root/'summary.json').write_text(json.dumps(summary,indent=2))
writecsv('faction-matchups.csv',['faction','opponent','games','wins','draws','score_rate','seed_block_ci_low','seed_block_ci_high'],[[*k.split(' vs '),v['games'],v['wins'],v['draws'],v['rate'],*v['ci']] for k,v in summary['matchups'].items()])
writecsv('deck-results.csv',['profile','name','faction','games','score_rate','ci_low','ci_high'],[[key,byid[key]['name'],byid[key]['faction'],v['games'],v['rate'],*v['ci']] for key,v in summary['decks'].items()])
writecsv('hero-results.csv',['preset','hero','games','score_rate_with_95pct_interval','vs_naruto','vs_one_piece','vs_tokyo_ghoul'],hero_table)
writecsv('card-observations.csv',['card_id','plays','games_played','games_seen_in_hand','wins_in_games_played','warning'],[[c,d['played'],d['gamesPlayed'],d['gamesDrawn'],d['winsPlayed'],'Observational only: survival, draw order, opponent and deck confounding; not a causal power estimate.'] for c,d in sorted(cards.items())])

# Static scientific figures for export; rates refer to row faction winning.
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'figure.facecolor':'white'})
matrix=np.array([[.5 if a==b else summary['matchups'][a+' vs '+b]['rate'] for b in factions] for a in factions])
fig,ax=plt.subplots(figsize=(6.6,4.8));im=ax.imshow(matrix*100,cmap='RdYlGn',vmin=0,vmax=100)
for i in range(3):
    for j in range(3):ax.text(j,i,'—' if i==j else f'{matrix[i,j]*100:.1f}%',ha='center',va='center',fontsize=16,color='#151515')
ax.set_xticks(range(3),factions);ax.set_yticks(range(3),factions);ax.set_xlabel('Opponent');ax.set_ylabel('Faction');ax.set_title('Starter-deck matchup score rates\nShipped AI · 900 games per faction pairing');fig.colorbar(im,ax=ax,label='Row faction score rate (%)');fig.tight_layout();fig.savefig(root/'faction-matchups.png',dpi=180);fig.savefig(root/'faction-matchups.svg');plt.close(fig)
items=sorted(summary['decks'].items(),key=lambda kv:kv[1]['rate']);fig,ax=plt.subplots(figsize=(10,6));colors={'Naruto':'#d77822','One Piece':'#2c8799','Tokyo Ghoul':'#a74464'}
for i,(key,v) in enumerate(items):ax.errorbar(v['rate']*100,i,xerr=[[max(0,(v['rate']-v['ci'][0])*100)],[max(0,(v['ci'][1]-v['rate'])*100)]],fmt='o',color=colors[byid[key]['faction']],capsize=4)
ax.set_yticks(range(len(items)),[byid[k]['faction']+' — '+byid[k]['name'] for k,v in items]);ax.axvspan(45,55,color='#dfe9df',alpha=.7,label='45–55% screening band');ax.axvline(50,color='#999',lw=1);ax.set_xlim(0,100);ax.set_xlabel('Score rate against other factions (%)');ax.set_title('Nine fixed starter decks\n95% intervals resample seed blocks; no optimized deck search');ax.grid(axis='x',alpha=.2);fig.tight_layout();fig.savefig(root/'starter-decks.png',dpi=180);plt.close(fig)

weak=min(factions,key=lambda f:summary['factions'][f]['rate']);strong=max(factions,key=lambda f:summary['factions'][f]['rate'])
ranked=sorted(summary['decks'].items(),key=lambda kv:kv[1]['rate'])
weak_decks=', '.join(byid[k]['name']+' ('+pct(v['rate'])+')' for k,v in ranked if v['rate']<.45)
strong_decks=', '.join(byid[k]['name']+' ('+pct(v['rate'])+')' for k,v in reversed(ranked[-3:]))
near_band=', '.join(byid[k]['name']+' ('+pct(v['rate'])+')' for k,v in ranked if byid[k]['faction']==weak and .45<=v['rate']<=.55)
lines=['# Anime Clash balance test — 14 November 2026','',f"Completed **{len(allrows):,} AI matches** using the actual engine. {summary['errors']} engine errors; {summary['unfinished']} capped/unfinished matches. Gameplay stats and rules were not changed.",'',
f"**Finding:** {strong} has the strongest overall starter-deck results and {weak} the weakest under the shipped bot. These are fixed-deck AI results, not human win-rate estimates.",'',
'## Main results','',table(['Faction','Cross-faction games','Score rate (95% seed-block interval)'],[[f,summary['factions'][f]['games'],ci(summary['factions'][f])] for f in factions]),'',
table(['Row faction vs opponent','Games','Row score rate (95% interval)'],[[k,v['games'],ci(v)] for k,v in summary['matchups'].items() if factions.index(k.split(' vs ')[0])<factions.index(k.split(' vs ')[1])]),'',
'![Faction matchups](faction-matchups.png)','',
'## Starter decks','',table(['Faction','Preset','Hero','Cross-faction games','Score rate (95% interval)'],[[byid[k]['faction'],byid[k]['name'],byid[k]['hero'] or 'Faction Hero',v['games'],ci(v)] for k,v in sorted(summary['decks'].items(),key=lambda kv:-kv[1]['rate'])]),'',
'![Deck results](starter-decks.png)','',
'## First-player advantage and length','',f"Across all {len(baseline):,} baseline games, the first player scored {ci(first)}. In {len(mirrors)} exact-deck mirrors, the first player scored {ci(mirrorfirst)}.",'',table(['Exact-mirror faction','Games','First-player score rate'],[[f,v['games'],ci(v)] for f,v in summary['mirrorByFaction'].items()]),'',
f"Median game length: {summary['length']['medianHalfTurns']:g} individual player turns (about {summary['length']['medianRounds']:g} rounds). Range: {summary['length']['minHalfTurns']}–{summary['length']['maxHalfTurns']} turns. {summary['length']['fatigueGames']} baseline games reached fatigue; {summary['length']['draws']} ended in draws; {summary['length']['earlyGamesByTurn12']} ended by turn 12.",'',
'## Hero choices','',
'Every Tokyo Ghoul Hero variant uses the same 16 seeds and all nine baseline opponents with both seat orders. Each opponent faction receives equal weight. Ghoul variants retain the identical 30-card list. Arima/Amon/Akira replace the Hero card and have 29 drawable cards; the generic Investigator has 30 and replaces Arima with one Fueguchi One. That extra card is part of the generic-Hero package, so this is not a pure passive-only comparison. Exact default-Hero mirrors contribute both player observations; they always average 50%.','',
table(['Preset / variant','Hero','Games','Overall score (95% interval)','vs Naruto','vs One Piece','vs Tokyo Ghoul'],hero_table),'',
'## Sensitivity to bot play style','',
'Three policies use the same first 12 seed blocks against the same cross-faction starter pairings. Pressure adds extra weight to enemy Hero damage; control adds weight to board Attack/Health. These experimental policies exist only in the testing tool and do not change the game AI.','',
table(['AI policy']+factions,[[p]+[pct(v[f]['rate']) for f in factions] for p,v in summary['sensitivity'].items()]),'',
'## Mechanic usage under the shipped AI','',
table(['Faction','Hero attacks/game','Hero Spells/game','Feed/game','Gear Shifts/game','Games with Kakuja','Unused Mana/own turn'],[[f,f"{v['heroAttacksPerGame']:.2f}",f"{v['heroSpellsPerGame']:.2f}",f"{v['feedPerGame']:.2f}",f"{v['gearShiftsPerGame']:.2f}",v['kakujaGames'],f"{v['unusedManaPerTurn']:.2f}"] for f,v in mechanics.items()]),'',
'Mechanic use matters when interpreting the win rates. The bots are one-ply evaluators and can miss multi-action setup, sacrificial Cannibalism, reaction planning and future Gear value. Naruto can occasionally Feed using a temporarily stolen Ghoul. Seeing a mechanic rarely in these games does not show that a skilled player cannot exploit it.','',
'## Recommended next balance work','',
f"1. Rebuild or tune {weak_decks} first. {near_band or weak} is closer to the screening band; distinguish starter-list weaknesses from faction-wide card power.",
'2. Keep Ghoul and Investigator Hero packages separate when reviewing Tokyo Ghoul. Use their matchup-specific rows; Amon’s hunting bonus matters particularly against Tokyo Ghoul.',
f'3. Audit {strong_decks} before applying broad faction nerfs. Review starting Kagune damage and early Quinque equip tempo in the Hero results. Change one lever at a time and rerun the identical seed bank.',
'4. Test complex combinations with human pilots before changing Cannibalism/Kakuja, reaction cards or Gear costs. These bots do not value every future combo correctly.',
'5. Use exact-mirror first-player results to assess the second-player compensation separately from faction power. The shipped bot always chooses the Health Potion; compare intelligent Mana Potion use before changing starting rules.',
'',
'## Method and limits','',
f"Baseline: all nine shipped presets, every unordered pairing, 50 seeds, both seat orders for different presets, and one game per seed for exact mirrors: {len(baseline):,} games. Cross-faction headline rates use {len(cross):,} games and weight all three opposing presets equally. Hero sweep: nine additional Tokyo Ghoul variants × nine baseline opponents × 16 seeds × both seats, plus matched default-Hero baseline observations. Play-style sensitivity: 27 cross-faction preset pairs × 12 seeds × both seats × two alternative policies.",
'',
'The actual default mulligan, going-second potion choice, Mana, fatigue and legal-action rules are enabled. The shipped bot always selects the Health Potion when offered; its one-ply evaluator does not plan ordinary Mana Potion + card sequences, which limits conclusions about optimal going-second play. Matches stop at 2,000 actions or 160 individual turns; capped/error games are excluded from win-rate calculations and reported above. Seeds and both seat orders are fixed. 95% intervals resample whole seed blocks (3,000 draws), preserving shared-seed and seat pairing; they quantify seed variation for these fixed decks, not uncertainty over every possible deck or human player.',
'',
'Bots simulate complete state, including deterministic future RNG and hidden traps, and can therefore make decisions a human player could not. All factions use the same policy, but policy biases can still favor a faction. No claim of competitive or human-play balance follows from these simulations alone. Card-observation CSV values are exploratory: playing/drawing a card is confounded by game length, deck and opponent, so they are not causal card-power estimates.',
'',
f"Game source commit: `{meta['commit']}`. Engine/card/AI source SHA-256: `{meta['gameSourceSha256']}`. The card-name readability update changed UI files only while this run was in progress; the tested game rules are unchanged.",
'',
'Raw matches are in `matches.jsonl` and `hero-tg-supplement/matches.jsonl`; full preset lists and run parameters are in each `metadata.json`. `summary.json`, CSV tables, PNG and SVG plots are included for review. Reproduce with `node tools/balance-anime.mjs --seeds=50 --hero-seeds=16 --sensitivity-seeds=12 --workers=2`, then the Tokyo Ghoul opponent supplement command recorded in the accompanying README.','']
(root/'BALANCE-REPORT.md').write_text('\n'.join(lines))
# A self-contained copy keeps charts readable when downloaded separately.
def inline(text):
    text=html.escape(text)
    text=re.sub(r'\*\*(.*?)\*\*',r'<strong>\1</strong>',text)
    return re.sub(r'`([^`]+)`',r'<code>\1</code>',text)
body=[];in_table=False
for i,line in enumerate(lines):
    if in_table and not line.startswith('|'):
        body.append('</tbody></table></div>');in_table=False
    if line.startswith('|'):
        if re.match(r'^\|[\s|:-]+\|$',line):continue
        cells=[c.strip() for c in line.strip('|').split('|')]
        if not in_table:
            body.append('<div class="table-wrap"><table><thead><tr>'+''.join('<th>'+inline(c)+'</th>' for c in cells)+'</tr></thead><tbody>');in_table=True
        else:body.append('<tr>'+''.join('<td>'+inline(c)+'</td>' for c in cells)+'</tr>')
    elif line.startswith('!['):
        match=re.match(r'!\[(.*?)\]\((.*?)\)',line)
        if match:
            data=base64.b64encode((root/match[2]).read_bytes()).decode()
            body.append('<figure><img alt="'+html.escape(match[1])+'" src="data:image/png;base64,'+data+'"></figure>')
    elif line.startswith('## '):body.append('<h2>'+inline(line[3:])+'</h2>')
    elif line.startswith('# '):body.append('<h1>'+inline(line[2:])+'</h1>')
    elif line:body.append('<p>'+inline(line)+'</p>')
page='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Anime Clash balance report</title><style>body{font:16px/1.6 Arial,sans-serif;color:#20252c;background:#f4f6f8;margin:0}main{max-width:1140px;margin:30px auto;padding:30px;background:white;border-radius:10px}h1{font-size:30px;line-height:1.2}h2{margin-top:36px;border-bottom:2px solid #e2e7eb;padding-bottom:8px}.table-wrap{overflow:auto;margin:22px 0}table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:left;border:1px solid #dbe0e5;padding:10px}th{background:#eaf0f4}tr:nth-child(even){background:#f7f9fa}img{width:100%;height:auto}figure{margin:24px 0}code{overflow-wrap:anywhere;background:#edf0f3;padding:2px 5px}p{margin:16px 0}@media(max-width:650px){main{margin:0;padding:18px}h1{font-size:25px}}</style><main>'+''.join(body)+'</main></html>'
(root/'BALANCE-REPORT.html').write_text(page)
print(json.dumps({k:summary[k] for k in ['games','errors','unfinished','factions','matchups','firstPlayer','mirrorFirstPlayer','length','sensitivity','mechanics']},indent=2))
