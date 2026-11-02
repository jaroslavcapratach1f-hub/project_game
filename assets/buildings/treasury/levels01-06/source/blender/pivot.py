"""Normalize the exported pivot; the live renderer already performs this same fit."""
import json,struct

def ground_pivot(path):
 data=bytearray(path.read_bytes());n=struct.unpack_from('<I',data,12)[0];doc=json.loads(data[20:20+n]);start=28+n
 ids={p['attributes']['POSITION'] for m in doc['meshes'] for p in m['primitives']}
 lo=[float('inf')]*3;hi=[-float('inf')]*3;rows=[]
 for i in ids:
  a=doc['accessors'][i];v=doc['bufferViews'][a['bufferView']];stride=v.get('byteStride',12);offset=start+v.get('byteOffset',0)+a.get('byteOffset',0)
  rows.append((a,offset,stride))
  for j in range(a['count']):
   xyz=struct.unpack_from('<fff',data,offset+j*stride)
   for k in range(3):lo[k]=min(lo[k],xyz[k]);hi[k]=max(hi[k],xyz[k])
 shift=[(lo[0]+hi[0])/2,lo[1],(lo[2]+hi[2])/2]
 for a,offset,stride in rows:
  for j in range(a['count']):
   xyz=struct.unpack_from('<fff',data,offset+j*stride);struct.pack_into('<fff',data,offset+j*stride,*[xyz[k]-shift[k] for k in range(3)])
  for key in ['min','max']:
   if key in a:a[key]=[a[key][k]-shift[k] for k in range(3)]
 payload=json.dumps(doc,separators=(',',':')).encode();payload+=b' '*(-len(payload)%4);tail=data[20+n:]
 path.write_bytes(struct.pack('<III',0x46546c67,2,20+len(payload)+len(tail))+struct.pack('<II',len(payload),0x4e4f534a)+payload+tail)
