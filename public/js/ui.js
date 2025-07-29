// public/js/ui.js
// El "Pintor" de la aplicación. Se encarga de todo lo visual.

// --- HELPER: Creador de elementos del DOM ---
export function createElement(tag, { classes = [], text = '', attrs = {}, children = [], innerHTML = '' } = {}) {
    const el = document.createElement(tag);
    if (classes.length) el.className = classes.join(' ');
    if (text) el.textContent = text;
    if (innerHTML) el.innerHTML = innerHTML;
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

// --- RENDERIZADO DE AUTENTICACIÓN ---
export function renderAuthWall(view = 'login') {
    const container = document.getElementById('auth-container');
    container.innerHTML = ''; // Limpiar antes de dibujar

    let formContent;
    if (view === 'login') {
        formContent = [
            createElement('h2', { classes: ['font-lilita', 'text-4xl', 'text-center', 'text-white', 'mb-6'], text: 'BIENVENIDO' }),
            createElement('div', { classes: ['space-y-4'], children: [
                createElement('input', { attrs: { id: 'login-email', type: 'email', placeholder: 'Correo electrónico' }, classes: ['w-full', 'bg-brand-darker', 'p-3', 'rounded-lg', 'text-white', 'border-2', 'border-gray-600', 'focus:border-brand-red', 'focus:outline-none'] }),
                createElement('input', { attrs: { id: 'login-password', type: 'password', placeholder: 'Contraseña' }, classes: ['w-full', 'bg-brand-darker', 'p-3', 'rounded-lg', 'text-white', 'border-2', 'border-gray-600', 'focus:border-brand-red', 'focus:outline-none'] })
            ]}),
            createElement('button', { attrs: { id: 'login-button', 'data-action': 'handleLogin' }, classes: ['w-full', 'gradient-dragon-red', 'text-white', 'font-bold', 'py-3', 'rounded-lg', 'mt-6', 'relative'], children: [
                createElement('span', { classes: ['btn-text'], text: 'Ingresar' }),
                createElement('span', { classes: ['btn-loader', 'hidden', 'absolute', 'inset-0', 'flex', 'items-center', 'justify-center'], innerHTML: '<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>' })
            ]}),
            createElement('div', { classes: ['text-center', 'mt-4'], children: [
                createElement('button', { attrs: { 'data-action': 'renderAuthWall', 'data-view': 'forgot' }, classes: ['text-sm', 'text-gray-400', 'hover:text-brand-red'], text: '¿Olvidaste tu contraseña?' })
            ]}),
            createElement('p', { classes: ['text-center', 'text-gray-400', 'mt-6'], text: '¿No tienes cuenta? ', children: [
                createElement('button', { attrs: { 'data-action': 'renderAuthWall', 'data-view': 'register' }, classes: ['font-bold', 'text-brand-red', 'hover:underline'], text: 'Regístrate' })
            ]})
        ];
    } else if (view === 'register') {
        // Lógica para crear el formulario de registro
        formContent = [
            createElement('h2', { classes: ['font-lilita', 'text-4xl', 'text-center', 'text-white', 'mb-6'], text: 'CREA TU CUENTA' }),
            createElement('div', { classes: ['space-y-4'], children: [
                createElement('input', { attrs: { id: 'register-name', type: 'text', placeholder: 'Nombre' }, classes: ['w-full', 'bg-brand-darker', 'p-3', 'rounded-lg', 'text-white', 'border-2', 'border-gray-600', 'focus:border-brand-red', 'focus:outline-none'] }),
                createElement('input', { attrs: { id: 'register-email', type: 'email', placeholder: 'Correo electrónico' }, classes: ['w-full', 'bg-brand-darker', 'p-3', 'rounded-lg', 'text-white', 'border-2', 'border-gray-600', 'focus:border-brand-red', 'focus:outline-none'] }),
                createElement('input', { attrs: { id: 'register-password', type: 'password', placeholder: 'Contraseña' }, classes: ['w-full', 'bg-brand-darker', 'p-3', 'rounded-lg', 'text-white', 'border-2', 'border-gray-600', 'focus:border-brand-red', 'focus:outline-none'] })
            ]}),
            createElement('button', { attrs: { id: 'register-button', 'data-action': 'handleRegister' }, classes: ['w-full', 'gradient-dragon-red', 'text-white', 'font-bold', 'py-3', 'rounded-lg', 'mt-6', 'relative'], children: [
                createElement('span', { classes: ['btn-text'], text: 'Registrarme' }),
                createElement('span', { classes: ['btn-loader', 'hidden', 'absolute', 'inset-0', 'flex', 'items-center', 'justify-center'], innerHTML: '<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>' })
            ]}),
            createElement('p', { classes: ['text-center', 'text-gray-400', 'mt-6'], text: '¿Ya tienes cuenta? ', children: [
                createElement('button', { attrs: { 'data-action': 'renderAuthWall', 'data-view': 'login' }, classes: ['font-bold', 'text-brand-red', 'hover:underline'], text: 'Ingresa aquí' })
            ]})
        ];
    } else { // forgot password
        // Lógica para crear el formulario de olvidé contraseña
        formContent = [
            // ...
        ];
    }
    
    const formContainer = createElement('div', {
        classes: ['w-full', 'max-w-sm', 'bg-brand-dark', 'p-8', 'rounded-2xl', 'shadow-2xl', 'border-2', 'border-gray-700'],
        children: formContent
    });
    
    container.appendChild(formContainer);
}

// --- COMPONENTES DE UI ---
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
    
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 10);

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
