---

## 🎓 Face Recognition Attendance System

A React + AWS-based system for classroom attendance using face authentication.

---

### 🚀 Features

* 🔐 Face login via AWS Rekognition
* 🧑‍🎓 Student: View monthly attendance
* 👩‍🏫 Teacher: Mark and view daily attendance
* ☁️ Backend: Node.js, Express, DynamoDB
* 💅 Frontend: React + Material UI

---

### 🗂️ Folder Structure

```
face-attendance/
├── backend/
│   ├── auth.js
│   ├── db.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/ (Login, Student, Teacher)
│   │   ├── routes.js
│   │   ├── App.js
│   │   └── index.js
```

---

### 🛠️ Setup

1. **Clone & Install**

   ```bash
   git clone <repo-url>
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Run**

   ```bash
   cd backend && node server.js
   cd ../frontend && npm start
   ```
---

### ✅ Flow

* Student logs in → Face matched → Attendance marked
* Teacher logs in → View today’s attendance
* Student → View monthly record

---


