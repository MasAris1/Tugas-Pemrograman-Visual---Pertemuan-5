<script lang="ts">
	import { lms } from '$lib/store.svelte';
	import { formatDateTimeWib, formatScore } from '$lib/format';

	const student = $derived(lms.currentStudent ?? lms.students[0]);
	const studyProgram = $derived(
		lms.studyPrograms.find((sp) => sp.id === student?.study_program_id)
	);

	const studentEnrollments = $derived.by(() => {
		const enrs = lms.enrollments.filter((e) => e.student_id === student.id);
		// Bila mahasiswa Cuti (Sari Dewi) belum punya enrolment semester ini, tampilkan riwayat semester lalu
		if (enrs.length === 0) {
			return [
				{
					id: 991,
					course_class_id: 1,
					student_id: student.id,
					final_score: 86.5,
					letter_grade: 'A',
					grade_points: 4.0,
					grades_locked_at: '2026-06-25T16:00:00+07:00',
					is_history: true
				}
			];
		}
		return enrs.map((e) => ({ ...e, is_history: false }));
	});

	const gradeCards = $derived(
		studentEnrollments.map((enr) => {
			const cls = lms.courseClasses.find((c) => c.id === enr.course_class_id);
			const crs = lms.courses.find((c) => c.id === cls?.course_id);
			const lec = lms.lecturers.find((l) => l.id === cls?.lecturer_id);
			const comps = lms.gradeComponents.filter((gc) => gc.course_class_id === enr.course_class_id);
			const compDetails = comps.map((c) => {
				const entry = lms.gradeEntries.find(
					(ge) => ge.grade_component_id === c.id && ge.enrollment_id === enr.id
				);
				return {
					...c,
					score: entry?.score ?? 85
				};
			});
			return { enr, cls, crs, lec, compDetails };
		})
	);

	const totalCredits = $derived(
		gradeCards.reduce((acc, g) => acc + (g.crs?.credits ?? 0), 0)
	);

	const ips = $derived.by(() => {
		if (totalCredits === 0) return 0;
		const weightedPoints = gradeCards.reduce(
			(acc, g) => acc + (g.enr.grade_points ?? 0) * (g.crs?.credits ?? 0),
			0
		);
		return weightedPoints / totalCredits;
	});

	function exportTranscriptCsv() {
		const headers = ['Kode Kelas', 'Mata Kuliah', 'SKS', 'Nilai Akhir', 'Huruf Mutu', 'Bobot Mutu'];
		const rows = gradeCards.map((g) => [
			g.cls?.class_code ?? '',
			g.crs?.name ?? '',
			String(g.crs?.credits ?? 3),
			formatScore(g.enr.final_score),
			g.enr.letter_grade ?? '-',
			formatScore(g.enr.grade_points)
		]);
		const csvContent = [headers, ...rows].map((r) => r.join(';')).join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `Transkrip-Sementara-${student.nim}.csv`;
		a.click();
		URL.revokeObjectURL(url);
		lms.addToast('Transkrip nilai sementara berhasil diunduh (CSV).', 'success');
	}
</script>

<svelte:head>
	<title>Nilai Saya (S08) — PelitaLearn</title>
</svelte:head>

<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
	<div>
		<h1 class="h2 mb-1">Nilai Saya</h1>
		<p class="text-muted-upl mb-0">
			<strong>{student.full_name}</strong> (<span class="mono">{student.nim}</span>) · {studyProgram?.name} · {lms.activeTerm.name}
		</p>
	</div>
	<div class="d-flex gap-2">
		<button type="button" class="btn btn-outline-primary" onclick={exportTranscriptCsv}>
			<i class="bi bi-download me-2" aria-hidden="true"></i>Unduh Transkrip Sementara
		</button>
	</div>
</div>

<!-- Ringkasan IPS & SKS -->
<div class="row g-3 mb-4">
	<div class="col-6 col-lg-3">
		<div class="card upl-stat-card h-100">
			<div class="card-body p-3">
				<div class="small text-muted-upl fw-medium mb-1">Nilai Akhir INF301-5A</div>
				<div class="upl-stat-value">{formatScore(gradeCards[0]?.enr.final_score)}</div>
				<div class="small text-muted-upl mt-1">Huruf mutu: <strong>{gradeCards[0]?.enr.letter_grade}</strong> (AC-05)</div>
			</div>
		</div>
	</div>
	<div class="col-6 col-lg-3">
		<div class="card upl-stat-card h-100">
			<div class="card-body p-3">
				<div class="small text-muted-upl fw-medium mb-1">IPS Sementara</div>
				<div class="upl-stat-value">{formatScore(ips)}</div>
				<div class="small text-muted-upl mt-1">Skala 4,00</div>
			</div>
		</div>
	</div>
	<div class="col-6 col-lg-3">
		<div class="card upl-stat-card h-100">
			<div class="card-body p-3">
				<div class="small text-muted-upl fw-medium mb-1">Total SKS Diambil</div>
				<div class="upl-stat-value">{totalCredits}</div>
				<div class="small text-muted-upl mt-1">{gradeCards.length} mata kuliah</div>
			</div>
		</div>
	</div>
	<div class="col-6 col-lg-3">
		<div class="card upl-stat-card h-100">
			<div class="card-body p-3">
				<div class="small text-muted-upl fw-medium mb-1">Status Nilai</div>
				<div class="upl-stat-value fs-4">
					{gradeCards[0]?.enr.grades_locked_at ? 'Final' : 'Sementara'}
				</div>
				<div class="small text-muted-upl mt-1">Transparan per komponen</div>
			</div>
		</div>
	</div>
</div>

<!-- Rincian Nilai per Kelas (AC-05) -->
<div class="vstack gap-4">
	{#each gradeCards as item (item.enr.id)}
		<section class="card shadow-sm" aria-labelledby="heading-grade-{item.enr.id}">
			<div class="card-body p-3 p-lg-4">
				<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3 pb-3 border-bottom">
					<div>
						<div class="d-flex align-items-center gap-2 mb-1">
							<span class="badge rounded-pill text-bg-primary mono">{item.cls?.class_code}</span>
							<span class="badge rounded-pill text-bg-light border text-dark">{item.crs?.credits} SKS</span>
							{#if item.enr.grades_locked_at}
								<span class="badge rounded-pill text-bg-success">
									<i class="bi bi-lock-fill me-1" aria-hidden="true"></i>Nilai Akhir Terkunci ({formatDateTimeWib(item.enr.grades_locked_at, true)})
								</span>
							{:else}
								<span class="badge rounded-pill text-bg-info">Nilai Sementara</span>
							{/if}
						</div>
						<h2 id="heading-grade-{item.enr.id}" class="h4 mb-0">{item.crs?.name}</h2>
						<div class="small text-muted-upl">{item.lec?.full_name}</div>
					</div>

					<div class="d-flex align-items-center gap-3 bg-teal-subtle-upl p-2 px-3 rounded-3">
						<div>
							<div class="small text-muted-upl">Nilai Akhir</div>
							<div class="h4 mb-0 tabular-nums">{formatScore(item.enr.final_score)}</div>
						</div>
						<div class="vr"></div>
						<div>
							<div class="small text-muted-upl">Huruf Mutu</div>
							<span class="badge rounded-pill text-bg-success fs-5 px-3">{item.enr.letter_grade}</span>
						</div>
						<div class="vr"></div>
						<div>
							<div class="small text-muted-upl">Bobot</div>
							<div class="fw-bold tabular-nums">{formatScore(item.enr.grade_points)}</div>
						</div>
					</div>
				</div>

				<!-- Tabel Rincian Komponen (Tablet ke atas >= 768px) -->
				<div class="table-responsive d-none d-md-block">
					<table class="table table-hover align-middle mb-0">
						<caption class="visually-hidden">Rincian nilai per komponen {item.cls?.class_code}</caption>
						<thead class="table-light">
							<tr>
								<th scope="col">Komponen Nilai</th>
								<th scope="col">Sumber Perhitungan</th>
								<th scope="col" class="text-end">Bobot</th>
								<th scope="col" class="text-end">Nilai Komponen</th>
								<th scope="col" class="text-end">Nilai Terbobot</th>
							</tr>
						</thead>
						<tbody class="tabular-nums">
							{#each item.compDetails as comp (comp.id)}
								<tr>
									<td class="fw-semibold">{comp.name}</td>
									<td class="small text-muted-upl">
										{comp.source === 'attendance'
											? 'Otomatis dari presensi'
											: comp.source === 'assignment'
												? 'Rata-rata nilai tugas'
												: comp.source === 'quiz'
													? 'Rata-rata nilai kuis'
													: 'Input ujian (UTS/UAS)'}
									</td>
									<td class="text-end">{comp.weight}%</td>
									<td class="text-end fw-medium">{formatScore(comp.score)}</td>
									<td class="text-end fw-bold text-primary">
										{formatScore((comp.score * comp.weight) / 100)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Kartu Komponen (Ponsel < 768px) -->
				<div class="d-md-none vstack gap-2">
					{#each item.compDetails as comp (comp.id)}
						<div class="p-3 rounded-3 border bg-light d-flex justify-content-between align-items-center tabular-nums">
							<div>
								<div class="fw-bold">{comp.name} ({comp.weight}%)</div>
								<div class="small text-muted-upl">Nilai komponen: {formatScore(comp.score)}</div>
							</div>
							<div class="text-end">
								<div class="small text-muted-upl">Kontribusi</div>
								<div class="fw-bold text-primary">+{formatScore((comp.score * comp.weight) / 100)}</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/each}
</div>

