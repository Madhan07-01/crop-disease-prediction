import os
import json
import torch
import torch.nn as nn
from torchvision import models, transforms
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# --- Configuration ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'plant_disease_model.pth')
CLASS_NAMES_PATH = os.path.join(BASE_DIR, 'class_names.json')
IMG_SIZE = 224

# --- Global Variables ---
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = None
class_names = []

def load_model():
    global model, class_names
    
    # 1. Load class names
    if not os.path.exists(CLASS_NAMES_PATH):
        print(f"Warning: {CLASS_NAMES_PATH} not found. Ensure you place it in the ai_service folder!")
        return
        
    with open(CLASS_NAMES_PATH, 'r') as f:
        class_names = json.load(f)
        
    num_classes = len(class_names)
    
    # 2. Initialize ResNet50 Architecture (Must match training code exactly!)
    model = models.resnet50(weights=None)
    num_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(p=0.4),
        nn.Linear(num_features, 512),
        nn.ReLU(),
        nn.Dropout(p=0.3),
        nn.Linear(512, num_classes),
    )
    
    # 3. Load Weights
    if not os.path.exists(MODEL_PATH):
        print(f"Warning: {MODEL_PATH} not found. Ensure you place it in the ai_service folder!")
        return
        
    try:
        state_dict = torch.load(MODEL_PATH, map_location=device, weights_only=True)
    except TypeError:
        # Supports older PyTorch versions while favoring safe tensor-only loading.
        state_dict = torch.load(MODEL_PATH, map_location=device)

    model.load_state_dict(state_dict)
    model = model.to(device)
    model.eval()
    print("Model loaded successfully!")

# Define the image transformations (Must match validation transforms)
val_transforms = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model is not loaded on the server. Missing .pth file?'}), 500
        
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    try:
        # Read the image
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        
        # Transform and predict
        tensor = val_transforms(img).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted_idx = torch.max(probabilities, 1)
            
        predicted_disease = class_names[predicted_idx.item()]
        confidence_score = confidence.item()
        
        return jsonify({
            'prediction': predicted_disease,
            'confidence': confidence_score
        })
        
    except Exception as e:
        print("Prediction Error:", str(e))
        return jsonify({'error': 'Failed to process image'}), 500

@app.route('/health', methods=['GET'])
def health():
    if model is None:
        return jsonify({'status': 'unavailable', 'error': 'Model failed to load'}), 503
    return jsonify({'status': 'ready', 'device': str(device), 'classes': len(class_names)})

if __name__ == '__main__':
    # Load model on startup
    load_model()
    # Run the Flask app on port 5000 (which is where Node.js expects it)
    app.run(host='0.0.0.0', port=5000, debug=True)
