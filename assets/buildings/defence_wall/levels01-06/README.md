# Defence perimeter — shared levels 1–6 design

The active modular kit is in `modular/`: walls and corners, watchtowers, gate,
trenches/bridges, wire/supports, hedgehogs, trees, sandbags and field props.
All modules share one level 1–6 visual set. The manifest indexes every GLB.
Old standalone wall, gate and tower models/media have been removed.

Runtime uses DefenceKitConfig with existing layout, sockets, instancing and
collision. No grid, gameplay or camera changes. See modular/README.md for
rebuild inputs and geometry contracts. Required source snapshots are retained;
they are not loaded or bundled into the mobile game.
