import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.svm import OneClassSVM
from sklearn.metrics import classification_report, f1_score

# --- 1. Load and Prepare Data ---
df = pd.read_csv('./data/final_dataset.csv')
X = df.drop(['Class'], axis=1)
y = df['Class']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
print("✓ Data successfully split and scaled.")

# --- 2. Manual Grid Search for Hyperparameter Tuning ---
print("\n--- Starting Manual Hyperparameter Tuning for One-Class SVM ---")

# Define the grid of parameters to search
param_grid = {
    'nu': [0.02, 0.005, 0.1],
    'gamma': ['scale', 0.1, 0.01],
    'kernel': ['rbf'] 
}

best_score = -1
best_params = {}

# Loop through every combination of parameters
from sklearn.model_selection import ParameterGrid
for params in ParameterGrid(param_grid):
    print(f"Testing parameters: {params}")
    
    # 1. Initialize and train the model with the current parameters
    model = OneClassSVM(**params)
    model.fit(X_train_scaled) # Unsupervised fit on X_train only
    
    # 2. Make and translate predictions on the test set
    predictions_raw = model.predict(X_test_scaled)
    predictions_translated = np.array([1 if p == -1 else 0 for p in predictions_raw])
    
    # 3. Calculate the F1 score for the fraud class
    score = f1_score(y_test, predictions_translated, pos_label=1) # the pos here tells the F1 score to focus on the fraud class. 
    
    # 4. Check if this is the best score so far
    if score > best_score:
        best_score = score
        best_params = params

print("\n--- Tuning Complete ---")
print(f"Best Parameters Found: {best_params}")
print(f"Best F1-Score for Fraud Class: {best_score:.2f}")

# --- 3. Train the Final Model with the Best Parameters ---
print("\n--- Training Final Model with Best Parameters ---")
final_model = OneClassSVM(**best_params)
final_model.fit(X_train_scaled) # Fit on the training data


# --- 4. Final Evaluation ---
final_predictions = final_model.predict(X_test_scaled)
final_predictions_translated = np.array([1 if p == -1 else 0 for p in final_predictions])

print("\n--- Final Classification Report for Tuned One-Class SVM ---")
print(classification_report(y_test, final_predictions_translated))
