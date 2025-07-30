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
    cartButtonContainer.innerHTML = '';
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
    // ...
}
export function setButtonLoadingState(button) {
    // ...
}
export function revertButtonLoadingState(button) {
    // ...
}

// --- RENDERIZADO DE PÁGINAS ---
export function renderHomePage(user, promotions) {
    const container = document.getElementById('inicio');
    container.innerHTML = '';
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
    // ... (resto de la lógica de renderHomePage)
    container.append(welcomeSection);
    lucide.createIcons();
}

export function renderHomePageSkeleton() {
    // ...
}
