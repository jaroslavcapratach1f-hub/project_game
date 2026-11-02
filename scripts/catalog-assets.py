from pathlib import Path
import json,hashlib,struct,re
root=Path.cwd();runtime=set()
for p in Path('src').rglob('*.js'):
 for rel in re.findall(r'''['"]([^'"\n]+\.glb)['"]''',p.read_text()):
  candidate=(p.parent/rel).resolve()
  if '*' not in rel and candidate.exists():runtime.add(candidate)
runtime.update(p.resolve() for p in Path('assets/buildings/defence_wall/levels01-06/modular').glob('*.glb'))
entries=[]
for p in sorted(Path('assets').rglob('*.glb')):
 b=p.read_bytes();assert b[:4]==b'glTF',p
 d=json.loads(b[20:20+struct.unpack_from('<I',b,12)[0]])
 triangles=sum(d['accessors'][pr['indices']]['count']//3 if 'indices' in pr else d['accessors'][pr['attributes']['POSITION']]['count']//3 for m in d.get('meshes',[]) for pr in m['primitives'])
 role='runtime' if p.resolve() in runtime else 'rebuild-input'
 entries.append({'path':str(p),'role':role,'bytes':len(b),'triangles':triangles,'sha256':hashlib.sha256(b).hexdigest()})
manifest={'version':1,'updated':'2026-10-11','sharedBuildingVisuals':{'levels':[1,6],'headquarters':'assets/buildings/hq/levels01-06','barracks':'assets/buildings/barracks/levels01-06','treasury':'assets/buildings/treasury/levels01-06','steelworks':'assets/buildings/steelworks/levels01-06','crude_oil':'assets/buildings/crude_oil/levels01-06','engineering':'assets/buildings/engineering/levels01-06','armory':'assets/buildings/armory/levels01-06','research_center':'assets/buildings/research_center/levels01-06','officer_barracks':'assets/buildings/officer_barracks/levels01-06','defence_wall':'assets/buildings/defence_wall/levels01-06/modular','attack_towers':'assets/buildings/defence_wall/levels01-06/modular/watchtower.glb','gate':'assets/buildings/defence_wall/levels01-06/modular/gate.glb'},'models':entries}
Path('assets/asset_catalog.json').write_text(json.dumps(manifest,indent=2)+'\n')
p=Path('assets/buildings/defence_wall/levels01-06/modular/manifest.json');d=json.loads(p.read_text());d['visualLevels']={'min':1,'max':6};d['sharedMeshAcrossLevels']=True
for entry in entries:
 path=Path(entry['path'])
 if path.parent==p.parent:
  old=d['assets'].get(path.stem,{})
  d['assets'][path.stem]={**old,'file':path.name,'triangles':entry['triangles'],'bytes':entry['bytes'],'sha256':entry['sha256'],'status':'active reusable module; current file inspected'}
p.write_text(json.dumps(d,indent=2)+'\n')
print('Catalog:',len(entries),'GLBs;',len(runtime),'runtime meshes')
print('Offline inputs outside source directories:',*[e['path'] for e in entries if e['role']=='rebuild-input' and '/source/' not in e['path']],sep='\n')
