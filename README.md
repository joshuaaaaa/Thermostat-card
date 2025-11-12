# 🌡️ Thermostat Control Card pro Home Assistant

Ultramoderní glassmorphic karta pro ovládání termostatů s designem inspirovaným TOP trendy 2025.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![HACS](https://img.shields.io/badge/HACS-compatible-success.svg)
![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2024.1+-blue.svg)
![Design](https://img.shields.io/badge/Design-2025%20Trends-ff69b4.svg)

## ✨ Funkce

**🎨 Design 2025**
- **Glassmorphism** - frosted glass efekt s blur a průhledností
- **Cirkulární ovládání** - Nest-inspirovaný ring s animovaným progressem
- **Neumorphic tlačítka** - 3D soft shadows pro moderní dotek
- **Ambient pozadí** - jemné barevné pozadí mění se podle stavu

**🌡️ Ovládání**
- **Velký cirkulární displej** - teplota zobrazená jako u Google Nest
- **Intuitivní tlačítka +/-** - rychlá změna teploty
- **Visual progress ring** - ukazuje aktuální teplotu v rozsahu
- **Haptic feedback** - vibrační odezva na mobilech

**📊 Pokročilé funkce**
- **Historický graf** - Chart.js graf s 12h historií (konfigurovatelné)
- **Real-time aktualizace** - okamžitá reakce na změny
- **Status indikátor** - animovaná ikona stavu (topení/chlazení/idle)
- **Plně responzivní** - perfektní na mobilu i desktopu

## 📦 Instalace

### Přes HACS (doporučeno)

1. Otevřete HACS v Home Assistant
2. Klikněte na **Frontend**
3. Klikněte na menu (tři tečky) vpravo nahoře
4. Vyberte **Custom repositories**
5. Přidejte URL tohoto repozitáře
6. Kategorie: **Lovelace**
7. Klikněte **Add**
8. Najděte "Thermostat Control Card" a klikněte **Download**
9. Restartujte Home Assistant

### Manuální instalace

1. Stáhněte `thermostat-card.js`
2. Zkopírujte do složky `config/www/thermostat-card/`
3. Přidejte do `configuration.yaml`:

```yaml
lovelace:
  resources:
    - url: /local/thermostat-card/thermostat-card.js
      type: module
```

4. Restartujte Home Assistant

## 🎨 Použití

### Základní konfigurace

```yaml
type: custom:thermostat-card
entity: climate.living_room
```

### Pokročilá konfigurace

```yaml
type: custom:thermostat-card
entity: climate.bedroom
name: Ložnice
show_graph: true
graph_hours: 24
step: 0.5
```

## ⚙️ Konfigurační parametry

| Parametr | Typ | Výchozí | Popis |
|----------|-----|---------|-------|
| `entity` | string | **povinné** | ID climate entity (např. `climate.thermostat`) |
| `name` | string | název entity | Vlastní název zobrazený na kartě |
| `show_graph` | boolean | `true` | Zobrazit historický graf teploty |
| `graph_hours` | number | `12` | Počet hodin zobrazených v grafu (1-48) |
| `step` | number | `0.5` | Krok pro změnu teploty tlačítky |

## 📸 Screenshot

Karta zobrazuje:
- **Cirkulární displej** - velké číslo teploty uprostřed kruhu
- **Animovaný progress ring** - vizuální indikace aktuální teploty
- **Cílová teplota** - zobrazená pod hlavní teplotou
- **Status chip** - animovaná ikona stavu (topení/chlazení/idle)
- **Neumorphic tlačítka +/-** - pro změnu teploty s 3D efektem
- **Glassmorphic card** - frosted glass efekt s průhledností
- **Ambient pozadí** - tmavé pozadí mění barvu podle stavu
- **Moderní graf** - Chart.js s 12h historií (pokud zapnuto)

## 🎨 Design podle TOP trendů 2025

Karta je navržená podle nejnovějších UI/UX trendů:

**Glassmorphism**
- Frosted glass efekt s `backdrop-filter: blur(40px)`
- Průhledné vrstvy s jemnými okraji
- Gradient overlay pro hloubku
- Semi-transparent borders

**Neumorphism**
- Soft 3D shadows na tlačítkách
- Subtle elevation changes při interakci
- Smooth transitions s cubic-bezier
- Glow effects při hover

**Ambient Backgrounds**
- Tmavé pozadí mění barvu podle stavu
  - 🔥 Heating: Teplé červené tóny `#1a0e0e`
  - ❄️ Cooling: Chladné modré tóny `#0a1520`
  - ✓ Idle: Zelené tóny `#0f1419`
  - ○ Off: Neutrální šedá `#0d0d0d`

**Cirkulární kontrola (Nest-inspired)**
- 260px SVG progress ring s animací
- Velké čitelné číslo uprostřed (72px Inter font)
- Visual feedback aktuální teploty
- Smooth color transitions s drop-shadow

**Micro-interactions**
- Floating animation na status ikonách (3s loop)
- Ambient pulse efekt na pozadí (6s)
- Button hover states s glow efektem
- Haptic feedback na mobilech (10ms vibrace)
- Progress ring animace (0.6s cubic-bezier)

## 🛠️ Kompatibilita

- Home Assistant 2024.1 nebo novější
- Všechny standardní climate entity
- Funguje s většinou termostatů (TRV, smart thermostats, atd.)

## 📝 Poznámky

- Graf zobrazuje historii z atributu `temperature` entity
- Karta automaticky detekuje podporované HVAC módy
- Minimální a maximální teplota se načítá z entity
- Pokud entita neposkytuje historii, graf se nezobrazí

## 🐛 Hlášení problémů

Pokud najdete chybu nebo máte návrh na vylepšení, vytvořte prosím issue na GitHubu.

## 📄 Licence

MIT License - použijte a upravujte podle potřeby!

## 👏 Poděkování

Inspirováno moderními Material Design 3 trendy a komunitou Home Assistant.
