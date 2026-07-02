import os
import sys
from datetime import datetime, timedelta
from pymongo import MongoClient
from dotenv import load_dotenv

# Load env variables
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "")
if not MONGODB_URI or "YOUR_MONGODB_URI" in MONGODB_URI:
    MONGODB_URI = "mongodb://localhost:27017/carboncast"

print(f"Connecting to MongoDB at: {MONGODB_URI}")

try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    # Check connection
    client.server_info()
    db = client['carboncast']
    print(f"Successfully connected to database: {db.name}")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    sys.exit(1)

# Clear existing mock posts to prevent duplicates, if desired
# db.posts.delete_many({"userName": {"$in": ["John Abraham", "Dia Mirza", "Sarah Green", "Michael Chen"]}})

posts_to_seed = [
    {
        "userId": "user_ja",
        "userName": "John Abraham",
        "text": "Swapped my daily gym transit to cycling! Saved 3.2 kg CO₂e. 💪🚲 #sustainablefitness",
        "category": "transport",
        "carbonSaved": 3.2,
        "createdAt": datetime.utcnow() - timedelta(hours=1)
    },
    {
        "userId": "user_dm",
        "userName": "Dia Mirza",
        "text": "Hosted a zero-waste community composting workshop today. Everyone starts small! 🍂🌱 #compostwins",
        "category": "lifestyle",
        "carbonSaved": 8.5,
        "createdAt": datetime.utcnow() - timedelta(hours=3)
    },
    {
        "userId": "user_ja",
        "userName": "John Abraham",
        "text": "Set up a new 5kW solar paneled roof. 100% off the local grid now! ☀️🏡 #cleanenergy",
        "category": "energy",
        "carbonSaved": 45.0,
        "createdAt": datetime.utcnow() - timedelta(days=1)
    },
    {
        "userId": "user_dm",
        "userName": "Dia Mirza",
        "text": "Swapped to 100% plant-based meals this whole week. Reduced my food miles footprint significantly! 🥦🥗 #plantbased",
        "category": "food",
        "carbonSaved": 12.0,
        "createdAt": datetime.utcnow() - timedelta(days=2)
    },
    {
        "userId": "user_sg",
        "userName": "Sarah Green",
        "text": "Installed low-flow aerators on all household taps and reduced my shower duration to 4 minutes. Conserving water saves heating energy too! 💧🚿 #waterconservation",
        "category": "lifestyle",
        "carbonSaved": 4.2,
        "createdAt": datetime.utcnow() - timedelta(days=2, hours=4)
    },
    {
        "userId": "user_mc",
        "userName": "Michael Chen",
        "text": "Decided to completely avoid fast-fashion items this quarter. Mending my old boots instead. Buy less, wear longer! 🥾♻️ #circularfashion",
        "category": "lifestyle",
        "carbonSaved": 15.0,
        "createdAt": datetime.utcnow() - timedelta(days=3)
    }
]

print(f"Seeding {len(posts_to_seed)} posts...")
inserted = 0
for post in posts_to_seed:
    # Check if this exact text exists to avoid double-seeding
    existing = db.posts.find_one({"text": post["text"]})
    if not existing:
        db.posts.insert_one(post)
        inserted += 1

print(f"Done! Seeded {inserted} new posts into the database.")
