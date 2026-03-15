# LinkedIn AI Commenter

An AI-powered Chrome extension that generates intelligent, contextual comments for LinkedIn posts using Claude's AI API.

## Setup Instructions

1. **Clone this repository**
   ```bash
   git clone https://github.com/hemansnation/ai-comment-assist.git
   cd ai-comment-assist
   ```

2. **Create environment file**
   - Create a `.env` file in the project root
   - Add your Claude API key: `CLAUDE_API_KEY=your_api_key_here`

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the backend server**
   ```bash
   python3 app.py
   ```
   The server will run on `http://127.0.0.1:5001`

5. **Install Chrome extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select your project folder
   - The extension will be loaded and ready to use

6. **Use the extension**
   - Go to LinkedIn.com
   - Navigate to any post with a comment section
   - You'll see two buttons next to the comment box:
     - **✨ AI Comment** - Generates an AI comment using Claude
     - **📤 Send** - Posts the comment and saves it for training

7. **Generate and post comments**
   - Click the "AI Comment" button and wait a few seconds
   - Review/edit the generated comment as needed
   - Click "Send" to post the comment and save it to the training database

## Debugging

If you encounter issues:

1. **Check Chrome console logs**
   - Right-click on the LinkedIn page
   - Select "Inspect" → "Console" tab
   - Look for error messages or debug output

2. **Check Flask backend server**
   - Look at the terminal where `app.py` is running
   - Check for incoming requests, errors, or API issues

3. **Verify API connection**
   - Ensure your Claude API key is valid in `.env`
   - Check that port 5001 is available

## Features

- **AI-Powered Comments**: Uses Claude 3.5 Sonnet for context-aware comment generation
- **Training Data Collection**: Stores all generated and final comments for future improvements
- **Dual Interface**: Separate generate and send buttons for better user control
- **LinkedIn Integration**: Seamlessly integrates with LinkedIn's comment system