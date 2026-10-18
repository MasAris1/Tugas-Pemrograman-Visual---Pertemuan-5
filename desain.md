# Desain UI/UX — LMS Universitas Pelita Bangsa (PelitaLearn)

| | |
|---|---|
| **Versi** | 1.0 (draft untuk ditinjau) |
| **Tanggal** | 18 Oktober 2026 |
| **Dokumen terkait** | [PRD.md](PRD.md) · [architecture.md](architecture.md) |

> **Catatan.** Semua nama, NIM, jadwal, dan angka pada wireframe adalah **data dummy** dari [PRD Lampiran A](PRD.md#lampiran-a--data-dummy). Palet dan tipografi adalah **usulan** yang mengikuti materi Pemrograman Visual Pertemuan 5 (navy + teal, Montserrat + DM Sans); sesuaikan dengan identitas visual resmi Universitas Pelita Bangsa bila sudah tersedia.

---

## 1. Tujuan dan Acuan

Dokumen ini menetapkan bahasa visual dan pola antarmuka PelitaLearn agar seluruh layar terasa satu produk: **jelas, konsisten, dan nyaman di semua ukuran layar**, bukan sekadar cantik.

Acuan: Bootstrap 5.3 (dokumentasi resmi), WCAG 2.1 level AA, dan enam prinsip pada §2. Implementasi memakai Bootstrap 5 sesuai ADR-05 di [architecture.md](architecture.md).

## 2. Enam Prinsip dan Penerapannya

Gunakan sebagai checklist sebelum sebuah layar disebut "selesai" (lihat juga §12).

| # | Prinsip | Penerapan di PelitaLearn |
|---|---|---|
| 01 | **Konsistensi** — pola yang sama | Satu pola form, satu pola tabel, satu set badge status di semua peran. Tombol aksi utama selalu di kanan bawah form. |
| 02 | **Kejelasan** — bahasa langsung | Label berupa kata kerja ("Kumpulkan", "Simpan data"), tenggat selalu bertanggal lengkap dengan "WIB", istilah akademik yang dikenal mahasiswa. |
| 03 | **Hierarki** — prioritas terlihat | Dashboard menaruh "tenggat terdekat" sebelum pengumuman; satu tombol primer per bagian; heading Montserrat tebal, teks sekunder abu-biru. |
| 04 | **Feedback** — aksi terkonfirmasi | Setiap aksi penting menjawab: *apa yang terjadi* dan *apa langkah berikutnya* (alert, toast, atau perubahan status badge). |
| 05 | **Aksesibilitas** — bisa dipakai semua | Kontras ≥ 4,5:1, label selalu terlihat, navigasi penuh dengan keyboard, status tidak hanya dengan warna. |
| 06 | **Responsivitas** — nyaman di semua layar | Mobile-first dengan grid 12 kolom Bootstrap; tabel berubah menjadi kartu di bawah 768 px bila perlu. |

## 3. Identitas Visual

### 3.1 Warna

| Token | Hex | Peran |
|---|---|---|
| `--upl-navy-900` | `#12293F` | Teks utama, heading, latar sidebar |
| `--upl-teal-700` | `#0F766E` | **Aksi utama** (tombol primer), tautan, fokus |
| `--upl-teal-800` | `#0B5F58` | Hover/aktif tombol primer |
| `--upl-teal-500` | `#1AB8A5` | Aksen dekoratif dan penanda aktif pada permukaan gelap |
| `--upl-teal-50` | `#DFF5F2` | Latar panel informasi, kartu ringkasan |
| `--upl-blue-600` | `#2872DB` | Aksen informatif sekunder (grafik, ikon) |
| `--upl-slate-600` | `#5B7088` | Teks sekunder, teks bantuan |
| `--upl-bg` | `#F4F7FA` | Latar halaman |
| `--upl-border` | `#CBD8E4` | Garis, border kartu dan tabel |

**Warna semantik** memakai bawaan Bootstrap karena pasangan teks–latarnya sudah teruji: *success* `#198754`, *warning* `#FFC107` (teks gelap), *danger* `#DC3545`, *info* `#0DCAF0` (teks gelap).

**Kontras (perkiraan; verifikasi ulang dengan alat pemeriksa kontras sebelum final):**

| Pasangan | Rasio ≈ | Catatan |
|---|---|---|
| Navy `#12293F` di atas putih | 14,8 : 1 | Teks utama |
| Putih di atas Teal-700 `#0F766E` | 5,5 : 1 | Tombol primer — lulus AA |
| Slate `#5B7088` di atas `#F4F7FA` | 4,7 : 1 | Teks sekunder — lulus AA |
| Putih di atas Blue `#2872DB` | 4,6 : 1 | Lulus AA |
| Teal-500 `#1AB8A5` di atas putih | 2,5 : 1 | **Tidak lulus**: hanya untuk dekorasi, bukan teks/tombol/indikator tunggal |
| Teal-500 di atas Navy `#12293F` | 6,0 : 1 | Aman untuk penanda aktif di sidebar |

> Penyesuaian dari materi kuliah: teal terang (±`#1AB8A5`) dengan teks putih hanya sekitar 2,5:1 sehingga tidak memenuhi WCAG AA. Karena itu tombol dan tautan memakai Teal-700; teal terang dipertahankan sebagai aksen.

### 3.2 Tipografi

| Peran | Font | Ukuran / bobot |
|---|---|---|
| H1 judul halaman | Montserrat 700 | 2 rem (32 px), line-height 1,25 |
| H2 judul bagian | Montserrat 700 | 1,5 rem |
| H3 judul kartu | Montserrat 600 | 1,25 rem |
| Teks isi | DM Sans 400 | 1 rem, line-height 1,6 |
| Label form dan tombol | DM Sans 500/700 | 0,9375–1 rem |
| Teks bantuan, caption | DM Sans 400 | 0,875 rem |
| NIM, kode kelas, kode presensi | IBM Plex Mono 500 | 0,9375 rem |

Aturan: font di-*host sendiri* (lisensi OFL) dengan `font-display: swap` dan *preload* dua bobot utama; fallback `system-ui, -apple-system, "Segoe UI", sans-serif`. Kolom angka pada tabel memakai `font-variant-numeric: tabular-nums` bila didukung. Ukuran teks isi tidak kurang dari 16 px di ponsel.

### 3.3 Spasi, bentuk, dan ikon

- **Spasi** memakai skala Bootstrap: `g-3` antarkolom, `mb-3` antarkelompok form, `p-3 p-lg-4` pada kartu, `py-4` pada container halaman.
- **Bentuk:** radius kartu `0.5rem`, input `0.375rem`, badge `rounded-pill`; bayangan tipis (`shadow-sm`) hanya untuk kartu yang dapat diklik.
- **Target sentuh** minimal 44 × 44 px (tombol memakai `py-2` dan tinggi minimum 44 px di ponsel).
- **Ikon:** Bootstrap Icons. Ikon selalu disertai teks atau `aria-label`; ikon dekoratif memakai `aria-hidden="true"`.

## 4. Implementasi Bootstrap 5

**Pemasangan:** CDN untuk prototipe (sesuai alur kerja kuliah), dan `npm` + Sass untuk produksi sehingga variabel dapat di-*override* dan hanya komponen terpakai yang dikompilasi.

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="/css/custom.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>
```

**Override token (`custom.css`):**

```css
:root,
[data-bs-theme="light"] {
  --upl-navy-900: #12293F;
  --upl-teal-800: #0B5F58;
  --upl-teal-700: #0F766E;
  --upl-teal-500: #1AB8A5;
  --upl-teal-50:  #DFF5F2;
  --upl-blue-600: #2872DB;
  --upl-slate-600:#5B7088;
  --upl-bg:       #F4F7FA;
  --upl-border:   #CBD8E4;

  --bs-primary: #0F766E;
  --bs-primary-rgb: 15, 118, 110;
  --bs-link-color: #0F766E;
  --bs-link-color-rgb: 15, 118, 110;
  --bs-link-hover-color: #0B5F58;
  --bs-link-hover-color-rgb: 11, 95, 88;
  --bs-body-bg: #F4F7FA;
  --bs-body-color: #12293F;
  --bs-border-color: #CBD8E4;
  --bs-border-radius: .5rem;
  --bs-body-font-family: "DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
}

h1, h2, h3, .h1, .h2, .h3 { font-family: "Montserrat", var(--bs-body-font-family); font-weight: 700; }
.text-muted-upl { color: var(--upl-slate-600); }
.mono { font-family: "IBM Plex Mono", ui-monospace, monospace; }

.btn-primary {
  --bs-btn-bg: #0F766E;
  --bs-btn-border-color: #0F766E;
  --bs-btn-hover-bg: #0B5F58;
  --bs-btn-hover-border-color: #0B5F58;
  --bs-btn-active-bg: #094E49;
  --bs-btn-active-border-color: #094E49;
  --bs-btn-disabled-bg: #0F766E;
  --bs-btn-disabled-border-color: #0F766E;
  --bs-btn-focus-shadow-rgb: 15, 118, 110;
}

.btn, .form-control, .form-select { min-height: 44px; }
```

Pada build Sass, ubah variabel `$primary`, `$body-bg`, `$body-color`, `$font-family-sans-serif`, `$border-radius` sebelum mengimpor Bootstrap. Mode gelap (`data-bs-theme="dark"`) direncanakan untuk versi 1.1.

## 5. Layout dan Grid

### 5.1 Breakpoint

| Nama | Lebar | Perilaku di PelitaLearn |
|---|---|---|
| xs | < 576 px | 1 kolom; sidebar menjadi *offcanvas*; navigasi bawah untuk mahasiswa |
| sm | ≥ 576 px | Kartu ringkasan 2 per baris |
| md | ≥ 768 px | Tabel tampil sebagai tabel; daftar kelas 2 kolom |
| lg | ≥ 992 px | Sidebar tetap 260 px; grid dua kolom (mis. 7/5); daftar kelas 3 kolom di `xl` |
| xl / xxl | ≥ 1200 / 1400 px | Lebar konten dibatasi `container-xl` agar baris teks tetap terbaca |

Aturan praktis: **mulai dari mobile, lalu perluas layout saat ruang tersedia.**

### 5.2 Kerangka Aplikasi (app shell)

Desktop (≥ 992 px): sidebar navy tetap + bilah atas + area konten.

```text
+--------------+---------------------------------------------------+
| PelitaLearn  | [=] Cari kelas, materi...  Notif (3)  Naila P. v  |
|              +---------------------------------------------------+
| > Dashboard  | Judul halaman                      [ Aksi utama ] |
|   Kelas Saya | Beranda / Halaman ini                             |
|   Tugas      |                                                   |
|   Kuis       | +---------+ +---------+ +---------+               |
|   Presensi   | | Kartu   | | Kartu   | | Kartu   |               |
|   Nilai      | +---------+ +---------+ +---------+               |
|   Pengumuman |                                                   |
|              | Konten utama: tabel / form / daftar               |
|              |                                                   |
+--------------+---------------------------------------------------+
```

Mobile (< 992 px): bilah atas dengan tombol menu (membuka sidebar sebagai *offcanvas*), konten satu kolom, navigasi bawah untuk empat tujuan utama mahasiswa.

```text
+----------------------------+
| [=] PelitaLearn   Notif(3) |
+----------------------------+
| Dashboard                  |
| Senin, 19 Oktober 2026     |
|                            |
| +------------------------+ |
| | Tugas belum kumpul: 1  | |
| +------------------------+ |
| +------------------------+ |
| | Kuis minggu ini: 1     | |
| +------------------------+ |
|                            |
| Jadwal hari ini            |
| 08:00 Pemrograman Visual   |
|   Lab Komputer 2           |
|                            |
+----------------------------+
| Home  Kelas  Tugas  Nilai  |
+----------------------------+
```

Kerangka HTML (ringkas):

```html
<body>
  <header class="navbar bg-white border-bottom sticky-top">
    <button class="btn d-lg-none" data-bs-toggle="offcanvas" data-bs-target="#sidebar"
            aria-controls="sidebar" aria-label="Buka menu"><i class="bi bi-list"></i></button>
    <!-- pencarian, notifikasi, menu pengguna -->
  </header>

  <aside id="sidebar" class="offcanvas-lg offcanvas-start text-bg-dark" tabindex="-1">
    <nav aria-label="Navigasi utama"> ... </nav>
  </aside>

  <main id="konten" class="container-xl py-4">
    <div class="row g-3"> ... </div>
  </main>
</body>
```

### 5.3 Pola Grid per Halaman

| Halaman | Susunan grid |
|---|---|
| Dashboard (S03/S09) | Kartu ringkasan `col-6 col-lg-3`; jadwal `col-12 col-lg-7`; tenggat `col-12 col-lg-5` |
| Kelas Saya (S04) | `row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3` |
| Detail Tugas (S06) | Instruksi `col-12 col-lg-8`; panel pengumpulan `col-12 col-lg-4` |
| Form admin (S15) | Satu kolom form `col-12 col-lg-8 col-xl-6` |
| Tabel data (S11, S14) | Lebar penuh `col-12`, filter di atas dengan `row g-2` |

Pola dasar (sesuai materi kuliah): `container` → `row g-3` → `col-12 col-lg-*`, yaitu menumpuk di ponsel dan berbagi ruang di desktop.

## 6. Komponen

Pilih komponen berdasarkan **tugas pengguna**, bukan variasi tampilan.

| Kebutuhan | Komponen Bootstrap | Aturan pakai |
|---|---|---|
| Aksi utama | `btn btn-primary` | Satu per bagian halaman; label kata kerja ("Simpan data", "Kumpulkan") |
| Aksi sekunder / batal | `btn btn-outline-secondary` atau `btn btn-link` | Selalu terpisah jelas dari aksi utama |
| Aksi merusak | `btn btn-danger` | Hanya di dalam modal konfirmasi |
| Input data | `form-label`, `form-control`, `form-select`, `form-check`, `form-text` | Label selalu terlihat; placeholder hanya contoh |
| Validasi | `is-invalid` + `invalid-feedback` | Pesan di bawah field terkait |
| Ringkasan angka | `card` + `card-body` | Latar `--upl-teal-50`, angka besar Montserrat |
| Daftar data padat | `table table-hover align-middle` dalam `table-responsive` | Angka rata kanan, teks rata kiri, header lengket |
| Status | `badge rounded-pill text-bg-*` | Selalu berisi teks, bukan warna saja |
| Pesan halaman | `alert alert-*` dengan `role="alert"` | Untuk kondisi yang perlu dibaca di konteks halaman |
| Konfirmasi singkat | `toast` di `toast-container` | Hilang otomatis hanya untuk sukses |
| Konfirmasi berisiko | `modal` | Menjelaskan akibat; tombol berlabel kata kerja |
| Sub-halaman kelas | `nav nav-tabs` | Di ponsel: `flex-nowrap overflow-auto` |
| Navigasi samping | `offcanvas-lg` | Tetap di desktop, laci di ponsel |
| Progres | `progress` + `role="progressbar"` + `aria-valuenow` | Selalu sertakan teks persen |
| Daftar materi/pengumuman | `list-group` atau `accordion` | Per pertemuan memakai accordion |
| Halaman panjang | `pagination` | 20 baris per halaman |
| Memuat | `spinner-border`, `placeholder-glow` | Tampilkan kerangka, bukan layar kosong |
| Jejak halaman | `breadcrumb` | Pada halaman bertingkat (kelas → tugas) |

### 6.1 Form

Label tetap terlihat; placeholder hanya memberi contoh.

1. Gunakan tipe input yang tepat (`inputmode="numeric"`, `type="email"`, `type="file"` dengan `accept`).
2. Tandai field wajib dengan `*` dan teks tersembunyi "(wajib diisi)" untuk pembaca layar.
3. Validasi dekat dengan input; fokus berpindah ke field galat pertama.
4. Bedakan aksi utama dan batal: **Batal** di kiri (outline), **Simpan** di kanan (primer). Di ponsel, tombol memenuhi lebar (`w-100`) dan menempel di bawah.
5. Jangan menghapus isian saat validasi gagal.

### 6.2 Tabel dan Kartu

| Kondisi | Tampilan |
|---|---|
| ≥ 768 px | Tabel penuh |
| < 768 px, ≤ 4 kolom, tanpa aksi per baris | `table-responsive` (gulir horizontal di dalam tabel saja) |
| < 768 px, > 4 kolom **atau** ada aksi per baris **atau** teks panjang | Daftar kartu (satu kartu per baris data) |

Implementasi: satu sumber data dirender dua kali (`d-none d-md-block` untuk tabel, `d-md-none` untuk kartu). Elemen dengan `d-none` tidak terbaca pembaca layar sehingga tidak terjadi duplikasi.

### 6.3 Badge Status

Status selalu berupa teks; warna hanya penguat.

| Domain | Status → kelas Bootstrap |
|---|---|
| Mahasiswa | Aktif → `text-bg-success` · Cuti → `text-bg-warning` · Lulus → `text-bg-info` · Nonaktif → `text-bg-secondary` |
| Tugas (sisi mahasiswa) | Belum dikumpulkan → `text-bg-secondary` · Dikumpulkan → `text-bg-primary` · Terlambat → `text-bg-warning` · Perlu revisi → `text-bg-danger` · Dinilai → `text-bg-success` |
| Presensi | Hadir → `text-bg-success` · Izin → `text-bg-info` · Sakit → `text-bg-warning` · Alpa → `text-bg-danger` |
| Kuis | Belum dibuka → `text-bg-secondary` · Berlangsung → `text-bg-primary` · Selesai → `text-bg-success` · Terlewat → `text-bg-danger` |
| Materi | Draft → `text-bg-secondary` · Terjadwal → `text-bg-info` · Terbit → `text-bg-success` |

### 6.4 Feedback

Feedback harus menjawab dua hal: **apa yang terjadi** dan **apa langkah berikutnya**.

| Situasi | Komponen | Perilaku |
|---|---|---|
| Aksi sukses (simpan, kumpulkan) | Toast sukses, atau alert sukses di atas form | Hilang otomatis 5 detik; badge/status pada halaman ikut berubah |
| Galat validasi | `invalid-feedback` per field + ringkasan alert bila banyak | Menetap sampai diperbaiki; fokus ke field pertama |
| Galat sistem / jaringan | Alert `danger` dengan tombol "Coba lagi" | Menetap |
| Kondisi akun (mis. Cuti) | Alert `warning` di atas konten | Menetap, berisi kontak bantuan |
| Aksi berisiko (finalisasi nilai, hapus) | Modal konfirmasi | Menjelaskan akibat; tombol bermakna ("Kunci nilai", bukan "OK") |
| Proses berjalan | Spinner pada tombol, `aria-busy`, tombol nonaktif | Mencegah klik ganda |
| Data kosong | Empty state: ikon + satu kalimat + aksi | Menjelaskan mengapa kosong dan apa yang bisa dilakukan |

## 7. Inventaris Layar

Kode layar sama dengan [PRD §11](PRD.md#11-peta-layar-ringkas) dan komentar rute di [architecture.md §8.1](architecture.md#81-rute-web-server-rendered).

| ID | Layar | Rute | Peran | Komponen utama |
|---|---|---|---|---|
| S01 | Login | `/login` | Publik | card, form, alert |
| S02 | Lupa/Reset Kata Sandi | `/forgot-password` | Publik | form, alert |
| S03 | Dashboard Mahasiswa | `/dashboard` | Mahasiswa | kartu ringkasan, list-group, progress, badge |
| S04 | Kelas Saya | `/classes` | Mahasiswa, dosen | grid kartu, progress |
| S05 | Detail Kelas | `/classes/{id}` | Anggota kelas | nav-tabs, accordion, list-group, progress |
| S06 | Detail Tugas dan Pengumpulan | `/classes/{id}/assignments/{aid}` | Mahasiswa | form file, badge, alert |
| S07 | Pengerjaan Kuis | `/quizzes/{id}/attempt` | Mahasiswa | penghitung waktu, form-check, navigasi soal, modal |
| S08 | Nilai Saya | `/grades` | Mahasiswa | tabel, badge, progress |
| S09 | Dashboard Dosen | `/dashboard` | Dosen | kartu ringkasan, tabel "perlu dinilai" |
| S10 | Kelola Konten Kelas | `/lecturer/...` | Dosen | tabs, form, modal, area unggah |
| S11 | Penilaian Tugas | `/lecturer/...` | Dosen | tabel, offcanvas panel nilai, form |
| S12 | Presensi | `/lecturer/...` | Dosen | kode besar (mono), hitung mundur, tabel, badge |
| S13 | Bobot dan Rekap Nilai | `/lecturer/...` | Dosen | input bobot (validasi total 100%), tabel, modal finalisasi |
| S14 | Data Mahasiswa | `/admin/students` | Admin | filter, tabel/kartu, pagination, badge |
| S15 | Tambah/Ubah Mahasiswa | `/admin/students/create` | Admin | form, alert, toast |
| S16 | Mata Kuliah dan Kelas | `/admin/classes` | Admin | tabel, modal, form |
| S17 | Pengumuman | `/announcements` | Semua | list-group, badge cakupan |
| S18 | Notifikasi | `/notifications` | Semua | list-group, penanda belum dibaca |
| S19 | Profil dan Kata Sandi | `/profile` | Semua | form, tabs |
| S20 | Laporan dan Audit Log | `/admin/reports` | Admin | filter, tabel, tombol ekspor |
| S21 | Halaman Galat 403/404/500 | — | Semua | pesan singkat, tombol kembali |

## 8. Wireframe Layar Kunci

### S01 — Login

```text
+----------------------------------------------------------+
|                                                          |
|                       PelitaLearn                        |
|             Universitas Pelita Bangsa - LMS              |
|                                                          |
|         +--------------------------------------+         |
|         | Masuk                                |         |
|         |                                      |         |
|         | NIM / NIDN / Email *                 |         |
|         | [ 24010101                         ] |         |
|         |                                      |         |
|         | Kata sandi *                         |         |
|         | [ ********               Tampilkan ] |         |
|         |                                      |         |
|         | [ ] Ingat saya      Lupa kata sandi? |         |
|         | [              Masuk               ] |         |
|         +--------------------------------------+         |
|                                                          |
+----------------------------------------------------------+
```

Catatan: satu aksi primer; tombol "Tampilkan" mengubah tipe input; galat login berupa alert di atas form yang menyebut penyebab dan langkah berikutnya.

### S03 — Dashboard Mahasiswa

```text
+--------------------------------------------------------------------+
| Halo, Naila!                                Senin, 19 Oktober 2026 |
|                                                                    |
| [ 3 Kelas aktif ]  [ 1 Tugas belum kumpul ]  [ 1 Kuis ]            |
|                                                                    |
| Jadwal hari ini                      | Tenggat terdekat            |
| ------------------------------------ | --------------------------- |
| 08:00 Pemrograman Visual             | 20 Okt  Kuis 1 (20 mnt)     |
|       Lab Komputer 2                 |   [Belum dibuka]            |
|                                      | 22 Okt  Normalisasi DB      |
| Pengumuman terbaru                   |   [Belum dikumpulkan]       |
| - Jadwal UTS 2-7 Nov 2026            | 25 Okt  Audit UI/UX         |
| - Pemeliharaan 25 Okt                |   [Dikumpulkan]             |
+--------------------------------------------------------------------+
```

Hierarki: tenggat terdekat adalah informasi paling berguna; kolom kanan di desktop (`col-lg-5`), menumpuk di bawah jadwal pada ponsel.

### S05 — Detail Kelas

```text
+--------------------------------------------------------------------+
| Kelas Saya / INF301-5A                                             |
| Pemrograman Visual                           [ Buka tautan kelas ] |
| Dr. Ahmad Fauzi, M.Kom. | Senin 08:00-10:30 | Lab Komputer 2       |
|                                                                    |
| [Ringkasan]  Materi  Tugas  Kuis  Forum  Presensi  Nilai           |
| ------------------------------------------------------------------ |
| Progres belajar: 4 dari 5 materi selesai                           |
| [================    ] 80%                                         |
|                                                                    |
| Pengumuman kelas                                                   |
| - Kuis 1 dibuka Selasa 20 Oktober 2026 (20 menit, 1 percobaan)     |
|                                                                    |
| Materi terbaru                                                     |
| P05  Rancang UI yang Jelas, Bukan Sekadar Cantik     [PDF] [Unduh] |
+--------------------------------------------------------------------+
```

### S06 — Detail Tugas dan Pengumpulan

```text
+---------------------------------------------------------------------+
| Kelas Saya / INF301-5A / Tugas                                      |
| Audit UI/UX Aplikasi Data Mahasiswa                                 |
| Tenggat: Minggu, 25 Okt 2026 23.59 WIB                [Dikumpulkan] |
|                                                                     |
| Instruksi                                | Pengumpulan Anda         |
| ---------------------------------------- | ------------------------ |
| Temukan 3 masalah UI/UX pada             | Berkas: audit-uiux.pdf   |
| tampilan lama aplikasi data              | Ukuran: 4 MB             |
| mahasiswa. Sertakan tangkapan            | Dikumpulkan: 17 Okt 2026 |
| layar dan alasan perbaikan.              | 20.14 WIB                |
|                                          |                          |
| Lampiran: Rubrik penilaian.pdf           | [ Kumpulkan ulang ]      |
| Nilai maks: 100                          | Nilai: belum dinilai     |
+---------------------------------------------------------------------+
```

Catatan: ini kondisi *setelah* mengumpulkan. Sebelum mengumpulkan, panel kanan berisi area pilih berkas (dengan batas 20 MB dan tipe yang diizinkan tertulis di `form-text`) dan tombol primer "Kumpulkan". Setelah tenggat, tombol berganti pesan sesuai kebijakan keterlambatan.

### S11 — Penilaian Tugas (Dosen)

```text
+----------------------------------------------------------------------+
| Penilaian: T-002 Audit UI/UX Aplikasi Data Mahasiswa                 |
| Kelas INF301-5A  -  2 dari 4 mahasiswa sudah mengumpulkan            |
|                                                                      |
| [ Cari NIM / nama ]  [ Semua status v ]                              |
|                                                                      |
| NIM       Nama           Status          Dikumpulkan   Nilai Aksi    |
| -------------------------------------------------------------------- |
| 24010101  Naila Putri    [Dikumpulkan]   17 Okt 20.14  --    [Nilai] |
| 24010102  Bima Arya      [Belum]         -             --    -       |
| 24020101  Rizky Pratama  [Belum]         -             --    -       |
| 24020102  Aulia Rahma    [Dikumpulkan]   18 Okt 09.05  --    [Nilai] |
+----------------------------------------------------------------------+
```

Catatan: tombol "Nilai" membuka panel *offcanvas* di sisi kanan berisi pratinjau berkas, kolom skor (0–100), kolom umpan balik, opsi "Minta revisi", dan tombol "Simpan nilai"; daftar tetap terlihat sehingga dosen dapat berpindah mahasiswa tanpa kembali ke halaman sebelumnya.

### S14 — Data Mahasiswa (Admin), desktop

```text
+--------------------------------------------------------------------+
| Data Mahasiswa                              [ + Tambah mahasiswa ] |
|                                                                    |
| [ Cari NIM / nama ]  [ Prodi v ]  [ Status v ]                     |
|                                                                    |
| NIM       Nama           Prodi             Status   Aksi           |
| ------------------------------------------------------------------ |
| 24010101  Naila Putri    Informatika       [Aktif]  Ubah           |
| 24010102  Bima Arya      Informatika       [Aktif]  Ubah           |
| 24010103  Sari Dewi      Informatika       [Cuti]   Ubah           |
| 24020101  Rizky Pratama  Sistem Informasi  [Aktif]  Ubah           |
|                                                                    |
| Menampilkan 1-4 dari 8                                     < 1 2 > |
+--------------------------------------------------------------------+
```

### S14 — Data Mahasiswa (Admin), mobile (< 768 px)

Tabel berubah menjadi daftar kartu karena ada aksi per baris.

```text
+--------------------------------+
| Data Mahasiswa                 |
| [ + Tambah mahasiswa ]         |
|                                |
| +----------------------------+ |
| | Naila Putri        [Aktif] | |
| | 24010101 - Informatika     | |
| | [ Ubah ]                   | |
| +----------------------------+ |
| +----------------------------+ |
| | Sari Dewi           [Cuti] | |
| | 24010103 - Informatika     | |
| | [ Ubah ]                   | |
| +----------------------------+ |
+--------------------------------+
```

### S15 — Tambah Mahasiswa (Admin)

```text
+--------------------------------------------+
| Tambah Mahasiswa                           |
|                                            |
| NIM *                                      |
| [ Contoh: 24010101                       ] |
|   Format: 8 digit angka                    |
|                                            |
| Nama lengkap *                             |
| [ Masukkan nama sesuai identitas         ] |
|                                            |
| Program studi *                            |
| [ Pilih program studi              v     ] |
|                                            |
| Status *                                   |
| (o) Aktif ( ) Cuti ( ) Lulus ( ) Nonaktif  |
|                                            |
| [ Batal ]                  [ Simpan data ] |
+--------------------------------------------+
```

Setelah berhasil: kembali ke S14 dengan toast "Data mahasiswa berhasil disimpan." dan baris baru disorot sebentar.

### Layar Dosen dan Lainnya (ringkas)

| Layar | Isi utama (urutan prioritas) |
|---|---|
| S09 Dashboard Dosen | Kartu: tugas perlu dinilai, kelas diampu, sesi presensi hari ini → tabel "Perlu dinilai" → pengumuman |
| S12 Presensi | Tombol "Buka sesi presensi" → kode besar (mis. `PV-7X4K`) dengan hitung mundur → daftar hadir waktu nyata → koreksi manual |
| S13 Bobot dan Rekap | Baris komponen + bobot dengan penjumlah "Total: 100%" (merah bila ≠ 100) → tabel nilai → tombol "Finalisasi" (modal konfirmasi) |
| S07 Kuis | Bilah atas: judul + penghitung waktu; navigasi nomor soal; satu soal per layar di ponsel; indikator "Tersimpan otomatis" |

## 9. Konten dan Microcopy

Nada: jelas, sopan, tidak bertele-tele; menyapa pengguna dengan **"Anda"**; kalimat aktif; tombol berupa kata kerja (hindari "OK" dan "Submit").

| Situasi | Teks contoh |
|---|---|
| Simpan data berhasil | "Data mahasiswa berhasil disimpan. Anda dapat menambah mahasiswa lain atau kembali ke daftar." |
| Tugas dikumpulkan | "Tugas berhasil dikumpulkan pada 17 Oktober 2026 pukul 20.14 WIB. Anda masih dapat mengumpulkan ulang sebelum tenggat." |
| NIM tidak valid | "NIM harus 8 digit angka, contoh: 24010101." |
| Berkas terlalu besar | "Ukuran berkas maksimal 20 MB. Kompres berkas lalu coba lagi." |
| Kode presensi salah | "Kode presensi tidak cocok. Periksa kode yang ditampilkan dosen, lalu coba lagi." |
| Akun terkunci | "Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit atau hubungi admin akademik." |
| Status Cuti | "Status Anda saat ini Cuti, sehingga kelas aktif tidak dapat dibuka. Hubungi admin akademik bila status ini keliru." |
| Data kosong | "Belum ada tugas untuk kelas ini. Tugas akan muncul di sini setelah dosen menerbitkannya." |
| Konfirmasi finalisasi | "Kunci nilai INF301-5A? Setelah dikunci, nilai hanya dapat diubah admin akademik dengan alasan tertulis." — tombol: **Kunci nilai** / Batal |
| Halaman 404 | "Halaman tidak ditemukan. Periksa alamatnya atau kembali ke Dashboard." |

Format: tanggal "25 Oktober 2026", jam "23.59 WIB" (tenggat selalu dengan zona), angka desimal koma ("90,50").

## 10. Aksesibilitas (WCAG 2.1 AA)

- **Kontras:** teks ≥ 4,5:1; komponen UI dan indikator ≥ 3:1 (lihat §3.1; teal terang bukan penanda tunggal).
- **Keyboard:** seluruh fungsi dapat dijangkau dengan Tab/Enter/Esc; urutan fokus logis; indikator fokus terlihat (`:focus-visible` jangan dihapus); *skip link* "Lompat ke konten" di awal halaman.
- **Formulir:** setiap input punya `label` terhubung (`for`/`id`); galat dihubungkan dengan `aria-describedby`; field wajib ditandai teks, bukan hanya warna.
- **Status:** badge dan alert berisi teks; alert dinamis memakai `role="alert"`, toast memakai `aria-live="polite"`.
- **Struktur:** satu `h1` per halaman, urutan heading tidak melompat; landmark `header`, `nav`, `main`, `aside`.
- **Tabel:** `<th scope="col">` dan `<caption>` (boleh `visually-hidden`); aksi baris punya nama jelas ("Ubah data Naila Putri").
- **Ikon dan gambar:** ikon informatif punya `aria-label`; dekoratif `aria-hidden="true"`.
- **Gerak dan waktu:** hormati `prefers-reduced-motion`; penghitung waktu kuis tidak hanya visual (pengumuman suara pada menit sisa 5 dan 1 melalui `aria-live`).
- **Zoom:** layout tetap dapat dipakai pada perbesaran 200% tanpa gulir horizontal halaman.

## 11. Responsivitas dan Pengujian

Gunakan DevTools (Device Toolbar) untuk mensimulasikan lebar layar, bukan mengecilkan jendela secara acak.

| Lebar acuan | Perangkat | Yang diperiksa |
|---|---|---|
| 360 × 800 | Android kecil | Tidak ada gulir horizontal halaman; target sentuh ≥ 44 px; tabel → kartu; form penuh lebar |
| 390 × 844 | iPhone | Navigasi bawah tidak menutupi konten; keyboard layar tidak menutupi tombol Simpan |
| 768 × 1024 | Tablet | Tabel tampil penuh; kartu 2 kolom |
| 992 × 768 | Laptop kecil | Sidebar tetap; grid dua kolom aktif |
| 1366 × 768 | Laptop umum | Baris teks tidak terlalu panjang; tabel tidak melebar berlebihan |
| 1920 × 1080 | Monitor | Konten dibatasi `container-xl`; ruang kosong terdistribusi wajar |

Uji ulang pada kondisi: data kosong, data sangat banyak (5.000 baris dengan paginasi), nama panjang, koneksi lambat (*Fast 3G*), dan zoom 200%.

## 12. Definition of Done — Checklist UI

Sebuah layar baru dianggap selesai jika:

| Prinsip | Pertanyaan pemeriksaan |
|---|---|
| Konsistensi | Memakai komponen dan badge standar? Tombol primer/batal di posisi yang sama? |
| Kejelasan | Label berupa kata kerja? Tenggat memuat tanggal lengkap + WIB? Tidak ada istilah teknis yang membingungkan? |
| Hierarki | Hanya satu aksi primer per bagian? Informasi terpenting muncul pertama? |
| Feedback | Setiap aksi penting menunjukkan hasil dan langkah berikutnya? Ada state memuat, kosong, dan galat? |
| Aksesibilitas | Lulus pemeriksaan keyboard, label, kontras, dan axe tanpa pelanggaran serius? |
| Responsivitas | Lulus uji pada lebar 360, 768, dan 1366 px? Tabel/kartu mengikuti aturan §6.2? |
| Kerapian kode | Kelas Bootstrap dipakai sebelum CSS khusus? Tidak ada gaya inline atau duplikasi markup selain pola tabel/kartu? |

## Lampiran — Kode Referensi

### A. Form Tambah Mahasiswa (S15)

```html
<div class="container py-4">
  <div class="row g-3">
    <div class="col-12 col-lg-8 col-xl-6">
      <form class="needs-validation card card-body p-3 p-lg-4" novalidate
            action="/admin/students" method="post">
        <h1 class="h3 mb-3">Tambah Mahasiswa</h1>

        <div class="mb-3">
          <label for="nim" class="form-label">
            NIM <span class="text-danger" aria-hidden="true">*</span>
            <span class="visually-hidden">(wajib diisi)</span>
          </label>
          <input id="nim" name="nim" class="form-control mono" required
                 inputmode="numeric" pattern="[0-9]{8}" maxlength="8"
                 placeholder="Contoh: 24010101" aria-describedby="nim-help">
          <div id="nim-help" class="form-text">Format: 8 digit angka.</div>
          <div class="invalid-feedback">NIM harus 8 digit angka, contoh: 24010101.</div>
        </div>

        <div class="mb-3">
          <label for="nama" class="form-label">
            Nama lengkap <span class="text-danger" aria-hidden="true">*</span>
            <span class="visually-hidden">(wajib diisi)</span>
          </label>
          <input id="nama" name="full_name" class="form-control" required
                 placeholder="Masukkan nama sesuai identitas">
          <div class="invalid-feedback">Nama lengkap wajib diisi.</div>
        </div>

        <div class="mb-3">
          <label for="prodi" class="form-label">
            Program studi <span class="text-danger" aria-hidden="true">*</span>
            <span class="visually-hidden">(wajib diisi)</span>
          </label>
          <select id="prodi" name="study_program_id" class="form-select" required>
            <option value="" selected disabled>Pilih program studi</option>
            <option value="1">Informatika</option>
            <option value="2">Sistem Informasi</option>
            <option value="3">Teknik Industri</option>
            <option value="4">Manajemen</option>
            <option value="5">Akuntansi</option>
          </select>
          <div class="invalid-feedback">Pilih salah satu program studi.</div>
        </div>

        <div class="d-flex flex-column-reverse flex-sm-row justify-content-sm-between gap-2">
          <a href="/admin/students" class="btn btn-outline-secondary">Batal</a>
          <button type="submit" class="btn btn-primary">Simpan data</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script>
  document.querySelectorAll('.needs-validation').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
        var first = form.querySelector(':invalid');
        if (first) first.focus();
      }
      form.classList.add('was-validated');
    });
  });
</script>
```

### B. Tabel dengan Badge dan Padanan Kartu di Ponsel (S14)

```html
<!-- Tabel: tablet ke atas -->
<div class="table-responsive d-none d-md-block">
  <table class="table table-hover align-middle bg-white">
    <caption class="visually-hidden">Daftar mahasiswa</caption>
    <thead class="table-light">
      <tr>
        <th scope="col">NIM</th><th scope="col">Nama</th>
        <th scope="col">Prodi</th><th scope="col">Status</th><th scope="col">Aksi</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="mono">24010101</td><td>Naila Putri</td><td>Informatika</td>
        <td><span class="badge rounded-pill text-bg-success">Aktif</span></td>
        <td><a href="/admin/students/1/edit" aria-label="Ubah data Naila Putri">Ubah</a></td>
      </tr>
      <tr>
        <td class="mono">24010103</td><td>Sari Dewi</td><td>Informatika</td>
        <td><span class="badge rounded-pill text-bg-warning">Cuti</span></td>
        <td><a href="/admin/students/3/edit" aria-label="Ubah data Sari Dewi">Ubah</a></td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Kartu: ponsel -->
<div class="d-md-none vstack gap-2">
  <div class="card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start">
        <h2 class="h6 mb-1">Naila Putri</h2>
        <span class="badge rounded-pill text-bg-success">Aktif</span>
      </div>
      <p class="mb-2 text-muted-upl"><span class="mono">24010101</span> · Informatika</p>
      <a class="btn btn-outline-secondary btn-sm" href="/admin/students/1/edit">Ubah</a>
    </div>
  </div>
</div>
```

### C. Alert dan Toast

```html
<!-- Alert kondisi akun (mahasiswa Cuti) -->
<div class="alert alert-warning" role="alert">
  <strong>Status Anda: Cuti.</strong> Kelas aktif tidak dapat dibuka.
  Hubungi admin akademik bila status ini keliru.
</div>

<!-- Toast sukses -->
<div class="toast-container position-fixed bottom-0 end-0 p-3">
  <div id="toast-simpan" class="toast text-bg-success border-0" role="status"
       aria-live="polite" aria-atomic="true" data-bs-delay="5000">
    <div class="d-flex">
      <div class="toast-body">Data mahasiswa berhasil disimpan.</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast" aria-label="Tutup"></button>
    </div>
  </div>
</div>
```

### D. Progres Kelas

```html
<div class="mb-1">Progres belajar: 4 dari 5 materi selesai</div>
<div class="progress" role="progressbar" aria-label="Progres belajar INF301-5A"
     aria-valuenow="80" aria-valuemin="0" aria-valuemax="100">
  <div class="progress-bar" style="width: 80%">80%</div>
</div>
```
