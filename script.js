const products = [...document.querySelectorAll(".product-card")];
const cart = new Map();
const cartOverlay = document.querySelector(".cart-overlay");
const cartDrawer = document.querySelector(".cart-drawer");
const cartItems = document.querySelector(".cart-items");
const toast = document.querySelector(".toast");
const SAR = new Intl.NumberFormat("ar-SA");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2300);
}

function setFilter(filter) {
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    const active = tab.dataset.filter === filter;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-pressed", String(active));
  });
  products.forEach((product) => {
    product.classList.toggle("hidden", filter !== "الكل" && product.dataset.category !== filter);
  });
}

function renderCart() {
  const entries = [...cart.values()];
  const quantity = entries.reduce((sum, item) => sum + item.quantity, 0);
  const total = entries.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.querySelector(".bag-count").textContent = SAR.format(quantity);
  document.querySelector(".cart-heading-count").textContent = `(${SAR.format(quantity)})`;
  document.querySelector(".cart-total").textContent = `${SAR.format(total)} ر.س`;
  cartDrawer.classList.toggle("is-empty", entries.length === 0);

  cartItems.innerHTML = entries.map((item) => `
    <div class="cart-row" data-id="${item.id}">
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <h3>${item.name}</h3>
        <small>${item.detail}</small>
        <div class="quantity-control">
          <button type="button" data-action="decrease" aria-label="تقليل الكمية">−</button>
          <span>${SAR.format(item.quantity)}</span>
          <button type="button" data-action="increase" aria-label="زيادة الكمية">+</button>
        </div>
      </div>
      <strong class="cart-row-price">${SAR.format(item.price)} ر.س</strong>
    </div>`).join("");
}

function openCart() {
  cartOverlay.classList.add("open");
  cartOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
  document.querySelector(".cart-close").focus();
}

function closeCart() {
  cartOverlay.classList.remove("open");
  cartOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("locked");
}

document.querySelectorAll(".filter-tab").forEach((tab) => {
  tab.addEventListener("click", () => setFilter(tab.dataset.filter));
});

document.querySelectorAll("[data-filter-link]").forEach((link) => {
  link.addEventListener("click", () => setFilter(link.dataset.filterLink));
});

products.forEach((product, index) => {
  product.querySelector(".quick-add").addEventListener("click", () => {
    const id = String(index);
    const existing = cart.get(id);
    cart.set(id, existing ? { ...existing, quantity: existing.quantity + 1 } : {
      id,
      name: product.dataset.name,
      detail: product.querySelector(".product-detail").textContent,
      price: Number(product.dataset.price),
      image: getComputedStyle(product.querySelector(".product-image")).backgroundImage.slice(5, -2),
      quantity: 1,
    });
    renderCart();
    showToast(`أُضيفت ${product.dataset.name} إلى السلة`);
  });

  product.querySelector(".favorite-button").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const selected = button.classList.toggle("selected");
    button.textContent = selected ? "♥" : "♡";
    button.setAttribute("aria-pressed", String(selected));
    showToast(selected ? "أُضيفت إلى مفضلتكم" : "أُزيلت من مفضلتكم");
  });
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const row = button.closest(".cart-row");
  const item = cart.get(row.dataset.id);
  if (!item) return;
  if (button.dataset.action === "increase") {
    cart.set(item.id, { ...item, quantity: item.quantity + 1 });
  } else if (item.quantity > 1) {
    cart.set(item.id, { ...item, quantity: item.quantity - 1 });
  } else {
    cart.delete(item.id);
  }
  renderCart();
});

document.querySelector(".bag-button").addEventListener("click", openCart);
document.querySelector(".cart-close").addEventListener("click", closeCart);
document.querySelector(".continue-shopping").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", (event) => {
  if (event.target === cartOverlay) closeCart();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
    document.querySelector(".search-panel").classList.remove("open");
  }
});

document.querySelector(".checkout-button").addEventListener("click", () => {
  showToast("لإتمام طلبكم، يرجى التواصل معنا عبر البريد الإلكتروني");
});

const searchPanel = document.querySelector(".search-panel");
document.querySelector(".search-button").addEventListener("click", () => {
  searchPanel.classList.toggle("open");
  searchPanel.setAttribute("aria-hidden", String(!searchPanel.classList.contains("open")));
  if (searchPanel.classList.contains("open")) document.querySelector("#search-input").focus();
});
document.querySelector(".search-close").addEventListener("click", () => {
  searchPanel.classList.remove("open");
  searchPanel.setAttribute("aria-hidden", "true");
});
document.querySelector("#search-input").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLocaleLowerCase("ar");
  products.forEach((product) => {
    const matches = `${product.dataset.name} ${product.dataset.category}`.toLocaleLowerCase("ar").includes(query);
    product.classList.toggle("hidden", !matches);
  });
  document.querySelector("#bestsellers").scrollIntoView({ behavior: "smooth", block: "start" });
});

const menuButton = document.querySelector(".mobile-menu-button");
const mainNav = document.querySelector(".main-nav");
menuButton.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}));

document.querySelector(".newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector(".newsletter-message").textContent = "شكرًا لاشتراككم! يسعدنا أن تكونوا معنا.";
  event.currentTarget.reset();
});

renderCart();
