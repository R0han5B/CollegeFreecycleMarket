# 🚀 College Freecycling Market

A modern full-stack marketplace web application where college students can **buy, sell, or exchange items** within their campus community.

---

## ✨ Features

* 🔐 **Authentication System**

  * Email-based signup/login
  * OTP verification for secure registration

* 🛍️ **Marketplace**

  * Post, browse, and manage items
  * Categories, search, and filters
  * Pricing in ₹ INR

* 💬 **Real-Time Chat**

  * Contact seller instantly
  * Live messaging using WebSockets (Socket.io)
  * Image sharing in chat

* 🔔 **Notifications**

  * Unread message count
  * Conversations page

* 👤 **User Profiles**

  * Manage personal listings
  * Edit profile details

* 📱 **Responsive UI**

  * Clean and modern design
  * Works across devices

---

## 🧱 Tech Stack

### Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui

### Backend

* Next.js API Routes
* Prisma ORM
* MongoDB 

### Real-time

* Socket.io (WebSocket server)

### State & Data

* Zustand
* TanStack Query

### Forms & Validation

* React Hook Form
* Zod

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
bun install
# or
npm install
```

### 2. Setup environment variables

Create a `.env` file:

```env
DATABASE_URL="file:./dev.db"

EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
```

---

### 3. Setup database

```bash
npx prisma generate
npx prisma db push
```

(Optional: seed data)

```bash
npx prisma db seed
```

---

### 4. Run the app

```bash
bun run dev
# or
npm run dev
```

App runs at:
👉 http://localhost:3000

---

## 🔐 Demo Accounts

* [rahul@rknec.edu](mailto:rahul@rknec.edu) / demo123
* [priya@rknec.edu](mailto:priya@rknec.edu) / demo123

---

## 📁 Project Structure

```
src/
├── app/              # Pages & API routes
├── components/       # UI components
├── hooks/            # Custom hooks
├── lib/              # Utilities
├── prisma/           # Database schema
```

---

## ⚙️ Key Functionalities

* ✅ Item CRUD (Create, Read, Update, Delete)
* ✅ OTP-based signup
* ✅ Real-time messaging system
* ✅ Image upload support
* ✅ Search & category filtering
* ✅ INR-based pricing system

---

## 🔌 Chat Service

Make sure the WebSocket service is running:

```
Port: 3003
```

Handles:

* Real-time messages
* Typing indicators
* Read receipts

---

## 📌 Notes

* OTP works via email (configure Gmail App Password)
* In development, ensure email credentials are set properly
* Database defaults to SQLite (can switch to MongoDB/PostgreSQL)

---

## 🧪 Sample Items

* Engineering Books
* Bluetooth Headphones
* Study Table
* Cricket Kit
* Camera

---

## 🤝 Contributing

Feel free to fork and improve the project.

---

## 📄 License

This project is for educational purposes.

---

## ❤️ Built for College Use

A simple and effective platform to help students reuse, recycle, and exchange items within campus.
