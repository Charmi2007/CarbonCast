import os
import uuid
import logging
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("carboncast")

MONGODB_URI = os.getenv("MONGODB_URI", "")
if not MONGODB_URI or "YOUR_MONGODB_URI" in MONGODB_URI:
    MONGODB_URI = "mongodb://localhost:27017/carboncast"

logger.info(f"Connecting to MongoDB with URI: {MONGODB_URI}")

# Initialize Client
client = None
db = None
use_fallback = False

try:
    # Set a short timeout (2 seconds) so we fail fast if MongoDB is not running locally
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=2000)
    # Check connection
    client.server_info()
    try:
        db = client.get_database()
    except Exception:
        db = client['carboncast']
    # If the URI doesn't specify a database name, default to 'carboncast'
    if db.name == 'admin' or not db.name:
        db = client['carboncast']
    logger.info(f"Successfully connected to MongoDB database: {db.name}")
except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
    logger.warning(f"Could not connect to MongoDB ({e}). Falling back to in-memory mock database.")
    use_fallback = True

# In-Memory Mock Database implementation for fallback
class MockCursor:
    def __init__(self, results):
        self.results = results

    def sort(self, key, direction=-1):
        reverse = direction == -1
        def get_sort_val(x):
            # Resolve nested dictionary sort if needed (e.g., results.carbonScore)
            parts = key.split('.')
            val = x
            for p in parts:
                if isinstance(val, dict):
                    val = val.get(p)
                else:
                    val = None
                    break
            if val is None:
                # Use a default low value for sorting comparison
                return datetime.min if "date" in key.lower() or "time" in key.lower() else -999999
            return val
        try:
            self.results.sort(key=get_sort_val, reverse=reverse)
        except Exception:
            self.results.sort(key=lambda x: str(x.get(key, '')), reverse=reverse)
        return self

    def limit(self, count):
        self.results = self.results[:count]
        return self

    def __iter__(self):
        return iter(self.results)

class MockCollection:
    def __init__(self, name):
        self.name = name
        self.data = {}

    def insert_one(self, document):
        if "_id" not in document:
            document["_id"] = str(uuid.uuid4())
        doc_copy = dict(document)
        self.data[str(doc_copy["_id"])] = doc_copy
        
        class InsertResult:
            inserted_id = doc_copy["_id"]
        return InsertResult()

    def find_one(self, query):
        if not query:
            return next(iter(self.data.values())) if self.data else None
        
        # Simple query matcher
        for doc in self.data.values():
            match = True
            for k, v in query.items():
                if k == "_id":
                    if str(doc.get("_id")) != str(v):
                        match = False
                        break
                elif doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc
        return None

    def find(self, query=None):
        query = query or {}
        results = []
        for doc in self.data.values():
            match = True
            for k, v in query.items():
                if k == "_id":
                    if str(doc.get("_id")) != str(v):
                        match = False
                        break
                elif doc.get(k) != v:
                    match = False
                    break
            if match:
                results.append(doc)
        return MockCursor(results)

    def delete_many(self, query=None):
        query = query or {}
        keys_to_delete = []
        for k_id, doc in self.data.items():
            match = True
            for k, v in query.items():
                if k == "_id":
                    if str(doc.get("_id")) != str(v):
                        match = False
                        break
                elif doc.get(k) != v:
                    match = False
                    break
            if match:
                keys_to_delete.append(k_id)
        for k_id in keys_to_delete:
            del self.data[k_id]
        
        class DeleteResult:
            deleted_count = len(keys_to_delete)
        return DeleteResult()

    def update_many(self, filter_query, update_operation):
        set_fields = update_operation.get("$set", {})
        modified_count = 0
        
        filter_ids = []
        if "_id" in filter_query and isinstance(filter_query["_id"], dict) and "$in" in filter_query["_id"]:
            filter_ids = [str(x) for x in filter_query["_id"]["$in"]]
            
        for doc in self.data.values():
            match = True
            if filter_ids:
                if str(doc.get("_id")) not in filter_ids:
                    match = False
            for k, v in filter_query.items():
                if k == "_id":
                    continue
                if isinstance(v, dict) and "$in" in v:
                    if doc.get(k) not in v["$in"]:
                        match = False
                elif doc.get(k) != v:
                    match = False
            if match:
                for set_key, set_val in set_fields.items():
                    doc[set_key] = set_val
                modified_count += 1
                
        class UpdateResult:
            modified_count = len(filter_ids) if filter_ids else modified_count
        return UpdateResult()


class MockDatabase:
    def __init__(self):
        self.collections = {}

    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection(name)
        return self.collections[name]

    def __getattr__(self, name):
        return self[name]

    def get_collection(self, name):
        return self[name]

class MockDatabaseSingleton:
    _instance = None
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = MockDatabase()
            # Seed mock database with a couple of leaderboard entries
            records = cls._instance['records']
            records.insert_one({
                "personal": {"name": "EcoWarrior", "age": 28},
                "results": {"totalCarbonFootprint": 1.1, "carbonScore": 95, "category": "Low"}
            })
            records.insert_one({
                "personal": {"name": "GreenLife", "age": 34},
                "results": {"totalCarbonFootprint": 1.8, "carbonScore": 90, "category": "Low"}
            })
            records.insert_one({
                "personal": {"name": "Jane Doe", "age": 25},
                "results": {"totalCarbonFootprint": 2.5, "carbonScore": 85, "category": "Low"}
            })
            records.insert_one({
                "personal": {"name": "John S", "age": 42},
                "results": {"totalCarbonFootprint": 6.0, "carbonScore": 70, "category": "Moderate"}
            })
        return cls._instance

def get_db():
    if use_fallback:
        return MockDatabaseSingleton.get_instance()
    return db
