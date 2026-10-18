<script lang="ts">
	import { lms } from '$lib/store.svelte';
	import { studentStatusBadge } from '$lib/format';
	import type { Student, StudentStatus } from '$lib/types';

	let searchQuery = $state('');
	let prodiFilter = $state('all');
	let statusFilter = $state('all');
	let currentPage = $state(1);
	const pageSize = 20;

	// State untuk Form Tambah Cepat pada Grid col-12 col-lg-4 (Sesuai Slide 6, 7, 9 P5)
	let quickNim = $state('');
	let quickName = $state('');
	let quickProdiId = $state('');
	let quickJenisKelas = $state<'Reguler' | 'Karyawan'>('Reguler');
	let quickPeminatan = $state('');
	let quickWhatsapp = $state('');
	let quickEmail = $state('');
	let quickStatus = $state<StudentStatus>('active');
	let quickSubmitted = $state(false);
	let quickError = $state('');

	let quickNimEl: HTMLInputElement | undefined = $state();
	let quickNameEl: HTMLInputElement | undefined = $state();
	let quickProdiEl: HTMLSelectElement | undefined = $state();

	const isQuickNimValid = $derived(/^[0-9]{8,9}$/.test(quickNim.trim()));
	const isQuickNameValid = $derived(quickName.trim().length > 0);
	const isQuickProdiValid = $derived(quickProdiId !== '');

	// Modal detail mahasiswa (untuk melihat data pelengkap & sosial media dari proyek lama)
	let selectedStudent = $state<Student | null>(null);
	let auditExpanded = $state(false);

	const totalStudents = $derived(lms.students.length);
	const activeStudentsCount = $derived(lms.students.filter((s) => s.status === 'active').length);
	const onLeaveStudentsCount = $derived(lms.students.filter((s) => s.status === 'on_leave').length);
	const arisStudent = $derived(lms.students.find((s) => s.nim === '312410466') ?? lms.students[0]);

	const filteredStudents = $derived.by(() => {
		return lms.students.filter((st) => {
			const q = searchQuery.trim().toLowerCase();
			const matchSearch =
				!q ||
				st.nim.toLowerCase().includes(q) ||
				st.full_name.toLowerCase().includes(q) ||
				(st.peminatan?.toLowerCase().includes(q) ?? false);
			const matchProdi =
				prodiFilter === 'all' || st.study_program_id === Number(prodiFilter);
			const matchStatus =
				statusFilter === 'all' || st.status === statusFilter;
			return matchSearch && matchProdi && matchStatus;
		});
	});

	const totalPages = $derived(Math.max(1, Math.ceil(filteredStudents.length / pageSize)));
	const pagedStudents = $derived(
		filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);

	function handleQuickAdd(e: SubmitEvent) {
		e.preventDefault();
		quickSubmitted = true;
		quickError = '';

		if (!isQuickNimValid) {
			quickNimEl?.focus();
			return;
		}
		if (!isQuickNameValid) {
			quickNameEl?.focus();
			return;
		}
		if (!isQuickProdiValid) {
			quickProdiEl?.focus();
			return;
		}

		const res = lms.saveStudent({
			nim: quickNim,
			full_name: quickName,
			study_program_id: Number(quickProdiId),
			cohort_year: 2024,
			semester: 5,
			status: quickStatus,
			email: quickEmail,
			whatsapp: quickWhatsapp,
			peminatan: quickPeminatan,
			jenis_kelas: quickJenisKelas
		});

		if (!res.ok) {
			quickError = res.error ?? 'Gagal menyimpan data mahasiswa.';
			quickNimEl?.focus();
			return;
		}

		// Reset form setelah berhasil disimpan
		quickNim = '';
		quickName = '';
		quickProdiId = '';
		quickJenisKelas = 'Reguler';
		quickPeminatan = '';
		quickWhatsapp = '';
		quickEmail = '';
		quickStatus = 'active';
		quickSubmitted = false;
	}

	function resetQuickForm() {
		quickNim = '';
		quickName = '';
		quickProdiId = '';
		quickJenisKelas = 'Reguler';
		quickPeminatan = '';
		quickWhatsapp = '';
		quickEmail = '';
		quickStatus = 'active';
		quickSubmitted = false;
		quickError = '';
	}

	// Modal Impor CSV Mahasiswa dengan pratinjau dan laporan galat per baris (FR-AKD-05)
	let csvModalOpen = $state(false);
	let csvRawText = $state(
		`24010104;Dina Lestari;INF;active;dina.lestari@mhs.pelitabangsa.ac.id\n24020103;Gilang Ramadhan;SI;active;gilang.r@mhs.pelitabangsa.ac.id\n240101;NIM Kurang Digit;INF;active;salah@mhs.pelitabangsa.ac.id`
	);

	const csvPreviewRows = $derived.by(() => {
		return csvRawText
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean)
			.map((line, index) => {
				const [nim = '', full_name = '', prodiCode = '', statusRaw = 'active', email = ''] =
					line.split(';').map((s) => s.trim());
				const prodi = lms.studyPrograms.find(
					(sp) => sp.code.toLowerCase() === prodiCode.toLowerCase()
				);
				const errors: string[] = [];
				if (!/^[0-9]{8,9}$/.test(nim)) {
					errors.push('NIM harus 8–9 digit angka');
				}
				if (lms.students.some((s) => s.nim === nim)) {
					errors.push('NIM sudah terdaftar');
				}
				if (!full_name) {
					errors.push('Nama lengkap kosong');
				}
				if (!prodi) {
					errors.push(`Kode prodi "${prodiCode}" tidak dikenal`);
				}
				const validStatuses = ['active', 'on_leave', 'graduated', 'inactive'];
				const status = (validStatuses.includes(statusRaw) ? statusRaw : 'active') as StudentStatus;
				return {
					rowNo: index + 1,
					nim,
					full_name,
					prodi,
					prodiCode,
					status,
					email,
					valid: errors.length === 0,
					errorText: errors.join(', ')
				};
			});
	});

	function commitCsvImport() {
		const validRows = csvPreviewRows.filter((r) => r.valid && r.prodi);
		if (validRows.length === 0) return;

		for (const row of validRows) {
			lms.saveStudent({
				nim: row.nim,
				full_name: row.full_name,
				study_program_id: row.prodi!.id,
				cohort_year: 2024,
				semester: 5,
				status: row.status,
				email: row.email
			});
		}

		lms.addAuditLog({
			action: 'student.csv_imported',
			subject_type: 'Student',
			subject_id: `${validRows.length} baris mahasiswa`,
			old_values: {},
			new_values: {
				imported: validRows.length,
				rejected: csvPreviewRows.length - validRows.length
			},
			reason: 'Impor data mahasiswa dari berkas CSV (FR-AKD-05)'
		});
		lms.persist();
		csvModalOpen = false;
		lms.addToast(
			`${validRows.length} data mahasiswa berhasil diimpor dari CSV.`,
			'success'
		);
	}
</script>

<svelte:head>
	<title>Daftar & Tambah Data Mahasiswa — Universitas Pelita Bangsa</title>
</svelte:head>

<!-- Header Utama (Sesuai Slide 5: Daftar Mahasiswa + Tombol "+ Tambah data") -->
<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
	<div class="d-flex align-items-center gap-3">
		<img
			src="/logo-universitas-pelita-bangsa-upb-png-svg.webp"
			alt="Logo Universitas Pelita Bangsa"
			class="rounded-3 bg-white p-1 border shadow-sm d-none d-sm-block"
			style="width: 52px; height: 52px; object-fit: contain;"
		/>
		<div>
			<div class="d-flex align-items-center gap-2 flex-wrap">
				<span class="badge rounded-pill text-bg-primary">Pertemuan 5 · Bootstrap 5.3</span>
				<span class="text-muted-upl small fw-medium">Sistem Informasi Akademik · FT UPB</span>
			</div>
			<h1 class="h2 mb-1 mt-1">Daftar Mahasiswa</h1>
			<p class="text-muted-upl mb-0 small">
				Komponen visual aplikasi data mahasiswa — dari grid responsif 12 kolom, form tervalidasi, tabel/kartu adaptif, badge status, hingga feedback kontekstual.
			</p>
		</div>
	</div>
	<div class="d-flex flex-wrap gap-2">
		<button
			type="button"
			class="btn btn-outline-secondary btn-sm"
			onclick={() => (auditExpanded = !auditExpanded)}
		>
			<i class="bi bi-journal-check me-1" aria-hidden="true"></i>
			{auditExpanded ? 'Sembunyikan' : 'Catatan 3 Perubahan Utama'}
		</button>
		<button
			type="button"
			class="btn btn-outline-primary btn-sm"
			onclick={() => (csvModalOpen = true)}
		>
			<i class="bi bi-file-earmark-arrow-up me-1" aria-hidden="true"></i>Impor CSV
		</button>
		<a href="/admin/students/create" class="btn btn-primary">
			+ Tambah data
		</a>
	</div>
</div>

<!-- Panel Catatan 3 Perubahan Utama (Audit UI/UX Proyek Lama vs Redesign Pertemuan 5) -->
{#if auditExpanded}
	<div class="card border-primary shadow-sm mb-4">
		<div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
			<div>
				<span class="badge text-bg-primary me-2">Deliverable P5</span>
				<strong class="h6 mb-0">Catatan 3 Perubahan Utama (Audit Proyek Lama vs Redesign Bootstrap 5)</strong>
			</div>
			<button
				type="button"
				class="btn-close"
				aria-label="Tutup panel audit"
				onclick={() => (auditExpanded = false)}
			></button>
		</div>
		<div class="card-body">
			<div class="row g-3">
				<div class="col-12 col-md-4">
					<div class="p-3 rounded-3 bg-light border h-100">
						<div class="d-flex align-items-center gap-2 mb-2">
							<span class="badge rounded-pill text-bg-primary">01</span>
							<h2 class="h6 mb-0">Struktur Grid & Hierarki Multi-Data</h2>
						</div>
						<p class="small text-muted-upl mb-2">
							<strong>Masalah Lama:</strong> Proyek sebelumnya (Tailwind Dark Monokrom) hanya menampilkan profil tunggal 1 mahasiswa (<em>Aris Maulana</em>) tanpa struktur daftar/tabel dan memakai <em>glassmorphism</em> gelap yang menurunkan kontras baca.
						</p>
						<p class="small mb-0">
							<strong>Perubahan Baru:</strong> Menerapkan sistem grid 12 kolom Bootstrap 5 (<code class="mono">col-12 col-lg-4</code> untuk Form &amp; <code class="mono">col-12 col-lg-8</code> untuk Daftar Mahasiswa) dengan kartu KPI ringkasan dan kontras tinggi sesuai standar WCAG 2.1 AA.
						</p>
					</div>
				</div>
				<div class="col-12 col-md-4">
					<div class="p-3 rounded-3 bg-light border h-100">
						<div class="d-flex align-items-center gap-2 mb-2">
							<span class="badge rounded-pill text-bg-primary">02</span>
							<h2 class="h6 mb-0">Pemilihan Komponen: Tabel Desktop &amp; Kartu Mobile</h2>
						</div>
						<p class="small text-muted-upl mb-2">
							<strong>Masalah Lama:</strong> Belum ada komponen tabel data mahasiswa, filter program studi/status, maupun badge status akademik (<code class="mono">Aktif</code>/<code class="mono">Cuti</code>).
						</p>
						<p class="small mb-0">
							<strong>Perubahan Baru:</strong> Menggunakan <code class="mono">.table-hover</code> dengan <code class="mono">.badge.rounded-pill</code> pada layar <code class="mono">≥768px</code> dan otomatis beralih menjadi <strong>Kartu Mahasiswa (<code class="mono">.card</code>)</strong> pada layar ponsel <code class="mono">&lt;768px</code> agar bebas geser horizontal.
						</p>
					</div>
				</div>
				<div class="col-12 col-md-4">
					<div class="p-3 rounded-3 bg-light border h-100">
						<div class="d-flex align-items-center gap-2 mb-2">
							<span class="badge rounded-pill text-bg-primary">03</span>
							<h2 class="h6 mb-0">Validasi Per-Field &amp; Feedback Kontekstual</h2>
						</div>
						<p class="small text-muted-upl mb-2">
							<strong>Masalah Lama:</strong> Tombol <em>Simpan Perubahan</em> langsung menyimpan ke <code class="mono">localStorage</code> tanpa validasi format NIM/wajib isi dan tanpa pesan error dekat input.
						</p>
						<p class="small mb-0">
							<strong>Perubahan Baru:</strong> Menambahkan penanda wajib (<code class="mono">*</code>), validasi format NIM 8–9 digit (<code class="mono">.is-invalid</code> + <code class="mono">.invalid-feedback</code> tepat di bawah input), pemisahan tombol utama/batal, serta <em>Alert Feedback</em> yang menjelaskan hasil aksi dan langkah berikutnya.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Alert Feedback Kontekstual (Sesuai Slide 8: "✓ Data mahasiswa berhasil disimpan. Feedback harus menjawab: apa yang terjadi dan apa langkah berikutnya?") -->
{#if lms.lastStudentSuccessMessage}
	<div
		class="alert alert-success alert-dismissible d-flex align-items-center justify-content-between gap-2 mb-4 shadow-sm"
		role="status"
	>
		<div class="d-flex align-items-center gap-2">
			<i class="bi bi-check-circle-fill fs-5" aria-hidden="true"></i>
			<div>
				<strong>Berhasil!</strong> {lms.lastStudentSuccessMessage}
			</div>
		</div>
		<button
			type="button"
			class="btn-close"
			aria-label="Tutup pesan konfirmasi"
			onclick={() => (lms.lastStudentSuccessMessage = '')}
		></button>
	</div>
{/if}

<!-- Kartu Ringkasan Statistik & Identitas Mahasiswa Utama (Sesuai Slide 5 + Integrasi Proyek Lama Aris Maulana) -->
<div class="row g-3 mb-4">
	<div class="col-6 col-lg-3">
		<div class="card shadow-sm h-100 border-0" style="background: var(--upl-teal-100);">
			<div class="card-body py-3">
				<div class="display-6 fw-bold mb-0" style="color: var(--upl-navy-900); font-family: 'Montserrat', sans-serif;">
					{totalStudents}
				</div>
				<div class="small fw-medium" style="color: var(--upl-teal-700);">
					total mahasiswa terdaftar
				</div>
			</div>
		</div>
	</div>
	<div class="col-6 col-lg-3">
		<div class="card shadow-sm h-100">
			<div class="card-body py-3">
				<div class="d-flex justify-content-between align-items-center">
					<div class="h2 fw-bold mb-0 text-success">{activeStudentsCount}</div>
					<span class="badge rounded-pill text-bg-success">Aktif</span>
				</div>
				<div class="small text-muted-upl mt-1">mahasiswa status aktif</div>
			</div>
		</div>
	</div>
	<div class="col-6 col-lg-3">
		<div class="card shadow-sm h-100">
			<div class="card-body py-3">
				<div class="d-flex justify-content-between align-items-center">
					<div class="h2 fw-bold mb-0 text-warning-emphasis">{onLeaveStudentsCount}</div>
					<span class="badge rounded-pill text-bg-warning">Cuti</span>
				</div>
				<div class="small text-muted-upl mt-1">mahasiswa sedang cuti</div>
			</div>
		</div>
	</div>
	<div class="col-6 col-lg-3">
		<div class="card shadow-sm h-100">
			<div class="card-body py-3">
				<div class="d-flex justify-content-between align-items-center">
					<div class="h2 fw-bold mb-0" style="color: var(--upl-navy-900);">{lms.studyPrograms.length}</div>
					<span class="badge rounded-pill text-bg-info">Prodi</span>
				</div>
				<div class="small text-muted-upl mt-1">program studi tersedia</div>
			</div>
		</div>
	</div>
</div>

<!-- Kartu Sorotan Mahasiswa Utama dari Proyek Sebelumnya (Aris Maulana - 312410466) -->
{#if arisStudent}
	<div class="card shadow-sm mb-4 border-start border-4" style="border-left-color: var(--upl-teal-700) !important;">
		<div class="card-body p-3">
			<div class="row g-3 align-items-center">
				<div class="col-12 col-md-7 d-flex align-items-center gap-3">
					<img
						src={arisStudent.avatar_url || '/foto-aris.jpg'}
						alt="Foto Profil {arisStudent.full_name}"
						class="rounded-circle object-fit-cover border border-2 shadow-sm flex-shrink-0"
						style="width: 60px; height: 60px;"
					/>
					<div>
						<div class="d-flex align-items-center gap-2 flex-wrap">
							<h2 class="h5 mb-0">{arisStudent.full_name}</h2>
							<span class="badge rounded-pill text-bg-success">Aktif</span>
							<span class="badge rounded-pill text-bg-light border">{arisStudent.jenis_kelas ?? 'Reguler'}</span>
						</div>
						<div class="small text-muted-upl mt-1">
							NIM: <strong class="mono text-dark">{arisStudent.nim}</strong> · Teknik Informatika (S1) · Semester {arisStudent.semester} / Angkatan {arisStudent.cohort_year}
						</div>
						{#if arisStudent.peminatan}
							<div class="small text-muted-upl">
								<i class="bi bi-code-slash me-1" aria-hidden="true"></i>Peminatan: <strong>{arisStudent.peminatan}</strong>
							</div>
						{/if}
					</div>
				</div>
				<div class="col-12 col-md-5 d-flex flex-wrap justify-content-md-end align-items-center gap-2">
					{#if arisStudent.github}
						<a
							href={arisStudent.github}
							target="_blank"
							rel="noopener noreferrer"
							class="btn btn-outline-secondary btn-sm"
							title="GitHub {arisStudent.full_name}"
						>
							<i class="bi bi-github me-1" aria-hidden="true"></i>GitHub
						</a>
					{/if}
					{#if arisStudent.instagram}
						<a
							href={arisStudent.instagram}
							target="_blank"
							rel="noopener noreferrer"
							class="btn btn-outline-secondary btn-sm"
							title="Instagram {arisStudent.full_name}"
						>
							<i class="bi bi-instagram me-1" aria-hidden="true"></i>Instagram
						</a>
					{/if}
					{#if arisStudent.whatsapp}
						<button
							type="button"
							class="btn btn-outline-primary btn-sm"
							onclick={() => (selectedStudent = arisStudent)}
						>
							<i class="bi bi-person-lines-fill me-1" aria-hidden="true"></i>Detail Profil
						</button>
					{/if}
					<a
						href="/admin/students/{arisStudent.id}/edit"
						class="btn btn-primary btn-sm"
					>
						<i class="bi bi-pencil-square me-1" aria-hidden="true"></i>Ubah Data
					</a>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Struktur Grid 12 Kolom Responsif (Sesuai Slide 6 & Slide 9: col-12 col-lg-4 Form + col-12 col-lg-8 Tabel/Kartu) -->
<div class="row g-4 align-items-start">
	<!-- KOLOM KIRI (col-12 col-lg-4): Form Tambah Mahasiswa (Sesuai Slide 6 & Slide 7) -->
	<div class="col-12 col-lg-4 order-2 order-lg-1">
		<div class="card shadow-sm">
			<div class="card-body p-3 p-lg-4">
				<div class="d-flex justify-content-between align-items-center mb-3">
					<h2 class="h4 mb-0">Tambah Mahasiswa</h2>
					<span class="badge text-bg-light border mono">col-12 col-lg-4</span>
				</div>
				<p class="small text-muted-upl mb-3">
					Label tetap terlihat; kolom bertanda <span class="text-danger fw-bold">*</span> wajib diisi.
				</p>

				{#if quickError}
					<div class="alert alert-danger py-2 small" role="alert">
						<i class="bi bi-exclamation-octagon-fill me-1" aria-hidden="true"></i>{quickError}
					</div>
				{/if}

				<form class="needs-validation" novalidate onsubmit={handleQuickAdd}>
					<!-- 01 Gunakan tipe input yang tepat & 02 Tandai field wajib secara jelas -->
					<div class="mb-3">
						<label for="quick-nim" class="form-label">
							NIM <span class="text-danger" aria-hidden="true">*</span>
							<span class="visually-hidden">(wajib diisi)</span>
						</label>
						<input
							bind:this={quickNimEl}
							id="quick-nim"
							name="nim"
							type="text"
							inputmode="numeric"
							maxlength="9"
							class="form-control mono {quickSubmitted && !isQuickNimValid ? 'is-invalid' : ''}"
							placeholder="Contoh: 312410466 atau 24010104"
							aria-describedby="quick-nim-help"
							bind:value={quickNim}
							required
						/>
						<div id="quick-nim-help" class="form-text">Format: 8–9 digit angka sesuai kartu mahasiswa.</div>
						<!-- 03 Validasi dekat dengan input -->
						<div class="invalid-feedback">
							NIM wajib diisi dengan 8–9 digit angka (contoh: 312410466).
						</div>
					</div>

					<div class="mb-3">
						<label for="quick-nama" class="form-label">
							Nama lengkap <span class="text-danger" aria-hidden="true">*</span>
							<span class="visually-hidden">(wajib diisi)</span>
						</label>
						<input
							bind:this={quickNameEl}
							id="quick-nama"
							name="full_name"
							type="text"
							class="form-control {quickSubmitted && !isQuickNameValid ? 'is-invalid' : ''}"
							placeholder="Masukkan nama sesuai identitas"
							bind:value={quickName}
							required
						/>
						<div class="invalid-feedback">
							Nama lengkap mahasiswa wajib diisi.
						</div>
					</div>

					<div class="mb-3">
						<label for="quick-prodi" class="form-label">
							Program studi <span class="text-danger" aria-hidden="true">*</span>
							<span class="visually-hidden">(wajib diisi)</span>
						</label>
						<select
							bind:this={quickProdiEl}
							id="quick-prodi"
							name="study_program_id"
							class="form-select {quickSubmitted && !isQuickProdiValid ? 'is-invalid' : ''}"
							bind:value={quickProdiId}
							required
						>
							<option value="" disabled>Pilih program studi</option>
							{#each lms.studyPrograms as sp (sp.id)}
								<option value={String(sp.id)}>{sp.name}</option>
							{/each}
						</select>
						<div class="invalid-feedback">
							Pilih salah satu program studi terlebih dahulu.
						</div>
					</div>

					<div class="row g-2 mb-3">
						<div class="col-6">
							<label for="quick-kelas" class="form-label">Jenis kelas</label>
							<select id="quick-kelas" class="form-select" bind:value={quickJenisKelas}>
								<option value="Reguler">Reguler</option>
								<option value="Karyawan">Karyawan</option>
							</select>
						</div>
						<div class="col-6">
							<label for="quick-status" class="form-label">Status</label>
							<select id="quick-status" class="form-select" bind:value={quickStatus}>
								<option value="active">Aktif</option>
								<option value="on_leave">Cuti</option>
								<option value="graduated">Lulus</option>
								<option value="inactive">Nonaktif</option>
							</select>
						</div>
					</div>

					<div class="mb-3">
						<label for="quick-peminatan" class="form-label">Peminatan akademik (opsional)</label>
						<select id="quick-peminatan" class="form-select" bind:value={quickPeminatan}>
							<option value="">Pilih peminatan...</option>
							<option value="Software Engineering & Web Development">Software Engineering & Web Development</option>
							<option value="Mobile App Development">Mobile App Development</option>
							<option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
							<option value="Cybersecurity & Network Engineering">Cybersecurity & Network Engineering</option>
							<option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
						</select>
					</div>

					<div class="mb-4">
						<label for="quick-wa" class="form-label">No. WhatsApp / Email (opsional)</label>
						<input
							id="quick-wa"
							type="tel"
							class="form-control"
							placeholder="Contoh: 081234567890"
							bind:value={quickWhatsapp}
						/>
					</div>

					<!-- 04 Bedakan aksi utama dan batal -->
					<div class="d-flex justify-content-between align-items-center gap-2">
						<button
							type="button"
							class="btn btn-outline-secondary"
							onclick={resetQuickForm}
						>
							Batal
						</button>
						<button type="submit" class="btn btn-primary flex-grow-1">
							<i class="bi bi-check2-circle me-1" aria-hidden="true"></i>Simpan data
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>

	<!-- KOLOM KANAN (col-12 col-lg-8): Filter + Tabel Desktop / Kartu Mobile (Sesuai Slide 6, 8, 9, 13) -->
	<div class="col-12 col-lg-8 order-1 order-lg-2">
		<!-- Filter Bar sesuai Wireframe S14 -->
		<div class="card shadow-sm mb-3">
			<div class="card-body p-3">
				<div class="d-flex justify-content-between align-items-center mb-2">
					<span class="small fw-semibold text-muted-upl">Pencarian &amp; Filter Data Mahasiswa</span>
					<span class="badge text-bg-light border mono">col-12 col-lg-8</span>
				</div>
				<div class="row g-2 align-items-center">
					<div class="col-12 col-md-5">
						<label for="search-s14" class="visually-hidden">Cari NIM atau nama mahasiswa</label>
						<div class="input-group">
							<span class="input-group-text bg-white text-muted-upl">
								<i class="bi bi-search" aria-hidden="true"></i>
							</span>
							<input
								id="search-s14"
								type="search"
								class="form-control"
								placeholder="Cari NIM / nama / peminatan..."
								bind:value={searchQuery}
							/>
						</div>
					</div>
					<div class="col-6 col-md-4">
						<label for="prodi-s14" class="visually-hidden">Filter program studi</label>
						<select id="prodi-s14" class="form-select" bind:value={prodiFilter}>
							<option value="all">Semua Prodi</option>
							{#each lms.studyPrograms as sp (sp.id)}
								<option value={String(sp.id)}>{sp.name}</option>
							{/each}
						</select>
					</div>
					<div class="col-6 col-md-3">
						<label for="status-s14" class="visually-hidden">Filter status mahasiswa</label>
						<select id="status-s14" class="form-select" bind:value={statusFilter}>
							<option value="all">Semua Status</option>
							<option value="active">Aktif</option>
							<option value="on_leave">Cuti</option>
							<option value="graduated">Lulus</option>
							<option value="inactive">Nonaktif</option>
						</select>
					</div>
				</div>
			</div>
		</div>

		{#if filteredStudents.length === 0}
			<!-- Empty State sesuai desain.md §6.4 -->
			<div class="card shadow-sm p-5 text-center">
				<i class="bi bi-people fs-1 text-muted-upl mb-2" aria-hidden="true"></i>
				<h2 class="h5 mb-1">Tidak Ada Data Mahasiswa yang Cocok</h2>
				<p class="text-muted-upl mb-3">
					Ubah kata kunci pencarian atau gunakan formulir di samping untuk menambah mahasiswa baru.
				</p>
				<div>
					<button
						type="button"
						class="btn btn-outline-secondary btn-sm"
						onclick={() => {
							searchQuery = '';
							prodiFilter = 'all';
							statusFilter = 'all';
						}}
					>
						Reset Filter
					</button>
				</div>
			</div>
		{:else}
			<!-- Tabel: Tablet ke atas (>= 768px) persis Slide 8 & desain.md Lampiran B -->
			<div class="table-responsive d-none d-md-block">
				<table class="table table-hover align-middle bg-white border rounded-3 shadow-sm mb-3">
					<caption class="visually-hidden">Daftar mahasiswa Universitas Pelita Bangsa</caption>
					<thead class="table-light">
						<tr>
							<th scope="col">NIM</th>
							<th scope="col">Nama</th>
							<th scope="col">Prodi</th>
							<th scope="col">Status</th>
							<th scope="col" class="text-end">Aksi</th>
						</tr>
					</thead>
					<tbody>
						{#each pagedStudents as st (st.id)}
							{@const prodi = lms.studyPrograms.find((sp) => sp.id === st.study_program_id)}
							{@const badge = studentStatusBadge(st.status)}
							<tr class={lms.highlightedStudentId === st.id ? 'row-highlight' : ''}>
								<td class="mono fw-semibold">{st.nim}</td>
								<td>
									<div class="d-flex align-items-center gap-2">
										{#if st.avatar_url}
											<img
												src={st.avatar_url}
												alt={st.full_name}
												class="rounded-circle object-fit-cover border"
												style="width: 32px; height: 32px;"
											/>
										{/if}
										<div>
											<div class="fw-medium">{st.full_name}</div>
											{#if st.peminatan}
												<div class="small text-muted-upl">{st.peminatan}</div>
											{/if}
										</div>
									</div>
								</td>
								<td>
									<div>{prodi?.name ?? '—'}</div>
									{#if st.jenis_kelas}
										<span class="small text-muted-upl">Kelas {st.jenis_kelas}</span>
									{/if}
								</td>
								<td>
									<span class="badge rounded-pill {badge.badgeClass}">{badge.label}</span>
								</td>
								<td class="text-end">
									<div class="d-inline-flex gap-1">
										<button
											type="button"
											class="btn btn-outline-primary btn-sm"
											onclick={() => (selectedStudent = st)}
											aria-label="Lihat detail {st.full_name}"
										>
											Detail
										</button>
										<a
											href="/admin/students/{st.id}/edit"
											class="btn btn-outline-secondary btn-sm"
											aria-label="Ubah data {st.full_name}"
										>
											Ubah
										</a>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Kartu: Ponsel (< 768px) persis Slide 13 & desain.md Lampiran B -->
			<div class="d-md-none vstack gap-2 mb-3">
				{#each pagedStudents as st (st.id)}
					{@const prodi = lms.studyPrograms.find((sp) => sp.id === st.study_program_id)}
					{@const badge = studentStatusBadge(st.status)}
					<div class="card shadow-sm {lms.highlightedStudentId === st.id ? 'card-highlight' : ''}">
						<div class="card-body">
							<div class="d-flex justify-content-between align-items-start mb-1">
								<div class="d-flex align-items-center gap-2">
									{#if st.avatar_url}
										<img
											src={st.avatar_url}
											alt={st.full_name}
											class="rounded-circle object-fit-cover border"
											style="width: 36px; height: 36px;"
										/>
									{/if}
									<div>
										<h2 class="h6 mb-0">{st.full_name}</h2>
										<small class="mono text-muted-upl">{st.nim}</small>
									</div>
								</div>
								<span class="badge rounded-pill {badge.badgeClass}">{badge.label}</span>
							</div>
							<p class="mb-2 small text-muted-upl mt-1">
								{prodi?.name ?? '—'} · Kelas {st.jenis_kelas ?? 'Reguler'}
								{#if st.peminatan}
									<br /><span>Peminatan: {st.peminatan}</span>
								{/if}
							</p>
							<div class="d-flex gap-2">
								<button
									type="button"
									class="btn btn-outline-primary btn-sm"
									onclick={() => (selectedStudent = st)}
								>
									Detail
								</button>
								<a
									class="btn btn-outline-secondary btn-sm"
									href="/admin/students/{st.id}/edit"
									aria-label="Ubah data {st.full_name}"
								>
									Ubah
								</a>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Pagination sesuai Wireframe S14 -->
			<div class="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
				<div class="small text-muted-upl">
					Menampilkan 1–{pagedStudents.length} dari {filteredStudents.length} mahasiswa
				</div>
				<nav aria-label="Navigasi halaman data mahasiswa">
					<ul class="pagination pagination-sm mb-0">
						<li class="page-item {currentPage === 1 ? 'disabled' : ''}">
							<button
								type="button"
								class="page-link"
								aria-label="Halaman sebelumnya"
								onclick={() => (currentPage = Math.max(1, currentPage - 1))}
							>
								&lt;
							</button>
						</li>
						{#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
							<li class="page-item {currentPage === p ? 'active' : ''}">
								<button type="button" class="page-link" onclick={() => (currentPage = p)}>
									{p}
								</button>
							</li>
						{/each}
						<li class="page-item {currentPage === totalPages ? 'disabled' : ''}">
							<button
								type="button"
								class="page-link"
								aria-label="Halaman berikutnya"
								onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
							>
								&gt;
							</button>
						</li>
					</ul>
				</nav>
			</div>
		{/if}
	</div>
</div>

<!-- Modal Detail Profil & Kelengkapan Data Mahasiswa (Integrasi dari Proyek Lama) -->
{#if selectedStudent}
	{@const sp = lms.studyPrograms.find((p) => p.id === selectedStudent?.study_program_id)}
	{@const b = studentStatusBadge(selectedStudent.status)}
	<div class="modal-backdrop fade show"></div>
	<div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="detail-mhs-title">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h2 id="detail-mhs-title" class="h5 modal-title">Detail &amp; Kelengkapan Data Mahasiswa</h2>
					<button
						type="button"
						class="btn-close"
						aria-label="Tutup"
						onclick={() => (selectedStudent = null)}
					></button>
				</div>
				<div class="modal-body">
					<div class="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
						{#if selectedStudent.avatar_url}
							<img
								src={selectedStudent.avatar_url}
								alt={selectedStudent.full_name}
								class="rounded-circle object-fit-cover border shadow-sm"
								style="width: 64px; height: 64px;"
							/>
						{:else}
							<div
								class="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
								style="width: 64px; height: 64px; background: var(--upl-navy-900); font-size: 1.4rem;"
							>
								{selectedStudent.full_name.charAt(0)}
							</div>
						{/if}
						<div>
							<h3 class="h5 mb-1">{selectedStudent.full_name}</h3>
							<div class="mono small text-muted-upl mb-1">NIM: {selectedStudent.nim}</div>
							<span class="badge rounded-pill {b.badgeClass}">{b.label}</span>
						</div>
					</div>

					<dl class="row small mb-0 g-2">
						<dt class="col-5 text-muted-upl">Program Studi</dt>
						<dd class="col-7 fw-medium">{sp?.name ?? '—'}</dd>

						<dt class="col-5 text-muted-upl">Semester / Angkatan</dt>
						<dd class="col-7">Semester {selectedStudent.semester} / {selectedStudent.cohort_year}</dd>

						<dt class="col-5 text-muted-upl">Jenis Kelas</dt>
						<dd class="col-7">{selectedStudent.jenis_kelas ?? 'Reguler'}</dd>

						<dt class="col-5 text-muted-upl">Peminatan</dt>
						<dd class="col-7">{selectedStudent.peminatan || '—'}</dd>

						<dt class="col-5 text-muted-upl">Email Kampus</dt>
						<dd class="col-7 text-break">{selectedStudent.email}</dd>

						<dt class="col-5 text-muted-upl">No. WhatsApp</dt>
						<dd class="col-7 mono">{selectedStudent.whatsapp || '—'}</dd>

						{#if selectedStudent.ttl}
							<dt class="col-5 text-muted-upl">Tempat, Tgl Lahir</dt>
							<dd class="col-7">{selectedStudent.ttl}</dd>
						{/if}

						{#if selectedStudent.alamat}
							<dt class="col-5 text-muted-upl">Alamat Domisili</dt>
							<dd class="col-7">{selectedStudent.alamat}</dd>
						{/if}
					</dl>

					{#if selectedStudent.github || selectedStudent.instagram || selectedStudent.threads || selectedStudent.portfolio}
						<div class="mt-3 pt-3 border-top">
							<div class="small fw-semibold text-muted-upl mb-2">Tautan Portofolio &amp; Sosial Media</div>
							<div class="d-flex flex-wrap gap-2">
								{#if selectedStudent.portfolio}
									<a href={selectedStudent.portfolio} target="_blank" rel="noopener noreferrer" class="btn btn-outline-secondary btn-sm">
										<i class="bi bi-globe me-1" aria-hidden="true"></i>Website
									</a>
								{/if}
								{#if selectedStudent.github}
									<a href={selectedStudent.github} target="_blank" rel="noopener noreferrer" class="btn btn-outline-secondary btn-sm">
										<i class="bi bi-github me-1" aria-hidden="true"></i>GitHub
									</a>
								{/if}
								{#if selectedStudent.instagram}
									<a href={selectedStudent.instagram} target="_blank" rel="noopener noreferrer" class="btn btn-outline-secondary btn-sm">
										<i class="bi bi-instagram me-1" aria-hidden="true"></i>Instagram
									</a>
								{/if}
								{#if selectedStudent.threads}
									<a href={selectedStudent.threads} target="_blank" rel="noopener noreferrer" class="btn btn-outline-secondary btn-sm">
										<i class="bi bi-threads me-1" aria-hidden="true"></i>Threads
									</a>
								{/if}
							</div>
						</div>
					{/if}
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-outline-secondary" onclick={() => (selectedStudent = null)}>
						Tutup
					</button>
					<a href="/admin/students/{selectedStudent.id}/edit" class="btn btn-primary">
						Ubah Data Mahasiswa
					</a>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Modal Impor CSV Mahasiswa dengan Pratinjau & Laporan Galat per Baris (FR-AKD-05) -->
{#if csvModalOpen}
	<div class="modal-backdrop fade show"></div>
	<div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="csv-modal-title">
		<div class="modal-dialog modal-lg modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h2 id="csv-modal-title" class="h5 modal-title">
						Impor CSV Data Mahasiswa (FR-AKD-05)
					</h2>
					<button
						type="button"
						class="btn-close"
						aria-label="Tutup"
						onclick={() => (csvModalOpen = false)}
					></button>
				</div>
				<div class="modal-body">
					<div class="mb-3">
						<label for="csv-input" class="form-label">
							Isi CSV (Format: <code class="mono">NIM;Nama Lengkap;Kode Prodi;Status;Email</code>)
						</label>
						<textarea
							id="csv-input"
							rows="4"
							class="form-control mono small"
							bind:value={csvRawText}
						></textarea>
						<div class="form-text">
							Contoh sengaja menyertakan 1 baris galat untuk mendemonstrasikan validasi per baris (FR-AKD-05).
						</div>
					</div>

					<h3 class="h6 mb-2">Pratinjau &amp; Laporan Validasi per Baris</h3>
					<div class="table-responsive">
						<table class="table table-sm table-bordered align-middle mb-0">
							<thead class="table-light">
								<tr>
									<th scope="col">Baris</th>
									<th scope="col">NIM</th>
									<th scope="col">Nama</th>
									<th scope="col">Prodi</th>
									<th scope="col">Status Validasi</th>
								</tr>
							</thead>
							<tbody>
								{#each csvPreviewRows as r (r.rowNo)}
									<tr class={r.valid ? '' : 'table-danger'}>
										<td class="mono">{r.rowNo}</td>
										<td class="mono">{r.nim}</td>
										<td>{r.full_name}</td>
										<td>{r.prodi?.name ?? r.prodiCode}</td>
										<td>
											{#if r.valid}
												<span class="badge rounded-pill text-bg-success">Siap diimpor</span>
											{:else}
												<span class="badge rounded-pill text-bg-danger">Galat: {r.errorText}</span>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
				<div class="modal-footer">
					<button
						type="button"
						class="btn btn-outline-secondary"
						onclick={() => (csvModalOpen = false)}
					>
						Batal
					</button>
					<button
						type="button"
						class="btn btn-primary"
						disabled={csvPreviewRows.filter((r) => r.valid).length === 0}
						onclick={commitCsvImport}
					>
						Impor {csvPreviewRows.filter((r) => r.valid).length} baris valid
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
