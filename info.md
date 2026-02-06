# Thermostat Control Card

<p align="center">
  <img src="jh.png" alt="JH Logo" width="120" />
</p>

Moderní a barevná karta pro ovládání termostatů v Home Assistant.

## Funkce

- 🎨 **Moderní barevný design** s gradientními pozadími
- 🌡️ **Ovládání teploty** pomocí velkých, přehledných tlačítek
- 📊 **Historický graf** zobrazující teplotu za posledních 12 hodin
- 🎯 **Snadná konfigurace** s výběrem climate entit
- 📱 **Responzivní design** pro mobily i tablety
- ✨ **Plynulé animace** pro moderní vzhled

## Instalace

1. Přidejte toto repo do HACS jako custom repository
2. Nainstalujte "Thermostat Control Card"
3. Přidejte do resources v Lovelace:

```yaml
url: /hacsfiles/thermostat-card/thermostat-card.js
type: module
```

## Konfigurace

```yaml
type: custom:thermostat-card
entity: climate.thermostat
name: Obývák
show_graph: true
```

## Parametry

| Parametr | Typ | Popis |
|----------|-----|-------|
| `entity` | string | **Povinné** - ID climate entity |
| `name` | string | Vlastní název (volitelné) |
| `show_graph` | boolean | Zobrazit graf (výchozí: true) |
| `graph_hours` | number | Počet hodin grafu (výchozí: 12) |

## Podpora

Pro problémy a návrhy použijte GitHub Issues.
