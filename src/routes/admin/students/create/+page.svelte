<script lang="ts">
	import { goto } from '$app/navigation';
	import { lms } from '$lib/store.svelte';
	import type { StudentStatus } from '$lib/types';

	let nim = $state('');
	let fullName = $state('');
	let studyProgramId = $state('');
	let jenisKelas = $state<'Reguler' | 'Karyawan'>('Reguler');
	let peminatan = $state('');
	let status = $state<StudentStatus>('active');
	let email = $state('');
	let whatsapp = $state('');
	let ttl = $state('');
	let alamat = $state('');
	let portfolio = $state('');
	let github = $state('');
	let instagram = $state('');
	let threads = $state('');

	let submitted = $state(false);
	let serverError = $state('');

	let nimInputEl: HTMLInputElement | undefined = $state();
	let nameInputEl: HTMLInputElement | undefined = $state();
	let prodiSelectEl: HTMLSelectElement | undefined = $state();

	const isNimValid = $derived(/^[0-9]{8,9}$/.test(nim.trim()));
	const isNameValid = $derived(fullName.trim().length > 0);
	const isProdiValid = $derived(studyProgramId !== '');

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		submitted = true;
		serverError = '';

		// Fokus ke field galat pertama sesuai desain.md §6.1 & Lampiran A
		if (!isNimValid) {
			nimInputEl?.focus();
			return;
		}
		if (!isNameValid) {
			nameInputEl?.focus();
			return;
		}
		if (!isProdiValid) {
			prodiSelectEl?.focus();
			return;
		}

		const res = lms.saveStudent({
			nim,
			full_name: fullName,
			study_program_id: Number(studyProgramId),
			cohort_year: 2024,
			semester: 5,
			status,
			email,
			whatsapp,
			peminatan,
			jenis_kelas: jenisKelas,
			ttl,
			alamat,
			portfolio,
			github,
			instagram,
			threads
		});

		if (!res.ok) {
			serverError = res.error ?? 'Gagal menyimpan data mahasiswa.';
			nimInputEl?.focus();
			return;
		}

		goto('/admin/students');
	}
</script>

<svelte:head>
	<title>Tambah Mahasiswa (S15) — Universitas Pelita Bangsa</title>
</svelte:head>

<nav aria-label="Jejak halaman" class="mb-2">
	<ol class="breadcrumb mb-0 small">
		<li class="breadcrumb-item"><a href="/admin/students">Data Mahasiswa</a></li>
		<li class="breadcrumb-item active" aria-current="page">Tambah Mahasiswa</li>
	</ol>
</nav>

<!-- Struktur Form persis mengacu pada Slide 7 Pertemuan 5 & desain.md §8 S15 -->
<div class="row g-4 align-items-start">
	<div class="col-12 col-lg-7">
		<form
			class="needs-validation card card-body p-3 p-lg-4 shadow-sm"
			novalidate
			onsubmit={handleSubmit}
		>
			<h1 class="h3 mb-1">Tambah Mahasiswa</h1>
			<p class="small text-muted-upl mb-3">
				Label tetap terlihat; placeholder hanya memberi contoh. Kolom bertanda <span class="text-danger fw-bold">*</span> wajib diisi.
			</p>

			{#if serverError}
				<div class="alert alert-danger" role="alert">{serverError}</div>
			{/if}

			<div class="row g-3">
				<div class="col-12 col-sm-6">
					<label for="nim" class="form-label">
						NIM <span class="text-danger" aria-hidden="true">*</span>
						<span class="visually-hidden">(wajib diisi)</span>
					</label>
					<input
						bind:this={nimInputEl}
						id="nim"
						name="nim"
						class="form-control mono {submitted && !isNimValid ? 'is-invalid' : ''}"
						required
						inputmode="numeric"
						maxlength="9"
						placeholder="Contoh: 312410466 / 24010101"
						aria-describedby="nim-help"
						bind:value={nim}
					/>
					<div id="nim-help" class="form-text">Format: 8–9 digit angka.</div>
					<div class="invalid-feedback">NIM harus terdiri dari 8–9 digit angka, contoh: 312410466.</div>
				</div>

				<div class="col-12 col-sm-6">
					<label for="nama" class="form-label">
						Nama lengkap <span class="text-danger" aria-hidden="true">*</span>
						<span class="visually-hidden">(wajib diisi)</span>
					</label>
					<input
						bind:this={nameInputEl}
						id="nama"
						name="full_name"
						class="form-control {submitted && !isNameValid ? 'is-invalid' : ''}"
						required
						placeholder="Masukkan nama sesuai identitas"
						bind:value={fullName}
					/>
					<div class="invalid-feedback">Nama lengkap wajib diisi.</div>
				</div>

				<div class="col-12 col-sm-6">
					<label for="prodi" class="form-label">
						Program studi <span class="text-danger" aria-hidden="true">*</span>
						<span class="visually-hidden">(wajib diisi)</span>
					</label>
					<select
						bind:this={prodiSelectEl}
						id="prodi"
						name="study_program_id"
						class="form-select {submitted && !isProdiValid ? 'is-invalid' : ''}"
						required
						bind:value={studyProgramId}
					>
						<option value="" disabled>Pilih program studi</option>
						{#each lms.studyPrograms as sp (sp.id)}
							<option value={String(sp.id)}>{sp.name}</option>
						{/each}
					</select>
					<div class="invalid-feedback">Pilih salah satu program studi.</div>
				</div>

				<div class="col-12 col-sm-6">
					<label for="jenis-kelas" class="form-label">Jenis kelas</label>
					<select id="jenis-kelas" class="form-select" bind:value={jenisKelas}>
						<option value="Reguler">Reguler</option>
						<option value="Karyawan">Karyawan</option>
					</select>
				</div>

				<div class="col-12">
					<label for="peminatan" class="form-label">Peminatan akademik (opsional)</label>
					<select id="peminatan" class="form-select" bind:value={peminatan}>
						<option value="">Pilih peminatan...</option>
						<option value="Software Engineering & Web Development">Software Engineering & Web Development</option>
						<option value="Mobile App Development">Mobile App Development</option>
						<option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
						<option value="Cybersecurity & Network Engineering">Cybersecurity & Network Engineering</option>
						<option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
					</select>
				</div>

				<div class="col-12 col-sm-6">
					<label for="email-mhs" class="form-label">Email kampus (opsional)</label>
					<input
						id="email-mhs"
						type="email"
						class="form-control"
						placeholder="Contoh: aris.maulana@mhs.pelitabangsa.ac.id"
						bind:value={email}
					/>
				</div>

				<div class="col-12 col-sm-6">
					<label for="wa-mhs" class="form-label">Nomor WhatsApp (opsional)</label>
					<input
						id="wa-mhs"
						type="tel"
						class="form-control"
						placeholder="Contoh: 081234567890"
						bind:value={whatsapp}
					/>
				</div>

				<div class="col-12 col-sm-6">
					<label for="ttl-mhs" class="form-label">Tempat, tanggal lahir (opsional)</label>
					<input
						id="ttl-mhs"
						type="text"
						class="form-control"
						placeholder="Contoh: Bekasi, 12 Agustus 2003"
						bind:value={ttl}
					/>
				</div>

				<div class="col-12 col-sm-6">
					<label for="portfolio-mhs" class="form-label">Link portofolio / GitHub (opsional)</label>
					<input
						id="portfolio-mhs"
						type="url"
						class="form-control"
						placeholder="https://github.com/username"
						bind:value={github}
					/>
				</div>
			</div>

			<fieldset class="my-4">
				<legend class="form-label">
					Status <span class="text-danger" aria-hidden="true">*</span>
					<span class="visually-hidden">(wajib diisi)</span>
				</legend>
				<div class="d-flex flex-wrap gap-3">
					{#each [
						{ value: 'active', label: 'Aktif' },
						{ value: 'on_leave', label: 'Cuti' },
						{ value: 'graduated', label: 'Lulus' },
						{ value: 'inactive', label: 'Nonaktif' }
					] as opt}
						<div class="form-check">
							<input
								id="status-{opt.value}"
								type="radio"
								name="status"
								class="form-check-input"
								value={opt.value}
								bind:group={status}
							/>
							<label for="status-{opt.value}" class="form-check-label">{opt.label}</label>
						</div>
					{/each}
				</div>
			</fieldset>

			<div class="d-flex flex-column-reverse flex-sm-row justify-content-sm-between gap-2 pt-2 border-top">
				<a href="/admin/students" class="btn btn-outline-secondary">Batal</a>
				<button type="submit" class="btn btn-primary">Simpan data</button>
			</div>
		</form>
	</div>

	<!-- Kolom Kanan: Checklist Cepat sesuai Slide 7 Pertemuan 5 -->
	<div class="col-12 col-lg-5">
		<div class="card border-0 shadow-sm" style="background: var(--upl-teal-100);">
			<div class="card-body p-4">
				<h2 class="h5 mb-3" style="color: var(--upl-navy-900);">
					<i class="bi bi-check2-all me-2" aria-hidden="true"></i>Checklist Cepat Form yang Baik (Pertemuan 5)
				</h2>
				<div class="vstack gap-3 small">
					<div class="d-flex gap-2">
						<span class="badge rounded-pill text-bg-primary align-self-start">01</span>
						<div>
							<strong>Gunakan tipe input yang tepat</strong>
							<div class="text-muted-upl">
								NIM menggunakan <code class="mono">inputmode="numeric"</code>, Program Studi memakai <code class="mono">&lt;select class="form-select"&gt;</code>, dan Status memakai radio button agar bebas salah ketik.
							</div>
						</div>
					</div>
					<div class="d-flex gap-2">
						<span class="badge rounded-pill text-bg-primary align-self-start">02</span>
						<div>
							<strong>Tandai field wajib secara jelas</strong>
							<div class="text-muted-upl">
								Seluruh label tetap terlihat di atas input dan memiliki tanda bintang merah (<span class="text-danger fw-bold">*</span>) serta teks pembaca layar.
							</div>
						</div>
					</div>
					<div class="d-flex gap-2">
						<span class="badge rounded-pill text-bg-primary align-self-start">03</span>
						<div>
							<strong>Validasi dekat dengan input</strong>
							<div class="text-muted-upl">
								Jika NIM bukan 8–9 digit angka atau Nama kosong, kelas <code class="mono">.is-invalid</code> dan pesan <code class="mono">.invalid-feedback</code> muncul tepat di bawah field terkait.
							</div>
						</div>
					</div>
					<div class="d-flex gap-2">
						<span class="badge rounded-pill text-bg-primary align-self-start">04</span>
						<div>
							<strong>Bedakan aksi utama dan batal</strong>
							<div class="text-muted-upl">
								Aksi utama memakai <code class="mono">.btn-primary</code> (<strong>Simpan data</strong>) dan aksi sekunder memakai <code class="mono">.btn-outline-secondary</code> (<strong>Batal</strong>).
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
