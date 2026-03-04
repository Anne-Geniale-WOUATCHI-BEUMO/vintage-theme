class CountdownTimer extends HTMLElement {
  constructor() {
    super();
    this.endDate = null;
    this.intervalId = null;
  }

  connectedCallback() {
    const endDateStr = this.dataset.endDate;

    if (!endDateStr) {
      this.showExpired();
      return;
    }

    const parsed = Date.parse(endDateStr);
    if (isNaN(parsed)) {
      this.showExpired();
      return;
    }

    this.endDate = parsed;

    this.daysEl = this.querySelector('[ref="days"]');
    this.hoursEl = this.querySelector('[ref="hours"]');
    this.minutesEl = this.querySelector('[ref="minutes"]');
    this.secondsEl = this.querySelector('[ref="seconds"]');
    this.timerGrid = this.querySelector('[ref="timerGrid"]');
    this.expiredMessage = this.querySelector('[ref="expiredMessage"]');
    this.ctaButton = this.querySelector('[ref="ctaButton"]');

    this.update();
    this.intervalId = setInterval(() => this.update(), 1000);
  }

  disconnectedCallback() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  update() {
    const now = Date.now();
    const diff = this.endDate - now;

    if (diff <= 0) {
      this.showExpired();
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (this.daysEl) this.daysEl.textContent = this.pad(days);
    if (this.hoursEl) this.hoursEl.textContent = this.pad(hours);
    if (this.minutesEl) this.minutesEl.textContent = this.pad(minutes);
    if (this.secondsEl) this.secondsEl.textContent = this.pad(seconds);
  }

  showExpired() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.timerGrid) this.timerGrid.hidden = true;
    if (this.expiredMessage) this.expiredMessage.hidden = false;
    if (this.ctaButton) this.ctaButton.hidden = true;
  }

  pad(value) {
    return String(value).padStart(2, '0');
  }
}

if (!customElements.get('countdown-timer')) {
  customElements.define('countdown-timer', CountdownTimer);
}
