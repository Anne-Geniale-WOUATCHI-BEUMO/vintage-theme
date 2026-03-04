/**
 * SocialProofNotifications - Custom element that cycles through
 * social proof notification cards with timed show/hide transitions.
 *
 * Reads configuration from data attributes:
 * - data-display-duration: seconds to show each notification
 * - data-pause-duration: seconds to wait between notifications
 *
 * Adds `.is-visible` class to the active notification for slide-in animation.
 * A close button stops the cycle entirely.
 */
class SocialProofNotifications extends HTMLElement {
  /** @type {AbortController} */
  #controller;

  /** @type {number} Current notification index */
  #currentIndex = 0;

  /** @type {number | null} Active timeout ID */
  #timeoutId = null;

  /** @type {boolean} Whether cycling has been stopped */
  #stopped = false;

  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;

    // Bind close buttons
    const closeButtons = this.querySelectorAll('.social-proof__close');
    for (const btn of closeButtons) {
      btn.addEventListener('click', this.#handleClose.bind(this), { signal });
    }

    // Start the cycle after an initial pause
    this.#scheduleNext();
  }

  disconnectedCallback() {
    this.#controller?.abort();
    this.#clearTimeout();
  }

  /** @returns {number} Display duration in milliseconds */
  get #displayDuration() {
    return (parseInt(this.dataset.displayDuration, 10) || 5) * 1000;
  }

  /** @returns {number} Pause duration in milliseconds */
  get #pauseDuration() {
    return (parseInt(this.dataset.pauseDuration, 10) || 10) * 1000;
  }

  /** @returns {HTMLElement[]} */
  get #notifications() {
    return [...this.querySelectorAll('.social-proof__notification')];
  }

  /**
   * Shows the current notification, then schedules hiding it.
   */
  #showCurrent() {
    if (this.#stopped) return;

    const notifications = this.#notifications;
    if (notifications.length === 0) return;

    const notification = notifications[this.#currentIndex];
    notification.classList.add('is-visible');

    this.#timeoutId = window.setTimeout(() => {
      this.#hideCurrent();
    }, this.#displayDuration);
  }

  /**
   * Hides the current notification, then schedules showing the next.
   */
  #hideCurrent() {
    if (this.#stopped) return;

    const notifications = this.#notifications;
    if (notifications.length === 0) return;

    const notification = notifications[this.#currentIndex];
    notification.classList.remove('is-visible');

    // Advance to next notification
    this.#currentIndex = (this.#currentIndex + 1) % notifications.length;

    this.#scheduleNext();
  }

  /**
   * Waits the pause duration, then shows the next notification.
   */
  #scheduleNext() {
    if (this.#stopped) return;

    this.#timeoutId = window.setTimeout(() => {
      this.#showCurrent();
    }, this.#pauseDuration);
  }

  /**
   * Handles the close button click. Hides the current notification
   * and stops the entire cycle.
   * @param {Event} event
   */
  #handleClose(event) {
    event.preventDefault();
    event.stopPropagation();

    this.#stopped = true;
    this.#clearTimeout();

    // Hide all notifications
    for (const notification of this.#notifications) {
      notification.classList.remove('is-visible');
    }
  }

  /**
   * Clears any pending timeout.
   */
  #clearTimeout() {
    if (this.#timeoutId !== null) {
      window.clearTimeout(this.#timeoutId);
      this.#timeoutId = null;
    }
  }
}

if (!customElements.get('social-proof-notifications')) {
  customElements.define('social-proof-notifications', SocialProofNotifications);
}
