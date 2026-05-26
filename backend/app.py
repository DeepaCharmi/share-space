import os
import logging
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes (to support frontend fetch from different origins or local files)
CORS(app)

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables from .env file
load_dotenv()

# Retrieve Telegram configurations
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN_PLACEHOLDER")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "YOUR_TELEGRAM_CHAT_ID_PLACEHOLDER")

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "online",
        "message": "Welcome to Share Space Backend API. Submit your feedback to /submit",
        "telegram_configured": bool(
            TELEGRAM_BOT_TOKEN and 
            "PLACEHOLDER" not in TELEGRAM_BOT_TOKEN and 
            TELEGRAM_CHAT_ID and 
            "PLACEHOLDER" not in TELEGRAM_CHAT_ID
        )
    })

@app.route("/submit", methods=["POST"])
def submit_feedback():
    try:
        # Parse JSON request data
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "Missing JSON payload"}), 400

        # Extract and validate inputs
        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        rating = data.get("rating")
        comment = data.get("comment", "").strip()

        # Simple validations
        if not name:
            return jsonify({"status": "error", "message": "Name is required"}), 400
        if not email:
            return jsonify({"status": "error", "message": "Email is required"}), 400
        if rating is None or not (1 <= int(rating) <= 5):
            return jsonify({"status": "error", "message": "Rating must be an integer between 1 and 5"}), 400
        if not comment:
            return jsonify({"status": "error", "message": "Comment is required"}), 400

        # Construct beautiful Telegram message using Markdown
        telegram_message = (
            "🚀 *New Share Space Feedback!*\n\n"
            f"👤 *Name:* {name}\n"
            f"📧 *Email:* {email}\n"
            f"⭐ *Rating:* {'⭐' * int(rating)} ({rating}/5)\n\n"
            f"💬 *Comment:*\n_{comment}_"
        )

        logging.info(f"Received feedback from {name} <{email}> with rating {rating}")

        # Check if Telegram bot token and chat ID are configured correctly
        is_placeholder_token = "PLACEHOLDER" in TELEGRAM_BOT_TOKEN or not TELEGRAM_BOT_TOKEN
        is_placeholder_chat = "PLACEHOLDER" in TELEGRAM_CHAT_ID or not TELEGRAM_CHAT_ID

        if is_placeholder_token or is_placeholder_chat:
            warning_msg = (
                "[DEMO MODE] Feedback received successfully but not sent to Telegram. "
                "Please configure real TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in backend/.env to enable integration."
            )
            logging.warning(warning_msg)
            # Log the message that would have been sent
            logging.info(f"Telegram message content:\n{telegram_message}")
            
            return jsonify({
                "status": "demo_success", 
                "message": "Feedback received successfully (Demo Mode - Telegram not configured).",
                "data": {
                    "name": name,
                    "email": email,
                    "rating": rating,
                    "comment": comment,
                    "formatted_msg": telegram_message
                }
            }), 200

        # Send to Telegram using Bot API
        telegram_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": telegram_message,
            "parse_mode": "Markdown"
        }

        response = requests.post(telegram_url, json=payload, timeout=10)
        response_json = response.json()

        if response.status_code == 200 and response_json.get("ok"):
            logging.info("Successfully sent feedback to Telegram!")
            return jsonify({"status": "success", "message": "Thank you! Your feedback has been sent successfully."}), 200
        else:
            error_description = response_json.get("description", "Unknown Telegram Error")
            logging.error(f"Telegram Bot API Error: {error_description}")
            return jsonify({
                "status": "error", 
                "message": f"Feedback received, but failed to forward to Telegram: {error_description}"
            }), 502

    except Exception as e:
        logging.exception("Exception occurred while processing feedback submission")
        return jsonify({"status": "error", "message": f"Internal Server Error: {str(e)}"}), 500

if __name__ == "__main__":
    # Run on port 5001 to avoid default macOS airplay service at port 5000
    app.run(host="127.0.0.1", port=5001, debug=True)
