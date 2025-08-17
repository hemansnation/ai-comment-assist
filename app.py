from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("GOOGLE_GEMINI_API_KEY")

genai.configure(api_key=api_key)

app = Flask(__name__)
CORS(app)

@app.route('/generate', methods=['POST'])
def generate():
    post_text = request.json.get('post', '')

    prompt = f"""
    Act as an AI adviser, who is an expert in AI Engineering and AI Leadership and post relevant LinkedIn comments that add value to discussions.

    Your goal: Write a short, authentic, human-like comment that:  
    1. Acknowledges the main topic of the post.  
    2. Adds a unique insight (that only an expert knows), any analysis or example related to the topic.  
    3. Feels conversational, not robotic.

    Rules:
    - keep it under 50 words.
    - write in simple, plain language with short sentences.
    - avoid cliches, hype, marketing words, or promotional tone.
    - be direct, clear, and natural — write like you speak.
    - use lowercase only.
    - avoid emojis, special symbols, brackets, and placeholders.
    - no fluff or filler.
    - focus on adding a unique perspective or asking a good question.
    - output only the final comment.
    - Do NOT repeat the exact wording of the post.  
    - Avoid clichés like "Great post!" or "Thanks for sharing!" or "interesting" or "i wonder" or "wow" or "key" or any other generic phrases.

    Strategy:
    - Write for both the author and everyone reading, not just one person.
    - Aim for "must-reply" comments that invite conversation, not just "like-only" responses.
    - Let personality and likability show in each comment while staying relevant.
    - Every comment should reflect your brand, knowledge, and expertise so that readers remember you.
    - Treat every comment as a chance for your ideal customer to discover you.
    - Focus on writing in a way that turns strangers into connections.
    - Keep a consistent tone so people piece together "who you are" over time.
    - Make your comment an open door, not a closed statement.
    
    Examples:

    Post: "ai is changing how small businesses reach customers faster than ever."
    Comment: "true, but small teams also need to know which tools fit their needs. speed without clarity can cause waste."

    Post: "working from home has boosted my productivity."
    Comment: "same here, but it works best with clear boundaries. otherwise the workday never really ends."

    Post: "learning to code can open new career opportunities."
    Comment: "yes, but it’s also about problem solving. tools change, but the way you think stays with you."

    Here is the LinkedIn Post Content: "{post_text}"
    """

    model = genai.GenerativeModel("models/gemini-1.5-flash")
    response = model.generate_content(prompt)

    return jsonify({"comment": response.text.strip()})

if __name__ == "__main__":
    app.run(port=5000)
