"""Match material paint response to the live Sherman; preserve mesh and textures."""
import json
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parent
data = (ROOT / 'original.glb').read_bytes()
length, kind = struct.unpack_from('<II', data, 12)
document = json.loads(data[20:20 + length])

def linear(value):
    value /= 255
    return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4

# Flat-panel paint color for each texture: median of every 32x32 block whose
# std is low (a uniform painted panel, not an edge/rivet/shadow) and mean
# brightness sits in a plausible paint range — robust against the large
# near-black UV-gap area every TRELLIS atlas has (a whole-image median was
# tried first and skewed FAR too dark, which then wildly over-brightened
# the in-game render — this block-based measurement is what actually
# matches the visible in-game panels).
source = (75.86328125, 69.46191406, 40.859375)  # Pershing atlas
target = (85.66113281, 82.48925781, 39.83300781)  # Sherman hull atlas, same method
factor = [linear(t) / linear(s) for s, t in zip(source, target)] + [1]
for material in document.get('materials', []):
    material.setdefault('pbrMetallicRoughness', {})['baseColorFactor'] = factor

encoded = json.dumps(document, separators=(',', ':')).encode()
encoded += b' ' * (-len(encoded) % 4)
remaining = data[20 + length:]
result = struct.pack('<III', 0x46546C67, 2, 20 + len(encoded) + len(remaining))
result += struct.pack('<II', len(encoded), kind) + encoded + remaining
(ROOT.parent / 'tier01' / 'm26_pershing.glb').write_bytes(result)
print('Applied linear material factor:', factor)
