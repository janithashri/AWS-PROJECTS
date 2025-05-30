# AWS-PROJECTS
# 🚀 URL Shortener using AWS Lambda

A **serverless URL shortening service** built with **AWS Lambda** and **API Gateway**!  
Create short URLs that redirect to your original long URLs — scalable, fast, and easy to deploy.

---

## ✨ Features

- 🔥 Fully serverless backend with AWS Lambda  
- 🌐 HTTP endpoints managed through AWS API Gateway  
- 🔗 Generate and resolve short URLs seamlessly  
- ⚙️ No servers to manage or maintain  
- 🧪 Easy to test and extend  

---

## ⚙️ How It Works

1. 👉 **Send a POST request** with your long URL to the Lambda function via API Gateway.  
2. 🛠️ Lambda **generates a unique short URL** and stores the mapping.  
3. 🔄 When someone visits the short URL, API Gateway routes the request back to Lambda, which **redirects to the original URL**.

---

## 🚀 Deployment

You can deploy this project using:

- AWS Console (manual setup)  
- AWS CLI commands  
- Infrastructure as Code tools like CloudFormation or Terraform  

---

## 🖼️ Screenshots

Here’s proof it works! 👇

- **UI:**  
  ![Basic UI](/Users/janiice/Desktop/Screenshot\ 2025-05-30\ at\ 12.05.12 PM.png)  

- **API Gateway Response:**  
  ![API Gateway Test Success](docs/images/api-gateway-test.png)  

*(Make sure to update the image paths to match your repo structure.)*

---

## 📋 How to Use

1. Clone this repo:  
   ```bash
   https://github.com/janithashri/AWS-PROJECTS.git
