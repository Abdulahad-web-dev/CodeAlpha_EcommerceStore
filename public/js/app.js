const state = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    products: [],
    lastProductQuery: '',
    selectedCategory: 'All'
};

const SHIPPING_THRESHOLD = 250;

const categoryConfig = {
    Electronics: {
        icon: 'fa-microchip',
        tagline: 'Smart devices, work setups, and everyday tech essentials.'
    },
    Furniture: {
        icon: 'fa-couch',
        tagline: 'Comfort-driven pieces for productive and elegant spaces.'
    },
    Accessories: {
        icon: 'fa-gem',
        tagline: 'Premium carry goods and finishing touches for every day.'
    },
    Clothing: {
        icon: 'fa-shirt',
        tagline: 'Sharp fits and wardrobe staples with elevated styling.'
    },
    Lifestyle: {
        icon: 'fa-sparkles',
        tagline: 'Curated essentials for wellness, travel, and home rituals.'
    }
};

const testimonials = [
    {
        name: 'Areeba Khan',
        role: 'Design Lead',
        quote: 'The experience feels premium from discovery to checkout. Product details are clean, trust signals are strong, and the dark theme looks genuinely refined.'
    },
    {
        name: 'Zayan Malik',
        role: 'Remote Founder',
        quote: 'I found my full desk setup in one session. Search, filters, and delivery messaging made the buying flow fast and confidence-building.'
    },
    {
        name: 'Hadia Noor',
        role: 'Lifestyle Creator',
        quote: 'This store has the feel of a polished brand, not just a catalog. Collections, visuals, and the recommendation sections really stand out.'
    }
];

const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    if (!container) {
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
        <span>${message}</span>
    `;

    toast.style.transform = 'translateY(10px)';
    toast.style.opacity = '0';
    toast.style.transition = 'all 180ms ease';
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });

    setTimeout(() => {
        toast.style.transform = 'translateY(10px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 180);
    }, 3200);
};

const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatCurrency = (value = 0) => `$${Number(value || 0).toFixed(2)}`;

const updateCartCount = () => {
    const count = state.cart.reduce((total, item) => total + item.qty, 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = count;
    }
};

const persistCart = () => {
    localStorage.setItem('cart', JSON.stringify(state.cart));
    updateCartCount();
};

const getSubtotal = () => state.cart.reduce((total, item) => total + item.price * item.qty, 0);

const renderStars = (rating = 0) => {
    const fullStars = Math.round(rating);
    return `
        <div class="rating">
            ${Array.from({ length: 5 }, (_, index) => `<i class="fas fa-star${index < fullStars ? '' : '-half-stroke'}"></i>`).join('')}
            <span>${rating.toFixed(1)}</span>
        </div>
    `;
};

const deriveCategories = (products = state.products) => {
    const categories = [...new Set(products.map((product) => product.category))];
    return ['All', ...categories];
};

const getTrendingProducts = (products = state.products) => [...products]
    .sort((a, b) => (b.rating * b.numReviews) - (a.rating * a.numReviews))
    .slice(0, 3);

const getBestValueProducts = (products = state.products) => [...products]
    .sort((a, b) => a.price - b.price)
    .slice(0, 3);

const getRecommendedProducts = (productId) => state.products
    .filter((product) => product._id !== productId)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

let destroyHeroParticles = null;

const teardownHeroParticles = () => {
    if (typeof destroyHeroParticles === 'function') {
        destroyHeroParticles();
        destroyHeroParticles = null;
    }
};

const initHeroParticles = () => {
    teardownHeroParticles();

    const hero = document.querySelector('.hero');
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'hero-particles-canvas';
    hero.prepend(canvas);

    const context = canvas.getContext('2d');
    if (!context) {
        canvas.remove();
        return;
    }

    const pointer = {
        x: 0,
        y: 0,
        active: false
    };

    let particles = [];
    let animationFrame = 0;

    const createParticle = (width, height) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: 1.5 + Math.random() * 2.6
    });

    const setupScene = () => {
        const rect = hero.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(rect.width, 1);
        const height = Math.max(rect.height, 1);

        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        const nextCount = Math.max(20, Math.min(56, Math.round((width * height) / 22000)));
        particles = Array.from({ length: nextCount }, () => createParticle(width, height));
    };

    const render = () => {
        const width = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
        const height = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));
        const linkDistance = Math.min(170, Math.max(110, width * 0.14));

        context.clearRect(0, 0, width, height);

        particles.forEach((particle) => {
            if (pointer.active) {
                const dx = particle.x - pointer.x;
                const dy = particle.y - pointer.y;
                const distance = Math.hypot(dx, dy) || 1;
                const influence = 130;

                if (distance < influence) {
                    const force = (1 - distance / influence) * 1.8;
                    particle.vx += (dx / distance) * force;
                    particle.vy += (dy / distance) * force;
                }
            }

            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.985;
            particle.vy *= 0.985;

            if (particle.x <= 0 || particle.x >= width) {
                particle.vx *= -1;
                particle.x = Math.min(Math.max(particle.x, 0), width);
            }

            if (particle.y <= 0 || particle.y >= height) {
                particle.vy *= -1;
                particle.y = Math.min(Math.max(particle.y, 0), height);
            }
        });

        for (let index = 0; index < particles.length; index += 1) {
            const particle = particles[index];

            for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
                const nextParticle = particles[nextIndex];
                const dx = nextParticle.x - particle.x;
                const dy = nextParticle.y - particle.y;
                const distance = Math.hypot(dx, dy);

                if (distance > linkDistance) {
                    continue;
                }

                let alpha = 1 - distance / linkDistance;

                if (pointer.active) {
                    const midpointX = (particle.x + nextParticle.x) / 2;
                    const midpointY = (particle.y + nextParticle.y) / 2;
                    const pointerDistance = Math.hypot(midpointX - pointer.x, midpointY - pointer.y);

                    if (pointerDistance < 150) {
                        alpha *= Math.max(0.08, pointerDistance / 150);
                    }
                }

                context.strokeStyle = `rgba(96, 165, 250, ${alpha * 0.42})`;
                context.lineWidth = 1;
                context.beginPath();
                context.moveTo(particle.x, particle.y);
                context.lineTo(nextParticle.x, nextParticle.y);
                context.stroke();
            }
        }

        particles.forEach((particle) => {
            context.fillStyle = 'rgba(125, 211, 252, 0.95)';
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();

            context.fillStyle = 'rgba(59, 130, 246, 0.25)';
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size * 3.2, 0, Math.PI * 2);
            context.fill();
        });

        animationFrame = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event) => {
        const rect = hero.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
        pointer.active = true;
    };

    const handlePointerLeave = () => {
        pointer.active = false;
    };

    const handleResize = () => {
        setupScene();
    };

    setupScene();
    render();

    hero.addEventListener('pointermove', handlePointerMove);
    hero.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('resize', handleResize);

    destroyHeroParticles = () => {
        window.cancelAnimationFrame(animationFrame);
        hero.removeEventListener('pointermove', handlePointerMove);
        hero.removeEventListener('pointerleave', handlePointerLeave);
        window.removeEventListener('resize', handleResize);
        canvas.remove();
    };
};

const api = {
    async request(endpoint, options = {}) {
        const response = await fetch(endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: state.user ? `Bearer ${state.user.token}` : '',
                ...(options.headers || {})
            }
        });

        let data = {};
        try {
            data = await response.json();
        } catch (error) {
            data = {};
        }

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    },
    get(endpoint) {
        return this.request(endpoint);
    },
    post(endpoint, payload) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }
};

const fetchProducts = async (keyword = '') => {
    const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
    const products = await api.get(`/api/products${query}`);
    state.products = products;
    state.lastProductQuery = keyword;
    return products;
};

const productCardMarkup = (product) => `
    <article class="product-card">
        <div class="product-media">
            <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
        </div>
        <div class="product-body">
            <div class="product-topline">
                <span class="product-category">${escapeHtml(product.category)}</span>
                ${product.rating >= 4.6 ? '<span class="badge"><i class="fas fa-bolt"></i> Trending</span>' : '<span class="badge badge-cool"><i class="fas fa-shield-halved"></i> Verified</span>'}
            </div>
            <div class="product-info">
                <h3>${escapeHtml(product.name)}</h3>
                <p>${escapeHtml(product.description.slice(0, 84))}${product.description.length > 84 ? '...' : ''}</p>
            </div>
            <div class="product-price">${formatCurrency(product.price)}</div>
            <div class="product-bottomline">
                ${renderStars(product.rating)}
                <div class="product-actions">
                    <button class="btn btn-secondary view-product-btn" data-id="${product._id}">View</button>
                    <button class="btn btn-primary add-to-cart" data-id="${product._id}">
                        <i class="fas fa-plus"></i>
                        Add
                    </button>
                </div>
            </div>
        </div>
    </article>
`;

const bindProductCardEvents = (scope = document) => {
    scope.querySelectorAll('.add-to-cart').forEach((button) => {
        button.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            const product = state.products.find((item) => item._id === button.dataset.id);
            if (product) {
                addToCart(product);
            }
        };
    });

    scope.querySelectorAll('.view-product-btn').forEach((button) => {
        button.onclick = () => navigateTo(`/product/${button.dataset.id}`);
    });
};

const renderTestimonials = () => `
    <section class="page-section">
        <div class="container">
            <div class="section-heading">
                <div>
                    <div class="eyebrow"><i class="fas fa-heart"></i> Customer confidence</div>
                    <h2>Built to feel trustworthy at every step.</h2>
                </div>
                <p>Professional commerce is not only about products. It is also about clarity, confidence, and a smooth decision journey.</p>
            </div>
            <div class="testimonial-grid">
                ${testimonials.map((item) => `
                    <article class="testimonial-card">
                        <blockquote>"${escapeHtml(item.quote)}"</blockquote>
                        <strong>${escapeHtml(item.name)}</strong>
                        <p class="muted">${escapeHtml(item.role)}</p>
                    </article>
                `).join('')}
            </div>
        </div>
    </section>
`;

const renderProductsBlock = (title, description, products) => `
    <section class="page-section">
        <div class="container">
            <div class="section-heading">
                <div>
                    <div class="eyebrow"><i class="fas fa-bag-shopping"></i> Curated collection</div>
                    <h2>${escapeHtml(title)}</h2>
                </div>
                <p>${escapeHtml(description)}</p>
            </div>
            <div class="products-grid">
                ${products.map(productCardMarkup).join('')}
            </div>
        </div>
    </section>
`;

const renderHome = async () => {
    const app = document.getElementById('app-content');
    app.innerHTML = `
        <section class="hero">
            <div class="container hero-grid">
                <div class="hero-copy">
                    <div class="eyebrow"><i class="fas fa-sparkles"></i> Premium dark storefront</div>
                    <h1>Shop better with a <span>professional</span> experience.</h1>
                    <p>NovaCart blends premium visuals, trusted purchase signals, fast filtering, and smooth checkout into one polished e-commerce journey.</p>
                    <div class="hero-actions">
                        <a href="/products" class="btn btn-primary"><i class="fas fa-bag-shopping"></i> Shop collection</a>
                        <a href="/categories" class="btn btn-secondary"><i class="fas fa-layer-group"></i> Browse categories</a>
                    </div>
                    <div class="hero-trust">
                        <div class="mini-chip"><i class="fas fa-truck-fast"></i> Fast fulfillment</div>
                        <div class="mini-chip"><i class="fas fa-credit-card"></i> Secure payments</div>
                        <div class="mini-chip"><i class="fas fa-rotate-left"></i> Easy returns</div>
                    </div>
                </div>
                <div class="hero-visual">
                    <div class="hero-showcase">
                        <div class="floating-panel">
                            <span class="badge badge-cool"><i class="fas fa-fire"></i> New season drop</span>
                            <div class="price-tag">High-demand setups, curated accessories, and premium essentials.</div>
                            <p class="muted">A cleaner shopping UI, richer product discovery, and stronger conversion-focused sections throughout the storefront.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container stat-grid">
                <div class="stat-card">
                    <strong>48H</strong>
                    <p>priority dispatch window for featured products</p>
                </div>
                <div class="stat-card">
                    <strong>4.8/5</strong>
                    <p>average satisfaction across curated collections</p>
                </div>
                <div class="stat-card">
                    <strong>100%</strong>
                    <p>responsive shopping flow for mobile and desktop</p>
                </div>
                <div class="stat-card">
                    <strong>24/7</strong>
                    <p>support-ready structure with account and order access</p>
                </div>
            </div>
        </section>
    `;

    initHeroParticles();

    const products = await fetchProducts();
    const categories = deriveCategories(products).filter((category) => category !== 'All');
    const trending = getTrendingProducts(products);
    const bestValue = getBestValueProducts(products);

    app.innerHTML += `
        <section class="page-section">
            <div class="container">
                <div class="section-heading">
                    <div>
                        <div class="eyebrow"><i class="fas fa-grid-2"></i> Better store features</div>
                        <h2>A more complete e-commerce experience.</h2>
                    </div>
                    <p>The storefront now highlights product discovery, trust, category navigation, promotion zones, and a smoother purchase path.</p>
                </div>
                <div class="feature-grid">
                    <article class="feature-card">
                        <i class="fas fa-sliders"></i>
                        <h3>Smart discovery</h3>
                        <p>Search, category filters, sorting, and curated sections help users find products faster.</p>
                    </article>
                    <article class="feature-card">
                        <i class="fas fa-cart-shopping"></i>
                        <h3>Conversion-ready cart</h3>
                        <p>Order summary, free-shipping progress, quantity controls, and cleaner CTAs support checkout intent.</p>
                    </article>
                    <article class="feature-card">
                        <i class="fas fa-user-shield"></i>
                        <h3>Trust-focused UI</h3>
                        <p>Dark premium design, secure signals, testimonials, account dashboard, and streamlined forms feel brand-ready.</p>
                    </article>
                </div>
            </div>
        </section>

        <section class="page-section">
            <div class="container">
                <div class="section-heading">
                    <div>
                        <div class="eyebrow"><i class="fas fa-compass"></i> Category exploration</div>
                        <h2>Shop by category.</h2>
                    </div>
                    <p>Make discovery easier with dedicated category cards that bring structure to your catalog.</p>
                </div>
                <div class="categories-grid">
                    ${categories.map((category) => {
                        const config = categoryConfig[category] || categoryConfig.Lifestyle;
                        const count = products.filter((product) => product.category === category).length;
                        return `
                            <article class="category-card">
                                <div class="category-icon"><i class="fas ${config.icon}"></i></div>
                                <h3>${escapeHtml(category)}</h3>
                                <p>${escapeHtml(config.tagline)}</p>
                                <div class="category-meta">
                                    <span>${count} products</span>
                                    <a href="/categories?focus=${encodeURIComponent(category)}" class="btn btn-ghost">Explore</a>
                                </div>
                            </article>
                        `;
                    }).join('')}
                </div>
            </div>
        </section>
    `;

    app.innerHTML += renderProductsBlock(
        'Trending Right Now',
        'High-rated products and top engagement items surfaced as a featured retail section.',
        trending
    );

    app.innerHTML += `
        <section class="page-section">
            <div class="container support-banner">
                <article class="support-card">
                    <div class="eyebrow"><i class="fas fa-tags"></i> Launch offer</div>
                    <h2>Spend ${formatCurrency(SHIPPING_THRESHOLD)} and unlock free shipping plus priority packing.</h2>
                    <p class="support-copy">This promotional block gives the homepage a stronger commercial feel and supports cart conversion with a clear incentive.</p>
                    <div class="button-row">
                        <a href="/products" class="btn btn-primary">Shop offer</a>
                        <a href="/cart" class="btn btn-secondary">View cart</a>
                    </div>
                </article>
                <article class="support-card alt">
                    <div class="eyebrow"><i class="fas fa-shield"></i> Buyer confidence</div>
                    <ul class="check-list">
                        <li><i class="fas fa-check"></i><span>Secure payment selection in checkout</span></li>
                        <li><i class="fas fa-check"></i><span>Account dashboard with personal order history</span></li>
                        <li><i class="fas fa-check"></i><span>Responsive product cards and details pages</span></li>
                    </ul>
                </article>
            </div>
        </section>
    `;

    app.innerHTML += renderProductsBlock(
        'Best Value Picks',
        'A secondary storefront section for lower-price, high-appeal products that can help improve basket building.',
        bestValue
    );

    app.innerHTML += renderTestimonials();
    bindProductCardEvents(app);
};

const renderProducts = async () => {
    const app = document.getElementById('app-content');
    const products = state.products.length ? state.products : await fetchProducts();
    const categories = deriveCategories(products);

    app.innerHTML = `
        <section class="page-hero">
            <div class="container">
                <div class="page-hero-card">
                    <div class="eyebrow"><i class="fas fa-store"></i> Store catalog</div>
                    <h1>Explore all products with cleaner discovery controls.</h1>
                    <p>Search, category selection, and price sorting are now presented in a more polished storefront layout.</p>
                </div>
            </div>
        </section>

        <section class="page-section">
            <div class="container">
                <div class="toolbar panel">
                    <div>
                        <label for="search-input" class="muted">Search products</label>
                        <input id="search-input" type="text" placeholder="Try monitor, headphones, bag..." value="${escapeHtml(state.lastProductQuery)}">
                    </div>
                    <div>
                        <label for="category-select" class="muted">Category</label>
                        <select id="category-select">
                            ${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="sort-select" class="muted">Sort by</label>
                        <select id="sort-select">
                            <option value="featured">Featured</option>
                            <option value="low-high">Price: Low to High</option>
                            <option value="high-low">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>
                </div>
                <div class="category-filters" id="category-pills">
                    ${categories.map((category, index) => `<button class="filter-btn ${index === 0 ? 'active' : ''}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('')}
                </div>
                <div id="products-results" class="products-grid"></div>
            </div>
        </section>
    `;

    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('category-select');
    const sortSelect = document.getElementById('sort-select');
    const results = document.getElementById('products-results');
    const pills = document.querySelectorAll('#category-pills .filter-btn');

    const applyFilters = () => {
        const keyword = searchInput.value.trim().toLowerCase();
        const selectedCategory = categorySelect.value;
        const sortValue = sortSelect.value;

        let filtered = [...state.products];

        if (keyword) {
            filtered = filtered.filter((product) =>
                product.name.toLowerCase().includes(keyword) ||
                product.description.toLowerCase().includes(keyword) ||
                product.brand.toLowerCase().includes(keyword)
            );
        }

        if (selectedCategory !== 'All') {
            filtered = filtered.filter((product) => product.category === selectedCategory);
        }

        if (sortValue === 'low-high') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortValue === 'high-low') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortValue === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
        } else {
            filtered.sort((a, b) => b.numReviews - a.numReviews);
        }

        if (!filtered.length) {
            results.innerHTML = `
                <div class="panel" style="grid-column: 1 / -1;">
                    <h3>No products matched your filters.</h3>
                    <p class="muted">Try clearing the keyword or changing the category selection.</p>
                </div>
            `;
            return;
        }

        results.innerHTML = filtered.map(productCardMarkup).join('');
        bindProductCardEvents(results);
    };

    searchInput.oninput = applyFilters;
    categorySelect.onchange = () => {
        pills.forEach((pill) => {
            pill.classList.toggle('active', pill.dataset.category === categorySelect.value);
        });
        applyFilters();
    };
    sortSelect.onchange = applyFilters;

    pills.forEach((pill) => {
        pill.onclick = () => {
            categorySelect.value = pill.dataset.category;
            pills.forEach((item) => item.classList.toggle('active', item === pill));
            applyFilters();
        };
    });

    applyFilters();
};

const renderCategories = async () => {
    const app = document.getElementById('app-content');
    const params = new URLSearchParams(window.location.search);
    const focus = params.get('focus');
    const products = state.products.length ? state.products : await fetchProducts();
    const uniqueCategories = deriveCategories(products).filter((category) => category !== 'All');

    app.innerHTML = `
        <section class="page-hero">
            <div class="container">
                <div class="page-hero-card">
                    <div class="eyebrow"><i class="fas fa-layer-group"></i> Structured browsing</div>
                    <h1>Every category now has a stronger presence.</h1>
                    <p>This section helps the store feel more complete, while giving users another fast way to reach relevant products.</p>
                </div>
            </div>
        </section>
        <section class="page-section">
            <div class="container">
                <div class="categories-grid">
                    ${uniqueCategories.map((category) => {
                        const config = categoryConfig[category] || categoryConfig.Lifestyle;
                        const matches = products.filter((product) => product.category === category);
                        const bestProduct = [...matches].sort((a, b) => b.rating - a.rating)[0];
                        const isFocus = focus === category;
                        return `
                            <article class="category-card" style="${isFocus ? 'border-color: rgba(56, 189, 248, 0.48); box-shadow: 0 18px 45px rgba(14, 165, 233, 0.16);' : ''}">
                                <div class="category-icon"><i class="fas ${config.icon}"></i></div>
                                <h3>${escapeHtml(category)}</h3>
                                <p>${escapeHtml(config.tagline)}</p>
                                <ul class="simple-list" style="margin-top: 16px;">
                                    <li><i class="fas fa-check"></i><span>${matches.length} listed products</span></li>
                                    <li><i class="fas fa-check"></i><span>Top item: ${bestProduct ? escapeHtml(bestProduct.name) : 'Coming soon'}</span></li>
                                </ul>
                                <div class="category-meta">
                                    <span>${bestProduct ? formatCurrency(bestProduct.price) : 'Fresh drop soon'}</span>
                                    <a href="/products" class="btn btn-secondary">Shop now</a>
                                </div>
                            </article>
                        `;
                    }).join('')}
                </div>
            </div>
        </section>
        ${renderTestimonials()}
    `;
};

const renderSearch = async () => {
    const app = document.getElementById('app-content');
    const products = state.products.length ? state.products : await fetchProducts();
    const trending = getTrendingProducts(products);

    app.innerHTML = `
        <section class="page-hero">
            <div class="container">
                <div class="page-hero-card">
                    <div class="eyebrow"><i class="fas fa-magnifying-glass"></i> Discover products</div>
                    <h1>Search the catalog instantly.</h1>
                    <p>A dedicated discovery page makes the storefront feel more feature-complete and gives users a fast, focused search experience.</p>
                    <div class="support-banner">
                        <div class="support-card">
                            <label for="discover-input" class="muted">What are you looking for?</label>
                            <input id="discover-input" type="text" placeholder="Search by product, brand, or category">
                        </div>
                        <div class="support-card alt">
                            <div class="eyebrow"><i class="fas fa-chart-line"></i> Popular right now</div>
                            <p class="support-copy">${trending.map((item) => escapeHtml(item.name)).join(', ')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="page-section">
            <div class="container">
                <div id="discover-results" class="products-grid">
                    ${products.map(productCardMarkup).join('')}
                </div>
            </div>
        </section>
    `;

    const input = document.getElementById('discover-input');
    const results = document.getElementById('discover-results');
    bindProductCardEvents(app);

    input.oninput = () => {
        const keyword = input.value.trim().toLowerCase();
        const filtered = state.products.filter((product) =>
            product.name.toLowerCase().includes(keyword) ||
            product.brand.toLowerCase().includes(keyword) ||
            product.category.toLowerCase().includes(keyword)
        );

        results.innerHTML = filtered.length
            ? filtered.map(productCardMarkup).join('')
            : `
                <div class="panel" style="grid-column: 1 / -1;">
                    <h3>No search matches found.</h3>
                    <p class="muted">Try a different keyword or browse the full store catalog.</p>
                </div>
            `;
        bindProductCardEvents(results);
    };
};

const renderCart = () => {
    const app = document.getElementById('app-content');

    if (!state.cart.length) {
        app.innerHTML = `
            <section class="empty-state">
                <div class="container">
                    <div class="status-icon"><i class="fas fa-bag-shopping"></i></div>
                    <h1>Your cart is still empty.</h1>
                    <p class="muted">The professional layout is ready. Now it just needs a few products to move the checkout flow forward.</p>
                    <div class="button-row" style="justify-content: center; margin-top: 22px;">
                        <a href="/products" class="btn btn-primary">Shop products</a>
                        <a href="/categories" class="btn btn-secondary">Browse categories</a>
                    </div>
                </div>
            </section>
        `;
        return;
    }

    const subtotal = getSubtotal();
    const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : 18;
    const tax = subtotal * 0.1;
    const total = subtotal + tax + shipping;
    const progress = Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100);

    app.innerHTML = `
        <section class="page-hero">
            <div class="container">
                <div class="page-hero-card">
                    <div class="eyebrow"><i class="fas fa-cart-shopping"></i> Cart summary</div>
                    <h1>Review your basket before checkout.</h1>
                    <p>Quantity controls, shipping progress, and a cleaner order summary give the cart a more polished e-commerce feel.</p>
                </div>
            </div>
        </section>
        <section class="page-section">
            <div class="container cart-layout">
                <div>
                    <div class="panel" style="margin-bottom: 18px;">
                        <div class="line-between" style="margin-bottom: 12px;">
                            <strong>Free shipping progress</strong>
                            <span class="muted">${subtotal >= SHIPPING_THRESHOLD ? 'Unlocked' : `${formatCurrency(SHIPPING_THRESHOLD - subtotal)} away`}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%;"></div>
                        </div>
                    </div>
                    <div class="cart-items">
                        ${state.cart.map((item) => `
                            <article class="cart-item">
                                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
                                <div>
                                    <span class="product-category">In cart</span>
                                    <h3>${escapeHtml(item.name)}</h3>
                                    <p class="muted">${formatCurrency(item.price)} per item</p>
                                    <div class="cart-item-actions" style="margin-top: 16px;">
                                        <div class="qty-control">
                                            <button class="qty-btn update-qty-btn" data-id="${item.product}" data-next="${item.qty - 1}">-</button>
                                            <span class="qty-value">${item.qty}</span>
                                            <button class="qty-btn update-qty-btn" data-id="${item.product}" data-next="${item.qty + 1}">+</button>
                                        </div>
                                        <button class="btn btn-ghost remove-cart-item" data-id="${item.product}"><i class="fas fa-trash"></i> Remove</button>
                                    </div>
                                </div>
                                <strong>${formatCurrency(item.price * item.qty)}</strong>
                            </article>
                        `).join('')}
                    </div>
                </div>
                <aside class="summary-card">
                    <h3>Order summary</h3>
                    <div class="summary-line"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
                    <div class="summary-line"><span>Shipping</span><span>${shipping === 0 ? 'Free' : formatCurrency(shipping)}</span></div>
                    <div class="summary-line"><span>Estimated tax</span><span>${formatCurrency(tax)}</span></div>
                    <div class="summary-total"><span>Total</span><span>${formatCurrency(total)}</span></div>
                    <ul class="simple-list" style="margin: 18px 0 22px;">
                        <li><i class="fas fa-check"></i><span>Secure checkout flow</span></li>
                        <li><i class="fas fa-check"></i><span>Saved cart via local storage</span></li>
                        <li><i class="fas fa-check"></i><span>Order history available after login</span></li>
                    </ul>
                    <a href="/checkout" class="btn btn-primary" style="width: 100%;">Proceed to checkout</a>
                </aside>
            </div>
        </section>
    `;

    document.querySelectorAll('.update-qty-btn').forEach((button) => {
        button.onclick = () => updateQty(button.dataset.id, Number(button.dataset.next));
    });

    document.querySelectorAll('.remove-cart-item').forEach((button) => {
        button.onclick = () => removeFromCart(button.dataset.id);
    });
};

const renderLogin = () => {
    const app = document.getElementById('app-content');
    app.innerHTML = `
        <section class="auth-wrap">
            <div class="container">
                <div class="auth-card">
                    <div class="auth-side">
                        <div class="eyebrow"><i class="fas fa-user-shield"></i> Account access</div>
                        <h2 style="font-size: 2.6rem; line-height: 1.05; margin-bottom: 16px;">Welcome back to your premium storefront.</h2>
                        <p class="support-copy">Sign in to review past orders, continue checkout, and keep your cart synced.</p>
                        <ul class="check-list" style="margin-top: 24px;">
                            <li><i class="fas fa-check"></i><span>Protected routes for checkout and orders</span></li>
                            <li><i class="fas fa-check"></i><span>Personal dashboard with order history</span></li>
                            <li><i class="fas fa-check"></i><span>Cleaner dark form experience</span></li>
                        </ul>
                    </div>
                    <div class="auth-panel">
                        <div class="eyebrow"><i class="fas fa-right-to-bracket"></i> Sign in</div>
                        <h1>Login to continue shopping.</h1>
                        <p class="muted" style="margin: 12px 0 24px;">Use your account to access the upgraded e-commerce experience.</p>
                        <form id="login-form">
                            <div class="form-field">
                                <label for="login-email">Email address</label>
                                <input id="login-email" type="email" placeholder="name@example.com" required>
                            </div>
                            <div class="form-field">
                                <label for="login-password">Password</label>
                                <input id="login-password" type="password" placeholder="Enter your password" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Sign in</button>
                            <a href="/register" class="btn btn-secondary">Create account</a>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    `;

    document.getElementById('login-form').onsubmit = async (event) => {
        event.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        if (!email || !password) {
            showToast('Email and password are required.', 'error');
            return;
        }

        try {
            const data = await api.post('/api/auth/login', { email, password });
            state.user = data;
            localStorage.setItem('user', JSON.stringify(data));
            syncUserLink();
            showToast(`Welcome back, ${data.name}!`);
            navigateTo('/dashboard');
        } catch (error) {
            showToast(error.message || 'Login failed.', 'error');
        }
    };
};

const renderRegister = () => {
    const app = document.getElementById('app-content');
    app.innerHTML = `
        <section class="auth-wrap">
            <div class="container">
                <div class="auth-card">
                    <div class="auth-side">
                        <div class="eyebrow"><i class="fas fa-user-plus"></i> New customer</div>
                        <h2 style="font-size: 2.6rem; line-height: 1.05; margin-bottom: 16px;">Create your account and save your shopping journey.</h2>
                        <p class="support-copy">A better storefront deserves a proper account flow with dashboard access, order tracking, and faster checkout.</p>
                    </div>
                    <div class="auth-panel">
                        <div class="eyebrow"><i class="fas fa-id-card"></i> Register</div>
                        <h1>Join NovaCart today.</h1>
                        <p class="muted" style="margin: 12px 0 24px;">Create an account to unlock a more complete store experience.</p>
                        <form id="register-form">
                            <div class="form-field">
                                <label for="register-name">Full name</label>
                                <input id="register-name" type="text" placeholder="Your full name" required>
                            </div>
                            <div class="form-field">
                                <label for="register-email">Email address</label>
                                <input id="register-email" type="email" placeholder="name@example.com" required>
                            </div>
                            <div class="form-field">
                                <label for="register-password">Password</label>
                                <input id="register-password" type="password" placeholder="At least 6 characters" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Create account</button>
                            <a href="/login" class="btn btn-secondary">Already have an account</a>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    `;

    document.getElementById('register-form').onsubmit = async (event) => {
        event.preventDefault();

        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();

        if (!name || !email || !password) {
            showToast('All fields are required.', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('Password must be at least 6 characters.', 'error');
            return;
        }

        try {
            const data = await api.post('/api/auth/register', { name, email, password });
            state.user = data;
            localStorage.setItem('user', JSON.stringify(data));
            syncUserLink();
            showToast('Account created successfully.');
            navigateTo('/dashboard');
        } catch (error) {
            showToast(error.message || 'Registration failed.', 'error');
        }
    };
};

const renderProductDetails = async (id) => {
    const app = document.getElementById('app-content');
    app.innerHTML = '<div class="page-loader"><i class="fas fa-circle-notch fa-spin"></i></div>';

    try {
        const product = await api.get(`/api/products/${id}`);
        if (!state.products.length) {
            await fetchProducts();
        }

        const recommendations = getRecommendedProducts(product._id);
        const stockStatus = product.countInStock > 0 ? 'In stock' : 'Out of stock';
        const stockClass = product.countInStock > 0 ? 'paid' : '';

        app.innerHTML = `
            <section class="product-detail">
                <div class="container split-grid">
                    <div class="product-gallery">
                        <div class="panel">
                            <img class="detail-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
                        </div>
                    </div>
                    <div class="product-copy">
                        <div class="eyebrow"><i class="fas fa-box-open"></i> Product detail</div>
                        <h1>${escapeHtml(product.name)}</h1>
                        <div class="detail-meta">
                            <span class="badge badge-cool"><i class="fas fa-industry"></i> ${escapeHtml(product.brand)}</span>
                            <span class="badge"><i class="fas fa-layer-group"></i> ${escapeHtml(product.category)}</span>
                            <span class="order-status ${stockClass}"><i class="fas fa-circle"></i> ${stockStatus}</span>
                        </div>
                        ${renderStars(product.rating)}
                        <div class="product-price" style="font-size: 2rem; margin-top: 18px;">${formatCurrency(product.price)}</div>
                        <p class="muted" style="margin: 18px 0 22px;">${escapeHtml(product.description)}</p>
                        <ul class="detail-list">
                            <li><i class="fas fa-check"></i><span>Premium presentation with clearer buying signals</span></li>
                            <li><i class="fas fa-check"></i><span>${product.numReviews} reviews collected from the catalog</span></li>
                            <li><i class="fas fa-check"></i><span>${product.countInStock} units currently available</span></li>
                        </ul>
                        <div class="split-actions" style="margin-top: 26px;">
                            <div class="qty-control">
                                <button id="qty-minus" class="qty-btn">-</button>
                                <span id="qty-value" class="qty-value">1</span>
                                <button id="qty-plus" class="qty-btn">+</button>
                            </div>
                            <button id="add-detail-cart" class="btn btn-primary"><i class="fas fa-cart-plus"></i> Add to cart</button>
                            <a href="/products" class="btn btn-secondary">Back to shop</a>
                        </div>
                        <div class="info-grid">
                            <article class="info-card">
                                <h4>Fast dispatch</h4>
                                <p>Orders move into fulfillment quickly with clearer status visibility.</p>
                            </article>
                            <article class="info-card">
                                <h4>Secure checkout</h4>
                                <p>Protected flow available after login and ready for payment selection.</p>
                            </article>
                            <article class="info-card">
                                <h4>Account history</h4>
                                <p>Placed orders are visible from the customer dashboard.</p>
                            </article>
                        </div>
                    </div>
                </div>
            </section>
            ${recommendations.length ? renderProductsBlock('Recommended For You', 'A product page feels more premium when it also helps users continue shopping.', recommendations) : ''}
        `;

        let qty = 1;
        const qtyValue = document.getElementById('qty-value');
        document.getElementById('qty-plus').onclick = () => {
            if (qty < Math.max(product.countInStock, 1)) {
                qty += 1;
                qtyValue.textContent = qty;
            }
        };
        document.getElementById('qty-minus').onclick = () => {
            if (qty > 1) {
                qty -= 1;
                qtyValue.textContent = qty;
            }
        };
        document.getElementById('add-detail-cart').onclick = () => {
            for (let index = 0; index < qty; index += 1) {
                addToCart(product, false);
            }
            showToast(`${qty} item${qty > 1 ? 's' : ''} added to cart.`);
        };

        bindProductCardEvents(app);
    } catch (error) {
        app.innerHTML = `
            <section class="empty-state">
                <div class="container">
                    <div class="status-icon"><i class="fas fa-circle-exclamation"></i></div>
                    <h1>We could not load that product.</h1>
                    <p class="muted">${escapeHtml(error.message || 'Please try again.')}</p>
                    <a href="/products" class="btn btn-primary" style="margin-top: 20px;">Return to products</a>
                </div>
            </section>
        `;
    }
};

const renderCheckout = () => {
    if (!state.user) {
        showToast('Please login before checkout.', 'error');
        navigateTo('/login');
        return;
    }

    if (!state.cart.length) {
        showToast('Your cart is empty.', 'error');
        navigateTo('/products');
        return;
    }

    const subtotal = getSubtotal();
    const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : 18;
    const tax = subtotal * 0.1;
    const total = subtotal + tax + shipping;
    const app = document.getElementById('app-content');

    app.innerHTML = `
        <section class="page-hero">
            <div class="container">
                <div class="page-hero-card checkout-head">
                    <div class="eyebrow"><i class="fas fa-lock"></i> Secure checkout</div>
                    <h1>Complete your order with confidence.</h1>
                    <p>The checkout now feels more structured with clear shipping inputs, payment options, and an at-a-glance order review.</p>
                </div>
            </div>
        </section>
        <section class="page-section">
            <div class="container checkout-layout">
                <div class="checkout-card">
                    <form id="checkout-form" class="checkout-form">
                        <div class="form-grid">
                            <div class="form-field">
                                <label for="address">Address</label>
                                <input id="address" type="text" required>
                            </div>
                            <div class="form-field">
                                <label for="city">City</label>
                                <input id="city" type="text" required>
                            </div>
                        </div>
                        <div class="form-grid">
                            <div class="form-field">
                                <label for="postalCode">Postal code</label>
                                <input id="postalCode" type="text" required>
                            </div>
                            <div class="form-field">
                                <label for="country">Country</label>
                                <input id="country" type="text" required>
                            </div>
                        </div>
                        <div class="form-field">
                            <label>Payment method</label>
                            <div class="payment-options">
                                <label class="payment-option"><input type="radio" name="payment" value="PayPal / Card" checked> PayPal / Card</label>
                                <label class="payment-option"><input type="radio" name="payment" value="Stripe"> Stripe</label>
                                <label class="payment-option"><input type="radio" name="payment" value="Cash On Delivery"> Cash On Delivery</label>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">Place order</button>
                    </form>
                </div>
                <aside class="summary-card">
                    <h3>Review order</h3>
                    <div class="order-list" style="margin: 18px 0;">
                        ${state.cart.map((item) => `
                            <li class="summary-line">
                                <span>${escapeHtml(item.name)} x${item.qty}</span>
                                <span>${formatCurrency(item.price * item.qty)}</span>
                            </li>
                        `).join('')}
                    </div>
                    <div class="summary-line"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
                    <div class="summary-line"><span>Shipping</span><span>${shipping === 0 ? 'Free' : formatCurrency(shipping)}</span></div>
                    <div class="summary-line"><span>Tax</span><span>${formatCurrency(tax)}</span></div>
                    <div class="summary-total"><span>Total</span><span>${formatCurrency(total)}</span></div>
                </aside>
            </div>
        </section>
    `;

    document.getElementById('checkout-form').onsubmit = async (event) => {
        event.preventDefault();

        const orderData = {
            orderItems: state.cart,
            shippingAddress: {
                address: document.getElementById('address').value.trim(),
                city: document.getElementById('city').value.trim(),
                postalCode: document.getElementById('postalCode').value.trim(),
                country: document.getElementById('country').value.trim()
            },
            paymentMethod: document.querySelector('input[name="payment"]:checked').value,
            totalPrice: total
        };

        try {
            const order = await api.post('/api/orders/place', orderData);
            state.cart = [];
            localStorage.removeItem('cart');
            updateCartCount();
            renderSuccess(order._id);
        } catch (error) {
            showToast(error.message || 'Order placement failed.', 'error');
        }
    };
};

const renderSuccess = (orderId) => {
    const app = document.getElementById('app-content');
    app.innerHTML = `
        <section class="success-state">
            <div class="container">
                <div class="status-icon"><i class="fas fa-check"></i></div>
                <h1>Order placed successfully.</h1>
                <p class="muted">Your confirmation ID is <strong>${escapeHtml(orderId)}</strong>. The dashboard can now show this order in your account history.</p>
                <div class="button-row" style="justify-content: center; margin-top: 20px;">
                    <a href="/dashboard" class="btn btn-primary">Go to dashboard</a>
                    <a href="/products" class="btn btn-secondary">Continue shopping</a>
                </div>
            </div>
        </section>
    `;
};

const renderDashboard = async () => {
    if (!state.user) {
        navigateTo('/login');
        return;
    }

    const app = document.getElementById('app-content');
    app.innerHTML = '<div class="page-loader"><i class="fas fa-circle-notch fa-spin"></i></div>';

    try {
        const orders = await api.get('/api/orders/my-orders');
        const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

        app.innerHTML = `
            <section class="page-hero">
                <div class="container">
                    <div class="page-hero-card">
                        <div class="eyebrow"><i class="fas fa-chart-pie"></i> Customer dashboard</div>
                        <h1>Your account now has a cleaner order management space.</h1>
                        <p>Dashboard access helps the store feel real and complete by giving signed-in users a personal area for order history.</p>
                    </div>
                </div>
            </section>
            <section class="page-section">
                <div class="container dashboard-grid">
                    <aside class="dashboard-card">
                        <div class="avatar">${escapeHtml(state.user.name.charAt(0).toUpperCase())}</div>
                        <h3>${escapeHtml(state.user.name)}</h3>
                        <p class="muted">${escapeHtml(state.user.email)}</p>
                        <ul class="simple-list" style="margin: 20px 0;">
                            <li><i class="fas fa-check"></i><span>${orders.length} orders placed</span></li>
                            <li><i class="fas fa-check"></i><span>${formatCurrency(totalSpent)} lifetime spend</span></li>
                            <li><i class="fas fa-check"></i><span>${state.cart.length} items currently in cart</span></li>
                        </ul>
                        <button id="logout-btn" class="btn btn-secondary" style="width: 100%;">Logout</button>
                    </aside>
                    <div>
                        <div class="panel" style="margin-bottom: 18px;">
                            <div class="line-between">
                                <div>
                                    <span class="product-category">Order history</span>
                                    <h3 style="margin-top: 4px;">Recent orders</h3>
                                </div>
                                <a href="/products" class="btn btn-primary">Shop more</a>
                            </div>
                        </div>
                        <div class="order-history">
                            ${orders.length ? orders.map((order) => `
                                <article class="order-card">
                                    <div>
                                        <strong>Order #${escapeHtml(order._id.slice(0, 8))}</strong>
                                        <p class="muted">${new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div style="text-align: right;">
                                        <strong>${formatCurrency(order.totalPrice)}</strong>
                                        <div class="order-status ${order.isPaid ? 'paid' : ''}" style="margin-top: 10px;">
                                            <i class="fas fa-circle"></i>
                                            ${order.isPaid ? 'Paid' : 'Pending'}
                                        </div>
                                    </div>
                                </article>
                            `).join('') : `
                                <div class="panel">
                                    <h3>No orders yet.</h3>
                                    <p class="muted">Once a user checks out, order history will appear here automatically.</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </section>
        `;

        document.getElementById('logout-btn').onclick = logout;
    } catch (error) {
        app.innerHTML = `
            <section class="empty-state">
                <div class="container">
                    <div class="status-icon"><i class="fas fa-circle-exclamation"></i></div>
                    <h1>We could not load your dashboard.</h1>
                    <p class="muted">${escapeHtml(error.message || 'Please try again later.')}</p>
                </div>
            </section>
        `;
    }
};

const addToCart = (product, showSingleToast = true) => {
    const existing = state.cart.find((item) => item.product === product._id);
    if (existing) {
        existing.qty += 1;
    } else {
        state.cart.push({
            product: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            qty: 1
        });
    }

    persistCart();
    if (showSingleToast) {
        showToast(`${product.name} added to cart.`);
    }
};

const removeFromCart = (id) => {
    state.cart = state.cart.filter((item) => item.product !== id);
    persistCart();
    renderCart();
    showToast('Item removed from cart.');
};

const updateQty = (id, qty) => {
    if (qty < 1) {
        removeFromCart(id);
        return;
    }

    const item = state.cart.find((entry) => entry.product === id);
    if (item) {
        item.qty = qty;
        persistCart();
        renderCart();
    }
};

const logout = () => {
    state.user = null;
    localStorage.removeItem('user');
    syncUserLink();
    showToast('Logged out successfully.');
    navigateTo('/');
};

const syncUserLink = () => {
    const userBtn = document.getElementById('user-btn');
    if (userBtn) {
        userBtn.href = state.user ? '/dashboard' : '/login';
    }
};

const closeMobileMenu = () => {
    const panel = document.getElementById('nav-panel');
    if (panel) {
        panel.classList.remove('open');
    }
};

const routes = {
    '/': renderHome,
    '/products': renderProducts,
    '/categories': renderCategories,
    '/search': renderSearch,
    '/cart': renderCart,
    '/login': renderLogin,
    '/register': renderRegister,
    '/checkout': renderCheckout,
    '/dashboard': renderDashboard
};

const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    handleRoute();
};

const updateActiveLinks = () => {
    const current = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === current);
    });
};

const handleRoute = () => {
    const path = window.location.pathname;
    const app = document.getElementById('app-content');
    if (!app) {
        return;
    }

    teardownHeroParticles();
    app.style.opacity = '0';

    setTimeout(async () => {
        try {
            if (path.startsWith('/product/')) {
                const id = path.split('/')[2];
                await renderProductDetails(id);
            } else {
                const renderer = routes[path] || renderHome;
                await renderer();
            }
        } catch (error) {
            app.innerHTML = `
                <section class="empty-state">
                    <div class="container">
                        <div class="status-icon"><i class="fas fa-circle-exclamation"></i></div>
                        <h1>Something went wrong.</h1>
                        <p class="muted">${escapeHtml(error.message || 'Please refresh the page.')}</p>
                    </div>
                </section>
            `;
        }

        app.classList.remove('page-animate');
        void app.offsetWidth;
        app.classList.add('page-animate');
        app.style.opacity = '1';
        updateActiveLinks();
        closeMobileMenu();
        window.scrollTo(0, 0);
    }, 70);
};

window.onpopstate = handleRoute;

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    syncUserLink();
    updateActiveLinks();
    handleRoute();

    const menuButton = document.getElementById('mobile-menu-btn');
    const navPanel = document.getElementById('nav-panel');

    if (menuButton && navPanel) {
        menuButton.onclick = () => navPanel.classList.toggle('open');
    }

    document.body.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (link && link.getAttribute('href') && link.getAttribute('href').startsWith('/')) {
            event.preventDefault();
            navigateTo(link.getAttribute('href'));
        }
    });

    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.onsubmit = (event) => {
            event.preventDefault();
            const input = document.getElementById('newsletter-email');
            if (input && input.value.trim()) {
                showToast('Thanks for joining the weekly drops list.');
                input.value = '';
            }
        };
    }
});
