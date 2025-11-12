# 📦 Instalační návod

Tento dokument popisuje instalaci Thermostat Control Card do Home Assistant.

## Metoda 1: Instalace přes HACS (Doporučeno)

### Předpoklady
- Máte nainstalovaný [HACS](https://hacs.xyz/)
- Máte přístup do Home Assistant

### Postup

1. **Otevřete HACS**
   - V Home Assistant klikněte na HACS v postranním menu
   - Vyberte **Frontend**

2. **Přidejte custom repository**
   - Klikněte na menu (tři tečky) vpravo nahoře
   - Vyberte **Custom repositories**
   - Do pole **Repository** vložte URL tohoto repozitáře:
     ```
     https://github.com/VAŠE_USERNAME/thermostat-card
     ```
   - V **Category** vyberte **Lovelace**
   - Klikněte **Add**

3. **Nainstalujte kartu**
   - V HACS Frontend najděte "Thermostat Control Card"
   - Klikněte na kartu
   - Klikněte **Download**
   - Potvrďte stažení

4. **Restartujte Home Assistant**
   - Developer Tools → YAML → Restart

5. **Ověřte instalaci**
   - Otevřete Dashboard
   - Klikněte **Edit Dashboard**
   - Klikněte **Add Card**
   - V vyhledávání zadejte "thermostat"
   - Měli byste vidět "Thermostat Control Card"

## Metoda 2: Manuální instalace

### Předpoklady
- Přístup k souborovému systému Home Assistant
- SSH nebo File Editor addon

### Postup

1. **Stáhněte soubor**
   - Stáhněte `thermostat-card.js` z tohoto repozitáře

2. **Vytvořte složku**
   ```bash
   mkdir -p /config/www/thermostat-card
   ```

3. **Zkopírujte soubor**
   ```bash
   cp thermostat-card.js /config/www/thermostat-card/
   ```

4. **Přidejte resource do Lovelace**

   **Metoda A: Přes UI (doporučeno)**
   - Settings → Dashboards → Resources
   - Klikněte **Add Resource**
   - URL: `/local/thermostat-card/thermostat-card.js`
   - Resource type: **JavaScript Module**
   - Klikněte **Create**

   **Metoda B: Přes YAML**

   Upravte `configuration.yaml`:
   ```yaml
   lovelace:
     mode: yaml
     resources:
       - url: /local/thermostat-card/thermostat-card.js
         type: module
   ```

5. **Restartujte Home Assistant**
   - Developer Tools → YAML → Restart

6. **Vyčistěte cache prohlížeče**
   - Chrome/Edge: Ctrl + Shift + Delete
   - Firefox: Ctrl + Shift + Del
   - Safari: Cmd + Option + E

## Přidání karty na Dashboard

### Přes UI Editor

1. Otevřete Dashboard v režimu úprav
2. Klikněte **Add Card**
3. Vyhledejte "Thermostat Control Card" nebo přejděte na **Custom: thermostat-card**
4. Nakonfigurujte kartu:
   - **Entity**: Vyberte vaši climate entitu
   - **Name**: (volitelné) Vlastní název
   - **Show graph**: Zaškrtněte pro zobrazení grafu
   - **Graph hours**: Počet hodin historie
   - **Step**: Krok změny teploty
5. Klikněte **Save**

### Přes YAML

Přidejte do vašeho dashboard YAML:

```yaml
type: custom:thermostat-card
entity: climate.living_room
name: Obývák
show_graph: true
graph_hours: 12
step: 0.5
```

## Řešení problémů

### Karta se nezobrazuje

1. **Zkontrolujte resource**
   - Settings → Dashboards → Resources
   - Ověřte, že `/local/thermostat-card/thermostat-card.js` je v seznamu

2. **Zkontrolujte console**
   - F12 → Console
   - Hledejte chybové hlášky

3. **Vyčistěte cache**
   - Ctrl + Shift + Delete
   - Zaškrtněte "Cached images and files"
   - Clear data

4. **Restartujte prohlížeč**
   - Zavřete všechny okna prohlížeče
   - Otevřete znovu

### Karta zobrazuje chybu "Entity not found"

1. Zkontrolujte ID entity:
   - Developer Tools → States
   - Vyhledejte vaši climate entitu
   - Zkopírujte přesné ID (např. `climate.living_room`)

2. Aktualizujte konfiguraci karty s správným ID

### Graf se nezobrazuje

1. **Zkontrolujte nastavení**
   - Ujistěte se, že `show_graph: true`

2. **Zkontrolujte historii**
   - Entita musí mít alespoň nějakou historii
   - History musí být povolena v `configuration.yaml`

3. **Zkontrolujte network**
   - F12 → Network
   - Ověřte, že Chart.js se načítá z CDN

### Tlačítka nefungují

1. **Zkontrolujte podporu entity**
   - Ne všechny climate entity podporují set_temperature
   - Developer Tools → Services
   - Vyzkoušejte `climate.set_temperature` manuálně

2. **Zkontrolujte oprávnění**
   - Ujistěte se, že máte právo měnit nastavení termostatu

## Aktualizace

### HACS
1. HACS → Frontend → Thermostat Control Card
2. Klikněte **Update**
3. Restartujte Home Assistant

### Manuálně
1. Stáhněte novou verzi `thermostat-card.js`
2. Nahraďte starý soubor
3. Vyčistěte cache prohlížeče
4. Restartujte Home Assistant

## Podpora

Pokud máte problémy:

1. Zkontrolujte [Issues](../../issues) zda problém už není nahlášen
2. Přečtěte si [FAQ](../../wiki/FAQ) (pokud existuje)
3. Vytvořte nový issue s:
   - Verzí Home Assistant
   - Verzí karty
   - Konfigurací karty
   - Chybovou hláškou z console
   - Screenshotem problému

---

🎉 Hotovo! Nyní byste měli mít funkční Thermostat Control Card v Home Assistant!
