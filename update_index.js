const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf-8');

// 1. Remove sub captions of the menu items
// Match <p> tags inside <div class="menu-info">
html = html.replace(/(<div class="menu-info">\s*<h4>.*?<\/h4>)\s*<p>.*?<\/p>/gs, '$1');

// 2. Change Egg Dosa and Double Egg Dosa from green veg symbol to red non-veg
// Let's find "Egg Dosa" card
html = html.replace(/(<h4>Egg Dosa<\/h4>[\s\S]*?)<span class="menu-tag veg">🟢 Veg<\/span>/g, '$1<span class="menu-tag">🔴 Non-Veg</span>');
html = html.replace(/(<h4>Double Egg Dosa<\/h4>[\s\S]*?)<span class="menu-tag veg">🟢 Veg<\/span>/g, '$1<span class="menu-tag">🔴 Non-Veg</span>');

// 3. Remove 🌿 icon and add logo image
// In navbar
html = html.replace(/<span class="logo-icon">🌿<\/span>/g, '<img src="images/logo.png" alt="Viyala\'s Logo" class="logo-image" />');
// In about section
html = html.replace(/<div class="about-leaf">🌿<\/div>/g, '');

// 4. Remove menu-emoji blocks completely
html = html.replace(/\s*<span class="menu-emoji">.*?<\/span>\s*/gs, '\n              ');

// Also remove emojis from Tabs just in case
html = html.replace(/<button class="tab-btn active" data-tab="tiffins">🍽️ Tiffins<\/button>/g, '<button class="tab-btn active" data-tab="tiffins">Tiffins</button>');
html = html.replace(/<button class="tab-btn" data-tab="badam">🥛 Badam &amp; Drinks<\/button>/g, '<button class="tab-btn" data-tab="badam">Badam &amp; Drinks</button>');
html = html.replace(/<button class="tab-btn" data-tab="extras">☕ Tea Coffee &amp; Milk items<\/button>/g, '<button class="tab-btn" data-tab="extras">Tea Coffee &amp; Milk items</button>');

fs.writeFileSync(indexPath, html);
console.log('Index.html updated successfully.');
