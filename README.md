# Full-Stack Fraud Detection System with Unsupervised Machine Learning


This project is a complete, end-to-end web application that uses an unsupervised machine learning model to detect potentially fraudulent credit card transactions. The system is architected as a full-stack application with a Python Flask backend, a PostgreSQL database, and is fully containerised with Docker for production-ready deployment.

## Key Features


Unsupervised Anomaly Detection: Utilises a One-Class SVM model to learn the patterns of "normal" transaction behaviour and identify outliers as potential fraud.

Full-Stack Application: A complete web service with a secure Flask backend API for user authentication and predictions.

Persistent User History: All user registrations and prediction histories are stored in a robust PostgreSQL database.

Containerised & Production-Ready: The entire multi-service application (web app + database) is managed by Docker Compose, ensuring a reproducible and scalable deployment environment.

## The ML Workflow: 

From Raw Data to a Deployed Model


This project followed a rigorous, professional machine learning workflow.

## 1. Data Engineering & Problem Formulation

The initial 2023 Kaggle dataset was synthetically balanced (50/50 classes). Since the goal was anomaly detection (finding rare events), this was unrealistic. I made a key strategic decision to engineer a realistic, imbalanced dataset by under-sampling the legitimate transactions to create a final dataset with a ~1% fraud rate. This transformed an academic dataset into a valid, real-world problem.

## 2. Model Benchmarking & Selection

I systematically benchmarked three different unsupervised anomaly detection algorithms:

Isolation Forest

Local Outlier Factor (LOF)

One-Class SVM

By analysing the classification reports, I determined that the One-Class SVM provided the best balance of precision and recall for the fraud class, making it the champion model for this problem.

## 3. Backend Development

The trained One-Class SVM model was saved and integrated into a secure Flask API. The backend handles:

User registration and login with hashed passwords.

Secure, session-based access to the prediction endpoint.

Saving all prediction results to a PostgreSQL database, linked to the user.

## 4. Containerization (MLOps)


The final application is defined in a docker-compose.yml file, which orchestrates the Flask web server and the PostgreSQL database as two separate, connected services. This represents a modern, professional deployment strategy.

Conclusion
This project was a deep dive into the full lifecycle of a production-level machine learning application. It demonstrates the ability to handle everything from data engineering and unsupervised modelling to full-stack backend development and containerization. The final model successfully identifies a significant portion of fraudulent transactions, showcasing a practical and valuable solution to a real-world business problem.
