# 🌾 Agri Advisor

Agri Advisor is an AI-powered **multilingual agricultural advisory platform** designed to help farmers get personalized advice on crop management, pest control, soil health, irrigation, and weather forecasts. The platform supports **English, Hindi, and Kannada** and includes voice-based assistance.

---

## 🚀 Features

- **Multilingual Support** – English, Hindi, and Kannada.
- **AI-Powered Crop Advisory** – Get tailored advice for farming needs.
- **Voice Assistance** – Integrates speech-to-text and text-to-speech.
- **Personalized Recommendations** – Based on farm profile and location.
- **Weather Insights** – Get real-time weather updates for your area.
- **History Tracking** – Stores previous advice queries.

---

## 🛠️ Tech Stack

### **Frontend**

- React.js
- Tailwind CSS
- Axios
- React Router

### **Backend**

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- RESTful API

### **AI & Voice Integration**

- Sarvam API (Text-to-Speech & Language Translation)

---

## 📂 Project Structure

```
agri-advisor/
├── frontend/                  # React frontend
│   ├── public/                # Static files
│   ├── src/                   # Frontend source code
│   │   ├── assets/            # Images, icons, etc.
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API integration
│   │   ├── App.js             # Main app entry
│   │   ├── index.js           # React DOM entry point
│   └── package.json           # Frontend dependencies
│
├── backend/                   # Node.js backend
│   ├── models/                # Mongoose models
│   │   ├── AdviceHistory.js
│   │   ├── FarmProfile.js
│   │   └── User.js
│   ├── routes/                # API routes
│   ├── controllers/           # Business logic
│   ├── server.js              # Main server file
│   ├── .env                   # Environment variables
│   ├── package.json           # Backend dependencies
│
└── README.md                  # Project documentation
```

---

## ⚙️ Installation & Setup

### **1. Clone the repository**

```bash
git clone https://github.com/your-username/agri-advisor.git
cd agri-advisor
```

### **2. Setup Backend**

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
SARVAM_API_KEY=your_api_key
```

Start the backend server:

```bash
npm start
```

### **3. Setup Frontend**

```bash
cd ../frontend
npm install
npm run dev
```

---

## 🔗 API Endpoints

### **User Management**

| Method | Endpoint   | Description   |
| ------ | ---------- | ------------- |
| POST   | /api/users | Register user |
| POST   | /api/login | Login user    |

### **Advisory & Farm Data**

| Method | Endpoint            | Description             |
| ------ | ------------------- | ----------------------- |
| GET    | /api/advice         | Get AI-generated advice |
| POST   | /api/advice/history | Save user query history |
| GET    | /api/weather        | Fetch weather insights  |

---

## 🧠 Future Enhancements

- 📌 AI-powered crop disease detection.
- 📌 WhatsApp integration for farmer notifications.
- 📌 Offline mode with PWA support.
- 📌 Advanced voice-based commands.
- 📌 Support for additional regional and international languages to enhance accessibility for more farmers.

---

## 📞 Contact

For queries or contributions:
📧 Email: [rahuldgowda2004@example.com]
