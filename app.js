// ==========================================
// Element Alchemy - Core Logic
// ==========================================

const BASE_ELEMENTS = [
    { id: 'water', name: 'water', icon: 'icons/water.svg' },
    { id: 'fire', name: 'fire', icon: 'icons/fire.svg' },
    { id: 'earth', name: 'earth', icon: 'icons/earth.svg' },
    { id: 'air', name: 'air', icon: 'icons/air.svg' },
];

let elements = {};
let iconCache = {};
let unlocked = new Set();
let recipes = {};
let resultToSources = {};
let finalItems = new Set();
let discoveredRecipes = new Set();
let godMode = false;
let godModeSnapshot = null;
let confirmAction = 'clearCanvas';
let normalSidebarSearch = '';
let adminSidebarSearch = '';
let canvasItems = [];
let normalCanvasItems = [];
let adminCanvasItems = [];
let nextUid = 1;
let settings = { theme: 'default', mode: 'dark' };

let dragItem = null;
let dragOffset = { x: 0, y: 0 };
let dragSource = null;
let dragClone = null;

const canvas = document.getElementById('canvas');
const rightSidebar = document.getElementById('right-sidebar');
const sidebarElements = document.getElementById('sidebar-elements');
const encyclopediaModal = document.getElementById('encyclopedia-modal');
const discoveryModal = document.getElementById('discovery-modal');
const confirmModal = document.getElementById('confirm-modal');
const adminPasswordModal = document.getElementById('admin-password-modal');
const adminPasswordInput = document.getElementById('admin-password-input');
const searchBox = document.getElementById('search-box');

const ADMIN_PASSWORD_HASH = '5f1ba4f1f23a1f41679f2bd426f76f13001feac2e550665ae6ba37ce0a1b7ec1';
const ADMIN_PASSWORD_SALT = 'ShrimpAlchemy2024!';
const ADMIN_PASSWORD_ITERATIONS = 100;
const GAME_VERSION = '1.4';
const itemsList = document.getElementById('items-list');
const achievementCount = document.getElementById('achievement-count');

async function init() {
    BASE_ELEMENTS.forEach(el => {
        elements[el.id] = { ...el, discovered: true };
        unlocked.add(el.id);
    });
    await preloadIcons();

    // Register new elements
    elements['lake'] = { id: 'lake', name: 'lake', icon: 'icons/lake.svg', discovered: false };
    elements['ocean'] = { id: 'ocean', name: 'ocean', icon: 'icons/ocean.svg', discovered: false };
    elements['land'] = { id: 'land', name: 'land', icon: 'icons/land.svg', discovered: false };
    elements['planet'] = { id: 'planet', name: 'planet', icon: 'icons/planet.svg', discovered: false };
    elements['pressure'] = { id: 'pressure', name: 'pressure', icon: 'icons/pressure.svg', discovered: false };
    elements['heat'] = { id: 'heat', name: 'heat', icon: 'icons/heat.svg', discovered: false };
    elements['stone'] = { id: 'stone', name: 'stone', icon: 'icons/stone.svg', discovered: false };
    elements['hill'] = { id: 'hill', name: 'hill', icon: 'icons/hill.svg', discovered: false };
    elements['mountain'] = { id: 'mountain', name: 'mountain', icon: 'icons/mountain.svg', discovered: false };
    elements['range'] = { id: 'range', name: 'range', icon: 'icons/range.svg', discovered: false };
    elements['wind'] = { id: 'wind', name: 'wind', icon: 'icons/wind.svg', discovered: false };
    elements['cold'] = { id: 'cold', name: 'cold', icon: 'icons/cold.svg', discovered: false };
    elements['smoke'] = { id: 'smoke', name: 'smoke', icon: 'icons/smoke.svg', discovered: false };
    elements['lightning'] = { id: 'lightning', name: 'lightning', icon: 'icons/lightning.svg', discovered: false };
    elements['rain'] = { id: 'rain', name: 'rain', icon: 'icons/rain.svg', discovered: false };
    elements['ice'] = { id: 'ice', name: 'ice', icon: 'icons/ice.svg', discovered: false };
    elements['icicles'] = { id: 'icicles', name: 'icicles', icon: 'icons/icicles.svg', discovered: false };
    elements['snowflake'] = { id: 'snowflake', name: 'snowflake', icon: 'icons/snowflake.svg', discovered: false };
    elements['snow'] = { id: 'snow', name: 'snow', icon: 'icons/snow.svg', discovered: false };
    elements['hail'] = { id: 'hail', name: 'hail', icon: 'icons/hail.svg', discovered: false };
    elements['comet'] = { id: 'comet', name: 'comet', icon: 'icons/comet.svg', discovered: false };
    elements['glass-water'] = { id: 'glass-water', name: 'glass water', icon: 'icons/glass-water.svg', discovered: false };
    elements['magic'] = { id: 'magic', name: 'magic', icon: 'icons/magic.svg', discovered: false };
    elements['magic-potion'] = { id: 'magic-potion', name: 'magic potion', icon: 'icons/magic-potion.svg', discovered: false };
    elements['electricity'] = { id: 'electricity', name: 'electricity', icon: 'icons/electricity.svg', discovered: false };
    elements['tap'] = { id: 'tap', name: 'tap', icon: 'icons/tap.svg', discovered: false };
    elements['ship'] = { id: 'ship', name: 'ship', icon: 'icons/ship.svg', discovered: false };
    elements['tsunami'] = { id: 'tsunami', name: 'tsunami', icon: 'icons/tsunami.svg', discovered: false };
    elements['lightbulb'] = { id: 'lightbulb', name: 'lightbulb', icon: 'icons/lightbulb.svg', discovered: false };
    elements['airplane'] = { id: 'airplane', name: 'airplane', icon: 'icons/airplane.svg', discovered: false };
    elements['magnet'] = { id: 'magnet', name: 'magnet', icon: 'icons/magnet.svg', discovered: false };
    elements['blade'] = { id: 'blade', name: 'blade', icon: 'icons/blade.svg', discovered: false };
    elements['stick'] = { id: 'stick', name: 'stick', icon: 'icons/stick.svg', discovered: false };
    elements['sun'] = { id: 'sun', name: 'sun', icon: 'icons/sun.svg', discovered: false };
    elements['sunset'] = { id: 'sunset', name: 'sunset', icon: 'icons/sunset.svg', discovered: false };
    elements['moon'] = { id: 'moon', name: 'moon', icon: 'icons/moon.svg', discovered: false };
    elements['tornado'] = { id: 'tornado', name: 'tornado', icon: 'icons/tornado.svg', discovered: false };
    elements['metal'] = { id: 'metal', name: 'metal', icon: 'icons/metal.svg', discovered: false };
    elements['volcano'] = { id: 'volcano', name: 'volcano', icon: 'icons/volcano.svg', discovered: false };
    elements['burst'] = { id: 'burst', name: 'burst', icon: 'icons/burst.svg', discovered: false };
    elements['glass'] = { id: 'glass', name: 'glass', icon: 'icons/glass.svg', discovered: false };
    elements['glasses'] = { id: 'glasses', name: 'glasses', icon: 'icons/glasses.svg', discovered: false };
    elements['time'] = { id: 'time', name: 'hourglass', icon: 'icons/time.svg', discovered: false };
    elements['steam'] = { id: 'steam', name: 'steam', icon: 'icons/steam.svg', discovered: false };
    elements['cloud'] = { id: 'cloud', name: 'cloud', icon: 'icons/cloud.svg', discovered: false };
    elements['fog'] = { id: 'fog', name: 'fog', icon: 'icons/fog.svg', discovered: false };
    elements['sand'] = { id: 'sand', name: 'sand', icon: 'icons/sand.svg', discovered: false };
    elements['light'] = { id: 'light', name: 'light', icon: 'icons/light.svg', discovered: false };
    elements['star'] = { id: 'star', name: 'star', icon: 'icons/star.svg', discovered: false };
    elements['night'] = { id: 'night', name: 'night', icon: 'icons/night.svg', discovered: false };
    elements['shooting-star'] = { id: 'shooting-star', name: 'shooting star', icon: 'icons/shooting-star.svg', discovered: false };
    elements['energy'] = { id: 'energy', name: 'energy', icon: 'icons/energy.svg', discovered: false };
    elements['rainbow'] = { id: 'rainbow', name: 'rainbow', icon: 'icons/rainbow.svg', discovered: false };
    elements['ice-water'] = { id: 'ice-water', name: 'ice water', icon: 'icons/ice-water.svg', discovered: false };
    elements['starfish'] = { id: 'starfish', name: 'starfish', icon: 'icons/starfish.svg', discovered: false };
    elements['igloo'] = { id: 'igloo', name: 'igloo', icon: 'icons/igloo.svg', discovered: false };
    elements['universe'] = { id: 'universe', name: 'universe', icon: 'icons/universe.svg', discovered: false };
    elements['avalanche'] = { id: 'avalanche', name: 'avalanche', icon: 'icons/avalanche.svg', discovered: false };
    elements['sunglasses'] = { id: 'sunglasses', name: 'sunglasses', icon: 'icons/sunglasses.svg', discovered: false };
    elements['ufo'] = { id: 'ufo', name: 'ufo', icon: 'icons/ufo.svg', discovered: false };
    elements['life'] = { id: 'life', name: 'life', icon: 'icons/life.svg', discovered: false };
    elements['animal'] = { id: 'animal', name: 'animal', icon: 'icons/animal.svg', discovered: false };
    elements['sky'] = { id: 'sky', name: 'sky', icon: 'icons/sky.svg', discovered: false };
    elements['bird'] = { id: 'bird', name: 'bird', icon: 'icons/bird.svg', discovered: false };
    elements['chicken'] = { id: 'chicken', name: 'chicken', icon: 'icons/chicken.svg', discovered: false };
    elements['dessert'] = { id: 'dessert', name: 'dessert', icon: 'icons/dessert.svg', discovered: false };
    elements['island'] = { id: 'island', name: 'island', icon: 'icons/island.svg', discovered: false };
    elements['human'] = { id: 'human', name: 'human', icon: 'icons/human.svg', discovered: false };
    elements['alien'] = { id: 'alien', name: 'alien', icon: 'icons/alien.svg', discovered: false };
    elements['scissors'] = { id: 'scissors', name: 'scissors', icon: 'icons/scissors.svg', discovered: false };
    elements['civilization'] = { id: 'civilization', name: 'civilization', icon: 'icons/civilization.svg', discovered: false };
    elements['plant'] = { id: 'plant', name: 'plant', icon: 'icons/plant.svg', discovered: false };
    elements['tree'] = { id: 'tree', name: 'tree', icon: 'icons/tree.svg', discovered: false };
    elements['forest'] = { id: 'forest', name: 'forest', icon: 'icons/forest.svg', discovered: false };
    elements['seed'] = { id: 'seed', name: 'seed', icon: 'icons/seed.svg', discovered: false };
    elements['leaf'] = { id: 'leaf', name: 'leaf', icon: 'icons/leaf.svg', discovered: false };
    elements['brick'] = { id: 'brick', name: 'brick', icon: 'icons/brick.svg', discovered: false };
    elements['wall'] = { id: 'wall', name: 'wall', icon: 'icons/wall.svg', discovered: false };
    elements['firewall'] = { id: 'firewall', name: 'firewall', icon: 'icons/firewall.svg', discovered: false };
    elements['house'] = { id: 'house', name: 'house', icon: 'icons/house.svg', discovered: false };
    elements['farm'] = { id: 'farm', name: 'farm', icon: 'icons/farm.svg', discovered: false };
    elements['village'] = { id: 'village', name: 'village', icon: 'icons/village.svg', discovered: false };
    elements['flower'] = { id: 'flower', name: 'flower', icon: 'icons/flower.svg', discovered: false };
    elements['wheat'] = { id: 'wheat', name: 'wheat', icon: 'icons/wheat.svg', discovered: false };
    elements['corn'] = { id: 'corn', name: 'corn', icon: 'icons/corn.svg', discovered: false };
    elements['popcorn'] = { id: 'popcorn', name: 'popcorn', icon: 'icons/popcorn.svg', discovered: false };
    elements['vegetable'] = { id: 'vegetable', name: 'vegetable', icon: 'icons/vegetable.svg', discovered: false };
    elements['fruit'] = { id: 'fruit', name: 'fruit', icon: 'icons/fruit.svg', discovered: false };
    elements['juice'] = { id: 'juice', name: 'juice', icon: 'icons/juice.svg', discovered: false };

    elements['acorn'] = { id: 'acorn', name: 'acorn', icon: 'icons/acorn.svg', discovered: false };
    elements['family'] = { id: 'family', name: 'family', icon: 'icons/family.svg', discovered: false };
    elements['city'] = { id: 'city', name: 'city', icon: 'icons/city.svg', discovered: false };
    elements['apartment'] = { id: 'apartment', name: 'apartment', icon: 'icons/apartment.svg', discovered: false };
    elements['broccoli'] = { id: 'broccoli', name: 'broccoli', icon: 'icons/broccoli.svg', discovered: false };
    elements['crystal-ball'] = { id: 'crystal-ball', name: 'crystal ball', icon: 'icons/crystal-ball.svg', discovered: false };
    elements['seaweed'] = { id: 'seaweed', name: 'seaweed', icon: 'icons/seaweed.svg', discovered: false };
    elements['chimney'] = { id: 'chimney', name: 'chimney', icon: 'icons/chimney.svg', discovered: false };
    elements['flour'] = { id: 'flour', name: 'flour', icon: 'icons/flour.svg', discovered: false };
    elements['rice'] = { id: 'rice', name: 'rice', icon: 'icons/rice.svg', discovered: false };
    elements['cauldron'] = { id: 'cauldron', name: 'cauldron', icon: 'icons/cauldron.svg', discovered: false };
    elements['bomb'] = { id: 'bomb', name: 'bomb', icon: 'icons/bomb.svg', discovered: false };
    elements['wilt'] = { id: 'wilt', name: 'wilt', icon: 'icons/wilt.svg', discovered: false };
    elements['salad'] = { id: 'salad', name: 'salad', icon: 'icons/salad.svg', discovered: false };
    elements['cactus'] = { id: 'cactus', name: 'cactus', icon: 'icons/cactus.svg', discovered: false };
    elements['egg'] = { id: 'egg', name: 'egg', icon: 'icons/egg.svg', discovered: false };
    elements['crow'] = { id: 'crow', name: 'crow', icon: 'icons/crow.svg', discovered: false };
    elements['gem'] = { id: 'gem', name: 'gem', icon: 'icons/gem.svg', discovered: false };
    elements['blender'] = { id: 'blender', name: 'blender', icon: 'icons/blender.svg', discovered: false };
    elements['bucket'] = { id: 'bucket', name: 'bucket', icon: 'icons/bucket.svg', discovered: false };
    elements['sheep'] = { id: 'sheep', name: 'sheep', icon: 'icons/sheep.svg', discovered: false };
    elements['fiber'] = { id: 'fiber', name: 'fiber', icon: 'icons/fiber.svg', discovered: false };
    elements['string'] = { id: 'string', name: 'string', icon: 'icons/string.svg', discovered: false };
    elements['yarn'] = { id: 'yarn', name: 'yarn', icon: 'icons/yarn.svg', discovered: false };
    elements['paper'] = { id: 'paper', name: 'paper', icon: 'icons/paper.svg', discovered: false };
    elements['fish'] = { id: 'fish', name: 'fish', icon: 'icons/fish.svg', discovered: false };
    elements['fish-bones'] = { id: 'fish-bones', name: 'fish bones', icon: 'icons/fish-bones.svg', discovered: false };
    elements['sushi'] = { id: 'sushi', name: 'sushi', icon: 'icons/sushi.svg', discovered: false };
    elements['snake'] = { id: 'snake', name: 'snake', icon: 'icons/snake.svg', discovered: false };
    elements['worm'] = { id: 'worm', name: 'worm', icon: 'icons/worm.svg', discovered: false };
    elements['paper-plane'] = { id: 'paper-plane', name: 'paper plane', icon: 'icons/paper-plane.svg', discovered: false };

    elements['coal'] = { id: 'coal', name: 'coal', icon: 'icons/coal.svg', discovered: false };
    elements['fossil'] = { id: 'fossil', name: 'fossil', icon: 'icons/fossil.svg', discovered: false };
    elements['helicopter'] = { id: 'helicopter', name: 'helicopter', icon: 'icons/helicopter.svg', discovered: false };
    elements['petroleum'] = { id: 'petroleum', name: 'petroleum', icon: 'icons/utility-can.svg', discovered: false };

    elements['fabric'] = { id: 'fabric', name: 'fabric', icon: 'icons/fabric.svg', discovered: false };
    elements['ballot'] = { id: 'ballot', name: 'cardboard', icon: 'icons/ballot.svg', discovered: false };
    elements['box-isometric'] = { id: 'box-isometric', name: 'box', icon: 'icons/box-isometric.svg', discovered: false };
    elements['box-tissue'] = { id: 'box-tissue', name: 'tissue', icon: 'icons/box-tissue.svg', discovered: false };
    elements['bottle-droplet'] = { id: 'bottle-droplet', name: 'resin', icon: 'icons/bottle-droplet.svg', discovered: false };
    elements['fill-drip'] = { id: 'fill-drip', name: 'wax', icon: 'icons/fill-drip.svg', discovered: false };
    elements['candle-holder'] = { id: 'candle-holder', name: 'candle', icon: 'icons/candle-holder.svg', discovered: false };
    elements['eraser'] = { id: 'eraser', name: 'rubber', icon: 'icons/eraser.svg', discovered: false };
    elements['balloon'] = { id: 'balloon', name: 'balloon', icon: 'icons/balloon.svg', discovered: false };
    elements['tire'] = { id: 'tire', name: 'tire', icon: 'icons/tire.svg', discovered: false };
    elements['toilet-paper-under'] = { id: 'toilet-paper-under', name: 'toilet paper', icon: 'icons/toilet-paper-under.svg', discovered: false };
    elements['axe'] = { id: 'axe', name: 'axe', icon: 'icons/axe.svg', discovered: false };
    elements['wood'] = { id: 'wood', name: 'wood', icon: 'icons/wood.svg', discovered: false };
    elements['sword'] = { id: 'sword', name: 'sword', icon: 'icons/sword.svg', discovered: false };
    elements['grass'] = { id: 'grass', name: 'grass', icon: 'icons/grass.svg', discovered: false };
    elements['sheet-plastic'] = { id: 'sheet-plastic', name: 'plastic', icon: 'icons/sheet-plastic.svg', discovered: false };
    elements['egg-fried'] = { id: 'egg-fried', name: 'fried egg', icon: 'icons/egg-fried.svg', discovered: false };
    elements['oven'] = { id: 'oven', name: 'oven', icon: 'icons/oven.svg', discovered: false };
    elements['shirt'] = { id: 'shirt', name: 'cloth', icon: 'icons/shirt.svg', discovered: false };
    elements['eggplant'] = { id: 'eggplant', name: 'eggplant', icon: 'icons/eggplant.svg', discovered: false };
    elements['feather'] = { id: 'feather', name: 'feather', icon: 'icons/feather.svg', discovered: false };
    elements['tire-flat'] = { id: 'tire-flat', name: 'flat tire', icon: 'icons/tire-flat.svg', discovered: false };
    elements['potato'] = { id: 'potato', name: 'potato', icon: 'icons/potato.svg', discovered: false };
    elements['owl'] = { id: 'owl', name: 'owl', icon: 'icons/owl.svg', discovered: false };
    elements['cat'] = { id: 'cat', name: 'cat', icon: 'icons/cat.svg', discovered: false };
    elements['cat-space'] = { id: 'cat-space', name: 'space cat', icon: 'icons/cat-space.svg', discovered: false };
    elements['gift'] = { id: 'gift', name: 'gift', icon: 'icons/gift.svg', discovered: false };
    elements['ghost'] = { id: 'ghost', name: 'ghost', icon: 'icons/ghost.svg', discovered: false };
    elements['scarecrow'] = { id: 'scarecrow', name: 'scarecrow', icon: 'icons/scarecrow.svg', discovered: false };
    elements['dove'] = { id: 'dove', name: 'dove', icon: 'icons/dove.svg', discovered: false };
    elements['duck'] = { id: 'duck', name: 'duck', icon: 'icons/duck.svg', discovered: false };
    elements['soap'] = { id: 'soap', name: 'soap', icon: 'icons/soap.svg', discovered: false };
    elements['sushi-roll'] = { id: 'sushi-roll', name: 'sushi roll', icon: 'icons/sushi-roll.svg', discovered: false };

    elements['god'] = { id: 'god', name: 'god', icon: 'icons/god.svg', discovered: false };

    elements['cross'] = { id: 'cross', name: 'cross', icon: 'icons/cross.svg', discovered: false };

    elements['spaceship'] = { id: 'spaceship', name: 'spaceship', icon: 'icons/spaceship.svg', discovered: false };

    elements['christmas-tree'] = { id: 'christmas-tree', name: 'christmas tree', icon: 'icons/christmas-tree.svg', discovered: false };

    elements['tent'] = { id: 'tent', name: 'tent', icon: 'icons/tent.svg', discovered: false };

    elements['campfire'] = { id: 'campfire', name: 'campfire', icon: 'icons/campfire.svg', discovered: false };

    elements['link'] = { id: 'link', name: 'link', icon: 'icons/link.svg', discovered: false };

    elements['war'] = { id: 'war', name: 'war', icon: 'icons/war.svg', discovered: false };

    elements['mushroom'] = { id: 'mushroom', name: 'mushroom', icon: 'icons/mushroom.svg', discovered: false };

    elements['pepper'] = { id: 'pepper', name: 'pepper', icon: 'icons/pepper.svg', discovered: false };

    elements['peace'] = { id: 'peace', name: 'peace', icon: 'icons/peace.svg', discovered: false };

    elements['well'] = { id: 'well', name: 'well', icon: 'icons/well.svg', discovered: false };

    elements['oil-well'] = { id: 'oil-well', name: 'oil well', icon: 'icons/oil-well.svg', discovered: false };

    elements['bicycle'] = { id: 'bicycle', name: 'bicycle', icon: 'icons/bicycle.svg', discovered: false };

    elements['car'] = { id: 'car', name: 'car', icon: 'icons/car.svg', discovered: false };

    elements['motorcycle'] = { id: 'motorcycle', name: 'motorcycle', icon: 'icons/motorcycle.svg', discovered: false };

    elements['traffic-jam'] = { id: 'traffic-jam', name: 'traffic jam', icon: 'icons/traffic-jam.svg', discovered: false };

    elements['bacteria'] = { id: 'bacteria', name: 'bacteria', icon: 'icons/bacteria.svg', discovered: false };

    elements['virus'] = { id: 'virus', name: 'virus', icon: 'icons/virus.svg', discovered: false };

    elements['vial'] = { id: 'vial', name: 'vial', icon: 'icons/vial.svg', discovered: false };

    elements['mask'] = { id: 'mask', name: 'mask', icon: 'icons/mask.svg', discovered: false };

    elements['mountain-biking'] = { id: 'mountain-biking', name: 'mountain biking', icon: 'icons/mountain-biking.svg', discovered: false };

    elements['squid'] = { id: 'squid', name: 'squid', icon: 'icons/squid.svg', discovered: false };

    elements['ink'] = { id: 'ink', name: 'ink', icon: 'icons/ink.svg', discovered: false };

    elements['pen'] = { id: 'pen', name: 'pen', icon: 'icons/pen.svg', discovered: false };

    elements['pencil'] = { id: 'pencil', name: 'pencil', icon: 'icons/pencil.svg', discovered: false };

    elements['text'] = { id: 'text', name: 'text', icon: 'icons/text.svg', discovered: false };

    elements['book'] = { id: 'book', name: 'book', icon: 'icons/book.svg', discovered: false };

    elements['spells'] = { id: 'spells', name: 'spells', icon: 'icons/spells.svg', discovered: false };

    elements['bible'] = { id: 'bible', name: 'bible', icon: 'icons/bible.svg', discovered: false };

    elements['octopus'] = { id: 'octopus', name: 'octopus', icon: 'icons/octopus.svg', discovered: false };

    elements['fishing'] = { id: 'fishing', name: 'fishing', icon: 'icons/fishing.svg', discovered: false };

    elements['mineral-water'] = { id: 'mineral-water', name: 'mineral water', icon: 'icons/bottle-water.svg', discovered: false };
    elements['machine'] = { id: 'machine', name: 'machine', icon: 'icons/machine.svg', discovered: false };
    elements['printer'] = { id: 'printer', name: 'printer', icon: 'icons/print.svg', discovered: false };
    elements['robot'] = { id: 'robot', name: 'robot', icon: 'icons/user-robot.svg', discovered: false };
    elements['cabin'] = { id: 'cabin', name: 'cabin', icon: 'icons/cabin.svg', discovered: false };
    elements['warehouse'] = { id: 'warehouse', name: 'warehouse', icon: 'icons/warehouse.svg', discovered: false };
    elements['jug'] = { id: 'jug', name: 'jug', icon: 'icons/jug.svg', discovered: false };
    elements['train'] = { id: 'train', name: 'train', icon: 'icons/train.svg', discovered: false };
    elements['library'] = { id: 'library', name: 'library', icon: 'icons/library.svg', discovered: false };
    elements['french-fries'] = { id: 'french-fries', name: 'french fries', icon: 'icons/french-fries.svg', discovered: false };

    // Add recipes (encrypted)
    const _0x = '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';
    const _0k = [83,104,114,105,109,112,65,108,99,104,101,109,121,50,48,50,52,33,82,101,99,105,112,101,75,101,121];
    const _0d = atob(_0x);
    let _0s = '';
    for (let i = 0; i < _0d.length; i++) _0s += String.fromCharCode(_0d.charCodeAt(i) ^ _0k[i % _0k.length]);
    JSON.parse(_0s).forEach(function(r) { _addRecipe(r[0], r[1], r[2]); });

    // Additional recipes
    _addRecipe('chicken', 'seed', 'egg');
    _addRecipe('bird', 'night', 'crow');
    _addRecipe('coal', 'pressure', 'gem');
    _addRecipe('blade', 'glass', 'blender');
    _addRecipe('metal', 'metal', 'bucket');
    _addRecipe('animal', 'cloud', 'sheep');
    _addRecipe('plant', 'blade', 'fiber');
    _addRecipe('fiber', 'pressure', 'string');
    _addRecipe('string', 'sheep', 'yarn');
    _addRecipe('fiber', 'water', 'paper');

    _addRecipe('animal', 'ocean', 'fish');
    _addRecipe('fish', 'star', 'starfish');
    _addRecipe('fish', 'fossil', 'fish-bones');
    _addRecipe('rice', 'fish', 'sushi');
    _addRecipe('string', 'animal', 'snake');
    _addRecipe('snake', 'earth', 'worm');
    _addRecipe('paper', 'airplane', 'paper-plane');

    _addRecipe('yarn', 'fiber', 'fabric');
    _addRecipe('yarn', 'paper', 'fabric');
    _addRecipe('paper', 'stone', 'ballot');
    _addRecipe('ballot', 'ballot', 'box-isometric');
    _addRecipe('paper', 'fiber', 'box-tissue');
    _addRecipe('tree', 'water', 'bottle-droplet');
    _addRecipe('bottle-droplet', 'heat', 'fill-drip');
    _addRecipe('fill-drip', 'fire', 'candle-holder');
    _addRecipe('bottle-droplet', 'pressure', 'eraser');
    _addRecipe('eraser', 'air', 'balloon');
    _addRecipe('eraser', 'eraser', 'tire');
    _addRecipe('tire', 'box-tissue', 'toilet-paper-under');
    _addRecipe('blade', 'metal', 'axe');
    _addRecipe('axe', 'tree', 'wood');
    _addRecipe('axe', 'forest', 'wood');
    _addRecipe('wood', 'blade', 'fiber');
    _addRecipe('blade', 'wood', 'stick');
    _addRecipe('wind', 'wood', 'stick');
    _addRecipe('blade', 'stone', 'sword');
    _addRecipe('seed', 'land', 'grass');
    _addRecipe('petroleum', 'heat', 'sheet-plastic');
    _addRecipe('egg', 'heat', 'egg-fried');
    _addRecipe('box-isometric', 'heat', 'oven');
    _addRecipe('box-isometric', 'fire', 'oven');
    _addRecipe('human', 'fabric', 'shirt');
    _addRecipe('egg', 'plant', 'eggplant');
    _addRecipe('egg', 'vegetable', 'eggplant');
    _addRecipe('pressure', 'tire', 'tire-flat');
    _addRecipe('vegetable', 'stone', 'potato');
    _addRecipe('tree', 'animal', 'owl');
    _addRecipe('forest', 'animal', 'owl');
    _addRecipe('night', 'animal', 'cat');
    _addRecipe('cat', 'universe', 'cat-space');
    _addRecipe('cat', 'magic', 'cat-space');
    _addRecipe('box-isometric', 'string', 'gift');
    _addRecipe('farm', 'human', 'scarecrow');
    _addRecipe('crow', 'human', 'scarecrow');
    _addRecipe('bird', 'plant', 'dove');
    _addRecipe('bird', 'lake', 'duck');
    _addRecipe('fill-drip', 'pressure', 'soap');
    _addRecipe('sushi', 'seaweed', 'sushi-roll');

    // Bird rules: only the base bird element gets generic wind/metal recipes
    _addRecipe('wind', 'bird', 'feather');
    _addRecipe('metal', 'bird', 'airplane');

    // Air/sky + metal makes airplane
    _addRecipe('air', 'metal', 'airplane');
    _addRecipe('sky', 'metal', 'airplane');

    _addRecipe('fabric', 'magic', 'ghost');
    _addRecipe('metal', 'magic-potion', 'cauldron');

    // Fruit blender rule: only the base fruit element makes juice
    _addRecipe('blender', 'fruit', 'juice');

    // Sunset recipe
    _addRecipe('sun', 'mountain', 'sunset');

    // God recipes
    _addRecipe('lightning', 'human', 'god');
    _addRecipe('magic', 'human', 'god');
    _addRecipe('god', 'stick', 'cross');

    // Spaceship recipes
    _addRecipe('ship', 'universe', 'spaceship');
    _addRecipe('ship', 'planet', 'spaceship');
    _addRecipe('airplane', 'burst', 'spaceship');

    // UFO recipes
    _addRecipe('alien', 'spaceship', 'ufo');
    _addRecipe('alien', 'airplane', 'ufo');

    // Christmas tree recipe
    _addRecipe('god', 'tree', 'christmas-tree');

    // Tent recipe
    _addRecipe('fabric', 'house', 'tent');

    // Campfire recipes
    _addRecipe('tent', 'fire', 'campfire');
    _addRecipe('wood', 'fire', 'campfire');

    // Link recipe
    _addRecipe('string', 'metal', 'link');

    // War recipe
    _addRecipe('sword', 'sword', 'war');

    // Mushroom recipes
    _addRecipe('plant', 'house', 'mushroom');
    _addRecipe('vegetable', 'house', 'mushroom');

    // Pepper recipes
    _addRecipe('heat', 'vegetable', 'pepper');
    _addRecipe('fire', 'vegetable', 'pepper');

    // Peace recipe
    _addRecipe('dove', 'war', 'peace');

    // Well recipes
    _addRecipe('bucket', 'brick', 'well');
    _addRecipe('bucket', 'water', 'well');

    // Oil well recipe
    _addRecipe('petroleum', 'well', 'oil-well');

    // Mineral water recipes
    _addRecipe('metal', 'water', 'mineral-water');
    _addRecipe('sheet-plastic', 'water', 'mineral-water');

    // Bicycle recipes
    _addRecipe('tire', 'tire', 'bicycle');
    _addRecipe('bicycle', 'bicycle', 'car');
    _addRecipe('bicycle', 'electricity', 'motorcycle');
    _addRecipe('car', 'car', 'traffic-jam');

    // Bacteria recipes
    _addRecipe('life', 'water', 'bacteria');
    _addRecipe('bacteria', 'air', 'virus');
    _addRecipe('virus', 'glass', 'vial');
    _addRecipe('bacteria', 'glass', 'vial');
    _addRecipe('fabric', 'virus', 'mask');
    _addRecipe('bicycle', 'mountain', 'mountain-biking');

    // Squid recipes
    _addRecipe('fish', 'night', 'squid');
    _addRecipe('squid', 'water', 'ink');
    _addRecipe('ink', 'stick', 'pen');
    _addRecipe('ink', 'metal', 'pen');
    _addRecipe('coal', 'stick', 'pencil');
    _addRecipe('pen', 'paper', 'text');
    _addRecipe('text', 'text', 'book');
    _addRecipe('book', 'magic', 'spells');
    _addRecipe('book', 'cross', 'bible');
    _addRecipe('book', 'god', 'bible');
    _addRecipe('squid', 'ocean', 'octopus');
    _addRecipe('string', 'fish', 'fishing');
    _addRecipe('stick', 'fish', 'fishing');

    // Machine recipes
    _addRecipe('electricity', 'metal', 'machine');
    _addRecipe('machine', 'tire', 'car');
    _addRecipe('pencil', 'paper', 'text');
    _addRecipe('machine', 'text', 'printer');
    _addRecipe('machine', 'paper', 'printer');
    _addRecipe('machine', 'human', 'robot');
    _addRecipe('metal', 'human', 'robot');
    _addRecipe('wood', 'house', 'cabin');
    _addRecipe('metal', 'house', 'warehouse');
    _addRecipe('glass-water', 'glass-water', 'jug');
    _addRecipe('car', 'metal', 'train');
    _addRecipe('book', 'house', 'library');
    _addRecipe('machine', 'fire', 'oven');
    _addRecipe('heat', 'potato', 'french-fries');
    finalItems.add('shooting-star');
    finalItems.add('volcano');
    finalItems.add('tap');
    finalItems.add('tsunami');
    finalItems.add('lightbulb');
    finalItems.add('range');
    finalItems.add('icicles');
    finalItems.add('sunglasses');
    finalItems.add('igloo');
    finalItems.add('avalanche');
    finalItems.add('crystal-ball');
    finalItems.add('fish-bones');
    finalItems.add('paper-plane');
    finalItems.add('firewall');
    finalItems.add('toilet-paper-under');
    finalItems.add('traffic-jam');
    finalItems.add('mountain-biking');
    finalItems.add('bible');
    finalItems.add('fishing');
    finalItems.add('tire-flat');
    finalItems.add('cat-space');

    renderSidebar();
    updateAchievementCount();
    bindEvents();

    // Load saved progress
    loadProgress();

    // Apply theme
    applyTheme();
}

function _addRecipe(a, b, result) {
    const key = [a, b].sort().join(',');
    recipes[key] = result;
    if (!resultToSources[result]) resultToSources[result] = [];
    resultToSources[result].push([a, b]);
}

// ==========================================
// Local Storage - Save/Load Progress
// ==========================================

const SAVE_KEY = 'shrimpAlchemy_save';
const VERSION_KEY = 'shrimpAlchemy_version';
const SETTINGS_KEY = 'shrimpAlchemy_settings';

function saveProgress() {
    try {
        // If in admin mode, save snapshot data instead of current state
        const unlockedToSave = godMode && godModeSnapshot
            ? Array.from(godModeSnapshot.unlocked)
            : Array.from(unlocked);
        const recipesToSave = godMode && godModeSnapshot
            ? Array.from(godModeSnapshot.discoveredRecipes)
            : Array.from(discoveredRecipes);
        const data = {
            unlocked: unlockedToSave,
            discoveredRecipes: recipesToSave,
            version: GAME_VERSION,
            settings: settings
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
        // localStorage may be unavailable (e.g. private browsing)
    }
}

function loadProgress() {
    try {
        const savedVersion = localStorage.getItem(VERSION_KEY);
        const saved = localStorage.getItem(SAVE_KEY);

        if (!saved) {
            // First visit - save current state
            saveProgress();
            localStorage.setItem(VERSION_KEY, GAME_VERSION);
            return;
        }

        const data = JSON.parse(saved);

        // Restore unlocked elements
        if (data.unlocked && Array.isArray(data.unlocked)) {
            // Migrate old element IDs renamed in newer versions
            data.unlocked = data.unlocked.map(id => id === 'mountain-sun' ? 'sunset' : id === 'tarp' ? 'fabric' : id);
            data.unlocked.forEach(id => {
                unlocked.add(id);
                if (elements[id]) {
                    elements[id].discovered = true;
                }
            });
        }

        // Restore discovered recipes
        if (data.discoveredRecipes && Array.isArray(data.discoveredRecipes)) {
            data.discoveredRecipes = data.discoveredRecipes.map(key => {
                // Migrate old ingredient IDs renamed in newer versions
                return key.split(',').map(part => part === 'tarp' ? 'fabric' : part).sort().join(',');
            });
            data.discoveredRecipes.forEach(key => {
                discoveredRecipes.add(key);
            });
        }

        // Restore settings
        if (data.settings && typeof data.settings === 'object') {
            settings = { ...settings, ...data.settings };
            applyTheme();
        }

        // If game was updated (version changed), clear canvas but keep progress
        if (savedVersion && savedVersion !== GAME_VERSION) {
            // Version mismatch - canvas already cleared on fresh page load
            // Progress is preserved above, just update the version
            localStorage.setItem(VERSION_KEY, GAME_VERSION);
        } else if (!savedVersion) {
            localStorage.setItem(VERSION_KEY, GAME_VERSION);
        }

        // Re-render sidebar with restored progress
        renderSidebar();
        updateAchievementCount();
    } catch (e) {
        // Corrupted save data - start fresh
    }
}

// ==========================================
// Theme System
// ==========================================

const THEMES = [
    { id: 'default', name: 'Default', darkAccent: '#ffffff', darkText: '#d0d0d0', lightAccent: '#1a1a1a', lightText: '#333333', glass: '#2a2a2a' },
    { id: 'blue', name: 'Blue', darkAccent: '#5a80b0', darkText: '#90b0d0', lightAccent: '#3a6080', lightText: '#506880', glass: '#2a2a2a' },
    { id: 'orange', name: 'Orange', darkAccent: '#d8a030', darkText: '#e0c060', lightAccent: '#c08020', lightText: '#c0a040', glass: '#2a2a2a' },
    { id: 'red', name: 'Red', darkAccent: '#b06060', darkText: '#c08080', lightAccent: '#904040', lightText: '#b07070', glass: '#2a2a2a' },
    { id: 'slate', name: 'Slate', darkAccent: '#708090', darkText: '#a0b0c0', lightAccent: '#506070', lightText: '#607080', glass: '#2a2a2a' },
    { id: 'pink', name: 'Pink', darkAccent: '#d192a0', darkText: '#f0b3c0', lightAccent: '#b17280', lightText: '#ca92a0', glass: '#2a2a2a' },
    { id: 'green', name: 'Green', darkAccent: '#708058', darkText: '#a0b880', lightAccent: '#506840', lightText: '#607850', glass: '#2a2a2a' },
    { id: 'purple', name: 'Purple', darkAccent: '#805878', darkText: '#c0a0b0', lightAccent: '#704060', lightText: '#805070', glass: '#2a2a2a' },
    { id: 'rainbow', name: 'Rainbow', darkAccent: '#ffffff', darkText: '#d0d0d0', lightAccent: '#1a1a1a', lightText: '#333333', glass: '#2a2a2a', isColorWheel: true },
];


function getRandomColorTheme() {
    const themes = THEMES.filter(t => t.id !== 'default' && t.id !== 'rainbow');
    const counts = {};
    canvasItems.forEach(item => {
        if (item.colorTheme) {
            counts[item.colorTheme] = (counts[item.colorTheme] || 0) + 1;
        }
    });
    themes.forEach(t => counts[t.darkAccent] = counts[t.darkAccent] || 0);
    const minCount = Math.min(...themes.map(t => counts[t.darkAccent]));
    const candidates = themes.filter(t => counts[t.darkAccent] === minCount);
    return candidates[Math.floor(Math.random() * candidates.length)].darkAccent;
}

function renderColorWheelPreview() {
    const colors = THEMES.filter(t => t.id !== 'rainbow').map(t => t.darkAccent);
    const cx = 28, cy = 28, r = 28;
    const count = colors.length;
    let paths = '';
    for (let i = 0; i < count; i++) {
        const a1 = (i * 2 * Math.PI) / count - Math.PI / 2;
        const a2 = ((i + 1) * 2 * Math.PI) / count - Math.PI / 2;
        const x1 = cx + r * Math.cos(a1);
        const y1 = cy + r * Math.sin(a1);
        const x2 = cx + r * Math.cos(a2);
        const y2 = cy + r * Math.sin(a2);
        paths += `<path d=\"M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 0,1 ${x2.toFixed(1)},${y2.toFixed(1)} Z\" fill=\"${colors[i]}\" />`;
    }
    return `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 56 56\" width=\"56\" height=\"56\" style=\"display:block;\">${paths}</svg>`;
}

function updateCanvasColors() {
    canvasItems.forEach(item => {
        const el = canvas.querySelector(`.canvas-element[data-uid=\"${item.uid}\"]`);
        if (!el) return;
        const icon = el.querySelector('.el-icon');
        if (!icon) return;
        if (settings.theme === 'rainbow' && !finalItems.has(item.elementId)) {
            const color = item.colorTheme || getRandomColorTheme();
            item.colorTheme = color;
            icon.style.color = color;
        } else {
            icon.style.color = '';
        }
    });
}

function applyTheme() {
    const themeId = settings.theme || 'default';
    const mode = settings.mode || 'dark';
    document.body.setAttribute('data-theme', themeId === 'default' ? '' : themeId);
    document.body.setAttribute('data-mode', mode);

    const theme = THEMES.find(t => t.id === themeId);
    if (theme) {
        const accent = mode === 'light' ? theme.lightAccent : theme.darkAccent;
        const text = mode === 'light' ? theme.lightText : theme.darkText;
        document.documentElement.style.setProperty('--theme-accent', accent);
        document.documentElement.style.setProperty('--text-white', text);
    } else {
        document.documentElement.style.removeProperty('--theme-accent');
        document.documentElement.style.removeProperty('--text-white');
    }
    updateCanvasColors();
}

function selectTheme(themeId) {
    settings.theme = themeId;
    applyTheme();
    saveProgress();
    renderThemeGrid();
}

function selectMode(mode) {
    settings.mode = mode;
    applyTheme();
    saveProgress();
    renderThemeGrid();
    updateModeToggle();
}

function updateModeToggle() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === settings.mode);
    });
}

function renderThemeGrid() {
    const grid = document.getElementById('theme-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const mode = settings.mode || 'dark';
    THEMES.forEach(theme => {
        const accent = mode === 'light' ? theme.lightAccent : theme.darkAccent;
        const text = mode === 'light' ? theme.lightText : theme.darkText;
        const option = document.createElement('div');
        option.className = 'theme-option' + (settings.theme === theme.id ? ' selected' : '');
        option.dataset.theme = theme.id;
        const preview = theme.id === 'rainbow'
            ? renderColorWheelPreview()
            : `<div class="theme-preview-top" style="background:${accent}"></div>
               <div class="theme-preview-bottom-left" style="background:${text}"></div>
               <div class="theme-preview-bottom-right" style="background:${theme.glass}"></div>`;
        option.innerHTML = `
            <div class="theme-preview">
                ${preview}
            </div>
        `;
        option.addEventListener('click', () => selectTheme(theme.id));
        grid.appendChild(option);
    });
}

// ==========================================
// Settings Modal
// ==========================================

function openSettings() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;
    updateModeToggle();
    renderThemeGrid();
    modal.classList.remove('hidden');
}

function closeSettings() {
    document.getElementById('settings-modal')?.classList.add('hidden');
}

function resetGame() {
    try {
        localStorage.removeItem(SAVE_KEY);
        localStorage.removeItem(VERSION_KEY);
        localStorage.removeItem(SETTINGS_KEY);
    } catch (e) {}

    // Reset all element discovered states
    Object.keys(elements).forEach(id => {
        elements[id].discovered = false;
    });

    // Reset base elements to discovered
    BASE_ELEMENTS.forEach(el => {
        elements[el.id].discovered = true;
    });

    // Reset unlocked set
    unlocked.clear();
    BASE_ELEMENTS.forEach(el => {
        unlocked.add(el.id);
    });

    // Reset discovered recipes
    discoveredRecipes.clear();

    // Reset settings
    settings = { theme: 'default', mode: 'dark' };
    applyTheme();

    // Reset god mode
    if (godMode) {
        godMode = false;
        godModeSnapshot = null;
        document.getElementById('btn-admin')?.classList.remove('admin-active');
    }

    // Clear canvas
    clearCanvas();

    // Re-render
    renderSidebar();
    updateAchievementCount();

    // Save fresh state
    saveProgress();
}

// Expose resetGame for settings UI
window.resetGame = resetGame;

async function preloadIcons() {
    const promises = Object.keys(elements).map(id => {
        const path = elements[id].icon;
        if (path && typeof path === 'string' && path.startsWith('icons/')) {
            return fetch(path)
                .then(r => r.text())
                .then(svg => { iconCache[id] = svg; })
                .catch(() => { iconCache[id] = '<i class="fas fa-question"></i>'; });
        }
        return Promise.resolve();
    });
    await Promise.all(promises);
}

function getIconHtml(id) {
    if (iconCache[id]) return iconCache[id];
    const el = elements[id];
    if (el && el.icon && typeof el.icon === 'string' && !el.icon.startsWith('icons/')) return el.icon;
    return '<i class="fas fa-question"></i>';
}

function renderSidebar() {
    const sidebarSearch = document.getElementById('sidebar-search');
    const query = sidebarSearch ? sidebarSearch.value.trim().toLowerCase() : '';
    sidebarElements.innerHTML = '';
    let sorted = Array.from(unlocked)
        .filter(id => elements[id] && (godMode || !finalItems.has(id)))
        .sort((a, b) => a.localeCompare(b));
    if (query) {
        sorted = sorted.filter(id => elements[id].name.toLowerCase().includes(query));
    }

    const groups = {};
    sorted.forEach(id => {
        const letter = elements[id].name[0].toUpperCase();
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push(id);
    });

    const letters = Object.keys(groups).sort();
    if (letters.length === 0) {
        sidebarElements.innerHTML = '<div style="color:#888;text-align:center;padding:20px;font-size:13px;">No items found</div>';
        return;
    }

    letters.forEach(letter => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'letter-group';

        const header = document.createElement('div');
        header.className = 'letter-header';
        header.textContent = letter;
        groupDiv.appendChild(header);

        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'letter-items';

        groups[letter].forEach(id => {
            const el = elements[id];
            const div = document.createElement('div');
            div.className = 'sidebar-element' + (finalItems.has(id) ? ' final-item' : '') + (godMode && finalItems.has(id) ? ' admin-final-item' : '');
            div.dataset.id = id;
            div.draggable = false;
            div.innerHTML = `<div class="el-icon">${getIconHtml(id)}</div><div class="el-name">${el.name}</div>`;
            itemsDiv.appendChild(div);
        });

        groupDiv.appendChild(itemsDiv);
        sidebarElements.appendChild(groupDiv);
    });
}

function renderCanvasItem(item, animate = false) {
    const el = elements[item.elementId];
    const div = document.createElement('div');
    div.className = 'canvas-element element-' + item.elementId + (finalItems.has(item.elementId) ? ' final-item' : '') + (godMode && finalItems.has(item.elementId) ? ' admin-final-item' : '');
    div.dataset.uid = item.uid;
    div.style.left = item.x + 'px';
    div.style.top = item.y + 'px';
    let html = `<div class="el-icon">${getIconHtml(item.elementId)}</div>`;
    if (finalItems.has(item.elementId)) {
        html += `<div class="ripple"></div><div class="ripple" style="animation-delay:-0.8s"></div>`;
    }
    div.innerHTML = html;
    if (settings.theme === 'rainbow' && !finalItems.has(item.elementId)) {
        const color = item.colorTheme || getRandomColorTheme();
        item.colorTheme = color;
        div.querySelector('.el-icon').style.color = color;
    }
    canvas.appendChild(div);
    if (animate) {
        div.classList.add('pop-in');
        div.addEventListener('animationend', () => {
            div.classList.remove('pop-in');
        }, { once: true });
    }
    return div;
}

function createCanvasElement(elementId, x, y, animate = false, fromEncyclopedia = false, colorTheme = null) {
    const item = { uid: nextUid++, elementId, x, y, fromEncyclopedia };
    if (settings.theme === 'rainbow' && !finalItems.has(elementId)) {
        item.colorTheme = colorTheme || getRandomColorTheme();
    }
    canvasItems.push(item);
    renderCanvasItem(item, animate);
    return item;
}

function removeCanvasItem(uid) {
    const idx = canvasItems.findIndex(i => i.uid === uid);
    if (idx !== -1) canvasItems.splice(idx, 1);
    const el = canvas.querySelector(`.canvas-element[data-uid="${uid}"]`);
    if (el) el.remove();
}

function renderCanvas() {
    canvas.innerHTML = '';
    canvasItems.forEach(item => renderCanvasItem(item));
}

function clearCanvas() {
    canvasItems = [];
    canvas.innerHTML = '';
}

function bindEvents() {
    sidebarElements.addEventListener('mousedown', onSidebarMouseDown);
    canvas.addEventListener('mousedown', onCanvasMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    sidebarElements.addEventListener('touchstart', onSidebarTouchStart, { passive: false });
    canvas.addEventListener('touchstart', onCanvasTouchStart, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: false });

    document.getElementById('btn-cleanup').addEventListener('click', () => {
        if (canvasItems.length === 0) return;
        showConfirmModal();
    });

    document.getElementById('btn-admin').addEventListener('click', () => {
        if (godMode) {
            showConfirmModal('toggleGodMode');
        } else {
            showAdminPasswordModal();
        }
    });

    document.getElementById('btn-encyclopedia').addEventListener('click', openEncyclopedia);

    document.getElementById('btn-settings').addEventListener('click', openSettings);

    document.getElementById('settings-modal-close')?.addEventListener('click', closeSettings);
    document.getElementById('settings-modal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('settings-modal')) closeSettings();
    });

    document.getElementById('btn-reset-game')?.addEventListener('click', () => {
        closeSettings();
        setTimeout(() => {
            confirmAction = 'resetGame';
            showConfirmModal('resetGame');
        }, 200);
    });

    document.querySelectorAll('.settings-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.settings-nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('section-' + btn.dataset.section)?.classList.add('active');
        });
    });

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => selectMode(btn.dataset.mode));
    });

    const sidebarSearch = document.getElementById('sidebar-search');
    const sidebarSearchClear = document.getElementById('sidebar-search-clear');
    if (sidebarSearch) {
        sidebarSearch.addEventListener('input', () => {
            renderSidebar();
            if (sidebarSearchClear) {
                sidebarSearchClear.classList.toggle('hidden', !sidebarSearch.value);
            }
        });
    }
    if (sidebarSearchClear) {
        sidebarSearchClear.addEventListener('click', () => {
            if (sidebarSearch) {
                sidebarSearch.value = '';
                sidebarSearchClear.classList.add('hidden');
                renderSidebar();
            }
        });
    }

    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
            document.getElementById('item-detail')?.classList.add('hidden');
            document.getElementById('final-item-detail')?.classList.add('hidden');
        });
    });

    document.getElementById('modal-close').addEventListener('click', closeEncyclopedia);
    encyclopediaModal.addEventListener('click', (e) => {
        if (e.target === encyclopediaModal) closeEncyclopedia();
    });

    searchBox.addEventListener('input', renderItemsList);
    discoveryModal.addEventListener('click', closeDiscoveryModal);

    document.getElementById('confirm-yes').addEventListener('click', () => {
        closeConfirmModal();
        if (confirmAction === 'toggleGodMode') {
            setTimeout(() => toggleGodMode(), 50);
        } else if (confirmAction === 'resetGame') {
            setTimeout(() => resetGame(), 50);
        } else {
            clearCanvas();
        }
    });
    document.getElementById('confirm-no').addEventListener('click', closeConfirmModal);
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) closeConfirmModal();
    });

    const detailAddBtn = document.getElementById('detail-add-btn');
    if (detailAddBtn) {
        detailAddBtn.addEventListener('click', () => {
            const detail = document.getElementById('item-detail');
            const id = detail.dataset.id;
            if (!id) return;

            const canvasRect = canvas.getBoundingClientRect();
            const paddingX = 16, paddingY = 20;
            const minGap = 96;
            const cols = Math.max(3, Math.floor((canvasRect.width - paddingX * 2) / minGap));
            const gapX = Math.floor((canvasRect.width - paddingX * 2) / cols);
            const gapY = gapX;
            const startX = paddingX + (canvasRect.width - paddingX * 2 - gapX * cols) / 2;
            const startY = paddingY;
            const rows = Math.max(1, Math.floor((canvasRect.height - paddingY * 2) / gapY));

            // Generate grid slots in top-down, left-to-right order
            const slots = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    slots.push({ row: r, col: c, gx: startX + c * gapX, gy: startY + r * gapY });
                }
            }

            // Mark slots still occupied by encyclopedia items that have not moved
            const occupied = new Set();
            canvasItems.forEach(item => {
                if (!item.fromEncyclopedia || !item.encSlot) return;
                const idx = item.encSlot.row * cols + item.encSlot.col;
                const slot = slots[idx];
                if (!slot) return;
                if (Math.abs(item.x - slot.gx) < gapX / 2 && Math.abs(item.y - slot.gy) < gapY / 2) {
                    occupied.add(idx);
                }
            });

            // Fill the first empty slot; if every slot is full and untouched, do nothing
            let targetSlot = null;
            for (let i = 0; i < slots.length; i++) {
                if (!occupied.has(i)) {
                    targetSlot = slots[i];
                    break;
                }
            }
            if (!targetSlot) return;

            const newItem = createCanvasElement(id, targetSlot.gx, targetSlot.gy);
            newItem.fromEncyclopedia = true;
            newItem.encSlot = { row: targetSlot.row, col: targetSlot.col };
        });
    }

    const finalItemsToggle = document.getElementById('final-items-toggle');
    if (finalItemsToggle) {
        finalItemsToggle.addEventListener('click', () => {
            const collapsed = document.getElementById('final-items-collapsed');
            const expanded = document.getElementById('final-items-expanded');
            if (collapsed) collapsed.classList.add('hidden');
            if (expanded) expanded.classList.remove('hidden');
        });
    }

    const finalItemsToggleExpanded = document.getElementById('final-items-toggle-expanded');
    if (finalItemsToggleExpanded) {
        finalItemsToggleExpanded.addEventListener('click', () => {
            const collapsed = document.getElementById('final-items-collapsed');
            const expanded = document.getElementById('final-items-expanded');
            if (collapsed) collapsed.classList.remove('hidden');
            if (expanded) expanded.classList.add('hidden');
        });
    }

    // Admin password modal events
    if (adminPasswordInput) {
        adminPasswordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') verifyAdminPassword();
        });
    }
    const adminPasswordEnter = document.getElementById('admin-password-enter');
    if (adminPasswordEnter) {
        adminPasswordEnter.addEventListener('click', verifyAdminPassword);
    }
    if (adminPasswordModal) {
        adminPasswordModal.addEventListener('click', (e) => {
            if (e.target === adminPasswordModal) closeAdminPasswordModal();
        });
    }
}

function onSidebarMouseDown(e) {
    const sidebarEl = e.target.closest('.sidebar-element');
    if (!sidebarEl) return;
    e.preventDefault();

    const elementId = sidebarEl.dataset.id;
    if (!godMode && finalItems.has(elementId)) return;

    const dragColor = settings.theme === 'rainbow' && !finalItems.has(elementId)
        ? getRandomColorTheme()
        : null;

    dragSource = 'sidebar';
    dragItem = { elementId, uid: nextUid++, colorTheme: dragColor };

    dragClone = document.createElement('div');
    dragClone.className = 'drag-clone' + (finalItems.has(elementId) ? ' final-item' : '');
    dragClone.style.transition = 'transform 0.1s ease';
    dragClone.style.transform = 'scale(1.1)';
    const elData = elements[elementId];
    dragClone.innerHTML = `<div class="drag-clone-icon">${getIconHtml(elementId)}</div>`;
    if (dragColor) {
        dragClone.querySelector('.drag-clone-icon').style.color = dragColor;
    }
    document.body.appendChild(dragClone);

    const cloneRect = dragClone.getBoundingClientRect();
    dragOffset = { x: cloneRect.width / 2, y: cloneRect.height / 2 };
    dragClone.style.left = (e.clientX - dragOffset.x) + 'px';
    dragClone.style.top = (e.clientY - dragOffset.y) + 'px';
}

function onCanvasMouseDown(e) {
    const canvasEl = e.target.closest('.canvas-element');
    if (!canvasEl) return;
    e.preventDefault();

    const uid = parseInt(canvasEl.dataset.uid);
    const item = canvasItems.find(i => i.uid === uid);
    if (!item) return;

    // Final items in normal mode: click once to disappear; in admin mode they behave like normal items but cannot craft
    if (finalItems.has(item.elementId) && !godMode) {
        canvasEl.style.transition = 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        canvasEl.style.transform = 'scale(0.3)';
        canvasEl.style.opacity = '0';
        setTimeout(() => removeCanvasItem(item.uid), 400);
        return;
    }

    const now = Date.now();
    if (canvasEl.dataset.lastClick && now - parseInt(canvasEl.dataset.lastClick) < 300) {
        createCanvasElement(item.elementId, item.x + 20, item.y + 20);
        delete canvasEl.dataset.lastClick;
        return;
    }
    canvasEl.dataset.lastClick = now;

    dragSource = 'canvas';
    dragItem = item;
    dragOffset = {
        x: e.clientX - canvasEl.getBoundingClientRect().left,
        y: e.clientY - canvasEl.getBoundingClientRect().top
    };

    canvasEl.classList.add('dragging');
    canvas.appendChild(canvasEl);
    dragClone = canvasEl;
}

function onMouseMove(e) {
    if (!dragItem || !dragClone) return;

    if (dragSource === 'sidebar') {
        dragClone.style.left = (e.clientX - dragOffset.x) + 'px';
        dragClone.style.top = (e.clientY - dragOffset.y) + 'px';
    } else {
        const canvasRect = canvas.getBoundingClientRect();
        let nx = e.clientX - canvasRect.left - dragOffset.x;
        let ny = e.clientY - canvasRect.top - dragOffset.y;
        dragClone.style.left = nx + 'px';
        dragClone.style.top = ny + 'px';
    }

    if (dragSource === 'canvas' || dragSource === 'sidebar') {
        checkMergeHint(e.clientX, e.clientY);
    }
}

function onMouseUp(e) {
    if (!dragItem || !dragClone) return;

    const canvasRect = canvas.getBoundingClientRect();
    const sidebarRect = rightSidebar.getBoundingClientRect();

    if (dragSource === 'sidebar') {
        dragClone.remove();
        if (e.clientX > canvasRect.left && e.clientX < canvasRect.right &&
            e.clientY > canvasRect.top && e.clientY < canvasRect.bottom) {
            const x = e.clientX - canvasRect.left - dragOffset.x;
            const y = e.clientY - canvasRect.top - dragOffset.y;
            const newItem = createCanvasElement(dragItem.elementId, x, y, false, false, dragItem.colorTheme);
            const target = findMergeTargetAt(newItem, e.clientX, e.clientY);
            if (target) attemptMerge(newItem, target);
        }
        clearMergeHints();
        dragItem = null;
        dragClone = null;
        dragSource = null;
        return;
    } else {
        dragClone.classList.remove('dragging');
        dragClone.style.transition = 'all 0.2s cubic-bezier(0.25, 1, 0.5, 1)';
        dragClone.style.transform = 'scale(1)';

        // Remove element if dropped outside canvas or on any sidebar
        const isOutsideCanvas = e.clientX < canvasRect.left || e.clientX > canvasRect.right ||
                                e.clientY < canvasRect.top || e.clientY > canvasRect.bottom;
        const isOnRightSidebar = e.clientX >= sidebarRect.left && e.clientX <= sidebarRect.right &&
                                 e.clientY >= sidebarRect.top && e.clientY <= sidebarRect.bottom;

        if (isOutsideCanvas || isOnRightSidebar) {
            dragClone.style.transform = 'scale(0.5)';
            dragClone.style.opacity = '0';
            setTimeout(() => {
                removeCanvasItem(dragItem.uid);
                clearMergeHints();
                dragItem = null;
                dragClone = null;
                dragSource = null;
            }, 200);
            return;
        }

        let nx = e.clientX - canvasRect.left - dragOffset.x;
        let ny = e.clientY - canvasRect.top - dragOffset.y;
        const maxW = canvasRect.width - 60;
        const maxH = canvasRect.height - 60;
        nx = Math.max(-20, Math.min(nx, maxW));
        ny = Math.max(-20, Math.min(ny, maxH));

        dragItem.x = nx;
        dragItem.y = ny;
        dragClone.style.left = nx + 'px';
        dragClone.style.top = ny + 'px';

        const target = findMergeTarget(dragItem, e.clientX, e.clientY);
        if (target) attemptMerge(dragItem, target);
    }

    clearMergeHints();
    if (dragSource === 'canvas') {
        dragItem = null;
        dragClone = null;
        dragSource = null;
    }
}

function onSidebarTouchStart(e) {
    const touch = e.touches[0];
    onSidebarMouseDown({ target: e.target, clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => e.preventDefault() });
}

function onCanvasTouchStart(e) {
    const touch = e.touches[0];
    onCanvasMouseDown({ target: e.target, clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => e.preventDefault() });
}

function onTouchMove(e) {
    if (!dragItem) return;
    e.preventDefault();
    const touch = e.touches[0];
    onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
}

function onTouchEnd(e) {
    if (!dragItem) return;
    const touch = e.changedTouches[0];
    onMouseUp({ clientX: touch.clientX, clientY: touch.clientY });
}

let mergeHintEl = null;

function checkMergeHint(mouseX, mouseY) {
    clearMergeHints();
    if (!dragItem) return;

    const target = findMergeTargetAt(dragItem, mouseX, mouseY);
    if (target) {
        const targetEl = canvas.querySelector(`.canvas-element[data-uid="${target.uid}"]`);
        if (targetEl) {
            const rect = targetEl.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            const hint = document.createElement('div');
            hint.className = 'merge-hint';
            hint.style.left = (rect.left - canvasRect.left + rect.width / 2) + 'px';
            hint.style.top = (rect.top - canvasRect.top + rect.height / 2) + 'px';
            canvas.appendChild(hint);
            mergeHintEl = hint;
        }
    }
}

function clearMergeHints() {
    if (mergeHintEl) {
        mergeHintEl.remove();
        mergeHintEl = null;
    }
}

function findMergeTargetAt(item, mouseX, mouseY) {
    let selfRect;
    if (dragClone && dragClone.isConnected) {
        selfRect = dragClone.getBoundingClientRect();
    } else {
        const el = canvas.querySelector(`.canvas-element[data-uid="${item.uid}"]`);
        if (el) selfRect = el.getBoundingClientRect();
        else return null;
    }
    const selfCx = selfRect.left + selfRect.width / 2;
    const selfCy = selfRect.top + selfRect.height / 2;

    const threshold = Math.max(55, (selfRect.width + selfRect.height) / 3);
    for (const other of canvasItems) {
        if (other.uid === item.uid) continue;
        const otherEl = canvas.querySelector(`.canvas-element[data-uid="${other.uid}"]`);
        if (!otherEl) continue;
        const r = otherEl.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dist = Math.hypot(selfCx - cx, selfCy - cy);
        if (dist < threshold) return other;
    }
    return null;
}

function findMergeTarget(item, mouseX, mouseY) {
    return findMergeTargetAt(item, mouseX, mouseY);
}

function attemptMerge(a, b) {
    // Final items cannot be used to craft anything, even in admin mode
    if (finalItems.has(a.elementId) || finalItems.has(b.elementId)) {
        const targetEl = canvas.querySelector(`.canvas-element[data-uid="${b.uid}"]`);
        if (targetEl) {
            targetEl.classList.add('shake');
            setTimeout(() => targetEl.classList.remove('shake'), 400);
        }
        return;
    }

    const key = [a.elementId, b.elementId].sort().join(',');
    const resultId = recipes[key];

    if (!resultId) {
        const targetEl = canvas.querySelector(`.canvas-element[data-uid="${b.uid}"]`);
        if (targetEl) {
            targetEl.classList.add('shake');
            setTimeout(() => targetEl.classList.remove('shake'), 400);
        }
        return;
    }

    const aEl = canvas.querySelector(`.canvas-element[data-uid="${a.uid}"]`);
    const bEl = canvas.querySelector(`.canvas-element[data-uid="${b.uid}"]`);
    const rx = (a.x + b.x) / 2;
    const ry = (a.y + b.y) / 2;

    // Already-discovered recipe: floating result icon, ingredients remain
    if (discoveredRecipes.has(key)) {
        const ghost = document.createElement('div');
        ghost.className = 'merge-result-ghost';
        const el = elements[resultId];
        ghost.innerHTML = `<div class="el-icon">${el ? getIconHtml(resultId) : '<i class="fas fa-question"></i>'}</div>`;
        const targetRect = bEl ? bEl.getBoundingClientRect() : null;
        const canvasRect = canvas.getBoundingClientRect();
        if (targetRect) {
            ghost.style.left = (targetRect.left + targetRect.width / 2 - canvasRect.left) + 'px';
            ghost.style.top = (targetRect.top - canvasRect.top) + 'px';
        } else {
            ghost.style.left = b.x + 'px';
            ghost.style.top = b.y + 'px';
        }
        canvas.appendChild(ghost);
        ghost.addEventListener('animationend', () => ghost.remove(), { once: true });
        return;
    }

    if (aEl) {
        aEl.style.transition = 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        aEl.style.left = rx + 'px';
        aEl.style.top = ry + 'px';
        aEl.style.transform = 'scale(0.3)';
        aEl.style.opacity = '0';
    }
    if (bEl) {
        bEl.style.transition = 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        bEl.style.left = rx + 'px';
        bEl.style.top = ry + 'px';
        bEl.style.transform = 'scale(0.3)';
        bEl.style.opacity = '0';
    }

    setTimeout(() => {
        removeCanvasItem(a.uid);
        removeCanvasItem(b.uid);

        const isNewItem = !unlocked.has(resultId);
        const isNewRecipe = !discoveredRecipes.has(key);

        if (isNewItem) {
            unlocked.add(resultId);
            if (elements[resultId]) {
                elements[resultId].discovered = true;
            } else {
                elements[resultId] = {
                    id: resultId,
                    name: resultId,
                    icon: '<i class="fas fa-question"></i>',
                    discovered: true
                };
            }
            renderSidebar();
            updateAchievementCount();
        }

        if (isNewRecipe) {
            discoveredRecipes.add(key);
        }

        createCanvasElement(resultId, rx, ry, true);

        if (isNewItem || isNewRecipe) {
            saveProgress();
            setTimeout(() => showDiscoveryModal(resultId, a.elementId, b.elementId), 300);
        }
    }, 400);
}

function openEncyclopedia() {
    encyclopediaModal.classList.remove('hidden');
    document.getElementById('item-detail')?.classList.add('hidden');
    document.getElementById('final-item-detail')?.classList.add('hidden');
    renderItemsList();
    updateAchievementCount();
}

function closeEncyclopedia() {
    encyclopediaModal.classList.add('hidden');
}

function renderItemsList() {
    const query = searchBox.value.trim().toLowerCase();
    itemsList.innerHTML = '';

    const allIds = Object.keys(elements).sort((a, b) => a.localeCompare(b));
    const filtered = allIds.filter(id => unlocked.has(id) && !finalItems.has(id) && elements[id].name.toLowerCase().includes(query));

    const groups = {};
    filtered.forEach(id => {
        const letter = elements[id].name[0].toUpperCase();
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push(id);
    });

    const letters = Object.keys(groups).sort();
    if (letters.length === 0) {
        itemsList.innerHTML = '<div style="color:#888;text-align:center;padding:20px;font-size:13px;">No items found</div>';
        return;
    }

    letters.forEach(letter => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'letter-group';

        const header = document.createElement('div');
        header.className = 'letter-header';
        header.textContent = letter;
        groupDiv.appendChild(header);

        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'letter-items';

        groups[letter].forEach(id => {
            const el = elements[id];
            const row = document.createElement('div');
            row.className = 'item-row' + (unlocked.has(id) ? '' : ' undiscovered');
            row.innerHTML = `<div class="el-icon">${getIconHtml(id)}</div><div class="el-name">${el.name}</div>`;
            row.addEventListener('click', () => showItemDetail(id));
            itemsDiv.appendChild(row);
        });

        groupDiv.appendChild(itemsDiv);
        itemsList.appendChild(groupDiv);
    });
}

function isPlaceholderElement(id) {
    return elements[id] && typeof elements[id].icon === 'string' && elements[id].icon.includes('fa-question');
}

function updateAchievementCount() {
    const allIds = Object.keys(elements);
    const validIds = allIds.filter(id => !isPlaceholderElement(id));
    const total = validIds.length;
    const count = Array.from(unlocked).filter(id => !isPlaceholderElement(id)).length;
    achievementCount.textContent = `${count} / ${total}`;

    const finalCountEl = document.getElementById('final-count');
    const finalCountExpandedEl = document.getElementById('final-count-expanded');
    const finalTotal = finalItems.size;
    const finalDiscovered = Array.from(finalItems).filter(id => unlocked.has(id)).length;
    if (finalCountEl) finalCountEl.textContent = `${finalDiscovered} / ${finalTotal}`;
    if (finalCountExpandedEl) finalCountExpandedEl.textContent = `${finalDiscovered} / ${finalTotal}`;

    renderFinalItems();
}

function renderFinalItems() {
    const list = document.getElementById('final-items-list');
    if (!list) return;
    list.innerHTML = '';
    const discoveredFinals = Array.from(finalItems).filter(id => unlocked.has(id)).sort((a, b) => a.localeCompare(b));
    if (discoveredFinals.length === 0) {
        list.innerHTML = '<div style="color:#888;text-align:center;padding:20px;font-size:13px;">No final items discovered yet</div>';
        return;
    }

    const groups = {};
    discoveredFinals.forEach(id => {
        const letter = elements[id].name[0].toUpperCase();
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push(id);
    });

    const letters = Object.keys(groups).sort();
    letters.forEach(letter => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'letter-group';

        const header = document.createElement('div');
        header.className = 'letter-header';
        header.textContent = letter;
        groupDiv.appendChild(header);

        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'letter-items';

        groups[letter].forEach(id => {
            const el = elements[id];
            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `<div class="el-icon">${getIconHtml(id)}</div><div class="el-name">${el.name}</div>`;
            row.addEventListener('click', () => showItemDetail(id));
            itemsDiv.appendChild(row);
        });

        groupDiv.appendChild(itemsDiv);
        list.appendChild(groupDiv);
    });
}

function renderRecipes(containerId, sources) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (sources.length === 0) {
        container.innerHTML = '<div style="color:#888;font-size:12px;text-align:center;">Base element</div>';
        return;
    }
    const discoveredSources = sources.filter(([a, b]) => discoveredRecipes.has([a, b].sort().join(',')));
    if (discoveredSources.length === 0) {
        container.innerHTML = '<div style="color:#888;font-size:12px;text-align:center;">No recipes discovered yet</div>';
        return;
    }
    discoveredSources.forEach(([a, b]) => {
        const row = document.createElement('div');
        row.className = 'recipe-row';
        row.innerHTML = `
            <div class="recipe-ingredient">
                <div class="recipe-icon">${getIconHtml(a)}</div>
                <div class="recipe-name">${elements[a].name}</div>
            </div>
            <div class="recipe-plus">+</div>
            <div class="recipe-ingredient">
                <div class="recipe-icon">${getIconHtml(b)}</div>
                <div class="recipe-name">${elements[b].name}</div>
            </div>
        `;
        container.appendChild(row);
    });
}

function showItemDetail(id) {
    const el = elements[id];
    const sources = resultToSources[id] || [];
    const activeTab = document.querySelector('.modal-tab.active')?.dataset.tab;

    if (activeTab === 'achievements') {
        const detail = document.getElementById('final-item-detail');
        if (!detail) return;
        detail.dataset.id = id;
        document.getElementById('final-detail-icon').innerHTML = getIconHtml(id);
        document.getElementById('final-detail-name').textContent = el.name;
        renderRecipes('final-detail-recipes', sources);
        detail.classList.remove('hidden');
    } else {
        const detail = document.getElementById('item-detail');
        document.getElementById('detail-icon').innerHTML = getIconHtml(id);
        document.getElementById('detail-name').textContent = el.name;
        detail.dataset.id = id;

        const addBtn = document.getElementById('detail-add-btn');
        if (finalItems.has(id) && !godMode) {
            addBtn.style.display = 'none';
        } else {
            addBtn.style.display = 'flex';
        }

        renderRecipes('detail-recipes', sources);
        detail.classList.remove('hidden');
    }
}

function showDiscoveryModal(elementId, recipeA, recipeB) {
    const el = elements[elementId];
    document.getElementById('discovery-element').innerHTML = getIconHtml(elementId);
    document.getElementById('discovery-name').textContent = el.name;

    const recipeContainer = document.getElementById('discovery-recipe');
    if (recipeA && recipeB && recipeContainer) {
        recipeContainer.innerHTML = `
            <div class="discovery-recipe-ingredient">
                <div class="discovery-recipe-icon">${getIconHtml(recipeA)}</div>
                <div class="discovery-recipe-name">${elements[recipeA].name}</div>
            </div>
            <div class="discovery-recipe-plus">+</div>
            <div class="discovery-recipe-ingredient">
                <div class="discovery-recipe-icon">${getIconHtml(recipeB)}</div>
                <div class="discovery-recipe-name">${elements[recipeB].name}</div>
            </div>
        `;
        recipeContainer.style.display = 'flex';
    } else if (recipeContainer) {
        recipeContainer.style.display = 'none';
    }

    const badge = document.getElementById('discovery-badge');
    if (badge) {
        if (finalItems.has(elementId)) {
            badge.textContent = 'Final Item';
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
    discoveryModal.classList.remove('hidden');
}

function closeDiscoveryModal() {
    discoveryModal.classList.add('hidden');
}

function showAdminPasswordModal() {
    if (adminPasswordModal) adminPasswordModal.classList.remove('hidden');
    if (adminPasswordInput) {
        adminPasswordInput.value = '';
        setTimeout(() => adminPasswordInput.focus(), 50);
    }
}

function closeAdminPasswordModal() {
    if (adminPasswordModal) adminPasswordModal.classList.add('hidden');
    if (adminPasswordInput) adminPasswordInput.value = '';
}

function verifyAdminPassword() {
    if (!adminPasswordInput) return;
    const input = adminPasswordInput.value;
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(ADMIN_PASSWORD_SALT + input)).then(hashBuf => {
        (function iterate(count, buf) {
            if (count <= 0) {
                const hashArr = Array.from(new Uint8Array(buf));
                const hashHex = hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
                if (hashHex === ADMIN_PASSWORD_HASH) {
                    closeAdminPasswordModal();
                    toggleGodMode();
                } else {
                    adminPasswordInput.classList.add('shake');
                    adminPasswordInput.value = '';
                    setTimeout(() => {
                        adminPasswordInput.classList.remove('shake');
                        adminPasswordInput.focus();
                    }, 350);
                }
            } else {
                crypto.subtle.digest('SHA-256', buf).then(nextBuf => iterate(count - 1, nextBuf));
            }
        })(ADMIN_PASSWORD_ITERATIONS, hashBuf);
    });
}

function showConfirmModal(action = 'clearCanvas') {
    confirmAction = action;
    const textEl = document.querySelector('#confirm-modal .confirm-text');
    if (action === 'toggleGodMode') {
        textEl.textContent = godMode
            ? 'Exit admin mode and restore your progress?'
            : 'Enter admin mode? This will unlock all items and recipes.';
    } else {
        textEl.textContent = 'Are you sure you want to clear all elements from the canvas?';
    }
    confirmModal.classList.remove('hidden');
}

function closeConfirmModal() {
    confirmModal.classList.add('hidden');
}

function toggleGodMode() {
    const sidebarSearch = document.getElementById('sidebar-search');
    if (godMode) {
        adminSidebarSearch = sidebarSearch ? sidebarSearch.value : '';
    } else {
        normalSidebarSearch = sidebarSearch ? sidebarSearch.value : '';
    }

    closeEncyclopedia();
    document.getElementById('item-detail')?.classList.add('hidden');
    document.getElementById('final-item-detail')?.classList.add('hidden');

    if (!godMode) {
        godModeSnapshot = {
            unlocked: new Set(unlocked),
            discoveredRecipes: new Set(discoveredRecipes)
        };
        normalCanvasItems = canvasItems.slice();
        canvasItems = adminCanvasItems.slice();
        Object.keys(elements).forEach(id => {
            unlocked.add(id);
            elements[id].discovered = true;
        });
        Object.keys(recipes).forEach(key => discoveredRecipes.add(key));
        godMode = true;
        document.getElementById('btn-admin')?.classList.add('admin-active');
    } else {
        if (godModeSnapshot) {
            unlocked = godModeSnapshot.unlocked;
            discoveredRecipes = godModeSnapshot.discoveredRecipes;
            Object.keys(elements).forEach(id => {
                elements[id].discovered = unlocked.has(id);
            });
        }
        adminCanvasItems = canvasItems.slice();
        canvasItems = normalCanvasItems.slice();
        godMode = false;
        document.getElementById('btn-admin')?.classList.remove('admin-active');
    }

    if (sidebarSearch) {
        sidebarSearch.value = godMode ? adminSidebarSearch : normalSidebarSearch;
    }
    renderCanvas();
    renderSidebar();
    updateAchievementCount();
    saveProgress();
}

window.addElement = function(id, name, iconHtml) {
    elements[id] = { id, name, icon: iconHtml, discovered: false };
    updateAchievementCount();
};

window.addRecipe = function(a, b, result) {
    _addRecipe(a, b, result);
    if (!elements[result]) {
        elements[result] = { id: result, name: result, icon: '<i class="fas fa-question"></i>', discovered: false };
    }
    updateAchievementCount();
};

window.unlockElement = function(id) {
    unlocked.add(id);
    if (elements[id]) elements[id].discovered = true;
    renderSidebar();
    updateAchievementCount();
};

window.addFinalItem = function(id) {
    finalItems.add(id);
    renderSidebar();
    updateAchievementCount();
};

init();
