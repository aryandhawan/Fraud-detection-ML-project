import pandas as pd
import  numpy as np
import joblib
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler

df=pd.read_csv('./data/final_dataset.csv')
X = df.drop(['Class'], axis=1)
y = df['Class']
scaler = StandardScaler()

from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print("✓ Data successfully split and scaled.")

model=OneClassSVM(nu=0.01)
model.fit(X_train_scaled)

print("✓ Model successfully trained.")

from sklearn.metrics import classification_report

predictions = model.predict(X_test_scaled)
y_pred=np.array([1 if p == -1 else 0 for p in predictions])

report = classification_report(y_pred=y_pred, y_true=y_test)
print(report)

joblib.dump(model, 'production_model.pkl')
print("✓ Model saved as 'production_model.pkl'.")