# 💬 Moji - Fullstack Real-Time Chat Application

<div align="center">

![Moji Chat Banner](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

**Moji** là ứng dụng nhắn tin thời gian thực (Real-Time Chat App) hiện đại, hỗ trợ nhắn tin 1-1, tạo nhóm trò chuyện, kết bạn, gửi hình ảnh, emoji và thông báo trạng thái trực tuyến theo thời gian thực.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_Upload-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)

</div>

---

## 🌟 Tính Năng Nổi Bật (Key Features)

### 🔐 1. Xác thực & Tài khoản (Authentication & Profile)
- **Đăng ký / Đăng nhập**: Bảo mật với JWT (JSON Web Tokens) lưu trữ trong `HttpOnly Cookie`, mã hóa mật khẩu bằng `bcrypt`.
- **Quản lý thông tin cá nhân**: Cập nhật tên, bio, và đổi ảnh đại diện (avatar) tải lên trực tiếp thông qua **Cloudinary**.

### 💬 2. Nhắn tin thời gian thực (Real-Time Messaging)
- **Nhắn tin trực tiếp 1-1 & Nhắn tin nhóm**: Gửi nhận tin nhắn ngay lập tức với **Socket.IO**.
- **Đa phương tiện & Tiện ích**:
  - Gửi hình ảnh đính kèm (hỗ trợ upload và preview tức thì).
  - Tích hợp bộ chọn biểu tượng cảm xúc (**Emoji Mart**).
  - Tải tin nhắn phân trang mượt mà (**Infinite Scroll**).
  - Trạng thái người dùng đang trực tuyến / ngoại tuyến (Online/Offline status).

### 👥 3. Hệ thống bạn bè & Nhóm (Friends & Group Chat)
- **Tìm kiếm người dùng**: Tra cứu bạn bè nhanh chóng theo username / tên.
- **Lời mời kết bạn**: Gửi lời mời, chấp nhận, từ chối hoặc hủy lời mời kết bạn theo thời gian thực.
- **Tạo & Quản lý nhóm chat**: Tạo nhóm nhiều thành viên, đặt tên nhóm và avatar nhóm tùy chỉnh.

### 🎨 4. Giao diện & Trải nghiệm người dùng (Modern UI/UX)
- Giao diện thiết kế theo phong cách hiện đại với **Tailwind CSS v4** và **Radix UI Primitives**.
- Phản hồi hành động tức thì với thông báo toast (**Sonner**).
- Quản lý trạng thái ứng dụng toàn cục mượt mà bằng **Zustand**.
- Skeleton loaders giúp trải nghiệm tải mượt mà, không bị giật lag.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### **Frontend (Client)**
- **Framework & Tooling**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Form & Validation**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Real-time Client**: [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Components**: [Emoji Mart](https://github.com/missive/emoji-mart), [Sonner](https://sonner.emilkowal.ski/), [React Infinite Scroll Component](https://github.com/ankeetmaini/react-infinite-scroll-component)

### **Backend (Server)**
- **Runtime & Framework**: [Node.js](https://nodejs.org/), [Express.js v5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) với [Mongoose ODM](https://mongoosejs.com/)
- **Real-time Server**: [Socket.IO](https://socket.io/)
- **Authentication & Security**: [JSON Web Token (JWT)](https://jwt.io/), [bcrypt](https://github.com/kelektiv/node.bcrypt.js), [cookie-parser](https://github.com/expressjs/cookie-parser), [cors](https://github.com/expressjs/cors)
- **File Upload & Cloud Storage**: [Multer](https://github.com/expressjs/multer), [Cloudinary](https://cloudinary.com/)

---

## 📂 Cấu Trúc Thư Mục Dự Án (Project Structure)

```text
Moji/
├── backend/                  # Mã nguồn Backend API & Socket Server
│   ├── src/
│   │   ├── controllers/      # Bộ điều khiển xử lý logic (Auth, Chat, Friend, User, Message, v.v.)
│   │   ├── libs/             # Cấu hình kết nối DB (MongoDB), Cloudinary
│   │   ├── middleware/       # Middleware xác thực JWT (protectedRoute) & upload file
│   │   ├── models/           # Mongoose Models (User, Conversation, Message, Friend, ...)
│   │   ├── routes/           # Định nghĩa các REST API Endpoints
│   │   ├── socket/           # Quản lý sự kiện và kết nối Socket.IO
│   │   ├── utils/            # Helper functions (tạo token, format dữ liệu)
│   │   └── server.js         # Entry point của Backend server
│   ├── .env.example          # Biến môi trường mẫu cho backend
│   └── package.json
│
├── client/                   # Mã nguồn Frontend (React + TypeScript)
│   ├── src/
│   │   ├── assets/           # Hình ảnh, icons, static assets
│   │   ├── components/       # UI Components tái sử dụng (Chat, Sidebar, Modals, Forms, ...)
│   │   ├── hooks/            # Custom React Hooks
│   │   ├── pages/            # Các trang chính (SignIn, SignUp, ChatApp)
│   │   ├── services/         # API Service Calls (Axios instances)
│   │   ├── stores/           # Global State Stores (Zustand)
│   │   ├── types/            # TypeScript Interface & Type definitions
│   │   ├── App.tsx           # Router & App Wrapper
│   │   └── main.tsx          # Entry point của Frontend client
│   ├── .env.example          # Biến môi trường mẫu cho frontend
│   ├── tailwind.config.ts    # Cấu hình TailwindCSS
│   ├── vite.config.ts        # Cấu hình Vite
│   └── package.json
│
└── README.md                 # Tài liệu hướng dẫn dự án
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án (Getting Started)

### 📋 Yêu Cầu Tiên Quyết (Prerequisites)
- [Node.js](https://nodejs.org/) (phiên bản 18.x trở lên)
- [MongoDB](https://www.mongodb.com/) (hoặc tài khoản [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Tài khoản [Cloudinary](https://cloudinary.com/) (để upload ảnh đại diện và ảnh trong tin nhắn)
- Git

---

### 1️⃣ Clone Kho Chứa (Clone Repository)

```bash
git clone https://github.com/<your-username>/Moji.git
cd Moji
```

---

### 2️⃣ Cấu Hình & Chạy Backend

1. Di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

3. Tạo file `.env` từ `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Điền các giá trị vào file `.env`:
   ```env
   PORT=5001
   URI_MONGODB=mongodb+srv://<username>:<password>@cluster0.mongodb.net/moji_chat?retryWrites=true&w=majority
   ACCESS_TOKEN_SECRET=your_super_secret_jwt_key
   CLIENT_URL=http://localhost:5173
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_APIKEY=your_cloudinary_api_key
   CLOUDINARY_SECRET=your_cloudinary_api_secret
   ```

5. Khởi chạy Backend Server:
   ```bash
   # Chạy môi trường phát triển (tự động reload khi sửa code)
   npm run dev

   # Hoặc chạy môi trường production
   npm start
   ```
   > Backend sẽ chạy tại: `http://localhost:5001`

---

### 3️⃣ Cấu Hình & Chạy Frontend (Client)

1. Mở một terminal mới và di chuyển vào thư mục `client`:
   ```bash
   cd client
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

3. Tạo file `.env.development` (hoặc `.env`):
   ```bash
   cp .env.example .env.development
   ```

4. Điền biến môi trường cho Client:
   ```env
   VITE_API_URL=http://localhost:5001/api
   VITE_SOCKET_URL=http://localhost:5001
   ```

5. Khởi chạy Frontend:
   ```bash
   npm run dev
   ```
   > Ứng dụng sẽ khả dụng tại: `http://localhost:5173`

---

## 📡 Danh Sách API Endpoints (API Overview)

### 🔑 Authentication (`/api/auth`)
| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Đăng ký tài khoản mới |
| `POST` | `/api/auth/signin` | Đăng nhập tài khoản |
| `POST` | `/api/auth/logout` | Đăng xuất tài khoản |
| `GET` | `/api/auth/check` | Kiểm tra phiên đăng nhập hiện tại |

### 👤 User & Profile (`/api/user`)
| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/user/profile` | Lấy thông tin tài khoản hiện tại |
| `PUT` | `/api/user/update-profile` | Cập nhật thông tin và avatar |
| `GET` | `/api/user/search?q=...` | Tìm kiếm người dùng |

### 🤝 Friends (`/api/friends`)
| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/friends` | Danh sách bạn bè |
| `GET` | `/api/friends/requests` | Danh sách lời mời kết bạn |
| `POST` | `/api/friends/send-request/:id` | Gửi lời mời kết bạn |
| `POST` | `/api/friends/accept/:id` | Chấp nhận lời mời kết bạn |
| `POST` | `/api/friends/reject/:id` | Từ chối lời mời kết bạn |

### 💬 Conversations & Messages (`/api/conversations` & `/api/messages`)
| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/conversations` | Lấy danh sách các cuộc hội thoại |
| `POST` | `/api/conversations/group` | Tạo cuộc hội thoại nhóm mới |
| `GET` | `/api/messages/:conversationId` | Lấy lịch sử tin nhắn của cuộc trò chuyện |
| `POST` | `/api/messages/:conversationId` | Gửi tin nhắn mới (văn bản / hình ảnh) |

---

## ⚡ Socket.IO Events

| Sự kiện (Event) | Hướng truyền | Mô tả |
| :--- | :--- | :--- |
| `setup` / `connection` | Client ➔ Server | Thiết lập phiên kết nối người dùng |
| `getOnlineUsers` | Server ➔ Client | Cập nhật danh sách ID người dùng đang online |
| `newMessage` | Server ➔ Client | Nhận tin nhắn mới tức thì |
| `friendRequestReceived` | Server ➔ Client | Thông báo khi nhận được lời mời kết bạn mới |
| `friendRequestAccepted` | Server ➔ Client | Thông báo khi lời mời kết bạn được chấp nhận |

---

## 🛡️ Giấy Phép (License)

Dự án được phân phối dưới giấy phép **ISC License**. Bạn có thể tự do học tập, phát triển và đóng góp cho dự án.

---

<div align="center">

Được phát triển với ❤️ bởi **Ngô Tuấn Việt** & Cộng đồng đóng góp.  
Nếu bạn thấy dự án hữu ích, hãy tặng một ⭐️ trên GitHub nhé!

</div>
