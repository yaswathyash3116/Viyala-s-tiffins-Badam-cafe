/* =====================================
   UDUPI NIVAS — JavaScript App Logic
   ===================================== */

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
const navLinks = document.getElementById('navLinks');
const hamburger = document.getElementById('hamburger');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveNavLink();
}, { passive: true });

// ===== HAMBURGER MENU =====
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('open');
});

// Close nav when a link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
function updateActiveNavLink() {
  const scrollPos = window.scrollY + 120;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) {
      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
}

// ===== MENU TABS =====
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.menu-tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.dataset.tab;
    // Update button states
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Update content
    tabContents.forEach(tc => tc.classList.remove('active'));
    const target = document.getElementById(`tab-${targetTab}`);
    if (target) {
      target.classList.add('active');
      // Trigger AOS for newly visible cards
      setTimeout(() => triggerAOS(), 50);
    }
  });
});

// ===== SCROLL REVEAL (AOS-like) =====
function triggerAOS() {
  const aosEls = document.querySelectorAll('[data-aos]:not(.visible)');
  aosEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) {
      el.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', triggerAOS, { passive: true });
window.addEventListener('resize', triggerAOS, { passive: true });

// ===== SMOOTH SCROLLING for # links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== MENU CARD HOVER RIPPLE =====
document.querySelectorAll('.menu-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1), border-color 0.35s ease, box-shadow 0.35s ease';
  });
});

// ===== COUNTER ANIMATION on hero stats =====
function animateCounter(el, target, suffix = '') {
  let count = 0;
  const step = Math.ceil(target / 50);
  const timer = setInterval(() => {
    count += step;
    if (count >= target) {
      count = target;
      clearInterval(timer);
    }
    el.textContent = count + suffix;
  }, 30);
}

// Observe hero stats for entry
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statNums = document.querySelectorAll('.stat-num');
      statNums[0] && animateCounter(statNums[0], 25, '+');
      statNums[1] && animateCounter(statNums[1], 10, 'K+');
      statNums[2] && animateCounter(statNums[2], 28, 'yr');
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  triggerAOS();
  updateActiveNavLink();
});

// Also run once immediately
triggerAOS();



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

function syncCardsUI() {
  document.querySelectorAll('.menu-card, .spec-card').forEach(card => {
    const nameNode = card.querySelector('h4') || card.querySelector('h3');
    if (!nameNode) return;
    const name = nameNode.innerText;
    const cartItem = cart.find(i => i.name === name);
    
    const bottomContainer = card.querySelector('.menu-card-bottom') || card.querySelector('.spec-footer');
    if (!bottomContainer) return;
    
    let actionWrapper = bottomContainer.querySelector('.action-wrapper');
    if (!actionWrapper) {
      const existingBtn = bottomContainer.querySelector('.add-to-cart-btn');
      if (existingBtn) {
         actionWrapper = document.createElement('div');
         actionWrapper.className = 'action-wrapper';
         bottomContainer.insertBefore(actionWrapper, existingBtn);
         existingBtn.remove();
      } else {
         return; 
      }
    }
    
    if (cartItem && cartItem.qty > 0) {
      actionWrapper.innerHTML = `
        <div class="item-qty-controls">
          <button onclick="changeItemQty('${name.replace(/'/g, "\\'")}', -1)">-</button>
          <span>${cartItem.qty}</span>
          <button onclick="changeItemQty('${name.replace(/'/g, "\\'")}', 1)">+</button>
        </div>
      `;
    } else {
       actionWrapper.innerHTML = `<button class="add-to-cart-btn" onclick="changeItemQty('${name.replace(/'/g, "\\'")}', 1)">Add +</button>`;
    }
  });
}

window.changeItemQty = (name, delta) => {
  const index = cart.findIndex(i => i.name === name);
  if (index >= 0) {
    window.changeQty(index, delta);
  } else if (delta > 0) {
    const cards = document.querySelectorAll('.menu-card, .spec-card');
    for (let card of cards) {
      const nameNode = card.querySelector('h4') || card.querySelector('h3');
      if (nameNode && nameNode.innerText === name) {
        const priceNode = card.querySelector('.menu-price') || card.querySelector('.spec-price');
        const priceText = priceNode ? priceNode.innerText : '';
        const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
        cart.push({ name, price, qty: 1 });
        updateCartUI();
        break;
      }
    }
  }
};

function updateCartUI() {
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    cartTotalPrice.innerText = '0';
    if(cartCount) cartCount.innerText = '0';
  } else {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    let count = 0;
    cart.forEach((item, index) => {
      total += item.price * item.qty;
      count += item.qty;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div class="cart-item-info">
          <h5>${item.name}</h5>
          <span>₹${item.price}</span>
        </div>
        <div class="cart-item-controls">
          <button onclick="changeQty(${index}, -1)">-</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${index}, 1)">+</button>
        </div>
      `;
      cartItemsContainer.appendChild(div);
    });
    cartTotalPrice.innerText = total;
    if(cartCount) cartCount.innerText = count;
  }
  syncCardsUI();
}

window.changeQty = (index, delta) => {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  updateCartUI();
};

document.addEventListener('DOMContentLoaded', () => {
    // Initial sync to set up buttons properly
    setTimeout(syncCardsUI, 100);
});

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
  let text = `Hello Viyala's! I would like to place an order:%0A%0A`;
  cart.forEach(item => {
    text += `*${item.qty}x ${item.name}* - ₹${item.price * item.qty}%0A`;
  });
  text += `%0A*Total: ₹${total}*%0A%0ACustomer Name: ${name}%0APhone: ${phone}`;
  
  cart = []; // Empty cart
  updateCartUI();
  cartModal.classList.remove('active');
  checkoutBtn.innerText = loadingOrgText;
  checkoutBtn.disabled = false;
  
  // Redirect to WhatsApp
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
});
document.getElementById("orderForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const item = document.getElementById("item").value;
  const quantity = document.getElementById("quantity").value;

  const res = await fetch("/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, item, quantity }),
  });

  const data = await res.json();

  if (data.success) {
    alert("✅ Order placed successfully!");
  } else {
    alert("❌ Error placing order");
  }
});