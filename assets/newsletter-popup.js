class NewsletterPopup extends HTMLElement {
  static STORAGE_KEY_PREFIX = 'newsletter-popup-dismissed-';

  constructor() {
    super();
    this.sectionId = this.dataset.sectionId || 'default';
    this.delay = parseInt(this.dataset.delay, 10) || 5;
    this.storageKey = NewsletterPopup.STORAGE_KEY_PREFIX + this.sectionId;
    this.timer = null;
  }

  connectedCallback() {
    if (this.isDismissed()) return;

    this.closeButton = this.querySelector('[ref="closeButton"]');
    this.overlay = this.querySelector('.newsletter-popup__overlay');

    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.close());
    }

    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }

    document.addEventListener('keydown', this.handleKeydown.bind(this));

    this.timer = setTimeout(() => {
      this.show();
    }, this.delay * 1000);
  }

  disconnectedCallback() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }

  handleKeydown(event) {
    if (event.key === 'Escape' && this.classList.contains('is-visible')) {
      this.close();
    }
  }

  show() {
    this.classList.add('is-visible');
  }

  close() {
    this.classList.remove('is-visible');
    this.setDismissed();
  }

  isDismissed() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return false;

      const expiry = parseInt(raw, 10);
      if (isNaN(expiry)) return false;

      if (Date.now() > expiry) {
        localStorage.removeItem(this.storageKey);
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  setDismissed() {
    try {
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const expiry = Date.now() + sevenDaysMs;
      localStorage.setItem(this.storageKey, expiry.toString());
    } catch {
      // localStorage may be unavailable
    }
  }
}

if (!customElements.get('newsletter-popup')) {
  customElements.define('newsletter-popup', NewsletterPopup);
}
