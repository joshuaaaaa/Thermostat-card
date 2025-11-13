/**
 * Thermostat Control Card
 * Moderní glassmorphic karta pro ovládání termostatů v Home Assistant
 *
 * Design Trends 2025:
 * - Glassmorphism (frosted glass effect)
 * - Circular control (Nest-inspired)
 * - Neumorphic elements
 * - Ambient backgrounds
 * - Micro-interactions
 *
 * @version 2.0.0
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
    this._rendered = false; // Flag pro prevenci blikání
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

    this._rendered = false; // Reset při změně konfigurace
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

    // Vytvoř nový graf s moderním stylem
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
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: colors.primary,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 3
          },
          {
            label: 'Cíl',
            data: history.map(d => d.target),
            borderColor: 'rgba(255, 255, 255, 0.5)',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [8, 4],
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6
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
              color: 'rgba(255, 255, 255, 0.9)',
              font: {
                size: 11,
                family: "'Inter', 'Roboto', sans-serif",
                weight: '500'
              },
              padding: 12,
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 6,
              boxHeight: 6
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: colors.primary,
            borderWidth: 2,
            padding: 16,
            displayColors: true,
            cornerRadius: 12,
            titleFont: {
              size: 13,
              weight: '600'
            },
            bodyFont: {
              size: 12
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
            grid: {
              color: 'rgba(255, 255, 255, 0.08)',
              drawBorder: false,
              lineWidth: 1
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
              maxRotation: 0,
              autoSkipPadding: 20,
              font: {
                size: 10,
                family: "'Inter', 'Roboto', sans-serif"
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.08)',
              drawBorder: false,
              lineWidth: 1
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
              font: {
                size: 10,
                family: "'Inter', 'Roboto', sans-serif"
              },
              callback: function(value) {
                return value + '°';
              }
            }
          }
        }
      }
    });
  }

  /**
   * Získá barvy podle stavu - Barevné živé pozadí
   */
  getStateColors(state) {
    const colorSchemes = {
      heating: {
        ambient: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 50%, #ff6b9d 100%)',
        gradient: 'linear-gradient(180deg, rgba(255,107,107,0.25) 0%, rgba(255,142,83,0.15) 100%)',
        primary: '#ff6b6b',
        primaryRgb: '255, 107, 107',
        glow: '#ff4444',
        icon: '🔥',
        label: 'Topení',
        bgColor: '#fff5f5'
      },
      cooling: {
        ambient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%)',
        gradient: 'linear-gradient(180deg, rgba(79,172,254,0.25) 0%, rgba(0,242,254,0.15) 100%)',
        primary: '#4facfe',
        primaryRgb: '79, 172, 254',
        glow: '#00d4ff',
        icon: '❄️',
        label: 'Chlazení',
        bgColor: '#f0f9ff'
      },
      idle: {
        ambient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #a6c1ee 100%)',
        gradient: 'linear-gradient(180deg, rgba(168,237,234,0.25) 0%, rgba(254,214,227,0.15) 100%)',
        primary: '#5ed4c8',
        primaryRgb: '94, 212, 200',
        glow: '#4fd1c5',
        icon: '✓',
        label: 'Připraveno',
        bgColor: '#f0fdfa'
      },
      off: {
        ambient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        gradient: 'linear-gradient(180deg, rgba(102,126,234,0.2) 0%, rgba(118,75,162,0.1) 100%)',
        primary: '#8b9dc3',
        primaryRgb: '139, 157, 195',
        glow: '#667eea',
        icon: '○',
        label: 'Vypnuto',
        bgColor: '#faf5ff'
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

    // Haptic feedback pro mobil
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  /**
   * Vypočítá progress pro cirkulární ring (0-100%)
   */
  calculateProgress(current, min, max) {
    if (current === null || current === undefined) return 0;
    const range = max - min;
    const value = Math.max(min, Math.min(max, current)) - min;
    return (value / range) * 100;
  }

  /**
   * Aktualizuje hodnoty v již vykresleném DOMu (prevence blikání)
   */
  updateValues(currentTemp, targetTemp, state, name, colors, strokeOffset) {
    // Update pozadí
    const ambientBg = this.shadowRoot.querySelector('.ambient-bg');
    if (ambientBg) {
      ambientBg.style.background = colors.ambient;
    }

    // Update status chip
    const statusChip = this.shadowRoot.querySelector('.status-chip');
    if (statusChip) {
      statusChip.style.background = colors.primary;
      statusChip.style.boxShadow = `0 4px 12px rgba(${colors.primaryRgb}, 0.3)`;
      const statusIcon = statusChip.querySelector('.status-icon');
      if (statusIcon) statusIcon.textContent = colors.icon;
      const statusLabel = statusChip.querySelector('span:last-child');
      if (statusLabel) statusLabel.textContent = colors.label;
    }

    // Update aktuální teplota
    const currentTempEl = this.shadowRoot.querySelector('.current-temp');
    if (currentTempEl) {
      currentTempEl.style.color = colors.primary;
      currentTempEl.style.textShadow = `0 4px 24px rgba(${colors.primaryRgb}, 0.3)`;
      const tempText = currentTempEl.childNodes[0];
      if (tempText) {
        tempText.textContent = currentTemp !== null ? currentTemp.toFixed(1) : '--';
      }
    }

    // Update cílová teplota
    const targetValue = this.shadowRoot.querySelector('.target-value');
    if (targetValue) {
      targetValue.textContent = `${targetTemp !== null ? targetTemp.toFixed(1) : '--'}°`;
    }

    // Update progress ring
    const progressRing = this.shadowRoot.querySelector('.progress-ring-fill');
    if (progressRing) {
      progressRing.style.stroke = colors.primary;
      progressRing.style.strokeDashoffset = strokeOffset;
      progressRing.style.filter = `drop-shadow(0 0 12px ${colors.glow})`;
    }

    // Update tlačítka
    const buttons = this.shadowRoot.querySelectorAll('.neuro-button');
    buttons.forEach(button => {
      button.style.color = colors.primary;
      const icon = button.querySelector('.button-icon');
      if (icon) {
        icon.style.textShadow = `0 2px 6px rgba(${colors.primaryRgb}, 0.2)`;
      }
    });

    // Update název (pokud se změnil)
    const nameEl = this.shadowRoot.querySelector('.name');
    if (nameEl && nameEl.textContent !== name) {
      nameEl.textContent = name;
    }
  }

  /**
   * Vykreslí kartu
   */
  render() {
    if (!this._hass || !this._config.entity) return;

    const entity = this.getEntityState();
    if (!entity) {
      this.shadowRoot.innerHTML = `
        <div style="padding: 24px; color: #ff6b6b; font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #ffe5e5, #ffd5d5); border-radius: 24px;">
          <strong>⚠️ Entita nenalezena</strong><br>
          <span style="opacity: 0.7; font-size: 14px;">"${this._config.entity}"</span>
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

    // Vypočítej progress pro ring
    const progress = this.calculateProgress(currentTemp, minTemp, maxTemp);
    const circumference = 2 * Math.PI * 110; // radius 110
    const strokeOffset = circumference - (progress / 100) * circumference;

    // Pokud už je karta vykreslená, pouze updateuj hodnoty (prevence blikání)
    if (this._rendered) {
      this.updateValues(currentTemp, targetTemp, state, name, colors, strokeOffset);
      return;
    }

    // První render - vytvoř kompletní HTML
    this._rendered = true;

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        :host {
          display: block;
          font-family: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* Ambient Background Container */
        .ambient-bg {
          background: ${colors.ambient};
          border-radius: 28px;
          padding: 4px;
          position: relative;
          overflow: hidden;
          transition: background 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        }

        /* Glassmorphic Card */
        .glass-card {
          background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(255, 255, 255, 0.85) 100%
          );
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-radius: 26px;
          border: 2px solid rgba(255, 255, 255, 0.8);
          padding: 32px 28px;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 1);
        }

        /* Ambient glow */
        .glass-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: ${colors.gradient};
          animation: ambientPulse 8s ease-in-out infinite;
          pointer-events: none;
          opacity: 0.3;
        }

        @keyframes ambientPulse {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(-10px, -10px) scale(1.05);
            opacity: 0.5;
          }
        }

        .card-content {
          position: relative;
          z-index: 1;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .name {
          font-size: 18px;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.85);
          letter-spacing: -0.3px;
        }

        .status-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: ${colors.primary};
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.95);
          letter-spacing: 0.3px;
          text-transform: uppercase;
          box-shadow: 0 4px 12px rgba(${colors.primaryRgb}, 0.3);
          transition: all 0.3s ease;
        }

        .status-icon {
          font-size: 14px;
          filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.5));
        }

        /* Circular Thermostat Control - Nest Inspired */
        .circular-control {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 36px 0;
          position: relative;
        }

        .circle-container {
          position: relative;
          width: 260px;
          height: 260px;
        }

        /* SVG Circle */
        .progress-ring {
          transform: rotate(-90deg);
          filter: drop-shadow(0 0 20px rgba(${colors.primaryRgb}, 0.5));
        }

        .progress-ring-bg {
          fill: none;
          stroke: rgba(255, 255, 255, 0.08);
          stroke-width: 8;
        }

        .progress-ring-fill {
          fill: none;
          stroke: ${colors.primary};
          stroke-width: 8;
          stroke-linecap: round;
          stroke-dasharray: ${circumference};
          stroke-dashoffset: ${strokeOffset};
          transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          filter: drop-shadow(0 0 12px ${colors.glow});
        }

        /* Temperature Display - Center of Circle */
        .temp-display {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .current-temp {
          font-size: 72px;
          font-weight: 800;
          color: ${colors.primary};
          line-height: 1;
          letter-spacing: -3px;
          text-shadow: 0 4px 24px rgba(${colors.primaryRgb}, 0.3);
          margin-bottom: 8px;
          transition: color 0.6s ease, text-shadow 0.6s ease;
        }

        .temp-unit {
          font-size: 28px;
          font-weight: 600;
          opacity: 0.6;
          margin-left: 2px;
        }

        .target-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.5);
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .target-value {
          color: rgba(0, 0, 0, 0.75);
          font-weight: 700;
          font-size: 16px;
        }

        .arrow-icon {
          font-size: 12px;
          opacity: 0.5;
        }

        /* Neumorphic Control Buttons */
        .controls {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin: 32px 0 24px 0;
        }

        .neuro-button {
          position: relative;
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: linear-gradient(145deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6));
          border: 2px solid rgba(255, 255, 255, 0.9);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 600;
          color: ${colors.primary};
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow:
            0 4px 16px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 1);
          backdrop-filter: blur(10px);
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .neuro-button:hover {
          background: ${colors.primary};
          color: white;
          transform: translateY(-2px) scale(1.05);
          box-shadow:
            0 8px 24px rgba(${colors.primaryRgb}, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .neuro-button:active {
          transform: translateY(0px) scale(0.98);
          box-shadow:
            0 4px 12px rgba(${colors.primaryRgb}, 0.3),
            inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .button-icon {
          font-size: 32px;
          line-height: 1;
          text-shadow: 0 2px 6px rgba(${colors.primaryRgb}, 0.2);
          transition: text-shadow 0.2s ease;
        }

        .neuro-button:hover .button-icon {
          text-shadow: 0 2px 8px rgba(255, 255, 255, 0.5);
        }

        /* Graph Section */
        .graph-section {
          margin-top: 36px;
          background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.6) 0%,
            rgba(255, 255, 255, 0.4) 100%
          );
          border-radius: 20px;
          padding: 24px 20px;
          border: 2px solid rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .graph-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .graph-title {
          font-size: 13px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.7);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .graph-icon {
          font-size: 16px;
          opacity: 0.6;
          filter: grayscale(0);
        }

        #temperatureChart {
          max-height: 180px;
        }

        /* Responsive */
        @media (max-width: 600px) {
          .glass-card {
            padding: 24px 20px;
          }

          .circle-container {
            width: 220px;
            height: 220px;
          }

          .current-temp {
            font-size: 56px;
          }

          .neuro-button {
            width: 60px;
            height: 60px;
          }

          .button-icon {
            font-size: 28px;
          }
        }

        /* Subtle animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }

        .status-icon {
          animation: float 3s ease-in-out infinite;
        }
      </style>

      <div class="ambient-bg">
        <div class="glass-card">
          <div class="card-content">
            <!-- Header -->
            <div class="header">
              <div class="name">${name}</div>
              <div class="status-chip">
                <span class="status-icon">${colors.icon}</span>
                <span>${colors.label}</span>
              </div>
            </div>

            <!-- Circular Control -->
            <div class="circular-control">
              <div class="circle-container">
                <!-- SVG Progress Ring -->
                <svg class="progress-ring" width="260" height="260">
                  <!-- Background circle -->
                  <circle class="progress-ring-bg" cx="130" cy="130" r="110"/>
                  <!-- Progress circle -->
                  <circle class="progress-ring-fill" cx="130" cy="130" r="110"/>
                </svg>

                <!-- Temperature Display -->
                <div class="temp-display">
                  <div class="current-temp">
                    ${currentTemp !== null ? currentTemp.toFixed(1) : '--'}
                    <span class="temp-unit">°</span>
                  </div>
                  <div class="target-display">
                    <span>Cíl</span>
                    <span class="arrow-icon">→</span>
                    <span class="target-value">${targetTemp !== null ? targetTemp.toFixed(1) : '--'}°</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Neumorphic Controls -->
            <div class="controls">
              <button class="neuro-button" id="decreaseTemp" title="Snížit teplotu">
                <span class="button-icon">−</span>
              </button>
              <button class="neuro-button" id="increaseTemp" title="Zvýšit teplotu">
                <span class="button-icon">+</span>
              </button>
            </div>

            <!-- Graph Section -->
            ${this._config.show_graph ? `
              <div class="graph-section">
                <div class="graph-header">
                  <span class="graph-icon">📈</span>
                  <span class="graph-title">Historie ${this._config.graph_hours}h</span>
                </div>
                <canvas id="temperatureChart"></canvas>
              </div>
            ` : ''}
          </div>
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
    return this._config.show_graph ? 7 : 5;
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
  description: '🔥 Moderní glassmorphic karta s cirkulárním ovládáním inspirovaným designem 2025',
  preview: true,
  documentationURL: 'https://github.com/yourusername/thermostat-card'
});

console.info(
  '%c THERMOSTAT-CARD %c v2.0.0 ',
  'color: white; background: linear-gradient(90deg, #ff6b6b, #4facfe); font-weight: 700; padding: 4px 8px; border-radius: 4px 0 0 4px;',
  'color: #4facfe; background: white; font-weight: 700; padding: 4px 8px; border-radius: 0 4px 4px 0;'
);
