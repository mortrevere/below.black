!norender
const availableSections = new Set(['home', 'sceno', 'vj', 'events', 'vinyl']);
const initialSection = availableSections.has(window.location.hash ? window.location.hash.slice(1) : 'home')
    ? (window.location.hash ? window.location.hash.slice(1) : 'home')
    : 'home';

window.belowState = {
    currentSection: initialSection,
    newLines: true
};

function setActiveSection(section, updateHash = true) {
    if (!availableSections.has(section)) {
        section = 'home';
    }
    window.belowState.currentSection = section;
    window.belowState.newLines = section === 'home';

    document.querySelectorAll('#app-below > [data-section]').forEach(element => {
        element.hidden = element.dataset.section !== section;
    });

    const activeSection = document.querySelector(`#app-below > [data-section="${section}"]`);
    const app = document.getElementById('app-below');
    if (activeSection && app && getComputedStyle(app).display !== 'none') {
        loadLazyEmbeds(activeSection);
    }

    document.querySelectorAll('nav li[data-section]').forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });

    if (updateHash) {
        history.replaceState(
            null,
            '',
            section === 'home' ? `${location.pathname}${location.search}` : `${location.pathname}${location.search}#${section}`
        );
    }

    const canvas = document.getElementById('c');
    if (canvas) {
        canvas.style.display = 'block';
    }
}

function loadLazyEmbeds(container) {
    container.querySelectorAll('iframe[data-src]').forEach(iframe => {
        if (!iframe.src) {
            iframe.src = iframe.dataset.src;
        }
    });
}

function initNavigation() {
    const logo = document.getElementById('logo');
    if (logo) {
        logo.addEventListener('click', () => setActiveSection('home'));
    }

    document.querySelectorAll('nav li[data-section]').forEach(item => {
        item.addEventListener('click', () => setActiveSection(item.dataset.section));
    });

    window.addEventListener('hashchange', () => {
        const nextSection = window.location.hash ? window.location.hash.slice(1) : 'home';
        setActiveSection(availableSections.has(nextSection) ? nextSection : 'home', false);
    });
}

function initCarousels() {
    document.querySelectorAll('carousel').forEach(node => {
        const count = parseInt(node.getAttribute('n') || '0', 10);
        const src = node.getAttribute('src');
        if (!count || !src) {
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'carousel-wrapper';

        const carousel = document.createElement('div');
        carousel.className = 'carousel';

        const img = document.createElement('img');
        const frames = Array.from({ length: count }, (_, i) => `./media/carousel/${src}/${i}.jpg`);
        let index = 0;

        img.src = frames[index];
        carousel.appendChild(img);
        wrapper.appendChild(carousel);
        node.replaceWith(wrapper);

        index = (index + 1) % frames.length;
        setInterval(() => {
            img.src = frames[index];
            index = (index + 1) % frames.length;
        }, 1500 + Math.floor(Math.random() * 2000));
    });
}

function initRandomScenoGallery() {
    const randomGallery = document.querySelector('#sceno .sceno-random-gallery');
    if (!randomGallery) {
        return;
    }

    function renderRandomScenoGallery() {
        const sources = Array.from(document.querySelectorAll('#sceno > .sceno-img-wrapper:not(.sceno-random-img-wrapper) img'));
        if (!sources.length) {
            return;
        }

        randomGallery.innerHTML = '';

        const shuffled = sources.slice();
        for (let i = shuffled.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        shuffled.slice(0, 3).forEach(source => {
            const wrapper = document.createElement('div');
            wrapper.className = 'sceno-img-wrapper sceno-random-img-wrapper';

            const img = source.cloneNode(false);
            img.loading = 'eager';

            wrapper.appendChild(img);
            randomGallery.appendChild(wrapper);
        });
    }

    const refreshButton = document.querySelector('#sceno .sceno-random-refresh');
    if (refreshButton) {
        refreshButton.addEventListener('click', renderRandomScenoGallery);
    }

    renderRandomScenoGallery();
}

function stripFbclid() {
    const param = 'fbclid';
    if (!location.search.includes(`${param}=`)) {
        return;
    }

    const url = new URL(location.href);
    url.searchParams.delete(param);
    history.replaceState(null, '', url.href);
}

document.getElementById('c').style.display = 'block';
document.body.style.filter = 'invert(1)';

initNavigation();
initCarousels();
initRandomScenoGallery();
setActiveSection(initialSection, false);
stripFbclid();

setTimeout(() => {
    document.body.style.filter = '';
    document.getElementById('logo-loader').style.display = 'none';
    document.getElementById('app-below').style.display = 'block';
    setActiveSection(initialSection, false);
    setTimeout(() => {
        window.belowState.newLines = false;
    }, 2500);
}, 2500);
