import joblib
import pandas as pd
# --- NEW: Import render_template ---
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import os

# --- 1. App Initialization & Configuration ---
# --- NEW: Point Flask to your static and template folders ---
app = Flask(__name__,
            static_folder='static',
            template_folder='templates')

app.config['SECRET_KEY'] = 'a-very-secret-key-that-you-should-change'
# Use SQLite for simplicity, you can switch back to PostgreSQL later
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login' 

# ... (All your existing model loading, database models, and API endpoints remain the same) ...
# --- Load the Trained ML Model ---
try:
    model_pipeline = joblib.load('production_model.pkl')
    print("✓ Model pipeline loaded successfully.")
except FileNotFoundError:
    print("--- ERROR: Model file 'production_model.pkl' not found.")
    model_pipeline = None

# --- Database Models ---
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    def set_password(self, password): self.password_hash = generate_password_hash(password)
    def check_password(self, password): return check_password_hash(self.password_hash, password)

class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    input_data = db.Column(db.String(2000), nullable=False) 
    prediction_result = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# --- API Endpoints for User Authentication ---
@app.route('/api/register', methods=['POST'])
def register():
    # ... (code for registration)
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
    new_user = User(username=data['username'])
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    # ... (code for login)
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    if user and user.check_password(data.get('password')):
        login_user(user, remember=True)
        return jsonify({'status': 'success', 'message': 'Logged in successfully'})
    return jsonify({'status': 'error', 'message': 'Invalid username or password'}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    # ... (code for logout)
    logout_user()
    return jsonify({'status': 'success', 'message': 'Logged out successfully'})


# --- The Protected Prediction Endpoint ---
@app.route('/api/predict', methods=['POST'])
@login_required 
def predict():
    # ... (code for prediction)
    if not model_pipeline:
        return jsonify({'error': 'Model not available'}), 500
    json_data = request.get_json()
    input_df = pd.DataFrame([json_data])
    prediction_raw = model_pipeline.predict(input_df)
    prediction_label = "Potential Fraud" if prediction_raw[0] == -1 else "Legitimate"
    new_prediction = Prediction(user_id=current_user.id, input_data=str(json_data), prediction_result=prediction_label)
    db.session.add(new_prediction)
    db.session.commit()
    return jsonify({'prediction_label': prediction_label, 'is_fraud': bool(prediction_raw[0] == -1)})

# --- An Endpoint to View History ---
@app.route('/api/history', methods=['GET'])
@login_required
def history():
    # ... (code for history)
    predictions = Prediction.query.filter_by(user_id=current_user.id).order_by(Prediction.timestamp.desc()).all()
    history_list = [{'timestamp': p.timestamp, 'input': p.input_data, 'result': p.prediction_result} for p in predictions]
    return jsonify(history_list)


# --- NEW: Route to Serve the Frontend ---
# This will be the main entry point for users visiting your site.
@app.route('/')
def serve_app():
    return render_template('index.html')

# This is a catch-all route to handle client-side routing.
# It ensures that if a user reloads the page on /history, Flask still serves the main app.
@app.route('/<path:path>')
def serve_static(path):
    return render_template('index.html')


# --- Run the App ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
    

