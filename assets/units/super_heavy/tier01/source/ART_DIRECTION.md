# German super-heavy — starting 5-star art

User decision (2026-10-04): five stars is this class's LOWEST rating. Keep a
basic WWII configuration; do not imply advanced upgrades with extra weapons,
modern sensors, reactive armour or excessive equipment. Larger than heavy;
German grey, Germany only. Preserve existing gameplay/stat progression.

Research: Panzer VIII Maus, already the game's German super-heavy roster entry.
- The Tank Museum, David Willey, “A Maus Tale”, 11 April 2023:
  https://tankmuseum.org/a-maus-tale/
  Historical prototype photographs, enormous armoured hull, rear-set turret,
  roof hatches/periscopes, 128 mm main weapon. No invented advanced equipment.
- Front and rear photographs by Alf van Beem, 16 August 2016, public domain:
  https://commons.wikimedia.org/wiki/File:Pz.Kpfw_VIII_Maus_in_the_Kubinka_Museum_pic6.jpg
  https://commons.wikimedia.org/wiki/File:Pz.Kpfw_VIII_Maus_in_the_Kubinka_Museum.JPG
  Used as geometry references only; no museum scene/text/camouflage copied into
  the generated art. Grey paint is the game's faction convention.

Recognizable shape: long tall hull with thick full-length side armour hiding
most road wheels; very wide tracks; sloping glacis; rearward massive flat-roofed
turret with curved frontal face; long plain-muzzle main gun and short coaxial
barrel. Avoid an enlarged Pershing/Tiger silhouette.

Image generation: built-in imagegen tool, two museum geometry references.
Prompt: realistic PBR isolated front-three-quarter Maus, exact photographed
hull/turret proportions, neutral German grey, basic starting five-star WWII
equipment, restrained wear, no modern upgrades, no insignia/text, white backdrop.
Saved reference: concept.png. Generated using built-in imagegen with the two
museum geometry photographs; reconstructed through Replicate TRELLIS. See
`generation.json` for the exact reconstruction version/settings. The runtime
GLBs are prepared from original.glb and rendered in ../maus_preview.png.
Rejected procedural and Pershing-like iterations were deleted at user request.
