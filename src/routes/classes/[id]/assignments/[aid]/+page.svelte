<script lang="ts">
	import { page } from '$app/state';
	import { lms } from '$lib/store.svelte';
	import { formatDateTimeWib, formatScore, submissionStatusBadge } from '$lib/format';

	const classId = $derived(Number(page.params.id) || 1);
	const assignmentId = $derived(Number(page.params.aid) || 2);

	const courseClass = $derived(
		lms.courseClasses.find((c) => c.id === classId) ?? lms.courseClasses[0]
	);
	const course = $derived(lms.courses.find((c) => c.id === courseClass?.course_id));
	const assignment = $derived(
		lms.assignments.find((a) => a.id === assignmentId) ?? lms.assignments[1]
	);

	const student = $derived(lms.currentStudent);
	const currentEnrollment = $derived(
		student
			? lms.enrollments.find(
					(e) => e.course_class_id === courseClass.id && e.student_id === student.id
				) ?? lms.enrollments[0]
			: lms.enrollments[0]
	);

	const submission = $derived(
		lms.submissions.find(
			(s) => s.assignment_id === assignment.id && s.enrollment_id === currentEnrollment?.id
		)
	);

	const statusBadge = $derived(submissionStatusBadge(submission?.status ?? 'not_submitted'));

	let showUploadForm = $state(false);
	let selectedFileName = $state('audit-uiux-revisi.pdf');
	let selectedFileSizeMb = $state(4.0);
	let repoLink = $state('https://github.com/example/audit-uiux-naila');
	let textNotes = $state('');
	let simulateLateDays = $state(0);
	let fieldError = $state('');
	let successBanner = $state('');

	let fileInputEl: HTMLInputElement | undefined = $state();

	function handleFileSelected(e: Event) {
		fieldError = '';
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		selectedFileName = file.name;
		selectedFileSizeMb = Math.round((file.size / (1024 * 1024)) * 100) / 100 || 1.2;
	}

	function handleSubmitAssignment(e: SubmitEvent) {
		e.preventDefault();
		fieldError = '';
		successBanner = '';

		if (!currentEnrollment) return;

		const res = lms.validateAndSubmitAssignment({
			assignmentId: assignment.id,
			enrollmentId: currentEnrollment.id,
			fileName: selectedFileName,
			fileSizeMb: selectedFileSizeMb,
			link: repoLink,
			textContent: textNotes,
			simulateLateDays
		});

		if (!res.ok) {
			fieldError = res.error ?? 'Berkas tidak dapat diterima.';
			fileInputEl?.focus();
			return;
		}

		successBanner = res.message ?? '';
		showUploadForm = false;
	}

	function triggerOversizedFileTest() {
		showUploadForm = true;
		selectedFileName = 'video-rekaman-presentasi.pdf';
		selectedFileSizeMb = 25.4;
		successBanner = '';
		const res = lms.validateAndSubmitAssignment({
			assignmentId: assignment.id,
			enrollmentId: currentEnrollment?.id ?? 1,
			fileName: selectedFileName,
			fileSizeMb: selectedFileSizeMb,
			link: repoLink
		});
		if (!res.ok) {
			fieldError = res.error ?? '';
		}
	}
</script>

<svelte:head>
	<title>{assignment.title} (S06) — PelitaLearn</title>
</svelte:head>

<!-- Breadcrumb sesuai Wireframe S06 -->
<nav aria-label="Jejak halaman" class="mb-2">
	<ol class="breadcrumb mb-0 small">
		<li class="breadcrumb-item"><a href="/classes">Kelas Saya</a></li>
		<li class="breadcrumb-item">
			<a href="/classes/{courseClass.id}" class="mono">{courseClass.class_code}</a>
		</li>
		<li class="breadcrumb-item">
			<a href="/classes/{courseClass.id}?tab=tugas">Tugas</a>
		</li>
		<li class="breadcrumb-item active mono" aria-current="page">{assignment.code}</li>
	</ol>
</nav>

<!-- Header Tugas sesuai Wireframe S06 (desain.md §8) -->
<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-2 mb-4">
	<div>
		<h1 class="h2 mb-1">{assignment.title}</h1>
		<p class="text-muted-upl mb-0">
			Tenggat: <strong>Minggu, {formatDateTimeWib(assignment.due_at)}</strong>
		</p>
	</div>
	<div>
		<span class="badge rounded-pill {statusBadge.badgeClass} fs-6 px-3 py-2">
			{statusBadge.label}
		</span>
	</div>
</div>

{#if successBanner}
	<div class="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
		<i class="bi bi-check-circle-fill fs-5" aria-hidden="true"></i>
		<div>{successBanner}</div>
	</div>
{/if}

<!-- Susunan Grid S06 (desain.md §5.3): Instruksi col-12 col-lg-8; Panel pengumpulan col-12 col-lg-4 -->
<div class="row g-3">
	<!-- Kolom Kiri: Instruksi & Umpan Balik Dosen -->
	<div class="col-12 col-lg-8 vstack gap-3">
		<section class="card shadow-sm" aria-labelledby="heading-instruksi">
			<div class="card-body p-3 p-lg-4">
				<h2 id="heading-instruksi" class="h4 mb-3">Instruksi</h2>
				<p class="mb-3">{assignment.instructions}</p>

				<div class="row g-3 p-3 rounded-3 bg-light border mb-3">
					<div class="col-sm-6">
						<div class="small text-muted-upl">Lampiran panduan / rubrik</div>
						{#if assignment.attachment_name}
							<button
								type="button"
								class="btn btn-link p-0 fw-semibold text-decoration-none"
								onclick={() =>
									lms.addToast(`Mengunduh lampiran ${assignment.attachment_name}...`, 'info')}
							>
								<i class="bi bi-file-earmark-pdf text-danger me-1" aria-hidden="true"></i>
								{assignment.attachment_name}
							</button>
						{:else}
							<span>—</span>
						{/if}
					</div>
					<div class="col-sm-3">
						<div class="small text-muted-upl">Nilai maks</div>
						<div class="fw-bold tabular-nums">{assignment.max_score}</div>
					</div>
					<div class="col-sm-3">
						<div class="small text-muted-upl">Format berkas</div>
						<div class="fw-semibold">{assignment.submission_label}</div>
					</div>
				</div>

				<div class="small text-muted-upl">
					<strong>Kebijakan keterlambatan (BR-07):</strong>
					{#if assignment.late_policy === 'penalty'}
						Pengumpulan terlambat diizinkan maksimal {lms.appSettings.late_max_days} hari dengan penalti {lms.appSettings.late_penalty_per_day_percent}% per hari.
					{:else}
						Pengumpulan setelah tenggat ditolak otomatis oleh sistem.
					{/if}
				</div>
			</div>
		</section>

		{#if submission && (submission.score !== null || submission.feedback)}
			<section class="card border-success shadow-sm" aria-labelledby="heading-feedback">
				<div class="card-body p-3 p-lg-4">
					<div class="d-flex justify-content-between align-items-center mb-2">
						<h2 id="heading-feedback" class="h4 mb-0">Hasil Penilaian & Umpan Balik Dosen</h2>
						{#if submission.score !== null}
							<span class="badge rounded-pill text-bg-success fs-5 tabular-nums">
								Nilai: {formatScore(submission.score)} / {assignment.max_score}
							</span>
						{/if}
					</div>
					{#if submission.penalty_applied > 0}
						<div class="small text-warning-emphasis mb-2">
							Penalti keterlambatan diterapkan: -{submission.penalty_applied}%
						</div>
					{/if}
					<p class="mb-0 bg-light p-3 rounded-3 border">
						{submission.feedback || 'Belum ada catatan umpan balik tertulis.'}
					</p>
				</div>
			</section>
		{/if}

		{#if submission && submission.history.length > 0}
			<section class="card shadow-sm" aria-labelledby="heading-riwayat">
				<div class="card-body p-3 p-lg-4">
					<h2 id="heading-riwayat" class="h5 mb-2">Riwayat Versi Pengumpulan (BR-08)</h2>
					<p class="small text-muted-upl mb-3">
						Pengumpulan ulang menimpa versi aktif; sistem menyimpan maksimal 3 versi terakhir.
					</p>
					<div class="list-group list-group-flush">
						{#each submission.history as ver (ver.version)}
							<div class="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
								<div>
									<span class="badge rounded-pill text-bg-light border mono me-2">v{ver.version}</span>
									<strong class="small mono">{ver.file_name ?? 'Tautan'}</strong>
									{#if ver.file_size_mb}
										<span class="small text-muted-upl">({ver.file_size_mb} MB)</span>
									{/if}
								</div>
								<span class="small text-muted-upl">{formatDateTimeWib(ver.submitted_at, true)}</span>
							</div>
						{/each}
					</div>
				</div>
			</section>
		{/if}
	</div>

	<!-- Kolom Kanan: Panel Pengumpulan Anda (col-12 col-lg-4) -->
	<div class="col-12 col-lg-4">
		<section class="card shadow-sm" aria-labelledby="heading-pengumpulan">
			<div class="card-body p-3 p-lg-4">
				<h2 id="heading-pengumpulan" class="h4 mb-3">Pengumpulan Anda</h2>

				{#if submission && !showUploadForm}
					<!-- Tampilan setelah mengumpulkan (sesuai Wireframe S06 di desain.md) -->
					<div class="p-3 rounded-3 bg-light border mb-3">
						<div class="mb-2">
							<div class="small text-muted-upl">Berkas</div>
							<div class="fw-semibold mono">{submission.file_name ?? '—'}</div>
						</div>
						<div class="mb-2">
							<div class="small text-muted-upl">Ukuran</div>
							<div class="fw-medium">{submission.file_size_mb ?? 4} MB</div>
						</div>
						{#if submission.link}
							<div class="mb-2">
								<div class="small text-muted-upl">Tautan repositori / pratinjau</div>
								<a href={submission.link} target="_blank" rel="noopener noreferrer" class="small text-break">
									{submission.link}
								</a>
							</div>
						{/if}
						<div class="mb-2">
							<div class="small text-muted-upl">Dikumpulkan</div>
							<div class="fw-medium">{formatDateTimeWib(submission.submitted_at, true)}</div>
						</div>
						<div>
							<div class="small text-muted-upl">Nilai</div>
							<div class="fw-bold">
								{submission.score !== null ? `${formatScore(submission.score)} / 100` : 'belum dinilai'}
							</div>
						</div>
					</div>

					<button
						type="button"
						class="btn btn-primary w-100 mb-2"
						onclick={() => {
							fieldError = '';
							selectedFileSizeMb = 4.0;
							showUploadForm = true;
						}}
					>
						<i class="bi bi-arrow-repeat me-2" aria-hidden="true"></i>Kumpulkan ulang
					</button>
				{:else}
					<!-- Form Unggah Berkas Pengumpulan -->
					<form novalidate onsubmit={handleSubmitAssignment}>
						<div class="mb-3">
							<label for="file-upload" class="form-label">
								Pilih berkas tugas <span class="text-danger" aria-hidden="true">*</span>
								<span class="visually-hidden">(wajib diisi)</span>
							</label>
							<input
								bind:this={fileInputEl}
								id="file-upload"
								type="file"
								class="form-control {fieldError ? 'is-invalid' : ''}"
								accept=".pdf,.docx,.pptx,.xlsx,.zip,.jpg,.png,.txt"
								aria-describedby="file-help file-error"
								onchange={handleFileSelected}
							/>
							<div id="file-help" class="form-text">
								Batas maksimal {lms.appSettings.upload_max_assignment_mb} MB. Tipe diizinkan: PDF, DOCX, PPTX, XLSX, ZIP, JPG, PNG, TXT (BR-11).
							</div>
							{#if fieldError}
								<div id="file-error" class="invalid-feedback d-block" role="alert">
									{fieldError}
								</div>
							{/if}
						</div>

						<div class="mb-3">
							<label for="sim-filename" class="form-label small text-muted-upl">
								Nama berkas terpilih (dapat diubah untuk simulasi):
							</label>
							<div class="input-group input-group-sm">
								<input
									id="sim-filename"
									type="text"
									class="form-control mono"
									bind:value={selectedFileName}
								/>
								<span class="input-group-text">{selectedFileSizeMb} MB</span>
							</div>
						</div>

						<div class="mb-3">
							<label for="repo-link" class="form-label">Tautan pendukung / repositori</label>
							<input
								id="repo-link"
								type="url"
								class="form-control"
								placeholder="https://github.com/username/proyek"
								bind:value={repoLink}
							/>
						</div>

						<div class="d-flex flex-column-reverse flex-sm-row justify-content-sm-between gap-2 mt-4">
							{#if submission}
								<button
									type="button"
									class="btn btn-outline-secondary"
									onclick={() => {
										showUploadForm = false;
										fieldError = '';
									}}
								>
									Batal
								</button>
							{/if}
							<button type="submit" class="btn btn-primary flex-grow-1">
								Kumpulkan
							</button>
						</div>
					</form>
				{/if}

				<hr class="my-3" />
				<div class="d-flex justify-content-between align-items-center gap-2">
					<span class="small text-muted-upl">Uji validasi berkas &gt; 20 MB (AC-02):</span>
					<button
						type="button"
						class="btn btn-outline-danger btn-sm"
						onclick={triggerOversizedFileTest}
					>
						Simulasi Berkas 25 MB
					</button>
				</div>
			</div>
		</section>
	</div>
</div>

