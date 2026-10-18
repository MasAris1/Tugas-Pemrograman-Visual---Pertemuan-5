<script lang="ts">
	import { page } from '$app/state';
	import { lms } from '$lib/store.svelte';
	import { formatDateShortId, formatDateTimeWib, materialStatusBadge } from '$lib/format';
	import type { LatePolicy, MaterialStatus } from '$lib/types';

	let selectedClassId = $state(Number(page.url.searchParams.get('class')) || 1);
	let activeTab = $state(page.url.searchParams.get('tab') || 'materi');

	const currentClass = $derived(
		lms.courseClasses.find((c) => c.id === selectedClassId) ?? lms.courseClasses[0]
	);
	const currentCourse = $derived(
		lms.courses.find((c) => c.id === currentClass?.course_id)
	);

	const classMaterials = $derived(
		lms.materials
			.filter((m) => m.course_class_id === selectedClassId)
			.sort((a, b) => a.meeting_no - b.meeting_no)
	);

	const classAssignments = $derived(
		lms.assignments.filter((a) => a.course_class_id === selectedClassId)
	);

	const classQuizzes = $derived(
		lms.quizzes.filter((q) => q.course_class_id === selectedClassId)
	);

	// Form Materi Baru (FR-MAT-01..02)
	let matMeetingNo = $state(7);
	let matTitle = $state('');
	let matDescription = $state('');
	let matFormat = $state<'PDF' | 'PPTX' | 'DOCX' | 'URL'>('PDF');
	let matFileName = $state('');
	let matFileSizeMb = $state(3.2);
	let matStatus = $state<MaterialStatus>('published');
	let matError = $state('');

	function handleSaveMaterial(e: SubmitEvent) {
		e.preventDefault();
		matError = '';
		if (!matTitle.trim()) {
			matError = 'Judul materi wajib diisi.';
			return;
		}
		if (matFileSizeMb > lms.appSettings.upload_max_material_mb) {
			matError = `Ukuran berkas materi maksimal ${lms.appSettings.upload_max_material_mb} MB (BR-11).`;
			return;
		}
		const code = `P${String(matMeetingNo).padStart(2, '0')}`;
		lms.saveMaterial({
			course_class_id: selectedClassId,
			meeting_no: Number(matMeetingNo),
			code,
			title: matTitle.trim(),
			description: matDescription.trim() || 'Materi perkuliahan mingguan.',
			type: matFormat === 'URL' ? 'link' : 'file',
			file_format: matFormat,
			file_name:
				matFileName.trim() || `${code}-${matTitle.trim().replace(/\s+/g, '-')}.${matFormat.toLowerCase()}`,
			file_size_mb: Number(matFileSizeMb),
			status: matStatus,
			publish_at: new Date().toISOString()
		});
		matMeetingNo += 1;
		matTitle = '';
		matDescription = '';
		matFileName = '';
	}

	function togglePublishMaterial(matId: number) {
		const m = lms.materials.find((item) => item.id === matId);
		if (!m) return;
		m.status = m.status === 'published' ? 'draft' : 'published';
		lms.persist();
		lms.addToast(
			`Status materi ${m.code} diubah menjadi ${m.status === 'published' ? 'Terbit' : 'Draft'}.`,
			'success'
		);
	}

	// Form Tugas Baru (FR-TGS-01 & FR-TGS-03)
	let asgTitle = $state('');
	let asgInstructions = $state('');
	let asgDueDate = $state('2026-11-08T23:59');
	let asgMaxScore = $state(100);
	let asgSubLabel = $state('PDF + tautan');
	let asgLatePolicy = $state<LatePolicy>('penalty');

	function handleCreateAssignment(e: SubmitEvent) {
		e.preventDefault();
		if (!asgTitle.trim() || !asgInstructions.trim()) return;
		const newId = Math.max(0, ...lms.assignments.map((a) => a.id)) + 1;
		const code = `T-${String(newId).padStart(3, '0')}`;
		lms.assignments.push({
			id: newId,
			code,
			course_class_id: selectedClassId,
			title: asgTitle.trim(),
			instructions: asgInstructions.trim(),
			attachment_name: 'Panduan-Tugas.pdf',
			due_at: `${asgDueDate}:00+07:00`,
			max_score: Number(asgMaxScore),
			submission_type: 'file_and_link',
			submission_label: asgSubLabel,
			late_policy: asgLatePolicy,
			status: 'published',
			publish_at: new Date().toISOString()
		});
		asgTitle = '';
		asgInstructions = '';
		lms.persist();
		lms.addToast(`Tugas ${code} berhasil diterbitkan untuk kelas ${currentClass.class_code}.`, 'success');
	}

	// Form Soal Kuis Baru (FR-KUI-01)
	let qBody = $state('');
	let qOptA = $state('');
	let qOptB = $state('');
	let qOptC = $state('');
	let qOptD = $state('');
	let qAnswerKey = $state('A');

	function handleAddQuestion(e: SubmitEvent) {
		e.preventDefault();
		if (!qBody.trim() || !qOptA.trim() || !qOptB.trim()) return;
		const targetQuiz = classQuizzes[0] ?? lms.quizzes[0];
		const newId = Math.max(0, ...lms.quizQuestions.map((q) => q.id)) + 1;
		lms.quizQuestions.push({
			id: newId,
			quiz_id: targetQuiz.id,
			type: 'mcq',
			body: qBody.trim(),
			options: [
				{ key: 'A', text: qOptA.trim() },
				{ key: 'B', text: qOptB.trim() },
				{ key: 'C', text: qOptC.trim() || 'Semua benar' },
				{ key: 'D', text: qOptD.trim() || 'Tidak ada yang benar' }
			],
			answer_key: qAnswerKey,
			points: 10
		});
		qBody = '';
		qOptA = '';
		qOptB = '';
		qOptC = '';
		qOptD = '';
		lms.persist();
		lms.addToast('Soal baru berhasil ditambahkan ke Bank Soal Kuis.', 'success');
	}
</script>

<svelte:head>
	<title>Kelola Konten Kelas (S10) — PelitaLearn</title>
</svelte:head>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
	<div>
		<h1 class="h2 mb-1">Kelola Konten Kelas</h1>
		<p class="text-muted-upl mb-0">
			Unggah materi per pertemuan, buat tugas baru (≤ 3 menit), dan kelola bank soal kuis.
		</p>
	</div>

	<div class="d-flex align-items-center gap-2">
		<label for="select-class-s10" class="form-label mb-0 small fw-semibold text-nowrap">Kelas:</label>
		<select id="select-class-s10" class="form-select mono" bind:value={selectedClassId}>
			{#each lms.courseClasses as cls (cls.id)}
				{@const crs = lms.courses.find((c) => c.id === cls.course_id)}
				<option value={cls.id}>{cls.class_code} — {crs?.name}</option>
			{/each}
		</select>
	</div>
</div>

<ul class="nav nav-tabs flex-nowrap overflow-auto mb-4" role="tablist">
	<li class="nav-item" role="presentation">
		<button
			type="button"
			class="nav-link {activeTab === 'materi' ? 'active' : ''}"
			onclick={() => (activeTab = 'materi')}
		>
			<i class="bi bi-file-earmark-slides" aria-hidden="true"></i>
			<span>Materi Pertemuan ({classMaterials.length})</span>
		</button>
	</li>
	<li class="nav-item" role="presentation">
		<button
			type="button"
			class="nav-link {activeTab === 'tugas' ? 'active' : ''}"
			onclick={() => (activeTab = 'tugas')}
		>
			<i class="bi bi-file-earmark-check" aria-hidden="true"></i>
			<span>Tugas ({classAssignments.length})</span>
		</button>
	</li>
	<li class="nav-item" role="presentation">
		<button
			type="button"
			class="nav-link {activeTab === 'kuis' ? 'active' : ''}"
			onclick={() => (activeTab = 'kuis')}
		>
			<i class="bi bi-patch-question" aria-hidden="true"></i>
			<span>Bank Soal & Kuis</span>
		</button>
	</li>
</ul>

{#if activeTab === 'materi'}
	<div class="row g-3">
		<div class="col-12 col-lg-7">
			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h4 mb-3">Daftar Materi {currentClass.class_code}</h2>
					<div class="vstack gap-2">
						{#each classMaterials as mat (mat.id)}
							{@const b = materialStatusBadge(mat.status)}
							<div class="p-3 rounded-3 border d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
								<div>
									<div class="d-flex align-items-center gap-2 mb-1">
										<span class="mono fw-bold text-primary">{mat.code}</span>
										<span class="badge rounded-pill text-bg-light border">{mat.file_format}</span>
										<span class="badge rounded-pill {b.badgeClass}">{b.label}</span>
									</div>
									<div class="fw-semibold">{mat.title}</div>
									<div class="small text-muted-upl mono">
										{mat.file_name} ({mat.file_size_mb} MB)
									</div>
								</div>
								<div class="d-flex gap-2 flex-shrink-0">
									<button
										type="button"
										class="btn {mat.status === 'published' ? 'btn-outline-secondary' : 'btn-primary'} btn-sm"
										onclick={() => togglePublishMaterial(mat.id)}
									>
										{mat.status === 'published' ? 'Jadikan Draft' : 'Terbitkan Materi'}
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<div class="col-12 col-lg-5">
			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h4 mb-3">Unggah Materi Baru (FR-MAT-01)</h2>
					{#if matError}
						<div class="alert alert-danger" role="alert">{matError}</div>
					{/if}
					<form onsubmit={handleSaveMaterial} novalidate>
						<div class="row g-2 mb-3">
							<div class="col-5">
								<label for="mat-meeting" class="form-label">Pertemuan ke-</label>
								<input
									id="mat-meeting"
									type="number"
									min="1"
									max="16"
									class="form-control mono"
									bind:value={matMeetingNo}
									required
								/>
							</div>
							<div class="col-7">
								<label for="mat-format" class="form-label">Tipe materi</label>
								<select id="mat-format" class="form-select" bind:value={matFormat}>
									<option value="PDF">Dokumen PDF</option>
									<option value="PPTX">Slide Presentasi PPTX</option>
									<option value="DOCX">Modul DOCX</option>
									<option value="URL">Tautan Video / URL</option>
								</select>
							</div>
						</div>

						<div class="mb-3">
							<label for="mat-title" class="form-label">
								Judul materi <span class="text-danger" aria-hidden="true">*</span>
								<span class="visually-hidden">(wajib diisi)</span>
							</label>
							<input
								id="mat-title"
								type="text"
								class="form-control"
								placeholder="Contoh: Komponen Modal, Toast, dan Offcanvas"
								bind:value={matTitle}
								required
							/>
						</div>

						<div class="mb-3">
							<label for="mat-desc" class="form-label">Ringkasan materi</label>
							<textarea
								id="mat-desc"
								rows="2"
								class="form-control"
								placeholder="Penjelasan singkat isi pertemuan..."
								bind:value={matDescription}
							></textarea>
						</div>

						<div class="mb-3">
							<label for="mat-status" class="form-label">Status visibilitas (FR-MAT-02)</label>
							<select id="mat-status" class="form-select" bind:value={matStatus}>
								<option value="published">Terbit langsung</option>
								<option value="draft">Draft (sembunyikan dari mahasiswa)</option>
								<option value="scheduled">Terjadwal terbit</option>
							</select>
							<div class="form-text">Batas unggah materi maksimal 100 MB per berkas (BR-11).</div>
						</div>

						<button type="submit" class="btn btn-primary w-100">Simpan materi</button>
					</form>
				</div>
			</div>
		</div>
	</div>
{:else if activeTab === 'tugas'}
	<div class="row g-3">
		<div class="col-12 col-lg-7">
			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h4 mb-3">Daftar Tugas {currentClass.class_code}</h2>
					<div class="vstack gap-2">
						{#each classAssignments as asg (asg.id)}
							<div class="p-3 rounded-3 border d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
								<div>
									<div class="d-flex align-items-center gap-2 mb-1">
										<span class="mono fw-bold text-primary">{asg.code}</span>
										<span class="badge rounded-pill text-bg-light border">{asg.submission_label}</span>
										<span class="badge rounded-pill {asg.late_policy === 'penalty' ? 'text-bg-warning' : 'text-bg-danger'}">
											{asg.late_policy === 'penalty' ? 'Terlambat: Penalti 10%/hari' : 'Terlambat: Tolak'}
										</span>
									</div>
									<div class="fw-semibold">{asg.title}</div>
									<div class="small text-muted-upl">
										Tenggat: {formatDateTimeWib(asg.due_at)}
									</div>
								</div>
								<a
									href="/lecturer/grading?assignment={asg.id}"
									class="btn btn-outline-primary btn-sm flex-shrink-0"
								>
									Buka Penilaian (S11)
								</a>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<div class="col-12 col-lg-5">
			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h4 mb-3">Buat Tugas Baru (FR-TGS-01)</h2>
					<form onsubmit={handleCreateAssignment}>
						<div class="mb-3">
							<label for="asg-title" class="form-label">
								Judul tugas <span class="text-danger" aria-hidden="true">*</span>
								<span class="visually-hidden">(wajib diisi)</span>
							</label>
							<input
								id="asg-title"
								type="text"
								class="form-control"
								placeholder="Contoh: Implementasi Tabel Responsif & Kartu Mobile"
								bind:value={asgTitle}
								required
							/>
						</div>

						<div class="mb-3">
							<label for="asg-inst" class="form-label">
								Instruksi pengerjaan <span class="text-danger" aria-hidden="true">*</span>
								<span class="visually-hidden">(wajib diisi)</span>
							</label>
							<textarea
								id="asg-inst"
								rows="3"
								class="form-control"
								placeholder="Tuliskan rincian tugas dan kriteria penilaian..."
								bind:value={asgInstructions}
								required
							></textarea>
						</div>

						<div class="row g-2 mb-3">
							<div class="col-7">
								<label for="asg-due" class="form-label">Tenggat (WIB)</label>
								<input
									id="asg-due"
									type="datetime-local"
									class="form-control"
									bind:value={asgDueDate}
									required
								/>
							</div>
							<div class="col-5">
								<label for="asg-max" class="form-label">Nilai maks</label>
								<input
									id="asg-max"
									type="number"
									class="form-control tabular-nums"
									bind:value={asgMaxScore}
									required
								/>
							</div>
						</div>

						<div class="mb-3">
							<label for="asg-policy" class="form-label">Kebijakan keterlambatan (FR-TGS-03)</label>
							<select id="asg-policy" class="form-select" bind:value={asgLatePolicy}>
								<option value="penalty">Izinkan dengan penalti 10% per hari (maks 3 hari)</option>
								<option value="reject">Tolak pengumpulan setelah melewati tenggat</option>
							</select>
						</div>

						<button type="submit" class="btn btn-primary w-100">Terbitkan tugas</button>
					</form>
				</div>
			</div>
		</div>
	</div>
{:else}
	<!-- TAB BANK SOAL & KUIS (FR-KUI-01) -->
	<div class="row g-3">
		<div class="col-12 col-lg-7">
			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h4 mb-3">Bank Soal Kuis 1 ({lms.quizQuestions.length} Soal)</h2>
					<div class="vstack gap-2">
						{#each lms.quizQuestions as q, idx (q.id)}
							<div class="p-3 rounded-3 border">
								<div class="d-flex justify-content-between mb-1">
									<span class="fw-bold small">Soal #{idx + 1}</span>
									<span class="badge rounded-pill text-bg-success mono">Kunci: {q.answer_key} ({q.points} poin)</span>
								</div>
								<div class="fw-medium mb-2">{q.body}</div>
								<div class="row g-1 small text-muted-upl">
									{#each q.options as opt}
										<div class="col-sm-6">
											<span class="mono fw-bold">{opt.key}.</span> {opt.text}
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<div class="col-12 col-lg-5">
			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h4 mb-3">Tambah Soal ke Bank Soal</h2>
					<form onsubmit={handleAddQuestion}>
						<div class="mb-3">
							<label for="q-body" class="form-label">Pertanyaan *</label>
							<textarea
								id="q-body"
								rows="2"
								class="form-control"
								placeholder="Tuliskan pertanyaan pilihan ganda..."
								bind:value={qBody}
								required
							></textarea>
						</div>
						<div class="mb-2">
							<label for="q-a" class="form-label small">Opsi A *</label>
							<input id="q-a" type="text" class="form-control" bind:value={qOptA} required />
						</div>
						<div class="mb-2">
							<label for="q-b" class="form-label small">Opsi B *</label>
							<input id="q-b" type="text" class="form-control" bind:value={qOptB} required />
						</div>
						<div class="mb-2">
							<label for="q-c" class="form-label small">Opsi C</label>
							<input id="q-c" type="text" class="form-control" bind:value={qOptC} />
						</div>
						<div class="mb-3">
							<label for="q-d" class="form-label small">Opsi D</label>
							<input id="q-d" type="text" class="form-control" bind:value={qOptD} />
						</div>
						<div class="mb-3">
							<label for="q-key" class="form-label">Kunci Jawaban Benar</label>
							<select id="q-key" class="form-select mono" bind:value={qAnswerKey}>
								<option value="A">Opsi A</option>
								<option value="B">Opsi B</option>
								<option value="C">Opsi C</option>
								<option value="D">Opsi D</option>
							</select>
						</div>
						<button type="submit" class="btn btn-primary w-100">Simpan soal</button>
					</form>
				</div>
			</div>
		</div>
	</div>
{/if}

