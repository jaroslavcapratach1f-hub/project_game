"""Detailed repeatable trench revetment. Local X follows bank, GLB +Z points outward.
Open channel boundary is Z=0: all geometry stays behind it, including stakes.
Floor/miters/access cuts are resolved from the shared continuous runtime path.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from mesh_tools import *

def trench_revetment():
    r = random.Random(1939)
    # Rounded compacted spoil with an irregular crest, rather than a smooth slab.
    cube('Compacted earth shoulder',(0,-.115,.095),(.402,.23,.19),dirt,.055)
    for i in range(4):
        x=-.15+i*.1
        o=cube('Uneven packed soil crest',(x,-.115,.175+r.uniform(-.012,.012)),
               (.118,.19,.075),dirt,.031)
        o.rotation_euler.z=r.uniform(-.06,.06)
    # Actual individually bevelled retaining planks, three visible horizontal courses.
    for row in range(3):
        z=.052+row*.071
        cube('Retaining timber course',(0,-.026,z),(.394,.042,.063),wood if row%2 else woodlight,0)
        beam('Timber grain split',(-.16,-.003,z-.012),(.13,-.003,z-.009),.004,.005,wooddark)
    # Front stakes sit within bank volume, never across the walking channel.
    for x in [-.173,.173]:
        cube('Revetment stake',(x,-.024,.123),(.035,.039,.242),wooddark,0)
        cube('Worn stake crown',(x,-.024,.247),(.035,.039,.009),woodlight,0)
        for z in [.075,.19]:
            cube('Iron retaining nail',(x,-.003,z),(.009,.004,.009),metal,0)
    # Separate timber coping blocks retain the reference's articulated edge silhouette.
    cube('Weathered coping timber',(0,-.055,.231),(.392,.107,.046),woodlight,.011)
    for i in range(3):
        x=-.14+i*.13
        o=cube('Earth clod',(x,-.21,.054),(.07,.055,.039),dirt,.016)
        o.rotation_euler.z=r.uniform(-.4,.4)

if __name__ == '__main__':
    import json
    reset();trench_revetment(); info=export('trench_revetment')
    path=ROOT/'manifest.json';manifest=json.loads(path.read_text())
    manifest['assets']['trench_revetment']=info
    path.write_text(json.dumps(manifest,indent=2))
