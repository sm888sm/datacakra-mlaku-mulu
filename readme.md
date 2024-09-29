
# Mlaka-Mlaku

Proyek Mlaka-Mlaku adalah aplikasi berbasis microservices yang menyediakan layanan otentikasi dan manajemen perjalanan. Aplikasi ini menggunakan framework NestJS dan berkomunikasi antar layanan menggunakan gRPC.

### Daftar Isi

-   Deskripsi Proyek
-   Struktur Proyek
-   Cara Menjalankan
-   Penggunaan Koleksi Postman
-   Kelebihan & Kekurangan

### Deskripsi Proyek

Proyek ini terdiri dari dua layanan utama:

1.  **Authentication Service **
Mengelola pendaftaran, login, data user dan validasi pengguna.
2.  ** Travel Service**
Mengelola data perjalanan, termasuk pembuatan, pembaruan, dan penghapusan perjalanan.
3. **Gateway Service**: Sebagai service utama yang melayani REST dan validasi dan transformasi data yang akan dikirim dan diterima.

![enter image description here](https://raw.githubusercontent.com/sm888sm/datacakra-mlaku-mulu/refs/heads/main/system.png)

### Cara Menjalankan

#### Akses Proyek Yang Telah Online

Proyek telah di deploy di GCP dengan alamat: 

`URL : http://34.128.79.11`

Gunakan Postman Collection yang telah dilampirkan di e-mail dan repositori Github.

#### Menggunakan Docker

1.  **Clone Repository**
    
    git  clone  https://github.com/sm888sm/datacakra-mlaka-mlaku.git
    
    cd  datacakra-mlaka-mlaku
    
2.  **Buat File  `.env`**
    
    -   Buat file  `.env`  di root proyek dan tambahkan variabel lingkungan berikut:
        
        `JWT_SECRET=your_jwt_secret`
        
3.  **Jalankan Docker Compose**
    
    -   Jalankan perintah berikut untuk membangun dan menjalankan layanan menggunakan Docker Compose:
        
        `docker-compose  up  --build`
        
4.  **Akses Layanan**
    
    -   Layanan Gateway akan tersedia di  `http://localhost:80`
    -   Layanan Authentication akan tersedia di  `http://localhost:50051`
    -   Layanan Travel akan tersedia di  `http://localhost:50052`
    -   Layanan Travel akan tersedia di  `http://localhost:5432`
   
   Catatan : Jika ingin menggunakan database Postgres yang terpisah, modifikasi file Docker Compose sesuai dengan kebutuhan.

### Penggunaan Koleksi Postman

1.  **Import Koleksi Postman**
    
    -   Buka Postman dan import file  `Mlaka-Mlaku REST.postman_collection.json`.
2.  **Gunakan Endpoint yang Tersedia**
    
    -   Gunakan endpoint yang tersedia untuk menguji layanan otentikasi dan perjalanan.
  
  ### Kelebihan & Kekurangan

#### Kelebihan:
1. Sudah menggunakan sistem *microservice* dengan gRPC.
2. Menggunakan validasi dan transformasi data yang cukup ketat.
3. *Separation of concern* pada kode yang memadai.
4. Menggunakan containerization dengan docker.

#### Kelemahan:
1. Cakupan fitur dan data yang dikirim dari API masih dirasa belum cukup.
2. Pengujian API belum menyeluruh, kemungkinan terdapat bug yang belum diketahui.
3. Belum menggunakan prinsip clean code dan SOLID pada kode secara keseluruhan.
4. Optimisasi dan penggunakan tools lainnya belum beragam (contoh: dapat menggunakan Redis untuk retrieval user data/role, sistem check dan retry connection secara periodik pada gRPC, dsb).
