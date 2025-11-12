/**
 * Thermostat Control Card
 * Moderní karta pro ovládání termostatů v Home Assistant
 *
 * @version 1.0.0
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
  }

  /**
   * Nastaví konfiguraci karty
   */
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

    this.render();
  }

  /**
   * Nastaví Home Assistant objekt
   */
  set hass(hass) {
    this._hass = hass;
    this.render();

    if (this._config.show_graph && !this._chartLoaded) {
      this.loadChart();
    } else if (this._config.show_graph && this._chartInstance) {
      this.updateChart();
    }
  }

  /**
   * Načte Chart.js knihovnu
   */
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

  /**
   * Získá historická data pro graf
   */
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

  /**
   * Aktualizuje graf
   */
  async updateChart() {
    if (!this._chartLoaded || !window.Chart) return;

    const canvas = this.shadowRoot.getElementById('temperatureChart');
    if (!canvas) return;

    const history = await this.getHistory();
    if (history.length === 0) return;

    const ctx = canvas.getContext('2d');

    // Zničit starý graf pokud existuje
    if (this._chartInstance) {
      this._chartInstance.destroy();
    }

    // Získat aktuální stav entity pro barvu
    const entity = this._hass.states[this._config.entity];
    const state = entity ? entity.state : 'off';
    const colors = this.getStateColors(state);

    // Vytvoř nový graf
    this._chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: history.map(d => d.time.toLocaleTimeString('cs-CZ', {
          hour: '2-digit',
          minute: '2-digit'
        })),
        datasets: [
          {
            label: 'Aktuální teplota',
            data: history.map(d => d.temperature),
            borderColor: colors.primary,
            backgroundColor: colors.primaryAlpha,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: colors.primary,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2
          },
          {
            label: 'Cílová teplota',
            data: history.map(d => d.target),
            borderColor: colors.secondary,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5
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
            display: true,
            position: 'bottom',
            labels: {
              color: '#ffffff',
              font: {
                size: 12,
                family: "'Roboto', sans-serif"
              },
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: colors.primary,
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + '°C';
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawBorder: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              maxRotation: 0,
              autoSkipPadding: 20
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawBorder: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              callback: function(value) {
                return value + '°C';
              }
            }
          }
        }
      }
    });
  }

  /**
   * Získá barvy podle stavu
   */
  getStateColors(state) {
    const colorSchemes = {
      heating: {
        gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #c44569 100%)',
        primary: '#ff6b6b',
        primaryAlpha: 'rgba(255, 107, 107, 0.2)',
        secondary: '#ffd93d',
        icon: '🔥'
      },
      cooling: {
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        primary: '#4facfe',
        primaryAlpha: 'rgba(79, 172, 254, 0.2)',
        secondary: '#a8e6ff',
        icon: '❄️'
      },
      idle: {
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        primary: '#667eea',
        primaryAlpha: 'rgba(102, 126, 234, 0.2)',
        secondary: '#a8b5ff',
        icon: '💤'
      },
      off: {
        gradient: 'linear-gradient(135deg, #868f96 0%, #596164 100%)',
        primary: '#868f96',
        primaryAlpha: 'rgba(134, 143, 150, 0.2)',
        secondary: '#b8c6db',
        icon: '⏸️'
      }
    };

    return colorSchemes[state] || colorSchemes.off;
  }

  /**
   * Získá stav entity
   */
  getEntityState() {
    if (!this._hass || !this._config.entity) return null;
    return this._hass.states[this._config.entity];
  }

  /**
   * Zpracuje změnu teploty
   */
  handleTemperatureChange(delta) {
    const entity = this.getEntityState();
    if (!entity) return;

    const currentTemp = parseFloat(entity.attributes.temperature) || 20;
    const newTemp = Math.round((currentTemp + delta) / this._config.step) * this._config.step;

    // Kontrola min/max
    const minTemp = entity.attributes.min_temp || 5;
    const maxTemp = entity.attributes.max_temp || 35;
    const clampedTemp = Math.max(minTemp, Math.min(maxTemp, newTemp));

    this._hass.callService('climate', 'set_temperature', {
      entity_id: this._config.entity,
      temperature: clampedTemp
    });
  }

  /**
   * Vykreslí kartu
   */
  render() {
    if (!this._hass || !this._config.entity) return;

    const entity = this.getEntityState();
    if (!entity) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div style="padding: 16px; color: red;">
            Entita "${this._config.entity}" nebyla nalezena!
          </div>
        </ha-card>
      `;
      return;
    }

    const currentTemp = entity.attributes.current_temperature;
    const targetTemp = entity.attributes.temperature;
    const state = entity.state;
    const name = this._config.name || entity.attributes.friendly_name || 'Termostat';
    const colors = this.getStateColors(state);

    const stateText = {
      heating: 'Topení',
      cooling: 'Chlazení',
      idle: 'Nečinný',
      off: 'Vypnuto'
    }[state] || state;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .card-container {
          background: ${colors.gradient};
          border-radius: 24px;
          padding: 24px;
          color: white;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .card-container::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.3; }
        }

        .card-content {
          position: relative;
          z-index: 1;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .name {
          font-size: 24px;
          font-weight: 600;
          font-family: 'Roboto', sans-serif;
          letter-spacing: -0.5px;
        }

        .state-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }

        .temperature-display {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 40px;
          margin: 30px 0;
        }

        .current-temp {
          text-align: center;
        }

        .current-temp-label {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 500;
        }

        .current-temp-value {
          font-size: 72px;
          font-weight: 700;
          line-height: 1;
          font-family: 'Roboto', sans-serif;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .temp-unit {
          font-size: 32px;
          opacity: 0.8;
        }

        .target-temp {
          text-align: center;
          opacity: 0.9;
        }

        .target-temp-label {
          font-size: 12px;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 500;
        }

        .target-temp-value {
          font-size: 36px;
          font-weight: 600;
          font-family: 'Roboto', sans-serif;
        }

        .controls {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 30px 0;
        }

        .temp-button {
          background: rgba(255, 255, 255, 0.25);
          border: 2px solid rgba(255, 255, 255, 0.4);
          color: white;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          font-size: 32px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .temp-button:hover {
          background: rgba(255, 255, 255, 0.35);
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .temp-button:active {
          transform: scale(0.95);
        }

        .graph-container {
          margin-top: 30px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 16px;
          padding: 20px;
          backdrop-filter: blur(10px);
        }

        .graph-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          text-align: center;
          opacity: 0.9;
        }

        #temperatureChart {
          max-height: 200px;
        }

        .no-graph {
          text-align: center;
          padding: 40px 20px;
          opacity: 0.7;
          font-size: 14px;
        }

        @media (max-width: 600px) {
          .card-container {
            padding: 20px;
          }

          .temperature-display {
            flex-direction: column;
            gap: 20px;
          }

          .current-temp-value {
            font-size: 64px;
          }
        }
      </style>

      <div class="card-container">
        <div class="card-content">
          <div class="header">
            <div class="name">${name}</div>
            <div class="state-badge">
              <span>${colors.icon}</span>
              <span>${stateText}</span>
            </div>
          </div>

          <div class="temperature-display">
            <div class="current-temp">
              <div class="current-temp-label">Aktuální teplota</div>
              <div class="current-temp-value">
                ${currentTemp !== null ? currentTemp.toFixed(1) : '--'}
                <span class="temp-unit">°C</span>
              </div>
            </div>

            <div class="target-temp">
              <div class="target-temp-label">Cílová teplota</div>
              <div class="target-temp-value">
                ${targetTemp !== null ? targetTemp.toFixed(1) : '--'}°C
              </div>
            </div>
          </div>

          <div class="controls">
            <button class="temp-button" id="decreaseTemp">−</button>
            <button class="temp-button" id="increaseTemp">+</button>
          </div>

          ${this._config.show_graph ? `
            <div class="graph-container">
              <div class="graph-title">📊 Historie teploty (${this._config.graph_hours}h)</div>
              <canvas id="temperatureChart"></canvas>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Přidej event listenery
    const decreaseBtn = this.shadowRoot.getElementById('decreaseTemp');
    const increaseBtn = this.shadowRoot.getElementById('increaseTemp');

    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', () => this.handleTemperatureChange(-this._config.step));
    }

    if (increaseBtn) {
      increaseBtn.addEventListener('click', () => this.handleTemperatureChange(this._config.step));
    }
  }

  /**
   * Vrátí velikost karty (pro layout)
   */
  getCardSize() {
    return this._config.show_graph ? 6 : 4;
  }

  /**
   * Vrátí konfigurační editor
   */
  static getConfigElement() {
    return document.createElement('thermostat-card-editor');
  }

  /**
   * Vrátí výchozí konfiguraci
   */
  static getStubConfig() {
    return {
      entity: '',
      show_graph: true,
      graph_hours: 12,
      step: 0.5
    };
  }
}

/**
 * Editor konfigurace
 */
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

    // Pokud ještě nebyl vykreslen, vykresli nyní
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

    // Získej všechny climate entity
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
          <div class="helper-text">Vyberte termostat, který chcete ovládat</div>
        </div>

        <div class="config-row">
          <label for="name">Vlastní název (volitelné)</label>
          <input
            type="text"
            id="name"
            placeholder="např. Obývák"
            value="${this._config.name || ''}"
          />
          <div class="helper-text">Ponechte prázdné pro použití názvu entity</div>
        </div>

        <div class="config-row">
          <div class="checkbox-row">
            <input
              type="checkbox"
              id="show_graph"
              ${this._config.show_graph !== false ? 'checked' : ''}
            />
            <label for="show_graph">Zobrazit historický graf</label>
          </div>
        </div>

        <div class="config-row">
          <label for="graph_hours">Počet hodin v grafu</label>
          <input
            type="number"
            id="graph_hours"
            min="1"
            max="48"
            value="${this._config.graph_hours || 12}"
          />
          <div class="helper-text">Kolik hodin zobrazit v grafu (1-48)</div>
        </div>

        <div class="config-row">
          <label for="step">Krok změny teploty</label>
          <input
            type="number"
            id="step"
            min="0.1"
            max="2"
            step="0.1"
            value="${this._config.step || 0.5}"
          />
          <div class="helper-text">O kolik °C se změní teplota při kliknutí na tlačítko</div>
        </div>
      </div>
    `;

    // Přidej event listenery
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

// Registruj custom elementy
customElements.define('thermostat-card', ThermostatCard);
customElements.define('thermostat-card-editor', ThermostatCardEditor);

// Přidej do window pro debug
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'thermostat-card',
  name: 'Thermostat Control Card',
  description: 'Moderní karta pro ovládání termostatů s grafem a barevným designem',
  preview: true,
  documentationURL: 'https://github.com/yourusername/thermostat-card'
});

console.info(
  '%c THERMOSTAT-CARD %c v1.0.0 ',
  'color: white; background: #ff6b6b; font-weight: 700;',
  'color: #ff6b6b; background: white; font-weight: 700;'
);
