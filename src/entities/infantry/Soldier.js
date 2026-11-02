/**
 * Soldier — one individually-drawn member of an InfantrySquad. Plain data, no
 * PixiJS: identity, live world position, its fixed formation slot offset from
 * the squad centroid (pre-rotation), health, and its firing timer. The squad
 * creates `count` of these once and never allocates more.
 *
 * S57: `rotation`/`travelRotation`/`moveLerp`/`turnRateRadPerSec`/`walkPhase`
 * make each soldier visually independent — its OWN eased facing and
 * formation-closing speed (randomized once here, not shared with the
 * squad's raw `rotation`) instead of every soldier snapping to the
 * identical value every tick, which read as one rigid block moving/
 * pivoting as a unit.
 */
export class Soldier {
  /**
   * @param {object} o { id, x, y, slotX, slotY, hp, fireCooldown?, rotation?,
   *   moveLerp, turnRateRadPerSec, swingPhase }
   */
  constructor(o) {
    this.id = o.id;
    this.x = o.x; // live world px
    this.y = o.y;
    this.slotX = o.slotX; // formation offset from centroid, before heading rotation
    this.slotY = o.slotY;
    this.maxHp = o.hp;
    this.hp = o.hp;
    this.isAlive = true;
    this.fireCooldown = o.fireCooldown ?? 0; // seconds until this soldier's next shot
    this.rotation = o.rotation ?? 0; // this soldier's OWN displayed facing, eases toward squad.rotation
    this.travelRotation = this.rotation; // latest direction of this soldier's own displacement
    this.isWalking = false; // true only while this body is closing on a moving slot
    this.moveLerp = o.moveLerp; // this soldier's own formation-slot follow fraction
    this.turnRateRadPerSec = o.turnRateRadPerSec; // this soldier's own facing catch-up rate
    this.swingPhase = o.swingPhase; // 3D leg walk-cycle: this soldier's own cycle offset
    this.walkPhase = o.swingPhase; // distance-driven gait phase, radians
  }
}
