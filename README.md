# 🏸 Badminton Court Booking Web App

Aplikasi pemesanan lapangan badminton secara online yang memudahkan pengguna untuk melihat jadwal, melakukan booking, memberikan rating, serta mengelola profil. Mendukung banyak lokasi lapangan dan memiliki sistem admin untuk pengelolaan data.

## ✨ Fitur

- **Autentikasi Pengguna**
  - Registrasi & Login
  - Edit profil
  - Riwayat pemesanan
- **Pemesanan Lapangan**
  - Jadwal lapangan real-time
  - Booking online untuk berbagai lokasi
- **Rating & Ulasan**
  - Beri rating untuk lapangan yang sudah digunakan
- **Admin Panel**
  - Kelola data lapangan
  - Kelola jadwal & pemesanan
  - Kelola ulasan
- **UI & UX**
  - Desain responsif dengan Tailwind CSS
  - Slider interaktif dengan Swiper.js
  - SweetAlert untuk notifikasi

## 🛠️ Teknologi

- **Backend:** Flask (Python)
- **Frontend:** JavaScript, Tailwind CSS, Swiper.js, SweetAlert
- **Database:** MongoDB
- **Template Engine:** Jinja2 (Flask default)
- **Others:** Werkzeug Security, Session Management

## 📦 Instalasi & Menjalankan

1. **Clone Repository**
   ```bash
   git clone https://github.com/DafaTyo/Booking.git
   cd repo-name
````

2. **Buat Virtual Environment & Install Dependencies**

   ```bash
   python -m venv venv
   source venv/bin/activate   # MacOS/Linux
   venv\Scripts\activate      # Windows

   pip install -r requirements.txt
   ```

3. **Buat File `.env`**

   ```env
   FLASK_SECRET_KEY=your_secret_key
   MONGO_URI=mongodb://localhost:27017/nama_database
   ```

4. **Jalankan Aplikasi**

   ```bash
   flask run
   ```

5. **Akses Website**

   ```
   http://localhost:5000
   ```

## 📸 Screenshot

*(Tambahkan screenshot UI di sini)*

## 👥 Kontributor

* **Dafa Prasetyo** — Developer (Backend & Frontend)
* **Muhammad Farhan Nurkhaeri** — UI/UX Designer