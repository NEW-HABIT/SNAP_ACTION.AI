# ⚡ Screenshot to Action — AI-Powered Vision Assistant

> **Turn static screenshots, receipts, flyers, and notes into instant, 1-click interactive actions.**

[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

---

## 💡 Overview

**Screenshot to Action** is an advanced Multimodal Vision AI application designed to eliminate manual data entry. Upload or paste any screenshot—a receipt, flight boarding pass, Amazon order, sticky note, or event flyer—and the AI automatically extracts structured entities and generates **1-click interactive action buttons** (e.g. track package, add to Google Calendar, open Google Maps, log expense, or dispatch to custom Webhooks).

---

## 🔥 4 Killer Features

### 1. ⚡ Multi-Action Compound Chains
Instead of returning a single isolated link, the AI vision engine analyzes screenshots and generates **multi-intent compound action chains**.
* *Example (Flight Boarding Pass)*:
  1. 🗓️ **Add to Calendar**: Generates a `.ics` file or Google Calendar link.
  2. ✈️ **Track Flight**: Launches flight status tracking.
  3. 📍 **Open Destination Map**: Opens the arrival airport in Google Maps.
* **1-Click Execution**: Click *"⚡ Execute All Compound Actions"* to launch the full action chain in sequence.

### 2. 📱 Zero-Login QR Peer Sync
Pair mobile phones and desktop screens instantly without account registration or logins.
* Click **"📱 Show QR Code"** in the top navigation bar or settings.
* Scan the QR code with your mobile camera to join the sync room (`?room=<room-id>`).
* Photos captured on your phone automatically stream and render on your desktop screen in real-time.

### 3. 🚀 Direct API & Webhook Dispatcher
Connect your screenshots directly to your productivity stack (Notion, Zapier, Make, Airtable, or custom REST URLs).
* Configure a custom Webhook URL in **Settings**.
* Click **"🚀 Dispatch Webhook"** on any extracted item to POST structured JSON payloads directly to your automation workflow.

### 4. 🛡️ Client-Side Smart Privacy Shield (PII Redaction)
Keep sensitive financial and personal data safe before it leaves your device.
* Enable *"🛡️ Smart Privacy Shield"* in Settings.
* Sensitive regions (credit card 16-digits, SSNs, sensitive card numbers) are automatically blurred and redacted locally on an HTML5 canvas **before** sending base64 images to AI models.

---

## 📦 6 Automated Extraction Categories

| Category | Icon | Extracted Items | 1-Click Actions |
| :--- | :---: | :--- | :--- |
| **Orders & Shipping** | 📦 | Tracking numbers, vendors, delivery dates | Track Package status |
| **Calendar Events** | 📅 | Event title, date, time, venue | Add to Google Calendar / Download `.ics` |
| **Expenses & Receipts** | 🧾 | Merchant name, item cost, payment method | Log Expense & Export CSV/JSON |
| **Flight Boarding Passes** | ✈️ | Flight #, gate, departure, destination | Track Flight & Destination Maps |
| **Locations & Maps** | 📍 | Street addresses, venue names | Open in Google Maps |
| **Tasks & Notes** | 📝 | Handwritten & typed checklist items | Interactive To-Do Checkboxes |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Vanilla CSS (HSL Color System & Glassmorphism), Motion (Framer Motion animations).
- **Backend API**: Express.js server (`server.ts` & `api/index.ts`), optimized for Node.js local execution and Vercel Serverless Function rewrites.
- **Vision AI Model**: Multimodal Vision AI Engine (configured via environment variables).
- **Storage & Real-Time Sync**: Hybrid `localStorage` + Web `BroadcastChannel` + Serverless Room Sync API (`/api/room/*`).

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **bun**

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/screenshot-to-action.git
   cd screenshot-to-action
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to create your local `.env` file and add your API credentials there:
   ```bash
   cp .env.example .env
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   

---

## 🌐 Deploying to Vercel

This repository is pre-configured with `vercel.json` for one-click serverless deployment:

1. Push your repository to **GitHub**.
2. Import the project into your **Vercel Dashboard**.
3. Set your environment variables in your Vercel project settings (as defined in `.env.example`).
4. Click **Deploy**!

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
