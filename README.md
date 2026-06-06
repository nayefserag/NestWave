# 🌊 NestWave

![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-green)

A scalable **NestJS** backend for an interest-based social app — secure authentication, real-time notifications, media uploads, and internationalization.

🔗 **Live API:** https://circle-s.onrender.com/apis

## ✨ Features

- 🔐 JWT authentication & authorization
- 🔔 Real-time push notifications (Firebase Cloud Messaging)
- 📤 Media uploads (Multer)
- ✉️ Transactional email (Nodemailer)
- 🌍 Internationalization (i18n)
- ✅ Request validation (Joi)
- 📜 Swagger API documentation

## 🧰 Tech Stack

| Area | Tech |
|------|------|
| Framework | NestJS |
| Language | TypeScript |
| Database | MongoDB (Mongoose) |
| Auth | JWT |
| Notifications | Firebase Cloud Messaging |
| Email | Nodemailer |
| Validation | Joi |
| Docs | Swagger |
| Testing | Jest |
| Deploy | Docker |

## 🚀 Getting Started

```bash
npm install
cp .env.example .env     # set Mongo URI, JWT secret, Firebase & mail credentials
npm run start:dev
```

Swagger UI: `/api` · Live demo: https://circle-s.onrender.com/apis

## 🧪 Testing

```bash
npm test
npm run test:e2e
```

## 📄 License

MIT
