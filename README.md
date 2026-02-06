# 🌡️ Thermostat Control Card for Home Assistant



**[🇨🇿 Česká verze](README.cs.md)** | **[🇬🇧 English (current)]**

Compact and elegant thermostat control card with Google Nest-inspired design - perfect for dashboards.

<img width="433" height="237" alt="image" src="https://github.com/user-attachments/assets/fed537d6-c219-479b-a674-ecb1aefdca70" />


![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)
![HACS](https://img.shields.io/badge/HACS-compatible-success.svg)
![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2024.1+-blue.svg)
![Design](https://img.shields.io/badge/Design-Nest%20Inspired-orange.svg)

## ✨ Features

**🎨 Compact Design**
- **Nest-inspired layout** - circular progress ring with large temperature display
- **Dashboard-friendly** - compact layout ideal for clean dashboards
- **Color-coded backgrounds** - subtle gradients change color based on state
- **Status chip** - colored state indicator with icon

**🌡️ Controls**
- **Circular display** - large current temperature display (120px circle)
- **Progress ring** - visual temperature indication within min-max range
- **Intuitive +/- buttons** - quick temperature adjustment with haptic feedback
- **Target temperature** - displayed below main temperature

**📊 Advanced Features**
- **Historical graph** - Chart.js graph next to the circle (configurable 1-48h)
- **Flicker-free** - optimized graph updates without re-rendering
- **🎴 Professional Flip Display** - built-in animated flip cards (inspired by @pqina/flip)
- **Real-time updates** - instant response to changes
- **Fully responsive** - adaptive layout for mobile and desktop
- **State-based coloring** - uses `hvac_action` for accurate state representation

**🎴 Professional Flip Display (NEW in v3.0.0)**
- **Built-in flip animation** - no external dependencies required
- **3D flip effect** - realistic panel rotation with shadows
- **Fully customizable** - colors, fonts, spacing, animation speed
- **Auto-detection** - automatically detects unit and label from entity
- **Smooth animations** - configurable duration (200-2000ms)
- **Multiple card layouts** - 1-3 digits per card, up to 99 cards

## 📦 Installation

### Via HACS (Recommended)

1. Open HACS in Home Assistant
2. Click on **Frontend**
3. Click the menu (three dots) in the top right
4. Select **Custom repositories**
5. Add this repository URL
6. Category: **Lovelace**
7. Click **Add**
8. Find "Thermostat Control Card" and click **Download**
9. Restart Home Assistant

### Manual Installation

1. Download `thermostat-card.js`
2. Copy to `config/www/thermostat-card/`
3. Add to `configuration.yaml`:

```yaml
lovelace:
  resources:
    - url: /local/thermostat-card/thermostat-card.js
      type: module
```

4. Restart Home Assistant

## 🎨 Usage

### Basic Configuration

```yaml
type: custom:thermostat-card
entity: climate.living_room
```

### Advanced Configuration

```yaml
type: custom:thermostat-card
entity: climate.bedroom
name: Bedroom
show_graph: true
graph_hours: 24
step: 0.5

# Built-in Flip Display (no external card needed!)
flip_entity: sensor.bedroom_humidity
flip_show_label: true
flip_show_unit: true
flip_decimal_places: 1
flip_animation_duration: 600
flip_font_size: '2em'
```

### Full Configuration Example

```yaml
type: custom:thermostat-card
entity: climate.living_room
name: Living Room
show_graph: true
graph_hours: 12
step: 0.5

# Flip Display Configuration
flip_entity: sensor.living_room_humidity
flip_digits_per_card: 1              # 1-3 digits per card
flip_number_of_cards: 2              # Total number of cards
flip_font_size: '2em'                # Font size (CSS value)
flip_hide_background: true           # Hide card background
flip_show_label: true                # Show label above
flip_label_text: ''                  # Custom label (auto-detect if empty)
flip_show_unit: true                 # Show unit after value
flip_unit: ''                        # Custom unit (auto-detect if empty)
flip_decimal_places: 1               # Decimal places (0-3)
flip_animation_duration: 600         # Animation speed in ms (200-2000)
flip_card_color: '#ffffff'           # Text color
flip_background_color: '#333333'     # Card background color
flip_gap: 6                          # Gap between cards in px (0-20)

# Custom Colors (optional)
custom_colors: true
color_heating: '#FF6B6B'
color_cooling: '#4FACFE'
color_idle: '#10B981'
color_off: '#6B7280'
```

## ⚙️ Configuration Parameters

### Basic Settings

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `entity` | string | **required** | Climate entity ID (e.g., `climate.thermostat`) |
| `name` | string | entity name | Custom name displayed on card |
| `show_graph` | boolean | `true` | Show historical temperature graph |
| `graph_hours` | number | `12` | Hours of history in graph (1-48) |
| `step` | number | `0.5` | Temperature change step for buttons |

### Built-in Flip Display Settings

**No external card required!** The flip display is built directly into the thermostat card.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `flip_entity` | string | `''` | Entity to display in flip cards (optional) |
| `flip_digits_per_card` | number | `1` | Number of digits per card (1-3) |
| `flip_number_of_cards` | number | `2` | Total number of cards (1-99) |
| `flip_font_size` | string | `'2em'` | Font size (CSS value, e.g., '2em', '32px') |
| `flip_hide_background` | boolean | `true` | Hide card background for transparency |

### Labels and Units

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `flip_show_label` | boolean | `true` | Show label above flip cards |
| `flip_label_text` | string | `''` | Custom label (auto-detect from entity if empty) |
| `flip_show_unit` | boolean | `true` | Show unit after value |
| `flip_unit` | string | `''` | Custom unit (auto-detect from entity if empty) |

### Advanced Flip Display Settings

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `flip_decimal_places` | number | `1` | Number of decimal places to display (0-3) |
| `flip_animation_duration` | number | `600` | Animation speed in milliseconds (200-2000) |
| `flip_gap` | number | `6` | Gap between cards in pixels (0-20) |
| `flip_card_color` | string | `'#ffffff'` | Text color on flip cards |
| `flip_background_color` | string | `'#333333'` | Background color of flip cards |

### Custom Colors (Optional)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `custom_colors` | boolean | `false` | Enable custom color scheme |
| `color_heating` | string | `'#ff6b6b'` | Color when actively heating |
| `color_cooling` | string | `'#4facfe'` | Color when actively cooling |
| `color_idle` | string | `'#10b981'` | Color when ready but not heating/cooling |
| `color_off` | string | `'#6b7280'` | Color when thermostat is off |

## 📸 Card Appearance

The card displays:
- **Compact layout** - circle on the left, graph on the right
- **Circular display** - large current temperature in center of circle (120px)
- **Animated progress ring** - visual temperature indication within min-max range
- **Target temperature** - shown below main temperature with decimal precision
- **Status chip** - colored state indicator with icon (🔥 Heating, ❄️ Cooling, ✓ Ready, ○ Off)
- **Control buttons +/-** - circular buttons for temperature adjustment
- **Color-coded background** - subtle gradient changes based on actual state
- **Historical graph** - Chart.js graph next to circle with hoverable tooltip
- **Professional Flip Display** - optional animated flip cards below graph

## 🎨 Design Features

**Nest-Inspired Circular Display**
- 120px SVG progress ring with smooth animation
- Large readable temperature (36px font with decimal precision)
- Color-changing ring based on state
- Smooth transitions (0.6s ease)

**State-Based Color Scheme**
The card changes background and colors based on **actual thermostat state** (`hvac_action`):
- 🔥 **Heating**: Warm red tones `#ff6b6b` on light red gradient (only when **actively heating**)
- ❄️ **Cooling**: Cool blue tones `#4facfe` on light blue gradient (only when **actively cooling**)
- ✓ **Idle**: Green tones `#10b981` on light green gradient (ready but not heating/cooling)
- ○ **Off**: Neutral gray `#6b7280` on light gray gradient

**🎴 Professional Flip Display (v3.0.0)**
- **No dependencies** - built-in implementation inspired by @pqina/flip
- **Realistic 3D effect** - 51% panel height for accurate flip animation
- **Dual shadow layers** - top and bottom shadows for depth
- **Shadow pulse** - animated shadow during flip
- **Gradient overlays** - matching @pqina/flip specification
- **Auto-detection** - automatically reads unit and label from entity
- **Highly customizable** - colors, fonts, spacing, animation speed

**Compact Layout**
- Grid layout: circle (160px) on left, graph on right
- Responsive - vertical stack on mobile
- White background for graphs for better readability
- Optimized for dashboards

**Performance Optimization**
- Graph only updates data, not full re-render (no flickering)
- Animations disabled for faster rendering
- Efficient flip animation triggering only on value change
- Lazy loading of Chart.js library

## 🆕 What's New in v3.0.0

- 🎴 **Professional Flip Display** - built-in animated flip cards (no external dependencies!)
- 🎯 **Precise 3D Animation** - realistic flip effect inspired by @pqina/flip
- 🎨 **Fully Customizable Flip Cards** - 11 new configuration parameters
- 🏷️ **Auto-Detection** - automatically detects unit and label from entity
- 📐 **Decimal Precision** - shows actual temperature with decimal (21.5°C instead of 22°C)
- 🎯 **Accurate State Colors** - uses `hvac_action` instead of `hvac_mode` for true state representation
- 📏 **Compact Size** - optimized card dimensions for better dashboard fit
- ⚡ **Smooth Animations** - configurable flip duration (200-2000ms)
- 🌈 **Custom Gradients** - dual-color gradients for each state
- 🔧 **Enhanced Editor** - organized sections with helper texts

## 🛠️ Compatibility

- Home Assistant 2024.1 or newer
- All standard climate entities
- Works with most thermostats (TRV, smart thermostats, etc.)
- **Flip display built-in** - no external dependencies required

## 📝 Important Notes

**Flip Display**
- The flip display is **built directly into the card** - no separate flip-display-card installation needed
- Automatically detects `unit_of_measurement` and `friendly_name` from the entity
- Supports any numeric sensor entity (temperature, humidity, power, etc.)
- Animation triggers only when value changes (efficient)

**State Detection**
- Uses `hvac_action` attribute for accurate state representation
- Shows heating colors **only when actively heating** (not just in heat mode)
- Shows cooling colors **only when actively cooling** (not just in cool mode)
- Fallback to `off` color when thermostat is turned off

**Graph**
- Displays both current and target temperature history
- Minimal y-axis for better space utilization
- No full element refresh on update - eliminates flickering
- Automatic color matching to current state

## 🐛 Bug Reports

If you find a bug or have a suggestion for improvement, please create an issue on GitHub.

## 📄 License

MIT License - use and modify as needed!

## 👏 Acknowledgments

Inspired by Google Nest thermostat and the Home Assistant community.
Special thanks to @pqina/flip for the flip animation inspiration.

---

**v3.0.0** - Professional Flip Display Implementation 🎴

## Support

If you like this card, please ⭐ star this repository!

Found a bug or have a feature request? Please open an issue.



## http://buymeacoffee.com/jakubhruby


<img width="150" height="150" alt="qr-code" src="https://github.com/user-attachments/assets/2581bf36-7f7d-4745-b792-d1abaca6e57d" />
