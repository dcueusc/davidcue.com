// Everything the clickable objects reveal. Edit the text here; positions live in scene.js.
// `body` is HTML.

// Countries you've visited. The count on the globe's map uses this list as written; names the map
// spells differently (or draws as part of a bigger country) are translated in worldmap.js ALIASES.
export const VISITED = [
  'United States', 'Mexico', 'Canada', 'England', 'Scotland', 'Ireland', 'Morocco', 'Italy', 'France',
  'Monaco', 'Spain', 'Vatican City', 'Hungary', 'Netherlands', 'Czech Republic', 'Thailand', 'Vietnam',
  'Cambodia', 'Ecuador', 'Germany', 'Switzerland', 'Turkey',
];

// Heroes shown on the mantel bust's carousel. `img` is a transparent bust made with
// tools/gemini.py (add the person to HEROES there) and tools/heroes.py.
export const HEROES = [
  { name: 'Marcus Aurelius', img: '/img/heroes/aurelius.webp', why: "“Think of yourself as dead. You have lived your life. Now, take what’s left and live it properly.”" },
  { name: 'John F. Kennedy', img: '/img/heroes/jfk.webp', why: "“Ask not what your country can do for you—ask what you can do for your country.”" },
  { name: 'Steve Jobs', img: '/img/heroes/jobs.webp', why: "I go on a lot of long walks." },
  { name: 'Theodore Roosevelt', img: '/img/heroes/roosevelt.webp', why: "The strenuous life." },
  { name: 'Alex Honnold', img: '/img/heroes/honnold.webp', why: "Fearless." },
  { name: 'Tom Brady', img: '/img/heroes/brady.webp', why: "Go Pats." },
];

// Shown by the drink on the side table (whiskey in fall and Halloween, a glass in summer, coffee in spring).
const SIPPING = 'Currently sipping: Diet Coke.';

// Photos of you in the little frames on the right-hand bookshelves. Each frame opens the gallery on
// one photo; extra photos beyond the four frames are reached with the arrows.
const MY_PHOTOS = [
  { src: '/img/photos/img_6367.jpg', caption: 'Los Angeles, CA' },
  { src: '/img/photos/img_6368.jpg', caption: 'Mont Blanc, France' },
  { src: '/img/photos/img_6369.jpg', caption: 'Sahara Desert, Morocco' },
  { src: '/img/photos/img_6370.jpg', caption: 'Nice, France' },
  { src: '/img/photos/lexington.jpg', caption: 'Lexington, Massachusetts' },
  { src: '/img/photos/img_6372.jpg', caption: 'Ho Chi Minh City, Vietnam' },
  { src: '/img/photos/img_6371.jpg', caption: 'You know i had to do it to em' },
];

export const content = {
  family: { kicker: 'The painting over the mantel', title: 'Family', photos: [{ src: '/img/photos/family.jpg', caption: 'Love you guys ❤️' }] },
  ...Object.fromEntries(MY_PHOTOS.map((_, i) => [`photo${i}`, { kicker: 'A photo on the shelf', title: 'Me', photos: MY_PHOTOS, start: i }])),
  clock: { kicker: 'The grandfather clock', age: true },
  bookshelf: {
    kicker: 'The bookshelf',
    title: "What I'm reading",
    body: `<ul>
      <li><em>Shoe Dog</em> by Phil Knight</li>
      <li><em>Steve Jobs</em> by Walter Isaacson</li>
      <li><em>Zero to One</em> by Peter Thiel</li>
      <li><em>11/22/63</em> by Stephen King</li>
      <li><em>Purple Cow</em> by Seth Godin</li>
    </ul>`,
  },
  heroes: {
    kicker: 'The bust on the mantel',
    title: 'GOATs',
    heroes: true,
  },
  whiskey: { kicker: 'The whiskey glass', title: SIPPING, body: '' },
  lemonade: { kicker: 'The glass', title: SIPPING, body: '' },
  coffee: { kicker: 'The coffee cup', title: 'Currently sipping: Espresso.', body: '' },
  globe: {
    kicker: 'The globe',
    title: 'Places I\'ve been',
    map: true,
  },
};
