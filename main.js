// Data is loaded from data.js

// Cart State
let cartItems = [];
let currentCategory = 'الكل';

// DOM Elements
const productsContainer = document.getElementById('products-container');
const cartCountElement = document.getElementById('cart-count');
const categoryButtonsContainer = document.getElementById('category-buttons');

// Categories extraction
const categories = ['الكل', ...new Set(products.map(p => p.category))];

// Helper function to format price
const formatPrice = (price, originalPrice) => {
    let html = `${price} <span class="text-sm font-normal text-zinc-400">ج.م</span>`;
    if (originalPrice) {
        html = `<span class="text-sm font-normal text-zinc-500 line-through ml-2">${originalPrice}</span>` + html;
    }
    return html;
};

// Function to render category buttons
const renderCategories = () => {
    if (!categoryButtonsContainer) return;
    let html = '';
    categories.forEach(category => {
        const isActive = category === currentCategory;
        const activeClasses = "bg-brand-yellow text-zinc-950 font-bold border-brand-yellow";
        const inactiveClasses = "border-zinc-700 text-gray-300 hover:bg-zinc-800 font-bold";
        
        html += `
            <button onclick="setCategory('${category}')" 
                class="px-6 py-2 rounded-full border text-sm transition-colors ${isActive ? activeClasses : inactiveClasses}">
                ${category}
            </button>
        `;
    });
    categoryButtonsContainer.innerHTML = html;
};

// Function to set current category
window.setCategory = (category) => {
    currentCategory = category;
    renderCategories();
    renderProducts();
};

// Function to render products
const renderProducts = () => {
    if (!productsContainer) return;
    let html = '';
    
    const filteredProducts = currentCategory === 'الكل' 
        ? products 
        : products.filter(p => p.category === currentCategory);

    filteredProducts.forEach(product => {
        const badgeHtml = product.badge 
            ? `<div class="absolute top-4 right-4 ${product.badgeColor || 'bg-brand-yellow text-black'} text-xs font-bold px-3 py-1 rounded-full z-10 shadow-lg">${product.badge}</div>` 
            : '';

        html += `
            <div class="product-card bg-brand-card rounded-2xl overflow-hidden border border-zinc-800 flex flex-col h-full group">
                <!-- Image Container -->
                <div class="relative h-56 w-full overflow-hidden bg-zinc-900">
                    ${badgeHtml}
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all z-0"></div>
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 z-0">
                </div>
                
                <!-- Content -->
                <div class="p-6 flex flex-col flex-grow">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-xl font-bold text-white leading-tight">${product.name}</h3>
                    </div>
                    
                    <p class="text-zinc-400 text-sm mb-6 flex-grow leading-relaxed">
                        ${product.description}
                    </p>
                    
                    ${product.bulkDiscounts && product.bulkDiscounts.length > 0 ? `
                        <div class="mb-4 flex flex-col gap-1">
                            <span class="text-xs font-bold text-brand-yellow"><i class="fa-solid fa-tags"></i> خصم الكميات:</span>
                            ${product.bulkDiscounts.map(d => `<span class="text-xs text-zinc-300 bg-zinc-800 px-2 py-1 rounded inline-block w-max border border-brand-yellow/20">اشتري ${d.quantity} أو أكثر بسعر ${d.pricePerUnit} ج.م / للقطعة</span>`).join('')}
                        </div>
                    ` : ''}

                    <!-- Action Area -->
                    <div class="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
                        <div class="text-2xl font-black text-brand-yellow font-sans flex items-center">
                            ${formatPrice(product.price, product.originalPrice)}
                        </div>
                        <button onclick="addToCart(${product.id})" class="w-10 h-10 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-brand-yellow hover:text-black transition-all group-hover:shadow-[0_0_10px_rgba(255,209,0,0.3)]">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    productsContainer.innerHTML = html;
};

// Function to handle adding to cart
window.addToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    if(product) {
        const existingItem = cartItems.find(item => item.product.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cartItems.push({ product, quantity: 1 });
        }
        updateCartUI();
    }
};

// Function to increase quantity
window.increaseQuantity = (productId) => {
    const item = cartItems.find(item => item.product.id === productId);
    if(item) {
        item.quantity++;
        updateCartUI();
    }
};

// Function to decrease quantity
window.decreaseQuantity = (productId) => {
    const itemIndex = cartItems.findIndex(item => item.product.id === productId);
    if(itemIndex !== -1) {
        if(cartItems[itemIndex].quantity > 1) {
            cartItems[itemIndex].quantity--;
        } else {
            cartItems.splice(itemIndex, 1);
        }
        updateCartUI();
    }
};

// Function to remove item completely
window.removeFromCart = (productId) => {
    cartItems = cartItems.filter(item => item.product.id !== productId);
    updateCartUI();
};

// Function to clear cart
window.clearCart = () => {
    cartItems = [];
    updateCartUI();
};

// Function to update Cart Badge and Dropdown
const updateCartUI = () => {
    // Helper to calculate price based on bulk discounts
    const calculateItemPricing = (item) => {
        let currentPrice = item.product.price;
        let appliedDiscountStr = "";
        
        if (item.product.bulkDiscounts && item.product.bulkDiscounts.length > 0) {
            const applicableDiscounts = item.product.bulkDiscounts
                .filter(d => item.quantity >= d.quantity)
                .sort((a, b) => b.quantity - a.quantity);
                
            if (applicableDiscounts.length > 0) {
                currentPrice = applicableDiscounts[0].pricePerUnit;
                appliedDiscountStr = `(تم تطبيق خصم الكمية: السعر ${currentPrice} ج.م)`;
            }
        }
        
        return {
            unitPrice: currentPrice,
            totalPrice: currentPrice * item.quantity,
            appliedDiscountStr
        };
    };

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + calculateItemPricing(item).totalPrice, 0);

    if(totalItems > 0) {
        cartCountElement.classList.remove('hidden');
        cartCountElement.textContent = totalItems;
        
        // Add pop animation
        cartCountElement.classList.remove('pop-animation');
        // Trigger reflow to restart animation
        void cartCountElement.offsetWidth; 
        cartCountElement.classList.add('pop-animation');
    } else {
        cartCountElement.classList.add('hidden');
    }

    // Update Dropdown UI
    const dropdownCount = document.getElementById('dropdown-count');
    const dropdownTotal = document.getElementById('dropdown-total');
    const dropdownItemsContainer = document.getElementById('cart-dropdown-items');

    if (dropdownCount) dropdownCount.textContent = totalItems;
    if (dropdownTotal) dropdownTotal.textContent = totalPrice;

    if (dropdownItemsContainer) {
        if (cartItems.length === 0) {
            dropdownItemsContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center p-8 text-zinc-500">
                    <i class="fa-solid fa-basket-shopping text-4xl mb-3 opacity-50"></i>
                    <p class="text-sm font-medium">السلة فارغة حالياً</p>
                </div>
            `;
        } else {
            dropdownItemsContainer.innerHTML = cartItems.map(item => {
                const pricing = calculateItemPricing(item);
                return `
                <div class="flex items-center gap-3 p-3 hover:bg-zinc-800/80 rounded-xl transition-colors border-b border-zinc-800/50 last:border-0 relative group/item">
                    <img src="${item.product.image}" alt="${item.product.name}" class="w-14 h-14 object-cover rounded-lg bg-zinc-900 border border-zinc-700 shrink-0">
                    <div class="flex-grow min-w-0">
                        <div class="flex justify-between items-start mb-1">
                            <h4 class="text-white text-sm font-bold truncate pl-6">${item.product.name}</h4>
                            <button onclick="removeFromCart(${item.product.id})" class="text-zinc-500 hover:text-brand-red transition-colors text-sm absolute left-3 top-3">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        ${pricing.appliedDiscountStr ? `<div class="text-[10px] text-green-400 mb-1">${pricing.appliedDiscountStr}</div>` : ''}
                        <div class="flex justify-between items-center mt-2">
                            <div class="text-brand-yellow text-xs font-bold">${pricing.totalPrice} ج.م</div>
                            <div class="flex items-center gap-2 bg-zinc-900 rounded-lg p-1 border border-zinc-700">
                                <button onclick="increaseQuantity(${item.product.id})" class="w-6 h-6 flex items-center justify-center rounded-md bg-zinc-800 hover:bg-brand-yellow hover:text-black transition-colors text-xs text-white">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                                <span class="text-white text-xs font-bold w-5 text-center">${item.quantity}</span>
                                <button onclick="decreaseQuantity(${item.product.id})" class="w-6 h-6 flex items-center justify-center rounded-md bg-zinc-800 hover:bg-brand-red hover:text-white transition-colors text-xs text-white">
                                    <i class="fa-solid fa-minus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `}).join('');
        }
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderProducts();
});
