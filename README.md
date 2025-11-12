# 🌡️ Thermostat Control Card pro Home Assistant

Moderní a barevná custom karta pro ovládání termostatů v Home Assistant s podporou HACS.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![HACS](https://img.shields.io/badge/HACS-compatible-success.svg)
![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2024.1+-blue.svg)

## ✨ Funkce

- 🎨 **Moderní Material Design 3** s gradientními pozadími a pastelové barvy
- 🌡️ **Ovládání teploty** - velká, přehledná tlačítka pro přidání/odebrání teploty
- 📊 **Historický graf teploty** - zobrazuje změny za posledních 12 hodin
- 🎯 **Snadná konfigurace** - vizuální editor s výběrem climate entit
- 📱 **Plně responzivní** - funguje skvěle na mobilech i tabletech
- ✨ **Plynulé animace** - moderní UX s CSS transitions
- 🌈 **Barevné stavy** - různé barvy pro heating, cooling, idle
- 🔄 **Automatické aktualizace** - real-time zobrazení aktuální teploty

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
- Aktuální teplotu velkým písmem
- Cílovou teplotu
- Aktuální stav (topení/chlazení/idle)
- Tlačítka + a - pro změnu teploty
- Graf s historií teploty za posledních 12 hodin
- Barevné gradienty podle stavu

## 🎨 Design

Karta používá moderní design s:
- **Gradientními pozadími**: Každý stav má svůj barevný gradient
  - 🔥 Heating: Oranžovo-červený gradient
  - ❄️ Cooling: Modro-azurový gradient
  - 💤 Idle: Zeleno-šedý gradient
- **Plynulými animacemi**: Všechny změny jsou animované
- **Material Design ikony**: Moderní vzhled
- **Skleněný efekt**: Průhlednost a backdrop blur
- **Responzivní layout**: Přizpůsobí se velikosti obrazovky

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
