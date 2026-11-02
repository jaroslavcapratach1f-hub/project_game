import numpy as np
from PIL import Image
import sys

def remove_bg(path, bg, tol, feather):
    im = Image.open(path).convert('RGB')
    arr = np.array(im).astype(np.float32)
    bg_arr = np.array(bg, dtype=np.float32)
    dist = np.sqrt(((arr - bg_arr) ** 2).sum(axis=2))
    alpha = np.clip((dist - tol) / feather * 255, 0, 255).astype(np.uint8)
    rgb = np.array(im)
    rgba = np.dstack([rgb, alpha])
    return Image.fromarray(rgba.astype(np.uint8), 'RGBA')

if __name__ == '__main__':
    src, dst, bg_str, tol, feather = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]), float(sys.argv[5])
    bg = tuple(int(x) for x in bg_str.split(','))
    out = remove_bg(src, bg, tol, feather)
    out.save(dst)
    print('saved', dst, out.size)
