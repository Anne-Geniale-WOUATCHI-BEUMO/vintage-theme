/**
 * ProductTabs - Custom element for tabbed content navigation.
 *
 * Handles tab button clicks to show/hide corresponding panels,
 * manages active states, and supports keyboard navigation with arrow keys.
 */
class ProductTabs extends HTMLElement {
  /** @type {AbortController} */
  #controller;

  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;

    const tabNav = this.querySelector('.product-tabs__nav');
    if (!tabNav) return;

    tabNav.addEventListener('click', this.#handleTabClick.bind(this), { signal });
    tabNav.addEventListener('keydown', this.#handleKeyDown.bind(this), { signal });
  }

  disconnectedCallback() {
    this.#controller?.abort();
  }

  /** @returns {HTMLButtonElement[]} */
  get #tabs() {
    return [...this.querySelectorAll('.product-tabs__tab')];
  }

  /** @returns {HTMLElement[]} */
  get #panels() {
    return [...this.querySelectorAll('.product-tabs__panel')];
  }

  /**
   * Handles click events on tab buttons.
   * @param {Event} event
   */
  #handleTabClick(event) {
    const tab = /** @type {HTMLElement} */ (event.target).closest('.product-tabs__tab');
    if (!tab) return;

    this.#activateTab(tab);
  }

  /**
   * Handles keyboard navigation between tabs.
   * Arrow keys move focus; Home/End jump to first/last tab.
   * @param {KeyboardEvent} event
   */
  #handleKeyDown(event) {
    const tabs = this.#tabs;
    const currentIndex = tabs.indexOf(/** @type {HTMLButtonElement} */ (event.target));
    if (currentIndex === -1) return;

    let newIndex;

    switch (event.key) {
      case 'ArrowRight':
        newIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.#activateTab(tabs[newIndex]);
    tabs[newIndex].focus();
  }

  /**
   * Activates the given tab and shows its corresponding panel.
   * @param {Element} tab
   */
  #activateTab(tab) {
    const tabs = this.#tabs;
    const panels = this.#panels;
    const panelId = tab.getAttribute('aria-controls');

    // Deactivate all tabs
    for (const t of tabs) {
      t.classList.remove('product-tabs__tab--active');
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
    }

    // Hide all panels
    for (const panel of panels) {
      panel.classList.remove('product-tabs__panel--active');
      panel.hidden = true;
    }

    // Activate selected tab
    tab.classList.add('product-tabs__tab--active');
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');

    // Show selected panel
    const activePanel = this.querySelector(`#${panelId}`);
    if (activePanel) {
      activePanel.classList.add('product-tabs__panel--active');
      activePanel.hidden = false;
    }
  }
}

if (!customElements.get('product-tabs')) {
  customElements.define('product-tabs', ProductTabs);
}
