import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Compute directory paths relative to this file
ML_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(ML_DIR)
ROOT_DIR = os.path.dirname(BACKEND_DIR)

DATASET_PATH = os.path.join(ROOT_DIR, "dataset", "carboncast.csv")
MODEL_PATH = os.path.join(BACKEND_DIR, "models", "model.pkl")

def evaluate_model():
    if not os.path.exists(MODEL_PATH):
        print(f"Error: Model file does not exist at {MODEL_PATH}. Please train the model first.")
        return
        
    print(f"Loading saved model from: {MODEL_PATH}")
    model = joblib.load(MODEL_PATH)
    
    print(f"Loading dataset from: {DATASET_PATH}")
    df = pd.read_csv(DATASET_PATH)
    
    # Features and target
    target_col = "Total_CO2e"
    categorical_cols = ["Transport_Mode", "Fuel_Type", "Diet_Type"]
    numerical_cols = [
        "Distance_km", "Flight_Trips", "Electricity_kWh", 
        "Organic_Waste_kg", "Plastic_Waste_kg", "Water_Liters", "Trees_Planted"
    ]
    
    X = df[categorical_cols + numerical_cols]
    y = df[target_col]
    
    # Split using same random state
    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Run predictions
    print("Running predictions on test set...")
    y_pred = model.predict(X_test)
    
    # Metrics
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print("\n================ Evaluation Results ================")
    print(f"Mean Absolute Error (MAE):   {mae:.4f} kg CO2e")
    print(f"Root Mean Squared Error (RMSE): {rmse:.4f} kg CO2e")
    print(f"R² Score:                    {r2:.4f}")
    print("====================================================")

if __name__ == "__main__":
    evaluate_model()
