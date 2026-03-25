<div align="center">
  <h1>📚 VEDA</h1>
  <p><strong>A Next-Generation EdTech Platform with Live Streaming, Slide Syncing, and PWA Support</strong></p>

  <!-- Live Demo Placeholder -->
  <a href="https://veda-gamma.vercel.app/login"><strong>🚀 View Live Demo</strong></a> 
  <br />
  <br />

  <!-- Screenshots Placeholder -->
  <img src="https://via.placeholder.com/800x400.png?text=VEDA+Platform+Screenshot" alt="VEDA Screenshot" />
</div>

<br />

## 📖 About The Project

**VEDA** is a comprehensive educational technology platform thoughtfully designed to bridge the gap between teachers and students. Built on modern web technologies, it features immersive live broadcasting, low-bandwidth audio-slide syncing, and full offline/PWA capabilities. 

Whether it's managing interactive live classes, sharing lecture materials, or accessing recorded sessions seamlessly across diverse network conditions, VEDA provides a robust and scalable solution for online learning.

## ✨ Key Features

- **👨‍🏫 Multi-Role Dashboards**: Dedicated interfaces for Admins, Teachers, and Students.
- **🎥 Live Video Broadcasting**: High-quality, real-time virtual classrooms powered by LiveKit & Stream.
- **📻 Low-Bandwidth Audio & Slide Sync**: Specially crafted low-data mode syncing teacher's audio with lesson slides.
- **📱 Progressive Web App (PWA)**: Installable on multiple platforms with offline support and local caching via IndexedDB.
- **🌐 Multi-Language Support (i18n)**: Fully internationalized platform allowing users to select their preferred language.
- **☁️ Extensive Media Processing**: Advanced handling of PDF to image conversion, video/audio compression (FFmpeg), and cloud storage (Cloudinary).
- **🔒 Secure Authentication**: Email verification, JWT-based secure sessions, and encrypted passwords.
- **🔔 Real-time Notifications**: Integrated Firebase and Web-Push for instant updates.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS 
- **State Management:** Zustand
- **Routing:** React Router DOM v7
- **Real-Time Communication:** @livekit/components-react, @stream-io/video-react-sdk
- **PWA & Storage:** Vite PWA Plugin, idb (IndexedDB)
- **Internationalization:** i18next, react-i18next

### Backend
- **Core:** Node.js, Express.js
- **Database:** MongoDB & Mongoose
- **Authentication:** JWT, bcryptjs, Firebase Admin
- **Media & Storage:** Cloudinary, Multer, fluent-ffmpeg, canvas
- **PDF Processing:** pdf-poppler, pdf2pic, sharp
- **Mail Services:** SendGrid, Mailtrap

## 📂 Project Structure

```text
VEDA/
├── backend/                  # Express.js Server
│   ├── src/
│   │   ├── controllers/      # Route controllers (Admin, Teacher, Student)
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API endpoints
│   │   ├── middleware/       # Auth & File processing middleware
│   │   └── lib/              # Helper utilities
│   └── package.json
│
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── api/              # Axios service calls
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page layouts (Dashboard, Broadcasts, Live Classes)
│   │   ├── store/            # Zustand state stores
│   │   └── i18n.js           # Multi-language configuration
│   ├── public/               # Static assets & PWA manifest
│   └── package.json
└── README.md
```

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB running locally or a MongoDB Atlas URI
- API Keys for Cloudinary, LiveKit, Firebase, and SendGrid (for full functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/VEDA.git
   cd VEDA
   ```

2. **Set up the Backend**
   ```bash
   cd backend
   npm install
   ```
   *Create a `.env` file in the `backend` directory based on the environmental variables required (e.g., `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_URL`, etc.).*

3. **Set up the Frontend**
   ```bash
   cd ../frontend
   npm install
   ```
   *Create a `.env` file in the `frontend` directory containing Vite prefix variables (e.g., `VITE_API_URL`, etc.).*

### Running Locally

Open two separate terminals to run the frontend and backend servers simultaneously.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Your frontend should now be running on `http://localhost:5173` and the backend on the specified Express port (usually `http://localhost:5000` or `http://localhost:8000`).

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information.

---
<p align="center">Made with ❤️ for modern interactive education.</p>
