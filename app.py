from flask import Flask, request, jsonify
from flask_cors import CORS
from anthropic import Anthropic
from dotenv import load_dotenv
import os
import json
import uuid
from datetime import datetime

load_dotenv()
api_key = os.getenv("CLAUDE_API_KEY")

client = Anthropic(api_key=api_key)

app = Flask(__name__)
CORS(app)

COMMENTS_FILE = 'comments_training_data.json'

def load_comments_data():
    try:
        with open(COMMENTS_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"training_data": []}

def save_comments_data(data):
    with open(COMMENTS_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def extract_topic_keywords(post_text):
    words = post_text.lower().split()
    keywords = [word for word in words if len(word) > 4]
    return keywords[:5]


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

    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return jsonify({"comment": response.content[0].text.strip()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/store', methods=['POST'])
def store_comment():
    data = request.json
    
    original_post = data.get('original_post', '')
    generated_comment = data.get('generated_comment', '')
    final_comment = data.get('final_comment', '')
    post_author = data.get('post_author', '')
    your_relationship = data.get('your_relationship', '')
    
    modifications = ""
    if generated_comment != final_comment:
        modifications = f"Changed from: '{generated_comment}' to: '{final_comment}'"
    
    comment_data = {
        "id": str(uuid.uuid4()),
        "original_post": original_post,
        "generated_comment": generated_comment,
        "final_comment": final_comment,
        "modifications": modifications,
        "post_topic": extract_topic_keywords(original_post),
        "engagement": {"likes": 0, "replies": 0},
        "timestamp": datetime.now().isoformat(),
        "post_author": post_author,
        "your_relationship": your_relationship
    }
    
    comments_data = load_comments_data()
    comments_data["training_data"].append(comment_data)
    save_comments_data(comments_data)
    
    return jsonify({"success": True, "stored_id": comment_data["id"]})


@app.route('/export', methods=['GET'])
def export_training_data():
    comments_data = load_comments_data()
    
    training_format = []
    for item in comments_data["training_data"]:
        training_format.append({
            "input": f"Post: {item['original_post']}\nGenerated: {item['generated_comment']}",
            "output": item['final_comment'],
            "metadata": {
                "topic": item['post_topic'],
                "modifications": item['modifications'],
                "timestamp": item['timestamp']
            }
        })
    
    return jsonify({"training_data": training_format, "total_samples": len(training_format)})

if __name__ == "__main__":
    app.run(port=5001)
