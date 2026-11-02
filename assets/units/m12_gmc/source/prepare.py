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

# Median olive texels measured from supplied howitzer and current Sherman hull.
source = (85, 87, 60)
target = (80, 72, 39)
factor = [linear(t) / linear(s) for s, t in zip(source, target)] + [1]
for material in document.get('materials', []):
    material.setdefault('pbrMetallicRoughness', {})['baseColorFactor'] = factor

encoded = json.dumps(document, separators=(',', ':')).encode()
encoded += b' ' * (-len(encoded) % 4)
remaining = data[20 + length:]
result = struct.pack('<III', 0x46546C67, 2, 20 + len(encoded) + len(remaining))
result += struct.pack('<II', len(encoded), kind) + encoded + remaining
(ROOT.parent / 'tier01' / 'howitzer.glb').write_bytes(result)
print('Applied linear material factor:', factor)
