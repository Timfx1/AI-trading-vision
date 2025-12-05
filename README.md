# ✅ TIMFX1 — AI Trading Vision  
### *Image-Based AI Chart Classification + Pattern Similarity Search*

Timfx1 is a full-stack AI application that analyzes trading charts using deep-learning vision models and compares them to a curated library of valid/invalid trading setups.  
It helps traders learn, self-assess, and improve their edge by seeing how their chart compares to professional setups.

---

## 🚀 Project Overview (for recruiters / hiring managers)

**Timfx1 – AI Trading Vision** is a professional full-stack computer-vision trading tool featuring:

### 🔍 1. Deep Learning Chart Classification
- CNN model trained on curated valid & invalid trading setups  
- Predicts whether a chart is a **valid** or **invalid** trading setup  
- Outputs confidence score  
- Hybrid mode blends *simple phash vision* + *deep-learning model*

### 🖼️ 2. Similarity Search (Smart & Simple Modes)
- **Simple Vision**: Perceptual image hashing (pHash)  
- **Smart Vision**: Embedding-based cosine-distance comparison  
- Shows top matches visually in a responsive gallery

### 📊 3. Interactive Trading Dashboard Frontend (React + Tailwind)
- Prediction panel  
- Setup comparison gallery  
- Save your analysis locally  
- Alerts feed (SSE)  
- Signal history database  
- About Me section (your trading journey)  

### 🧠 4. Backend (Flask API + TensorFlow)
- `/api/predict` — classify charts  
- `/api/similar` — simple pHash match  
- `/api/similar_smart` — embedding-based match  
- SQLite signal database  
- Automated index building scripts  

### 🗂️ 5. Automatic Indexing Tools
Includes Python scripts to:

- Train CNN  
- Build simple pHash index  
- Build embedding index  
- Import setups  
- Download TradingView screenshots  

### 🔥 6. Fully Responsive & User-Friendly UI
- Mobile/tablet/desktop adaptive  
- Floating help widget  
- Explanation bubbles for Smart/Simple/Hybrid modes  
- Dark mode “ambient” theme  
- Smooth animations and transitions  

---

## 👤 About the Creator — Timfx1 (Wasswa Timothy Kambazza)

I’ve been actively trading for **6+ years**, across multiple instruments including forex, crypto, indices, commodities, and stocks.  
Throughout the journey, I learned that *psychology, consistency and self-analysis* are the core of consistently profitable trading.

I built **Timfx1 – AI Trading Vision** to help traders:

- Understand their setups better  
- Compare their ideas with proven charts  
- Learn visually  
- Improve discipline  
- Build confidence in their edge  

This tool combines **AI**, **chart pattern recognition**, and **educational feedback** to accelerate trading mastery.

---

## 🧩 Tech Stack

### Frontend
- React  
- TailwindCSS & DaisyUI  
- Framer Motion  
- React Icons  
- LocalStorage saving  

### Backend
- Python  
- Flask  
- TensorFlow / Keras  
- NumPy  
- PIL  
- ImageHash  
- SQLite  

---

## 🔧 How to Install & Run

### 1. Clone the repo
```bash
git clone https://github.com/Timfx1/AI-trading-vision.git
cd AI-trading-vision

 Frontend Setup
 cd ../frontend
npm install
npm start

Backend Setup
Create virtual environment
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
Install Python dependencies
pip install -r requirements.txt
Train the model (optional — only if you don’t have model.keras)
py scripts/train_cnn_model.py
Build vision indexes
py scripts/build_image_index.py
py scripts/build_embedding_index.py
Start the API server
py app.py



