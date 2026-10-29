// Scene layout, in pixels of the 1600x900 office images. Every scene shares it.

export const W = 1600;
export const H = 900;

// Order shown in the scene menu. `group` splits the menu into seasons and holidays.
export const SCENES = [
  { id: 'winter', label: 'Winter', icon: '❄️', group: 'Seasons' },
  { id: 'spring', label: 'Spring', icon: '🌸', group: 'Seasons' },
  { id: 'summer', label: 'Summer', icon: '☀️', group: 'Seasons' },
  { id: 'fall', label: 'Fall', icon: '🍂', group: 'Seasons' },
  { id: 'birthday', label: 'Birthday', icon: '🎂', group: 'Holidays' },
  { id: 'valentines', label: "Valentine's Day", icon: '💘', group: 'Holidays' },
  { id: 'stpatricks', label: "St. Patrick's Day", icon: '☘️', group: 'Holidays' },
  { id: 'easter', label: 'Easter', icon: '🐣', group: 'Holidays' },
  { id: 'july4', label: 'Fourth of July', icon: '🎆', group: 'Holidays' },
  { id: 'halloween', label: 'Halloween', icon: '🎃', group: 'Holidays' },
  { id: 'thanksgiving', label: 'Thanksgiving', icon: '🦃', group: 'Holidays' },
  { id: 'christmas', label: 'Christmas', icon: '🎅', group: 'Holidays' },
  { id: 'nye', label: "New Year's Eve", icon: '🥂', group: 'Holidays' },
  // hidden: not in the menu or the window's cycle; only shows on April 20
  { id: 'fourtwenty', label: '4/20', icon: '🌿', group: 'Holidays', hidden: true },
];

// Your birthday as [month (1-12), day]. The birthday scene shows that day.
export const BIRTHDAY = [12, 3];
export const BIRTH_YEAR = 2003;

// What is alive in each scene: which light groups are lit, the weather outside the window,
// and extra effects. Light groups are defined on LIGHTS below.
const EVENING = ['candles', 'picture', 'lamp', 'street'];
export const PROFILES = {
  fall: { lights: [...EVENING, 'fire'], weather: 'leaves', embers: true },
  winter: { lights: [...EVENING, 'fire'], weather: 'snow', embers: true, tree: true },
  spring: { lights: ['lamp'], weather: 'petals', tint: 'spring' },
  summer: { lights: ['lamp'], weather: 'fireflies', motes: true, curtain: true, tint: 'summer' },
  halloween: { lights: ['lamp', 'streetHalloween', 'fire', 'lantern', 'screen'], weather: 'darkLeaves', embers: true, lightning: true },
  birthday: { lights: [...EVENING, 'fire'], weather: 'snow', embers: true, confetti: true },
  july4: { lights: [...EVENING, 'fire'], weather: 'fireworks', embers: true, curtain: true, curtainStop: 415, walkers: 'july4' }, // stops above Uncle Sam's hat
  christmas: { lights: [...EVENING, 'fire'], weather: 'snow', embers: true, tree: true, santa: true, walkers: 'christmas' },
  stpatricks: { lights: ['lamp'], weather: 'petals', gold: true, tint: 'spring', leprechaun: true, books: true },
  thanksgiving: { lights: [...EVENING, 'fire'], weather: 'leaves', embers: true, turkey: true, pilgrim: true },
  easter: { lights: ['lamp'], weather: 'petals', tint: 'spring' },
  fourtwenty: { lights: [...EVENING, 'ember'], weather: 'petals' },
  nye: { lights: [...EVENING, 'fire'], weather: 'fireworks', embers: true, confetti: true, year: true },
  valentines: { lights: [...EVENING, 'fire'], weather: 'snow', embers: true },
};

// Glass panes of the big window (mullions excluded), used to clip weather particles.
export const PANES = [
  [760, 107, 841, 230], [852, 107, 960, 230], [985, 107, 1070, 230],
  [760, 240, 841, 380], [852, 240, 960, 380], [985, 240, 1070, 380],
  [760, 392, 841, 580], [852, 392, 960, 580], [985, 392, 1070, 580],
];

export const FIREPLACE = [1462, 600, 1560, 820];

// kind sets the flicker character: candle (quick, small), lamp (steady), fire (big, fast),
// street (slow hum), lantern (jack-o'-lantern), screen (laptop).
export const LIGHTS = [
  // chandelier
  { x: 602, y: 60, r: 38, kind: 'candle', group: 'candles' },
  { x: 645, y: 40, r: 38, kind: 'candle', group: 'candles' },
  { x: 737, y: 30, r: 38, kind: 'candle', group: 'candles' },
  { x: 792, y: 55, r: 38, kind: 'candle', group: 'candles' },
  { x: 780, y: 74, r: 30, kind: 'candle', group: 'candles' },
  { x: 700, y: 110, r: 190, kind: 'candle', group: 'candles', soft: true },
  // wall sconces and mantel candles
  { x: 1421, y: 247, r: 30, kind: 'candle', group: 'candles' },
  { x: 1434, y: 240, r: 30, kind: 'candle', group: 'candles' },
  { x: 1580, y: 155, r: 34, kind: 'candle', group: 'candles' },
  { x: 1594, y: 145, r: 30, kind: 'candle', group: 'candles' },
  { x: 1421, y: 330, r: 26, kind: 'candle', group: 'candles' },
  { x: 1447, y: 326, r: 26, kind: 'candle', group: 'candles' },
  // picture light over the harbor painting
  { x: 42, y: 218, r: 60, kind: 'lamp', group: 'picture' },
  // banker's lamp + pool of light on the desk
  { x: 530, y: 496, r: 46, kind: 'lamp', group: 'lamp' },
  { x: 500, y: 585, r: 150, kind: 'lamp', group: 'lamp', soft: true },
  // gas lamp outside
  { x: 916, y: 442, r: 34, kind: 'street', group: 'street' },
  { x: 916, y: 428, r: 34, kind: 'street', group: 'streetHalloween' },
  // fire
  { x: 1512, y: 740, r: 120, kind: 'fire', group: 'fire' },
  { x: 1450, y: 760, r: 260, kind: 'fire', group: 'fire', soft: true },
  // halloween: jack-o'-lanterns and the laptop glow on the mask
  { x: 500, y: 578, r: 60, kind: 'lantern', group: 'lantern' },
  { x: 1403, y: 405, r: 24, kind: 'lantern', group: 'lantern' },
  { x: 1442, y: 398, r: 24, kind: 'lantern', group: 'lantern' },
  { x: 1505, y: 393, r: 24, kind: 'lantern', group: 'lantern' },
  { x: 1045, y: 615, r: 80, kind: 'screen', group: 'screen' },
  // 4/20: the ember on the tip of David's joint
  { x: 364, y: 486, r: 9, kind: 'lantern', group: 'ember' },
];

// Hands that type: each rect is nudged down a pixel or two on a keystroke.
const DAVID_HANDS = {
  fall: [[355, 566, 398, 601], [398, 566, 434, 601]],
  winter: [[358, 566, 405, 601], [405, 566, 441, 601]],
  spring: [[355, 566, 400, 601], [400, 566, 441, 601]],
  summer: [[363, 568, 405, 602], [405, 568, 437, 602]],
  halloween: [[350, 566, 380, 602], [380, 566, 410, 602]],
  birthday: [[356, 566, 398, 600], [398, 566, 432, 600]],
  july4: [[360, 568, 402, 600], [402, 568, 445, 600]],
  christmas: [[358, 571, 400, 604], [400, 571, 438, 604]],
  stpatricks: [[356, 566, 400, 600], [400, 566, 438, 600]],
  thanksgiving: [[358, 568, 400, 600], [400, 568, 430, 600]],
  easter: [[355, 572, 398, 605], [398, 572, 440, 605]],
  fourtwenty: [[356, 568, 400, 599], [400, 568, 440, 599]],
  nye: [[387, 566, 410, 598], [410, 566, 440, 598]], // left of 387 is the champagne glass
  valentines: [[360, 566, 400, 600], [400, 566, 440, 600]],
};
export const TYPERS = Object.fromEntries(SCENES.map(({ id }) => [id, [{ hands: DAVID_HANDS[id] }]]));
TYPERS.halloween.push({ hands: [[1076, 626, 1102, 660], [1102, 620, 1137, 654]] });
TYPERS.easter.push({ hands: [[1050, 636, 1076, 664], [1076, 634, 1104, 664]] });
TYPERS.july4.push({ hands: [[1050, 620, 1078, 650], [1078, 618, 1108, 650]] });

// The sheer curtain blowing in the window (summer, July 4th), as a polygon to ripple.
// It stops at the armchair's back (y 568) so the chair and side table stay still.
export const CURTAIN = [
  [1034, 76], [1100, 76], [1116, 200], [1150, 320], [1172, 400], [1196, 500], [1204, 568],
  [1140, 568], [1086, 420], [1046, 250],
];

// Passers-by on the sidewalk outside the window: head and shoulders, first at 4s, then every 30s,
// taking turns. `bottom` is where their shoulders end; `front` are bits of the scene in front of
// them (window boxes, a guest in the armchair) that are drawn back over them.
export const WALKERS = {
  christmas: { names: ['christmas-elf'], bottom: 578, front: [[1012, 522, 1075, 582]] }, // Santa's milk glass is in front
  // in front of the flower boxes; only the window-seat pillows, the frame and Uncle Sam cover them
  july4: { names: ['washington', 'franklin'], bottom: 600, front: [[700, 525, 835, 600], [995, 535, 1062, 600], [1045, 428, 1110, 600]] },
};

// New Year's Eve: the coming year hangs under the HAPPY NEW YEAR banner (center x, top y).
export const YEAR_SIGN = { x: 962, y: 290 };

// Thanksgiving: the pilgrim's open book. A page flips from the right edge over the spine to the left.
export const BOOK = { spine: [1075, 607], right: [1099, 604], left: [1052, 600] };

// St. Patrick's: where gold glints (pot of gold, coin trail on the rug).
export const GOLD = [[1296, 696, 1424, 726], [912, 832, 1408, 872]];

// Clickable objects. Rects are [x1, y1, x2, y2] and `id` keys into content.js.
// `me` scrolls to the intro section instead of opening a pop-up. `scenes` limits a spot to the
// scenes where that object appears.
export const HOTSPOTS = [
  { id: 'bookshelf', label: 'Bookshelf', rect: [322, 85, 505, 400] },
  { id: 'heroes', label: 'GOATs', rect: [1458, 335, 1512, 408] },
  { id: 'me', label: 'David', rect: [240, 405, 370, 560] },
  { id: 'globe', label: 'Places', rect: [0, 495, 140, 680] },
  { id: 'window', label: 'Window: change the scene', rect: [756, 100, 1075, 585] },
  { id: 'clock', label: 'Grandfather clock', rect: [528, 250, 624, 555] },
  { id: 'family', label: 'Family portrait', rect: [1462, 90, 1578, 322] },
  // little photo frames on the right-hand shelves (the one behind the tree's star is hidden in winter)
  { id: 'photo0', label: 'Photo', rect: [1346, 104, 1390, 162] },
  { id: 'photo1', label: 'Photo', rect: [1246, 234, 1296, 286], scenes: SCENES.map((s) => s.id).filter((s) => !['winter', 'christmas'].includes(s)) },
  { id: 'photo2', label: 'Photo', rect: [1382, 286, 1428, 348] },
  { id: 'photo3', label: 'Photo', rect: [1348, 362, 1420, 428] },
  { id: 'whiskey', label: 'Whiskey glass', rect: [1296, 578, 1330, 620], scenes: ['fall', 'halloween'] },
  { id: 'lemonade', label: 'Glass', rect: [1294, 564, 1330, 620], scenes: ['summer'] },
  { id: 'coffee', label: 'Coffee', rect: [1232, 586, 1280, 616], scenes: ['spring'] },
];
