# Share Space 🌌

Share Space is a premium, modern full-stack feedback web application featuring a stunning **dark glassmorphism design** on the frontend and a robust **Flask API backend** integrated end-to-end with the **Telegram Bot API**.

---

## ✨ Features

- **Stunning UI/UX**: Frosted frosted-glass aesthetic container with soft glowing neon gradients,Outfit/Inter typography, and smooth responsive states.
- **Interactive Emoji Stars**: Responsive five-star rating selector utilizing interactive emojis that dynamically scale, glow, and toggle grayscale overlays.
- **Floating Inputs**: Sleek animated transition forms for Name, Email, and Comment textareas.
- **Robust Validation**: Real-time error banners and validation checks.
- **Flask REST API**: Dynamic CORS-enabled backend endpoint (`/submit`) that validates, constructs beautifully formatted Markdown messages, and delivers them directly to a Telegram Channel or Private Chat.
- **Intelligent Demo Fallback**: Gracefully operates in a secure "Demo Mode" with robust logs if API credentials are not provided.

---

## 📁 Repository Structure

```
share-space/
├── frontend/
│   ├── index.html     # Gorgeous layout structure
│   ├── style.css      # Frosted glassmorphism design variables
│   └── app.js         # Interactive stars, validation, & fetch API
└── backend/
    ├── app.py         # Flask API & Telegram integration server
    ├── requirements.txt # Dependencies
    ├── .env           # Live bot token and chat ID (Git ignored)
    └── .env.example   # Configuration template
```

---

## 🚀 Getting Started

### 1. Clone & Set Up Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Telegram Environment Variables
Copy `.env.example` to `.env` and fill out your actual credentials:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### 3. Run the API Server
```bash
python app.py
```
*The server will run on `http://127.0.0.1:5001`.*

### 4. Run the Interface
Simply open `frontend/index.html` in any modern web browser and begin submitting premium feedback!
