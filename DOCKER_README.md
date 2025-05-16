# Pixelflut Client Docker

Diese Anleitung erklärt, wie du den Pixelflut-Client mit Docker verwenden kannst.

## Voraussetzungen

- Docker installiert
- Docker Compose installiert (optional, aber empfohlen)

## Schnellstart

### Mit Docker Compose (empfohlen)

1. Baue und starte den Container:

```bash
docker-compose up --build
```

2. Dies startet den interaktiven Client. Du kannst nun mit dem Menü interagieren.

### Mit Docker direkt

1. Baue das Docker-Image:

```bash
docker build -t pixelflut-client .
```

2. Starte den Container im interaktiven Modus:

```bash
docker run -it --rm -v $(pwd):/app/images pixelflut-client
```

## Bilder verwenden

Lege deine Bilder im Projektverzeichnis ab. Sie werden im Container unter `/app/images` verfügbar sein.

Wenn du z.B. ein Bild "mein_bild.png" im aktuellen Verzeichnis hast, kannst du es im Client referenzieren als:

```
/app/images/mein_bild.png
```

## Verschiedene Client-Modi

Um einen anderen Client-Modus zu starten, ändere den CMD-Befehl:

1. Einfacher Client:

```bash
docker run -it --rm -v $(pwd):/app/images pixelflut-client node index.js
```

2. Animations-Client:

```bash
docker run -it --rm -v $(pwd):/app/images pixelflut-client node continuous.js
```

## Umgebungsvariablen

Du kannst folgende Umgebungsvariablen beim Start des Containers setzen:

- `PIXELFLUT_SERVER`: IP-Adresse des Pixelflut-Servers (Standard: 10.93.230.17)
- `PIXELFLUT_PORT`: Port des Pixelflut-Servers (Standard: 1337)
- `IMAGE_PATH`: Pfad zum Bild im Container
- `POSITION_X`: X-Startposition für das Bild
- `POSITION_Y`: Y-Startposition für das Bild

Beispiel:

```bash
docker run -it --rm -v $(pwd):/app/images -e PIXELFLUT_SERVER=192.168.1.100 -e IMAGE_PATH=/app/images/mein_bild.png pixelflut-client
```

Mit Docker Compose kannst du die Umgebungsvariablen in der `docker-compose.yml` Datei ändern oder überschreiben:

```bash
PIXELFLUT_SERVER=192.168.1.100 docker-compose up
```