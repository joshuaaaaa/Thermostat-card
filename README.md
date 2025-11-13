# 🌡️ Thermostat Control Card pro Home Assistant

Kompaktní a přehledná karta pro ovládání termostatů s designem inspirovaným Google Nest - ideální pro dashboardy.

![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)
![HACS](https://img.shields.io/badge/HACS-compatible-success.svg)
![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2024.1+-blue.svg)
![Design](https://img.shields.io/badge/Design-Nest%20Inspired-orange.svg)

## ✨ Funkce

**🎨 Kompaktní Design**
- **Nest-inspirovaný layout** - cirkulární progress ring s velkou teplotou
- **Dashboard-friendly** - kompaktní rozložení ideální pro přehledné dashboardy
- **Barevné pozadí** - jemné gradienty mění barvu podle stavu (heating/cooling/idle/off)
- **Status chip** - barevný indikátor stavu s ikonou

**🌡️ Ovládání**
- **Cirkulární displej** - velké zobrazení aktuální teploty (150px kruh)
- **Progress ring** - vizuální indikace teploty v rozsahu min-max
- **Intuitivní tlačítka +/-** - rychlá změna teploty s haptic feedback
- **Cílová teplota** - zobrazená pod hlavní teplotou

**📊 Pokročilé funkce**
- **Historický graf** - Chart.js graf vedle kruhu (konfigurovatelné 1-48h)
- **Bez blikání** - optimalizovaná aktualizace grafu bez rerenderu
- **Flip Display integrace** - volitelné připojení flip-display-card pro zobrazení hodnot
- **Real-time aktualizace** - okamžitá reakce na změny
- **Plně responzivní** - adaptivní layout pro mobil i desktop

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
flip_entity: sensor.bedroom_humidity  # volitelné
flip_digits_per_card: 1  # 1 nebo 2 číslice na kartu
flip_number_of_cards: 2  # celkový počet karet
flip_font_size: '3em'    # velikost písma
flip_hide_background: true
```

## ⚙️ Konfigurační parametry

### Základní nastavení

| Parametr | Typ | Výchozí | Popis |
|----------|-----|---------|-------|
| `entity` | string | **povinné** | ID climate entity (např. `climate.thermostat`) |
| `name` | string | název entity | Vlastní název zobrazený na kartě |
| `show_graph` | boolean | `true` | Zobrazit historický graf teploty |
| `graph_hours` | number | `12` | Počet hodin zobrazených v grafu (1-48) |
| `step` | number | `0.5` | Krok pro změnu teploty tlačítky |

### Flip Display nastavení

| Parametr | Typ | Výchozí | Popis |
|----------|-----|---------|-------|
| `flip_entity` | string | `''` | Entita pro flip-display-card pod grafem (volitelné) |
| `flip_digits_per_card` | number | `1` | Počet číslic na jedné kartě (1 nebo 2) |
| `flip_number_of_cards` | number | `2` | Celkový počet karet (1-99) |
| `flip_font_size` | string | `'3em'` | Velikost písma (CSS hodnota, např. '3em', '48px') |
| `flip_hide_background` | boolean | `true` | Skrýt pozadí flip display |

## 📸 Vzhled karty

Karta zobrazuje:
- **Kompaktní layout** - kruh vlevo, graf vpravo
- **Cirkulární displej** - velké číslo aktuální teploty uprostřed kruhu (150px)
- **Animovaný progress ring** - vizuální indikace teploty v rozsahu min-max
- **Cílová teplota** - zobrazená pod hlavní teplotou
- **Status chip** - barevný indikátor stavu s ikonou (🔥 Topení, ❄️ Chlazení, ✓ Připraveno, ○ Vypnuto)
- **Ovládací tlačítka +/-** - cirkulární tlačítka pro změnu teploty
- **Barevné pozadí** - jemný gradient mění se podle stavu
- **Historický graf** - Chart.js vedle kruhu s hoverable tooltip
- **Flip Display** - volitelné zobrazení hodnot pod grafem (vyžaduje flip-display-card)

## 🎨 Design Vlastnosti

Karta je navržená s důrazem na kompaktnost a přehlednost:

**Nest-inspirovaný cirkulární displej**
- 150px SVG progress ring s plynulou animací
- Velké čitelné číslo uprostřed (48px font)
- Barevný ring mění se podle stavu
- Smooth transitions (0.6s ease)

**Barevné schéma podle stavu**
Karta mění pozadí a barvy podle stavu termostatu:
- 🔥 **Heating** (Topení): Teplé červené tóny `#ff6b6b` na světle růžovém gradientu
- ❄️ **Cooling** (Chlazení): Chladné modré tóny `#4facfe` na světle modrém gradientu
- ✓ **Idle** (Připraveno): Zelené tóny `#10b981` na světle zeleném gradientu
- ○ **Off** (Vypnuto): Neutrální šedá `#6b7280` na světle šedém gradientu

**Kompaktní layout**
- Grid rozložení: kruh (180px) vlevo, graf vpravo
- Responzivní - na mobilu stack vertikálně
- Bílé pozadí grafů pro lepší čitelnost
- Optimalizované pro dashboardy

**Optimalizace výkonu**
- Graf se neobnovuje celý, pouze updateuje data (bez blikání)
- Animace vypnuté pro rychlejší render
- requestAnimationFrame pro flip display inicializaci
- Lazy loading Chart.js knihovny

## 🆕 Novinky ve verzi 2.1.0

- ✨ **Kompletní redesign** - nový kompaktní layout ideální pro dashboardy
- 📊 **Graf vedle kruhu** - grid rozložení místo vertikálního stacku
- 🔄 **Eliminace blikání** - graf se už neobnovuje celý, pouze updateuje data
- 🎴 **Flip Display integrace** - volitelné zobrazení hodnot pod grafem
- ⚙️ **Kompletní flip display konfigurace** - digits, decimal places, duration, hide background
- 🛡️ **Error handling** - robustní zpracování chyb při inicializaci flip display
- 🎨 **Jemnější design** - světlé pozadí s barevnými gradienty
- 📱 **Lepší responzivita** - vylepšený mobilní layout
- 🖥️ **Vizuální editor** - přehledný konfigurátor s validací a helper texty

## 🛠️ Kompatibilita

- Home Assistant 2024.1 nebo novější
- Všechny standardní climate entity
- Funguje s většinou termostatů (TRV, smart thermostats, atd.)
- Volitelná integrace s flip-display-card pro zobrazení hodnot

## 📝 Poznámky

- Graf zobrazuje historii aktuální i cílové teploty
- Karta automaticky detekuje stav termostatu (heating/cooling/idle/off)
- Minimální a maximální teplota se načítá z entity
- Pro flip display funkci je potřeba mít nainstalovanou [flip-display-card](https://github.com/your-repo/flip-display-card)
- Graf neobnovuje celý element při update - eliminuje blikání
- Flip display element se inicializuje asynchronně s error handlingem

## 🐛 Hlášení problémů

Pokud najdete chybu nebo máte návrh na vylepšení, vytvořte prosím issue na GitHubu.

## 📄 Licence

MIT License - použijte a upravujte podle potřeby!

## 👏 Poděkování

Inspirováno Google Nest termostatem a komunitou Home Assistant.

---

**v2.1.0** - Kompletní redesign pro lepší použitelnost na dashboardech 🎨

*Poslední aktualizace: Listopad 2025*
