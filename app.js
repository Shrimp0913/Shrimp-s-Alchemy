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

const ADMIN_PASSWORD = '@1357642';
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
    elements['metal'] = { id: 'metal', name: 'metal', icon: '<i class="far fa-magnet"></i>', discovered: false };
    elements['volcano'] = { id: 'volcano', name: 'volcano', icon: '<i class="fas fa-volcano"></i>', discovered: false };
    elements['burst'] = { id: 'burst', name: 'burst', icon: '<i class="fas fa-burst"></i>', discovered: false };
    elements['glass'] = { id: 'glass', name: 'glass', icon: '<i class="fas fa-window-maximize"></i>', discovered: false };
    elements['glasses'] = { id: 'glasses', name: 'glasses', icon: '<i class="fas fa-glasses"></i>', discovered: false };
    elements['time'] = { id: 'time', name: 'hourglass', icon: '<i class="fas fa-hourglass-half"></i>', discovered: false };
    elements['steam'] = { id: 'steam', name: 'steam', icon: '<i class="fas fa-smog"></i>', discovered: false };
    elements['cloud'] = { id: 'cloud', name: 'cloud', icon: '<i class="fas fa-cloud"></i>', discovered: false };
    elements['sand'] = { id: 'sand', name: 'sand', icon: '<i class="fas fa-mound icon-outline"></i>', discovered: false };
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
    elements['dessert'] = { id: 'dessert', name: 'dessert', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M336 64C336 55.2 328.8 48 320 48C311.2 48 304 55.2 304 64L304 192C304 200.8 311.2 208 320 208C328.8 208 336 200.8 336 192L336 64zM416 416L224 416L224 352L416 352L416 416zM192 352L192 416L112 416C85.5 416 64 437.5 64 464L64 528C64 554.5 85.5 576 112 576L528 576C554.5 576 576 554.5 576 528L576 464C576 437.5 554.5 416 528 416L448 416L448 352C448 334.3 433.7 320 416 320L224 320C206.3 320 192 334.3 192 352zM416 448L528 448C536.8 448 544 455.2 544 464L544 528C544 536.8 536.8 544 528 544L112 544C103.2 544 96 536.8 96 528L96 464C96 455.2 103.2 448 112 448L416 448zM50.7 183.1C45.8 190.5 47.8 200.4 55.1 205.3L151.1 269.3C158.5 274.2 168.4 272.2 173.3 264.9C178.2 257.6 176.2 247.6 168.9 242.7L72.9 178.7C65.5 173.8 55.6 175.8 50.7 183.1zM567.1 178.7L471.1 242.7C463.7 247.6 461.8 257.5 466.7 264.9C471.6 272.3 481.5 274.2 488.9 269.3L584.9 205.3C592.3 200.4 594.2 190.5 589.3 183.1C584.4 175.7 574.5 173.8 567.1 178.7z"/></svg>', discovered: false };
    elements['island'] = { id: 'island', name: 'island', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M190.5 0c58.3 0 94.9 25.5 113.4 53.2 19.9-12.6 46.5-21.2 80.3-21.2 77.4 0 116.6 44.8 125.8 80.2 2.2 8.6-5 15.8-13.8 15.8l-44.7 0c-2.1 0-4.2-.8-5.7-2.3l-24-24c-3.1-3.1-8.2-3.1-11.3 0l-24 24c-1.5 1.5-3.5 2.3-5.7 2.3l-61.3 0c3.5 15.4 7.2 35.7 9.5 59.7 4.4 45.4 3.6 104.4-14 167.2 57.8 12.4 101.1 63.7 101.1 125.2 0 17.7-14.3 32-32 32l-320 0-3.3-.2c-16.1-1.6-28.7-15.3-28.7-31.8 0-70.7 57.3-128 128-128L266 352c18.5-59.2 19.6-115.9 15.4-159.7-2.4-24.5-6.4-44.8-9.8-58.9L159.4 245.6c-6.2 6.2-16.5 6.2-20.9-1.4-18.5-31.6-22.5-91 32.2-145.7 1.4-1.4 2.8-2.7 4.2-4-.3-.2-.7-.5-1-.8l-24-24c-3.1-3.1-8.2-3.1-11.3 0l-24 24c-1.5 1.5-3.5 2.3-5.7 2.3L78.5 96C69.7 96 62.4 88.7 64.7 80.2 73.9 44.8 113.1 0 190.5 0zM160.3 400c-38.7 0-71 27.5-78.4 64l284.8 0c-7.4-36.5-39.7-64-78.4-64l-128 0z"/></svg>', discovered: false };
    elements['human'] = { id: 'human', name: 'human', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M376 88C376 57.1 350.9 32 320 32C289.1 32 264 57.1 264 88C264 118.9 289.1 144 320 144C350.9 144 376 118.9 376 88zM400 300.7L446.3 363.1C456.8 377.3 476.9 380.3 491.1 369.7C505.3 359.1 508.3 339.1 497.7 324.9L427.2 229.9C402 196 362.3 176 320 176C277.7 176 238 196 212.8 229.9L142.3 324.9C131.8 339.1 134.7 359.1 148.9 369.7C163.1 380.3 183.1 377.3 193.7 363.1L240 300.7L240 576C240 593.7 254.3 608 272 608C289.7 608 304 593.7 304 576L304 416C304 407.2 311.2 400 320 400C328.8 400 336 407.2 336 416L336 576C336 593.7 350.3 608 368 608C385.7 608 400 593.7 400 576L400 300.7z"/></svg>', discovered: false };
    elements['alien'] = { id: 'alien', name: 'alien', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M320 64C196.3 64 96 164.3 96 288C96 423.3 244.8 535.7 290.7 567.2C299.3 573.1 309.5 576 320 576C330.5 576 340.7 573.1 349.3 567.2C395.2 535.7 544 423.3 544 288C544 164.3 443.7 64 320 64zM352 370.3C352 324.9 388.8 288 434.3 288L466.3 288C473.9 288 480 294.1 480 301.7C480 347.1 443.2 384 397.7 384L365.7 384C358.1 384 352 377.9 352 370.3zM205.7 288C251.1 288 288 324.8 288 370.3C288 377.9 281.9 384 274.3 384L242.3 384C196.9 384 160 347.2 160 301.7C160 294.1 166.1 288 173.7 288L205.7 288z"/></svg>', discovered: false };
    elements['scissors'] = { id: 'scissors', name: 'scissors', icon: '<i class="fas fa-scissors"></i>', discovered: false };
    elements['civilization'] = { id: 'civilization', name: 'civilization', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="display:block;width:1.2em;height:1.2em;"><path fill="currentColor" d="M64 96L576 96L576 160L64 160L64 96zM64 480L96 480L96 208L544 208L544 480L576 480L576 544L416 544L416 416C416 363 373 320 320 320C267 320 224 363 224 416L224 544L64 544L64 480z"/></svg>', discovered: false };

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

        if (e.clientX >= sidebarRect.left && e.clientX <= sidebarRect.right &&
            e.clientY >= sidebarRect.top && e.clientY <= sidebarRect.bottom) {
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
    if (adminPasswordInput.value === ADMIN_PASSWORD) {
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
