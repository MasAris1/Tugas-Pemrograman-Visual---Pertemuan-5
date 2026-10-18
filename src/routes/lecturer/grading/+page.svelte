<script lang="ts">
	import { page } from '$app/state';
	import { lms } from '$lib/store.svelte';
	import { formatDateTimeWib, formatScore, submissionStatusBadge } from '$lib/format';

	let selectedAssignmentId = $state(Number(page.url.searchParams.get('assignment')) || 2);
	let searchQuery = $state('');
	let statusFilter = $state('all');

	const assignment = $derived(
		lms.assignments.find((a) => a.id === selectedAssignmentId) ?? lms.assignments[1]
	);
	const courseClass = $derived(
		lms.courseClasses.find((c) => c.id === assignment?.course_class_id) ?? lms.courseClasses[0]
	);

	const classEnrollments = $derived(
		lms.enrollments.filter((e) => e.course_class_id === courseClass.id)
	);

	const studentRows = $derived.by(() => {
		return classEnrollments
			.map((enr) => {
				const student = lms.students.find((s) => s.id === enr.student_id);
				const sub = lms.submissions.find(
					(s) => s.assignment_id === assignment.id && s.enrollment_id === enr.id
				);
				const status = sub?.status ?? 'not_submitted';
				const badge = submissionStatusBadge(status);
				return { enr, student, sub, status, badge };
			})
			.filter((row) => {
				if (!row.student) return false;
				const q = searchQuery.trim().toLowerCase();
				const matchSearch =
					!q ||
					row.student.nim.toLowerCase().includes(q) ||
					row.student.full_name.toLowerCase().includes(q);
				const matchStatus = statusFilter === 'all' || row.status === statusFilter;
				return matchSearch && matchStatus;
			});
	});

	const submittedCount = $derived(
		classEnrollments.filter((enr) =>
			lms.submissions.some(
				(s) => s.assignment_id === assignment.id && s.enrollment_id === enr.id
			)
		).length
	);

	// Offcanvas Panel Penilaian (desain.md §8 S11)
	let activeRowIndex = $state<number | null>(null);
	let gradeScoreInput = $state(90);
	let gradeFeedbackInput = $state('');
	let requestRevisionInput = $state(false);

	const activeRow = $derived(
		activeRowIndex !== null ? studentRows[activeRowIndex] ?? null : null
	);

	function openGradingPanel(idx: number) {
		const row = studentRows[idx];
		if (!row) return;
		activeRowIndex = idx;
		gradeScoreInput = row.sub?.score ?? 90;
		gradeFeedbackInput =
			row.sub?.feedback ||
			'Temuan masalah UI/UX sudah tepat dan mengacu pada prinsip konsistensi serta aksesibilitas.';
		requestRevisionInput = row.sub?.status === 'revision';
	}

	function handleSaveGrade(e: SubmitEvent) {
		e.preventDefault();
		if (!activeRow) return;

		// Bila mahasiswa belum punya baris submission namun dosen ingin memberi nilai manual
		let subId = activeRow.sub?.id;
		if (!subId) {
			const newId = Math.max(0, ...lms.submissions.map((s) => s.id)) + 1;
			lms.submissions.push({
				id: newId,
				assignment_id: assignment.id,
				enrollment_id: activeRow.enr.id,
				status: 'submitted',
				submitted_at: new Date().toISOString(),
				file_name: 'dinilai-manual-dosen.pdf',
				file_size_mb: 1.0,
				score: null,
				penalty_applied: 0,
				feedback: '',
				version: 1,
				history: [],
				scan_status: 'clean'
			});
			subId = newId;
		}

		lms.gradeSubmission({
			submissionId: subId,
			score: Number(gradeScoreInput),
			feedback: gradeFeedbackInput,
			requestRevision: requestRevisionInput
		});
	}
</script>

<svelte:head>
	<title>Penilaian Tugas (S11) — PelitaLearn</title>
</svelte:head>

<!-- Header sesuai Wireframe S11 (desain.md §8) -->
<div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
	<div>
		<h1 class="h2 mb-1">Penilaian: {assignment.code} {assignment.title}</h1>
		<p class="text-muted-upl mb-0">
			Kelas <strong class="mono">{courseClass.class_code}</strong> — <strong>{submittedCount} dari {classEnrollments.length} mahasiswa</strong> sudah mengumpulkan
		</p>
	</div>

	<div class="d-flex align-items-center gap-2">
		<label for="select-asg-s11" class="form-label mb-0 small fw-semibold text-nowrap">Pilih Tugas:</label>
		<select id="select-asg-s11" class="form-select" bind:value={selectedAssignmentId}>
			{#each lms.assignments as a (a.id)}
				{@const cls = lms.courseClasses.find((c) => c.id === a.course_class_id)}
				<option value={a.id}>{cls?.class_code} · {a.code} — {a.title}</option>
			{/each}
		</select>
	</div>
</div>

<!-- Filter Bar sesuai Wireframe S11 -->
<div class="card shadow-sm mb-4">
	<div class="card-body p-3">
		<div class="row g-2 align-items-center">
			<div class="col-12 col-md-6 col-lg-5">
				<label for="search-mhs-s11" class="visually-hidden">Cari NIM atau nama mahasiswa</label>
				<input
					id="search-mhs-s11"
					type="search"
					class="form-control"
					placeholder="Cari NIM / nama mahasiswa..."
					bind:value={searchQuery}
				/>
			</div>
			<div class="col-12 col-md-4 col-lg-3">
				<label for="filter-status-s11" class="visually-hidden">Filter status pengumpulan</label>
				<select id="filter-status-s11" class="form-select" bind:value={statusFilter}>
					<option value="all">Semua status</option>
					<option value="submitted">Dikumpulkan</option>
					<option value="not_submitted">Belum dikumpulkan</option>
					<option value="graded">Dinilai</option>
					<option value="revision">Perlu revisi</option>
				</select>
			</div>
			<div class="col-12 col-md-2 col-lg-4 text-md-end small text-muted-upl">
				Menampilkan {studentRows.length} mahasiswa
			</div>
		</div>
	</div>
</div>

<!-- Tabel Penilaian: Tablet ke atas (>= 768px) sesuai desain.md §6.2 & §8 S11 -->
<div class="table-responsive d-none d-md-block">
	<table class="table table-hover align-middle bg-white border rounded-3 shadow-sm">
		<caption class="visually-hidden">Daftar pengumpulan tugas mahasiswa untuk {assignment.title}</caption>
		<thead class="table-light">
			<tr>
				<th scope="col">NIM</th>
				<th scope="col">Nama</th>
				<th scope="col">Status</th>
				<th scope="col">Dikumpulkan</th>
				<th scope="col" class="text-end">Nilai</th>
				<th scope="col" class="text-end">Aksi</th>
			</tr>
		</thead>
		<tbody>
			{#each studentRows as row, idx (row.enr.id)}
				<tr>
					<td class="mono">{row.student?.nim}</td>
					<td class="fw-medium">{row.student?.full_name}</td>
					<td>
						<span class="badge rounded-pill {row.badge.badgeClass}">{row.badge.label}</span>
					</td>
					<td class="small">
						{row.sub ? formatDateTimeWib(row.sub.submitted_at, true) : '—'}
					</td>
					<td class="text-end tabular-nums fw-bold">
						{row.sub?.score !== null && row.sub?.score !== undefined
							? formatScore(row.sub.score)
							: '—'}
					</td>
					<td class="text-end">
						{#if row.sub}
							<button
								type="button"
								class="btn btn-primary btn-sm"
								aria-label="Nilai tugas {row.student?.full_name}"
								onclick={() => openGradingPanel(idx)}
							>
								Nilai
							</button>
						{:else}
							<button
								type="button"
								class="btn btn-outline-secondary btn-sm"
								aria-label="Beri nilai manual untuk {row.student?.full_name}"
								onclick={() => openGradingPanel(idx)}
							>
								Nilai Manual
							</button>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<!-- Daftar Kartu: Ponsel (< 768px) sesuai desain.md §6.2 -->
<div class="d-md-none vstack gap-2">
	{#each studentRows as row, idx (row.enr.id)}
		<div class="card shadow-sm">
			<div class="card-body p-3">
				<div class="d-flex justify-content-between align-items-start mb-1">
					<h2 class="h6 mb-0">{row.student?.full_name}</h2>
					<span class="badge rounded-pill {row.badge.badgeClass}">{row.badge.label}</span>
				</div>
				<p class="small text-muted-upl mb-2">
					<span class="mono">{row.student?.nim}</span> · Dikumpulkan: {row.sub ? formatDateTimeWib(row.sub.submitted_at, true) : '—'}
				</p>
				<div class="d-flex justify-content-between align-items-center">
					<span class="small fw-bold tabular-nums">
						Nilai: {row.sub?.score !== null && row.sub?.score !== undefined ? formatScore(row.sub.score) : '—'}
					</span>
					<button
						type="button"
						class="btn btn-primary btn-sm"
						onclick={() => openGradingPanel(idx)}
					>
						Nilai
					</button>
				</div>
			</div>
		</div>
	{/each}
</div>

<!-- Panel Offcanvas di Sisi Kanan untuk Menilai dalam Satu Layar (US-D03 & desain.md §8 S11) -->
{#if activeRow}
	<div
		class="offcanvas-backdrop fade show"
		onclick={() => (activeRowIndex = null)}
		role="presentation"
	></div>
	<aside
		class="offcanvas offcanvas-end show"
		style="width: 460px; max-width: 100vw; visibility: visible;"
		tabindex="-1"
		aria-labelledby="offcanvas-nilai-title"
	>
		<div class="offcanvas-header border-bottom">
			<div>
				<h2 id="offcanvas-nilai-title" class="h5 mb-0">
					Penilaian: {activeRow.student?.full_name}
				</h2>
				<div class="small text-muted-upl mono">
					NIM {activeRow.student?.nim} · {assignment.code}
				</div>
			</div>
			<button
				type="button"
				class="btn-close"
				aria-label="Tutup panel penilaian"
				onclick={() => (activeRowIndex = null)}
			></button>
		</div>

		<div class="offcanvas-body d-flex flex-column justify-content-between">
			<div>
				<!-- Pratinjau Berkas Mahasiswa -->
				<div class="p-3 rounded-3 bg-light border mb-3">
					<div class="small fw-bold text-uppercase text-muted-upl mb-2">
						Berkas Pengumpulan Mahasiswa
					</div>
					{#if activeRow.sub}
						<div class="d-flex justify-content-between align-items-center mb-2">
							<span class="mono fw-semibold">{activeRow.sub.file_name}</span>
							<span class="badge rounded-pill text-bg-light border">{activeRow.sub.file_size_mb} MB</span>
						</div>
						{#if activeRow.sub.link}
							<div class="small mb-2">
								Tautan: <a href={activeRow.sub.link} target="_blank" rel="noopener noreferrer">{activeRow.sub.link}</a>
							</div>
						{/if}
						<div class="small text-muted-upl">
							Waktu kumpul: {formatDateTimeWib(activeRow.sub.submitted_at)} (Versi {activeRow.sub.version})
						</div>
					{:else}
						<div class="small text-danger">
							Mahasiswa ini belum mengunggah berkas pengumpulan.
						</div>
					{/if}
				</div>

				<form id="form-grade-offcanvas" onsubmit={handleSaveGrade}>
					<div class="mb-3">
						<label for="score-input" class="form-label">
							Skor penilaian (0–{assignment.max_score}) <span class="text-danger" aria-hidden="true">*</span>
							<span class="visually-hidden">(wajib diisi)</span>
						</label>
						<input
							id="score-input"
							type="number"
							min="0"
							max={assignment.max_score}
							step="1"
							class="form-control fs-5 fw-bold tabular-nums"
							bind:value={gradeScoreInput}
							disabled={requestRevisionInput}
							required
						/>
					</div>

					<div class="mb-3">
						<label for="feedback-input" class="form-label">
							Umpan balik tertulis untuk mahasiswa
						</label>
						<textarea
							id="feedback-input"
							rows="4"
							class="form-control"
							placeholder="Berikan catatan apa yang sudah baik dan apa yang perlu diperbaiki..."
							bind:value={gradeFeedbackInput}
						></textarea>
					</div>

					<div class="form-check mb-4 p-3 rounded-3 border bg-light ms-0 ps-4">
						<input
							id="req-rev"
							type="checkbox"
							class="form-check-input ms-0 me-2"
							bind:checked={requestRevisionInput}
						/>
						<label for="req-rev" class="form-check-label fw-medium">
							Minta mahasiswa melakukan revisi (FR-TGS-04)
						</label>
						<div class="small text-muted-upl">
							Bila dicentang, status pengumpulan berubah menjadi <span class="badge rounded-pill text-bg-danger">Perlu revisi</span>.
						</div>
					</div>

					<div class="d-flex justify-content-between gap-2">
						<button
							type="button"
							class="btn btn-outline-secondary"
							onclick={() => (activeRowIndex = null)}
						>
							Tutup
						</button>
						<button type="submit" class="btn btn-primary flex-grow-1">
							Simpan nilai
						</button>
					</div>
				</form>
			</div>

			<!-- Navigasi Cepat Antar Mahasiswa Tanpa Menutup Panel -->
			<div class="border-top pt-3 mt-4 d-flex justify-content-between align-items-center">
				<button
					type="button"
					class="btn btn-outline-secondary btn-sm"
					disabled={activeRowIndex === 0}
					onclick={() => activeRowIndex !== null && openGradingPanel(activeRowIndex - 1)}
				>
					<i class="bi bi-chevron-left me-1" aria-hidden="true"></i>Sebelumnya
				</button>
				<span class="small text-muted-upl">
					Mahasiswa {(activeRowIndex ?? 0) + 1} / {studentRows.length}
				</span>
				<button
					type="button"
					class="btn btn-outline-secondary btn-sm"
					disabled={activeRowIndex === studentRows.length - 1}
					onclick={() => activeRowIndex !== null && openGradingPanel(activeRowIndex + 1)}
				>
					Berikutnya<i class="bi bi-chevron-right ms-1" aria-hidden="true"></i>
				</button>
			</div>
		</div>
	</aside>
{/if}

