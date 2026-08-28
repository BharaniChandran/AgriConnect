"""
AgriConnect Price Prediction Model Training Pipeline (Step 3).
Pulls historical mandi price series from Supabase `market_prices`, constructs lagged features,
trains a scikit-learn regressor, evaluates accuracy on held-out test slice, and saves model artifact.
"""
import os
import datetime
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

from database import get_supabase_admin_client

MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), "price_model.joblib")

def fetch_historical_dataset() -> pd.DataFrame:
    """Fetch daily price series from Supabase market_prices table with pagination."""
    admin = get_supabase_admin_client()
    all_records = []
    page_size = 1000
    start = 0
    
    while True:
        try:
            res = admin.table("market_prices").select("*").order("date", desc=False).range(start, start + page_size - 1).execute()
            data = res.data or []
            if not data:
                break
            all_records.extend(data)
            if len(data) < page_size:
                break
            start += page_size
        except Exception as e:
            print(f"Error fetching from Supabase market_prices: {e}")
            break

    if not all_records:
        raise ValueError("Insufficient data: No historical market prices found in Supabase market_prices table.")

    df = pd.DataFrame(all_records)
    df["date"] = pd.to_datetime(df["date"])
    df["price"] = pd.to_numeric(df["price"], errors="coerce")
    df["arrival"] = pd.to_numeric(df["arrival"], errors="coerce").fillna(0.0)
    df = df.dropna(subset=["crop", "market", "date", "price"])
    df = df.sort_values(["crop", "market", "date"]).reset_index(drop=True)
    return df

def build_lagged_features(df: pd.DataFrame) -> pd.DataFrame:
    """Construct lagged price features (1-day, 3-day, 7-day lags), day of week, and target."""
    feature_rows = []
    
    # Group by (crop, market) time series
    for (crop, market), group in df.groupby(["crop", "market"]):
        group = group.sort_values("date").reset_index(drop=True)
        if len(group) < 8:
            continue
            
        prices = group["price"].values
        arrivals = group["arrival"].values
        dates = pd.to_datetime(group["date"]).dt.to_pydatetime()
        
        for i in range(7, len(group) - 1):
            target_next_day_price = prices[i + 1]
            lag_1 = prices[i]       # yesterday (relative to target)
            lag_3 = prices[i - 2]   # 3 days ago
            lag_7 = prices[i - 6]   # 7 days ago
            arrival_vol = arrivals[i]
            dow = dates[i + 1].weekday()
            
            feature_rows.append({
                "date": dates[i + 1],
                "crop": crop,
                "market": market,
                "lag_price_1": lag_1,
                "lag_price_3": lag_3,
                "lag_price_7": lag_7,
                "arrival_volume": arrival_vol,
                "day_of_week": dow,
                "target_price": target_next_day_price
            })
            
    return pd.DataFrame(feature_rows)

def train_and_evaluate(save_path: str = MODEL_SAVE_PATH) -> dict:
    """Main training routine."""
    print("="*70)
    print("STARTING AGRICONNECT PRICE PREDICTION MODEL TRAINING")
    print("="*70)
    
    raw_df = fetch_historical_dataset()
    print(f"1. Ingested {len(raw_df)} historical records across {raw_df['crop'].nunique()} crops and {raw_df['market'].nunique()} mandis.")
    
    feat_df = build_lagged_features(raw_df)
    if len(feat_df) < 50:
        raise ValueError(f"Insufficient training samples ({len(feat_df)} generated). Need at least 50 samples.")
        
    print(f"2. Constructed {len(feat_df)} supervised training samples with 1d, 3d, 7d lags.")

    # Time-based Train-Test Split (held-out slice of recent 15% days)
    feat_df = feat_df.sort_values("date").reset_index(drop=True)
    split_idx = int(len(feat_df) * 0.85)
    train_df = feat_df.iloc[:split_idx]
    test_df = feat_df.iloc[split_idx:]
    
    # Feature columns
    numeric_features = ["lag_price_1", "lag_price_3", "lag_price_7", "arrival_volume", "day_of_week"]
    
    # One-hot encode categorical features (crop, market)
    all_encoded = pd.get_dummies(feat_df[["crop", "market"]], drop_first=False)
    feature_columns = numeric_features + list(all_encoded.columns)
    
    X_train = pd.concat([train_df[numeric_features], all_encoded.iloc[:split_idx]], axis=1)
    y_train = train_df["target_price"].values
    
    X_test = pd.concat([test_df[numeric_features], all_encoded.iloc[split_idx:]], axis=1)
    y_test = test_df["target_price"].values

    # Train Random Forest Regressor
    model = RandomForestRegressor(
        n_estimators=120,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    # Honesty Check: Evaluate on held-out slice
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
    
    print("\n--- MODEL ACCURACY EVALUATION (Held-Out Test Set) ---")
    print(f"  * Mean Absolute Error (MAE):     INR {mae:.2f}/kg")
    print(f"  * Root Mean Squared Error (RMSE): INR {rmse:.2f}/kg")
    print(f"  * Mean Absolute % Error (MAPE):   {mape:.2f}%")
    print(f"  * R-squared (R2 Score):          {r2:.4f}")
    print("----------------------------------------------------\n")

    # Package artifact
    artifact = {
        "model": model,
        "feature_columns": feature_columns,
        "numeric_features": numeric_features,
        "categorical_columns": list(all_encoded.columns),
        "crops": list(raw_df["crop"].unique()),
        "markets": list(raw_df["market"].unique()),
        "metrics": {
            "mae": round(float(mae), 3),
            "rmse": round(float(rmse), 3),
            "mape_pct": round(float(mape), 2),
            "r2": round(float(r2), 4)
        },
        "trained_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "training_samples": len(train_df),
        "test_samples": len(test_df)
    }

    joblib.dump(artifact, save_path)
    print(f"Successfully saved trained price prediction model artifact to: {save_path}")
    return artifact

if __name__ == "__main__":
    train_and_evaluate()
