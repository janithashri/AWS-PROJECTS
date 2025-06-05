# 🧠 Employee Face Detection Authentication System

A serverless face-based employee authentication system using AWS Rekognition, S3, DynamoDB, and Lambda.

---

## 🎯 What It Does

- Detects and matches employee faces from images
- Retrieves employee info and login time from DynamoDB
- Logs login time and authenticates employees

---

## ✅ Features

- Passwordless face login
- Real-time authentication
- Login time tracking

---

## 🚀 Deployment Instructions

1. **Create Rekognition Collection**  
   `aws rekognition create-collection --collection-id employee-faces`

2. **Upload Reference Images to S3**  
   Create bucket, upload employee face images (e.g., `emp123.jpg`).

3. **Index Faces in Rekognition**  
   `aws rekognition index-faces --collection-id employee-faces --image "S3Object={Bucket=your-bucket,Name=emp123.jpg}" --external-image-id "emp123"`

4. **Set Up DynamoDB Table**  
   Table: `EmployeeData`  
   Partition key: `EmployeeID`  
   Store employee metadata and login timestamps.

5. **Deploy Lambda Function**  
   Handles image input, calls Rekognition to match faces, fetches/updates DynamoDB.

6. **Configure API Gateway**  
   Expose Lambda as REST API for frontend calls.

7. **Frontend Setup**  
   Simple page to upload/capture images, call API, and display authentication results.

---

## 💬 Connect With Me

- **GitHub:** [@yourgithub](https://github.com/yourgithub)  
- **LinkedIn:** [linkedin.com/in/yourlinkedin](https://linkedin.com/in/yourlinkedin)  
- **Email:** your.email@example.com
