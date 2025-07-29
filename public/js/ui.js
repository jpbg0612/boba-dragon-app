// public/js/ui.js
// El "Pintor" de la aplicación. Se encarga de todo lo visual.

import * as state from './state.js'; // Necesario para algunas funciones que aún no hemos refactorizado

// --- HELPER: Creador de elementos del DOM ---
export function createElement(tag, { classes = [], text = '', attrs = {}, children = [] } = {}) {
    const el = document.createElement(tag);
    if (classes.length) el.className = classes.join(' ');
    if (text) el.textContent = text;
    for (const key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
    if (children.length) el.append(...children);
    return el;
}

// --- NAVEGACIÓN ---
export const navigateTo = (sectionId) => {
    document.querySelectorAll('.seccion').forEach(section => {
        section.style.display = 'none';
    });
    const section = document.getElementById(sectionId);
    if(section) {
        section.style.display = 'block';
    }
    window.scrollTo(0, 0);
    updateActiveNav(sectionId);
};

export const updateActiveNav = (activeSection) => {
    const navMapping = {
        'inicio': 'renderHomePage',
        'menu': 'renderMenuPage',
        'creaciones': 'renderCommunityPage',
        'recompensas': 'renderRewardsPage',
        'perfil': 'handleProfileClick',
        'mis-pedidos': 'handleProfileClick',
        'admin-panel': 'handleProfileClick'
    };
    document.querySelectorAll('.nav-item').forEach(item => {
        const action = item.dataset.action;
        if (Object.values(navMapping).includes(action)) {
            item.classList.remove('text-brand-red');
            item.classList.add('text-gray-400');
        }
    });
    const activeAction = navMapping[activeSection] || 'handleProfileClick';
    const activeButton = document.querySelector(`.nav-item[data-action="${activeAction}"]`);
    if (activeButton) {
        activeButton.classList.remove('text-gray-400');
        activeButton.classList.add('text-brand-red');
    }
};

// --- COMPONENTES DE UI ---

/**
 * Actualiza el botón del carrito basándose en el carrito que se le pasa.
 * @param {Array} cart - El array de productos en el carrito.
 */
export function updateCartButton(cart) {
    const cartButtonContainer = document.getElementById('cart-button-container');
    cartButtonContainer.innerHTML = ''; // Limpiar siempre

    if (cart && cart.length > 0) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const button = createElement('button', {
            classes: ['gradient-dragon-red', 'text-white', 'font-bold', 'rounded-full', 'shadow-lg', 'p-4', 'flex', 'items-center', 'justify-center', 'animate-pulse'],
            attrs: { 'data-action': 'openCartModal' },
            children: [
                createElement('i', { attrs: { 'data-lucide': 'shopping-cart' } }),
                createElement('span', {
                    classes: ['absolute', '-top-1', '-right-1', 'bg-white', 'text-brand-red', 'rounded-full', 'h-6', 'w-6', 'flex', 'items-center', 'justify-center', 'text-xs', 'font-extrabold'],
                    text: totalItems
                })
            ]
        });
        cartButtonContainer.appendChild(button);
        lucide.createIcons();
    }
}

// --- SISTEMA DE NOTIFICACIONES Y ESTADOS DE CARGA ---
export function showNotification(message, isError = false) {
    const containerId = 'notification-container';
    let container = document.getElementById(containerId);
    if (!container) {
        container = createElement('div', {
            attrs: { id: containerId },
            classes: ['fixed', 'top-5', 'right-5', 'z-50', 'space-y-3']
        });
        document.body.appendChild(container);
    }
    const bgColor = isError ? 'bg-red-600' : 'bg-green-600';
    const icon = isError ? 'x-circle' : 'check-circle';
    const notification = createElement('div', {
        classes: [
            'flex', 'items-center', 'p-4', 'rounded-lg', 'shadow-lg', 'text-white', 'transform', 'transition-all', 'duration-300', 'ease-out', 'translate-x-full'
        ],
        children: [
            createElement('i', { attrs: { 'data-lucide': icon }, classes: ['mr-3'] }),
            createElement('span', { text: message })
        ]
    });
    container.appendChild(notification);
    lucide.createIcons();
    
    // Animar la entrada
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 10);

    // Animar la salida y eliminar
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        notification.addEventListener('transitionend', () => {
            notification.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        });
    }, 4000);
}

export function setButtonLoadingState(button) {
    if (!button) return;
    const originalText = button.querySelector('.btn-text')?.textContent || button.textContent;
    button.dataset.originalText = originalText;
    button.disabled = true;
    const spinner = `<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>`;
    if (button.querySelector('.btn-text')) {
         button.querySelector('.btn-text').classList.add('hidden');
         const loader = button.querySelector('.btn-loader');
         if(loader) loader.classList.remove('hidden');
    } else {
        button.innerHTML = spinner;
    }
}

export function revertButtonLoadingState(button) {
    if (!button) return;
    const originalText = button.dataset.originalText;
    button.disabled = false;
    if (button.querySelector('.btn-text')) {
        button.querySelector('.btn-text').classList.remove('hidden');
        const loader = button.querySelector('.btn-loader');
        if(loader) loader.classList.add('hidden');
    } else {
        button.textContent = originalText;
    }
}

// --- RENDERIZADO DE PÁGINAS ---
export function renderHomePage(user, promotions) {
    const container = document.getElementById('inicio');
    container.innerHTML = ''; // Limpiar contenido anterior

    const welcomeSection = createElement('div', {
        classes: ['text-center', 'mb-12'],
        children: [
            createElement('h2', {
                classes: ['font-lilita', 'text-4xl', 'md:text-5xl', 'text-white', 'mb-2'],
                text: `¡Hola, ${user ? user.nombre.split(' ')[0] : 'Dragón'}!`
            }),
            createElement('p', {
                classes: ['text-lg', 'text-gray-400'],
                text: '¿Listo para tu dosis de sabor?'
            })
        ]
    });

    let promoSection = createElement('div');
    if (promotions && promotions.length > 0) {
        // Lógica para crear el carrusel de promociones
    }

    const quickAccessSection = createElement('div', {
        children: [
            createElement('h3', { classes: ['font-lilita', 'text-3xl', 'text-white', 'mb-4'], text: 'Acceso Rápido' }),
            createElement('div', {
                classes: ['grid', 'grid-cols-2', 'gap-4'],
                children: [
                    createElement('button', {
                        classes: ['bg-brand-dark', 'p-6', 'rounded-2xl', 'flex', 'flex-col', 'items-center', 'justify-center', 'card-hover', 'border-2', 'border-gray-700'],
                        attrs: { 'data-action': 'renderMenuPage' },
                        children: [
                            createElement('i', { attrs: { 'data-lucide': 'cup-soda' }, classes: ['w-10', 'h-10', 'text-brand-red', 'mb-2'] }),
                            createElement('span', { classes: ['font-bold', 'text-white'], text: 'Ver Menú' })
                        ]
                    }),
                    createElement('button', {
                        classes: ['bg-brand-dark', 'p-6', 'rounded-2xl', 'flex', 'flex-col', 'items-center', 'justify-center', 'card-hover', 'border-2', 'border-gray-700'],
                        attrs: { 'data-action': 'renderMyOrdersPage' },
                        children: [
                            createElement('i', { attrs: { 'data-lucide': 'receipt' }, classes: ['w-10', 'h-10', 'text-brand-red', 'mb-2'] }),
                            createElement('span', { classes: ['font-bold', 'text-white'], text: 'Mis Pedidos' })
                        ]
                    })
                ]
            })
        ]
    });

    container.append(welcomeSection, promoSection, quickAccessSection);
    lucide.createIcons();
}

export function renderHomePageSkeleton() {
    const container = document.getElementById('inicio');
    container.innerHTML = ''; // Limpiar
    const welcomeSection = createElement('div', {
        classes: ['text-center', 'mb-12'],
        children: [
            createElement('div', { classes: ['skeleton', 'h-12', 'w-3/4', 'mx-auto', 'mb-2'] }),
            createElement('div', { classes: ['skeleton', 'h-6', 'w-1/2', 'mx-auto'] })
        ]
    });
    const promoSection = createElement('div', {
        classes: ['mb-12'],
        children: [
            createElement('div', { classes: ['skeleton', 'h-8', 'w-1/3', 'mb-4'] }),
            createElement('div', { classes: ['skeleton', 'h-64', 'w-full', 'rounded-2xl'] })
        ]
    });
    const quickAccessSection = createElement('div', {
        children: [
            createElement('div', { classes: ['skeleton', 'h-8', 'w-1/3', 'mb-4'] }),
            createElement('div', {
                classes: ['grid', 'grid-cols-2', 'gap-4'],
                children: [
                    createElement('div', { classes: ['skeleton', 'h-28', 'w-full'] }),
                    createElement('div', { classes: ['skeleton', 'h-28', 'w-full'] })
                ]
            })
        ]
    });
    container.append(welcomeSection, promoSection, quickAccessSection);
}
