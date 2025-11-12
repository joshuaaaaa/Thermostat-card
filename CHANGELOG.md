# Changelog

Všechny významné změny v tomto projektu budou dokumentovány v tomto souboru.

## [2.0.0] - 2025-11-12

### 🎨 Kompletní redesign podle TOP trendů 2025

#### Přidáno
- **Glassmorphism design** - frosted glass efekt s blur(40px) a průhledností
- **Cirkulární Nest-style ovládání** - 260px SVG progress ring s animací
- **Neumorphic tlačítka** - 3D soft shadows s smooth hover states
- **Ambient pozadí** - tmavé pozadí mění barvu podle stavu termostatu
- **Inter font** - moderní typografie z Google Fonts
- **Haptic feedback** - vibrační odezva při kliknutí (mobil)
- **Visual progress indicator** - cirkulární ukazatel aktuální teploty
- **Micro-interactions** - floating animations, ambient pulse
- **Better color schemes** - nové ambient barvy pro každý stav
- **Improved graph styling** - modernější Chart.js s lepší typografií

#### Změněno
- **Kompletně nový layout** - z horizontálního na cirkulární design
- **Lepší spacing** - více prostoru, méně clutteru
- **Moderní ikony** - minimalistické symboly místo emoji
- **Upgraded animations** - smooth cubic-bezier transitions
- **Better typography** - font hierarchy s Inter fontfamily
- **Responsive improvements** - lepší zobrazení na malých obrazovkách

#### Technické detaily
- Změna z Material Design 3 na Glassmorphism + Neumorphism hybrid
- SVG circular progress s animovaným stroke-dashoffset
- Ambient gradient backgrounds s rgba transparencí
- Drop-shadow filters pro glow efekty
- Backdrop-filter pro glass morphing
- CSS custom properties pro dynamic theming

## [1.0.0] - 2025-11-12

### Přidáno
- 🎨 Moderní barevná karta pro ovládání termostatů
- 🌡️ Zobrazení aktuální a cílové teploty
- ➕➖ Tlačítka pro zvýšení/snížení teploty
- 📊 Historický graf teploty (konfigurovatelný 1-48 hodin)
- 🎯 Vizuální editor konfigurace s výběrem climate entit
- 🌈 Barevné gradienty podle stavu (heating, cooling, idle, off)
- ✨ Plynulé animace a přechody
- 📱 Plně responzivní design
- 🔄 Real-time aktualizace dat
- 🎨 Chart.js integrace pro profesionální grafy
- 💾 HACS kompatibilita
- 🌍 České lokalizace

### Technické detaily
- Použití Web Components (Custom Elements)
- Shadow DOM pro izolaci stylů
- Chart.js 4.4.0 pro grafy
- Material Design 3 inspirovaný design
- Podpora všech standardních climate entit
