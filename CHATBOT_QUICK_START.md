# Quick Start - Chatbot Setup

## 🚀 Quick Setup (3 steps)

### Step 1: Configure API URL
Edit `frontend-app-learning/.env.development`:

```bash
CHATBOT_API_URL='https://your-actual-chatbot-api-url.com/api/chat'
```

⚠️ **IMPORTANT**: Replace `YOUR_CHATBOT_API_URL_HERE` with your actual API URL!

### Step 2: Restart Development Server
```bash
cd frontend-app-learning
# If server is running, stop it (Ctrl+C)
npm start
```

### Step 3: Test It!
1. Open http://localhost:2000 (or http://apps.local.edly.io:1996)
2. Look for the 💬 icon in the bottom-right corner
3. Click to open the chatbot
4. Type a message and test!

---

## 📁 Files Created/Modified

### New Files:
- `src/chatbot/ChatbotWidget.jsx` - Main chatbot component
- `src/chatbot/ChatbotWidget.scss` - Chatbot styles  
- `src/chatbot/index.js` - Export file
- `CHATBOT_INTEGRATION_GUIDE.md` - Full documentation
- `CHATBOT_QUICK_START.md` - This file
- `setup-chatbot.sh` - Configuration script

### Modified Files:
- `src/index.jsx` - Added ChatbotWidget component
- `.env` - Added chatbot environment variables
- `.env.development` - Added chatbot configuration

---

## 🎨 Customization (Optional)

All in `.env.development`:

```bash
CHATBOT_PRIMARY_COLOR='#FF5722'              # Change color
CHATBOT_WELCOME_MESSAGE='Hello there!'       # Change welcome text
CHATBOT_PLACEHOLDER='Ask me anything...'     # Change input placeholder
CHATBOT_POSITION='bottom-left'               # Change position
CHATBOT_BUTTON_TEXT='🤖'                     # Change button emoji
```

---

## 🐛 Troubleshooting

**Chatbot doesn't appear?**
- ✅ Check `CHATBOT_API_URL` is set in `.env.development`
- ✅ Restart development server after changing `.env`
- ✅ Hard refresh browser (Ctrl+Shift+R)

**API errors in chat?**
- ✅ Verify API URL is correct and accessible
- ✅ Check browser console (F12) for errors
- ✅ Ensure API accepts POST with `{ "message": "text" }`
- ✅ Ensure API returns `{ "response": "text" }` or `{ "message": "text" }`

---

## 📖 Need More Help?

See `CHATBOT_INTEGRATION_GUIDE.md` for complete documentation including:
- Detailed configuration options
- API integration examples
- Security best practices
- Mobile responsiveness
- Troubleshooting guide

---

## 🔒 Security Reminder

**NEVER commit your actual API URL to Git!**

The `.env.development` file is already in `.gitignore`, so your API URL stays private.

---

## ✨ You're Done!

The chatbot is now integrated and ready to use! 🎉

Students can access it from any page in the learning platform by clicking the 💬 button.
