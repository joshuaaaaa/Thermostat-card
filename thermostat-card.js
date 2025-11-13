/**
 * Thermostat Control Card
 * Kompaktní karta pro ovládání termostatů v Home Assistant
 *
 * Design inspirovaný Nest termostatem - kompaktní, praktický, dashboard-friendly
 *
 * @version 2.1.0
 * @author Claude
 */

class ThermostatCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._chartLoaded = false;
    this._chartInstance = null;
    this._rendered = false;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Musíte definovat climate entitu!');
    }

    this._config = {
      entity: config.entity,
      name: config.name || '',
      show_graph: config.show_graph !== false,
      graph_hours: config.graph_hours || 12,
      step: config.step || 0.5,
      ...config
    };

    this._rendered = false;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();

    if (this._config.show_graph && !this._chartLoaded) {
      this.loadChart();
    } else if (this._config.show_graph && this._chartInstance) {
      this.updateChart();
    }
  }

  async loadChart() {
    if (window.Chart) {
      this._chartLoaded = true;
      this.updateChart();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload = () => {
      this._chartLoaded = true;
      this.updateChart();
    };
    document.head.appendChild(script);
  }

  async getHistory() {
    if (!this._hass || !this._config.entity) return [];

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - (this._config.graph_hours * 60 * 60 * 1000));

    try {
      const history = await this._hass.callApi('GET',
        `history/period/${startTime.toISOString()}?filter_entity_id=${this._config.entity}&minimal_response`
      );

      if (history && history[0]) {
        return history[0]
          .filter(state => state.attributes && state.attributes.current_temperature !== null)
          .map(state => ({
            time: new Date(state.last_changed),
            temperature: parseFloat(state.attributes.current_temperature),
            target: parseFloat(state.attributes.temperature)
          }));
      }
    } catch (error) {
      console.error('Chyba při načítání historie:', error);
    }

    return [];
  }

  async updateChart() {
    if (!this._chartLoaded || !window.Chart) return;

    const canvas = this.shadowRoot.getElementById('temperatureChart');
    if (!canvas) return;

    const history = await this.getHistory();
    if (history.length === 0) return;

    const ctx = canvas.getContext('2d');

    if (this._chartInstance) {
      this._chartInstance.destroy();
    }

    const entity = this._hass.states[this._config.entity];
    const state = entity ? entity.state : 'off';
    const colors = this.getStateColors(state);

    this._chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: history.map(d => d.time.toLocaleTimeString('cs-CZ', {
          hour: '2-digit',
          minute: '2-digit'
        })),
        datasets: [
          {
            label: 'Aktuální',
            data: history.map(d => d.temperature),
            borderColor: colors.primary,
            backgroundColor: colors.gradient,
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: colors.primary,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2
          },
          {
            label: 'Cíl',
            data: history.map(d => d.target),
            borderColor: 'rgba(100, 100, 100, 0.4)',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderDash: [4, 4],
            fill: false,
            tension: 0.3,
            pointRadius: 0,
            pointHoverRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#333',
            bodyColor: '#666',
            borderColor: colors.primary,
            borderWidth: 1,
            padding: 8,
            displayColors: true,
            cornerRadius: 6,
            titleFont: {
              size: 11,
              weight: '600'
            },
            bodyFont: {
              size: 10
            },
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + '°C';
              }
            }
          }
        },
        scales: {
          x: {
            display: false
          },
          y: {
            display: false
          }
        }
      }
    });
  }

  getStateColors(state) {
    const colorSchemes = {
      heating: {
        primary: '#ff6b6b',
        primaryRgb: '255, 107, 107',
        gradient: 'rgba(255, 107, 107, 0.15)',
        bg: 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%)',
        icon: '🔥',
        label: 'Topení'
      },
      cooling: {
        primary: '#4facfe',
        primaryRgb: '79, 172, 254',
        gradient: 'rgba(79, 172, 254, 0.15)',
        bg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        icon: '❄️',
        label: 'Chlazení'
      },
      idle: {
        primary: '#10b981',
        primaryRgb: '16, 185, 129',
        gradient: 'rgba(16, 185, 129, 0.15)',
        bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        icon: '✓',
        label: 'Připraveno'
      },
      off: {
        primary: '#6b7280',
        primaryRgb: '107, 116, 128',
        gradient: 'rgba(107, 116, 128, 0.15)',
        bg: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
        icon: '○',
        label: 'Vypnuto'
      }
    };

    return colorSchemes[state] || colorSchemes.off;
  }

  getEntityState() {
    if (!this._hass || !this._config.entity) return null;
    return this._hass.states[this._config.entity];
  }

  handleTemperatureChange(delta) {
    const entity = this.getEntityState();
    if (!entity) return;

    const currentTemp = parseFloat(entity.attributes.temperature) || 20;
    const newTemp = Math.round((currentTemp + delta) / this._config.step) * this._config.step;

    const minTemp = entity.attributes.min_temp || 5;
    const maxTemp = entity.attributes.max_temp || 35;
    const clampedTemp = Math.max(minTemp, Math.min(maxTemp, newTemp));

    this._hass.callService('climate', 'set_temperature', {
      entity_id: this._config.entity,
      temperature: clampedTemp
    });

    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  calculateProgress(current, min, max) {
    if (current === null || current === undefined) return 0;
    const range = max - min;
    const value = Math.max(min, Math.min(max, current)) - min;
    return (value / range) * 100;
  }

  updateValues(currentTemp, targetTemp, state, name, colors, strokeOffset) {
    const card = this.shadowRoot.querySelector('.thermostat-card');
    if (card) {
      card.style.background = colors.bg;
    }

    const statusChip = this.shadowRoot.querySelector('.status-chip');
    if (statusChip) {
      statusChip.style.background = colors.primary;
      const statusIcon = statusChip.querySelector('.status-icon');
      if (statusIcon) statusIcon.textContent = colors.icon;
      const statusLabel = statusChip.querySelector('span:last-child');
      if (statusLabel) statusLabel.textContent = colors.label;
    }

    const currentTempEl = this.shadowRoot.querySelector('.current-temp-value');
    if (currentTempEl) {
      currentTempEl.style.color = colors.primary;
      currentTempEl.textContent = currentTemp !== null ? Math.round(currentTemp) : '--';
    }

    const targetTempEl = this.shadowRoot.querySelector('.target-temp-value');
    if (targetTempEl) {
      targetTempEl.textContent = targetTemp !== null ? targetTemp.toFixed(1) : '--';
    }

    const progressRing = this.shadowRoot.querySelector('.progress-ring-fill');
    if (progressRing) {
      progressRing.style.stroke = colors.primary;
      progressRing.style.strokeDashoffset = strokeOffset;
    }

    const buttons = this.shadowRoot.querySelectorAll('.control-btn');
    buttons.forEach(button => {
      button.style.borderColor = colors.primary;
      button.style.color = colors.primary;
    });

    const nameEl = this.shadowRoot.querySelector('.entity-name');
    if (nameEl && nameEl.textContent !== name) {
      nameEl.textContent = name;
    }
  }

  render() {
    if (!this._hass || !this._config.entity) return;

    const entity = this.getEntityState();
    if (!entity) {
      this.shadowRoot.innerHTML = `
        <div style="padding: 16px; color: #dc2626; background: #fee2e2; border-radius: 12px; font-size: 14px;">
          <strong>⚠️ Entita nenalezena:</strong> "${this._config.entity}"
        </div>
      `;
      return;
    }

    const currentTemp = entity.attributes.current_temperature;
    const targetTemp = entity.attributes.temperature;
    const minTemp = entity.attributes.min_temp || 5;
    const maxTemp = entity.attributes.max_temp || 35;
    const state = entity.state;
    const name = this._config.name || entity.attributes.friendly_name || 'Termostat';
    const colors = this.getStateColors(state);

    const progress = this.calculateProgress(currentTemp, minTemp, maxTemp);
    const circumference = 2 * Math.PI * 65;
    const strokeOffset = circumference - (progress / 100) * circumference;

    if (this._rendered) {
      this.updateValues(currentTemp, targetTemp, state, name, colors, strokeOffset);
      return;
    }

    this._rendered = true;

    this.shadowRoot.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .thermostat-card {
          background: ${colors.bg};
          border-radius: 16px;
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          transition: background 0.4s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .entity-name {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .status-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: ${colors.primary};
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          box-shadow: 0 2px 4px rgba(${colors.primaryRgb}, 0.3);
          transition: all 0.3s ease;
        }

        .status-icon {
          font-size: 11px;
        }

        .main-content {
          display: grid;
          grid-template-columns: ${this._config.show_graph ? '180px 1fr' : '1fr'};
          gap: 16px;
          align-items: center;
        }

        .thermostat-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .circle-container {
          position: relative;
          width: 150px;
          height: 150px;
        }

        .progress-ring {
          transform: rotate(-90deg);
        }

        .progress-ring-bg {
          fill: none;
          stroke: rgba(0, 0, 0, 0.06);
          stroke-width: 6;
        }

        .progress-ring-fill {
          fill: none;
          stroke: ${colors.primary};
          stroke-width: 6;
          stroke-linecap: round;
          stroke-dasharray: ${circumference};
          stroke-dashoffset: ${strokeOffset};
          transition: stroke 0.4s ease, stroke-dashoffset 0.6s ease;
        }

        .temp-display {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .current-temp-value {
          font-size: 48px;
          font-weight: 700;
          color: ${colors.primary};
          line-height: 1;
          transition: color 0.4s ease;
        }

        .temp-unit {
          font-size: 20px;
          opacity: 0.5;
          margin-left: 2px;
        }

        .target-temp {
          margin-top: 4px;
          font-size: 12px;
          color: #6b7280;
        }

        .target-temp-value {
          font-weight: 600;
          color: #374151;
        }

        .controls {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .control-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: white;
          border: 2px solid ${colors.primary};
          color: ${colors.primary};
          font-size: 20px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }

        .control-btn:hover {
          background: ${colors.primary};
          color: white;
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(${colors.primaryRgb}, 0.3);
        }

        .control-btn:active {
          transform: scale(0.95);
        }

        .graph-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .graph-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .graph-title {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
        }

        .graph-period {
          font-size: 11px;
          color: #9ca3af;
        }

        .graph-container {
          background: white;
          border-radius: 12px;
          padding: 12px;
          height: 120px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        #temperatureChart {
          width: 100% !important;
          height: 100% !important;
        }

        @media (max-width: 600px) {
          .main-content {
            grid-template-columns: 1fr;
          }

          .circle-container {
            width: 140px;
            height: 140px;
          }

          .current-temp-value {
            font-size: 42px;
          }
        }
      </style>

      <div class="thermostat-card">
        <div class="card-header">
          <div class="entity-name">${name}</div>
          <div class="status-chip">
            <span class="status-icon">${colors.icon}</span>
            <span>${colors.label}</span>
          </div>
        </div>

        <div class="main-content">
          <div class="thermostat-display">
            <div class="circle-container">
              <svg class="progress-ring" width="150" height="150">
                <circle class="progress-ring-bg" cx="75" cy="75" r="65"/>
                <circle class="progress-ring-fill" cx="75" cy="75" r="65"/>
              </svg>
              <div class="temp-display">
                <div>
                  <span class="current-temp-value">${currentTemp !== null ? Math.round(currentTemp) : '--'}</span>
                  <span class="temp-unit">°</span>
                </div>
                <div class="target-temp">
                  Cíl: <span class="target-temp-value">${targetTemp !== null ? targetTemp.toFixed(1) : '--'}°</span>
                </div>
              </div>
            </div>

            <div class="controls">
              <button class="control-btn" id="decreaseTemp">−</button>
              <button class="control-btn" id="increaseTemp">+</button>
            </div>
          </div>

          ${this._config.show_graph ? `
            <div class="graph-section">
              <div class="graph-header">
                <div class="graph-title">📊 Historie teploty</div>
                <div class="graph-period">${this._config.graph_hours}h</div>
              </div>
              <div class="graph-container">
                <canvas id="temperatureChart"></canvas>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    const decreaseBtn = this.shadowRoot.getElementById('decreaseTemp');
    const increaseBtn = this.shadowRoot.getElementById('increaseTemp');

    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', () => this.handleTemperatureChange(-this._config.step));
    }

    if (increaseBtn) {
      increaseBtn.addEventListener('click', () => this.handleTemperatureChange(this._config.step));
    }
  }

  getCardSize() {
    return this._config.show_graph ? 3 : 2;
  }

  static getConfigElement() {
    return document.createElement('thermostat-card-editor');
  }

  static getStubConfig() {
    return {
      entity: '',
      show_graph: true,
      graph_hours: 12,
      step: 0.5
    };
  }
}

// Config Editor (zjednodušený)
class ThermostatCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.shadowRoot.innerHTML) {
      this.render();
    }
  }

  configChanged(newConfig) {
    const event = new Event('config-changed', {
      bubbles: true,
      composed: true
    });
    event.detail = { config: newConfig };
    this.dispatchEvent(event);
  }

  render() {
    if (!this._hass) return;

    const entities = Object.keys(this._hass.states)
      .filter(entityId => entityId.startsWith('climate.'))
      .sort();

    this.shadowRoot.innerHTML = `
      <style>
        .config-container {
          padding: 16px;
        }
        .config-row {
          display: flex;
          flex-direction: column;
          margin-bottom: 16px;
        }
        label {
          font-weight: 500;
          margin-bottom: 8px;
          color: var(--primary-text-color);
        }
        select, input {
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font-size: 14px;
        }
        .checkbox-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
        .helper-text {
          font-size: 12px;
          color: var(--secondary-text-color);
          margin-top: 4px;
        }
      </style>

      <div class="config-container">
        <div class="config-row">
          <label for="entity">Climate entita *</label>
          <select id="entity">
            <option value="">Vyberte entitu...</option>
            ${entities.map(entityId => `
              <option value="${entityId}" ${this._config.entity === entityId ? 'selected' : ''}>
                ${this._hass.states[entityId].attributes.friendly_name || entityId}
              </option>
            `).join('')}
          </select>
          <div class="helper-text">Vyberte termostat</div>
        </div>

        <div class="config-row">
          <label for="name">Vlastní název</label>
          <input type="text" id="name" placeholder="např. Obývák" value="${this._config.name || ''}"/>
        </div>

        <div class="config-row">
          <div class="checkbox-row">
            <input type="checkbox" id="show_graph" ${this._config.show_graph !== false ? 'checked' : ''}/>
            <label for="show_graph">Zobrazit graf</label>
          </div>
        </div>

        <div class="config-row">
          <label for="graph_hours">Počet hodin v grafu</label>
          <input type="number" id="graph_hours" min="1" max="48" value="${this._config.graph_hours || 12}"/>
        </div>

        <div class="config-row">
          <label for="step">Krok změny teploty</label>
          <input type="number" id="step" min="0.1" max="2" step="0.1" value="${this._config.step || 0.5}"/>
        </div>
      </div>
    `;

    const entitySelect = this.shadowRoot.getElementById('entity');
    const nameInput = this.shadowRoot.getElementById('name');
    const showGraphCheckbox = this.shadowRoot.getElementById('show_graph');
    const graphHoursInput = this.shadowRoot.getElementById('graph_hours');
    const stepInput = this.shadowRoot.getElementById('step');

    entitySelect?.addEventListener('change', (e) => {
      this.configChanged({ ...this._config, entity: e.target.value });
    });

    nameInput?.addEventListener('input', (e) => {
      this.configChanged({ ...this._config, name: e.target.value });
    });

    showGraphCheckbox?.addEventListener('change', (e) => {
      this.configChanged({ ...this._config, show_graph: e.target.checked });
    });

    graphHoursInput?.addEventListener('input', (e) => {
      this.configChanged({ ...this._config, graph_hours: parseInt(e.target.value) });
    });

    stepInput?.addEventListener('input', (e) => {
      this.configChanged({ ...this._config, step: parseFloat(e.target.value) });
    });
  }
}

customElements.define('thermostat-card', ThermostatCard);
customElements.define('thermostat-card-editor', ThermostatCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'thermostat-card',
  name: 'Thermostat Control Card',
  description: 'Kompaktní termostat inspirovaný Nest - praktický pro dashboard',
  preview: true
});

console.info('%c THERMOSTAT-CARD %c v2.1.0 ', 'color: white; background: #10b981; font-weight: 700;', 'color: #10b981; background: white; font-weight: 700;');
