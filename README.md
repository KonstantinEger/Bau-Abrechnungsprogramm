# Bau-Abrechnungsprogramm
Programm zur Vereinfachung von Abrechnungen der Baufirma "Tiefbau Vogel"

## Projekt-Infos
- electron-basiertes Programm
- Datenspeicherung: siehe "[Wie Daten gespeichert werden](#wie-daten-gespeichert-werden)"
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
- Bilanz des Bauprojektes:
  - `Einnahmen (Rechnung)` - `Ausgaben (Kosten)` = `Bilanz`
  - auch als Prozentsatz

## Wie Daten gespeichert werden
- projects.csv
  - `projectname`: String; Name des Projektes
  - `projectid`: Integer; ID-Nummer
  - `place`: String; Ort der Baustelle
  - `date`: String; Datum des Baus
  - `bill`: Float; Brutto-Rechnungssumme
  - `notes`: String; Bemerkungen
- materials.csv
  - `projectid`: Integer; Verweis auf das Projekt
  - `type`: Integer; ID für den Materialtyp
  - `billnum`: String; Rechnungsnummer
  - `value`: Float; Geldmenge
- wages.csv
  - `projectid`: Integer; Verweis auf das Projekt
  - `type`: Integer; ID für Lohntyp
  - `value`: Float; Stundenanzahl
- data.json: sonstige Daten wie:
  - welcher Lohn-/Materialtyp welchen Namen hat (oder Farbe?)
  - Settings

## License
This Project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).
