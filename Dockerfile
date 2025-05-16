FROM node:18-slim

# Arbeitsverzeichnis erstellen
WORKDIR /app

# Abhängigkeiten zuerst kopieren und installieren
COPY package.json ./
RUN npm install

# Alle Client-Dateien kopieren
COPY index.js ./
COPY continuous.js ./
COPY advanced.js ./
COPY setup.js ./
COPY README.md ./

# Standard-Beispielbild erstellen (optional)
RUN echo '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="#0099ff"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Pixelflut</text></svg>' > image.svg

# Port für Telnet-Verbindung freigeben (falls gebraucht)
EXPOSE 1337

# Umgebungsvariablen setzen, die in den Clients verwendet werden können
ENV PIXELFLUT_SERVER=10.93.230.17
ENV PIXELFLUT_PORT=1337

# Startbefehl (verwendet den interaktiven Client)
CMD ["node", "advanced.js"]