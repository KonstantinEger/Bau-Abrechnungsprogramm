# Bau-Abrechnungsprogramm
Programm zur Vereinfachung von Abrechnungen der Baufirma "Tiefbau Vogel"

![build](https://github.com/KonstantinEger/Bau-Abrechnungsprogramm/workflows/build/badge.svg)
![linting](https://github.com/KonstantinEger/Bau-Abrechnungsprogramm/workflows/linting/badge.svg)

## Projekt-Infos
- electron-basiertes Programm
- Datenspeicherung: siehe "[Wie Daten gespeichert werden](#wie-daten-gespeichert-werden)"
  - in separaten Dateien für jedes Projekt
  - als CSV, um die Daten im Fall eines Crashes mit anderen Programmen öffnen zu können
- Bauprojekte: [Beschreibung des Interfaces](https://github.com/KonstantinEger/Bau-Abrechnungsprogramm/wiki/Ein-neues-Projekt-erstellen)
  - haben einen Namen, (id), Datum, Ort, andere Bemerkungen
- zu jedem Projekt lassen sich Kosten hinzufügen:
  - Ausgaben des Unternehmens
  - Materialkosten - haben einen Namen (z.B. Treibstoff, Reparaturen usw.), eine Rechnungs-ID und einen Preis
  - Lohnkosten - kategorisiert als Typen/Personen mit einer Stundenanzahl und Bezahlung pro Stunde
- zu jedem Projekt kommt eine Rechnung:
  - Einnahme des Unternehmens
  - aufgespalten in Brutto/Netto
- Bilanz des Bauprojektes:
  - `Einnahmen (Rechnung)` - `Ausgaben (Kosten)` = `Bilanz`
  - auch als Prozentsatz

## Wie Daten gespeichert werden
- [Detaillierte Beschreibung der Projektdateien](https://github.com/KonstantinEger/Bau-Abrechnungsprogramm/wiki/Projektdatei)
- jedes Projekt wird als eine `.tbvp.csv` Datei gespeichert
- diese Datei besteht aus folgenden Spalten: `id`, `name`, `date`, `place`, `description`, `brutto`, `m-names`, `m-receipt-ids`, `m-prices`, `w-types`, `w-num-hours`, `w-wages` (m=Materials, w=Workers)
- beim Erstellen eines neuen Projektes wird nach der Eingabe der Daten ein Save-Dialog vom OS geöffnet, wo der User einen Speicherort auswählt
- beim Öffnen wird ein Open-Dialog vom OS geöffnet, wo der User eine Projektdatei auswählt, welche dann geladen und verarbeitet werden kann

## License
This Project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).
