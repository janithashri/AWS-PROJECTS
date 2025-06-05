# 🚀 EC2 Monitoring System – Serverless Project

A serverless EC2 monitoring system using AWS Lambda, CloudWatch, DynamoDB, API Gateway, and SNS. It automates instance monitoring, stores historical metrics, and displays them on a web dashboard.

---

## 🧠 What It Does

- 🖱️ **Add Instance Button**: Takes EC2 instance ID and sets up:
  - IAM role attachment
  - CloudWatch custom metrics
  - Alarms + SNS email alerts

- 📊 **Show Dashboard Button**:
  - Fetches latest metrics from CloudWatch
  - Stores them in DynamoDB (if new)
  - Returns data to frontend for display

---

## ⚙️ Technologies Used

- **AWS Lambda**
- **Amazon EC2**
- **Amazon CloudWatch**
- **Amazon DynamoDB**
- **Amazon SNS**
- **Amazon API Gateway**
- **Frontend (HTML + JS) hosted on EC2**

---

## 🧱 Architecture

[Frontend (2 Buttons)]

├── /create-monitoring → Lambda (IAM + Metrics + Alarm + SNS) 
├── /fetch-and-display → Lambda (CloudWatch + DynamoDB + JSON)

---

## ✅ Features

- One-click instance monitoring setup
- Automated metric collection and alerting
- Email notifications on threshold breaches
- Real-time and historical data dashboard
