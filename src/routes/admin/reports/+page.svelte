<script lang="ts">
	import { page } from '$app/state';
	import { lms } from '$lib/store.svelte';
	import { formatDateTimeWib, formatScore, roleLabel } from '$lib/format';

	let activeTab = $state<'reports' | 'override' | 'audit' | 'settings'>('reports');

	$effect(() => {
		const t = page.url.searchParams.get('tab');
		if (t === 'audit' || t === 'override' || t === 'settings' || t === 'reports') {
			activeTab = t;
		}
	});

	let reportClassId = $state(1);
	let auditFilterAction = $state('all');

	const selectedReportClass = $derived(
		lms.courseClasses.find((c) => c.id === reportClassId) ?? lms.courseClasses[0]
	);
	const selectedReportCourse = $derived(
		lms.courses.find((c) => c.id === selectedReportClass?.course_id)
	);
	const reportEnrollments = $derived(
		lms.enrollments.filter((e) => e.course_class_id === reportClassId)
	);

	// Form Koreksi Nilai Terkunci (US-A06, BR-10, AC-07)
	let overrideEnrollmentId = $state(1);
	let overrideComponentId = $state(5); // Default: UAS INF301-5A
	let overrideNewScore = $state(95);
	let overrideReason = $state('');
	let overrideError = $state('');

	function handleAdminOverrideGrade(e: SubmitEvent) {
		e.preventDefault();
		overrideError = '';
		const res = lms.adminOverrideLockedGrade({
			enrollmentId: Number(overrideEnrollmentId),
			componentId: Number(overrideComponentId),
			newScore: Number(overrideNewScore),
			reason: overrideReason
		});
		if (!res.ok) {
			overrideError = res.error ?? 'Gagal menyimpan koreksi nilai.';
			return;
		}
		overrideReason = '';
	}

	function exportReportCsv(type: 'grades' | 'attendance') {
		const headers =
			type === 'grades'
				? ['NIM', 'Nama', 'Nilai Akhir', 'Huruf Mutu', 'Bobot Mutu', 'Status Kunci']
				: ['NIM', 'Nama', 'Persentase Kehadiran', 'Status Syarat UAS (>=75%)'];

		const rows = reportEnrollments.map((enr) => {
			const st = lms.students.find((s) => s.id === enr.student_id);
			if (type === 'grades') {
				return [
					st?.nim ?? '',
					st?.full_name ?? '',
					formatScore(enr.final_score),
					enr.letter_grade ?? 'E',
					formatScore(enr.grade_points),
					enr.grades_locked_at ? 'Terkunci' : 'Sementara'
				];
			} else {
				const pct = lms.getAttendancePercentage(reportClassId, enr.id);
				return [
					st?.nim ?? '',
					st?.full_name ?? '',
					`${pct}%`,
					pct >= 75 ? 'Memenuhi Syarat' : 'Tidak Memenuhi Syarat'
				];
			}
		});

		const csv = [headers, ...rows].map((r) => r.join(';')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `Laporan-${type === 'grades' ? 'Nilai' : 'Kehadiran'}-${selectedReportClass.class_code}.csv`;
		a.click();
		URL.revokeObjectURL(url);
		lms.addToast(`Laporan ${type === 'grades' ? 'Nilai' : 'Kehadiran'} berhasil diunduh (CSV).`, 'success');
	}

	const filteredAuditLogs = $derived(
		lms.auditLogs.filter((log) => {
			if (auditFilterAction === 'all') return true;
			return log.action.startsWith(auditFilterAction);
		})
	);

	function handleSaveSettings(e: SubmitEvent) {
		e.preventDefault();
		lms.addAuditLog({
			action: 'config.updated',
			subject_type: 'AppSettings',
			subject_id: 'grading_and_upload_policy',
			old_values: {},
			new_values: {
				upload_max_assignment_mb: lms.appSettings.upload_max_assignment_mb,
				late_penalty_per_day_percent: lms.appSettings.late_penalty_per_day_percent,
				min_attendance_percent: lms.appSettings.min_attendance_percent
			},
			reason: 'Pembaruan konfigurasi kebijakan akademik (US-S03)'
		});
		lms.persist();
		lms.addToast('Konfigurasi kebijakan sistem berhasil disimpan.', 'success');
	}
</script>

<svelte:head>
	<title>Laporan dan Audit Log (S20) — PelitaLearn</title>
</svelte:head>

<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
	<div>
		<h1 class="h2 mb-1">Laporan, Koreksi Nilai, dan Audit Log (S20)</h1>
		<p class="text-muted-upl mb-0">
			Unduh rekap akademik kelas, koreksi nilai terkunci dengan alasan tertulis, dan telusuri jejak audit sistem.
		</p>
	</div>
</div>

<ul class="nav nav-tabs flex-nowrap overflow-auto mb-4" role="tablist">
	<li class="nav-item" role="presentation">
		<button
			type="button"
			class="nav-link {activeTab === 'reports' ? 'active' : ''}"
			onclick={() => (activeTab = 'reports')}
		>
			<i class="bi bi-file-earmark-spreadsheet" aria-hidden="true"></i>
			<span>Laporan Nilai & Kehadiran (FR-LAP-01..02)</span>
		</button>
	</li>
	<li class="nav-item" role="presentation">
		<button
			type="button"
			class="nav-link {activeTab === 'override' ? 'active' : ''}"
			onclick={() => (activeTab = 'override')}
		>
			<i class="bi bi-pencil-square" aria-hidden="true"></i>
			<span>Koreksi Nilai Terkunci (BR-10)</span>
		</button>
	</li>
	<li class="nav-item" role="presentation">
		<button
			type="button"
			class="nav-link {activeTab === 'audit' ? 'active' : ''}"
			onclick={() => (activeTab = 'audit')}
		>
			<i class="bi bi-shield-check" aria-hidden="true"></i>
			<span>Audit Log ({lms.auditLogs.length})</span>
		</button>
	</li>
	<li class="nav-item" role="presentation">
		<button
			type="button"
			class="nav-link {activeTab === 'settings' ? 'active' : ''}"
			onclick={() => (activeTab = 'settings')}
		>
			<i class="bi bi-sliders" aria-hidden="true"></i>
			<span>Konfigurasi Kebijakan (US-S03)</span>
		</button>
	</li>
</ul>

{#if activeTab === 'reports'}
	<div class="card shadow-sm">
		<div class="card-body p-3 p-lg-4">
			<div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
				<div class="d-flex align-items-center gap-2">
					<label for="rep-cls" class="form-label mb-0 fw-semibold">Pilih Kelas:</label>
					<select id="rep-cls" class="form-select w-auto mono" bind:value={reportClassId}>
						{#each lms.courseClasses as cls (cls.id)}
							{@const crs = lms.courses.find((c) => c.id === cls.course_id)}
							<option value={cls.id}>{cls.class_code} — {crs?.name}</option>
						{/each}
					</select>
				</div>

				<div class="d-flex flex-wrap gap-2">
					<button
						type="button"
						class="btn btn-primary btn-sm"
						onclick={() => exportReportCsv('grades')}
					>
						<i class="bi bi-download me-1" aria-hidden="true"></i>Unduh Rekap Nilai (CSV)
					</button>
					<button
						type="button"
						class="btn btn-outline-primary btn-sm"
						onclick={() => exportReportCsv('attendance')}
					>
						<i class="bi bi-download me-1" aria-hidden="true"></i>Unduh Rekap Kehadiran (CSV)
					</button>
					<button
						type="button"
						class="btn btn-outline-secondary btn-sm"
						onclick={() => window.print()}
					>
						<i class="bi bi-printer me-1" aria-hidden="true"></i>Cetak / Simpan PDF
					</button>
				</div>
			</div>

			<h2 class="h5 mb-3">
				Pratinjau Laporan Kelas {selectedReportClass.class_code} — {selectedReportCourse?.name}
			</h2>

			<div class="table-responsive">
				<table class="table table-hover align-middle mb-0">
					<caption class="visually-hidden">Tabel rekap nilai dan kehadiran {selectedReportClass.class_code}</caption>
					<thead class="table-light">
						<tr>
							<th scope="col">NIM</th>
							<th scope="col">Nama Mahasiswa</th>
							<th scope="col" class="text-end">Kehadiran</th>
							<th scope="col" class="text-end">Nilai Akhir</th>
							<th scope="col" class="text-center">Huruf Mutu</th>
							<th scope="col">Status Nilai</th>
						</tr>
					</thead>
					<tbody class="tabular-nums">
						{#each reportEnrollments as enr (enr.id)}
							{@const st = lms.students.find((s) => s.id === enr.student_id)}
							{@const attPct = lms.getAttendancePercentage(reportClassId, enr.id)}
							<tr>
								<td class="mono">{st?.nim}</td>
								<td class="fw-medium">{st?.full_name}</td>
								<td class="text-end">
									<span class="badge rounded-pill {attPct >= 75 ? 'text-bg-success' : 'text-bg-danger'}">
										{attPct}%
									</span>
								</td>
								<td class="text-end fw-bold">{formatScore(enr.final_score)}</td>
								<td class="text-center">
									<span class="badge rounded-pill text-bg-primary">{enr.letter_grade}</span>
								</td>
								<td>
									{#if enr.grades_locked_at}
										<span class="badge rounded-pill text-bg-success">Terkunci</span>
									{:else}
										<span class="badge rounded-pill text-bg-secondary">Sementara</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{:else if activeTab === 'override'}
	<!-- Koreksi Nilai yang Sudah Terkunci dengan Alasan Tertulis (US-A06, BR-10, AC-07) -->
	<div class="row g-3">
		<div class="col-12 col-lg-7">
			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h4 mb-2">Koreksi Resmi Nilai Terkunci (BR-10 & AC-07)</h2>
					<p class="small text-muted-upl mb-3">
						Nilai yang sudah difinalisasi dosen hanya dapat diubah oleh Admin Akademik dengan mencantumkan alasan tertulis yang sah. Setiap perubahan langsung dicatat di Audit Log.
					</p>

					{#if overrideError}
						<div class="alert alert-danger" role="alert">{overrideError}</div>
					{/if}

					<form onsubmit={handleAdminOverrideGrade} novalidate>
						<div class="mb-3">
							<label for="ov-enr" class="form-label">Pilih mahasiswa & kelas *</label>
							<select id="ov-enr" class="form-select" bind:value={overrideEnrollmentId}>
								{#each lms.enrollments.filter((e) => e.course_class_id === 1) as enr (enr.id)}
									{@const st = lms.students.find((s) => s.id === enr.student_id)}
									<option value={enr.id}>
										INF301-5A · {st?.nim} — {st?.full_name} (Nilai Akhir saat ini: {formatScore(enr.final_score)} / {enr.letter_grade})
									</option>
								{/each}
							</select>
						</div>

						<div class="row g-2 mb-3">
							<div class="col-7">
								<label for="ov-comp" class="form-label">Komponen nilai yang dikoreksi *</label>
								<select id="ov-comp" class="form-select" bind:value={overrideComponentId}>
									{#each lms.gradeComponents.filter((c) => c.course_class_id === 1) as comp (comp.id)}
										<option value={comp.id}>{comp.name} (Bobot {comp.weight}%)</option>
									{/each}
								</select>
							</div>
							<div class="col-5">
								<label for="ov-score" class="form-label">Nilai baru (0–100) *</label>
								<input
									id="ov-score"
									type="number"
									min="0"
									max="100"
									class="form-control tabular-nums fw-bold"
									bind:value={overrideNewScore}
									required
								/>
							</div>
						</div>

						<div class="mb-3">
							<label for="ov-reason" class="form-label">
								Alasan tertulis koreksi nilai <span class="text-danger" aria-hidden="true">*</span>
								<span class="visually-hidden">(wajib diisi)</span>
							</label>
							<textarea
								id="ov-reason"
								rows="3"
								class="form-control"
								placeholder="Contoh: Berita Acara Peninjauan Ulang Lembar Jawaban UAS No. 08/BA-FT/XI/2026"
								bind:value={overrideReason}
								required
							></textarea>
							<div class="form-text">Wajib minimal 10 karakter agar sah secara audit.</div>
						</div>

						<button type="submit" class="btn btn-primary">
							Simpan koreksi & catat audit log
						</button>
					</form>
				</div>
			</div>
		</div>

		<div class="col-12 col-lg-5">
			<div class="card bg-teal-subtle-upl border-0 shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h5 mb-2">Aturan Bisnis BR-10</h2>
					<p class="small text-muted-upl mb-0">
						"Nilai yang sudah dikunci hanya dapat diubah admin akademik dengan alasan tertulis; semua perubahan dicatat di audit log beserta nilai lama dan nilai baru."
					</p>
				</div>
			</div>
		</div>
	</div>
{:else if activeTab === 'audit'}
	<!-- Audit Log (FR-LAP-03) -->
	<div class="card shadow-sm">
		<div class="card-body p-3 p-lg-4">
			<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
				<h2 class="h4 mb-0">Jejak Aktivitas Sensitif (Audit Log)</h2>
				<div class="d-flex align-items-center gap-2">
					<label for="audit-filter" class="small fw-semibold text-nowrap mb-0">Filter aksi:</label>
					<select id="audit-filter" class="form-select form-select-sm" bind:value={auditFilterAction}>
						<option value="all">Semua Aktivitas</option>
						<option value="auth.">Autentikasi & Kunci Akun</option>
						<option value="student.">Perubahan Status Mahasiswa</option>
						<option value="grades.">Finalisasi & Koreksi Nilai</option>
						<option value="submission.">Penilaian Tugas</option>
					</select>
				</div>
			</div>

			<div class="table-responsive">
				<table class="table table-hover align-middle mb-0">
					<caption class="visually-hidden">Daftar audit log sistem PelitaLearn</caption>
					<thead class="table-light">
						<tr>
							<th scope="col">Waktu (WIB)</th>
							<th scope="col">Pelaku</th>
							<th scope="col">Aksi</th>
							<th scope="col">Subjek</th>
							<th scope="col">Perubahan Nilai (Lama → Baru)</th>
							<th scope="col">Alasan / Keterangan</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredAuditLogs as log (log.id)}
							<tr>
								<td class="small text-nowrap">{formatDateTimeWib(log.created_at, true)}</td>
								<td>
									<div class="fw-medium small">{log.user_name}</div>
									<div class="text-muted-upl" style="font-size: 0.75rem;">
										{roleLabel(log.user_role)} · IP {log.ip}
									</div>
								</td>
								<td>
									<span class="badge rounded-pill text-bg-dark mono">{log.action}</span>
								</td>
								<td class="mono small">{log.subject_id}</td>
								<td class="mono small" style="max-width: 240px;">
									<div class="text-muted-upl text-truncate" title={log.old_values}>
										Lama: {log.old_values}
									</div>
									<div class="text-primary text-truncate" title={log.new_values}>
										Baru: {log.new_values}
									</div>
								</td>
								<td class="small">{log.reason}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{:else}
	<!-- Konfigurasi Sistem Dinamis (US-S03 & PRD Lampiran A.9) -->
	<div class="row g-3">
		<div class="col-12 col-lg-6">
			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h4 mb-3">Kebijakan Unggah, Kehadiran & Keterlambatan</h2>
					<form onsubmit={handleSaveSettings}>
						<div class="row g-3 mb-3">
							<div class="col-sm-6">
								<label for="cfg-asg-mb" class="form-label">Batas unggah tugas (MB)</label>
								<input
									id="cfg-asg-mb"
									type="number"
									class="form-control tabular-nums"
									bind:value={lms.appSettings.upload_max_assignment_mb}
								/>
							</div>
							<div class="col-sm-6">
								<label for="cfg-mat-mb" class="form-label">Batas unggah materi (MB)</label>
								<input
									id="cfg-mat-mb"
									type="number"
									class="form-control tabular-nums"
									bind:value={lms.appSettings.upload_max_material_mb}
								/>
							</div>
							<div class="col-sm-6">
								<label for="cfg-pen" class="form-label">Penalti terlambat (% / hari)</label>
								<input
									id="cfg-pen"
									type="number"
									class="form-control tabular-nums"
									bind:value={lms.appSettings.late_penalty_per_day_percent}
								/>
							</div>
							<div class="col-sm-6">
								<label for="cfg-att" class="form-label">Kehadiran min. UAS (%)</label>
								<input
									id="cfg-att"
									type="number"
									class="form-control tabular-nums"
									bind:value={lms.appSettings.min_attendance_percent}
								/>
							</div>
						</div>
						<button type="submit" class="btn btn-primary">Simpan konfigurasi</button>
					</form>
				</div>
			</div>
		</div>

		<div class="col-12 col-lg-6">
			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h4 mb-3">Skala Huruf Mutu Default (PRD Lampiran A.9)</h2>
					<div class="table-responsive">
						<table class="table table-sm table-hover align-middle mb-0 tabular-nums">
							<thead class="table-light">
								<tr>
									<th scope="col">Rentang Nilai</th>
									<th scope="col">Huruf Mutu</th>
									<th scope="col" class="text-end">Bobot Mutu</th>
								</tr>
							</thead>
							<tbody>
								{#each lms.appSettings.grade_scale as band (band.letter)}
									<tr>
										<td>≥ {band.min}</td>
										<td><span class="badge rounded-pill text-bg-primary">{band.letter}</span></td>
										<td class="text-end fw-semibold">{formatScore(band.points)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

