import os
import json
import datetime
import pandas as pd
import numpy as np
import joblib
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Compute directory paths relative to this file
ML_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(ML_DIR)
ROOT_DIR = os.path.dirname(BACKEND_DIR)

DATASET_PATH = os.path.join(ROOT_DIR, "dataset", "carboncast.csv")
MODELS_DIR = os.path.join(BACKEND_DIR, "models")
STATIC_DIR = os.path.join(BACKEND_DIR, "static")

def train_model():
    # Ensure folders exist
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(STATIC_DIR, exist_ok=True)

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
    
    # Split: 80% train, 20% test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Preprocessing pipelines
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median'))
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='None')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numerical_cols),
            ('cat', categorical_transformer, categorical_cols)
        ]
    )
    
    # Define models
    models = {
        "Linear Regression": LinearRegression(),
        "Decision Tree": DecisionTreeRegressor(random_state=42),
        "Random Forest": RandomForestRegressor(n_estimators=200, max_depth=12, random_state=42)
    }
    
    results = {}
    pipelines = {}
    
    # Train and evaluate each model
    for name, model in models.items():
        # Create pipeline
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', model)
        ])
        
        # Fit
        pipeline.fit(X_train, y_train)
        pipelines[name] = pipeline
        
        # Predict
        y_pred = pipeline.predict(X_test)
        
        # Metrics
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        results[name] = {
            "mae": mae,
            "rmse": rmse,
            "r2": r2
        }
        
    # Print comparison table
    print("\n---------------------------------------")
    print(f"{'Model':<22} R²")
    print("---------------------------------------")
    for name in models:
        print(f"{name:<22} {results[name]['r2']:.2f}")
    print("---------------------------------------")
    
    # Select best model using highest R2
    best_name = max(results, key=lambda k: results[k]["r2"])
    best_pipeline = pipelines[best_name]
    best_metrics = results[best_name]
    
    print(f"\nBest Model Selected: {best_name} (R² = {best_metrics['r2']:.4f})")
    
    # Save the best model pipeline
    model_save_path = os.path.join(MODELS_DIR, "model.pkl")
    joblib.dump(best_pipeline, model_save_path)
    print(f"Saved best model to: {model_save_path}")
    
    # Save training report JSON
    report_path = os.path.join(MODELS_DIR, "training_report.json")
    report_data = {
        "Dataset rows": int(df.shape[0]),
        "Feature names": list(X.columns),
        "Selected algorithm": best_name,
        "MAE": float(round(best_metrics["mae"], 4)),
        "RMSE": float(round(best_metrics["rmse"], 4)),
        "R² Score": float(round(best_metrics["r2"], 4)),
        "Training timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
    with open(report_path, "w") as f:
        json.dump(report_data, f, indent=4)
    print(f"Saved training report to: {report_path}")
    
    # Generate feature importance CSV if selected model supports it
    regressor = best_pipeline.named_steps['regressor']
    if hasattr(regressor, "feature_importances_"):
        importance_path = os.path.join(MODELS_DIR, "feature_importance.csv")
        
        # Get feature names out of the ColumnTransformer
        feat_names_out = best_pipeline.named_steps['preprocessor'].get_feature_names_out()
        
        # Clean names
        clean_names = []
        for fn in feat_names_out:
            if fn.startswith("num__"):
                clean_names.append(fn[5:])
            elif fn.startswith("cat__"):
                clean_names.append(fn[5:])
            else:
                clean_names.append(fn)
                
        importances = regressor.feature_importances_
        
        importance_df = pd.DataFrame({
            "Feature": clean_names,
            "Importance": importances
        }).sort_values(by="Importance", ascending=False)
        
        importance_df.to_csv(importance_path, index=False)
        print(f"Saved feature importance to: {importance_path}")
        
    # Generate regression graph (Actual vs Predicted)
    y_test_pred = best_pipeline.predict(X_test)
    plt.figure(figsize=(8, 6))
    
    # Use standard modern plotting styles
    plt.scatter(y_test, y_test_pred, color='#2E7D32', alpha=0.6, edgecolors='none', s=45, label='Predicted vs Actual')
    
    # Ideal line
    min_val = min(y_test.min(), y_test_pred.min())
    max_val = max(y_test.max(), y_test_pred.max())
    plt.plot([min_val, max_val], [min_val, max_val], color='#F59E0B', linestyle='--', linewidth=2.0, label='Perfect Fit')
    
    plt.title(f'Actual vs Predicted Carbon Footprint ({best_name})', fontsize=14, pad=15, color='#1F2937', fontweight='bold')
    plt.xlabel('Actual Total_CO2e (kg)', fontsize=12, labelpad=10, color='#374151')
    plt.ylabel('Predicted Total_CO2e (kg)', fontsize=12, labelpad=10, color='#374151')
    plt.legend(loc='upper left', frameon=True, facecolor='white', edgecolor='none')
    plt.tight_layout()
    
    plot_path = os.path.join(STATIC_DIR, "regression_plot.png")
    plt.savefig(plot_path, dpi=300)
    plt.close()
    print(f"Saved regression plot to: {plot_path}")
    return best_pipeline

if __name__ == "__main__":
    train_model()
