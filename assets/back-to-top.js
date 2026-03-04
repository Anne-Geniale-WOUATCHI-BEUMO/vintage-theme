/**
 * BackToTop - Custom element that shows a floating button
 * when the user has scrolled past a configurable threshold.
 *
 * Reads `data-show-after` for the scroll pixel threshold.
 * Uses a throttled scroll listener for performance.
 * On click, smoothly scrolls the page to the top.
 */
class BackToTop extends HTMLElement {
  /** @type {AbortController} */
  #controller;

  /** @type {boolean} Whether a scroll check is pending */
  #ticking = false;

  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;

    window.addEventListener('scroll', this.#onScroll.bind(this), { signal, passive: true });

    const button = this.querySelector('.back-to-top__button');
    if (button) {
      button.addEventListener('click', this.#scrollToTop.bind(this), { signal });
    }

    // Check initial scroll position
    this.#checkVisibility();
  }

  disconnectedCallback() {
    this.#controller?.abort();
  }

  /** @returns {number} Scroll threshold in pixels */
  get #showAfter() {
    return parseInt(this.dataset.showAfter, 10) || 300;
  }

  /**
   * Throttled scroll handler using requestAnimationFrame.
   */
  #onScroll() {
    if (this.#ticking) return;

    this.#ticking = true;
    requestAnimationFrame(() => {
      this.#checkVisibility();
      this.#ticking = false;
    });
  }

  /**
   * Shows or hides the button based on scroll position.
   */
  #checkVisibility() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    if (scrollY > this.#showAfter) {
      this.classList.add('is-visible');
    } else {
      this.classList.remove('is-visible');
    }
  }

  /**
   * Smoothly scrolls the page to the top.
   * @param {Event} event
   */
  #scrollToTop(event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

if (!customElements.get('back-to-top')) {
  customElements.define('back-to-top', BackToTop);
}
