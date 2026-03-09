# Chatbot Integration Guide

## Overview
This guide explains how to set up and use the chatbot widget in the frontend-app-learning application. The chatbot provides AI-powered assistance to students directly in the learning interface.

## Features
- 🤖 AI-powered chatbot for student assistance
- 💬 Interactive chat interface with smooth animations
- 🎨 Customizable appearance (colors, text, position)
- 📱 Fully responsive (mobile & desktop)
- 🔒 Secure API integration with environment variables
- ⚡ Real-time messaging
- 👁️ Show/hide toggle functionality

## Installation

### 1. Environment Configuration

The chatbot requires configuration through environment variables. These are already set up in:
- `.env` (production)
- `.env.development` (development)

#### Required Configuration

Open `.env.development` and update the chatbot settings:

```bash
# Chatbot Configuration
CHATBOT_API_URL='https://your-chatbot-api-url.com/api/chat'  # REQUIRED: Replace with your actual API URL
CHATBOT_BUTTON_TEXT='💬'
CHATBOT_PRIMARY_COLOR='#4CAF50'
CHATBOT_WELCOME_MESSAGE='Xin chào! Tôi là chatbot MOOC 🤖'
CHATBOT_PLACEHOLDER='Hỏi tôi về tài liệu PDF...'
CHATBOT_POSITION='bottom-right'
```

#### Environment Variable Details

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `CHATBOT_API_URL` | Your chatbot API endpoint URL | - | ✅ Yes |
| `CHATBOT_BUTTON_TEXT` | Icon/text shown on toggle button | 💬 | No |
| `CHATBOT_PRIMARY_COLOR` | Main color theme (hex code) | #4CAF50 | No |
| `CHATBOT_WELCOME_MESSAGE` | First message shown to users | Xin chào! Tôi là chatbot MOOC 🤖 | No |
| `CHATBOT_PLACEHOLDER` | Input field placeholder text | Hỏi tôi về tài liệu PDF... | No |
| `CHATBOT_POSITION` | Widget position on screen | bottom-right | No |

#### Position Options
- `bottom-right` (default)
- `bottom-left`
- `top-right`
- `top-left`

### 2. API Configuration

Your chatbot API should accept POST requests with the following format:

**Request:**
```json
{
  "message": "User's question here"
}
```

**Response:**
```json
{
  "response": "Bot's answer here"
}
```

OR

```json
{
  "message": "Bot's answer here"
}
```

### 3. Running the Application

#### Development Mode

```bash
cd frontend-app-learning
npm install  # If not already installed
npm start
```

The application will run on `http://localhost:2000` by default.

#### Production Build

```bash
npm run build
```

## Usage

### For Students

1. **Opening the Chatbot**
   - Look for the chat icon (💬) in the bottom-right corner of the screen
   - Click the icon to open the chat window
   - A tooltip "Bạn cần hỗ trợ gì?" appears on hover

2. **Chatting with the Bot**
   - Type your question in the input field at the bottom
   - Press Enter or click the send button (😊)
   - Wait for the bot's response (indicated by typing animation)

3. **Closing the Chatbot**
   - Click the ✕ button in the chat header
   - The chat minimizes back to the icon

### Visual Design

The chatbot follows the design shown in your reference images:

**Minimized State:**
- Small circular button with emoji (💬)
- Tooltip on hover: "Bạn cần hỗ trợ gì?"
- Positioned in bottom-right corner

**Expanded State:**
- Chat window (380px × 600px on desktop)
- Red header with "GearVN" branding and "Chat với chúng tôi"
- White message area with gray background
- Bot messages: white bubbles on left
- User messages: green bubbles on right
- Input field at bottom with emoji send button

## Customization

### Changing Colors

Update `CHATBOT_PRIMARY_COLOR` in `.env.development`:

```bash
CHATBOT_PRIMARY_COLOR='#FF5722'  # Orange
CHATBOT_PRIMARY_COLOR='#2196F3'  # Blue
CHATBOT_PRIMARY_COLOR='#9C27B0'  # Purple
```

### Changing Messages

Update the welcome message and placeholder:

```bash
CHATBOT_WELCOME_MESSAGE='Hello! How can I help you today?'
CHATBOT_PLACEHOLDER='Ask me anything...'
```

### Changing Position

Move the chatbot to a different corner:

```bash
CHATBOT_POSITION='bottom-left'
CHATBOT_POSITION='top-right'
CHATBOT_POSITION='top-left'
```

## Troubleshooting

### Chatbot Not Appearing

1. **Check API URL**: Ensure `CHATBOT_API_URL` is set in `.env.development`
2. **Restart Dev Server**: After changing `.env` files, restart the server:
   ```bash
   # Stop the server (Ctrl+C)
   npm start
   ```

### API Errors

If you see error messages in the chat:

1. **Check API URL**: Verify the URL is correct and accessible
2. **Check API Response Format**: Ensure your API returns `response` or `message` field
3. **Check CORS**: Your API must allow requests from your frontend domain
4. **Check Console**: Open browser DevTools (F12) and check for error messages

### Styling Issues

If the chatbot doesn't look right:

1. **Clear Browser Cache**: Hard refresh with Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Check CSS**: Make sure `ChatbotWidget.scss` is imported correctly
3. **Check z-index**: The chatbot has `z-index: 999999` to appear above everything

## File Structure

```
frontend-app-learning/
├── src/
│   ├── chatbot/
│   │   ├── ChatbotWidget.jsx      # Main chatbot component
│   │   ├── ChatbotWidget.scss     # Chatbot styles
│   │   └── index.js               # Export file
│   ├── index.jsx                  # Main app file (chatbot integrated here)
│   └── ...
├── .env                           # Production environment config
├── .env.development               # Development environment config
└── ...
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit sensitive API URLs** to version control
2. **Use environment variables** for all sensitive configuration
3. **Secure your API** with proper authentication if needed
4. **Validate API responses** before displaying to users
5. **Add rate limiting** to prevent abuse

## API Integration Example

If you need to add authentication to your API calls, modify `ChatbotWidget.jsx`:

```jsx
const response = await fetch(chatbotConfig.apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${yourAuthToken}`,  // Add auth header
  },
  body: JSON.stringify({ message: inputValue }),
});
```

## Mobile Responsiveness

The chatbot is fully responsive:

- **Desktop**: 380px × 600px floating window
- **Mobile**: Full-screen chat interface
- **Tablet**: Adaptive sizing

On mobile devices (< 480px), the chat automatically goes full-screen for better usability.

## Browser Compatibility

The chatbot works on all modern browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Support

If you encounter issues:

1. Check this README
2. Review browser console for errors
3. Verify environment variables are set correctly
4. Ensure your API is working and accessible

## Future Enhancements

Potential improvements you can add:

- [ ] Message history persistence (localStorage)
- [ ] File upload support
- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Typing indicators for user
- [ ] Read receipts
- [ ] Message timestamps
- [ ] Emoji picker
- [ ] Link previews

## License

This chatbot integration follows the same license as the frontend-app-learning application.
