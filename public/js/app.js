    // ============================================
    // VARIABLES GLOBALES ET ETAT DE L'APPLICATION
    // ============================================
    let currentUser = null;
    let currentTab = 'home';
    let cart = [];
    let currentCategory = 'all';
    let searchQuery = '';
    let popupCallback = null;
    let popupData = null;
    let visitorOrders = [];
    let currentStockProductId = null;
    let inventoryFilter = 'all';

    // Catégories disponibles
    const categories = [
        { id: 'all', name: 'Tous', icon: 'fas fa-layer-group' },
        { id: 'repas', name: 'Plats', icon: 'fas fa-utensils' },
        { id: 'boisson', name: 'Boissons', icon: 'fas fa-wine-glass' },
        { id: 'dessert', name: 'Desserts', icon: 'fas fa-ice-cream' },
        { id: 'entree', name: 'Entrées', icon: 'fas fa-carrot' }
    ];

    // Données du menu (initialement vide, chargé via API)
    let menuData = [];

    // Charger les produits depuis l'API
    async function fetchProducts() {
        try {
            const products = await apiCall('/products');
            // Transformer les données de l'API pour correspondre à la structure attendue
            menuData = products.map(p => ({
                id: p._id,
                name: p.name,
                price: p.price,
                type: p.category,
                image: p.image,
                stock: p.stock,
                stockMax: p.maxStock,
                desc: p.description
            }));
            // Mettre à jour l'affichage si on est sur la page d'accueil ou inventaire
            if (currentTab === 'visitor-home') updateProductGrid();
            if (currentTab === 'admin-inv') {
                 const display = document.getElementById('content-display');
                 renderAdminInv(display);
            }
        } catch (error) {
            console.error('Erreur chargement produits:', error);
            showToast('Erreur', 'Impossible de charger le menu', 'error');
        }
    }

    // Commandes
    let orders = [
        { id: "#OP-8821", customer: "Ibrahim Sall", items: "Burger Opulence x2", total: 48.00, status: "en cours", time: "14:15" },
        { id: "#OP-8820", customer: "Amine K.", items: "Salade Impériale x1", total: 21.00, status: "terminé", time: "13:30" }
    ];

    // ============================================
    // SYSTEME DE MODAL POPUP
    // ============================================
    function showPopup(title, message, type = 'info', confirmText = 'Confirmer', cancelText = 'Annuler', onConfirm = null, data = null) {
        const modal = document.getElementById('popup-modal');
        const icon = document.getElementById('popup-icon');
        const titleEl = document.getElementById('popup-title');
        const messageEl = document.getElementById('popup-message');
        const confirmBtn = document.getElementById('popup-confirm');
        const cancelBtn = document.getElementById('popup-cancel');
        
        titleEl.innerText = title;
        messageEl.innerText = message;
        confirmBtn.innerText = confirmText;
        cancelBtn.innerText = cancelText;
        popupCallback = onConfirm;
        popupData = data;
        
        // Configuration de l'icône selon le type
        icon.innerHTML = '';
        let iconColor = '';
        
        switch(type) {
            case 'success':
                iconColor = 'bg-emerald-500/20 text-emerald-500';
                icon.innerHTML = '<i class="fas fa-check-circle text-2xl"></i>';
                break;
            case 'warning':
                iconColor = 'bg-amber-500/20 text-amber-500';
                icon.innerHTML = '<i class="fas fa-exclamation-triangle text-2xl"></i>';
                break;
            case 'error':
                iconColor = 'bg-rose-500/20 text-rose-500';
                icon.innerHTML = '<i class="fas fa-times-circle text-2xl"></i>';
                break;
            case 'info':
            default:
                iconColor = 'bg-blue-500/20 text-blue-500';
                icon.innerHTML = '<i class="fas fa-info-circle text-2xl"></i>';
        }
        
        icon.className = `w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${iconColor}`;
        modal.classList.remove('hidden');
    }

    function hidePopup() {
        document.getElementById('popup-modal').classList.add('hidden');
        popupCallback = null;
        popupData = null;
    }

    function popupConfirmAction() {
        if (popupCallback) popupCallback(popupData);
        hidePopup();
    }

    // ============================================
    // SYSTEME DE NOTIFICATIONS TOAST
    // ============================================
    function showToast(title, message, type = 'info') {
        const toast = document.getElementById('toast');
        const icon = document.getElementById('toast-icon');
        const titleEl = document.getElementById('toast-title');
        const messageEl = document.getElementById('toast-message');
        
        titleEl.innerText = title;
        messageEl.innerText = message;
        
        // Configuration de l'icône selon le type
        icon.innerHTML = '';
        let iconColor = '';
        
        switch(type) {
            case 'success':
                iconColor = 'bg-emerald-500/20 text-emerald-500';
                icon.innerHTML = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                iconColor = 'bg-rose-500/20 text-rose-500';
                icon.innerHTML = '<i class="fas fa-times-circle"></i>';
                break;
            default:
                iconColor = 'bg-blue-500/20 text-blue-500';
                icon.innerHTML = '<i class="fas fa-info-circle"></i>';
        }
        
        icon.className = `w-10 h-10 rounded-full flex items-center justify-center mr-3 ${iconColor}`;
        
        toast.classList.remove('translate-x-full');
        setTimeout(() => {
            toast.classList.add('translate-x-full');
        }, 3000);
    }

    // ============================================
    // FONCTIONS PRINCIPALES
    // ============================================

    function initApp() {
        const nav = document.getElementById('nav-menu');
        const userLabel = document.getElementById('user-role-label');
        const userName = document.getElementById('user-display-name');
        const userAvatar = document.getElementById('user-avatar');
        const mobileBtn = document.getElementById('mobile-cart-btn');

        // Charger les produits au démarrage
        fetchProducts();

        if (currentUser === 'admin') {
            userName.innerText = "Directeur Opulence";
            userLabel.innerText = "Administrateur";
            userAvatar.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin";
            mobileBtn.classList.add('hidden');
            nav.innerHTML = `
                <div onclick="navigate('admin-dash')" class="nav-btn sidebar-item flex items-center space-x-3 px-4 py-3 rounded-2xl cursor-pointer text-zinc-400">
                    <i class="fas fa-tachometer-alt w-5 text-center"></i>
                    <span class="font-bold text-sm">Tableau de Bord</span>
                </div>
                <div onclick="navigate('admin-inv')" class="nav-btn sidebar-item flex items-center space-x-3 px-4 py-3 rounded-2xl cursor-pointer text-zinc-400">
                    <i class="fas fa-boxes w-5 text-center"></i>
                    <span class="font-bold text-sm">Inventaire</span>
                </div>
                <div onclick="navigate('admin-orders')" class="nav-btn sidebar-item flex items-center space-x-3 px-4 py-3 rounded-2xl cursor-pointer text-zinc-400">
                    <i class="fas fa-clipboard-list w-5 text-center"></i>
                    <span class="font-bold text-sm">Commandes</span>
                </div>
                <div onclick="navigate('admin-finance')" class="nav-btn sidebar-item flex items-center space-x-3 px-4 py-3 rounded-2xl cursor-pointer text-zinc-400">
                    <i class="fas fa-chart-line w-5 text-center"></i>
                    <span class="font-bold text-sm">Comptabilité</span>
                </div>
                <div onclick="navigate('admin-menu')" class="nav-btn sidebar-item flex items-center space-x-3 px-4 py-3 rounded-2xl cursor-pointer text-zinc-400">
                    <i class="fas fa-edit w-5 text-center"></i>
                    <span class="font-bold text-sm">Editer Menu</span>
                </div>
            `;
            navigate('admin-dash');
        } else {
            userName.innerText = "Client Privilège";
            userLabel.innerText = "Visiteur";
            userAvatar.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";
            mobileBtn.classList.remove('hidden');
            nav.innerHTML = `
                <div onclick="navigate('visitor-home')" class="nav-btn sidebar-item flex items-center space-x-3 px-4 py-3 rounded-2xl cursor-pointer text-zinc-400">
                    <i class="fas fa-utensils w-5 text-center"></i>
                    <span class="font-bold text-sm">La Carte</span>
                </div>
                <div onclick="navigate('visitor-orders')" class="nav-btn sidebar-item flex items-center space-x-3 px-4 py-3 rounded-2xl cursor-pointer text-zinc-400">
                    <i class="fas fa-history w-5 text-center"></i>
                    <span class="font-bold text-sm">Mes Commandes</span>
                </div>
            `;
            navigate('visitor-home');
        }
        renderRightPanel();
    }

    function navigate(tab) {
        currentTab = tab;
        const display = document.getElementById('content-display');
        const title = document.getElementById('page-title');
        
        // Mise à jour de la navigation UI
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        // Trouver et activer l'onglet courant
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach((btn, index) => {
            if (currentUser === 'admin') {
                const adminTabs = ['admin-dash', 'admin-inv', 'admin-orders', 'admin-finance', 'admin-menu'];
                if (adminTabs[index] === tab) {
                    btn.classList.add('active');
                }
            } else {
                const visitorTabs = ['visitor-home', 'visitor-orders'];
                if (visitorTabs[index] === tab) {
                    btn.classList.add('active');
                }
            }
        });

        if(window.innerWidth < 1024) toggleSidebar(false);

        switch(tab) {
            case 'admin-dash': 
                title.innerText = "Tableau de Bord";
                renderAdminDash(display); break;
            case 'admin-inv': 
                title.innerText = "Inventaire";
                renderAdminInv(display); break;
            case 'admin-orders': 
                title.innerText = "Suivi Commandes";
                renderAdminOrders(display); break;
            case 'admin-finance': 
                title.innerText = "Comptabilité";
                renderAdminFinance(display); break;
            case 'admin-menu': 
                title.innerText = "Editer Menu";
                renderAdminMenuEdit(display); break;
            case 'visitor-home': 
                title.innerText = "Menu Gastronomique";
                renderVisitorHome(display); break;
            case 'visitor-orders': 
                title.innerText = "Mes Commandes";
                renderVisitorOrders(display); break;
        }
    }

    // ============================================
    // FONCTIONS DE RENDU
    // ============================================
    function renderVisitorHome(container) {
        container.innerHTML = `
            <div class="flex space-x-3 mb-10 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
                ${categories.map(cat => `
                    <button onclick="setCategory('${cat.id}')" class="px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap flex items-center ${currentCategory === cat.id ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'bg-zinc-900 text-zinc-500 hover:text-white'}">
                        <i class="${cat.icon} mr-2"></i>
                        ${cat.name}
                    </button>
                `).join('')}
            </div>
            <div id="product-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                <!-- Produits chargés dynamiquement -->
            </div>
        `;
        updateProductGrid();
    }

    function renderVisitorOrders(container) {
        if (visitorOrders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-20">
                    <div class="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-box-open text-4xl text-zinc-700"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-3">Aucune commande</h3>
                    <p class="text-zinc-500 max-w-md mx-auto">Vous n'avez pas encore passé de commande. Parcourez notre carte gastronomique pour découvrir nos spécialités.</p>
                    <button onclick="navigate('visitor-home')" class="mt-8 bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 py-4 rounded-2xl transition-all">
                        <i class="fas fa-utensils mr-2"></i> Voir la carte
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="lg:col-span-2">
                    <h3 class="text-lg font-bold text-white mb-6 flex items-center">
                        <i class="fas fa-history text-rose-500 mr-3"></i>
                        Historique de vos commandes
                    </h3>
                </div>
                
                ${visitorOrders.map(order => {
                    const statusColor = order.status === 'en cours' ? 'bg-rose-500/10 text-rose-500' : 
                                      order.status === 'terminé' ? 'bg-emerald-500/10 text-emerald-500' : 
                                      'bg-blue-500/10 text-blue-500';
                    
                    return `
                        <div class="glass p-8 rounded-[2.5rem] border-l-4 border-rose-500">
                            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                                <div>
                                    <span class="text-[10px] font-black text-zinc-600 bg-zinc-900 px-3 py-1 rounded-full uppercase mb-2 block">
                                        <i class="fas fa-hashtag mr-1"></i>${order.id} • <i class="far fa-clock mr-1"></i>${order.time}
                                    </span>
                                    <h4 class="text-xl font-black text-white mb-2">Commande ${order.id}</h4>
                                    <span class="${statusColor} text-[10px] font-black px-3 py-1 rounded-full uppercase">
                                        <i class="fas fa-circle mr-1" style="font-size: 6px;"></i> ${order.status}
                                    </span>
                                </div>
                                <span class="text-2xl font-black text-rose-500 mt-4 sm:mt-0">$${order.total.toFixed(2)}</span>
                            </div>
                            <div class="bg-zinc-900/50 rounded-2xl p-6 mb-6">
                                <p class="text-zinc-400 text-sm mb-2 font-semibold">
                                    <i class="fas fa-list mr-1"></i> Contenu de la commande:
                                </p>
                                <p class="text-white">${order.items}</p>
                            </div>
                            <div class="flex space-x-4">
                                <button onclick="reorder('${order.items.replace(/'/g, "\\'")}')" class="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 rounded-2xl transition-all">
                                    <i class="fas fa-redo mr-2"></i> Commander à nouveau
                                </button>
                                <button onclick="showOrderDetails('${order.id}')" class="flex-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-500 font-bold py-3 rounded-2xl transition-all">
                                    <i class="fas fa-info-circle mr-2"></i> Détails
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function updateProductGrid() {
        const grid = document.getElementById('product-grid');
        if(!grid) return;

        const filtered = menuData.filter(p => {
            const matchCat = currentCategory === 'all' || p.type === currentCategory;
            const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchCat && matchSearch;
        });

        grid.innerHTML = filtered.map(p => {
            const stockPercentage = (p.stock / p.stockMax) * 100;
            let stockColor = 'high';
            if (stockPercentage < 20) stockColor = 'low';
            else if (stockPercentage < 50) stockColor = 'medium';
            
            return `
                <div class="product-card glass p-5 rounded-[2.5rem] flex flex-col relative group">
                    <div class="h-48 w-full rounded-3xl overflow-hidden mb-5 relative bg-zinc-800">
                        <img src="${p.image}" class="w-full h-full object-cover" alt="${p.name}">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div class="absolute bottom-4 left-4">
                            <span class="bg-rose-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-widest">
                                ${p.type === 'repas' ? '<i class="fas fa-utensils mr-1"></i>' : 
                                  p.type === 'boisson' ? '<i class="fas fa-wine-glass mr-1"></i>' : 
                                  p.type === 'dessert' ? '<i class="fas fa-ice-cream mr-1"></i>' : 
                                  '<i class="fas fa-carrot mr-1"></i>'} ${p.type}
                            </span>
                        </div>
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-lg font-bold text-white group-hover:text-rose-500 transition-colors">${p.name}</h3>
                            <span class="text-rose-500 font-black text-lg">$${p.price.toFixed(2)}</span>
                        </div>
                        <p class="text-zinc-500 text-xs leading-relaxed mb-4 line-clamp-2">${p.desc}</p>
                        
                        <!-- Indicateur de stock -->
                        <div class="mb-6">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-[10px] font-bold text-zinc-500 uppercase">
                                    <i class="fas fa-box mr-1"></i> Stock
                                </span>
                                <span class="text-[10px] font-bold ${stockColor === 'low' ? 'text-rose-500' : stockColor === 'medium' ? 'text-amber-500' : 'text-emerald-500'}">
                                    ${p.stock} unités
                                </span>
                            </div>
                            <div class="w-full bg-zinc-800 rounded-full h-2">
                                <div class="inventory-bar ${stockColor} h-2 rounded-full" style="width: ${stockPercentage}%"></div>
                            </div>
                        </div>
                    </div>
                    <button onclick="addToCart(${p.id})" class="w-full bg-zinc-900 hover:bg-rose-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center transition-all group-hover:shadow-lg group-hover:shadow-rose-600/20 ${p.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}" ${p.stock === 0 ? 'disabled' : ''}>
                        ${p.stock === 0 ? '<i class="fas fa-times-circle mr-2"></i> Rupture de stock' : `
                            <i class="fas fa-plus-circle mr-2"></i> Ajouter
                        `}
                    </button>
                </div>
            `;
        }).join('');
    }

    function renderAdminDash(container) {
        const activeOrders = orders.filter(o => o.status === 'en cours').length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        
        container.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                <div class="glass p-8 rounded-[2.5rem] border-l-4 border-rose-500 shadow-xl">
                    <p class="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">
                        <i class="fas fa-money-bill-wave mr-1"></i> Chiffre d'Affaire
                    </p>
                    <h3 class="text-3xl font-black text-white">$${totalRevenue.toFixed(2)}</h3>
                </div>
                <div class="glass p-8 rounded-[2.5rem] border-l-4 border-emerald-500 shadow-xl">
                    <p class="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">
                        <i class="fas fa-clipboard-list mr-1"></i> Commandes Actives
                    </p>
                    <h3 class="text-3xl font-black text-white">${activeOrders}</h3>
                </div>
                <div class="glass p-8 rounded-[2.5rem] border-l-4 border-blue-500 shadow-xl">
                    <p class="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">
                        <i class="fas fa-boxes mr-1"></i> Produits en Stock
                    </p>
                    <h3 class="text-3xl font-black text-white">${menuData.length}</h3>
                </div>
                <div class="glass p-8 rounded-[2.5rem] border-l-4 border-amber-500 shadow-xl">
                    <p class="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">
                        <i class="fas fa-shopping-cart mr-1"></i> Commandes Total
                    </p>
                    <h3 class="text-3xl font-black text-white">${orders.length}</h3>
                </div>
            </div>

            <div class="glass rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl mb-10">
                <div class="px-8 py-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
                    <h3 class="font-bold text-white uppercase tracking-widest text-xs">
                        <i class="fas fa-history mr-2"></i> Commandes Récentes
                    </h3>
                    <button onclick="generateReport()" class="text-rose-500 font-bold text-xs uppercase hover:underline">
                        <i class="fas fa-file-export mr-1"></i> Générer Rapport
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="text-zinc-500 border-b border-zinc-800">
                            <tr>
                                <th class="px-8 py-4 font-bold uppercase text-[10px]">ID Commande</th>
                                <th class="px-8 py-4 font-bold uppercase text-[10px]">Client</th>
                                <th class="px-8 py-4 font-bold uppercase text-[10px]">Montant</th>
                                <th class="px-8 py-4 font-bold uppercase text-[10px]">Statut</th>
                                <th class="px-8 py-4 font-bold uppercase text-[10px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-900">
                            ${orders.map(order => {
                                const statusColor = order.status === 'en cours' ? 'bg-rose-500/10 text-rose-500' : 
                                                  order.status === 'terminé' ? 'bg-emerald-500/10 text-emerald-500' : 
                                                  'bg-blue-500/10 text-blue-500';
                                return `
                                    <tr>
                                        <td class="px-8 py-6 font-bold text-white">
                                            <i class="fas fa-hashtag mr-2 text-zinc-600"></i>${order.id}
                                        </td>
                                        <td class="px-8 py-6 font-bold text-white">${order.customer}</td>
                                        <td class="px-8 py-6 font-black text-rose-500">$${order.total.toFixed(2)}</td>
                                        <td class="px-8 py-6">
                                            <span class="${statusColor} text-[10px] font-black px-3 py-1 rounded-full uppercase">
                                                <i class="fas fa-circle mr-1" style="font-size: 6px;"></i> ${order.status}
                                            </span>
                                        </td>
                                        <td class="px-8 py-6">
                                            ${order.status === 'en cours' ? `
                                                <button onclick="finishOrder('${order.id}')" class="text-emerald-500 hover:text-emerald-400 font-bold text-xs uppercase">
                                                    <i class="fas fa-check-circle mr-1"></i> Terminer
                                                </button>
                                            ` : ''}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function renderAdminInv(container) {
        // Filtrer les produits selon la catégorie sélectionnée
        const filteredProducts = inventoryFilter === 'all' 
            ? menuData 
            : menuData.filter(item => item.type === inventoryFilter);
        
        container.innerHTML = `
            <div class="glass rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl">
                <div class="px-8 py-6 border-b border-zinc-800 bg-gradient-to-r from-zinc-900/50 to-transparent">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 class="text-xl font-bold text-white mb-1">Inventaire des produits</h3>
                            <p class="text-zinc-500 text-sm">Gestion du stock en temps réel</p>
                        </div>
                        <div class="flex items-center space-x-4">
                            <!-- Filtres de catégorie -->
                            <div class="flex space-x-2 overflow-x-auto pb-2">
                                ${categories.map(cat => `
                                    <button onclick="setInventoryFilter('${cat.id}')" class="px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${inventoryFilter === cat.id ? 'bg-rose-600 text-white' : 'bg-zinc-900 text-zinc-500 hover:text-white'}">
                                        <i class="${cat.icon} mr-2"></i>${cat.name}
                                    </button>
                                `).join('')}
                            </div>
                            <button onclick="showRestockAllPopup()" class="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center whitespace-nowrap">
                                <i class="fas fa-boxes mr-2"></i> Réapprovisionner tout
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-zinc-900/30 text-zinc-500 text-[10px] font-black uppercase border-b border-zinc-800">
                            <tr>
                                <th class="px-8 py-5">Produit</th>
                                <th class="px-8 py-5">Catégorie</th>
                                <th class="px-8 py-5 text-center">Stock</th>
                                <th class="px-8 py-5">Niveau</th>
                                <th class="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-900">
                            ${filteredProducts.map(item => {
                                const stockPercentage = (item.stock / item.stockMax) * 100;
                                let level = "Critique";
                                let levelColor = "text-rose-500";
                                let barColor = "low";
                                let bgColor = "bg-rose-500/10";
                                
                                if (stockPercentage >= 50) {
                                    level = "Élevé";
                                    levelColor = "text-emerald-500";
                                    barColor = "high";
                                    bgColor = "bg-emerald-500/10";
                                } else if (stockPercentage >= 20) {
                                    level = "Moyen";
                                    levelColor = "text-amber-500";
                                    barColor = "medium";
                                    bgColor = "bg-amber-500/10";
                                }
                                
                                // Icône de catégorie
                                const categoryIcon = item.type === 'repas' ? 'fas fa-utensils' :
                                                   item.type === 'boisson' ? 'fas fa-wine-glass' :
                                                   item.type === 'dessert' ? 'fas fa-ice-cream' : 'fas fa-carrot';
                                
                                return `
                                    <tr class="hover:bg-zinc-900/20 transition-colors">
                                        <td class="px-8 py-6">
                                            <div class="flex items-center space-x-4">
                                                <img src="${item.image}" class="w-14 h-14 rounded-2xl object-cover shadow-lg">
                                                <div>
                                                    <span class="font-bold text-white block">${item.name}</span>
                                                    <span class="text-zinc-500 text-xs">$${item.price.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-8 py-6">
                                            <div class="flex items-center">
                                                <i class="${categoryIcon} text-zinc-500 mr-2"></i>
                                                <span class="text-zinc-400 text-sm">${item.type}</span>
                                            </div>
                                        </td>
                                        <td class="px-8 py-6 text-center">
                                            <div class="inline-flex flex-col items-center">
                                                <span class="font-black text-xl ${levelColor}">${item.stock}</span>
                                                <span class="text-[10px] text-zinc-600">/ ${item.stockMax}</span>
                                            </div>
                                        </td>
                                        <td class="px-8 py-6">
                                            <div class="flex items-center">
                                                <div class="flex-1 mr-4">
                                                    <div class="flex justify-between text-[10px] font-bold text-zinc-500 mb-1">
                                                        <span>0</span>
                                                        <span>100%</span>
                                                    </div>
                                                    <div class="w-full bg-zinc-800 rounded-full h-2">
                                                        <div class="inventory-bar ${barColor} h-2 rounded-full" style="width: ${stockPercentage}%"></div>
                                                    </div>
                                                </div>
                                                <span class="${bgColor} ${levelColor} text-[10px] font-black px-3 py-1.5 rounded-full uppercase">
                                                    ${level}
                                                </span>
                                            </div>
                                        </td>
                                        <td class="px-8 py-6 text-right">
                                            <div class="flex justify-end space-x-2">
                                                <button onclick="showStockModal(${item.id})" class="w-10 h-10 flex items-center justify-center bg-zinc-900 hover:bg-blue-600 text-blue-500 hover:text-white rounded-xl transition-all" title="Gérer le stock">
                                                    <i class="fas fa-boxes"></i>
                                                </button>
                                                <button onclick="editMenuItem(${item.id})" class="w-10 h-10 flex items-center justify-center bg-zinc-900 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-xl transition-all" title="Modifier">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button onclick="restock(${item.id})" class="w-10 h-10 flex items-center justify-center bg-zinc-900 hover:bg-amber-600 text-amber-500 hover:text-white rounded-xl transition-all" title="Réapprovisionner">
                                                    <i class="fas fa-sync-alt"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="px-8 py-6 border-t border-zinc-800 bg-gradient-to-r from-transparent to-zinc-900/30">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="flex items-center space-x-6">
                            <div class="flex items-center">
                                <div class="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                                <span class="text-xs text-zinc-500">Élevé (>50%)</span>
                            </div>
                            <div class="flex items-center">
                                <div class="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                                <span class="text-xs text-zinc-500">Moyen (20-50%)</span>
                            </div>
                            <div class="flex items-center">
                                <div class="w-3 h-3 rounded-full bg-rose-500 mr-2"></div>
                                <span class="text-xs text-zinc-500">Critique (<20%)</span>
                            </div>
                        </div>
                        <div class="text-sm text-zinc-500">
                            <span class="font-bold text-white">${filteredProducts.length}</span> produits (${menuData.length} total)
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderAdminOrders(container) {
        const activeOrders = orders.filter(o => o.status === 'en cours');
        const completedOrders = orders.filter(o => o.status === 'terminé');
        
        container.innerHTML = `
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-10">
                <div class="space-y-6">
                    <h3 class="flex items-center text-rose-500 font-black uppercase tracking-[0.2em] text-xs px-2">
                        <i class="fas fa-fire mr-3 animate-pulse"></i>
                        Cuisines - En Cours (${activeOrders.length})
                    </h3>
                    ${activeOrders.length === 0 ? `
                        <div class="glass p-10 rounded-[2.5rem] text-center">
                            <i class="fas fa-clock text-4xl text-zinc-700 mx-auto mb-4"></i>
                            <p class="text-zinc-500">Aucune commande en cours</p>
                        </div>
                    ` : activeOrders.map(o => `
                        <div class="glass p-8 rounded-[2.5rem] border-l-4 border-rose-500 shadow-2xl relative overflow-hidden group">
                            <div class="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <span class="text-[10px] font-black text-zinc-600 bg-zinc-900 px-3 py-1 rounded-full uppercase mb-2 block">
                                        <i class="fas fa-hashtag mr-1"></i>${o.id} • <i class="far fa-clock mr-1"></i>${o.time}
                                    </span>
                                    <h4 class="text-xl font-black text-white">
                                        <i class="fas fa-user mr-2 text-zinc-600"></i>${o.customer}
                                    </h4>
                                </div>
                                <span class="text-2xl font-black text-rose-500">$${o.total.toFixed(2)}</span>
                            </div>
                            <p class="text-zinc-400 text-sm italic mb-8 relative z-10">
                                <i class="fas fa-list mr-2"></i>${o.items}
                            </p>
                            <button onclick="finishOrder('${o.id}')" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95">
                                <i class="fas fa-check-circle mr-2"></i> Finaliser la préparation
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div class="space-y-6">
                    <h3 class="flex items-center text-zinc-500 font-black uppercase tracking-[0.2em] text-xs px-2">
                        <i class="fas fa-history mr-3"></i> Historique - Terminé (${completedOrders.length})
                    </h3>
                    ${completedOrders.length === 0 ? `
                        <div class="glass p-10 rounded-[2.5rem] text-center opacity-60">
                            <i class="fas fa-box-open text-2xl text-zinc-700 mx-auto mb-4"></i>
                            <p class="text-zinc-500">Aucune commande terminée</p>
                        </div>
                    ` : `
                        <div class="opacity-60 space-y-4">
                            ${completedOrders.map(o => `
                                <div class="glass p-6 rounded-[2.5rem] border-l-4 border-zinc-700">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-[10px] font-bold text-zinc-600">
                                            <i class="fas fa-hashtag mr-1"></i>${o.id}
                                        </span>
                                        <span class="text-zinc-400 font-bold">$${o.total.toFixed(2)}</span>
                                    </div>
                                    <h4 class="font-bold text-white">
                                        <i class="fas fa-user mr-2 text-zinc-600"></i>${o.customer}
                                    </h4>
                                    <p class="text-zinc-600 text-xs">
                                        <i class="fas fa-list mr-1"></i>${o.items}
                                    </p>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    function renderAdminFinance(container) {
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const expenses = totalRevenue * 0.25; // 25% du revenue comme dépenses
        const profit = totalRevenue - expenses;
        
        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                <div class="glass p-10 rounded-[3rem] shadow-2xl bg-gradient-to-br from-zinc-900 to-[#0F0F11]">
                    <p class="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-4">
                        <i class="fas fa-balance-scale mr-2"></i> Balance d'Exploitation
                    </p>
                    <h3 class="text-6xl font-black text-white mb-8">$${profit.toFixed(2)}</h3>
                    <div class="flex space-x-6">
                        <div class="bg-emerald-500/10 p-4 rounded-3xl flex-1">
                            <p class="text-emerald-500 text-[10px] font-black uppercase">Revenus</p>
                            <p class="text-xl font-bold text-white">+$${totalRevenue.toFixed(2)}</p>
                        </div>
                        <div class="bg-rose-500/10 p-4 rounded-3xl flex-1">
                            <p class="text-rose-500 text-[10px] font-black uppercase">Dépenses</p>
                            <p class="text-xl font-bold text-white">-$${expenses.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <div class="glass p-10 rounded-[3rem] flex flex-col justify-center">
                    <h4 class="font-black text-zinc-500 uppercase text-xs mb-8 tracking-widest">
                        <i class="fas fa-chart-pie mr-2"></i> Répartition des Ventes
                    </h4>
                    <div class="space-y-6">
                        ${['Repas', 'Boissons', 'Desserts'].map((cat, i) => {
                            const percentages = [68, 22, 10];
                            const icons = ['fas fa-utensils', 'fas fa-wine-glass', 'fas fa-ice-cream'];
                            return `
                                <div>
                                    <div class="flex justify-between text-xs font-black uppercase mb-2">
                                        <span class="text-zinc-400">
                                            <i class="${icons[i]} mr-2"></i>${cat}
                                        </span>
                                        <span class="text-white">${percentages[i]}%</span>
                                    </div>
                                    <div class="h-1.5 bg-zinc-800 rounded-full">
                                        <div class="h-full bg-rose-600 rounded-full" style="width: ${percentages[i]}%"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
            
            <div class="glass p-8 rounded-[2.5rem]">
                <h3 class="text-lg font-bold text-white mb-6">
                    <i class="fas fa-chart-line mr-2"></i> Statistiques Mensuelles
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-zinc-900/50 p-6 rounded-2xl">
                        <p class="text-zinc-500 text-xs font-bold uppercase mb-2">Commandes</p>
                        <p class="text-2xl font-black text-white">${orders.length}</p>
                    </div>
                    <div class="bg-zinc-900/50 p-6 rounded-2xl">
                        <p class="text-zinc-500 text-xs font-bold uppercase mb-2">Panier Moyen</p>
                        <p class="text-2xl font-black text-white">$${orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'}</p>
                    </div>
                    <div class="bg-zinc-900/50 p-6 rounded-2xl">
                        <p class="text-zinc-500 text-xs font-bold uppercase mb-2">Clients Uniques</p>
                        <p class="text-2xl font-black text-white">${new Set(orders.map(o => o.customer)).size}</p>
                    </div>
                    <div class="bg-zinc-900/50 p-6 rounded-2xl">
                        <p class="text-zinc-500 text-xs font-bold uppercase mb-2">Taux de Rotation</p>
                        <p class="text-2xl font-black text-white">${menuData.reduce((sum, item) => sum + (item.stockMax - item.stock), 0)}</p>
                    </div>
                </div>
            </div>
        `;
    }

    function renderAdminMenuEdit(container) {
        container.innerHTML = `
            <div class="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h3 class="text-xl font-bold text-white mb-2">
                        <i class="fas fa-utensils mr-2"></i> Gestion du Menu
                    </h3>
                    <p class="text-zinc-500 text-sm font-medium italic">Gestion dynamique des actifs culinaires.</p>
                </div>
                <button onclick="showCreateProductForm()" class="bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl shadow-rose-900/30 transition-all flex items-center">
                    <i class="fas fa-plus-circle mr-2"></i> Nouveau Produit
                </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                ${menuData.map(item => {
                    const categoryIcon = item.type === 'repas' ? 'fas fa-utensils' :
                                      item.type === 'boisson' ? 'fas fa-wine-glass' :
                                      item.type === 'dessert' ? 'fas fa-ice-cream' : 'fas fa-carrot';
                    
                    return `
                        <div class="glass p-6 rounded-[2.5rem] group relative hover:border-rose-500/30 border border-transparent transition-all">
                            <div class="h-40 w-full rounded-2xl overflow-hidden mb-6 relative">
                                <img src="${item.image}" class="w-full h-full object-cover">
                                <div class="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
                                    <button onclick="editMenuItem(${item.id})" class="bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/30 transition-all">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </div>
                            </div>
                            <h4 class="text-white font-black text-lg mb-4 truncate">
                                <i class="${categoryIcon} mr-2 text-rose-500"></i>${item.name}
                            </h4>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <div class="bg-zinc-900 px-4 py-2 rounded-xl text-rose-500 font-black text-sm">
                                        $${item.price.toFixed(2)}
                                    </div>
                                    <span class="text-[10px] font-bold text-zinc-500 uppercase">${item.type}</span>
                                </div>
                                <div class="flex space-x-2">
                                    <button onclick="showStockModal(${item.id})" class="w-10 h-10 flex items-center justify-center bg-zinc-900 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all" title="Gérer stock">
                                        <i class="fas fa-boxes"></i>
                                    </button>
                                    <button onclick="editMenuItem(${item.id})" class="w-10 h-10 flex items-center justify-center bg-zinc-900 text-emerald-500 rounded-xl hover:bg-emerald-600 hover:text-white transition-all" title="Modifier">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteMenuItem(${item.id})" class="w-10 h-10 flex items-center justify-center bg-zinc-900 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all" title="Supprimer">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // ============================================
    // FONCTIONS D'ACTION
    // ============================================
    function setCategory(cat) {
        currentCategory = cat;
        renderVisitorHome(document.getElementById('content-display'));
    }

    function setInventoryFilter(filter) {
        inventoryFilter = filter;
        renderAdminInv(document.getElementById('content-display'));
    }

    function searchItems(val) {
        searchQuery = val;
        if(currentTab === 'visitor-home') updateProductGrid();
    }

    function addToCart(id) {
        const item = menuData.find(i => i.id === id);
        if(item.stock <= 0) {
            showToast('Rupture de stock', `${item.name} n'est plus disponible`, 'error');
            return;
        }
        
        cart.push({...item});
        renderRightPanel();
        updateMobileCartUI();
        
        // Animation de feedback
        const btn = document.getElementById('cart-count-badge');
        if(btn) {
            btn.classList.add('scale-125');
            setTimeout(() => btn.classList.remove('scale-125'), 200);
        }
        
        showToast('Ajouté au panier', `${item.name} a été ajouté à votre commande`, 'success');
    }

    function removeFromCart(idx) {
        const item = cart[idx];
        cart.splice(idx, 1);
        renderRightPanel();
        updateMobileCartUI();
        showToast('Retiré du panier', `${item.name} a été retiré de votre commande`, 'info');
    }

    function finishOrder(id) {
        const o = orders.find(x => x.id === id);
        if(o) {
            o.status = 'terminé';
            showToast('Commande terminée', `La commande ${id} a été marquée comme terminée`, 'success');
        }
        navigate('admin-orders');
        renderRightPanel();
    }

    function restock(id) {
        const i = menuData.find(x => x.id === id);
        if(i) {
            i.stock = i.stockMax;
            showToast('Réapprovisionné', `${i.name} a été réapprovisionné à ${i.stockMax} unités`, 'success');
            if (currentTab === 'admin-inv') {
                navigate('admin-inv');
            } else if (currentTab === 'admin-menu') {
                navigate('admin-menu');
            }
        }
    }

    function showRestockAllPopup() {
        showPopup('Réapprovisionner tout', 'Voulez-vous réapprovisionner tous les produits à leur stock maximum ?', 'warning', 'Réapprovisionner', 'Annuler', () => {
            menuData.forEach(item => {
                item.stock = item.stockMax;
            });
            showToast('Stock mis à jour', 'Tous les produits ont été réapprovisionnés', 'success');
            navigate('admin-inv');
        });
    }

    function showStockModal(id) {
        const item = menuData.find(x => x.id === id);
        if (!item) return;
        
        currentStockProductId = id;
        
        document.getElementById('stock-title').innerText = 'Gestion du Stock';
        document.getElementById('stock-product-name').innerText = item.name;
        document.getElementById('current-stock').innerText = item.stock;
        document.getElementById('max-stock').innerText = item.stockMax;
        document.getElementById('stock-input').value = item.stock;
        
        document.getElementById('stock-modal').classList.remove('hidden');
    }

    function hideStockModal() {
        document.getElementById('stock-modal').classList.add('hidden');
        currentStockProductId = null;
    }

    function adjustStock(amount) {
        const input = document.getElementById('stock-input');
        let currentValue = parseInt(input.value) || 0;
        let newValue = currentValue + amount;
        
        // Ne pas aller en dessous de 0
        if (newValue < 0) newValue = 0;
        
        input.value = newValue;
    }

    function saveStockChanges() {
        if (!currentStockProductId) return;
        
        const item = menuData.find(x => x.id === currentStockProductId);
        if (!item) return;
        
        const input = document.getElementById('stock-input');
        const newStock = parseInt(input.value) || 0;
        
        // Validation du stock
        if (newStock < 0) {
            showToast('Erreur', 'Le stock ne peut pas être négatif', 'error');
            return;
        }
        
        if (newStock > item.stockMax) {
            showPopup('Stock maximum dépassé', 
                     `Le stock maximum pour ${item.name} est de ${item.stockMax}. Voulez-vous augmenter le stock maximum à ${newStock}?`, 
                     'warning', 'Augmenter', 'Annuler', () => {
                item.stockMax = newStock;
                item.stock = newStock;
                hideStockModal();
                showToast('Stock mis à jour', `${item.name}: stock mis à ${newStock} unités`, 'success');
                
                // Recharger la vue actuelle
                if (currentTab === 'admin-inv') navigate('admin-inv');
                if (currentTab === 'admin-menu') navigate('admin-menu');
            });
        } else {
            item.stock = newStock;
            hideStockModal();
            showToast('Stock mis à jour', `${item.name}: stock ajusté à ${newStock} unités`, 'success');
            
            // Recharger la vue actuelle
            if (currentTab === 'admin-inv') navigate('admin-inv');
            if (currentTab === 'admin-menu') navigate('admin-menu');
        }
    }

    function showCreateProductForm() {
        document.getElementById('product-form-title').innerText = 'Nouveau Produit';
        document.getElementById('product-edit-id').value = '';
        document.getElementById('product-form').reset();
        document.getElementById('product-stock').value = 10;
        document.getElementById('product-stock-max').value = 50;
        document.getElementById('product-price').value = '';
        document.getElementById('product-form-modal').classList.remove('hidden');
    }

    function showEditProductForm(id) {
        const item = menuData.find(x => x.id === id);
        if (!item) return;
        
        document.getElementById('product-form-title').innerText = 'Modifier le Produit';
        document.getElementById('product-edit-id').value = item.id;
        document.getElementById('product-name').value = item.name;
        document.getElementById('product-type').value = item.type;
        document.getElementById('product-price').value = item.price;
        document.getElementById('product-stock').value = item.stock;
        document.getElementById('product-stock-max').value = item.stockMax;
        document.getElementById('product-desc').value = item.desc;
        document.getElementById('product-image').value = item.image;
        
        document.getElementById('product-form-modal').classList.remove('hidden');
    }

    function hideProductForm() {
        document.getElementById('product-form-modal').classList.add('hidden');
    }

    function editMenuItem(id) {
        showEditProductForm(id);
    }

    function deleteMenuItem(id) {
        const item = menuData.find(x => x.id === id);
        showPopup('Supprimer le produit', `Êtes-vous sûr de vouloir supprimer "${item.name}" du menu ?\n\nCette action est irréversible.`, 'error', 'Supprimer', 'Annuler', () => {
            const idx = menuData.findIndex(x => x.id === id);
            menuData.splice(idx, 1);
            showToast('Produit supprimé', `${item.name} a été retiré du menu`, 'success');
            navigate('admin-menu');
        });
    }

    // Gestion du formulaire produit
    // Note: We need to attach this event listener after DOM load or here if script is defer
    // Moved to bottom or DOMContentLoaded

    function reorder(items) {
        showPopup('Commander à nouveau', 'Voulez-vous ajouter ces articles à votre panier actuel ?', 'info', 'Ajouter au panier', 'Annuler', () => {
            const itemNames = items.split(',').map(item => item.trim());
            itemNames.forEach(itemName => {
                const item = menuData.find(m => itemName.includes(m.name));
                if (item && item.stock > 0) {
                    cart.push({...item});
                }
            });
            renderRightPanel();
            updateMobileCartUI();
            showToast('Articles ajoutés', 'Les articles ont été ajoutés à votre panier', 'success');
        });
    }

    function showOrderDetails(orderId) {
        const order = visitorOrders.find(o => o.id === orderId);
        if (order) {
            showPopup(`Détails de la commande ${orderId}`, 
                     `Statut: ${order.status}\nHeure: ${order.time}\nTotal: $${order.total.toFixed(2)}\n\nArticles:\n${order.items.replace(/, /g, '\n')}`, 
                     'info', 'Fermer', '', () => {});
            document.getElementById('popup-confirm').innerText = 'Fermer';
            document.getElementById('popup-cancel').classList.add('hidden');
        }
    }

    function generateReport() {
        showPopup('Générer Rapport', 'Voulez-vous générer un rapport détaillé des activités ?', 'info', 'Générer', 'Annuler', () => {
            showToast('Rapport généré', 'Le rapport a été généré avec succès', 'success');
        });
    }

    function confirmOrder() {
        if(cart.length === 0) {
            showToast('Panier vide', 'Votre panier est vide', 'error');
            return;
        }
        
        const total = cart.reduce((a, b) => a + b.price, 0);
        
        showPopup('Confirmer la commande', 
                 `Vous êtes sur le point de passer commande pour $${total.toFixed(2)}.\n\n${cart.length} article(s) seront envoyés en cuisine.`, 
                 'info', 'Confirmer', 'Annuler', () => {
            const newId = "#OP-" + Math.floor(1000 + Math.random() * 9000);
            const newOrder = {
                id: newId,
                customer: "Client Privilège",
                items: cart.map(i => `${i.name} x1`).join(', '),
                total: total,
                status: 'en cours',
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
            };
            
            orders.unshift(newOrder);
            visitorOrders.unshift({...newOrder});

            // Déduction du stock
            cart.forEach(item => {
                const m = menuData.find(x => x.id === item.id);
                if(m && m.stock > 0) m.stock--;
            });

            showToast('Commande confirmée', `Votre commande ${newId} a été envoyée en cuisine !`, 'success');
            cart = [];
            renderRightPanel();
            updateMobileCartUI();
            if(window.innerWidth < 1024) toggleMobileCart();
            
            if (currentTab === 'visitor-orders') {
                navigate('visitor-orders');
            }
            
            if (currentUser === 'admin') {
                renderRightPanel();
            }
        });
    }

    // ============================================
    // RENDU DU PANEL LATÉRAL
    // ============================================
    function renderRightPanel() {
        const panel = document.getElementById('right-panel');
        if(!panel) return;

        if (currentUser === 'visitor') {
            const total = cart.reduce((acc, curr) => acc + curr.price, 0);
            panel.innerHTML = `
                <div class="h-full flex flex-col">
                    <h3 class="text-xl font-bold text-white mb-8 flex items-center">
                        <i class="fas fa-shopping-cart mr-3"></i> Mon Panier 
                        <span class="ml-3 bg-rose-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">${cart.length}</span>
                    </h3>
                    <div class="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                        ${cart.length === 0 ? `
                            <div class="text-center py-20">
                                <i class="fas fa-shopping-cart text-4xl text-zinc-800 mb-4"></i>
                                <p class="text-zinc-600 text-xs uppercase tracking-widest font-bold">Votre panier est vide</p>
                            </div>
                        ` : cart.map((item, idx) => `
                            <div class="flex items-center space-x-4 bg-zinc-900/50 p-4 rounded-[1.5rem] border border-zinc-800 hover:border-zinc-700 transition-all group">
                                <img src="${item.image}" class="w-12 h-12 rounded-xl object-cover">
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-bold text-white truncate">${item.name}</p>
                                    <p class="text-rose-500 font-black text-xs">$${item.price.toFixed(2)}</p>
                                </div>
                                <button onclick="removeFromCart(${idx})" class="text-zinc-700 hover:text-rose-500">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="pt-8 border-t border-zinc-800 mt-6">
                        <div class="flex justify-between items-end mb-6">
                            <span class="text-zinc-500 text-xs font-black uppercase">Total</span>
                            <span class="text-3xl font-black text-white">$${total.toFixed(2)}</span>
                        </div>
                        <button onclick="confirmOrder()" class="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-rose-900/20 transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" ${cart.length === 0 ? 'disabled' : ''}>
                            <i class="fas fa-check-circle mr-2"></i> CONFIRMER LA COMMANDE
                        </button>
                        <p class="text-center text-zinc-600 text-xs mt-4">
                            <i class="fas fa-history mr-1"></i> ${visitorOrders.length} commande(s) dans votre historique
                        </p>
                    </div>
                </div>
            `;
        } else {
            const activeOrdersCount = orders.filter(o => o.status === 'en cours').length;
            const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
            const lowStockItems = menuData.filter(item => item.stock < 10);
            
            panel.innerHTML = `
                <div class="flex flex-col h-full">
                    <h3 class="text-xl font-bold text-white mb-8">
                        <i class="fas fa-chart-bar mr-2"></i> Tableau de Performance
                    </h3>
                    <div class="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <div class="bg-gradient-to-br from-rose-600 to-rose-700 p-8 rounded-[2.5rem] shadow-xl text-white">
                            <p class="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">
                                <i class="fas fa-clipboard-list mr-1"></i> Commandes Actives
                            </p>
                            <h4 class="text-5xl font-black">${activeOrdersCount}</h4>
                        </div>
                        
                        <div class="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2rem]">
                            <h5 class="text-zinc-500 text-[10px] font-black uppercase mb-4 tracking-widest">
                                <i class="fas fa-chart-line mr-1"></i> Statistiques Rapides
                            </h5>
                            <div class="space-y-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-bold text-white">Revenu Total</span>
                                    <span class="text-xs text-rose-500 font-black">$${totalRevenue.toFixed(2)}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-bold text-white">Produits en Stock</span>
                                    <span class="text-xs text-rose-500 font-black">${menuData.length}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-bold text-white">Commandes Total</span>
                                    <span class="text-xs text-rose-500 font-black">${orders.length}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2rem]">
                            <h5 class="text-zinc-500 text-[10px] font-black uppercase mb-4 tracking-widest">
                                <i class="fas fa-exclamation-triangle mr-1"></i> Alertes Stock
                            </h5>
                            <div class="space-y-3">
                                ${lowStockItems.map(item => `
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs font-bold text-white truncate">
                                            <i class="fas fa-box mr-1 text-rose-500"></i>${item.name}
                                        </span>
                                        <span class="text-xs text-rose-500 font-black">${item.stock} restant</span>
                                    </div>
                                `).join('')}
                                ${lowStockItems.length === 0 ? 
                                    '<p class="text-xs text-zinc-500 text-center"><i class="fas fa-check-circle mr-1 text-emerald-500"></i> Aucune alerte stock</p>' : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // ============================================
    // FONCTIONS UI HELPER
    // ============================================
    function toggleSidebar(show = null) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const isShowing = show !== null ? !show : sidebar.classList.contains('mobile-sidebar-show');
        
        if(!isShowing) {
            sidebar.classList.add('mobile-sidebar-show');
            sidebar.classList.remove('mobile-sidebar-hidden');
            overlay.classList.remove('hidden');
        } else {
            sidebar.classList.remove('mobile-sidebar-show');
            sidebar.classList.add('mobile-sidebar-hidden');
            overlay.classList.add('hidden');
        }
    }

    function toggleMobileCart() {
        const drawer = document.getElementById('mobile-cart-drawer');
        const isShowing = !drawer.classList.contains('translate-x-full');
        if(!isShowing) {
            drawer.classList.remove('translate-x-full');
            updateMobileCartUI();
        } else {
            drawer.classList.add('translate-x-full');
        }
    }

    function updateMobileCartUI() {
        const count = document.getElementById('cart-count-badge');
        const list = document.getElementById('mobile-cart-list');
        const footer = document.getElementById('mobile-cart-footer');
        
        count.innerText = cart.length;

        if (cart.length === 0) {
            list.innerHTML = `<p class="text-center text-zinc-600 mt-20"><i class="fas fa-shopping-cart text-2xl mb-4 block"></i>Panier vide</p>`;
            footer.innerHTML = "";
        } else {
            list.innerHTML = cart.map((item, idx) => `
                <div class="flex items-center space-x-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                    <img src="${item.image}" class="w-10 h-10 rounded-xl object-cover">
                    <div class="flex-1">
                        <p class="text-sm font-bold text-white">${item.name}</p>
                        <p class="text-rose-500 text-xs">$${item.price.toFixed(2)}</p>
                    </div>
                    <button onclick="removeFromCart(${idx})" class="text-zinc-600 hover:text-rose-500">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');

            const total = cart.reduce((a, b) => a + b.price, 0);
            footer.innerHTML = `
                <div class="flex justify-between items-center mb-6">
                    <span class="text-zinc-500 text-xs font-black uppercase">Total</span>
                    <span class="text-2xl font-black text-white">$${total.toFixed(2)}</span>
                </div>
                <button onclick="confirmOrder()" class="w-full bg-rose-600 text-white font-black py-4 rounded-xl shadow-lg">
                    <i class="fas fa-check-circle mr-2"></i> COMMANDER
                </button>
            `;
        }
    }

    // ============================================
    // INITIALISATION
    // ============================================
    window.addEventListener('resize', () => {
        if(window.innerWidth >= 1024) toggleSidebar(false);
    });

    // Initialisation du formulaire produit
    document.addEventListener('DOMContentLoaded', function() {
        const productForm = document.getElementById('product-form');
        if (productForm) {
            productForm.addEventListener('submit', function(e) {
                e.preventDefault();
                // La logique est gérée par le handler existant qui utilise les variables globales
                // Mais nous devons nous assurer que la fonction est accessible.
                // Ici, nous redéfinissons le comportement car le handler original était inline ou global.
                // Vérifions si le code précédent (dans auth.js ou api.js) n'interfère pas.
                // Le handler dans le code original était:
                /*
                document.getElementById('product-form').addEventListener('submit', function(e) { ... })
                */
               // Je vais inclure la logique ici.
               
                const id = document.getElementById('product-edit-id').value;
                const name = document.getElementById('product-name').value;
                const type = document.getElementById('product-type').value;
                const price = parseFloat(document.getElementById('product-price').value);
                const stock = parseInt(document.getElementById('product-stock').value) || 0;
                const stockMax = parseInt(document.getElementById('product-stock-max').value) || 50;
                const desc = document.getElementById('product-desc').value;
                const image = document.getElementById('product-image').value || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80';
                
                // Validation
                if (!name || !price) {
                    showToast('Erreur', 'Veuillez remplir tous les champs obligatoires', 'error');
                    return;
                }
                
                if (id) {
                    // Modification d'un produit existant
                    const item = menuData.find(x => x.id === parseInt(id));
                    if (item) {
                        item.name = name;
                        item.type = type;
                        item.price = price;
                        item.stock = stock;
                        item.stockMax = stockMax;
                        item.desc = desc;
                        item.image = image;
                        
                        showToast('Produit modifié', `${name} a été mis à jour`, 'success');
                    }
                } else {
                    // Création d'un nouveau produit
                    const newId = menuData.length > 0 ? Math.max(...menuData.map(p => p.id)) + 1 : 1;
                    const newProduct = {
                        id: newId,
                        name,
                        type,
                        price,
                        stock,
                        stockMax,
                        desc,
                        image
                    };
                    
                    menuData.push(newProduct);
                    showToast('Produit ajouté', `${name} a été ajouté au menu`, 'success');
                }
                
                hideProductForm();
                
                // Recharger la vue actuelle
                if (currentTab === 'admin-menu') navigate('admin-menu');
                if (currentTab === 'admin-inv') navigate('admin-inv');
                if (currentTab === 'visitor-home') updateProductGrid();
            });
        }
    });
