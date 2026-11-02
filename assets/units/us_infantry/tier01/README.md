# USA infantry tier 01

`soldier.glb` is the supplied static TRELLIS export. The runtime uses the
matching `torso.glb`, `leg_l.glb`, and `leg_r.glb` pieces so every soldier has
an independent walk rig. The pieces stay in the original model coordinate
system; `Unit3DConfig.js` owns the shared scale, facing correction, floor
alignment, and hip pivots.

The split preserves the torso above the hip gap and keeps each leg's foot and
shin together. Do not rotate or recenter an individual piece when exporting:
the three files must retain the same source-space origin for the pivots in
`Unit3DConfig.js` to remain valid.

The leg exports retain a small upper-edge offset relative to the torso cut;
the runtime applies the recorded `leg*TopY` values before mounting so the
thighs meet the waist and the full shin/foot length remains visible.

Runtime movement is per `Soldier` struct. Formation slots provide a loose
reference position, while each soldier eases independently, faces its own
travel bearing, and advances its leg phase from distance travelled. A stopped
soldier returns both legs to the authored rest pose.

The runtime keeps each leg mesh relative to its own hip group. The walk pose
combines forward/back swing with a small opposite inward hip angle, so the
feet pass across the body's centre line during a step instead of rocking in
place.
