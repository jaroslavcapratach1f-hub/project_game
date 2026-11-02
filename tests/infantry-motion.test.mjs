import assert from 'node:assert/strict';
import test from 'node:test';
import { M1GarandSquad } from '../src/entities/infantry/M1GarandSquad.js';

test('infantry soldiers keep separate positions and individual gait state', () => {
  const squad = new M1GarandSquad({ id: 'motion', team: 'player', x: 0, y: 0, count: 10 });
  const initialPhases = squad.soldiers.map((s) => s.walkPhase);
  squad.moveTo(220, 100);
  for (let i = 0; i < 18; i++) squad.update(0.1);
  const positions = squad.soldiers.map((s) => `${s.x.toFixed(3)},${s.y.toFixed(3)}`);
  assert.equal(new Set(positions).size, squad.soldiers.length);
  assert.ok(squad.soldiers.some((s, i) => s.isWalking && s.walkPhase !== initialPhases[i]));
  assert.ok(squad.soldiers.every((s) => Number.isFinite(s.travelRotation)));
});

test('infantry legs return to a standing pose after the formation settles', () => {
  const squad = new M1GarandSquad({ id: 'settle', team: 'player', x: 0, y: 0, count: 10 });
  squad.moveTo(80, 0);
  for (let i = 0; i < 140; i++) squad.update(0.1);
  assert.ok(squad.soldiers.every((s) => !s.isWalking));
});
