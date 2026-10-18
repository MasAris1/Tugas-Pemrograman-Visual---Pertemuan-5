# PRD — Learning Management System Universitas Pelita Bangsa

| | |
|---|---|
| **Nama kerja produk** | PelitaLearn |
| **Versi** | 1.0 (draft untuk ditinjau) |
| **Tanggal** | 18 Oktober 2026 |
| **Dokumen terkait** | [architecture.md](architecture.md) · [desain.md](desain.md) |

> **Tentang data dummy.** Seluruh nama orang, NIM, NIDN, kode mata kuliah, jadwal, akun, dan angka kapasitas dalam dokumen ini adalah **data dummy** untuk melengkapi spesifikasi serta kebutuhan pengembangan dan demo. Ganti dengan data resmi universitas sebelum produksi. Struktur fakultas/prodi, kebijakan penilaian, dan identitas visual juga masih berupa **usulan** yang perlu dikonfirmasi pihak universitas.

---

## 1. Ringkasan Eksekutif

PelitaLearn adalah LMS berbasis web untuk Universitas Pelita Bangsa yang memusatkan kegiatan belajar-mengajar dalam satu tempat: distribusi materi, tugas, kuis, presensi, diskusi, penilaian, dan pengumuman. Produk dapat diakses dari laptop maupun ponsel.

- **Mahasiswa** mendapat satu sumber kebenaran untuk jadwal, tenggat, materi, dan nilai.
- **Dosen** mengelola kelas, menilai lebih cepat, dan mendapat rekap nilai serta kehadiran otomatis.
- **Admin akademik** mengendalikan struktur kelas, enrolment, dan laporan.

Rilis pertama (MVP) berfokus pada autentikasi, manajemen akademik dasar, materi, tugas, presensi, penilaian, dan pengumuman, dengan antarmuka Bootstrap 5 yang responsif dan konsisten (lihat [desain.md](desain.md)).

## 2. Latar Belakang dan Masalah

Kondisi berikut adalah **asumsi awal** yang perlu divalidasi lewat wawancara dosen, mahasiswa, dan admin pada Fase 0.

| # | Masalah | Dampak |
|---|---|---|
| P1 | Materi dan tugas tersebar di grup chat, email, dan penyimpanan pribadi | Materi sulit ditemukan; versi tidak seragam |
| P2 | Tenggat dan perubahan jadwal tidak terpusat | Tugas terlambat, miskomunikasi |
| P3 | Rekap nilai dan kehadiran dikerjakan manual di spreadsheet | Waktu dosen terbuang, rawan salah hitung |
| P4 | Mahasiswa tidak melihat nilai sementara | Kurang transparan, sulit memperbaiki kinerja |
| P5 | Tidak ada jejak perubahan nilai | Sulit menelusuri sengketa nilai |

## 3. Tujuan dan Metrik Keberhasilan

| Tujuan | Metrik | Target (6 bulan setelah peluncuran) |
|---|---|---|
| Adopsi | Kelas aktif yang memakai LMS (minimal 1 materi + 1 tugas) | ≥ 90% |
| Keterlibatan | Mahasiswa aktif yang login ≥ 3×/minggu | ≥ 80% |
| Efisiensi dosen | Waktu membuat tugas baru | ≤ 3 menit |
| Efisiensi dosen | Waktu rekap nilai akhir satu kelas | Turun ≥ 70% dari baseline (diukur saat pilot) |
| Kualitas proses | Tugas yang dikumpulkan melalui LMS | ≥ 95% |
| Kegunaan | Skor SUS (System Usability Scale) | ≥ 75 |
| Keandalan | Ketersediaan bulanan | ≥ 99,5% (di luar pemeliharaan terjadwal) |
| Performa | Largest Contentful Paint (P75, jaringan 4G) | ≤ 2,5 detik |

## 4. Ruang Lingkup

### 4.1 Dalam lingkup

- Autentikasi dan manajemen akun berbasis peran.
- Manajemen akademik: fakultas, prodi, periode, mata kuliah, kelas, enrolment.
- Materi per pertemuan, tugas dan pengumpulan, kuis daring, forum diskusi.
- Presensi berbasis kode, penilaian dan rekap nilai, pengumuman, notifikasi, jadwal.
- Laporan nilai dan kehadiran, audit log.

### 4.2 Di luar lingkup (v1)

- KRS, pembayaran, dan fungsi SIAKAD penuh (hanya integrasi ekspor/impor CSV).
- Video conference bawaan (hanya tautan Zoom/Google Meet).
- Aplikasi native mobile (cukup web responsif, PWA pada fase berikutnya).
- Proctoring ujian, deteksi plagiarisme, gamifikasi, SCORM/H5P.

## 5. Peran dan Persona

| Peran (kode) | Persona dummy | Tujuan utama | Masalah saat ini |
|---|---|---|---|
| Mahasiswa (`student`) | **Naila Putri**, Informatika, semester 5 | Tahu tenggat, kumpulkan tugas dari ponsel, lihat nilai sementara | Materi tersebar di chat dan Drive; sering lupa tenggat |
| Dosen (`lecturer`) | **Dr. Ahmad Fauzi, M.Kom.**, mengampu 2 kelas | Membagikan materi, menilai cepat, rekap otomatis | Rekap nilai manual di Excel; tugas masuk lewat banyak kanal |
| Admin Akademik (`academic_admin`) | **Agus Setiawan** | Menyiapkan kelas dan enrolment tiap semester, menarik laporan | Data kelas dikelola terpisah-pisah |
| Super Admin (`super_admin`) | **Tim IT Kampus** | Mengelola akun, konfigurasi, keamanan, audit | Tidak ada jejak aktivitas terpusat |

Satu akun memiliki satu peran utama. Peran tambahan seperti Kaprodi atau asisten dosen masuk Fase 3.

## 6. User Stories

Prioritas memakai MoSCoW: **M** = Must, **S** = Should, **C** = Could. Fase 1 = MVP.

### 6.1 Mahasiswa

| ID | Sebagai mahasiswa, saya ingin… | Agar… | Prioritas | Fase |
|---|---|---|---|---|
| US-M01 | melihat dashboard berisi jadwal hari ini dan tenggat terdekat | tidak melewatkan kewajiban | M | 1 |
| US-M02 | membuka daftar kelas dan materi per pertemuan | mudah menemukan bahan belajar | M | 1 |
| US-M03 | mengumpulkan tugas (file/teks/tautan) dari ponsel maupun laptop | bisa mengumpulkan di mana saja | M | 1 |
| US-M04 | melihat status tugas dan umpan balik dosen | tahu apa yang perlu diperbaiki | M | 1 |
| US-M05 | presensi dengan kode dari dosen | kehadiran tercatat tanpa kertas | M | 1 |
| US-M06 | melihat nilai sementara dan rincian bobotnya | memantau kemajuan sendiri | M | 1 |
| US-M07 | mengerjakan kuis dengan penghitung waktu dan simpan otomatis | jawaban tidak hilang saat koneksi putus | M | 2 |
| US-M08 | berdiskusi di forum kelas | bertanya tanpa menunggu tatap muka | S | 2 |
| US-M09 | menerima notifikasi tenggat dan pengumuman | tetap terinformasi | S | 2 |

### 6.2 Dosen

| ID | Sebagai dosen, saya ingin… | Agar… | Prioritas | Fase |
|---|---|---|---|---|
| US-D01 | mengunggah materi per pertemuan dan mengatur visibilitasnya | materi terbit sesuai jadwal | M | 1 |
| US-D02 | membuat tugas dengan tenggat dan kebijakan keterlambatan | aturan jelas bagi mahasiswa | M | 1 |
| US-D03 | menilai pengumpulan dan memberi umpan balik dalam satu layar | proses menilai cepat | M | 1 |
| US-D04 | membuka sesi presensi dan melihat rekapnya | tidak perlu absen manual | M | 1 |
| US-D05 | mengatur bobot komponen dan mengekspor nilai akhir | rekap tidak lagi manual | M | 1 |
| US-D06 | mengirim pengumuman ke mahasiswa kelas saya | informasi sampai ke semua | M | 1 |
| US-D07 | membuat kuis dari bank soal dengan penilaian otomatis | hemat waktu koreksi | S | 2 |
| US-D08 | memoderasi forum (sematkan, tutup, hapus) | diskusi tetap sehat | S | 2 |

### 6.3 Admin Akademik dan Super Admin

| ID | Sebagai admin, saya ingin… | Agar… | Prioritas | Fase |
|---|---|---|---|---|
| US-A01 | mengelola periode akademik, mata kuliah, dan kelas | struktur siap sebelum perkuliahan | M | 1 |
| US-A02 | mengimpor mahasiswa, dosen, dan enrolment dari CSV | tidak input satu per satu | M | 1 |
| US-A03 | mengubah status mahasiswa (Aktif/Cuti/Lulus/Nonaktif) | hak akses mengikuti status | M | 1 |
| US-A04 | menerbitkan pengumuman global | informasi kampus tersampaikan | M | 1 |
| US-A05 | mengunduh laporan nilai dan kehadiran per kelas/prodi | kebutuhan pelaporan terpenuhi | S | 2 |
| US-A06 | mengoreksi nilai yang sudah terkunci dengan alasan tercatat | koreksi sah dan dapat diaudit | S | 2 |
| US-S01 | mengelola akun, peran, dan reset kata sandi | akses terkendali | M | 1 |
| US-S02 | melihat audit log dan kesehatan sistem | insiden dapat ditelusuri | S | 2 |
| US-S03 | mengatur konfigurasi (skala nilai, batas unggah, penalti terlambat) | kebijakan dapat berubah tanpa rilis | S | 2 |

## 7. Kebutuhan Fungsional

### 7.1 Autentikasi dan Akun (AUTH)

| ID | Kebutuhan | Prio | Fase |
|---|---|---|---|
| FR-AUTH-01 | Login memakai NIM/NIDN/email dan kata sandi | M | 1 |
| FR-AUTH-02 | Logout; sesi kedaluwarsa setelah 30 menit tidak aktif | M | 1 |
| FR-AUTH-03 | Lupa dan reset kata sandi lewat email (tautan berlaku 60 menit) | M | 1 |
| FR-AUTH-04 | Ubah kata sandi dan profil dasar | M | 1 |
| FR-AUTH-05 | Kunci akun 15 menit setelah 5 kali gagal login berturut-turut | M | 1 |
| FR-AUTH-06 | Autentikasi dua faktor (TOTP) untuk admin | S | 2 |
| FR-AUTH-07 | SSO (SIAKAD / Google Workspace) | C | 3 |

### 7.2 Dashboard (DSH)

| ID | Kebutuhan | Prio | Fase |
|---|---|---|---|
| FR-DSH-01 | Dashboard mahasiswa: jadwal hari ini, tenggat terdekat, pengumuman, progres kelas | M | 1 |
| FR-DSH-02 | Dashboard dosen: tugas perlu dinilai, kelas diampu, jadwal | M | 1 |
| FR-DSH-03 | Dashboard admin: pengguna aktif, kelas aktif, pengumpulan tugas hari ini | S | 2 |

### 7.3 Akademik (AKD)

| ID | Kebutuhan | Prio | Fase |
|---|---|---|---|
| FR-AKD-01 | CRUD fakultas dan program studi | M | 1 |
| FR-AKD-02 | CRUD periode akademik; satu periode ditandai aktif | M | 1 |
| FR-AKD-03 | CRUD mata kuliah (kode, nama, SKS, prodi) | M | 1 |
| FR-AKD-04 | CRUD kelas per periode, penugasan dosen, jadwal, ruang, kuota | M | 1 |
| FR-AKD-05 | CRUD mahasiswa dan dosen; impor CSV dengan pratinjau dan laporan galat per baris | M | 1 |
| FR-AKD-06 | Enrolment mahasiswa ke kelas (manual dan impor CSV) | M | 1 |
| FR-AKD-07 | Status mahasiswa memengaruhi akses (lihat BR-02) | M | 1 |

### 7.4 Materi (MAT)

| ID | Kebutuhan | Prio | Fase |
|---|---|---|---|
| FR-MAT-01 | Dosen mengunggah materi per pertemuan: PDF, PPTX, DOCX, tautan video/URL | M | 1 |
| FR-MAT-02 | Status materi: draft, terbit, terjadwal terbit | S | 1 |
| FR-MAT-03 | Mahasiswa mengunduh/pratinjau materi dan menandai selesai | M | 1 |
| FR-MAT-04 | Progres kelas (% materi selesai) | S | 2 |

### 7.5 Tugas (TGS)

| ID | Kebutuhan | Prio | Fase |
|---|---|---|---|
| FR-TGS-01 | Dosen membuat tugas: judul, instruksi, lampiran, tenggat, nilai maksimum, tipe pengumpulan (file/teks/tautan) | M | 1 |
| FR-TGS-02 | Mahasiswa mengumpulkan dan dapat mengumpulkan ulang sebelum tenggat | M | 1 |
| FR-TGS-03 | Kebijakan keterlambatan: tolak, atau izinkan dengan penalti (lihat BR-07) | S | 1 |
| FR-TGS-04 | Dosen menilai, memberi skor dan umpan balik; opsi minta revisi | M | 1 |
| FR-TGS-05 | Pengingat otomatis H-1 tenggat bagi yang belum mengumpulkan | S | 2 |

### 7.6 Kuis (KUI)

| ID | Kebutuhan | Prio | Fase |
|---|---|---|---|
| FR-KUI-01 | Bank soal dan kuis: pilihan ganda, benar/salah, isian singkat | M | 2 |
| FR-KUI-02 | Jendela buka–tutup, durasi, acak urutan soal dan opsi | M | 2 |
| FR-KUI-03 | Penilaian otomatis untuk soal objektif | M | 2 |
| FR-KUI-04 | Simpan otomatis jawaban (autosave) tiap 15 detik dan saat berpindah soal | S | 2 |
| FR-KUI-05 | Penilaian manual soal esai | C | 3 |

### 7.7 Forum (FRM)

| ID | Kebutuhan | Prio | Fase |
|---|---|---|---|
| FR-FRM-01 | Thread dan balasan per kelas | S | 2 |
| FR-FRM-02 | Moderasi dosen: sematkan, tutup, hapus | S | 2 |

### 7.8 Presensi (PRS)

| ID | Kebutuhan | Prio | Fase |
|---|---|---|---|
| FR-PRS-01 | Dosen membuka sesi presensi (kode acak 6 karakter, durasi 5–30 menit) | M | 1 |
| FR-PRS-02 | Mahasiswa presensi dengan memasukkan kode | M | 1 |
| FR-PRS-03 | Rekap kehadiran per mahasiswa dan persentase | M | 1 |
| FR-PRS-04 | Koreksi manual dosen (Izin, Sakit, Alpa) dengan catatan | S | 1 |

### 7.9 Penilaian (NIL)

| ID | Kebutuhan | Prio | Fase |
|---|---|---|---|
| FR-NIL-01 | Komponen nilai dan bobot per kelas; total bobot harus 100% | M | 1 |
| FR-NIL-02 | Input atau impor nilai UTS/UAS | M | 1 |
| FR-NIL-03 | Hitung nilai akhir, huruf mutu, dan bobot mutu otomatis | M | 1 |
| FR-NIL-04 | Mahasiswa melihat nilai dan rincian per komponen | M | 1 |
| FR-NIL-05 | Dosen mengunci (finalisasi) nilai; ekspor CSV untuk SIAKAD | S | 1 |
| FR-NIL-06 | Transkrip sementara mahasiswa | C | 3 |

### 7.10 Pengumuman, Notifikasi, Jadwal (KOM)

| ID | Kebutuhan | Prio | Fase |
|---|---|---|---|
| FR-PGM-01 | Pengumuman global (admin) dan per kelas (dosen) | M | 1 |
| FR-NTF-01 | Notifikasi dalam aplikasi (ikon lonceng, penanda belum dibaca) | M | 2 |
| FR-NTF-02 | Notifikasi email untuk tenggat dan pengumuman penting | S | 2 |
| FR-KAL-01 | Jadwal kuliah mingguan dan tenggat dalam tampilan kalender | S | 2 |

### 7.11 Laporan dan Audit (LAP)

| ID | Kebutuhan | Prio | Fase |
|---|---|---|---|
| FR-LAP-01 | Rekap nilai kelas (CSV/PDF) | M | 2 |
| FR-LAP-02 | Rekap kehadiran kelas (CSV/PDF) | M | 2 |
| FR-LAP-03 | Audit log: login, perubahan nilai, perubahan status mahasiswa, impor data | S | 2 |

## 8. Aturan Bisnis

| ID | Aturan |
|---|---|
| BR-01 | Satu akun memiliki satu peran utama: `student`, `lecturer`, `academic_admin`, atau `super_admin`. |
| BR-02 | Status mahasiswa: **Aktif** akses penuh; **Cuti** dapat login tetapi hanya melihat profil dan riwayat nilai, tidak dapat mengakses kelas aktif atau mengumpulkan tugas; **Lulus** akses baca ke arsip; **Nonaktif** tidak dapat login. |
| BR-03 | Enrolment hanya pada periode akademik aktif dan dalam masa penambahan/perubahan kelas (default 2 minggu pertama, dapat dikonfigurasi). |
| BR-04 | Total bobot komponen nilai pada satu kelas harus tepat 100%. |
| BR-05 | Skala huruf mutu mengikuti tabel konfigurasi (default pada Lampiran A.9). |
| BR-06 | Kehadiran minimal 75% (hadir + izin/sakit terverifikasi dibagi total sesi) sebagai syarat mengikuti UAS. |
| BR-07 | Tugas terlambat: bila kebijakan "izinkan", status menjadi *Terlambat* dengan penalti default 10% per hari, maksimal 3 hari; setelahnya ditolak. |
| BR-08 | Pengumpulan ulang menimpa versi aktif; sistem menyimpan maksimal 3 versi terakhir. |
| BR-09 | Kuis default satu percobaan; saat waktu habis jawaban terkirim otomatis. |
| BR-10 | Nilai yang sudah dikunci hanya dapat diubah admin akademik dengan alasan tertulis; semua perubahan dicatat di audit log. |
| BR-11 | Batas unggah: tugas ≤ 20 MB per berkas (pdf, docx, pptx, xlsx, zip, jpg, png, txt); materi ≤ 100 MB per berkas. Video diwajibkan lewat tautan. |
| BR-12 | Dosen hanya dapat mengelola kelas yang ia ampu. Mahasiswa hanya melihat kelas yang ia ikuti. |
| BR-13 | Data akademik memakai penghapusan lunak (soft delete); data yang sudah memiliki nilai tidak boleh dihapus permanen. |
| BR-14 | Zona waktu sistem Asia/Jakarta (WIB); tenggat dan jadwal ditampilkan dalam WIB. |

## 9. Kriteria Penerimaan Alur Utama

**AC-01 Login**
- *Diberikan* akun mahasiswa aktif `24010101`, *ketika* NIM dan kata sandi benar, *maka* pengguna diarahkan ke Dashboard Mahasiswa dan nama "Naila Putri" tampil di bilah atas.
- *Ketika* kata sandi salah 5 kali berturut-turut, *maka* akun terkunci 15 menit dan pesan menyebutkan kapan dapat mencoba lagi.

**AC-02 Pengumpulan tugas**
- *Diberikan* tugas T-002 terbuka dengan tenggat 25 Oktober 2026 23:59 WIB, *ketika* Naila mengunggah PDF 4 MB dan menekan "Kumpulkan", *maka* status menjadi "Dikumpulkan", muncul pesan sukses yang menyebut waktu pengumpulan, dan dosen melihatnya di daftar penilaian.
- *Ketika* berkas melebihi 20 MB atau bertipe tidak diizinkan, *maka* pesan galat muncul di dekat kolom unggah dan tombol tetap dapat dipakai ulang.

**AC-03 Status Cuti**
- *Diberikan* mahasiswa Sari Dewi (`24010103`) berstatus Cuti, *ketika* ia login, *maka* ia hanya melihat profil dan riwayat nilai, dan membuka kelas aktif menampilkan alert yang menjelaskan alasan serta kontak admin akademik.

**AC-04 Presensi**
- *Diberikan* sesi presensi INF301-5A pertemuan 6 terbuka 15 menit, *ketika* mahasiswa terdaftar memasukkan kode yang benar, *maka* kehadiran tercatat "Hadir" dengan cap waktu; kode salah atau kedaluwarsa menampilkan pesan yang jelas tanpa mencatat apa pun.

**AC-05 Nilai akhir**
- *Diberikan* bobot Kehadiran 10, Tugas 30, Kuis 10, UTS 25, UAS 25 dan nilai Naila 100, 90, 85, 88, 92, *maka* nilai akhir 90,50 dan huruf mutu **A** tampil di halaman Nilai Saya beserta rincian per komponen.

**AC-06 Kuis**
- *Diberikan* Kuis 1 berdurasi 20 menit, *ketika* koneksi putus di menit ke-8 lalu pulih, *maka* jawaban yang sudah tersimpan tetap ada dan penghitung waktu melanjutkan dari waktu server.

**AC-07 Penguncian nilai**
- *Ketika* dosen memfinalisasi nilai kelas, *maka* semua kolom nilai menjadi baca-saja; perubahan berikutnya hanya lewat admin akademik dengan alasan dan tercatat di audit log.

## 10. Kebutuhan Non-Fungsional

| Kategori | Kebutuhan | Target |
|---|---|---|
| Performa | LCP P75 di jaringan 4G; respons server halaman non-unggah | ≤ 2,5 s; P95 ≤ 500 ms |
| Kapasitas | Akun terdaftar dan pengguna bersamaan saat puncak (UTS/kuis) — *asumsi dummy* | 5.000 akun; 800 bersamaan |
| Ketersediaan | Ketersediaan bulanan; pemeliharaan Minggu 01:00–03:00 WIB | ≥ 99,5% |
| Keamanan | HTTPS (TLS 1.2+), hash Argon2id/bcrypt, proteksi CSRF/XSS/SQL injection, pembatasan laju, audit log, 2FA admin | Mengacu OWASP Top 10 dan ASVS level 2 |
| Privasi | Kepatuhan UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi; minimisasi data; akses sesuai peran | Ditinjau oleh pihak hukum kampus |
| Aksesibilitas | WCAG 2.1 level AA: kontras, navigasi keyboard, label formulir, teks alternatif | Lulus audit manual + axe |
| Responsivitas | Mobile-first, 360 px s.d. 1920 px; tanpa scroll horizontal halaman | Lulus uji DevTools pada lebar acuan |
| Kompatibilitas | 2 versi terakhir Chrome, Edge, Firefox, Safari; Chrome Android; Safari iOS | — |
| Lokalisasi | Bahasa Indonesia default; format tanggal "19 Oktober 2026"; siap multi-bahasa | — |
| Pemulihan | Cadangan harian; uji pemulihan tiap kuartal | RPO ≤ 24 jam; RTO ≤ 4 jam |
| Pemeliharaan | Migrasi basis data berversi, uji otomatis, dokumentasi API | Cakupan lapisan service ≥ 70% |
| Observabilitas | Log terstruktur, pelacakan galat, health check | — |

## 11. Peta Layar (ringkas)

Detail wireframe dan komponen ada di [desain.md](desain.md).

| Modul | Layar |
|---|---|
| Autentikasi | S01 Login, S02 Lupa/Reset Kata Sandi, S19 Profil |
| Mahasiswa | S03 Dashboard, S04 Kelas Saya, S05 Detail Kelas, S06 Detail Tugas, S07 Kuis, S08 Nilai Saya |
| Dosen | S09 Dashboard Dosen, S10 Kelola Konten Kelas, S11 Penilaian Tugas, S12 Presensi, S13 Bobot dan Rekap Nilai |
| Admin | S14 Data Mahasiswa, S15 Tambah/Ubah Mahasiswa, S16 Mata Kuliah dan Kelas, S20 Laporan dan Audit Log |
| Bersama | S17 Pengumuman, S18 Notifikasi, S21 Halaman Galat |

## 12. Roadmap

Tanggal bersifat usulan dan bergantung pada ukuran tim.

| Fase | Perkiraan waktu | Isi |
|---|---|---|
| 0 — Persiapan | Nov 2026 (2 minggu) | Wawancara pengguna, konfirmasi kebijakan nilai dan identitas visual, penyiapan lingkungan, prototipe layar kunci |
| 1 — MVP | Nov 2026 – Jan 2027 (±10 minggu) | AUTH, AKD, MAT, TGS, PRS, NIL, pengumuman, dashboard dasar |
| Pilot | Feb 2027 (semester genap 2026/2027) | 3–5 kelas, 1 prodi; kumpulkan umpan balik dan skor SUS |
| 2 — Penguatan | Mar – Apr 2027 (±6 minggu) | Kuis, forum, notifikasi (in-app dan email), jadwal/kalender, laporan, audit log, 2FA admin |
| 3 — Integrasi | Semester ganjil 2027/2028 | SSO, integrasi SIAKAD, PWA, analitik belajar, peran tambahan (Kaprodi, asisten) |

## 13. Asumsi, Risiko, dan Pertanyaan Terbuka

### Asumsi

- Mahasiswa dan dosen memiliki akses internet dan perangkat (ponsel atau laptop).
- Data awal mahasiswa, dosen, dan kelas tersedia dalam format CSV dari bagian akademik.
- Hosting dapat memakai VM kampus atau cloud dengan penyimpanan objek yang kompatibel S3.

### Risiko

| Risiko | Kemungkinan | Dampak | Mitigasi |
|---|---|---|---|
| Dosen enggan beralih dari kebiasaan lama | Sedang | Tinggi | Pilot dengan dosen sukarelawan, pelatihan singkat, impor materi mudah |
| Lonjakan akses saat UTS/kuis | Sedang | Tinggi | Uji beban, cache, antrean, autosave kuis, rencana skala |
| Data nilai salah atau berubah tanpa jejak | Rendah | Tinggi | Penguncian nilai, audit log, konfirmasi sebelum finalisasi |
| Kebocoran data pribadi | Rendah | Tinggi | RBAC ketat, enkripsi saat transit dan diam, ulasan keamanan |
| Skop membengkak | Tinggi | Sedang | Disiplin fase MoSCoW; fitur C hanya setelah pilot |

### Pertanyaan terbuka

1. Apakah sudah ada SIAKAD atau sumber data mahasiswa yang harus diintegrasikan sejak awal?
2. Apakah kampus memakai SSO (mis. Google Workspace) yang sebaiknya didahulukan?
3. Kebijakan resmi skala nilai, kehadiran minimal, dan penalti keterlambatan, apakah sama untuk semua prodi?
4. Logo dan warna identitas resmi universitas (palet pada [desain.md](desain.md) hanya usulan).
5. Hosting: on-premise atau cloud, dan siapa pengelola operasionalnya?

---

## Lampiran A — Data Dummy

Periode akademik demo: **Semester Ganjil 2026/2027**. Tanggal "hari ini" pada contoh adalah **Minggu, 18 Oktober 2026**.

### A.1 Fakultas dan Program Studi

| Fakultas | Kode Prodi | Program Studi |
|---|---|---|
| Fakultas Teknik | INF | Informatika |
| Fakultas Teknik | SI | Sistem Informasi |
| Fakultas Teknik | TI | Teknik Industri |
| Fakultas Ekonomi dan Bisnis | MJ | Manajemen |
| Fakultas Ekonomi dan Bisnis | AK | Akuntansi |

### A.2 Akun Demo

Khusus lingkungan lokal/staging. **Wajib dihapus atau diganti di produksi.**

| Peran | Username | Email | Kata sandi |
|---|---|---|---|
| Super Admin | `superadmin` | superadmin@lms.example | `Demo#2026` |
| Admin Akademik | `A001` (Agus Setiawan) | agus.setiawan@lms.example | `Demo#2026` |
| Dosen | `9900000001` (Dr. Ahmad Fauzi) | ahmad.fauzi@lms.example | `Demo#2026` |
| Mahasiswa | `24010101` (Naila Putri) | naila.putri@mhs.lms.example | `Demo#2026` |

### A.3 Dosen

| ID | NIDN (dummy) | Nama | Prodi | Email |
|---|---|---|---|---|
| D001 | 9900000001 | Dr. Ahmad Fauzi, M.Kom. | Informatika | ahmad.fauzi@lms.example |
| D002 | 9900000002 | Rina Marlina, S.Kom., M.T. | Informatika | rina.marlina@lms.example |
| D003 | 9900000003 | Hendra Wijaya, M.Si. | Sistem Informasi | hendra.wijaya@lms.example |
| D004 | 9900000004 | Dewi Lestari, S.E., M.M. | Manajemen | dewi.lestari@lms.example |
| D005 | 9900000005 | Budi Santoso, S.T., M.T. | Teknik Industri | budi.santoso@lms.example |

### A.4 Mahasiswa (angkatan 2024, semester 5)

| NIM | Nama | Prodi | Status |
|---|---|---|---|
| 24010101 | Naila Putri | Informatika | Aktif |
| 24010102 | Bima Arya | Informatika | Aktif |
| 24010103 | Sari Dewi | Informatika | **Cuti** |
| 24020101 | Rizky Pratama | Sistem Informasi | Aktif |
| 24020102 | Aulia Rahma | Sistem Informasi | Aktif |
| 24030101 | Dimas Saputra | Teknik Industri | Aktif |
| 24040101 | Maya Anggraini | Manajemen | Aktif |
| 24050101 | Fajar Nugroho | Akuntansi | Aktif |

Sari Dewi sengaja berstatus Cuti sebagai data uji untuk BR-02 dan AC-03.

### A.5 Mata Kuliah dan Kelas (Semester Ganjil 2026/2027)

| Kode Kelas | Mata Kuliah | SKS | Dosen | Jadwal | Ruang | Kuota |
|---|---|---|---|---|---|---|
| INF301-5A | Pemrograman Visual | 3 | Dr. Ahmad Fauzi | Senin 08:00–10:30 | Lab Komputer 2 | 40 |
| INF305-5A | Basis Data Lanjut | 3 | Rina Marlina | Selasa 10:00–12:30 | B-204 | 40 |
| INF312-5A | Rekayasa Perangkat Lunak | 3 | Dr. Ahmad Fauzi | Rabu 13:00–15:30 | B-205 | 40 |
| SI302-5A | Analisis dan Perancangan Sistem | 3 | Hendra Wijaya | Kamis 08:00–10:30 | B-301 | 40 |
| MJ301-5A | Manajemen Pemasaran | 3 | Dewi Lestari | Jumat 09:00–11:30 | C-101 | 40 |
| TI303-5A | Pengendalian Kualitas | 3 | Budi Santoso | Selasa 13:00–15:30 | C-202 | 40 |

### A.6 Enrolment

| Kelas | NIM terdaftar |
|---|---|
| INF301-5A | 24010101, 24010102, 24020101, 24020102 |
| INF305-5A | 24010101, 24010102 |
| INF312-5A | 24010101, 24010102 |
| SI302-5A | 24020101, 24020102 |
| MJ301-5A | 24040101, 24050101 |
| TI303-5A | 24030101 |

### A.7 Materi INF301-5A

| Pertemuan | Judul | Tipe | Status |
|---|---|---|---|
| P01 | Pengantar Pemrograman Visual dan Bootstrap | PDF | Terbit |
| P02 | Struktur HTML dan Utilitas Bootstrap | PPTX | Terbit |
| P03 | Layout: Container, Row, dan Kolom | PDF | Terbit |
| P04 | Komponen Dasar: Button, Card, Navbar | PDF | Terbit |
| P05 | Rancang UI yang Jelas, Bukan Sekadar Cantik | PDF | Terbit |
| P06 | Form dan Validasi | PDF | Draft |

### A.8 Tugas, Kuis, dan Presensi

**Tugas**

| ID | Kelas | Judul | Tenggat (WIB) | Nilai maks | Pengumpulan | Status |
|---|---|---|---|---|---|---|
| T-001 | INF301-5A | Setup Proyek dan Halaman Hello Bootstrap | 4 Okt 2026 23:59 | 100 | ZIP | Ditutup (sudah dinilai) |
| T-002 | INF301-5A | Audit UI/UX Aplikasi Data Mahasiswa | 25 Okt 2026 23:59 | 100 | PDF + tautan | Terbuka |
| T-003 | INF301-5A | Redesign Form Tambah Mahasiswa (Bootstrap 5) | 1 Nov 2026 23:59 | 100 | ZIP + tautan repo | Terjadwal terbit 26 Okt 2026 |
| T-004 | INF305-5A | Normalisasi Basis Data Perpustakaan (1NF–3NF) | 22 Okt 2026 23:59 | 100 | PDF | Terbuka |
| T-005 | SI302-5A | Diagram Use Case Sistem Peminjaman | 29 Okt 2026 23:59 | 100 | PDF | Terbuka |

Nilai T-001: Naila 88, Bima 80, Rizky 70, Aulia 95. Status T-002 per 18 Okt 2026 11:30: Naila **Dikumpulkan** (17 Okt 20:14), Aulia **Dikumpulkan** (18 Okt 09:05), Bima dan Rizky **Belum dikumpulkan**.

**Kuis**

| ID | Kelas | Judul | Buka | Tutup | Durasi | Soal | Percobaan |
|---|---|---|---|---|---|---|---|
| K-001 | INF301-5A | Kuis 1 — Dasar Komponen Bootstrap | 20 Okt 2026 08:00 | 20 Okt 2026 23:59 | 20 menit | 10 pilihan ganda, soal diacak | 1 |

Contoh soal: *"Kelas mana yang membuat kolom menumpuk di layar kecil dan berbagi ruang di layar besar?"* — A. `col-12 col-lg-6` (benar), B. `container-fluid`, C. `d-none`, D. `g-3`.

**Presensi INF301-5A** (kode sesi contoh: `PV-7X4K`, berlaku 15 menit)

| Pertemuan | Tanggal | Naila | Bima | Rizky | Aulia |
|---|---|---|---|---|---|
| P1 | 14 Sep 2026 | Hadir | Hadir | Hadir | Hadir |
| P2 | 21 Sep 2026 | Hadir | Hadir | Hadir | Hadir |
| P3 | 28 Sep 2026 | Hadir | Izin | Hadir | Hadir |
| P4 | 5 Okt 2026 | Hadir | Hadir | Alpa | Hadir |
| P5 | 12 Okt 2026 | Hadir | Hadir | Hadir | Hadir |
| P6 | 19 Okt 2026 | (sesi dijadwalkan) | | | |

Izin terverifikasi dihitung hadir (BR-06): Naila 100%, Bima 100%, Rizky 80%, Aulia 100%.

### A.9 Penilaian

**Komponen dan bobot default (INF301-5A)**

| Komponen | Tipe | Bobot |
|---|---|---|
| Kehadiran | Otomatis dari presensi | 10% |
| Tugas | Rata-rata nilai tugas | 30% |
| Kuis | Rata-rata nilai kuis | 10% |
| UTS | Input manual | 25% |
| UAS | Input manual | 25% |

**Skala huruf mutu default (dapat dikonfigurasi)**

| Rentang nilai | Huruf | Bobot mutu |
|---|---|---|
| ≥ 85 | A | 4,00 |
| 80 – 84,99 | A- | 3,70 |
| 75 – 79,99 | B+ | 3,30 |
| 70 – 74,99 | B | 3,00 |
| 65 – 69,99 | B- | 2,70 |
| 60 – 64,99 | C+ | 2,30 |
| 55 – 59,99 | C | 2,00 |
| 40 – 54,99 | D | 1,00 |
| < 40 | E | 0,00 |

**Simulasi rekap akhir semester INF301-5A** (nilai UTS/UAS adalah contoh simulasi)

| NIM | Nama | Hadir | Tugas | Kuis | UTS | UAS | Nilai akhir | Huruf |
|---|---|---|---|---|---|---|---|---|
| 24010101 | Naila Putri | 100 | 90 | 85 | 88 | 92 | 90,50 | A |
| 24010102 | Bima Arya | 100 | 82 | 78 | 80 | 84 | 83,40 | A- |
| 24020101 | Rizky Pratama | 80 | 70 | 75 | 72 | 78 | 74,00 | B |
| 24020102 | Aulia Rahma | 100 | 95 | 90 | 92 | 94 | 94,00 | A |

Rumus: nilai akhir = Σ (nilai komponen × bobot ÷ 100).

### A.10 Pengumuman

| Cakupan | Judul | Penulis | Tanggal |
|---|---|---|---|
| Global | Jadwal UTS Semester Ganjil 2026/2027: 2–7 November 2026 | Agus Setiawan (Admin Akademik) | 15 Okt 2026 |
| Global | Pemeliharaan Sistem LMS, Minggu 25 Oktober 2026 pukul 01:00–03:00 WIB | Tim IT Kampus | 16 Okt 2026 |
| INF301-5A | Kuis 1 dibuka Selasa 20 Oktober 2026, durasi 20 menit, satu percobaan | Dr. Ahmad Fauzi | 16 Okt 2026 |

### A.11 Forum INF301-5A

- **Thread:** "Kapan tabel lebih baik diganti kartu di layar kecil?" oleh Naila Putri (17 Okt 2026).
- **Balasan 1** oleh Dr. Ahmad Fauzi: tabel dengan banyak kolom dan aksi per baris biasanya lebih nyaman menjadi daftar kartu di bawah 768 px.
- **Balasan 2** oleh Bima Arya: setuju; untuk tabel sederhana cukup `.table-responsive`.

## Lampiran B — Glosarium

| Istilah | Arti |
|---|---|
| LMS | Learning Management System, sistem pengelolaan pembelajaran |
| SIAKAD | Sistem Informasi Akademik |
| KRS | Kartu Rencana Studi |
| NIM / NIDN | Nomor Induk Mahasiswa / Nomor Induk Dosen Nasional |
| UTS / UAS | Ujian Tengah Semester / Ujian Akhir Semester |
| SKS | Satuan Kredit Semester |
| RBAC | Role-Based Access Control |
| MVP | Minimum Viable Product |
| PWA | Progressive Web App |
| SUS | System Usability Scale |
