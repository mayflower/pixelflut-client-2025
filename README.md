# Pixelflut Client

Ein einfacher Node.js-Client zum Senden von Bildern an einen Pixelflut-Server.

## Installation

1. Stelle sicher, dass Node.js auf deinem System installiert ist.
2. Klone dieses Repository oder lade die Dateien herunter.
3. Führe `npm install` aus, um die erforderlichen Abhängigkeiten zu installieren.

## Verwendung

1. Lege ein Bild im Projektverzeichnis ab und ändere den `IMAGE_PATH` in der `index.js` auf den Pfad zu deinem Bild.
2. Passe ggf. die Position (`POSITION_X` und `POSITION_Y`) an, um zu bestimmen, wo das Bild auf der Pixelflut-Leinwand erscheinen soll.
3. Führe das Programm mit `npm start` aus.

## Konfiguration

In der `index.js` kannst du folgende Einstellungen anpassen:

- `SERVER_HOST`: Die IP-Adresse des Pixelflut-Servers (aktuell: 10.93.230.17)
- `SERVER_PORT`: Der Port des Pixelflut-Servers (aktuell: 1337)
- `IMAGE_PATH`: Der Pfad zum Bild, das gesendet werden soll
- `POSITION_X` und `POSITION_Y`: Die Position, an der das Bild auf der Leinwand platziert werden soll

## Pixelflut-Protokoll

Pixelflut verwendet ein einfaches textbasiertes Protokoll:

- `PX x y rrggbb`: Setzt einen Pixel an der Position (x, y) mit der Farbe rrggbb (Hexadezimal)
- `SIZE`: Fragt die Größe der Leinwand ab (nicht implementiert in diesem Client)