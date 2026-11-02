/** Ground-contact dimensions in model-fit pixels; two separated contact bands. */
export const GROUND_TRAIL = {
  stepPx: 5, maxStepPx: 180, turnStepRad: 0.08,
  footprintStepPx: 10, footprintLengthPx: 3, footprintWidthPx: 1.5,
  // USA 3D entries measured against the fitted hull track centres.
  models: {
    'usa:lightTank': { gauge: 36, width: 7, rear: 28, type: 'tread', projected: true },
    'usa:mediumTank': { gauge: 43, width: 9, rear: 34, type: 'tread', projected: true },
    'usa:heavyTank': { gauge: 48, width: 11, rear: 41, type: 'tread', projected: true },
    'usa:howitzer': { gauge: 35, width: 3, rear: -10, type: 'wheel', projected: true },
  },
  classes: {
    lightTank: { gauge: 36, width: 7, rear: 22, type: 'tread' },
    mediumTank: { gauge: 43, width: 9, rear: 28, type: 'tread' },
    tankHunter: { gauge: 43, width: 9, rear: 28, type: 'tread' },
    heavyTank: { gauge: 55, width: 11, rear: 34, type: 'tread' },
    superHeavyTank: { gauge: 68, width: 14, rear: 42, type: 'tread' },
    howitzer: { gauge: 44, width: 9, rear: 28, type: 'tread' },
    atGun: { gauge: 32, width: 3, rear: 6, type: 'wheel' },
    launcher: { gauge: 40, width: 4, rear: 25, type: 'wheel' },
    gatherTruck: { gauge: 30, width: 3, rear: 22, type: 'wheel' },
  },
};
