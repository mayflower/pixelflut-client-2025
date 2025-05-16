#!/bin/bash

# Farben für Ausgabe
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        Pixelflut Docker Client     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════╝${NC}"
echo

# Prüfen, ob Docker installiert ist
if ! command -v docker &> /dev/null; then
    echo "Docker ist nicht installiert. Bitte installiere Docker und versuche es erneut."
    exit 1
fi

# Prüfen, ob ein Bild ausgewählt wurde
if [ "$1" == "" ]; then
    echo "Kein Bild angegeben. Verwende Standard-Bild."
    IMAGE_PATH=""
else
    if [ -f "$1" ]; then
        IMAGE_PATH="$1"
        echo -e "${GREEN}Verwende Bild:${NC} $IMAGE_PATH"
    else
        echo "Die Datei $1 existiert nicht. Bitte gib einen gültigen Pfad an."
        exit 1
    fi
fi

# Interaktiv nach dem Client-Typ fragen
echo
echo "Welchen Client möchtest du verwenden?"
echo "1) Interaktiver Client (advanced.js)"
echo "2) Statischer Client (index.js)"
echo "3) Animations-Client (continuous.js)"
read -p "Auswahl (1-3, Standard: 1): " CLIENT_CHOICE

case $CLIENT_CHOICE in
    2)
        CLIENT_SCRIPT="index.js"
        ;;
    3)
        CLIENT_SCRIPT="continuous.js"
        ;;
    *)
        CLIENT_SCRIPT="advanced.js"
        ;;
esac

echo -e "${GREEN}Verwende Client:${NC} $CLIENT_SCRIPT"

# Interaktiv nach X und Y Position fragen (falls nicht advancved.js)
if [ "$CLIENT_SCRIPT" != "advanced.js" ]; then
    read -p "X-Position (Standard: 0): " POSITION_X
    read -p "Y-Position (Standard: 0): " POSITION_Y
fi

# Docker-Container bauen und starten
echo
echo -e "${GREEN}Starte Pixelflut-Client in Docker...${NC}"
echo

# Docker-Command zusammenbauen
DOCKER_CMD="docker run -it --rm -v $(pwd):/app/images"

# Umgebungsvariablen hinzufügen
if [ ! -z "$IMAGE_PATH" ]; then
    DOCKER_CMD="$DOCKER_CMD -e IMAGE_PATH=/app/images/$IMAGE_PATH"
fi

if [ ! -z "$POSITION_X" ]; then
    DOCKER_CMD="$DOCKER_CMD -e POSITION_X=$POSITION_X"
fi

if [ ! -z "$POSITION_Y" ]; then
    DOCKER_CMD="$DOCKER_CMD -e POSITION_Y=$POSITION_Y"
fi

# Finales Kommando
DOCKER_CMD="$DOCKER_CMD pixelflut-client node $CLIENT_SCRIPT"

# Image bauen, falls es nicht existiert
if [[ "$(docker images -q pixelflut-client 2> /dev/null)" == "" ]]; then
    echo "Docker-Image wird gebaut..."
    docker build -t pixelflut-client .
fi

# Docker-Container starten
echo "Führe aus: $DOCKER_CMD"
$DOCKER_CMD