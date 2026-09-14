import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return 'SkillBridge AI Model Running! 🤖'

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.json
        query = data.get('query', '')
        skills = data.get('skills', [])

        if not skills or not query:
            return jsonify([])

        descriptions = [
            f"{s.get('SKILL_NAME', '')} {s.get('CATEGORY', '')} {s.get('DESCRIPTION', '')}"
            for s in skills
        ]

        descriptions.append(query)

        vectorizer = TfidfVectorizer()
        vectors = vectorizer.fit_transform(descriptions)

        query_vector = vectors[-1]
        skill_vectors = vectors[:-1]

        scores = cosine_similarity(query_vector, skill_vectors)[0]
        top_indices = scores.argsort()[-5:][::-1]
        results = [skills[i] for i in top_indices]

        return jsonify(results)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)