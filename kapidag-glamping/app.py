from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import firebase_admin
from firebase_admin import credentials, firestore
from textblob import TextBlob
from datetime import datetime
import random
import os
from flask_bcrypt import Bcrypt

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # Change this in production
bcrypt = Bcrypt(app)

# Firebase Setup
# Assumes serviceAccountKey.json is in the same directory
try:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    print(f"Firebase initialization error: {e}")
    # For development without firebase key, we might want to handle this gracefully or just crash
    # But user said to assume it exists.

# Mock Weather Function
def get_weather():
    conditions = [
        {"temp": 22, "condition": "Sunny", "message": "Güneşin tadını çıkar, doğa seni çağırıyor."},
        {"temp": 18, "condition": "Cloudy", "message": "Bulutların altında huzurlu bir yürüyüşe ne dersin?"},
        {"temp": 15, "condition": "Rainy", "message": "Toprak kokusu seni bekliyor, yağmuru hisset."},
        {"temp": 10, "condition": "Windy", "message": "Rüzgarın sesini dinle, zihnini boşalt."}
    ]
    return random.choice(conditions)

@app.route('/')
def index():
    weather = get_weather()
    
    # Fetch Posts
    posts_ref = db.collection('posts').order_by('timestamp', direction=firestore.Query.DESCENDING)
    posts = [doc.to_dict() for doc in posts_ref.stream()]
    
    # Fetch Rides
    rides_ref = db.collection('rides').order_by('departure_time', direction=firestore.Query.ASCENDING)
    rides = [doc.to_dict() for doc in rides_ref.stream()]
    
    # Mock Events
    events = [
        {
            "id": 1, 
            "title": "Dolunay Yürüyüşü", 
            "date": "Bu Akşam, 21:00", 
            "location": "Kirazlı Şelalesi Parkuru",
            "image": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80", 
            "participants": 12, 
            "desc": "Ay ışığında ormanın gizemini keşfet. Fenerini almayı unutma!",
            "link": "#"
        },
        {
            "id": 2, 
            "title": "Gündoğumu Yogası", 
            "date": "Yarın, 06:30", 
            "location": "Manastır Koyu İskelesi",
            "image": "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=800&q=80", 
            "participants": 8, 
            "desc": "Güne zinde ve huzurlu bir başlangıç. Matını kap gel.",
            "link": "#"
        },
        {
            "id": 3, 
            "title": "Kamp Ateşi & Müzik", 
            "date": "Cuma, 22:00", 
            "location": "Ana Kamp Alanı",
            "image": "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80", 
            "participants": 25, 
            "desc": "Sıcak çikolata, akustik gitar ve unutulmaz hikayeler.",
            "link": "#"
        }
    ]
    
    # Check Detox Status
    detox_start = session.get('detox_start_time')
    
    return render_template('index.html', weather=weather, posts=posts, rides=rides, events=events, detox_start=detox_start)

@app.route('/register', methods=['POST'])
def register():
    username = request.form.get('username')
    email = request.form.get('email')
    password = request.form.get('password')
    
    if username and email and password:
        # Check if user exists
        users_ref = db.collection('users')
        existing_user = users_ref.where('username', '==', username).stream()
        if len(list(existing_user)) > 0:
            # User already exists
            return redirect(url_for('index')) 
            
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        
        user_data = {
            'username': username,
            'email': email,
            'password': hashed_password,
            'created_at': datetime.now()
        }
        db.collection('users').add(user_data)
        session['username'] = username
        
    return redirect(url_for('index'))

@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')
    
    if username and password:
        users_ref = db.collection('users')
        query = users_ref.where('username', '==', username).stream()
        
        for doc in query:
            user_data = doc.to_dict()
            if bcrypt.check_password_hash(user_data['password'], password):
                session['username'] = username
                return redirect(url_for('index'))
                
    return redirect(url_for('index')) # Login failed

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/add_post', methods=['POST'])
def add_post():
    content = request.form.get('content')
    username = session.get('username', 'Anonim')
    
    if content:
        # AI Sentiment Analysis
        blob = TextBlob(content)
        polarity = blob.sentiment.polarity
        sentiment_score = round(polarity, 2)
        
        ai_reply = None
        if polarity < 0:
            ai_reply = "Gergin görünüyorsun, papatya çayı ikramımız hazır. 🌼"
        elif polarity > 0.5:
            ai_reply = "Harika bir enerji! Doğanın keyfini çıkar. 🌲"
            
        post_data = {
            'content': content,
            'author': username,
            'timestamp': datetime.now(),
            'sentiment_score': sentiment_score,
            'ai_reply': ai_reply
        }
        
        db.collection('posts').add(post_data)
        
    return redirect(url_for('index'))

@app.route('/add_ride', methods=['POST'])
def add_ride():
    driver_name = request.form.get('driver_name')
    departure_time = request.form.get('departure_time')
    location = request.form.get('location')
    contact = request.form.get('contact')
    
    if driver_name and departure_time and location:
        ride_data = {
            'driver_name': driver_name,
            'departure_time': departure_time,
            'location': location,
            'contact': contact,
            'created_at': datetime.now()
        }
        db.collection('rides').add(ride_data)
        
    return redirect(url_for('index'))

@app.route('/toggle_detox', methods=['POST'])
def toggle_detox():
    action = request.form.get('action')
    if action == 'start':
        session['detox_start_time'] = datetime.now().isoformat()
    elif action == 'stop':
        session.pop('detox_start_time', None)
    return redirect(url_for('index'))

# Admin Data Endpoint
@app.route('/api/admin_data')
def admin_data():
    # In a real app, verify admin session here
    
    # Count Users (Mock or Real)
    users_count = 0 
    # users_ref = db.collection('users')
    # users_count = len(list(users_ref.stream())) # This is expensive for large collections
    users_count = 150 # Mock data for demo
    
    # Sentiment Distribution
    posts_ref = db.collection('posts')
    posts = [doc.to_dict() for doc in posts_ref.stream()]
    
    positive = sum(1 for p in posts if p.get('sentiment_score', 0) > 0)
    negative = sum(1 for p in posts if p.get('sentiment_score', 0) < 0)
    neutral = len(posts) - positive - negative
    
    return jsonify({
        'users_count': users_count,
        'sentiment_stats': [positive, negative, neutral]
    })

if __name__ == '__main__':
    app.run(debug=True)
