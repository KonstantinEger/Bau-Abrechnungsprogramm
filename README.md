# Bau-Abrechnungsprogramm
Programm zur Vereinfachung von Abrechnungen der Baufirma "Tiefbau Vogel"

## Projekt-Infos
- electron-basiertes Programm
- Datenspeicherung:
  - in AppData
  - als CSV, um die Daten im Fall eines Crashes mit anderen Programmen öffnen zu können
  - Backups sollten auch vorhanden sein; möglw. jeden Tag
- Bauprojekte:
  - lassen sich suchen und filtern
  - haben einen Namen, (id), Datum, Ort, andere Bemerkungen
- zu jedem Projekt lassen sich Kosten hinzufügen:
  - Ausgaben des Unternehmens
  - Materialkosten - lassen sich Kategorien zuordnen wie z.B. Tankkosten, Reparatur usw. -> Es lassen sich beliebig viele Kategorien hinzufügen (ähnlich wie Tags). Außerdem können zusätzliche Infos wie Rechnungen usw. hinzugefügt werden
  - Lohn - erstmal nur in Std, da jeder Job anders bezahlt wird. Spärer möglich dass man für jeden Job einen tag mit seiner Bezahlung pro Stunde erstellt und diesen dann wieder zuweist
- zu jedem Projekt kommt eine Rechnung:
  - Einnahme des Unternehmens
  - aufgespalten in Brutto/Netto
  - hat eine Rechnungsnummer
- Bilanz des Bauprojektes:
  - `Einnahmen (Rechnung)` - `Ausgaben (Kosten)` = `Bilanz`
  - auch als Prozentsatz

## License
This Project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).
