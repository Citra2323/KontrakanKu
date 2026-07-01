# KontrakanKu — Deploy ke Render (gratis, dapat subdomain otomatis)

Versi ini sudah pakai **PostgreSQL** (bukan SQLite) supaya kompatibel dengan database gratis dari Render. Tidak perlu compile C++ apapun.

---

## 🚀 Cara Deploy (15-20 menit)

### Langkah 1 — Buat akun GitHub (kalau belum punya)

Daftar gratis di **github.com**

### Langkah 2 — Buat repository baru

1. Klik **New repository** di GitHub
2. Beri nama, misal `kontrakanku`
3. Pilih **Public** atau **Private** (keduanya gratis)
4. Klik **Create repository**

### Langkah 3 — Upload kode ke GitHub

Paling mudah pakai **GitHub Desktop** (gratis, ada GUI, tidak perlu command line):

1. Download & install **GitHub Desktop** dari desktop.github.com
2. Login dengan akun GitHub kamu
3. **File → Add Local Repository** → pilih folder project ini (`kontrakanku-deploy`)
4. Klik **Publish repository**, pilih repo yang tadi dibuat

Atau via terminal (kalau familiar dengan git):
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/kontrakanku.git
git push -u origin main
```

### Langkah 4 — Buat akun Render

Daftar gratis di **render.com** (bisa langsung pakai akun GitHub untuk login, lebih cepat)

### Langkah 5 — Deploy otomatis pakai Blueprint

1. Di dashboard Render, klik **New → Blueprint**
2. Pilih repository `kontrakanku` yang tadi di-push
3. Render akan otomatis mendeteksi file `render.yaml` di project ini dan menyiapkan:
   - Web Service (server Node.js)
   - PostgreSQL Database (gratis)
4. Klik **Apply**
5. Tunggu proses build & deploy (~5-10 menit)

### Langkah 6 — Isi data awal (seed)

Setelah deploy selesai:
1. Di dashboard Render, buka service `kontrakanku`
2. Klik tab **Shell**
3. Ketik:
```bash
npm run seed
```

### Langkah 7 — Buka website kamu

Render otomatis kasih subdomain gratis seperti:
```
https://kontrakanku.onrender.com
```

Link ini ada di dashboard Render, di bagian atas halaman service kamu.

---

## ⚠️ Catatan plan gratis Render

- Server akan "tidur" otomatis kalau tidak ada traffic selama 15 menit, dan butuh ~30-50 detik untuk "bangun" lagi saat ada yang akses — ini normal untuk free tier
- Database gratis PostgreSQL Render aktif selama 90 hari, setelah itu perlu upgrade plan berbayar (mulai ~$7/bulan) atau buat database baru gratis lagi
- Cocok untuk demo, portofolio, atau penggunaan ringan; untuk produksi serius sebaiknya upgrade ke plan berbayar

---

## 🌐 Pakai Domain Sendiri Nanti (opsional)

Kalau nanti beli domain sendiri (misal `kontrakanku.com`):
1. Di dashboard Render, masuk ke service → **Settings → Custom Domain**
2. Masukkan domain kamu, ikuti instruksi untuk update DNS di provider domain (Niagahoster, Namecheap, dll)
3. Render otomatis kasih HTTPS gratis (SSL certificate)

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express 4
- **Database**: PostgreSQL (via `pg`)
- **Frontend**: Vanilla JS, Tailwind CSS (CDN)
- **Hosting**: Render.com (free tier)

---

## 🔌 REST API Endpoints

| Method | Endpoint              | Keterangan                        |
|--------|------------------------|------------------------------------|
| GET    | `/api/stats`          | Statistik dashboard               |
| GET    | `/api/kompleks`       | Semua kompleks                    |
| POST   | `/api/kompleks`       | Tambah kompleks baru              |
| PUT    | `/api/kompleks/:id`   | Update kompleks                   |
| DELETE | `/api/kompleks/:id`   | Hapus kompleks                    |
| GET    | `/api/unit`           | Semua unit (opsional: ?kompleksId)|
| POST   | `/api/unit`           | Tambah unit baru                  |
| PUT    | `/api/unit/:id`       | Update unit                       |
| DELETE | `/api/unit/:id`       | Hapus unit                        |
