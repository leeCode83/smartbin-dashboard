# Software Architecture (Basic IoT)

Alur data: **ESP32 → API Server → Dashboard** (kiri ke kanan).

```mermaid
flowchart LR
    subgraph ESP32["ESP32 (Firmware)"]
        direction TB
        S1["Inisialisasi Sistem<br>(Sensor, Servo, Wi-Fi)"] --> S2["Baca Data Sensor<br>(Ultrasonik 3 Kompartemen)"]
        S2 --> S3["Logika Sistem<br>(Hitung Fullness, Kontrol Servo)"]
        S3 --> S4["Kirim Data ke Server<br>(HTTP/JSON, tiap 30 detik)"]
    end

    subgraph Server["Server (Next.js + Supabase)"]
        direction TB
        A1["API Server<br>(Next.js Route Handlers)"]
        A2[("Database<br>(Supabase PostgreSQL)")]
        A1 --- A2
    end

    subgraph UI["User Interface (Web Dashboard)"]
        direction TB
        D1["Dashboard Monitoring<br>(Kapasitas, Riwayat, Threshold)"]
    end

    S4 -->|"Data Sensor (JSON)"| A1
    A1 -.->|"Threshold (JSON)"| S4
    A1 -->|"Data Real-time (HTTP)"| D1
    D1 -->|"Pengaturan Threshold (POST)"| A1
```

## Endpoint

| Endpoint | Metode | Dipakai oleh |
| --- | --- | --- |
| `/api/smartbin` | POST | ESP32 (kirim data sensor) |
| `/api/smartbin/now` | GET | Dashboard (data terbaru) |
| `/api/smartbin/average` | GET | Dashboard (riwayat/rata-rata) |
| `/api/smartbin/threshold` | GET / POST | Dashboard (atur), ESP32 (baca) |
