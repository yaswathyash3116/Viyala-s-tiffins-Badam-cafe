const fs = require('fs');
const path = require('path');

// 1. Update index.html
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Add "Add to cart" buttons inside .menu-card-bottom if not already added
if (!html.includes('add-to-cart-btn')) {
    html = html.replace(/<div class="menu-card-bottom">([\s\S]*?)<\/div>/g, (match, p1) => {
        return `<div class="menu-card-bottom">${p1}\n              <button class="add-to-cart-btn">Add +</button>\n            </div>`;
    });
}

// Update the Top "Order Now" button to open Cart
html = html.replace(/<a href="#menu" class="btn-order">Order Now<\/a>/, '<button class="btn-order" id="openCartBtn">Cart (<span id="cartCount">0</span>)</button>');

// Add Modal HTML before </body>
const modalHtml = `
  <!-- ===== CART MODAL ===== -->
  <div class="cart-modal-overlay" id="cartModal">
    <div class="cart-modal-content">
      <div class="cart-header">
        <h2>Your Order</h2>
        <button id="closeCartBtn">&times;</button>
      </div>
      <div class="cart-items" id="cartItemsContainer">
        <p class="empty-cart">Your cart is empty.</p>
      </div>
      <div class="cart-footer">
        <div class="cart-total">Total: ₹<span id="cartTotalPrice">0</span></div>
        <input type="text" id="customerName" placeholder="Your Name" required />
        <input type="tel" id="customerPhone" placeholder="Your Phone Number" required />
        <button id="checkoutBtn" class="btn-primary" style="width: 100%; margin-top: 15px;">Checkout &amp; Send to WhatsApp</button>
      </div>
    </div>
  </div>\n</body>`;

if (!html.includes('cart-modal-overlay')) {
    html = html.replace('</body>', modalHtml);
}

fs.writeFileSync(path.join(__dirname, 'index.html'), html);

// 2. Update style.css
let css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
const cartCss = `
/* ===== CART STYLES ===== */
.add-to-cart-btn {
  background: var(--saffron);
  border: none;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-weight: bold;
  cursor: pointer;
  color: var(--dark);
  transition: var(--transition);
}
.add-to-cart-btn:hover {
  background: var(--saffron-light);
  transform: translateY(-2px);
}
.cart-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.8);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; opacity: 0; pointer-events: none; transition: var(--transition);
}
.cart-modal-overlay.active { opacity: 1; pointer-events: all; }
.cart-modal-content {
  background: var(--dark-card); width: 90%; max-width: 450px;
  border-radius: var(--radius); padding: 25px;
  border: 1px solid rgba(244,162,0,0.3); display: flex; flex-direction: column; gap: 20px;
  max-height: 90vh; overflow-y: auto;
}
.cart-header { display: flex; justify-content: space-between; align-items: center; }
.cart-header h2 { font-family: var(--font-display); color: var(--saffron); }
#closeCartBtn { background: none; border: none; font-size: 2rem; color: var(--text-light); cursor: pointer; }
.cart-item { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 10px; }
.cart-item-info h5 { margin-bottom: 5px; color: white; }
.cart-item-info span { color: var(--saffron); }
.cart-item-controls { display: flex; align-items: center; gap: 10px; }
.cart-item-controls button { background: rgba(255,255,255,0.1); border: none; color: white; width: 25px; height: 25px; border-radius: 5px; cursor: pointer; }
.cart-footer input { width: 100%; padding: 12px; margin-top: 10px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: var(--radius-sm); font-family: var(--font-body); }
.cart-total { font-family: var(--font-display); font-size: 1.4rem; font-weight: bold; color: var(--saffron); }
.empty-cart { text-align: center; color: var(--text-light); }
`;
if (!css.includes('.cart-modal-overlay')) {
    fs.writeFileSync(path.join(__dirname, 'style.css'), css + '\n' + cartCss);
}

// 3. Update app.js
let js = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const cartJs = `
// ===== CART LOGIC =====
let cart = [];
const cartModal = document.getElementById('cartModal');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const cartCount = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');
const WHATSAPP_NUMBER = '917386824414'; // Configured business number

if(openCartBtn) openCartBtn.addEventListener('click', () => cartModal.classList.add('active'));
if(closeCartBtn) closeCartBtn.addEventListener('click', () => cartModal.classList.remove('active'));

document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const card = e.target.closest('.menu-card');
    const nameNode = card.querySelector('h4');
    if (!nameNode) return;
    const name = nameNode.innerText;
    const priceText = card.querySelector('.menu-price').innerText;
    const price = parseInt(priceText.replace(/[^0-9]/g, ''));
    
    // Check if in cart
    const existing = cart.find(i => i.name === name);
    if(existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }
    updateCartUI();
    
    // Animate button
    const orgText = btn.innerText;
    btn.innerText = 'Added!';
    btn.style.background = '#27AE60';
    btn.style.color = '#fff';
    setTimeout(() => {
      btn.innerText = orgText;
      btn.style.background = '';
      btn.style.color = '';
    }, 1000);
  });
});

function updateCartUI() {
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    cartTotalPrice.innerText = '0';
    if(cartCount) cartCount.innerText = '0';
    return;
  }
  
  cartItemsContainer.innerHTML = '';
  let total = 0;
  let count = 0;
  cart.forEach((item, index) => {
    total += item.price * item.qty;
    count += item.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = \`
      <div class="cart-item-info">
        <h5>\${item.name}</h5>
        <span>₹\${item.price}</span>
      </div>
      <div class="cart-item-controls">
        <button onclick="changeQty(\${index}, -1)">-</button>
        <span>\${item.qty}</span>
        <button onclick="changeQty(\${index}, 1)">+</button>
      </div>
    \`;
    cartItemsContainer.appendChild(div);
  });
  cartTotalPrice.innerText = total;
  if(cartCount) cartCount.innerText = count;
}

window.changeQty = (index, delta) => {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  updateCartUI();
};

if(checkoutBtn) checkoutBtn.addEventListener('click', async () => {
  if (cart.length === 0) return alert('Cart is empty!');
  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  
  if (!name || !phone) return alert('Please enter your name and phone number.');
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const loadingOrgText = checkoutBtn.innerText;
  checkoutBtn.innerText = "Processing...";
  checkoutBtn.disabled = true;

  // 1. Send to Backend Database
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, items: cart, total })
    });
    if(!res.ok) console.error("Could not save to DB");
  } catch (err) {
    console.error("Backend error", err);
  }

  // 2. Format WhatsApp Message
  let text = \`Hello Viyala's! I would like to place an order:%0A%0A\`;
  cart.forEach(item => {
    text += \`*\${item.qty}x \${item.name}* - ₹\${item.price * item.qty}%0A\`;
  });
  text += \`%0A*Total: ₹\${total}*%0A%0ACustomer Name: \${name}%0APhone: \${phone}\`;
  
  cart = []; // Empty cart
  updateCartUI();
  cartModal.classList.remove('active');
  checkoutBtn.innerText = loadingOrgText;
  checkoutBtn.disabled = false;
  
  // Redirect to WhatsApp
  window.open(\`https://wa.me/\${WHATSAPP_NUMBER}?text=\${text}\`, '_blank');
});
`;

if (!js.includes('cartModal')) {
    fs.writeFileSync(path.join(__dirname, 'app.js'), js + '\n\n' + cartJs);
}

console.log('Cart functionality injected successfully.');
