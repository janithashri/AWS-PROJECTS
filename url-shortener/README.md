---

## 🔗 URL Shortener

A minimal Node.js application that shortens long URLs and stores them in AWS DynamoDB. Users can access short links to get redirected to the original URLs.

---

### 📦 Features

* Accepts a long URL and generates a unique short ID
* Stores mappings in a DynamoDB table (`URL-shortener`)
* Redirects users based on short URL
* Simple frontend using HTML and JavaScript

---

### 🛠 Tech Stack

* Node.js + Express
* AWS SDK (DynamoDB)
* HTML + JS (Frontend)

---

### 🧱 DynamoDB Table Structure

| Key     | Type   | Description               |
| ------- | ------ | ------------------------- |
| shortid | String | Partition key (unique ID) |
| longURL | String | Original long URL         |

---

### 🚀 Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Run the server**

   ```bash
   node server.js
   ```

3. **Visit the app**
   Open `http://localhost:3000` in your browser

---

### 📁 Folder Structure

```
url-shortener/
├── server.js
├── createShortUrl.js
├── redirectShortUrl.js
└── public/
    └── index.html
```

---
