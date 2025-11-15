/**
 * Thermostat Control Card
 * Kompaktní karta pro ovládání termostatů v Home Assistant
 *
 * Design inspirovaný Nest termostatem - kompaktní, praktický, dashboard-friendly
 * Profesionální Flip Display inspirovaný @pqina/flip
 *
 * @version 3.0.0
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
    this._previousFlipValue = null;
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
      flip_entity: config.flip_entity || '',
      flip_digits_per_card: config.flip_digits_per_card !== undefined ? config.flip_digits_per_card : 1,
      flip_number_of_cards: config.flip_number_of_cards !== undefined ? config.flip_number_of_cards : 2,
      flip_hide_background: config.flip_hide_background !== false,
      flip_font_size: config.flip_font_size || '2em',
      flip_show_label: config.flip_show_label !== false,
      flip_label_text: config.flip_label_text || '',
      flip_show_unit: config.flip_show_unit !== false,
      flip_unit: config.flip_unit || '',
      flip_decimal_places: config.flip_decimal_places !== undefined ? config.flip_decimal_places : 1,
      flip_animation_duration: config.flip_animation_duration || 600,
      flip_card_color: config.flip_card_color || '#ffffff',
      flip_background_color: config.flip_background_color || '#333333',
      flip_gap: config.flip_gap || 6,
      custom_colors: config.custom_colors !== undefined ? config.custom_colors : false,
      color_heating: config.color_heating || '#ff6b6b',
      color_cooling: config.color_cooling || '#4facfe',
      color_idle: config.color_idle || '#10b981',
      color_off: config.color_off || '#6b7280',
      ...config
    };

    // Reset při změně konfigurace
    this._rendered = false;
    if (this._chartInstance) {
      this._chartInstance.destroy();
      this._chartInstance = null;
    }
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
          .filter(state => state.attributes && state.attributes.current_temperature !== null && state.attributes.current_temperature !== undefined)
          .map(state => ({
            time: new Date(state.last_changed),
            temperature: parseFloat(state.attributes.current_temperature) || 0,
            target: parseFloat(state.attributes.temperature) || parseFloat(state.attributes.current_temperature) || 0
          }))
          .filter(item => !isNaN(item.temperature) && item.temperature > 0);
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

    const entity = this._hass.states[this._config.entity];
    const state = entity ? entity.state : 'off';
    const colors = this.getStateColors(state);

    // Pokud graf už existuje, pouze updateuj data (prevence blikání)
    if (this._chartInstance) {
      this._chartInstance.data.labels = history.map(d => d.time.toLocaleTimeString('cs-CZ', {
        hour: '2-digit',
        minute: '2-digit'
      }));
      this._chartInstance.data.datasets[0].data = history.map(d => d.temperature);
      this._chartInstance.data.datasets[0].borderColor = colors.primary;
      this._chartInstance.data.datasets[0].backgroundColor = colors.gradient;
      this._chartInstance.data.datasets[1].data = history.map(d => d.target);
      this._chartInstance.options.plugins.tooltip.borderColor = colors.primary;
      this._chartInstance.update('none'); // 'none' = bez animace pro okamžitý update
      return;
    }

    // První vytvoření grafu
    const ctx = canvas.getContext('2d');

    // Vytvoř barevný gradient pro pozadí
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, colors.gradient);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    this._chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: history.map(d => d.time.toLocaleTimeString(lang === 'cs' ? 'cs-CZ' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })),
        datasets: [
          {
            label: t.current,
            data: history.map(d => d.temperature),
            borderColor: colors.primary,
            backgroundColor: gradient,
            borderWidth: 3,
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: colors.primary,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2
          },
          {
            label: t.target_short,
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
        animation: false, // Vypni animace pro rychlejší render
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

  getTranslations() {
    // Získej jazyk z Home Assistant (cs, en, de, etc.)
    const lang = this._hass?.language || this._hass?.locale?.language || 'en';

    const translations = {
      cs: {
        heating: 'Topení',
        cooling: 'Chlazení',
        idle: 'Připraveno',
        off: 'Vypnuto',
        target: 'Cíl',
        history: 'Historie teploty',
        current: 'Aktuální',
        target_short: 'Cíl'
      },
      en: {
        heating: 'Heating',
        cooling: 'Cooling',
        idle: 'Ready',
        off: 'Off',
        target: 'Target',
        history: 'Temperature history',
        current: 'Current',
        target_short: 'Target'
      }
    };

    // Fallback na angličtinu pro nepodporované jazyky
    return translations[lang] || translations['en'];
  }

  getStateColors(entity) {
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
    };

    const createColorScheme = (color, icon, label) => {
      const rgb = hexToRgb(color);
      return {
        primary: color,
        primaryRgb: rgb,
        gradient: `rgba(${rgb}, 0.15)`,
        bg: `linear-gradient(135deg, rgba(${rgb}, 0.03) 0%, rgba(${rgb}, 0.08) 100%)`,
        icon: icon,
        label: label
      };
    };

    const t = this.getTranslations();
    const baseColors = {
      heating: { color: this._config.custom_colors ? this._config.color_heating : '#ff6b6b', icon: '🔥', label: t.heating },
      cooling: { color: this._config.custom_colors ? this._config.color_cooling : '#4facfe', icon: '❄️', label: t.cooling },
      idle: { color: this._config.custom_colors ? this._config.color_idle : '#10b981', icon: '✓', label: t.idle },
      off: { color: this._config.custom_colors ? this._config.color_off : '#6b7280', icon: '○', label: t.off }
    };

    // Pokud není entita, vrať výchozí barvu
    if (!entity) {
      return createColorScheme(baseColors.off.color, baseColors.off.icon, baseColors.off.label);
    }

    // Použij hvac_action pro skutečný stav (heating/cooling/idle)
    const hvacAction = entity.attributes?.hvac_action?.toLowerCase();
    const hvacMode = entity.state?.toLowerCase();

    // Prioritně použij hvac_action (skutečný stav topení/chlazení)
    if (hvacAction === 'heating') {
      return createColorScheme(baseColors.heating.color, baseColors.heating.icon, baseColors.heating.label);
    } else if (hvacAction === 'cooling') {
      return createColorScheme(baseColors.cooling.color, baseColors.cooling.icon, baseColors.cooling.label);
    } else if (hvacAction === 'idle') {
      return createColorScheme(baseColors.idle.color, baseColors.idle.icon, baseColors.idle.label);
    } else if (hvacMode === 'off') {
      // Když je vypnuto, použij barvu off
      return createColorScheme(baseColors.off.color, baseColors.off.icon, baseColors.off.label);
    } else {
      // Fallback - když není hvac_action ale je zapnuto, zobraz jako připraveno
      return createColorScheme(baseColors.idle.color, baseColors.idle.icon, baseColors.idle.label);
    }
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

  updateValues(currentTemp, targetTemp, state, name, colors, strokeOffset, targetStrokeOffset) {
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
      currentTempEl.textContent = currentTemp !== null ? currentTemp.toFixed(1) : '--';
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

    const targetRing = this.shadowRoot.querySelector('.progress-ring-target');
    if (targetRing) {
      targetRing.style.stroke = colors.primary;
      targetRing.style.strokeDashoffset = targetStrokeOffset;
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

    // Update flip display
    this.updateFlipDisplay();
  }

  getFlipCards() {
    if (!this._config.flip_entity || !this._hass) return '';

    const flipEntity = this._hass.states[this._config.flip_entity];
    if (!flipEntity) return '';

    const value = parseFloat(flipEntity.state);
    if (isNaN(value)) return '';

    const valueStr = value.toFixed(this._config.flip_decimal_places);
    const digits = valueStr.replace('.', '').split('');
    const digitsPerCard = this._config.flip_digits_per_card;
    const numberOfCards = this._config.flip_number_of_cards;

    // Automaticky detekuj jednotku z entity
    const autoUnit = flipEntity.attributes.unit_of_measurement || '';
    const displayUnit = this._config.flip_unit || autoUnit;

    // Automaticky detekuj label z friendly_name
    const autoLabel = flipEntity.attributes.friendly_name || '';
    const displayLabel = this._config.flip_label_text || autoLabel;

    let html = '<div class="flip-display-container">';

    // Label nahoře
    if (this._config.flip_show_label && displayLabel) {
      html += `<div class="flip-label">${displayLabel}</div>`;
    }

    // Řádek s kartami a jednotkou
    html += '<div class="flip-cards-row">';

    // Flip karty - PŘESNÁ STRUKTURA z @pqina/flip
    for (let i = 0; i < numberOfCards; i++) {
      const startIdx = i * digitsPerCard;
      const endIdx = startIdx + digitsPerCard;
      const cardDigits = digits.slice(startIdx, endIdx);
      const displayValue = cardDigits.join('') || '0';

      html += `
        <div class="flip-card ${this._config.flip_hide_background ? 'no-background' : ''}" data-card="${i}" style="font-size: ${this._config.flip_font_size};">
          <!-- Spacer pro výšku -->
          <span class="flip-card-spacer">${displayValue}</span>

          <!-- Shadow elementy (statické rámy) -->
          <span class="flip-card-shadow flip-shadow-top"></span>
          <span class="flip-card-shadow flip-shadow-bottom"></span>

          <!-- Bottom shadow pod kartou -->
          <span class="flip-card-bottom-shadow"></span>

          <!-- Animační kontejner -->
          <div class="flip-card-animation">
            <!-- Front panel (horní polovina) -->
            <div class="flip-panel-front">
              <div class="flip-panel-front-text">
                <div class="flip-panel-text-wrapper">
                  <span>${displayValue}</span>
                </div>
              </div>
              <span class="flip-panel-front-shadow"></span>
            </div>

            <!-- Back panel (dolní polovina) -->
            <div class="flip-panel-back">
              <div class="flip-panel-back-text">
                <div class="flip-panel-text-wrapper">
                  <span>${displayValue}</span>
                </div>
              </div>
              <span class="flip-panel-back-shadow"></span>
              <span class="flip-panel-back-highlight"></span>
            </div>
          </div>
        </div>
      `;
    }

    // Jednotka
    if (this._config.flip_show_unit && displayUnit) {
      html += `<div class="flip-unit">${displayUnit}</div>`;
    }

    html += '</div>'; // close flip-cards-row
    html += '</div>'; // close flip-display-container

    return html;
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
    const colors = this.getStateColors(entity);
    const t = this.getTranslations();
    const lang = this._hass?.language || this._hass?.locale?.language || 'en';

    const progress = this.calculateProgress(currentTemp, minTemp, maxTemp);
    const targetProgress = this.calculateProgress(targetTemp, minTemp, maxTemp);
    const circumference = 2 * Math.PI * 52;
    const strokeOffset = circumference - (progress / 100) * circumference;
    const targetStrokeOffset = circumference - (targetProgress / 100) * circumference;

    if (this._rendered) {
      this.updateValues(currentTemp, targetTemp, state, name, colors, strokeOffset, targetStrokeOffset);
      return;
    }

    this._rendered = true;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --flip-gap: ${this._config.flip_gap}px;
          --flip-card-color: ${this._config.flip_card_color};
          --flip-background-color: ${this._config.flip_background_color};
          --flip-animation-duration: ${this._config.flip_animation_duration}ms;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .thermostat-card {
          background: ${colors.bg};
          border-radius: 12px;
          padding: 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          transition: background 0.4s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          container-type: inline-size;
          max-width: 100%;
        }

        .card-content {
          transition: zoom 0.3s ease;
        }

        @container (max-width: 420px) {
          .card-content {
            zoom: 0.9;
          }
        }

        @container (max-width: 350px) {
          .card-content {
            zoom: 0.8;
          }
        }

        @container (max-width: 280px) {
          .card-content {
            zoom: 0.7;
          }
        }

        @container (max-width: 220px) {
          .card-content {
            zoom: 0.6;
          }
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .entity-name {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
        }

        .status-chip {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 3px 8px;
          background: ${colors.primary};
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          box-shadow: 0 2px 4px rgba(${colors.primaryRgb}, 0.3);
          transition: all 0.3s ease;
        }

        .status-icon {
          font-size: 10px;
        }

        .main-content {
          display: grid;
          grid-template-columns: ${this._config.show_graph ? '160px 1fr' : '1fr'};
          gap: 12px;
          align-items: center;
        }

        .thermostat-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .circle-container {
          position: relative;
          width: 120px;
          height: 120px;
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

        .progress-ring-target {
          fill: none;
          stroke: ${colors.primary};
          stroke-width: 3;
          stroke-linecap: round;
          stroke-dasharray: ${circumference};
          stroke-dashoffset: ${targetStrokeOffset};
          stroke-dasharray: 8 4;
          opacity: 0.5;
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
          font-size: 36px;
          font-weight: 700;
          color: ${colors.primary};
          line-height: 1;
          transition: color 0.4s ease;
        }

        .temp-unit {
          font-size: 16px;
          opacity: 0.5;
          margin-left: 2px;
        }

        .target-temp {
          margin-top: 2px;
          font-size: 11px;
          color: #6b7280;
        }

        .target-temp-value {
          font-weight: 600;
          color: #374151;
        }

        .controls {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .control-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: white;
          border: 2px solid ${colors.primary};
          color: ${colors.primary};
          font-size: 18px;
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
          gap: 6px;
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
          border-radius: 10px;
          padding: 10px;
          height: ${this._config.flip_entity ? '90px' : '110px'};
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        #temperatureChart {
          width: 100% !important;
          height: 100% !important;
        }

        /* Flip Display - Profesionální implementace s přesnými hodnotami */
        .flip-display {
          display: flex;
          justify-content: center;
          gap: var(--flip-gap, 6px);
          margin-top: 6px;
        }

        .flip-display-container {
          background: white;
          border-radius: 8px;
          padding: 10px 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          margin-top: 6px;
          min-height: 50px;
          overflow: visible;
          width: 100%;
        }

        .flip-label {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .flip-cards-row {
          display: flex;
          gap: 0;
          align-items: center;
          line-height: 1.8em;
        }

        .flip-unit {
          font-size: 16px;
          font-weight: 600;
          color: #6b7280;
          margin-left: 8px;
        }

        .flip-card {
          position: relative;
          text-align: center;
          width: 1.25em;
          aspect-ratio: 1.25 / 1.8;
          perspective: 4em;
          border-radius: 0.15em;
          letter-spacing: 0.06em;
          margin-left: 0.025em;
          margin-right: 0.025em;
        }

        .flip-card.no-background {
          background: none !important;
          box-shadow: none !important;
        }

        /* Spacer pro správnou výšku */
        .flip-card-spacer {
          visibility: hidden;
          display: block;
          font-weight: 700;
          line-height: 1.8em;
        }

        /* Shadow efekty - DVĚ VRSTVY! */
        .flip-card-shadow {
          position: absolute;
          inset: 1px;
          color: transparent !important;
          background: none !important;
          pointer-events: none;
        }

        .flip-shadow-top {
          bottom: calc(50% - 1px);
          border-top-left-radius: 0.15em;
          border-top-right-radius: 0.15em;
          box-shadow:
            0 0.125em 0.3125em rgba(0, 0, 0, 0.25),
            0 0.02125em 0.06125em rgba(0, 0, 0, 0.25);
        }

        .flip-shadow-bottom {
          top: calc(50% + 1px);
          border-bottom-left-radius: 0.15em;
          border-bottom-right-radius: 0.15em;
          box-shadow:
            0 0.125em 0.3125em rgba(0, 0, 0, 0.25),
            0 0.02125em 0.06125em rgba(0, 0, 0, 0.25);
        }

        /* Animační kontejner */
        .flip-card-animation {
          z-index: 1;
          perspective: 4em;
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
        }

        /* Front a back panely - 51% výška! */
        .flip-panel-front,
        .flip-panel-back {
          backface-visibility: hidden;
          width: 100%;
          height: 51%;
          transform-style: preserve-3d;
          position: absolute;
          left: 0;
          background-color: var(--flip-background-color, #333);
          border-radius: 0.15em;
          overflow: hidden;
        }

        .flip-panel-front {
          transform-origin: bottom;
          z-index: 2;
          top: 0;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          box-shadow: inset 0 1px rgba(255, 255, 255, 0.05);
        }

        .flip-panel-back {
          transform-origin: top;
          z-index: 1;
          top: 50%;
          border-top-left-radius: 0;
          border-top-right-radius: 0;
          box-shadow: inset 0 -1px rgba(0, 0, 0, 0.1);
        }

        /* Gradient overlay na back panelu - PŘESNÁ HODNOTA z @pqina/flip */
        .flip-panel-back::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(0, 0, 0, 0.3) 1px, rgba(0, 0, 0, 0.15) 0, transparent 30%);
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        /* Text containers - PŘESNÁ STRUKTURA z @pqina/flip */
        .flip-panel-front-text,
        .flip-panel-back-text {
          height: 100%;
          position: absolute;
          top: 0;
          left: -1px;
          right: -1px;
          overflow: hidden;
        }

        .flip-panel-text-wrapper {
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: calc(var(--flip-text-offset-vertical, 0em) + 0.04em);
          margin-left: calc(var(--flip-text-offset-horizontal, 0em) - 0.15em);
        }

        /* Front panel - text wrapper zabírá 200% výšky, zobrazuje se horní polovina */
        .flip-panel-front-text .flip-panel-text-wrapper {
          height: 200%;
          top: 0;
        }

        /* Back panel - text wrapper zabírá 200% výšky, posun -100% aby se zobrazila spodní polovina */
        .flip-panel-back-text .flip-panel-text-wrapper {
          height: 200%;
          top: -100%;
        }

        .flip-panel-text-wrapper span {
          font-weight: 700;
          color: var(--flip-card-color, #fff);
          position: relative;
          z-index: 2;
        }

        /* Shadow overlay pro animaci - PŘESNÁ STRUKTURA z @pqina/flip */
        .flip-panel-front-shadow,
        .flip-panel-back-shadow,
        .flip-panel-back-highlight {
          opacity: 0;
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .flip-panel-front-shadow {
          background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.3));
          border-top-left-radius: 0.15em;
          border-top-right-radius: 0.15em;
          z-index: 3;
        }

        .flip-panel-back-shadow {
          background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5));
          border-bottom-left-radius: 0.15em;
          border-bottom-right-radius: 0.15em;
          z-index: 2;
        }

        .flip-panel-back-highlight {
          background-image: linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.3));
          border-bottom-left-radius: 0.15em;
          border-bottom-right-radius: 0.15em;
          z-index: 3;
        }

        /* Card shadow pod kartou - PŘESNÉ HODNOTY */
        .flip-card-bottom-shadow {
          position: absolute;
          bottom: 0.125em;
          left: 0.15em;
          right: 0.15em;
          height: 0.5em;
          background-color: transparent;
          border-radius: 0;
          box-shadow: 0 0.125em 0.25em rgba(0, 0, 0, 0.5), 0 0.125em 0.5em rgba(0, 0, 0, 0.75);
          z-index: 0;
          opacity: 0;
          transform-origin: 0 100%;
        }

        /* Animace */
        .flip-card.flipping .flip-panel-front {
          animation: flipPanelDown var(--flip-animation-duration, 600ms) cubic-bezier(0.15, 0.85, 0.35, 1);
        }

        .flip-card.flipping .flip-panel-back {
          animation: flipPanelUp var(--flip-animation-duration, 600ms) cubic-bezier(0.15, 0.85, 0.35, 1);
        }

        .flip-card.flipping .flip-panel-front-shadow {
          animation: fadeInOut var(--flip-animation-duration, 600ms) cubic-bezier(0.4, 0, 0.2, 1);
        }

        .flip-card.flipping .flip-panel-back-shadow {
          animation: fadeInOut var(--flip-animation-duration, 600ms) cubic-bezier(0.4, 0, 0.2, 1);
        }

        .flip-card.flipping .flip-panel-back-highlight {
          animation: fadeInOut var(--flip-animation-duration, 600ms) cubic-bezier(0.4, 0, 0.2, 1);
        }

        .flip-card.flipping .flip-card-bottom-shadow {
          animation: shadowPulse var(--flip-animation-duration, 600ms) cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes flipPanelDown {
          0% {
            transform: rotateX(0deg);
          }
          100% {
            transform: rotateX(180deg);
          }
        }

        @keyframes flipPanelUp {
          0% {
            transform: rotateX(-180deg);
          }
          100% {
            transform: rotateX(0deg);
          }
        }

        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes shadowPulse {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 0.6;
          }
        }

        @media (max-width: 600px) {
          .main-content {
            grid-template-columns: 1fr;
          }

          .circle-container {
            width: 110px;
            height: 110px;
          }

          .current-temp-value {
            font-size: 32px;
          }
        }
      </style>

      <div class="thermostat-card">
        <div class="card-content">
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
                <svg class="progress-ring" width="120" height="120">
                  <circle class="progress-ring-bg" cx="60" cy="60" r="52"/>
                  <circle class="progress-ring-target" cx="60" cy="60" r="52"/>
                  <circle class="progress-ring-fill" cx="60" cy="60" r="52"/>
                </svg>
                <div class="temp-display">
                  <div>
                    <span class="current-temp-value">${currentTemp !== null ? currentTemp.toFixed(1) : '--'}</span>
                    <span class="temp-unit">°</span>
                  </div>
                  <div class="target-temp">
                    ${t.target}: <span class="target-temp-value">${targetTemp !== null ? targetTemp.toFixed(1) : '--'}°</span>
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
                  <div class="graph-title">📊 ${t.history}</div>
                  <div class="graph-period">${this._config.graph_hours}h</div>
                </div>
                <div class="graph-container">
                  <canvas id="temperatureChart"></canvas>
                </div>
                ${this._config.flip_entity ? this.getFlipCards() : ''}
              </div>
            ` : ''}
          </div>
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

    // Inicializuj flip display value při prvním renderu
    if (this._config.flip_entity && this._previousFlipValue === null) {
      const flipEntity = this._hass.states[this._config.flip_entity];
      if (flipEntity) {
        this._previousFlipValue = parseFloat(flipEntity.state);
      }
    }
  }

  updateFlipDisplay() {
    if (!this._config.flip_entity || !this._hass) return;

    const flipEntity = this._hass.states[this._config.flip_entity];
    if (!flipEntity) return;

    const currentValue = parseFloat(flipEntity.state);
    if (isNaN(currentValue)) return;

    // Zkontroluj jestli se hodnota změnila
    if (this._previousFlipValue !== null && this._previousFlipValue !== currentValue) {
      // Spusť flip animaci
      this.triggerFlipAnimation(currentValue);
    }

    this._previousFlipValue = currentValue;
  }

  triggerFlipAnimation(newValue) {
    const valueStr = newValue.toFixed(this._config.flip_decimal_places);
    const digits = valueStr.replace('.', '').split('');
    const digitsPerCard = this._config.flip_digits_per_card;
    const numberOfCards = this._config.flip_number_of_cards;
    const animDuration = this._config.flip_animation_duration;

    for (let i = 0; i < numberOfCards; i++) {
      const flipCard = this.shadowRoot.querySelector(`.flip-card[data-card="${i}"]`);
      if (!flipCard) continue;

      const startIdx = i * digitsPerCard;
      const endIdx = startIdx + digitsPerCard;
      const cardDigits = digits.slice(startIdx, endIdx);
      const displayValue = cardDigits.join('') || '0';

      // Ulož současnou hodnotu z front panelu
      const frontElement = flipCard.querySelector('.flip-panel-front-text .flip-panel-text-wrapper span');
      const currentValue = frontElement ? frontElement.textContent : '0';

      // Pokud se hodnota nezměnila, přeskoč
      if (currentValue === displayValue) continue;

      // Nastav back panel na novou hodnotu (bude vidět po flipu)
      const backElement = flipCard.querySelector('.flip-panel-back-text .flip-panel-text-wrapper span');
      if (backElement) {
        backElement.textContent = displayValue;
      }

      // Spusť flip animaci
      flipCard.classList.add('flipping');

      // Po dokončení animace aktualizuj front panel a odstraň třídu
      setTimeout(() => {
        if (frontElement) {
          frontElement.textContent = displayValue;
        }
        flipCard.classList.remove('flipping');
      }, animDuration);
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
      step: 0.5,
      flip_entity: '',
      flip_digits_per_card: 1,
      flip_number_of_cards: 2,
      flip_hide_background: true,
      flip_font_size: '2em',
      flip_show_label: true,
      flip_label_text: '',
      flip_show_unit: true,
      flip_unit: '',
      flip_decimal_places: 1,
      flip_animation_duration: 600,
      flip_card_color: '#ffffff',
      flip_background_color: '#333333',
      flip_gap: 6,
      custom_colors: false,
      color_heating: '#ff6b6b',
      color_cooling: '#4facfe',
      color_idle: '#10b981',
      color_off: '#6b7280'
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

    // Inicializuj config pokud neexistuje
    if (!this._config) {
      this._config = {};
    }

    const climateEntities = Object.keys(this._hass.states)
      .filter(entityId => entityId.startsWith('climate.'))
      .sort();

    const allEntities = Object.keys(this._hass.states)
      .filter(entityId => entityId.startsWith('sensor.') || entityId.startsWith('input_number.'))
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
        .section-header {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-text-color);
          margin: 20px 0 12px 0;
          padding-top: 20px;
          border-top: 1px solid var(--divider-color);
        }
        .section-header:first-child {
          margin-top: 0;
          padding-top: 0;
          border-top: none;
        }
      </style>

      <div class="config-container">
        <div class="config-row">
          <label for="entity">Climate entita *</label>
          <select id="entity">
            <option value="">Vyberte entitu...</option>
            ${climateEntities.map(entityId => `
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

        <div class="section-header">🔢 Flip Display</div>

        <div class="config-row">
          <label for="flip_entity">Entita pro zobrazení</label>
          <select id="flip_entity">
            <option value="">-- Žádná (vypnuto) --</option>
            ${allEntities.map(entityId => `
              <option value="${entityId}" ${this._config.flip_entity === entityId ? 'selected' : ''}>
                ${this._hass.states[entityId].attributes.friendly_name || entityId}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="config-row">
          <label for="flip_digits_per_card">Číslic na kartu</label>
          <select id="flip_digits_per_card">
            <option value="1" ${this._config.flip_digits_per_card === 1 ? 'selected' : ''}>1 číslice</option>
            <option value="2" ${this._config.flip_digits_per_card === 2 ? 'selected' : ''}>2 číslice</option>
            <option value="3" ${this._config.flip_digits_per_card === 3 ? 'selected' : ''}>3 číslice</option>
          </select>
        </div>

        <div class="config-row">
          <label for="flip_number_of_cards">Počet karet</label>
          <input type="number" id="flip_number_of_cards" min="1" max="99" value="${this._config.flip_number_of_cards || 2}"/>
          <div class="helper-text">Celkový počet karet (1-99)</div>
        </div>

        <div class="config-row">
          <label for="flip_font_size">Velikost písma</label>
          <input type="text" id="flip_font_size" placeholder="např. 2em nebo 32px" value="${this._config.flip_font_size || '2em'}"/>
          <div class="helper-text">CSS hodnota velikosti (např. 2em, 32px)</div>
        </div>

        <div class="config-row">
          <div class="checkbox-row">
            <input type="checkbox" id="flip_hide_background" ${this._config.flip_hide_background !== false ? 'checked' : ''}/>
            <label for="flip_hide_background">Skrýt pozadí</label>
          </div>
        </div>

        <div class="section-header">🏷️ Popisky a jednotky</div>

        <div class="config-row">
          <div class="checkbox-row">
            <input type="checkbox" id="flip_show_label" ${this._config.flip_show_label !== false ? 'checked' : ''}/>
            <label for="flip_show_label">Zobrazit popisek</label>
          </div>
        </div>

        <div class="config-row">
          <label for="flip_label_text">Vlastní popisek (volitelné)</label>
          <input type="text" id="flip_label_text" placeholder="automaticky z entity" value="${this._config.flip_label_text || ''}"/>
          <div class="helper-text">Ponechte prázdné pro automatickou detekci</div>
        </div>

        <div class="config-row">
          <div class="checkbox-row">
            <input type="checkbox" id="flip_show_unit" ${this._config.flip_show_unit !== false ? 'checked' : ''}/>
            <label for="flip_show_unit">Zobrazit jednotku</label>
          </div>
        </div>

        <div class="config-row">
          <label for="flip_unit">Vlastní jednotka (volitelné)</label>
          <input type="text" id="flip_unit" placeholder="automaticky z entity" value="${this._config.flip_unit || ''}"/>
          <div class="helper-text">Ponechte prázdné pro automatickou detekci (např. °C)</div>
        </div>

        <div class="section-header">⚙️ Pokročilé nastavení</div>

        <div class="config-row">
          <label for="flip_decimal_places">Počet desetinných míst</label>
          <input type="number" id="flip_decimal_places" min="0" max="3" value="${this._config.flip_decimal_places !== undefined ? this._config.flip_decimal_places : 1}"/>
          <div class="helper-text">Kolik desetinných míst zobrazit (0-3)</div>
        </div>

        <div class="config-row">
          <label for="flip_animation_duration">Délka animace (ms)</label>
          <input type="number" id="flip_animation_duration" min="200" max="2000" step="100" value="${this._config.flip_animation_duration || 600}"/>
          <div class="helper-text">Rychlost flip animace v milisekundách (200-2000)</div>
        </div>

        <div class="config-row">
          <label for="flip_gap">Mezera mezi kartami (px)</label>
          <input type="number" id="flip_gap" min="0" max="20" value="${this._config.flip_gap || 6}"/>
          <div class="helper-text">Velikost mezery mezi flip kartami (0-20)</div>
        </div>

        <div class="config-row">
          <label for="flip_card_color">Barva textu</label>
          <input type="color" id="flip_card_color" value="${this._config.flip_card_color || '#ffffff'}"/>
        </div>

        <div class="config-row">
          <label for="flip_background_color">Barva pozadí karty</label>
          <input type="text" id="flip_background_color" placeholder="#333333" value="${this._config.flip_background_color || '#333333'}"/>
          <div class="helper-text">CSS barva (hex, rgb, rgba)</div>
        </div>

        <div class="section-header">Vlastní Barvy</div>

        <div class="config-row">
          <div class="checkbox-row">
            <input type="checkbox" id="custom_colors" ${this._config.custom_colors ? 'checked' : ''}/>
            <label for="custom_colors">Použít vlastní barvy</label>
          </div>
        </div>

        <div class="config-row">
          <label for="color_heating">Barva topení</label>
          <input type="color" id="color_heating" value="${this._config.color_heating || '#ff6b6b'}"/>
          <div class="helper-text">Barva pro režim topení</div>
        </div>

        <div class="config-row">
          <label for="color_cooling">Barva chlazení</label>
          <input type="color" id="color_cooling" value="${this._config.color_cooling || '#4facfe'}"/>
          <div class="helper-text">Barva pro režim chlazení</div>
        </div>

        <div class="config-row">
          <label for="color_idle">Barva připraveno</label>
          <input type="color" id="color_idle" value="${this._config.color_idle || '#10b981'}"/>
          <div class="helper-text">Barva když je termostat připravený (idle)</div>
        </div>

        <div class="config-row">
          <label for="color_off">Barva vypnuto</label>
          <input type="color" id="color_off" value="${this._config.color_off || '#6b7280'}"/>
          <div class="helper-text">Barva když je termostat vypnutý</div>
        </div>
      </div>
    `;

    const entitySelect = this.shadowRoot.getElementById('entity');
    const nameInput = this.shadowRoot.getElementById('name');
    const showGraphCheckbox = this.shadowRoot.getElementById('show_graph');
    const graphHoursInput = this.shadowRoot.getElementById('graph_hours');
    const stepInput = this.shadowRoot.getElementById('step');
    const flipEntitySelect = this.shadowRoot.getElementById('flip_entity');
    const flipDigitsPerCardSelect = this.shadowRoot.getElementById('flip_digits_per_card');
    const flipNumberOfCardsInput = this.shadowRoot.getElementById('flip_number_of_cards');
    const flipFontSizeInput = this.shadowRoot.getElementById('flip_font_size');
    const flipHideBackgroundCheckbox = this.shadowRoot.getElementById('flip_hide_background');
    const flipShowLabelCheckbox = this.shadowRoot.getElementById('flip_show_label');
    const flipLabelTextInput = this.shadowRoot.getElementById('flip_label_text');
    const flipShowUnitCheckbox = this.shadowRoot.getElementById('flip_show_unit');
    const flipUnitInput = this.shadowRoot.getElementById('flip_unit');
    const flipDecimalPlacesInput = this.shadowRoot.getElementById('flip_decimal_places');
    const flipAnimationDurationInput = this.shadowRoot.getElementById('flip_animation_duration');
    const flipGapInput = this.shadowRoot.getElementById('flip_gap');
    const flipCardColorInput = this.shadowRoot.getElementById('flip_card_color');
    const flipBackgroundColorInput = this.shadowRoot.getElementById('flip_background_color');
    const customColorsCheckbox = this.shadowRoot.getElementById('custom_colors');
    const colorHeatingInput = this.shadowRoot.getElementById('color_heating');
    const colorCoolingInput = this.shadowRoot.getElementById('color_cooling');
    const colorIdleInput = this.shadowRoot.getElementById('color_idle');
    const colorOffInput = this.shadowRoot.getElementById('color_off');

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

    flipEntitySelect?.addEventListener('change', (e) => {
      this.configChanged({ ...this._config, flip_entity: e.target.value });
    });

    flipDigitsPerCardSelect?.addEventListener('change', (e) => {
      this.configChanged({ ...this._config, flip_digits_per_card: parseInt(e.target.value) });
    });

    flipNumberOfCardsInput?.addEventListener('input', (e) => {
      this.configChanged({ ...this._config, flip_number_of_cards: parseInt(e.target.value) });
    });

    flipFontSizeInput?.addEventListener('input', (e) => {
      this.configChanged({ ...this._config, flip_font_size: e.target.value });
    });

    flipHideBackgroundCheckbox?.addEventListener('change', (e) => {
      this.configChanged({ ...this._config, flip_hide_background: e.target.checked });
    });

    flipShowLabelCheckbox?.addEventListener('change', (e) => {
      this.configChanged({ ...this._config, flip_show_label: e.target.checked });
    });

    flipLabelTextInput?.addEventListener('input', (e) => {
      this.configChanged({ ...this._config, flip_label_text: e.target.value });
    });

    flipShowUnitCheckbox?.addEventListener('change', (e) => {
      this.configChanged({ ...this._config, flip_show_unit: e.target.checked });
    });

    flipUnitInput?.addEventListener('input', (e) => {
      this.configChanged({ ...this._config, flip_unit: e.target.value });
    });

    flipDecimalPlacesInput?.addEventListener('input', (e) => {
      this.configChanged({ ...this._config, flip_decimal_places: parseInt(e.target.value) });
    });

    flipAnimationDurationInput?.addEventListener('input', (e) => {
      this.configChanged({ ...this._config, flip_animation_duration: parseInt(e.target.value) });
    });

    flipGapInput?.addEventListener('input', (e) => {
      this.configChanged({ ...this._config, flip_gap: parseInt(e.target.value) });
    });

    flipCardColorInput?.addEventListener('input', (e) => {
      this.configChanged({ ...this._config, flip_card_color: e.target.value });
    });

    flipBackgroundColorInput?.addEventListener('input', (e) => {
      this.configChanged({ ...this._config, flip_background_color: e.target.value });
    });

    customColorsCheckbox?.addEventListener('change', (e) => {
      this.configChanged({ ...this._config, custom_colors: e.target.checked });
    });

    colorHeatingInput?.addEventListener('input', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.configChanged({ ...this._config, color_heating: e.target.value });
    });

    colorCoolingInput?.addEventListener('input', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.configChanged({ ...this._config, color_cooling: e.target.value });
    });

    colorIdleInput?.addEventListener('input', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.configChanged({ ...this._config, color_idle: e.target.value });
    });

    colorOffInput?.addEventListener('input', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.configChanged({ ...this._config, color_off: e.target.value });
    });

    // Fix scrollu - zabraň vyskočení při focusu na input
    const allInputs = this.shadowRoot.querySelectorAll('input, select');
    allInputs.forEach(input => {
      input.addEventListener('focus', (e) => {
        e.preventDefault();
        setTimeout(() => {
          input.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }, 100);
      });
    });
  }
}

customElements.define('thermostat-card', ThermostatCard);
customElements.define('thermostat-card-editor', ThermostatCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'thermostat-card',
  name: 'Thermostat Control Card',
  description: 'Kompaktní termostat s profesionálním Flip Display',
  preview: true
});

console.info(
  '%c THERMOSTAT-CARD %c v3.0.0 🎊 ',
  'color: white; background: #10b981; font-weight: 700;',
  'color: #10b981; background: white; font-weight: 700;'
);
