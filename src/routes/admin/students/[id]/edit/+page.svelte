<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { lms } from '$lib/store.svelte';
	import type { StudentStatus } from '$lib/types';

	const studentId = $derived(Number(page.params.id) || 1);
	const existingStudent = $derived(
		lms.students.find((s) => s.id === studentId) ?? lms.students[0]
	);

	let nim = $state('');
	let fullName = $state('');
	let studyProgramId = $state('1');
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
	let statusReason = $state('');
	let submitted = $state(false);
	let serverError = $state('');

	$effect(() => {
		if (existingStudent) {
			nim = existingStudent.nim;
			fullName = existingStudent.full_name;
			studyProgramId = String(existingStudent.study_program_id);
			jenisKelas = existingStudent.jenis_kelas ?? 'Reguler';
			peminatan = existingStudent.peminatan ?? '';
			status = existingStudent.status;
			email = existingStudent.email;
			whatsapp = existingStudent.whatsapp ?? '';
			ttl = existingStudent.ttl ?? '';
			alamat = existingStudent.alamat ?? '';
			portfolio = existingStudent.portfolio ?? '';
			github = existingStudent.github ?? '';
			instagram = existingStudent.instagram ?? '';
			threads = existingStudent.threads ?? '';
		}
	});

	const isNimValid = $derived(/^[0-9]{8,9}$/.test(nim.trim()));
	const isNameValid = $derived(fullName.trim().length > 0);

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		submitted = true;
		serverError = '';

		if (!isNimValid || !isNameValid) return;

		const res = lms.saveStudent({
			id: existingStudent.id,
			nim,
			full_name: fullName,
			study_program_id: Number(studyProgramId),
			cohort_year: existingStudent.cohort_year,
			semester: existingStudent.semester,
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
			threads,
			avatar_url: existingStudent.avatar_url,
			reason: statusReason.trim() || 'Pembaruan data mahasiswa melalui S15'
		});

		if (!res.ok) {
			serverError = res.error ?? 'Gagal menyimpan perubahan.';
			return;
		}

		goto('/admin/students');
	}
</script>

<svelte:head>
	<title>Ubah Mahasiswa {existingStudent?.full_name} (S15) — Universitas Pelita Bangsa</title>
</svelte:head>

<nav aria-label="Jejak halaman" class="mb-2">
	<ol class="breadcrumb mb-0 small">
		<li class="breadcrumb-item"><a href="/admin/students">Data Mahasiswa</a></li>
		<li class="breadcrumb-item active" aria-current="page">Ubah Data Mahasiswa</li>
	</ol>
</nav>

<div class="row g-4">
	<div class="col-12 col-lg-8">
		<form
			class="needs-validation card card-body p-3 p-lg-4 shadow-sm"
			novalidate
			onsubmit={handleSubmit}
		>
			<div class="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
				{#if existingStudent?.avatar_url}
					<img
						src={existingStudent.avatar_url}
						alt={existingStudent.full_name}
						class="rounded-circle object-fit-cover border shadow-sm"
						style="width: 56px; height: 56px;"
					/>
				{/if}
				<div>
					<h1 class="h3 mb-0">Ubah Data Mahasiswa</h1>
					<p class="small text-muted-upl mb-0">
						Perbarui data akademik, kontak, peminatan, dan tautan sosial media mahasiswa.
					</p>
				</div>
			</div>

			{#if serverError}
				<div class="alert alert-danger" role="alert">{serverError}</div>
			{/if}

			<div class="row g-3">
				<div class="col-12 col-sm-6">
					<label for="nim-edit" class="form-label">
						NIM <span class="text-danger" aria-hidden="true">*</span>
						<span class="visually-hidden">(wajib diisi)</span>
					</label>
					<input
						id="nim-edit"
						name="nim"
						class="form-control mono {submitted && !isNimValid ? 'is-invalid' : ''}"
						required
						inputmode="numeric"
						maxlength="9"
						aria-describedby="nim-edit-help"
						bind:value={nim}
					/>
					<div id="nim-edit-help" class="form-text">Format: 8–9 digit angka.</div>
					<div class="invalid-feedback">NIM harus terdiri dari 8–9 digit angka, contoh: 312410466.</div>
				</div>

				<div class="col-12 col-sm-6">
					<label for="nama-edit" class="form-label">
						Nama lengkap <span class="text-danger" aria-hidden="true">*</span>
						<span class="visually-hidden">(wajib diisi)</span>
					</label>
					<input
						id="nama-edit"
						name="full_name"
						class="form-control {submitted && !isNameValid ? 'is-invalid' : ''}"
						required
						bind:value={fullName}
					/>
					<div class="invalid-feedback">Nama lengkap wajib diisi.</div>
				</div>

				<div class="col-12 col-sm-6">
					<label for="prodi-edit" class="form-label">
						Program studi <span class="text-danger" aria-hidden="true">*</span>
						<span class="visually-hidden">(wajib diisi)</span>
					</label>
					<select
						id="prodi-edit"
						name="study_program_id"
						class="form-select"
						required
						bind:value={studyProgramId}
					>
						{#each lms.studyPrograms as sp (sp.id)}
							<option value={String(sp.id)}>{sp.name}</option>
						{/each}
					</select>
				</div>

				<div class="col-12 col-sm-6">
					<label for="kelas-edit" class="form-label">Jenis kelas</label>
					<select id="kelas-edit" class="form-select" bind:value={jenisKelas}>
						<option value="Reguler">Reguler</option>
						<option value="Karyawan">Karyawan</option>
					</select>
				</div>

				<div class="col-12">
					<label for="peminatan-edit" class="form-label">Peminatan akademik</label>
					<select id="peminatan-edit" class="form-select" bind:value={peminatan}>
						<option value="">Pilih peminatan...</option>
						<option value="Software Engineering & Web Development">Software Engineering & Web Development</option>
						<option value="Mobile App Development">Mobile App Development</option>
						<option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
						<option value="Cybersecurity & Network Engineering">Cybersecurity & Network Engineering</option>
						<option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
					</select>
				</div>

				<div class="col-12 col-sm-6">
					<label for="email-edit" class="form-label">Email kampus</label>
					<input
						id="email-edit"
						type="email"
						class="form-control"
						bind:value={email}
					/>
				</div>

				<div class="col-12 col-sm-6">
					<label for="wa-edit" class="form-label">Nomor WhatsApp</label>
					<input
						id="wa-edit"
						type="tel"
						class="form-control"
						placeholder="081234567890"
						bind:value={whatsapp}
					/>
				</div>

				<div class="col-12 col-sm-6">
					<label for="ttl-edit" class="form-label">Tempat, tanggal lahir</label>
					<input
						id="ttl-edit"
						type="text"
						class="form-control"
						placeholder="Bekasi, 12 Agustus 2003"
						bind:value={ttl}
					/>
				</div>

				<div class="col-12 col-sm-6">
					<label for="alamat-edit" class="form-label">Alamat domisili</label>
					<input
						id="alamat-edit"
						type="text"
						class="form-control"
						placeholder="Cikarang Selatan, Kab. Bekasi"
						bind:value={alamat}
					/>
				</div>

				<div class="col-12 col-sm-4">
					<label for="github-edit" class="form-label">Link GitHub</label>
					<input
						id="github-edit"
						type="url"
						class="form-control"
						placeholder="https://github.com/username"
						bind:value={github}
					/>
				</div>

				<div class="col-12 col-sm-4">
					<label for="ig-edit" class="form-label">Link Instagram</label>
					<input
						id="ig-edit"
						type="url"
						class="form-control"
						placeholder="https://instagram.com/username"
						bind:value={instagram}
					/>
				</div>

				<div class="col-12 col-sm-4">
					<label for="threads-edit" class="form-label">Link Threads</label>
					<input
						id="threads-edit"
						type="url"
						class="form-control"
						placeholder="https://threads.net/@username"
						bind:value={threads}
					/>
				</div>
			</div>

			<fieldset class="my-4">
				<legend class="form-label">
					Status Akademik (BR-02) <span class="text-danger" aria-hidden="true">*</span>
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
								id="edit-status-{opt.value}"
								type="radio"
								name="status"
								class="form-check-input"
								value={opt.value}
								bind:group={status}
							/>
							<label for="edit-status-{opt.value}" class="form-check-label">{opt.label}</label>
						</div>
					{/each}
				</div>
				<div class="form-text">
					Perubahan status mahasiswa langsung menyesuaikan hak akses kelas dan dicatat di Audit Log (FR-AKD-07).
				</div>
			</fieldset>

			{#if status !== existingStudent?.status}
				<div class="mb-3">
					<label for="reason-status" class="form-label">
						Catatan / nomor SK perubahan status (untuk Audit Log)
					</label>
					<input
						id="reason-status"
						type="text"
						class="form-control"
						placeholder="Contoh: SK Dekan No. 145/FT-UPB/X/2026"
						bind:value={statusReason}
					/>
				</div>
			{/if}

			<div class="d-flex flex-column-reverse flex-sm-row justify-content-sm-between gap-2 mt-4 pt-2 border-top">
				<a href="/admin/students" class="btn btn-outline-secondary">Batal</a>
				<button type="submit" class="btn btn-primary">Simpan data</button>
			</div>
		</form>
	</div>
</div>
