# Milk Analyzer Bluetooth Tester

A lightweight web application for testing Bluetooth communication with Milk Analyzers using modern Web APIs.

The frontend is hosted on GitHub Pages.

The backend is a small Google Apps Script REST API using Google Sheets as the database.

---

## Features

- Modern responsive interface
- Web Bluetooth (BLE)
- Web Serial (Bluetooth SPP)
- Automatic packet logging
- FAT / SNF / CLR extraction
- Multiple parser formats
- Google Sheets storage
- Connection diagnostics
- Raw HEX and ASCII packet viewer
- Event log
- Analyzer-independent architecture

---

## Project Structure

```
Milk-Analyzer-Tester
│
├── index.html
├── style.css
│
├── js/
│   ├── app.js
│   ├── api.js
│   ├── bluetooth.js
│   ├── ble.js
│   ├── serial.js
│   ├── parser.js
│   ├── logger.js
│   ├── settings.js
│   ├── ui.js
│   └── utils.js
│
├── Code.gs
└── README.md
```

---

## Architecture

```
Milk Analyzer
        │
        ▼
BLE / Serial
        │
        ▼
Bluetooth Controller
        │
        ▼
Packet Parser
        │
        ▼
Application
        │
        ▼
Google Apps Script API
        │
        ▼
Google Sheets
```

---

## Browser Requirements

- Google Chrome (Desktop)
- Google Chrome (Android)
- Microsoft Edge (Chromium)

Web Bluetooth and Web Serial require HTTPS.

GitHub Pages satisfies this requirement.
