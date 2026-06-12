// ==========================================
// Element Alchemy - Core Logic
// ==========================================

const BASE_ELEMENTS = [
    { id: 'water', name: 'water', icon: '<i class="fas fa-tint"></i>' },
    { id: 'fire', name: 'fire', icon: '<i class="fas fa-fire"></i>' },
    { id: 'earth', name: 'earth', icon: '<i class="fas fa-mound"></i>' },
    { id: 'air', name: 'air', icon: '<i class="fas fa-wind"></i>' },
];

let elements = {};
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

const ADMIN_PASSWORD_HASH = '1b646461a9e3d9c6f18acca2f2e6243ac10a3a98bf578be3a54ee8addbfcd0a5';
const itemsList = document.getElementById('items-list');
const achievementCount = document.getElementById('achievement-count');

function init() {
    BASE_ELEMENTS.forEach(el => {
        elements[el.id] = { ...el, discovered: true };
        unlocked.add(el.id);
    });

    // Register new elements
    elements['lake'] = { id: 'lake', name: 'lake', icon: '<i class="fas fa-water"></i>', discovered: false };
    elements['ocean'] = { id: 'ocean', name: 'ocean', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M368.6 256.2c-13 .6-25.9 2.9-38 6-11.8 3-25.2 .6-35.5-5.9-10.1-6.4-15.2-15.1-15.2-24.3 0-48.6 39.4-88 88-88 13.5 0 26.3 3 37.7 8.5 9.9 4.7 21.6 2.1 28.6-6.2s7.6-20.4 1.3-29.3c-36.2-51.3-96-85-163.6-85-110.5 0-200 89.5-200 200l0 1.6c0 31.4-20.4 59.2-50.3 68.7l-4.9 1.5C4.9 307.6-2.1 319.8 .6 331.9s14.3 20.2 26.6 18.6c28.2-3.8 53.6-18.9 74.2-34.5 21.3-16.1 49.9-16.1 71.2 0 24.2 18.3 52.3 35.9 83.4 35.9s59.1-17.7 83.4-35.9c9.7-7.3 20.8-11.2 31.9-11.9 1.5-.1 3-.1 4.5-.1 12.1 .2 24.3 4.1 34.8 12.1 20.7 15.6 46 30.7 74.2 34.5 13.1 1.8 25.2-7.5 27-20.6s-7.5-25.2-20.6-27c-15.9-2.1-33.2-11.3-51.7-25.2-18.8-14.2-40.9-21.4-63.2-21.7-2.5 0-5.1 0-7.6 .2zM339.4 444.1c21.3-16.1 49.9-16.1 71.2 0 20.7 15.6 46 30.7 74.2 34.5 13.1 1.8 25.2-7.5 27-20.6s-7.5-25.2-20.6-27c-15.9-2.1-33.2-11.3-51.7-25.2-38.4-29-90.5-29-129 0-24 18.1-40.7 26.3-54.5 26.3s-30.5-8.2-54.5-26.3c-38.4-29-90.5-29-129 0-18.5 13.9-35.8 23.1-51.7 25.2-13.1 1.8-22.4 13.8-20.6 27s13.8 22.4 27 20.6c28.2-3.8 53.6-18.9 74.2-34.5 21.3-16.1 49.9-16.1 71.2 0 24.2 18.3 52.3 35.9 83.4 35.9s59.1-17.7 83.4-35.9z"/></svg>', discovered: false };
    elements['land'] = { id: 'land', name: 'land', icon: '<i class="fas fa-land-mine-on"></i>', discovered: false };
    elements['planet'] = { id: 'planet', name: 'planet', icon: '<i class="fas fa-earth-americas"></i>', discovered: false };
    elements['pressure'] = { id: 'pressure', name: 'pressure', icon: '<i class="fas fa-angle-double-down"></i>', discovered: false };
    elements['heat'] = { id: 'heat', name: 'heat', icon: '<i class="fas fa-temperature-high"></i>', discovered: false };
    elements['stone'] = { id: 'stone', name: 'stone', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 512 512" style="display:block;"><path fill="currentColor" d="M311.7 .1c9.8 .6 19.3 3.5 27.8 8.4L428.6 60c9.7 5.6 17.8 13.7 23.4 23.4l51.5 89.1c5.6 9.7 8.6 20.8 8.6 32l0 102.9-.1 4.2c-.6 9.8-3.5 19.3-8.4 27.8l-51.5 89.1-2.2 3.6c-5.4 8.1-12.7 14.9-21.2 19.8l-89.1 51.5-3.7 2c-7.5 3.7-15.7 5.9-24.1 6.5l-4.2 .1-102.9 0-4.2-.1c-8.4-.6-16.6-2.8-24.1-6.5l-3.7-2-89.1-51.5c-8.5-4.9-15.7-11.7-21.2-19.8L60 428.6 8.6 339.4c-4.9-8.5-7.8-18-8.4-27.8L0 307.4 0 204.6c0-9.8 2.3-19.5 6.6-28.3l2-3.7 51.5-89.1c4.9-8.5 11.7-15.7 19.8-21.2L83.4 60 172.6 8.6c8.5-4.9 18-7.8 27.8-8.4l4.2-.1 102.9 0 4.2 .1zM158.4 335.5l52.9 128.5 89.3 0 52.9-128.5-97.5-52.3-97.6 52.3zm246.2 2l-39.4 95.6 39.3-22.7 1.8-1.2c1.7-1.3 3-2.9 4.1-4.7l51.4-89.1 .9-1.9c.8-1.9 1.2-4 1.2-6.1l0-36.5-59.4 66.6zM48 307.4c0 2.8 .8 5.6 2.2 8l51.4 89.1 1.2 1.8c1.3 1.7 2.9 3 4.7 4.1l39.3 22.7-39.3-95.6-59.4-66.6 0 36.5zm55.2-202.3c-.6 .7-1.2 1.5-1.7 2.3L50.2 196.6c-.6 1-1 2.1-1.4 3.2l84.5 94.8 98.7-52.9 0-96-128.8-40.5zM280 145.8l0 95.8 98.7 52.9 84.5-94.7c-.1-.4-.2-.9-.4-1.3l-.9-1.9-51.4-89.1c-.1-.2-.3-.4-.4-.6l-130 39zM204.6 48c-2.1 0-4.2 .4-6.1 1.2l-1.9 .9-38.1 22 97.7 30.7 99.1-29.7-39.8-23c-2.4-1.4-5.2-2.2-8-2.2L204.6 48z"/></svg>', discovered: false };
    elements['hill'] = { id: 'hill', name: 'hill', icon: '<i class="fas fa-hill-rockslide"></i>', discovered: false };
    elements['mountain'] = { id: 'mountain', name: 'mountain', icon: '<i class="fas fa-mountain"></i>', discovered: false };
    elements['range'] = { id: 'range', name: 'range', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 640 512" style="display:block;"><path fill="currentColor" d="M256.2 32c13.7 0 26.4 7.5 33 19.6l202.5 373c6.3 11.6 6 25.7-.7 37.1-6.8 11.3-19 18.3-32.2 18.3l-405 0c-13.2 0-25.5-7-32.2-18.3-6.8-11.4-7.1-25.5-.8-37.1l202.5-373 2.8-4.3c7-9.5 18.2-15.3 30.2-15.3zM418 96c11.7 0 22.4 6.4 28.1 16.6l175.5 320 1.8 3.8c3.5 9.1 2.7 19.4-2.3 27.9-5.8 9.7-16.2 15.7-27.5 15.7l-56.2 0c11.2-23 11.6-49.9 .9-73.2l-2.5-5 0 0-151.4-278.8 5.7-10.2 2.3-3.7c6-8.1 15.5-13 25.7-13zM226.9 317.9c-8.3 7.2-20.2 7.7-29 1.8l-3.6-2.9-39.2-39-83.8 154.3 369.8 0-86.9-160-74.1 0-53.2 45.9zM179 233.8l33.4 33.2 43.2-37.2 3.5-2.5c3.7-2.2 7.9-3.3 12.2-3.3l56.9 0-71.9-132.5-77.2 142.3z"/></svg>', discovered: false };
    elements['wind'] = { id: 'wind', name: 'wind', icon: '<i class="fas fa-fan"></i>', discovered: false };
    elements['cold'] = { id: 'cold', name: 'cold', icon: '<i class="fas fa-temperature-low"></i>', discovered: false };
    elements['smoke'] = { id: 'smoke', name: 'smoke', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 512 512" style="display:block;"><path fill="currentColor" d="M294 34.5L281.7 48.3S257.2 18.9 242.8 7.5C237.4 3.2 231.3 .2 224 0s-14.6 2.3-20.3 7.5c-23.4 21.1-50 48.9-70.9 80.2-20.8 31.1-36.8 67.1-36.8 104.5 0 16.8 2.5 32.9 7.2 48.1 2.9-.2 5.8-.2 8.8-.2 12.7 0 25.1 1.5 36.9 4.3 14.1-10.8 29.9-19.6 47-25.8 10-28.6 36.6-54.4 50.8-66.8 5.4-4.7 13.1-4.7 18.5 0 14.2 12.3 40.8 38.2 50.8 66.8 17.1 6.2 32.9 14.9 47 25.8 11.9-2.8 24.2-4.3 37-4.3 2.9 0 5.8 .1 8.7 .2 4.7-15.2 7.3-31.3 7.3-48.1 0-30-11-60.9-26.2-88.1-15.2-27.4-35.3-52.3-55-70.6-5.6-5.2-12.8-7.8-19.9-7.8-7.6 0-15.5 2.8-20.9 8.9zM256 256c-38.1 0-72.2 16.6-95.7 43-14.6-7-31-11-48.3-11-61.9 0-112 50.1-112 112S50.1 512 112 512l288 0c61.9 0 112-50.1 112-112S461.9 288 400 288c-17.3 0-33.7 3.9-48.3 11-23.4-26.3-57.6-43-95.7-43zm-68.8 87.2c14-23.5 39.6-39.2 68.8-39.2s54.8 15.7 68.8 39.2c3.5 5.9 9.5 10.1 16.3 11.3s13.8-.5 19.2-4.8c10.9-8.6 24.6-13.8 39.7-13.8 35.3 0 64 28.7 64 64s-28.7 64-64 64l-288 0c-35.3 0-64-28.7-64-64s28.7-64 64-64c15 0 28.7 5.1 39.7 13.8 5.4 4.3 12.4 6 19.2 4.8s12.7-5.4 16.3-11.3z"/></svg>', discovered: false };
    elements['lightning'] = { id: 'lightning', name: 'lightning', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 512 512" style="display:block;"><path fill="currentColor" d="M184 48c-39.8 0-72 32.2-72 72 0 4.5 .4 8.8 1.2 13 2.4 13-6.3 25.5-19.3 27.9-26.1 4.8-45.9 27.6-45.9 55.1 0 30.9 25.1 56 56 56l84.2 0-53.6 48-30.6 0c-57.4 0-104-46.6-104-104 0-43.3 26.4-80.3 64-96 0-66.3 53.7-120 120-120 37.9 0 71.7 17.6 93.7 45 14.9-8.3 32.1-13 50.3-13 50 0 91.7 35.3 101.7 82.3 47 10 82.3 51.7 82.3 101.7 0 57.4-46.6 104-104 104l-53.9 0 12.7-42.3c.6-1.9 1-3.8 1.4-5.7l39.7 0c30.9 0 56-25.1 56-56s-25.1-56-56-56c-13.3 0-24-10.7-24-24 0-30.9-25.1-56-56-56-15.6 0-29.6 6.3-39.8 16.6-5.5 5.6-13.4 8.1-21.2 6.8s-14.3-6.4-17.6-13.6C237.9 65.1 212.9 48 184 48zM160.6 400c-9.2 0-16.6-7.4-16.6-16.6 0-4.7 2-9.2 5.5-12.4L290.7 244.7c3.4-3 7.8-4.7 12.4-4.7 12.4 0 21.3 12 17.8 23.9l-31.2 104.1 61.8 0c9.2 0 16.6 7.4 16.6 16.6 0 4.7-2 9.2-5.5 12.4L221.3 523.3c-3.4 3-7.8 4.7-12.4 4.7-12.4 0-21.3-12-17.8-23.9l31.2-104.1-61.8 0z"/></svg>', discovered: false };
    elements['rain'] = { id: 'rain', name: 'rain', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 512 512" style="display:block;"><path fill="currentColor" d="M112 120c0-39.8 32.2-72 72-72 28.9 0 53.9 17.1 65.4 41.8 3.3 7.1 9.9 12.2 17.6 13.6s15.7-1.2 21.2-6.8c10.2-10.3 24.2-16.6 39.8-16.6 30.9 0 56 25.1 56 56 0 13.3 10.7 24 24 24 30.9 0 56 25.1 56 56s-25.1 56-56 56l-304 0c-30.9 0-56-25.1-56-56 0-27.4 19.8-50.3 45.9-55.1 13-2.4 21.7-14.9 19.3-27.9-.8-4.2-1.2-8.5-1.2-13zM184 0C117.7 0 64 53.7 64 120 26.4 135.7 0 172.7 0 216 0 273.4 46.6 320 104 320l304 0c57.4 0 104-46.6 104-104 0-50-35.3-91.7-82.3-101.7-10-47-51.7-82.3-101.7-82.3-18.3 0-35.4 4.7-50.3 13-22-27.4-55.7-45-93.7-45zM64 368c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24s24-10.7 24-24l0-48c0-13.3-10.7-24-24-24zm192 0c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24s24-10.7 24-24l0-48c0-13.3-10.7-24-24-24zm192 0c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24s24-10.7 24-24l0-48c0-13.3-10.7-24-24-24zM160 416c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24s24-10.7 24-24l0-48c0-13.3-10.7-24-24-24zm192 0c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24s24-10.7 24-24l0-48c0-13.3-10.7-24-24-24z"/></svg>', discovered: false };
    elements['ice'] = { id: 'ice', name: 'ice', icon: '<i class="fas fa-cubes"></i>', discovered: false };
    elements['icicles'] = { id: 'icicles', name: 'icicles', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 512 512" style="display:block;"><path fill="currentColor" d="M5.2 9.1C9.7 3.4 16.7 0 24 0L488 0c6.9 0 13.5 3 18.1 8.2s6.6 12.2 5.7 19L448.9 483c-2.3 16.6-16.5 29-33.2 29-15.8 0-29.4-11-32.8-26.4l-50.3-229.1-11.2 38.2c-4.4 15-18.1 25.2-33.7 25.2-14.5 0-27.6-9-32.8-22.5l-9.4-24.6-20.2 84.9C221.5 373.1 207.8 384 192 384s-29.5-10.9-33.2-26.2l-20.2-84.9-9.5 24.8c-5.2 13.4-18.1 22.3-32.5 22.3-16.2 0-30.2-11.1-33.9-26.8L.6 29.5C-1 22.4 .6 14.8 5.2 9.1zM54.3 48l45.3 192.6 22-57.2c3.8-9.8 13.5-16 24-15.3s19.3 8.2 21.7 18.4L192 290 216.7 186.4c2.4-10.2 11.3-17.7 21.7-18.4s20.2 5.5 24 15.3L286 244.8 313 153.2c3.1-10.5 12.9-17.6 23.9-17.2s20.3 8.1 22.6 18.8l53 241.4 48-348.2-406.2 0z"/></svg>', discovered: false };
    elements['snowflake'] = { id: 'snowflake', name: 'snowflake', icon: '<i class="fas fa-snowflake"></i>', discovered: false };
    elements['snow'] = { id: 'snow', name: 'snow', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 512 512" style="display:block;"><path fill="currentColor" d="M112 120c0-39.8 32.2-72 72-72 28.9 0 53.9 17.1 65.4 41.8 3.3 7.1 9.9 12.2 17.6 13.6s15.7-1.2 21.2-6.8c10.2-10.3 24.2-16.6 39.8-16.6 30.9 0 56 25.1 56 56 0 13.3 10.7 24 24 24 30.9 0 56 25.1 56 56s-25.1 56-56 56l-304 0c-30.9 0-56-25.1-56-56 0-27.4 19.8-50.3 45.9-55.1 13-2.4 21.7-14.9 19.3-27.9-.8-4.2-1.2-8.5-1.2-13zM184 0C117.7 0 64 53.7 64 120 26.4 135.7 0 172.7 0 216 0 273.4 46.6 320 104 320l304 0c57.4 0 104-46.6 104-104 0-50-35.3-91.7-82.3-101.7-10-47-51.7-82.3-101.7-82.3-18.3 0-35.4 4.7-50.3 13-22-27.4-55.7-45-93.7-45zm96 424c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 16-16 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l16 0 0 16c0 13.3 10.7 24 24 24s24-10.7 24-24l0-16 16 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-16 0 0-16zM72 368c-13.3 0-24 10.7-24 24l0 16-16 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l16 0 0 16c0 13.3 10.7 24 24 24s24-10.7 24-24l0-16 16 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-16 0 0-16c0-13.3-10.7-24-24-24zm392 24c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 16-16 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l16 0 0 16c0 13.3 10.7 24 24 24s24-10.7 24-24l0-16 16 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-16 0 0-16z"/></svg>', discovered: false };
    elements['hail'] = { id: 'hail', name: 'hail', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 512 512" style="display:block;"><path fill="currentColor" d="M112 120c0-39.8 32.2-72 72-72 28.9 0 53.9 17.1 65.4 41.8 3.3 7.1 9.9 12.2 17.6 13.6s15.7-1.2 21.2-6.8c10.2-10.3 24.2-16.6 39.8-16.6 30.9 0 56 25.1 56 56 0 13.3 10.7 24 24 24 30.9 0 56 25.1 56 56s-25.1 56-56 56l-304 0c-30.9 0-56-25.1-56-56 0-27.4 19.8-50.3 45.9-55.1 13-2.4 21.7-14.9 19.3-27.9-.8-4.2-1.2-8.5-1.2-13zM184 0C117.7 0 64 53.7 64 120 26.4 135.7 0 172.7 0 216 0 273.4 46.6 320 104 320l304 0c57.4 0 104-46.6 104-104 0-50-35.3-91.7-82.3-101.7-10-47-51.7-82.3-101.7-82.3-18.3 0-35.4 4.7-50.3 13-22-27.4-55.7-45-93.7-45zM160 400a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm128 0a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM96 480a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm160-32a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>', discovered: false };
    elements['comet'] = { id: 'comet', name: 'comet', icon: '<i class="fas fa-meteor"></i>', discovered: false };
    elements['glass-water'] = { id: 'glass-water', name: 'glass water', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 384 512" style="display:block;"><path fill="currentColor" d="M24 0C17.3 0 10.9 2.8 6.3 7.8S-.5 19.4 .1 26.1L36.3 446.2C39.5 483.4 70.7 512 108 512L276 512c37.4 0 68.5-28.6 71.7-65.8L383.9 26.1c.6-6.7-1.7-13.3-6.2-18.3S366.7 0 360 0L24 0zM57.6 134.3l-7.4-86.3 283.7 0-7.4 86.3-25.2 14c-16.2 9-36.2 7.3-50.7-4.3-34.2-27.4-82.8-27.4-117 0-14.5 11.6-34.5 13.3-50.7 4.3l-25.2-14zm5 57.6c32.7 16.6 72.1 12.6 100.9-10.4 16.7-13.3 40.4-13.3 57 0 28.8 23 68.3 27 100.9 10.4L299.9 442.1C298.8 454.5 288.4 464 276 464L108 464c-12.5 0-22.8-9.5-23.9-21.9L62.6 191.9z"/></svg>', discovered: false };
    elements['magic'] = { id: 'magic', name: 'magic', icon: '<i class="fas fa-hand-sparkles"></i>', discovered: false };
    elements['magic-potion'] = { id: 'magic-potion', name: 'magic potion', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 384 512" style="display:block;"><path fill="currentColor" d="M96 0C78.3 0 64 14.3 64 32S78.3 64 96 64l0 89.7C38.7 186.9 0 248.9 0 320 0 426 86 512 192 512s192-86 192-192c0-71.1-38.7-133.1-96-166.3L288 64c17.7 0 32-14.3 32-32S305.7 0 288 0L96 0zm64 173.3l0-109.3 64 0 0 109.3c0 12.7 7.5 24.2 19.2 29.3 45.3 19.8 76.8 64.9 76.8 117.4 0 5.4-.3 10.8-1 16l-18.7 0c-29 0-57.5-7.9-82.3-22.8l-9.6-5.8c-21.2-12.7-45.4-19.4-70.1-19.4-17.3 0-34.5 3.3-50.6 9.7l-23 9.2c4.7-46.8 34.7-86.2 76.2-104.3 11.7-5.1 19.2-16.6 19.2-29.3z"/></svg>', discovered: false };
    elements['electricity'] = { id: 'electricity', name: 'electricity', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 640 512" style="display:block;"><path fill="currentColor" d="M112 448c-44.2 0-80-35.8-80-80l0-224c0-44.2 35.8-80 80-80l191.5 0-70.1 64-121.4 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16l82.2 0-5.5 14.4c-6.3 16.4-6.1 34-.6 49.6L112 448zM451.3 113.6c6.3-16.4 6.1-34 .6-49.6L528 64c44.2 0 80 35.8 80 80l0 48c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l0 48c0 44.2-35.8 80-80 80l-191.5 0 70.1-64 121.4 0c8.8 0 16-7.2 16-16l0-224c0-8.8-7.2-16-16-16l-82.2 0 5.5-14.4zM397.5 68.2c9.2 6.3 12.9 18 8.9 28.4L354.8 232 440 232c9.9 0 18.8 6.1 22.4 15.3s1.1 19.7-6.2 26.4l-184 168c-8.2 7.5-20.5 8.4-29.7 2.1s-12.9-18-8.9-28.4L285.2 280 200 280c-9.9 0-18.8-6.1-22.4-15.3s-1.1-19.7 6.2-26.4l184-168c8.2-7.5 20.5-8.4 29.7-2.1z"/></svg>', discovered: false };
    elements['tap'] = { id: 'tap', name: 'tap', icon: '<div style="position:relative;display:inline-flex;align-items:center;justify-content:center;"><i class="fas fa-faucet" style="font-size:1em;"></i><i class="fas fa-tint" style="font-size:0.25em;position:absolute;bottom:-0.65em;right:-0.1em;"></i></div>', discovered: false };
    elements['ship'] = { id: 'ship', name: 'ship', icon: '<i class="fas fa-ship"></i>', discovered: false };
    elements['tsunami'] = { id: 'tsunami', name: 'tsunami', icon: '<i class="fas fa-house-tsunami"></i>', discovered: false };
    elements['lightbulb'] = { id: 'lightbulb', name: 'lightbulb', icon: '<i class="fas fa-lightbulb"></i>', discovered: false };
    elements['airplane'] = { id: 'airplane', name: 'airplane', icon: '<i class="fas fa-plane"></i>', discovered: false };
    elements['magnet'] = { id: 'magnet', name: 'magnet', icon: '<i class="fas fa-magnet"></i>', discovered: false };
    elements['blade'] = { id: 'blade', name: 'blade', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 19l15 -15l3 3l-6 6l2 2a14 14 0 0 1 -14 4"/></svg>', discovered: false };
    elements['sun'] = { id: 'sun', name: 'sun', icon: '<i class="fas fa-sun"></i>', discovered: false };
    elements['mountain-sun'] = { id: 'mountain-sun', name: 'mountain-sun', icon: '<i class="fas fa-mountain-sun"></i>', discovered: false };
    elements['moon'] = { id: 'moon', name: 'moon', icon: '<i class="fas fa-moon"></i>', discovered: false };
    elements['tornado'] = { id: 'tornado', name: 'tornado', icon: '<i class="fas fa-tornado"></i>', discovered: false };
    elements['metal'] = { id: 'metal', name: 'metal', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M96 160C96 124.7 124.7 96 160 96L480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160zM192 168C192 154.7 181.3 144 168 144C154.7 144 144 154.7 144 168C144 181.3 154.7 192 168 192C181.3 192 192 181.3 192 168zM472 192C485.3 192 496 181.3 496 168C496 154.7 485.3 144 472 144C458.7 144 448 154.7 448 168C448 181.3 458.7 192 472 192zM192 472C192 458.7 181.3 448 168 448C154.7 448 144 458.7 144 472C144 485.3 154.7 496 168 496C181.3 496 192 485.3 192 472zM472 496C485.3 496 496 485.3 496 472C496 458.7 485.3 448 472 448C458.7 448 448 458.7 448 472C448 485.3 458.7 496 472 496z"/></svg>', discovered: false };
    elements['volcano'] = { id: 'volcano', name: 'volcano', icon: '<i class="fas fa-volcano"></i>', discovered: false };
    elements['burst'] = { id: 'burst', name: 'burst', icon: '<i class="fas fa-burst"></i>', discovered: false };
    elements['glass'] = { id: 'glass', name: 'glass', icon: '<i class="fas fa-window-maximize"></i>', discovered: false };
    elements['glasses'] = { id: 'glasses', name: 'glasses', icon: '<i class="fas fa-glasses"></i>', discovered: false };
    elements['time'] = { id: 'time', name: 'hourglass', icon: '<i class="fas fa-hourglass-half"></i>', discovered: false };
    elements['steam'] = { id: 'steam', name: 'steam', icon: '<i class="fas fa-smog"></i>', discovered: false };
    elements['cloud'] = { id: 'cloud', name: 'cloud', icon: '<i class="fas fa-cloud"></i>', discovered: false };
    elements['sand'] = { id: 'sand', name: 'sand', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M517.3 432L123.2 432L218 267.1C239 230.5 278 208 320.2 208C362.4 208 401.4 230.6 422.4 267.1L517.3 432zM320.2 160C260.8 160 206 191.7 176.3 243.2L67.8 432C55.5 453.3 70.9 480 95.5 480L544.9 480C569.5 480 584.9 453.4 572.6 432L464.1 243.2C434.5 191.7 379.6 160 320.2 160z"/></svg>', discovered: false };
    elements['light'] = { id: 'light', name: 'light', icon: '<i class="bi bi-stars"></i>', discovered: false };
    elements['star'] = { id: 'star', name: 'star', icon: '<i class="fas fa-star"></i>', discovered: false };
    elements['night'] = { id: 'night', name: 'night', icon: '<div style="position:relative;display:inline-flex;align-items:center;justify-content:center;width:1em;height:1em;"><i class="fas fa-moon" style="font-size:0.85em;position:absolute;bottom:0;left:0;"></i><i class="fas fa-star" style="font-size:0.3em;position:absolute;top:0.05em;right:0.05em;"></i></div>', discovered: false };
    elements['shooting-star'] = { id: 'shooting-star', name: 'shooting star', icon: '<div style="position:relative;display:inline-flex;align-items:center;justify-content:center;"><i class="fas fa-star" style="font-size:0.85em;"></i><div style="position:absolute;transform:rotate(-35deg);top:-0.45em;right:-0.5em;pointer-events:none;"><div style="width:0.8em;height:0.08em;background:currentColor;border-radius:0.04em;position:absolute;top:0;right:0;"></div><div style="width:0.6em;height:0.08em;background:currentColor;border-radius:0.04em;position:absolute;top:0.2em;right:0.2em;"></div><div style="width:0.45em;height:0.08em;background:currentColor;border-radius:0.04em;position:absolute;top:0.4em;right:0.4em;"></div></div></div>', discovered: false };
    elements['energy'] = { id: 'energy', name: 'energy', icon: '<i class="fa-solid fa-bolt-lightning"></i>', discovered: false };
    elements['rainbow'] = { id: 'rainbow', name: 'rainbow', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 576 512" style="display:block;"><path fill="currentColor" d="M330.3 144c55.5-59.1 134.3-96 221.7-96 13.3 0 24-10.7 24-24S565.3 0 552 0c-113.6 0-214.7 53.9-279.1 137.5 5.7 3.5 11.1 7.4 16.3 11.6 12.4-3.3 25.4-5 38.8-5 .8 0 1.5 0 2.3 0zm168 109.7c15.9-8.7 34.3-13.7 53.7-13.7 13.3 0 24-10.7 24-24s-10.7-24-24-24c-34.2 0-65.8 10.7-91.8 28.9 2.8 4.9 5.3 10 7.6 15.3 10.9 4.7 21.1 10.5 30.5 17.5zm-68.1-70.3c34.2-24.8 76.4-39.4 121.9-39.4 13.3 0 24-10.7 24-24s-10.7-24-24-24c-62.7 0-120.2 22.6-164.7 60 15.8 6.7 30.3 16 42.8 27.4zM112 280c0-39.8 32.2-72 72-72 28.9 0 53.9 17.1 65.4 41.8 3.3 7.1 9.9 12.2 17.6 13.6s15.7-1.2 21.2-6.7c10.2-10.3 24.2-16.6 39.8-16.6 30.9 0 56 25.1 56 56 0 13.3 10.7 24 24 24 30.9 0 56 25.1 56 56s-25.1 56-56 56l-304 0c-30.9 0-56-25.1-56-56 0-27.4 19.8-50.3 45.9-55.1 13-2.4 21.7-14.9 19.3-27.9-.8-4.2-1.2-8.5-1.2-13zm72-120c-66.3 0-120 53.7-120 120-37.6 15.7-64 52.7-64 96 0 57.4 46.6 104 104 104l304 0c57.4 0 104-46.6 104-104 0-50-35.3-91.7-82.3-101.7-10-47-51.7-82.3-101.7-82.3-18.3 0-35.4 4.7-50.3 13-22-27.4-55.7-45-93.7-45z"/></svg>', discovered: false };
    elements['ice-water'] = { id: 'ice-water', name: 'ice water', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 448 512" style="display:block;"><path fill="currentColor" d="M48 104c0-13.3 10.7-24 24-24l304 0c13.3 0 24 10.7 24 24l0 120-72.9 0-7.6-28.2c-9-33.7-43.6-53.6-77.3-44.6l-94.4 25.3c-23.6 6.3-40.5 25.2-45.3 47.5L48 224 48 104zm60 168l20.4 76.2c9 33.7 43.6 53.6 77.3 44.6l94.4-25.3c33.7-9 53.6-43.6 44.6-77.3l-4.9-18.2 60 0 0 72c0 48.6-39.4 88-88 88l-176 0c-48.6 0-88-39.4-88-88l0-72 60 0zM72 32C32.2 32 0 64.2 0 104L0 344c0 75.1 60.9 136 136 136l176 0c75.1 0 136-60.9 136-136l0-240c0-39.8-32.2-72-72-72L72 32zM254.7 197.5c8.1-2.2 16.3 2.6 18.5 10.7l25.3 94.4c2.2 8.1-2.6 16.3-10.7 18.5l-94.4 25.3c-8.1 2.2-16.3-2.6-18.5-10.7l-25.3-94.4c-2.2-8.1 2.6-16.3 10.7-18.5l94.4-25.3z"/></svg>', discovered: false };
    elements['starfish'] = { id: 'starfish', name: 'starfish', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 512 512" style="display:block;"><path fill="currentColor" d="M290 0C261.2 0 234 13.1 216.1 35.5L205.3 49c-15.7 19.6-39.4 31-64.5 31L90.1 80c-49.7 0-90 40.3-90 90.1 0 19.4 6.3 38.3 18 53.9L37.7 250c6.8 9.1 10.5 20.1 10.5 31.4 0 10.5-3.2 20.8-9.1 29.5l-8.4 12.3c-9.5 13.9-14.6 30.3-14.6 47.1 0 54.9 52.1 94.9 105.2 80.8l34.1-9.1c5.3-1.4 10.7-2.1 16.2-2.1l6.6 0c23.7 0 46.6 8.8 64.2 24.6l27.6 24.9c16.1 14.5 37 22.5 58.6 22.5 48.4 0 87.6-39.2 87.6-87.6l0-32.7c0-24.2 13.5-46.4 35-57.6l8.9-4.6c32-16.6 52.1-49.6 52.1-85.6 0-36.3-20.4-69.5-52.8-86l-32.1-16.3c-19.6-9.9-34-27.7-39.7-48.9L381.3 70C370.2 28.7 332.8 0 290 0zM253.6 65.5c8.8-11.1 22.2-17.5 36.4-17.5 21.1 0 39.5 14.1 45 34.5l6.2 22.8c9.3 34.3 32.6 63.1 64.4 79.2l32.1 16.3c16.3 8.2 26.5 24.9 26.5 43.2 0 18.1-10.1 34.7-26.2 43l-8.9 4.6c-37.4 19.4-61 58-61 100.2l0 32.7c0 21.9-17.7 39.6-39.6 39.6-9.8 0-19.2-3.6-26.5-10.2L274.3 429c-26.4-23.8-60.8-37-96.3-37l-6.6 0c-9.6 0-19.2 1.3-28.5 3.7l-34.1 9.1c-22.6 6-44.8-11-44.8-34.4 0-7.2 2.2-14.2 6.2-20.1L78.7 338c11.4-16.7 17.5-36.4 17.5-56.6 0-21.7-7-42.8-20.1-60.2L56.5 195.2c-5.4-7.3-8.4-16.1-8.4-25.1 0-23.2 18.8-42 42-42l50.7 0c39.7 0 77.2-18 102-49l10.8-13.5zM160 256a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm160-64a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM288 352a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/></svg>', discovered: false };
    elements['igloo'] = { id: 'igloo', name: 'igloo', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 576 512" style="display:block;"><path fill="currentColor" d="M528 416l0-48-128 0 0 64 112 0c8.8 0 16-7.2 16-16zM352 352c0-35.3-28.7-64-64-64s-64 28.7-64 64l0 80 128 0 0-80zM288 240c50.7 0 93.6 33.7 107.4 80l36.6 0 0-112-288 0 0 112 36.6 0c13.8-46.3 56.6-80 107.4-80zm192-32l0 112 48 0c0-40.5-10-78.6-27.7-112L480 208zM75.7 208C58 241.4 48 279.5 48 320l48 0 0-112-20.3 0zM320 82.1c-10.5-1.4-21.1-2.1-32-2.1-71.1 0-134.9 30.9-178.9 80l210.9 0 0-77.9zm48 11.5l0 66.3 98.9 0c-26.6-29.7-60.5-52.8-98.9-66.3zM48 368l0 48c0 8.8 7.2 16 16 16l112 0 0-64-128 0zM176 480L64 480c-35.3 0-64-28.7-64-64l0-96C0 160.9 128.9 32 288 32S576 160.9 576 320l0 96c0 35.3-28.7 64-64 64l-336 0z"/></svg>', discovered: false };
    elements['universe'] = { id: 'universe', name: 'universe', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 512 512" style="display:block;"><path fill="currentColor" d="M182.9 61.2c74-27.7 160.6-11.8 220.2 47.7 71.8 71.8 80.1 182.9 25.1 263.8-14.8-2.5-30.6 1.9-42.1 13.4-18.7 18.7-18.7 49.1 0 67.9s49.1 18.7 67.9 0c13.6-13.6 17.3-33.4 11.2-50.3 70.7-99.9 61.3-239.2-28.2-328.7-76-76-187.9-94.2-281.2-54.7 1.3 1.2 2.7 2.5 4 3.7 10.8 10.8 18.5 23.6 23.1 37.1zm-74 341.9c-71.8-71.8-80.1-182.9-25.1-263.8 14.8 2.5 30.6-1.9 42.1-13.4 18.7-18.7 18.7-49.1 0-67.9S76.8 39.3 58 58c-13.6 13.6-17.3 33.4-11.2 50.3-70.7 99.9-61.3 239.2 28.2 328.7 76 76 187.9 94.2 281.2 54.7-1.3-1.2-2.7-2.5-4-3.8-10.8-10.8-18.5-23.6-23.1-37.1-74 27.7-160.6 11.8-220.2-47.7zM144 256c0-61.9 50.1-112 112-112 20.5 0 39.7 5.5 56.2 15.1-.2 10.5 3.7 21 11.7 29s18.6 11.9 29 11.7c9.6 16.5 15.1 35.7 15.1 56.2 0 61.9-50.1 112-112 112S144 317.9 144 256zm246.9-86.1c3.4-13.3 0-28-10.4-38.4s-25.1-13.9-38.4-10.4C317.2 105.2 287.7 96 256 96 167.6 96 96 167.6 96 256s71.6 160 160 160 160-71.6 160-160c0-31.7-9.2-61.2-25.1-86.1zM256 240a16 16 0 1 1 0 32 16 16 0 1 1 0-32zm0 80a64 64 0 1 0 0-128 64 64 0 1 0 0 128z"/></svg>', discovered: false };
    elements['avalanche'] = { id: 'avalanche', name: 'avalanche', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 576 512" style="display:block;"><path fill="currentColor" d="M551.5 391.1c34.4-34.4 34.4-90.1 0-124.5-27.8-27.8-69.5-33.1-102.6-16-11.8 6.1-16.4 20.6-10.3 32.3s20.6 16.4 32.3 10.3c15.1-7.8 34-5.3 46.6 7.3 15.6 15.6 15.6 40.9 0 56.6s-40.9 15.6-56.6 0l-81.7-81.7c22.3-14.2 37.1-39.1 37.1-67.5 0-33.9-21.1-62.9-50.9-74.5 1.9-6.8 2.9-14 2.9-21.5 0-44.2-35.8-80-80-80-27.3 0-51.5 13.7-65.9 34.6-5.8-20-24.2-34.6-46.1-34.6-26.5 0-48 21.5-48 48 0 4 .5 7.9 1.4 11.6L440.1 401.9c34.2 23.1 81.1 19.5 111.4-10.8zM448.4 96a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm64 64a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM48.4 440l0-294.1 318.1 318.1-294.1 0c-13.3 0-24-10.7-24-24zM68.7 98.3C43.5 73.1 .4 91 .4 126.6L.4 440c0 39.8 32.2 72 72 72l313.4 0c35.6 0 53.5-43.1 28.3-68.3L68.7 98.3z"/></svg>', discovered: false };
    elements['sunglasses'] = { id: 'sunglasses', name: 'sunglasses', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 576 512" style="display:block;"><path fill="currentColor" d="M135.8 80c-17.7 0-33.3 11.7-38.4 28.6L53.8 256 224 256c17.7 0 32 14.3 32 32l64 0c0-17.7 14.3-32 32-32l170.2 0-43.7-147.4c-5-17-20.6-28.6-38.4-28.6L408 80c-13.3 0-24-10.7-24-24s10.7-24 24-24l32.2 0c39 0 73.3 25.6 84.4 63l47.8 161.3c2.4 8.1 3.6 16.5 3.6 25L576 384c0 53-43 96-96 96l-64 0c-53 0-96-43-96-96l0-48-64 0 0 48c0 53-43 96-96 96l-64 0c-53 0-96-43-96-96L0 281.3c0-8.5 1.2-16.9 3.6-25L51.4 95c11.1-37.4 45.4-63 84.4-63L168 32c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32.2 0zM486.5 304l-118.5 0 0 80c0 5.2 .8 10.3 2.4 15l116.1-95zM528 332.1l-121.1 99c2.9 .6 6 .9 9.1 .9l64 0c26.5 0 48-21.5 48-48l0-51.9zM48 304l0 80c0 5.2 .8 10.3 2.4 15L166.5 304 48 304zM96 432l64 0c26.5 0 48-21.5 48-48l0-51.9-121.1 99c2.9 .6 6 .9 9.1 .9z"/></svg>', discovered: false };
    elements['ufo'] = { id: 'ufo', name: 'ufo', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 576 512" style="display:block;"><path fill="currentColor" d="M444.3 266.7c9-9 14.1-21.2 14.1-33.9 0-2 0-4-.1-6 2.3 .9 4.5 1.9 6.6 2.8 22.1 9.8 38.4 20.9 48.9 31.9 10.4 10.9 14.1 20.7 14.1 29.1s-3.7 18.2-14.1 29.1c-10.5 11.1-26.9 22.1-48.9 31.9-44 19.6-106.6 32.3-176.9 32.3s-132.9-12.7-176.9-32.3C89 341.9 72.7 330.9 62.1 319.8 51.7 308.9 48 299.1 48 290.7s3.7-18.2 14.1-29.1c10.5-11.1 26.9-22.1 48.9-31.9 2.2-1 4.4-1.9 6.6-2.8-.1 2-.1 4-.1 6 0 12.7 5.1 24.9 14.1 33.9 39.4 39.4 102.7 53.6 156.3 53.6s117-14.2 156.3-53.6zM128.8 171.8c-13.2 4.1-25.7 8.8-37.3 14-25.7 11.4-48 25.7-64.2 42.7-16.3 17.1-27.4 38.2-27.4 62.2s11 45.1 27.4 62.2c16.2 17 38.5 31.3 64.2 42.7 51.5 22.9 121 36.4 196.4 36.4s144.9-13.5 196.4-36.4c25.7-11.4 48-25.7 64.2-42.7 16.3-17.1 27.4-38.2 27.4-62.2s-11-45.1-27.4-62.2c-16.2-17-38.5-31.3-64.2-42.7-11.6-5.1-24-9.8-37.3-14-24.5-64-86.5-109.4-159.2-109.4S153.4 107.8 128.8 171.8zm281.6 61c-52.7 52.7-192.1 52.7-244.8 0 0-67.6 54.8-122.4 122.4-122.4s122.4 54.8 122.4 122.4z"/></svg>', discovered: false };
    elements['life'] = { id: 'life', name: 'life', icon: '<i class="fa-solid fa-dna"></i>', discovered: false };
    elements['dessert'] = { id: 'dessert', name: 'dessert', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M344 64L344 192C344 205.3 333.3 216 320 216C306.7 216 296 205.3 296 192L296 64C296 50.7 306.7 40 320 40C333.3 40 344 50.7 344 64zM192 352C192 334.3 206.3 320 224 320L416 320C433.7 320 448 334.3 448 352L448 384L528 384C554.5 384 576 405.5 576 432L576 528C576 554.5 554.5 576 528 576L112 576C85.5 576 64 554.5 64 528L64 432C64 405.5 85.5 384 112 384L192 384L192 352zM528 528L528 432L112 432L112 528L528 528zM44 178.7C51.4 167.7 66.3 164.7 77.3 172L173.3 236C184.3 243.4 187.3 258.3 180 269.3C172.7 280.3 157.7 283.3 146.7 276L50.7 212C39.7 204.6 36.7 189.7 44 178.7zM562.7 172C573.7 164.6 588.6 167.6 596 178.7C603.4 189.8 600.4 204.6 589.3 212L493.3 276C482.3 283.4 467.4 280.4 460 269.3C452.6 258.2 455.6 243.4 466.7 236L562.7 172z"/></svg>', discovered: false };
    elements['island'] = { id: 'island', name: 'island', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M190.5 0c58.3 0 94.9 25.5 113.4 53.2 19.9-12.6 46.5-21.2 80.3-21.2 77.4 0 116.6 44.8 125.8 80.2 2.2 8.6-5 15.8-13.8 15.8l-44.7 0c-2.1 0-4.2-.8-5.7-2.3l-24-24c-3.1-3.1-8.2-3.1-11.3 0l-24 24c-1.5 1.5-3.5 2.3-5.7 2.3l-61.3 0c3.5 15.4 7.2 35.7 9.5 59.7 4.4 45.4 3.6 104.4-14 167.2 57.8 12.4 101.1 63.7 101.1 125.2 0 17.7-14.3 32-32 32l-320 0-3.3-.2c-16.1-1.6-28.7-15.3-28.7-31.8 0-70.7 57.3-128 128-128L266 352c18.5-59.2 19.6-115.9 15.4-159.7-2.4-24.5-6.4-44.8-9.8-58.9L159.4 245.6c-6.2 6.2-16.5 6.2-20.9-1.4-18.5-31.6-22.5-91 32.2-145.7 1.4-1.4 2.8-2.7 4.2-4-.3-.2-.7-.5-1-.8l-24-24c-3.1-3.1-8.2-3.1-11.3 0l-24 24c-1.5 1.5-3.5 2.3-5.7 2.3L78.5 96C69.7 96 62.4 88.7 64.7 80.2 73.9 44.8 113.1 0 190.5 0zM160.3 400c-38.7 0-71 27.5-78.4 64l284.8 0c-7.4-36.5-39.7-64-78.4-64l-128 0z"/></svg>', discovered: false };
    elements['human'] = { id: 'human', name: 'human', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M376 88C376 57.1 350.9 32 320 32C289.1 32 264 57.1 264 88C264 118.9 289.1 144 320 144C350.9 144 376 118.9 376 88zM400 300.7L446.3 363.1C456.8 377.3 476.9 380.3 491.1 369.7C505.3 359.1 508.3 339.1 497.7 324.9L427.2 229.9C402 196 362.3 176 320 176C277.7 176 238 196 212.8 229.9L142.3 324.9C131.8 339.1 134.7 359.1 148.9 369.7C163.1 380.3 183.1 377.3 193.7 363.1L240 300.7L240 576C240 593.7 254.3 608 272 608C289.7 608 304 593.7 304 576L304 416C304 407.2 311.2 400 320 400C328.8 400 336 407.2 336 416L336 576C336 593.7 350.3 608 368 608C385.7 608 400 593.7 400 576L400 300.7z"/></svg>', discovered: false };
    elements['alien'] = { id: 'alien', name: 'alien', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M320 64C196.3 64 96 164.3 96 288C96 423.3 244.8 535.7 290.7 567.2C299.3 573.1 309.5 576 320 576C330.5 576 340.7 573.1 349.3 567.2C395.2 535.7 544 423.3 544 288C544 164.3 443.7 64 320 64zM352 370.3C352 324.9 388.8 288 434.3 288L466.3 288C473.9 288 480 294.1 480 301.7C480 347.1 443.2 384 397.7 384L365.7 384C358.1 384 352 377.9 352 370.3zM205.7 288C251.1 288 288 324.8 288 370.3C288 377.9 281.9 384 274.3 384L242.3 384C196.9 384 160 347.2 160 301.7C160 294.1 166.1 288 173.7 288L205.7 288z"/></svg>', discovered: false };
    elements['scissors'] = { id: 'scissors', name: 'scissors', icon: '<i class="fas fa-scissors"></i>', discovered: false };
    elements['civilization'] = { id: 'civilization', name: 'civilization', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M64 96L576 96L576 160L64 160L64 96zM64 480L96 480L96 208L544 208L544 480L576 480L576 544L416 544L416 416C416 363 373 320 320 320C267 320 224 363 224 416L224 544L64 544L64 480z"/></svg>', discovered: false };
    elements['plant'] = { id: 'plant', name: 'plant', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M576 96C576 204.1 499.4 294.3 397.6 315.4C389.7 257.3 363.6 205 325.1 164.5C365.2 104 433.9 64 512 64L544 64C561.7 64 576 78.3 576 96zM64 160C64 142.3 78.3 128 96 128L128 128C251.7 128 352 228.3 352 352L352 544C352 561.7 337.7 576 320 576C302.3 576 288 561.7 288 544L288 384C164.3 384 64 283.7 64 160z"/></svg>', discovered: false };
    elements['tree'] = { id: 'tree', name: 'tree', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M320 32C327 32 333.7 35.1 338.3 40.5L474.3 200.5C480.4 207.6 481.7 217.6 477.8 226.1C473.9 234.6 465.4 240 456 240L431.1 240L506.3 328.5C512.4 335.6 513.7 345.6 509.8 354.1C505.9 362.6 497.4 368 488 368L449.5 368L538.3 472.5C544.4 479.6 545.7 489.6 541.8 498.1C537.9 506.6 529.4 512 520 512L352 512L352 576C352 593.7 337.7 608 320 608C302.3 608 288 593.7 288 576L288 512L120 512C110.6 512 102.1 506.6 98.2 498.1C94.3 489.6 95.6 479.6 101.7 472.5L190.5 368L152 368C142.6 368 134.1 362.6 130.2 354.1C126.3 345.6 127.6 335.6 133.7 328.5L208.9 240L184 240C174.6 240 166.1 234.6 162.2 226.1C158.3 217.6 159.6 207.6 165.7 200.5L301.7 40.5C306.3 35.1 313 32 320 32z"/></svg>', discovered: false };
    elements['forest'] = { id: 'forest', name: 'forest', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M192 64C199 64 205.7 67.1 210.2 72.4L306.2 184.4L308.3 187.2C312.6 194 313.3 202.6 309.8 210C305.9 218.5 297.4 224 288 224L271.1 224L346.3 312.5C352.3 319.6 353.7 329.6 349.8 338.1C345.9 346.6 337.4 352 328 352L303.1 352L378.3 440.5C384.3 447.6 385.7 457.6 381.8 466.1C377.9 474.6 369.4 480 360 480L224 480L224 544C224 561.7 209.7 576 192 576C174.3 576 160 561.7 160 544L160 480L24 480C14.6 480 6.1 474.5 2.2 466.1C-1.7 457.7-.4 447.6 5.7 440.5L80.9 352L56 352C46.6 352 38.1 346.5 34.2 338.1C30.3 329.7 31.6 319.6 37.7 312.5L112.9 224L96 224C86.6 224 78.1 218.5 74.2 210C70.3 201.5 71.7 191.5 77.8 184.3L173.8 72.3L175.6 70.4C180 66.4 185.9 64 192 64zM448 64C455 64 461.7 67.1 466.2 72.4L562.2 184.4L564.3 187.2C568.6 194 569.3 202.6 565.8 210C561.9 218.5 553.4 224 544 224L527.1 224L602.3 312.5C608.3 319.6 609.7 329.6 605.8 338.1C601.9 346.6 593.4 352 584 352L559.1 352L634.3 440.5C640.3 447.6 641.7 457.6 637.8 466.1C633.9 474.6 625.4 480 616 480L480 480L480 544C480 561.7 465.7 576 448 576C430.3 576 416 561.7 416 544L416 501.2C419.7 496.7 422.8 491.7 425.3 486.3L425.3 486.3C436.3 462.4 433.4 434.6 418.1 413.6L414.8 409.5L414.8 409.5L384 373.2C387.6 368.7 390.8 363.7 393.3 358.3L393.3 358.3C404.3 334.4 401.4 306.6 386.1 285.6L382.8 281.5L382.8 281.5L347.7 240.2C349.8 237 351.7 233.7 353.4 230.2L353.4 230.2C363.1 209.2 361.9 185.2 351.1 165.5L350.6 164.7L429.7 72.5L431.5 70.6C436 66.4 441.9 64 448 64z"/></svg>', discovered: false };
    elements['seed'] = { id: 'seed', name: 'seed', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M128 128L102.6 102.6C98.4 98.4 96 92.6 96 86.6C96 74.1 106.1 64 118.6 64L521.4 64C533.9 64 544 74.1 544 86.6C544 92.6 541.6 98.4 537.4 102.6L512 128L530.6 202.5C539.5 238 544 274.5 544 311.2L544 328.9C544 365.5 539.5 402 530.6 437.6L512 512L537.4 537.4C541.6 541.6 544 547.4 544 553.4C544 565.9 533.9 576 521.4 576L118.6 576C106.1 576 96 565.9 96 553.4C96 547.4 98.4 541.6 102.6 537.4L128 512L109.4 437.5C100.5 402 96 365.5 96 328.8L96 311.1C96 274.5 100.5 238 109.4 202.5L128 128zM208 224C199.2 224 192 231.2 192 240C192 299.2 237.9 347.6 296 351.7L296 392C296 405.3 306.7 416 320 416C333.3 416 344 405.3 344 392L344 351.7C402.1 347.6 448 299.1 448 240C448 231.2 440.8 224 432 224L430 224C382.7 224 341.6 250 320 288.5C298.4 250 257.3 224 210 224L208 224z"/></svg>', discovered: false };
    elements['leaf'] = { id: 'leaf', name: 'leaf', icon: '<i class="fas fa-leaf"></i>', discovered: false };
    elements['brick'] = { id: 'brick', name: 'brick', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M64 192C64 156.7 92.7 128 128 128L512 128C547.3 128 576 156.7 576 192L576 448C576 483.3 547.3 512 512 512L128 512C92.7 512 64 483.3 64 448L64 192z"/></svg>', discovered: false };
    elements['wall'] = { id: 'wall', name: 'wall', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M224 96L224 176L416 176L416 96L224 96zM192 176L192 96L160 96C124.7 96 96 124.7 96 160L96 176L192 176zM96 208L96 304L304 304L304 208L96 208zM96 432L192 432L192 336L96 336L96 432zM96 464L96 480C96 515.3 124.7 544 160 544L304 544L304 464L96 464zM336 464L336 544L480 544C515.3 544 544 515.3 544 480L544 464L336 464zM544 432L544 336L448 336L448 432L544 432zM416 432L416 336L224 336L224 432L416 432zM544 208L336 208L336 304L544 304L544 208zM544 176L544 160C544 124.7 515.3 96 480 96L448 96L448 176L544 176z"/></svg>', discovered: false };
    elements['house'] = { id: 'house', name: 'house', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M341.8 72.6C329.5 61.2 310.5 61.2 298.3 72.6L74.3 280.6C64.7 289.6 61.5 303.5 66.3 315.7C71.1 327.9 82.8 336 96 336L112 336L112 512C112 547.3 140.7 576 176 576L464 576C499.3 576 528 547.3 528 512L528 336L544 336C557.2 336 569 327.9 573.8 315.7C578.6 303.5 575.4 289.5 565.8 280.6L341.8 72.6zM304 384L336 384C362.5 384 384 405.5 384 432L384 528L256 528L256 432C256 405.5 277.5 384 304 384z"/></svg>', discovered: false };
    elements['farm'] = { id: 'farm', name: 'farm', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M144 32C82.1 32 32 82.1 32 144L32 146.2L228 146.2L255.5 133.7C250.3 76.7 202.4 32 144 32zM112 356.5C112 348.4 113.3 340.3 115.9 332.6L155.9 212.7C158.1 206.2 160.9 200 164.3 194.2L32 194.2L32 528C32 554.5 53.5 576 80 576L164.1 576C151.4 557.9 144 535.8 144 512L144 418.2C124.6 404.5 112 382 112 356.5zM201.4 227.9L161.4 347.8C160.5 350.6 160 353.5 160 356.5C160 371.7 172.3 384 187.5 384L192 384L192 512C192 547.3 220.7 576 256 576L512 576C547.3 576 576 547.3 576 512L576 384L580.5 384C595.7 384 608 371.7 608 356.5C608 353.5 607.5 350.6 606.6 347.8L566.6 227.9C562.4 215.2 553.1 204.9 540.9 199.4L403.9 137C391.3 131.3 376.8 131.3 364.2 137L227.1 199.3C214.9 204.8 205.6 215.2 201.4 227.8zM352 400L416 400C433.7 400 448 414.3 448 432L448 528L320 528L320 432C320 414.3 334.3 400 352 400zM336 264C336 250.7 346.7 240 360 240L408 240C421.3 240 432 250.7 432 264L432 312C432 325.3 421.3 336 408 336L360 336C346.7 336 336 325.3 336 312L336 264z"/></svg>', discovered: false };
    elements['village'] = { id: 'village', name: 'village', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M256.3 112C256.3 85.5 277.8 64 304.3 64L400.3 64C426.8 64 448.3 85.5 448.3 112L448.3 160L496.3 160L496.3 88C496.3 74.7 507 64 520.3 64C533.6 64 544.3 74.7 544.3 88L544.3 160L560.3 160C586.8 160 608.3 181.5 608.3 208L608.3 528C608.3 554.5 586.8 576 560.3 576L482.5 576C486.5 560.6 484.9 543.4 475.8 527.8L354.6 320L368.3 320C377.1 320 384.3 312.8 384.3 304L384.3 272C384.3 263.2 377.1 256 368.3 256L336.3 256C330.2 256 324.9 259.4 322.2 264.5L279.6 191.5C273.6 181.3 265.5 173.5 256.3 168.2L256.3 112zM320.3 176L320.3 208C320.3 216.8 327.5 224 336.3 224L368.3 224C377.1 224 384.3 216.8 384.3 208L384.3 176C384.3 167.2 377.1 160 368.3 160L336.3 160C327.5 160 320.3 167.2 320.3 176zM480.3 272L480.3 304C480.3 312.8 487.5 320 496.3 320L528.3 320C537.1 320 544.3 312.8 544.3 304L544.3 272C544.3 263.2 537.1 256 528.3 256L496.3 256C487.5 256 480.3 263.2 480.3 272zM496.3 352C487.5 352 480.3 359.2 480.3 368L480.3 400C480.3 408.8 487.5 416 496.3 416L528.3 416C537.1 416 544.3 408.8 544.3 400L544.3 368C544.3 359.2 537.1 352 528.3 352L496.3 352zM224.3 287.3L159.2 398.9L192.3 432L240.3 384L280.7 384L224.3 287.3zM196.7 239.4C209 218.2 239.6 218.2 252 239.4L420.3 527.9C432.7 549.2 417.4 576 392.7 576L56 576C31.3 576 15.9 549.2 28.4 527.9L196.7 239.4z"/></svg>', discovered: false };
    elements['flower'] = { id: 'flower', name: 'flower', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M384 56C432.6 56 472 95.4 472 144C472 169.3 461.3 192 444.2 208C461.2 224 472 246.7 472 272C472 320.6 432.6 360 384 360C372.7 360 361.9 357.7 352 353.8L352 458.8C383.8 413.5 436.5 384 496 384L514.5 384C530.8 384 544 397.2 544 413.5C544 503.2 471.3 576 381.5 576L258.4 576C168.7 576 96 503.3 96 413.5C96 397.2 109.2 384 125.5 384L144 384C203.5 384 256.2 413.6 288 458.8L288 353.8C278.1 357.7 267.3 360 256 360C207.4 360 168 320.6 168 272C168 246.8 178.7 224 195.7 208C178.7 192 168 169.2 168 144C168 95.4 207.4 56 256 56C281.2 56 304 66.7 320 83.7C336 66.7 358.8 56 384 56zM320 160C293.5 160 272 181.5 272 208C272 234.5 293.5 256 320 256C346.5 256 368 234.5 368 208C368 181.5 346.5 160 320 160z"/></svg>', discovered: false };
    elements['wheat'] = { id: 'wheat', name: 'wheat', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M111.7 298.6C117.9 294.5 126.4 295.2 131.8 300.7L177.9 346.8L184 353.5C203.7 377.3 210.3 408.5 203.3 437.4C235 429.7 269.5 438.4 293.9 462.7L340 508.8C346.2 515 346.2 525.2 340 531.4L332.6 538.8C295.1 576.3 234.3 576.3 196.8 538.8L166.1 508.3L81.4 593C72 602.4 56.9 602.4 47.5 593C38.1 583.6 38.1 568.4 47.5 559.1L132.2 474.4L101.7 443.9C64.2 406.4 64.2 345.6 101.7 308.1L109.1 300.7L111.6 298.6zM215.7 194.6C221.9 190.5 230.4 191.2 235.8 196.7L281.9 242.8L288 249.5C307.7 273.3 314.3 304.5 307.3 333.4C339 325.7 373.5 334.4 397.9 358.7L444 404.8C450.2 411 450.2 421.2 444 427.4L436.6 434.8C399.1 472.3 338.3 472.3 300.8 434.8L205.9 339.9C168.4 302.4 168.4 241.6 205.9 204.1L213.3 196.7L215.8 194.6zM319.7 90.6C325.9 86.5 334.4 87.2 339.8 92.7L385.9 138.8L392 145.5C411.7 169.3 418.3 200.5 411.3 229.4C443 221.7 477.5 230.4 501.9 254.7L548 300.8C554.2 307 554.2 317.2 548 323.4L540.6 330.8C503.1 368.3 442.3 368.3 404.8 330.8L309.9 235.9C272.4 198.4 272.4 137.6 309.9 100.2L317.3 92.8L319.8 90.7zM579.6 48.3C582.7 48.9 585.5 50.4 587.8 52.7C590.8 55.7 592.5 59.8 592.5 64L592.5 99L592.4 103.8C590 151.4 551.9 189.5 504.3 191.9L499.5 192L464.5 192C460.3 192 456.2 190.3 453.2 187.3C450.2 184.3 448.5 180.2 448.5 176L448.5 141C448.5 89.6 490.1 48 541.5 48L576.5 48L579.6 48.3z"/></svg>', discovered: false };
    elements['corn'] = { id: 'corn', name: 'corn', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M576 104C576 119 567.7 132.1 555.5 138.9C563.2 146.2 568 156.5 568 168C568 186 556.2 201.2 539.8 206.2C542.5 211.6 544 217.6 544 224C544 242 532.2 257.2 515.8 262.2C518.5 267.6 520 273.6 520 280C520 302.1 502.1 320 480 320C478.9 320 477.7 320 476.6 319.9C478.8 324.8 480 330.3 480 336C480 349.6 473.2 361.7 462.7 368.9C415 339.2 359.1 327.8 305.2 334.7C312.1 280.8 300.7 224.9 271 177.2C278.2 166.8 290.3 159.9 303.9 159.9C309.6 159.9 315.1 161.1 320 163.3C319.9 162.2 319.9 161.1 319.9 159.9C319.9 137.8 337.8 119.9 359.9 119.9C366.3 119.9 372.3 121.4 377.7 124.1C382.7 107.8 397.9 95.9 415.9 95.9C422.3 95.9 428.3 97.4 433.7 100.1C438.7 83.8 453.9 71.9 471.9 71.9C483.3 71.9 493.7 76.7 501 84.4C507.8 72.2 520.9 63.9 535.9 63.9C558 63.9 575.9 81.8 575.9 103.9zM201.7 162C202.9 155.7 210.6 153.3 214.9 158.1C260.3 208.6 284.4 272.1 271.8 341.5C233.1 352.2 196.6 372.7 166.3 403.1L88.9 480.5C54.7 442.8 55.8 384.5 92.1 348.1L156.1 284.1C174.4 265.8 186.7 242.4 191.4 217L201.7 162zM156.1 547.9L111.4 503.2L188.9 425.7C217.5 397.1 252.4 378.6 289 370.1C361.2 353.5 428.8 377.5 481.8 425.1C486.6 429.4 484.2 437.2 477.9 438.3L423 448.5C397.6 453.2 374.2 465.5 355.9 483.8L291.9 547.8C254.4 585.3 193.6 585.3 156.1 547.8z"/></svg>', discovered: false };
    elements['vegetable'] = { id: 'vegetable', name: 'vegetable', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M129.9 92.4C124 98.3 119 104.8 114.9 111.7C102 133.6 82.6 153.9 62.9 169.9C60.6 171.7 58.5 173.7 56.4 175.8C30.6 201.6 25.3 240.2 40.5 271.2C46.2 282.9 51.5 295.3 51.5 308.3L51.5 344C51.5 358.7 57.3 372.8 67.8 383.2L94.1 409.5C104.5 419.9 110.4 434 110.4 448.7L110.4 461.6C110.4 464.5 110.6 467.4 111.1 470.3L118.7 462.7C124.7 456.7 128.1 448.6 128.1 440.1L128.1 394.4C128.1 368.9 138.2 344.5 156.2 326.5L166.7 316C172.7 310 176.1 301.9 176.1 293.4L176.1 250.4C176.1 224.9 186.2 200.5 204.2 182.5L233.3 153.4C238.3 148.4 242.1 140.5 247 126.4C251.4 113.5 257.8 101.6 265.9 90.9C227.9 54.4 167.5 54.9 130.1 92.4zM599.5 293.9C596.4 264.8 597.2 232.4 604.5 204C606.8 195.1 608 185.7 608 176C608 114.1 557.9 64 496 64C486.3 64 477 65.2 468 67.5C439.6 74.8 407.2 75.6 378.1 72.5C374.8 72.2 371.4 72 368 72C325.9 72 290.1 99.1 277.2 136.9C272.3 151.2 266.6 165.5 255.9 176.2L226.8 205.3C214.8 217.3 208.1 233.6 208.1 250.6L208.1 293.6C208.1 310.6 201.4 326.9 189.4 338.9L178.9 349.4C166.9 361.4 160.2 377.7 160.2 394.7L160.2 440.4C160.2 457.4 153.5 473.7 141.5 485.7L105.4 521.4C92.9 533.9 92.9 554.2 105.4 566.7C117.9 579.2 138.2 579.2 150.7 566.7L186.6 530.8C198.6 518.8 214.9 512.1 231.9 512.1L277.6 512.1C294.6 512.1 310.9 505.4 322.9 493.4L333.4 482.9C345.4 470.9 361.7 464.2 378.7 464.2L421.7 464.2C438.7 464.2 455 457.5 467 445.5L496.1 416.4C506.8 405.7 521.1 400 535.4 395.1C573.1 382.2 600.3 346.4 600.3 304.3C600.3 300.9 600.1 297.5 599.8 294.2zM507.3 164.7C513.5 170.9 513.5 181.1 507.3 187.3L422.6 272L480 272C488.8 272 496 279.2 496 288C496 296.8 488.8 304 480 304L390.6 304C349.2 345.4 313.4 381.2 283.3 411.3C277.1 417.5 266.9 417.5 260.7 411.3C254.5 405.1 254.5 394.9 260.7 388.7L304 345.4L304 256C304 247.2 311.2 240 320 240C328.8 240 336 247.2 336 256L336 313.4C347.9 301.5 397.5 251.9 484.7 164.7C490.9 158.5 501.1 158.5 507.3 164.7z"/></svg>', discovered: false };
    elements['fruit'] = { id: 'fruit', name: 'fruit', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M2.7 117.1C13.8 105.6 59 64 128 64C194.9 64 239.4 103.1 252.2 116L306 90.7C343.3 73.1 384 64 425.2 64L616 64C629.3 64 640 74.7 640 88C640 101.3 629.3 112 616 112L425.2 112C391 112 357.3 119.5 326.4 134.1L191.9 197.4C189.1 283.3 118.6 352 32 352L16 352C7.2 352 0 344.8 0 336L0 320C0 258.6 34.5 205.4 85.2 178.5C40.4 166.8 11.3 139.8 2.7 130.9C.9 129 0 126.6 0 124C0 121.4 .9 119 2.7 117.1zM480 384C480 490 415.5 576 336 576C256.5 576 192 490 192 384C192 278 256.5 192 336 192C415.5 192 480 278 480 384zM465.7 535.8C494.9 495.3 512 441.8 512 384C512 324.7 494 269.8 463.4 229C452.9 215 440.7 202.5 427.2 192.1C475.4 193.7 528.5 217.9 571.4 262.4C646.4 340.2 661.6 450.5 605.3 508.8C571.2 544.2 518.5 552.3 465.7 535.8z"/></svg>', discovered: false };
    elements['family'] = { id: 'family', name: 'family', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M192.1 64C227.4 64 256.1 92.7 256.1 128C256.1 163.3 227.4 192 192.1 192C156.8 192 128.1 163.3 128.1 128C128.1 92.7 156.8 64 192.1 64zM160.1 224L224.1 224C224.5 224 225 224 225.4 224C224.5 229.2 224.1 234.5 224.1 240C224.1 261.6 231.2 281.6 243.3 297.6C212.2 321 192.1 358.1 192.1 400L192.1 416C192.1 446.5 204.3 474.2 224.1 494.4L224.1 544C224.1 553.6 225.8 562.8 228.9 571.3C222.6 574.3 215.6 576 208.1 576L176.1 576C149.6 576 128.1 554.5 128.1 528L128.1 407.4C109 396.3 96.1 375.7 96.1 352L96.1 288C96.1 252.7 124.8 224 160.1 224zM432.1 576C424.7 576 417.6 574.3 411.3 571.3C414.4 562.8 416.1 553.6 416.1 544L416.1 494.4C435.9 474.2 448.1 446.6 448.1 416L448.1 400C448.1 358.1 428 321 396.9 297.6C409 281.6 416.1 261.6 416.1 240C416.1 236.8 415.9 233.6 415.6 230.5C425.7 226.3 436.7 224 448.1 224C486 224 519.3 249.1 529.7 285.5L564.5 407.2C570.3 427.6 555 448 533.7 448L512.1 448L512.1 528C512.1 554.5 490.6 576 464.1 576L432.1 576zM448.1 64C483.4 64 512.1 92.7 512.1 128C512.1 163.3 483.4 192 448.1 192C412.8 192 384.1 163.3 384.1 128C384.1 92.7 412.8 64 448.1 64zM320.1 192C346.6 192 368.1 213.5 368.1 240C368.1 266.5 346.6 288 320.1 288C293.6 288 272.1 266.5 272.1 240C272.1 213.5 293.6 192 320.1 192zM320.1 320C364.3 320 400.1 355.8 400.1 400L400.1 416C400.1 439.7 387.2 460.4 368.1 471.4L368.1 544C368.1 561.7 353.8 576 336.1 576L304.1 576C286.4 576 272.1 561.7 272.1 544L272.1 471.4C253 460.3 240.1 439.7 240.1 416L240.1 400C240.1 355.8 275.9 320 320.1 320z"/></svg>', discovered: false };
    elements['city'] = { id: 'city', name: 'city', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M352 64C316.7 64 288 92.7 288 128L288 160L240 160L240 88C240 74.7 229.3 64 216 64C202.7 64 192 74.7 192 88L192 160L128 160L128 88C128 74.7 117.3 64 104 64C90.7 64 80 74.7 80 88L80 162C52.4 169.1 32 194.2 32 224L32 512C32 547.3 60.7 576 96 576L544 576C579.3 576 608 547.3 608 512L608 320C608 284.7 579.3 256 544 256L480 256L480 128C480 92.7 451.3 64 416 64L352 64zM416 176L416 208C416 216.8 408.8 224 400 224L368 224C359.2 224 352 216.8 352 208L352 176C352 167.2 359.2 160 368 160L400 160C408.8 160 416 167.2 416 176zM400 256C408.8 256 416 263.2 416 272L416 304C416 312.8 408.8 320 400 320L368 320C359.2 320 352 312.8 352 304L352 272C352 263.2 359.2 256 368 256L400 256zM416 368L416 400C416 408.8 408.8 416 400 416L368 416C359.2 416 352 408.8 352 400L352 368C352 359.2 359.2 352 368 352L400 352C408.8 352 416 359.2 416 368zM528 352C536.8 352 544 359.2 544 368L544 400C544 408.8 536.8 416 528 416L496 416C487.2 416 480 408.8 480 400L480 368C480 359.2 487.2 352 496 352L528 352zM288 368L288 400C288 408.8 280.8 416 272 416L240 416C231.2 416 224 408.8 224 400L224 368C224 359.2 231.2 352 240 352L272 352C280.8 352 288 359.2 288 368zM272 256C280.8 256 288 263.2 288 272L288 304C288 312.8 280.8 320 272 320L240 320C231.2 320 224 312.8 224 304L224 272C224 263.2 231.2 256 240 256L272 256zM160 368L160 400C160 408.8 152.8 416 144 416L112 416C103.2 416 96 408.8 96 400L96 368C96 359.2 103.2 352 112 352L144 352C152.8 352 160 359.2 160 368zM144 256C152.8 256 160 263.2 160 272L160 304C160 312.8 152.8 320 144 320L112 320C103.2 320 96 312.8 96 304L96 272C96 263.2 103.2 256 112 256L144 256z"/></svg>', discovered: false };
    elements['apartment'] = { id: 'apartment', name: 'apartment', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M288 112C288 85.5 309.5 64 336 64L432 64C458.5 64 480 85.5 480 112L480 160L528 160L528 88C528 74.7 538.7 64 552 64C565.3 64 576 74.7 576 88L576 160L592 160C618.5 160 640 181.5 640 208L640 528C640 554.5 618.5 576 592 576L336 576C309.5 576 288 554.5 288 528L288 112zM352 176L352 208C352 216.8 359.2 224 368 224L400 224C408.8 224 416 216.8 416 208L416 176C416 167.2 408.8 160 400 160L368 160C359.2 160 352 167.2 352 176zM368 256C359.2 256 352 263.2 352 272L352 304C352 312.8 359.2 320 368 320L400 320C408.8 320 416 312.8 416 304L416 272C416 263.2 408.8 256 400 256L368 256zM352 368L352 400C352 408.8 359.2 416 368 416L400 416C408.8 416 416 408.8 416 400L416 368C416 359.2 408.8 352 400 352L368 352C359.2 352 352 359.2 352 368zM528 256C519.2 256 512 263.2 512 272L512 304C512 312.8 519.2 320 528 320L560 320C568.8 320 576 312.8 576 304L576 272C576 263.2 568.8 256 560 256L528 256zM512 368L512 400C512 408.8 519.2 416 528 416L560 416C568.8 416 576 408.8 576 400L576 368C576 359.2 568.8 352 560 352L528 352C519.2 352 512 359.2 512 368zM96 544L96 384L80 384C35.8 384 0 348.2 0 304C0 277.3 13.1 253.7 33.2 239.1C32.4 234.2 32 229.1 32 224C32 171 75 128 128 128C181 128 224 171 224 224L224 320C224 355.3 195.3 384 160 384L160 544C160 561.7 145.7 576 128 576C110.3 576 96 561.7 96 544z"/></svg>', discovered: false };
    elements['broccoli'] = { id: 'broccoli', name: 'broccoli', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M64 320C64 373 107 416 160 416L480 416C533 416 576 373 576 320C576 274.5 544.4 236.4 501.9 226.5C508.3 216.5 512 204.7 512 192C512 156.7 483.3 128 448 128C435.3 128 423.4 131.7 413.5 138.1C403.6 95.6 365.5 64 320 64C274.5 64 236.4 95.6 226.5 138.1C216.5 131.7 204.7 128 192 128C156.7 128 128 156.7 128 192C128 204.7 131.7 216.6 138.1 226.5C95.6 236.4 64 274.5 64 320zM256.2 554.3C261.2 567.1 273.3 576 287.1 576L353 576C366.8 576 378.9 567.1 383.9 554.3C398 518 414.9 487.3 429.5 464L336 464L327.2 481.7C324.3 487.6 315.8 487.6 312.9 481.7L304.1 464L210.6 464C225.3 487.2 242.2 518 256.2 554.3z"/></svg>', discovered: false };
    elements['wilt'] = { id: 'wilt', name: 'wilt', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M408 32C474.3 32 528 85.7 528 152L528 158.2C557.3 170.4 576 199.5 576 235.1C576 263 550.7 309.9 510 346.8C506.2 350.3 501.2 352.1 496 352.1C490.8 352.1 485.8 350.3 482 346.8C441.3 310 416 263.1 416 235.1C416 199.5 434.7 170.4 464 158.2L464 152C464 121.1 438.9 96 408 96C377.1 96 352 121.1 352 152L352 576C352 593.7 337.7 608 320 608C302.3 608 288 593.7 288 576L288 280C288 249.1 262.9 224 232 224C201.1 224 176 249.1 176 280L176 318.2C205.3 330.4 224 359.5 224 395.1C224 423 198.7 469.9 158 506.8C154.2 510.3 149.2 512.1 144 512.1C138.8 512.1 133.8 510.3 130 506.8C89.3 469.9 64 423 64 395.1C64 359.4 82.7 330.4 112 318.2L112 280C112 213.7 165.7 160 232 160C252.2 160 271.3 165 288 173.8L288 152C288 85.7 341.7 32 408 32z"/></svg>', discovered: false };
    elements['salad'] = { id: 'salad', name: 'salad', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M336.9 304C336.3 298.7 336 293.4 336 288C336 208.5 400.5 144 480 144C482.6 144 485.2 144.1 487.7 144.2C470.1 124.4 444.5 112 416 112C404.6 112 393.7 114 383.6 117.6C363.9 85.4 328.5 64 288 64C247.5 64 212.1 85.5 192.4 117.6C182.3 114 171.4 112 160 112C107 112 64 155 64 208C64 261 107 304 160 304L211.7 304L145.8 238.1C138 230.3 138 217.6 145.8 209.8C153.6 202 166.3 202 174.1 209.8L268 303.7L268 176C268 165 277 156 288 156C299 156 308 165 308 176L308 304L336.9 304zM91.4 352C76.3 352 64 364.3 64 379.4C64 449.9 108.4 510.1 170.7 533.5L172.5 547.9C174.5 563.9 188.1 575.9 204.3 575.9L435.8 575.9C451.9 575.9 465.6 563.9 467.6 547.9L469.4 533.5C531.7 510.1 576.1 449.9 576.1 379.4C576.1 364.3 563.8 352 548.7 352L91.4 352zM576 288C576 235 533 192 480 192C427 192 384 235 384 288C384 293.5 384.5 298.8 385.3 304L574.6 304C575.5 298.8 575.9 293.5 575.9 288z"/></svg>', discovered: false };

    // Add recipes
    _addRecipe('water', 'water', 'lake');
    _addRecipe('lake', 'lake', 'ocean');
    _addRecipe('earth', 'earth', 'land');
    _addRecipe('land', 'ocean', 'planet');
    _addRecipe('air', 'air', 'pressure');
    _addRecipe('fire', 'fire', 'heat');
    _addRecipe('earth', 'pressure', 'stone');
    _addRecipe('stone', 'stone', 'mountain');
    _addRecipe('mountain', 'stone', 'hill');
    _addRecipe('mountain', 'mountain', 'range');
    _addRecipe('pressure', 'air', 'wind');
    _addRecipe('air', 'wind', 'cold');
    _addRecipe('wind', 'wind', 'tornado');
    _addRecipe('heat', 'planet', 'sun');
    _addRecipe('fire', 'planet', 'sun');
    _addRecipe('sun', 'mountain', 'mountain-sun');
    _addRecipe('cold', 'planet', 'moon');
    _addRecipe('pressure', 'stone', 'metal');
    _addRecipe('fire', 'mountain', 'volcano');
    _addRecipe('heat', 'mountain', 'volcano');
    _addRecipe('fire', 'pressure', 'burst');
    _addRecipe('fire', 'water', 'steam');
    _addRecipe('heat', 'water', 'steam');
    _addRecipe('air', 'fire', 'smoke');
    _addRecipe('steam', 'wind', 'cloud');
    _addRecipe('cloud', 'energy', 'lightning');
    _addRecipe('cloud', 'water', 'rain');
    _addRecipe('water', 'cold', 'ice');
    _addRecipe('cold', 'steam', 'snowflake');
    _addRecipe('snowflake', 'cloud', 'snow');
    _addRecipe('ice', 'cloud', 'hail');
    _addRecipe('burst', 'star', 'comet');
    _addRecipe('energy', 'planet', 'comet');
    _addRecipe('water', 'glass', 'glass-water');
    _addRecipe('star', 'star', 'magic');
    _addRecipe('magic', 'glass-water', 'magic-potion');
    _addRecipe('metal', 'energy', 'electricity');
    _addRecipe('metal', 'water', 'tap');
    _addRecipe('metal', 'lake', 'ship');
    _addRecipe('metal', 'ocean', 'ship');
    _addRecipe('tornado', 'ocean', 'tsunami');
    _addRecipe('glass', 'light', 'lightbulb');
    _addRecipe('glass', 'energy', 'lightbulb');
    _addRecipe('glass', 'electricity', 'lightbulb');
    _addRecipe('electricity', 'cloud', 'lightning');
    _addRecipe('air', 'metal', 'airplane');
    _addRecipe('metal', 'planet', 'magnet');
    _addRecipe('metal', 'stone', 'blade');
    _addRecipe('ice', 'blade', 'icicles');
    _addRecipe('wind', 'stone', 'sand');
    _addRecipe('sand', 'fire', 'glass');
    _addRecipe('sand', 'heat', 'glass');
    _addRecipe('glass', 'glass', 'glasses');
    _addRecipe('glass', 'sand', 'time');
    _addRecipe('heat', 'heat', 'light');
    _addRecipe('light', 'planet', 'star');
    _addRecipe('moon', 'star', 'night');
    _addRecipe('light', 'pressure', 'energy');
    _addRecipe('energy', 'star', 'shooting-star');
    _addRecipe('rain', 'sun', 'rainbow');
    _addRecipe('ice', 'glass-water', 'ice-water');
    _addRecipe('ocean', 'star', 'starfish');
    _addRecipe('planet', 'planet', 'universe');
    _addRecipe('hill', 'snow', 'avalanche');
    _addRecipe('sun', 'glasses', 'sunglasses');
    _addRecipe('airplane', 'universe', 'ufo');
    _addRecipe('energy', 'ocean', 'life');
    _addRecipe('sand', 'sand', 'dessert');
    _addRecipe('dessert', 'ocean', 'island');
    _addRecipe('life', 'planet', 'human');
    _addRecipe('life', 'ufo', 'alien');
    _addRecipe('blade', 'blade', 'scissors');
    _addRecipe('life', 'universe', 'civilization');
    _addRecipe('life', 'earth', 'plant');
    _addRecipe('plant', 'water', 'tree');
    _addRecipe('tree', 'tree', 'forest');
    _addRecipe('plant', 'wind', 'seed');
    _addRecipe('tree', 'wind', 'leaf');
    _addRecipe('forest', 'wind', 'leaf');
    _addRecipe('stone', 'earth', 'brick');
    _addRecipe('brick', 'brick', 'wall');
    _addRecipe('wall', 'wall', 'house');
    _addRecipe('house', 'land', 'farm');
    _addRecipe('house', 'mountain', 'village');
    _addRecipe('plant', 'magic', 'flower');
    _addRecipe('plant', 'farm', 'wheat');
    _addRecipe('vegetable', 'sun', 'corn');
    _addRecipe('leaf', 'plant', 'vegetable');
    _addRecipe('plant', 'rain', 'tree');
    _addRecipe('tree', 'flower', 'fruit');
    _addRecipe('human', 'human', 'family');
    _addRecipe('vegetable', 'vegetable', 'salad');
    _addRecipe('plant', 'sun', 'wilt');
    _addRecipe('plant', 'heat', 'wilt');
    _addRecipe('flower', 'vegetable', 'broccoli');
    _addRecipe('house', 'house', 'city');
    _addRecipe('house', 'tree', 'apartment');

    // Final items (cannot be used to craft further, hidden from sidebar)
    finalItems.add('mountain-sun');
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

    renderSidebar();
    updateAchievementCount();
    bindEvents();
}

function _addRecipe(a, b, result) {
    const key = [a, b].sort().join(',');
    recipes[key] = result;
    if (!resultToSources[result]) resultToSources[result] = [];
    resultToSources[result].push([a, b]);
}

function renderSidebar() {
    const sidebarSearch = document.getElementById('sidebar-search');
    const query = sidebarSearch ? sidebarSearch.value.trim().toLowerCase() : '';
    sidebarElements.innerHTML = '';
    let sorted = Array.from(unlocked)
        .filter(id => godMode || !finalItems.has(id))
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
            div.className = 'sidebar-element' + (godMode && finalItems.has(id) ? ' admin-final-item' : '');
            div.dataset.id = id;
            div.draggable = false;
            div.innerHTML = `<div class="el-icon">${el.icon}</div><div class="el-name">${el.name}</div>`;
            itemsDiv.appendChild(div);
        });

        groupDiv.appendChild(itemsDiv);
        sidebarElements.appendChild(groupDiv);
    });
}

function renderCanvasItem(item, animate = false) {
    const el = elements[item.elementId];
    const div = document.createElement('div');
    div.className = 'canvas-element';
    div.dataset.uid = item.uid;
    div.style.left = item.x + 'px';
    div.style.top = item.y + 'px';
    let html = `<div class="el-icon">${el.icon}</div>`;
    if (finalItems.has(item.elementId)) {
        html += `<div class="ripple"></div><div class="ripple" style="animation-delay:-0.8s"></div>`;
    }
    div.innerHTML = html;
    canvas.appendChild(div);
    if (animate) {
        div.classList.add('pop-in');
        div.addEventListener('animationend', () => {
            div.classList.remove('pop-in');
        }, { once: true });
    }
    return div;
}

function createCanvasElement(elementId, x, y, animate = false, fromEncyclopedia = false) {
    const item = { uid: nextUid++, elementId, x, y, fromEncyclopedia };
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

            const encItems = canvasItems.filter(i => i.fromEncyclopedia);
            let index = 0;
            let x, y;
            while (true) {
                const col = index % cols;
                const row = Math.floor(index / cols);
                const gx = startX + col * gapX;
                const gy = startY + row * gapY;
                const occupied = encItems.some(item => {
                    const dx = item.x - gx;
                    const dy = item.y - gy;
                    return Math.abs(dx) < gapX / 2 && Math.abs(dy) < gapY / 2;
                });
                if (!occupied) {
                    x = gx;
                    y = gy;
                    break;
                }
                index++;
            }

            const newItem = createCanvasElement(id, x, y);
            newItem.fromEncyclopedia = true;
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
    dragSource = 'sidebar';
    dragItem = { elementId, uid: nextUid++ };

    dragClone = document.createElement('div');
    dragClone.className = 'drag-clone';
    dragClone.style.transition = 'transform 0.1s ease';
    dragClone.style.transform = 'scale(1.1)';
    const elData = elements[elementId];
    dragClone.innerHTML = `<div class="drag-clone-icon">${elData.icon}</div>`;
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
            const newItem = createCanvasElement(dragItem.elementId, x, y);
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
            row.innerHTML = `<div class="el-icon">${el.icon}</div><div class="el-name">${el.name}</div>`;
            row.addEventListener('click', () => showItemDetail(id));
            itemsDiv.appendChild(row);
        });

        groupDiv.appendChild(itemsDiv);
        itemsList.appendChild(groupDiv);
    });
}

function isPlaceholderElement(id) {
    return elements[id] && elements[id].icon.includes('fa-question');
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
            row.innerHTML = `<div class="el-icon">${el.icon}</div><div class="el-name">${el.name}</div>`;
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
                <div class="recipe-icon">${elements[a].icon}</div>
                <div class="recipe-name">${elements[a].name}</div>
            </div>
            <div class="recipe-plus">+</div>
            <div class="recipe-ingredient">
                <div class="recipe-icon">${elements[b].icon}</div>
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
        document.getElementById('final-detail-icon').innerHTML = el.icon;
        document.getElementById('final-detail-name').textContent = el.name;
        renderRecipes('final-detail-recipes', sources);
        detail.classList.remove('hidden');
    } else {
        const detail = document.getElementById('item-detail');
        document.getElementById('detail-icon').innerHTML = el.icon;
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
    document.getElementById('discovery-element').innerHTML = el.icon;
    document.getElementById('discovery-name').textContent = el.name;

    const recipeContainer = document.getElementById('discovery-recipe');
    if (recipeA && recipeB && recipeContainer) {
        recipeContainer.innerHTML = `
            <div class="discovery-recipe-ingredient">
                <div class="discovery-recipe-icon">${elements[recipeA].icon}</div>
                <div class="discovery-recipe-name">${elements[recipeA].name}</div>
            </div>
            <div class="discovery-recipe-plus">+</div>
            <div class="discovery-recipe-ingredient">
                <div class="discovery-recipe-icon">${elements[recipeB].icon}</div>
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
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(input)).then(hashBuf => {
        const hashArr = Array.from(new Uint8Array(hashBuf));
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
