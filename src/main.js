/**
 * Blitzmire — entry point. Thin by design: construct the Game, boot it, wire
 * the two browser-level lifecycle events, and start the loop. No game logic
 * lives here.
 */
import { Game } from './engine/Game.js';

const game = new Game();
await game.init();
game.start();

window.game = game; // dev console handle (order stack, camera, state probes)

// S60: deferred one frame — reading window.innerWidth/innerHeight
// SYNCHRONOUSLY inside the event handler is the known mobile-orientation
// trap: on a real device rotation the browser can fire 'resize' (and
// 'orientationchange', which doesn't always fire together with it) a beat
// BEFORE its own layout has actually settled to the new dimensions, so an
// immediate read bakes in a transitional/wrong size that the 3D layers
// then render at permanently until the NEXT resize. rAF just waits for
// the next paint, past that race, before Game.onResize() reads anything.
const scheduleResize = () => requestAnimationFrame(() => game.onResize());
window.addEventListener('resize', scheduleResize);
window.addEventListener('orientationchange', scheduleResize);
document.addEventListener('visibilitychange', () => game.onVisibilityChange(document.hidden));
