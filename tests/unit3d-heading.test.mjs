import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3, OrthographicCamera } from 'three';
import { Unit3DLayer } from '../src/engine/Unit3DLayer.js';
import { BASE3D } from '../src/config/Base3DConfig.js';

const layer = Object.create(Unit3DLayer.prototype);
layer._originPx = { x: 8250, y: 9526 };
const up = new Vector3(0, 1, 0);
const radians = Math.PI / 180;
const camera = new OrthographicCamera(-500, 500, 500, -500, 0.1, 4000);
const az = BASE3D.azimuthDeg * radians, pitch = BASE3D.pitchDeg * radians;
camera.position.set(Math.cos(pitch) * Math.cos(az), Math.sin(pitch), Math.cos(pitch) * Math.sin(az));
camera.position.multiplyScalar(1000);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld();

function projectedHeading(angle) {
  const nose = new Vector3(1, 0, 0).applyAxisAngle(up, angle).project(camera);
  const origin = new Vector3().project(camera);
  return new Vector3(nose.x - origin.x, -(nose.y - origin.y), 0).normalize();
}

test('hull forward projects along travel at every 5-degree world heading', () => {
  for (let degrees = -180; degrees < 180; degrees += 5) {
    const world = degrees * radians;
    const projected = projectedHeading(layer.headingToSceneY(world));
    const motion = new Vector3(Math.cos(world), Math.sin(world), 0);
    assert.ok(projected.dot(motion) > 1 - 1e-10, `heading ${degrees}`);
  }
});

test('independent turret aim composes correctly over every hull orientation', () => {
  for (let hull = -180; hull < 180; hull += 30) {
    for (let aim = -180; aim < 180; aim += 15) {
      const hullY = layer.headingToSceneY(hull * radians);
      const relativeY = layer.headingToSceneY(aim * radians) - hullY;
      const projected = projectedHeading(hullY + relativeY);
      const target = new Vector3(Math.cos(aim * radians), Math.sin(aim * radians), 0);
      assert.ok(projected.dot(target) > 1 - 1e-10, `hull ${hull}, aim ${aim}`);
    }
  }
});

test('trail contacts match actual Three camera projection at every heading', async () => {
  const { contactOffset } = await import('../src/effects/TrailProjection.js');
  const out = {};
  for (let degrees=-180; degrees<180; degrees+=5) {
    const heading=degrees*radians;
    for (const side of [-24,24]) {
      const point=new Vector3(-41,0,side).multiplyScalar(BASE3D.cameraScale)
        .applyAxisAngle(up,layer.headingToSceneY(heading)).project(camera);
      const origin=new Vector3().project(camera);
      contactOffset(heading,-41,side,true,out);
      assert.ok(Math.abs(out.x-(point.x-origin.x)*500)<1e-8);
      assert.ok(Math.abs(out.y+(point.y-origin.y)*500)<1e-8);
    }
  }
});
