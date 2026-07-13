import 'virtual:svg-icons-register';

// --- Helpers ---
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const updatePagination = (buttons, activeIndex) => {
    buttons.forEach((button, index) => {
        const active = index === activeIndex;
        button.classList.toggle('text-tomato', active);
        button.classList.toggle('text-dark-dot-inactive', !active);
        button.setAttribute('aria-current', active ? 'true' : 'false');
    });
};

// --- Mobile Menu ---
class MobileMenu {
    constructor() {
        this.dialog = document.getElementById('mobile-menu');
        this.openBtn = document.getElementById('mobile-menu-open-btn');
        if (!this.dialog || !this.openBtn) return;

        this.closeBtn = document.getElementById('mobile-menu-close-btn');
        this.focusable = [];
        this.handleKeyDown = this.handleKeyDown.bind(this);

        this.init();
    }

    init() {
        this.openBtn.setAttribute('aria-expanded', 'false');
        this.openBtn.addEventListener('click', () => this.open());
        this.dialog.addEventListener('close', () => this.close());
        this.dialog.addEventListener('click', (e) => {
            if (e.target === this.dialog) this.dialog.close();
        });

        this.dialog.querySelectorAll('a[href]').forEach((link) => {
            link.addEventListener('click', () => this.dialog.close());
        });
    }

    open() {
        this.dialog.showModal();
        document.body.style.overflow = 'hidden';
        this.openBtn.setAttribute('aria-expanded', 'true');
        this.focusable = Array.from(
            this.dialog.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])')
        );
        document.addEventListener('keydown', this.handleKeyDown);
        this.closeBtn?.focus();
    }

    close() {
        document.body.style.overflow = '';
        this.openBtn.setAttribute('aria-expanded', 'false');
        document.removeEventListener('keydown', this.handleKeyDown);
        this.openBtn.focus();
    }

    handleKeyDown(event) {
        if (event.key === 'Escape') {
            this.dialog.close();
            return;
        }
        if (event.key !== 'Tab' || !this.focusable.length) return;

        const first = this.focusable[0];
        const last = this.focusable[this.focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
}

// --- Fade Slider (Hero) ---
// Architecture: CSS Opacity + Absolute Position
class FadeSlider {
    constructor(selector, options = {}) {
        this.container = document.querySelector(selector);
        if (!this.container) return;

        this.slides = Array.from(this.container.querySelectorAll('.hero-slide'));
        if (!this.slides.length) return;

        // Dots are siblings of #hero-slider (both children of the <section>),
        // so query from parentElement.
        this.heroSection = this.container.parentElement;
        this.dots = Array.from(this.heroSection.querySelectorAll('.hero-dot-btn'));

        this.options = { autoplay: true, delay: 5000, ...options };
        this.currentIndex = 0;
        this.timer = null;
        this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this._observer = null;

        this.init();
    }

    init() {
        this.slides.forEach((slide, i) => {
            slide.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
            slide.classList.toggle('opacity-100', i === 0);
            slide.classList.toggle('opacity-0', i !== 0);
            slide.classList.toggle('z-10', i === 0);
            slide.classList.toggle('z-0', i !== 0);
        });

        updatePagination(this.dots, this.currentIndex);

        this.dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                this.goTo(i);
                this.restart();
            });
        });

        this._observer = new IntersectionObserver(([entry]) => {
            entry.isIntersecting && this.options.autoplay ? this.start() : this.stop();
        }, { threshold: 0.1 });
        this._observer.observe(this.heroSection);

        this.mediaQuery.addEventListener('change', () =>
            this.mediaQuery.matches ? this.stop() : this.start()
        );
    }

    goTo(index) {
        if (index === this.currentIndex) return;

        const current = this.slides[this.currentIndex];
        const next = this.slides[index];

        current.classList.replace('opacity-100', 'opacity-0');
        current.classList.replace('z-10', 'z-0');
        current.setAttribute('aria-hidden', 'true');

        next.classList.replace('opacity-0', 'opacity-100');
        next.classList.replace('z-0', 'z-10');
        next.setAttribute('aria-hidden', 'false');

        this.currentIndex = index;
        updatePagination(this.dots, this.currentIndex);
    }

    next() {
        this.goTo((this.currentIndex + 1) % this.slides.length);
    }

    start() {
        if (this.mediaQuery.matches || this.timer || !this.options.autoplay) return;
        this.timer = window.setInterval(() => this.next(), this.options.delay);
    }

    stop() {
        if (!this.timer) return;
        clearInterval(this.timer);
        this.timer = null;
    }

    restart() {
        this.stop();
        this.start();
    }

    destroy() {
        this.stop();
        this._observer?.disconnect();
    }
}

// --- Native Carousel (Products / Partners) ---
// CSS scroll-snap handles positioning; this class only chooses the next item.
class NativeCarousel {
    constructor(selector, options = {}) {
        this.container = document.querySelector(selector);
        if (!this.container) return;

        this.track = this.container.querySelector('.carousel-track');
        this.items = Array.from(this.track?.querySelectorAll('.carousel-item') || []);
        if (!this.track || !this.items.length) return;

        this.prevBtn = this.container.querySelector('.carousel-prev');
        this.nextBtn = this.container.querySelector('.carousel-next');
        this.dots = Array.from(this.container.querySelectorAll('.carousel-dot'));
        this.options = { autoplay: true, delay: 4000, ...options };

        this.isPaused = false;
        this.isVisible = false;
        this.timer = null;
        this._restartTimeout = null;
        this._scrollFrame = null;
        this._resizeObserver = null;
        this._intersectionObserver = null;

        this.init();
    }

    init() {
        this.track.tabIndex = 0;
        this.bindEvents();
        this.bindAutoplay();
        this.updateControls();
    }

    _scrollToItem(item) {
        const trackRect = this.track.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        const itemCenter = this.track.scrollLeft + itemRect.left - trackRect.left + itemRect.width / 2;
        const maxScroll = this.track.scrollWidth - this.track.clientWidth;
        const left = Math.max(0, Math.min(Math.round(itemCenter - this.track.clientWidth / 2), maxScroll));

        this.track.scrollTo({
            left,
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        });
    }

    _goToIndex(index) {
        const item = this.items[index];
        if (item) this._scrollToItem(item);
    }

    _getCurrentItemIndex() {
        const trackRect = this.track.getBoundingClientRect();
        const viewCenter = trackRect.left + trackRect.width / 2;
        let closestIndex = 0;
        let closestDistance = Infinity;

        this.items.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            const distance = Math.abs(rect.left + rect.width / 2 - viewCenter);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        return closestIndex;
    }

    _getDotTargetIndex(dotIndex) {
        if (this.dots.length < 2) return 0;
        return Math.round(dotIndex * (this.items.length - 1) / (this.dots.length - 1));
    }

    bindEvents() {
        this._resizeObserver = new ResizeObserver(() => this.updateControls());
        this._resizeObserver.observe(this.track);

        this.prevBtn?.addEventListener('click', () => {
            this.previous();
            this.restart();
        });

        this.nextBtn?.addEventListener('click', () => {
            this.next();
            this.restart();
        });

        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                updatePagination(this.dots, index);
                this._goToIndex(this._getDotTargetIndex(index));
                this.restart();
            });
        });

        this.track.addEventListener('scroll', () => {
            if (this._scrollFrame) return;
            this._scrollFrame = requestAnimationFrame(() => {
                this._scrollFrame = null;
                this.updateControls();
            });
        }, { passive: true });

        this.track.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowRight':
                case 'PageDown':
                    event.preventDefault();
                    this.next();
                    this.restart();
                    break;
                case 'ArrowLeft':
                case 'PageUp':
                    event.preventDefault();
                    this.previous();
                    this.restart();
                    break;
                case 'Home':
                    event.preventDefault();
                    this._goToIndex(0);
                    this.restart();
                    break;
                case 'End':
                    event.preventDefault();
                    this._goToIndex(this.items.length - 1);
                    this.restart();
                    break;
            }
        });
    }

    bindAutoplay() {
        if (!this.options.autoplay) return;

        this.container.addEventListener('pointerenter', (event) => {
            if (event.pointerType !== 'touch') this.pause();
        });
        this.container.addEventListener('pointerleave', (event) => {
            if (event.pointerType !== 'touch') this.resume();
        });

        this.track.addEventListener('touchstart', () => this.pause(), { passive: true });
        this.track.addEventListener('touchend', () => this.resume(), { passive: true });
        this.track.addEventListener('touchcancel', () => this.resume(), { passive: true });

        this.container.addEventListener('focusin', () => this.pause());
        this.container.addEventListener('focusout', (event) => {
            if (!this.container.contains(event.relatedTarget)) this.resume();
        });

        this._intersectionObserver = new IntersectionObserver(([entry]) => {
            this.isVisible = entry.isIntersecting;
            this.syncAutoplay();
        }, { threshold: 0.1 });
        this._intersectionObserver.observe(this.container);
    }

    next() {
        const maxScroll = this.track.scrollWidth - this.track.clientWidth;
        if (maxScroll <= 0) return;

        if (this.track.scrollLeft >= maxScroll - 5) {
            this.track.scrollTo({ left: 0, behavior: 'auto' });
            return;
        }

        const currentIndex = this._getCurrentItemIndex();
        const nextIndex = Math.min(currentIndex + 1, this.items.length - 1);
        if (nextIndex > currentIndex) {
            this._goToIndex(nextIndex);
        } else {
            this.track.scrollTo({
                left: maxScroll,
                behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            });
        }
    }

    previous() {
        const currentIndex = this._getCurrentItemIndex();
        if (currentIndex > 0) this._goToIndex(currentIndex - 1);
    }

    updateControls() {
        const maxScroll = this.track.scrollWidth - this.track.clientWidth;

        if (maxScroll <= 0) {
            if (this.prevBtn) this.prevBtn.style.display = 'none';
            if (this.nextBtn) this.nextBtn.style.display = 'none';
            return;
        }

        if (this.prevBtn) this.prevBtn.style.display = '';
        if (this.nextBtn) this.nextBtn.style.display = '';

        const isAtStart = this.track.scrollLeft <= 0;
        const isAtEnd = this.track.scrollLeft >= maxScroll - 5;

        if (this.prevBtn) {
            this.prevBtn.disabled = isAtStart;
            this.prevBtn.setAttribute('aria-disabled', String(isAtStart));
            this.prevBtn.style.opacity = isAtStart ? '0.5' : '1';
        }

        if (this.nextBtn) {
            this.nextBtn.disabled = isAtEnd;
            this.nextBtn.setAttribute('aria-disabled', String(isAtEnd));
            this.nextBtn.style.opacity = isAtEnd ? '0.5' : '1';
        }

        if (this.dots.length > 1) {
            const activeIndex = Math.round(this.track.scrollLeft / maxScroll * (this.dots.length - 1));
            updatePagination(this.dots, activeIndex);
        }
    }

    syncAutoplay() {
        if (!this.options.autoplay || this.isPaused || !this.isVisible || prefersReducedMotion()) {
            this.stop();
            return;
        }
        if (!this.timer) this.timer = window.setInterval(() => this.next(), this.options.delay);
    }

    stop() {
        if (!this.timer) return;
        clearInterval(this.timer);
        this.timer = null;
    }

    pause() {
        this.isPaused = true;
        this.stop();
    }

    resume() {
        this.isPaused = false;
        this.syncAutoplay();
    }

    restart() {
        this.pause();
        clearTimeout(this._restartTimeout);
        this._restartTimeout = setTimeout(() => this.resume(), 1000);
    }

    destroy() {
        this.stop();
        clearTimeout(this._restartTimeout);
        if (this._scrollFrame) cancelAnimationFrame(this._scrollFrame);
        this._resizeObserver?.disconnect();
        this._intersectionObserver?.disconnect();
    }
}
// --- Active Nav Link ---
function initActiveNavLinks() {
    const allNavLinks = Array.from(document.querySelectorAll('nav a[href]'));

    const setActive = (href) => {
        allNavLinks.forEach(link => {
            const isActive = link.getAttribute('href') === href;
            link.classList.toggle('bg-tomato-light', isActive);
            link.classList.toggle('text-white', isActive);
            link.classList.toggle('text-black', !isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const initialActive = allNavLinks.find(l => l.getAttribute('aria-current') === 'page');
    if (initialActive) setActive(initialActive.getAttribute('href'));

    allNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            setActive(link.getAttribute('href'));
        });
    });
}

// --- App Init ---
document.addEventListener('DOMContentLoaded', () => {
    new MobileMenu();
    new FadeSlider('#hero-slider', { delay: 6000 });
    new NativeCarousel('#products-carousel', { delay: 4000 });
    new NativeCarousel('#partners-carousel', { delay: 3000 });

    initActiveNavLinks();

    const copyrightEl = document.getElementById('copyright-year');
    if (copyrightEl) {
        copyrightEl.textContent = new Date().getFullYear();
    }
});
