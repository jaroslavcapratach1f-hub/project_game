# Shared base/perimeter grass

The three 1K JPG maps are Poly Haven **Grass Ground**, by Charlotte Baglioni.
Source: https://polyhaven.com/a/grass_ground
License: CC0 1.0 Universal — https://creativecommons.org/publicdomain/zero/1.0/
Downloaded 2026-10-03 from the official Poly Haven API/download service.

- grass_diff.jpg: grass_ground_diff_1k.jpg
- grass_normal.jpg: grass_ground_nor_gl_1k.jpg
- grass_rough.jpg: grass_ground_rough_1k.jpg

Interior and perimeter use BaseGrassMaterial and world-aligned UVs at one
shared scale. No runtime network request. Traffic marks are separate low-opacity
visual overlays regenerated from current building positions.
