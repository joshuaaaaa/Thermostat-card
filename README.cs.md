# 🌡️ Thermostat Control Card pro Home Assistant

<p align="center">
  <img src="jh.png" alt="JH Logo" width="120" />
</p>

**[🇨🇿 Česká verze (aktuální)]** | **[🇬🇧 English version](README.md)**

Kompaktní a elegantní karta pro ovládání termostatů s designem inspirovaným Google Nest - ideální pro dashboardy.

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)
![HACS](https://img.shields.io/badge/HACS-compatible-success.svg)
![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2024.1+-blue.svg)
![Design](https://img.shields.io/badge/Design-Nest%20Inspired-orange.svg)

## ✨ Funkce

**🎨 Kompaktní Design**
- **Nest-inspirovaný layout** - cirkulární progress ring s velkým zobrazením teploty
- **Dashboard-friendly** - kompaktní rozložení ideální pro přehledné dashboardy
- **Barevná pozadí** - jemné gradienty se mění podle stavu
- **Status chip** - barevný indikátor stavu s ikonou

**🌡️ Ovládání**
- **Cirkulární displej** - velké zobrazení aktuální teploty (kruh 120px)
- **Progress ring** - vizuální indikace teploty v rozsahu min-max
- **Intuitivní tlačítka +/-** - rychlá změna teploty s haptickou odezvou
- **Cílová teplota** - zobrazená pod hlavní teplotou

**📊 Pokročilé funkce**
- **Historický graf** - Chart.js graf vedle kruhu (nastavitelné 1-48h)
- **Bez blikání** - optimalizovaná aktualizace grafu bez překreslování
- **🎴 Profesionální Flip Display** - vestavěné animované flip karty (inspirováno @pqina/flip)
- **Real-time aktualizace** - okamžitá reakce na změny
- **Plně responzivní** - adaptivní layout pro mobil i desktop
- **Stavové barvy** - používá `hvac_action` pro přesné zobrazení stavu

**🎴 Profesionální Flip Display (NOVÉ ve v3.0.0)**
- **Vestavěná animace** - žádné externí závislosti nejsou potřeba
- **3D flip efekt** - realistická rotace panelů se stíny
- **Plně konfigurovatelné** - barvy, fonty, mezery, rychlost animace
- **Auto-detekce** - automaticky detekuje jednotku a popisek z entity
- **Plynulé animace** - nastavitelná délka (200-2000ms)
- **Různé layouty karet** - 1-3 číslice na kartu, až 99 karet

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

# Vestavěný Flip Display (nepotřebuje externí kartu!)
flip_entity: sensor.bedroom_humidity
flip_show_label: true
flip_show_unit: true
flip_decimal_places: 1
flip_animation_duration: 600
flip_font_size: '2em'
```

### Kompletní příklad konfigurace

```yaml
type: custom:thermostat-card
entity: climate.living_room
name: Obývák
show_graph: true
graph_hours: 12
step: 0.5

# Konfigurace Flip Display
flip_entity: sensor.living_room_humidity
flip_digits_per_card: 1              # 1-3 číslice na kartu
flip_number_of_cards: 2              # Celkový počet karet
flip_font_size: '2em'                # Velikost písma (CSS hodnota)
flip_hide_background: true           # Skrýt pozadí karty
flip_show_label: true                # Zobrazit popisek nahoře
flip_label_text: ''                  # Vlastní popisek (prázdné = auto-detekce)
flip_show_unit: true                 # Zobrazit jednotku za hodnotou
flip_unit: ''                        # Vlastní jednotka (prázdné = auto-detekce)
flip_decimal_places: 1               # Desetinná místa (0-3)
flip_animation_duration: 600         # Rychlost animace v ms (200-2000)
flip_card_color: '#ffffff'           # Barva textu
flip_background_color: '#333333'     # Barva pozadí karty
flip_gap: 6                          # Mezera mezi kartami v px (0-20)

# Vlastní barvy (volitelné)
custom_colors: true
color_heating: '#FF6B6B'
color_cooling: '#4FACFE'
color_idle: '#10B981'
color_off: '#6B7280'
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

### Vestavěný Flip Display

**Není potřeba externí karta!** Flip display je integrovaný přímo do karty termostatu.

| Parametr | Typ | Výchozí | Popis |
|----------|-----|---------|-------|
| `flip_entity` | string | `''` | Entita pro zobrazení ve flip kartách (volitelné) |
| `flip_digits_per_card` | number | `1` | Počet číslic na kartu (1-3) |
| `flip_number_of_cards` | number | `2` | Celkový počet karet (1-99) |
| `flip_font_size` | string | `'2em'` | Velikost písma (CSS hodnota, např. '2em', '32px') |
| `flip_hide_background` | boolean | `true` | Skrýt pozadí karty pro průhlednost |

### Popisky a jednotky

| Parametr | Typ | Výchozí | Popis |
|----------|-----|---------|-------|
| `flip_show_label` | boolean | `true` | Zobrazit popisek nad flip kartami |
| `flip_label_text` | string | `''` | Vlastní popisek (prázdné = auto-detekce z entity) |
| `flip_show_unit` | boolean | `true` | Zobrazit jednotku za hodnotou |
| `flip_unit` | string | `''` | Vlastní jednotka (prázdné = auto-detekce z entity) |

### Pokročilé nastavení Flip Display

| Parametr | Typ | Výchozí | Popis |
|----------|-----|---------|-------|
| `flip_decimal_places` | number | `1` | Počet desetinných míst (0-3) |
| `flip_animation_duration` | number | `600` | Rychlost animace v milisekundách (200-2000) |
| `flip_gap` | number | `6` | Mezera mezi kartami v pixelech (0-20) |
| `flip_card_color` | string | `'#ffffff'` | Barva textu na kartách |
| `flip_background_color` | string | `'#333333'` | Barva pozadí karet |

### Vlastní barvy (volitelné)

| Parametr | Typ | Výchozí | Popis |
|----------|-----|---------|-------|
| `custom_colors` | boolean | `false` | Povolit vlastní barevné schéma |
| `color_heating` | string | `'#ff6b6b'` | Barva při aktivním topení |
| `color_cooling` | string | `'#4facfe'` | Barva při aktivním chlazení |
| `color_idle` | string | `'#10b981'` | Barva když je připraveno, ale netopí/nechladí |
| `color_off` | string | `'#6b7280'` | Barva když je termostat vypnutý |

## 📸 Vzhled karty

Karta zobrazuje:
- **Kompaktní layout** - kruh vlevo, graf vpravo
- **Cirkulární displej** - velká aktuální teplota uprostřed kruhu (120px)
- **Animovaný progress ring** - vizuální indikace teploty v rozsahu min-max
- **Cílová teplota** - zobrazená pod hlavní teplotou s desetinnou přesností
- **Status chip** - barevný indikátor stavu s ikonou (🔥 Topení, ❄️ Chlazení, ✓ Připraveno, ○ Vypnuto)
- **Ovládací tlačítka +/-** - cirkulární tlačítka pro změnu teploty
- **Barevné pozadí** - jemný gradient mění se podle skutečného stavu
- **Historický graf** - Chart.js graf vedle kruhu s hoverable tooltip
- **Profesionální Flip Display** - volitelné animované flip karty pod grafem

## 🎨 Design vlastnosti

**Nest-inspirovaný cirkulární displej**
- 120px SVG progress ring s plynulou animací
- Velké čitelné číslo teploty (36px font s desetinnou přesností)
- Barevný ring mění se podle stavu
- Plynulé transitions (0.6s ease)

**Barevné schéma podle stavu**
Karta mění pozadí a barvy podle **skutečného stavu termostatu** (`hvac_action`):
- 🔥 **Topení**: Teplé červené tóny `#ff6b6b` na světle červeném gradientu (pouze při **aktivním topení**)
- ❄️ **Chlazení**: Chladné modré tóny `#4facfe` na světle modrém gradientu (pouze při **aktivním chlazení**)
- ✓ **Připraveno**: Zelené tóny `#10b981` na světle zeleném gradientu (připraveno, ale netopí/nechladí)
- ○ **Vypnuto**: Neutrální šedá `#6b7280` na světle šedém gradientu

**🎴 Profesionální Flip Display (v3.0.0)**
- **Bez závislostí** - vestavěná implementace inspirovaná @pqina/flip
- **Realistický 3D efekt** - 51% výška panelu pro přesnou flip animaci
- **Dvojité stínové vrstvy** - horní a dolní stíny pro hloubku
- **Shadow pulse** - animovaný stín během flipu
- **Gradient overlays** - podle specifikace @pqina/flip
- **Auto-detekce** - automaticky načte jednotku a popisek z entity
- **Vysoce konfigurovatelné** - barvy, fonty, mezery, rychlost animace

**Kompaktní layout**
- Grid rozložení: kruh (160px) vlevo, graf vpravo
- Responzivní - vertikální stack na mobilu
- Bílé pozadí grafů pro lepší čitelnost
- Optimalizované pro dashboardy

**Optimalizace výkonu**
- Graf pouze aktualizuje data, ne celý prvek (bez blikání)
- Animace vypnuté pro rychlejší rendering
- Efektivní spuštění flip animace pouze při změně hodnoty
- Lazy loading Chart.js knihovny

## 🆕 Co je nového ve verzi 3.0.0

- 🎴 **Profesionální Flip Display** - vestavěné animované flip karty (bez externích závislostí!)
- 🎯 **Přesná 3D animace** - realistický flip efekt inspirovaný @pqina/flip
- 🎨 **Plně konfigurovatelné Flip karty** - 11 nových konfiguračních parametrů
- 🏷️ **Auto-detekce** - automaticky detekuje jednotku a popisek z entity
- 📐 **Desetinná přesnost** - zobrazuje skutečnou teplotu s desetinným místem (21.5°C místo 22°C)
- 🎯 **Přesné stavové barvy** - používá `hvac_action` místo `hvac_mode` pro pravdivé zobrazení stavu
- 📏 **Kompaktní velikost** - optimalizované rozměry karty pro lepší fit na dashboard
- ⚡ **Plynulé animace** - konfigurovatelná délka flipu (200-2000ms)
- 🌈 **Vlastní gradienty** - dvoubarevné gradienty pro každý stav
- 🔧 **Vylepšený editor** - organizované sekce s helper texty

## 🛠️ Kompatibilita

- Home Assistant 2024.1 nebo novější
- Všechny standardní climate entity
- Funguje s většinou termostatů (TRV, smart thermostats, atd.)
- **Flip display vestavěný** - nejsou potřeba žádné externí závislosti

## 📝 Důležité poznámky

**Flip Display**
- Flip display je **integrovaný přímo do karty** - není potřeba instalovat samostatnou flip-display-card
- Automaticky detekuje `unit_of_measurement` a `friendly_name` z entity
- Podporuje jakoukoli číselnou entitu senzoru (teplota, vlhkost, výkon, atd.)
- Animace se spouští pouze při změně hodnoty (efektivní)

**Detekce stavu**
- Používá atribut `hvac_action` pro přesné zobrazení stavu
- Zobrazuje barvy topení **pouze při aktivním topení** (ne jen když je v režimu heat)
- Zobrazuje barvy chlazení **pouze při aktivním chlazení** (ne jen když je v režimu cool)
- Fallback na barvu `off` když je termostat vypnutý

**Graf**
- Zobrazuje historii aktuální i cílové teploty
- Minimální y-osa pro lepší využití místa
- Žádné kompletní překreslení při aktualizaci - eliminuje blikání
- Automatické sladění barev se současným stavem

## 🐛 Hlášení problémů

Pokud najdete chybu nebo máte návrh na vylepšení, vytvořte prosím issue na GitHubu.

## 📄 Licence

MIT License - použijte a upravujte podle potřeby!

## 👏 Poděkování

Inspirováno Google Nest termostatem a komunitou Home Assistant.
Speciální poděkování @pqina/flip za inspiraci flip animace.

---

**v3.0.0** - Implementace profesionálního Flip Display 🎴

## Support

If you like this card, please ⭐ star this repository!

Found a bug or have a feature request? Please open an issue.



## http://buymeacoffee.com/jakubhruby


<img width="150" height="150" alt="qr-code" src="https://github.com/user-attachments/assets/2581bf36-7f7d-4745-b792-d1abaca6e57d" />
