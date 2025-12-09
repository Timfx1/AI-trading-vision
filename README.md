TIMFX1 — AI Trading Vision 2.0
Deep-Learning Chart Recognition • Smart Pattern Insight (LLM) • Google Login • Dataset Tools
Timfx1 is a full-stack AI system that analyzes trading charts, identifies price-action patterns,
extracts trading levels, and compares them against a curated library of proven setups.
------------------------------
NEW FEATURES
------------------------------
• DeepSeek LLM Integration (replaces old GPT labeling)
• Google Login + User Workspace
• Rule Advisor & Risk Advisor Panels
• Smart SL/TP Level Extraction
• Cleaner UI + Theme/Accent Engine
• Dataset Upload + Cleaner (User Restricted)
• Public Demo Mode (AI works without login)
------------------------------
AUTHENTICATION
------------------------------
Guests:
✓ Can upload charts
✓ Can run AI analysis
✗ Cannot save analysis
✗ Cannot upload dataset items
✗ Cannot clean dataset
Logged-in Users:
✓ Full access
✓ Can contribute new setups
✓ Can fix or remove dataset entries
✓ Have personal local history
Google Login requires acceptance of third■party cookies.
A browser warning (FedCM) may appear if cookies are blocked.
------------------------------
DATASET CONTRIBUTION
------------------------------
When logged in, users can:
1. Upload new chart setups
2. Label them Valid or Invalid
3. Clean up bad/incomplete setups
These setups automatically appear as comparison results for all users.
------------------------------
INSTALLATION
------------------------------
FRONTEND:
cd frontend
npm install
npm start
BACKEND:
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
py app.py
------------------------------
TRAINING & INDEXING
------------------------------
Train CNN:
py scripts/train_cnn_model.py
Rebuild pHash index:
py scripts/build_image_index.py
Rebuild Embedding index:
py scripts/build_embedding_index.py
------------------------------
LICENSE / CREDIT
------------------------------
Creator: Wasswa Timothy Kambazza (Timfx1)
YouTube: @fxmasterytim5024
------------------------------
TIMELINE
------------------------------
Right Now (Today–Next 2 Weeks)

✔ Stress-test CNN & similarity search
✔ Use the app daily to check UX issues
✔ Add BuyMeACoffee support button
✔ Fix layout polish

1 Month Later

✨ Add trader profiles
✨ Add optional public feed, simple leaderboard

After 2–3 Months

🔥 Implement backtester
🔥 Implement Grad-CAM
🔥 Multi-strategy engine
🔥 Cloud database for storing setups