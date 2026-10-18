<script lang="ts">
	import { lms } from '$lib/store.svelte';

	let activeTab = $state<'classes' | 'enrollment' | 'courses' | 'structure'>('classes');

	// Form Kelas Baru (FR-AKD-04)
	let newClassCourseId = $state(1);
	let newClassLecturerId = $state(1);
	let newClassCode = $state('INF301-5B');
	let newClassDay = $state('Kamis');
	let newClassStarts = $state('13:00');
	let newClassEnds = $state('15:30');
	let newClassRoom = $state('Lab Komputer 1');
	let newClassCapacity = $state(40);

	function handleCreateClass(e: SubmitEvent) {
		e.preventDefault();
		if (!newClassCode.trim()) return;
		const newId = Math.max(0, ...lms.courseClasses.map((c) => c.id)) + 1;
		lms.courseClasses.push({
			id: newId,
			course_id: Number(newClassCourseId),
			academic_term_id: lms.activeTerm.id,
			lecturer_id: Number(newClassLecturerId),
			class_code: newClassCode.trim().toUpperCase(),
			day_of_week: newClassDay,
			starts_at: newClassStarts,
			ends_at: newClassEnds,
			room: newClassRoom.trim(),
			capacity: Number(newClassCapacity),
			meeting_link: 'https://meet.google.com/upl-kelas-baru'
		});
		lms.persist();
		lms.addToast(`Kelas ${newClassCode.toUpperCase()} berhasil dibuat.`, 'success');
		newClassCode = '';
	}

	// Form Enrolment Mahasiswa ke Kelas (FR-AKD-06)
	let enrollClassId = $state(1);
	let enrollStudentId = $state(6);

	function handleEnrollStudent(e: SubmitEvent) {
		e.preventDefault();
		const exists = lms.enrollments.some(
			(enr) =>
				enr.course_class_id === Number(enrollClassId) &&
				enr.student_id === Number(enrollStudentId)
		);
		if (exists) {
			lms.addToast('Mahasiswa tersebut sudah terdaftar di kelas ini.', 'warning');
			return;
		}
		const newId = Math.max(0, ...lms.enrollments.map((enr) => enr.id)) + 1;
		lms.enrollments.push({
			id: newId,
			course_class_id: Number(enrollClassId),
			student_id: Number(enrollStudentId),
			final_score: 85.0,
			letter_grade: 'A',
			grade_points: 4.0,
			grades_locked_at: null
		});
		lms.persist();
		lms.addToast('Mahasiswa berhasil didaftarkan (enrolment) ke kelas.', 'success');
	}

	// Form Mata Kuliah Baru (FR-AKD-03)
	let crsCode = $state('');
	let crsName = $state('');
	let crsCredits = $state(3);
	let crsProdiId = $state(1);

	function handleCreateCourse(e: SubmitEvent) {
		e.preventDefault();
		if (!crsCode.trim() || !crsName.trim()) return;
		const newId = Math.max(0, ...lms.courses.map((c) => c.id)) + 1;
		lms.courses.push({
			id: newId,
			study_program_id: Number(crsProdiId),
			code: crsCode.trim().toUpperCase(),
			name: crsName.trim(),
			credits: Number(crsCredits)
		});
		crsCode = '';
		crsName = '';
		lms.persist();
		lms.addToast('Mata kuliah baru berhasil disimpan.', 'success');
	}

	function setActiveTerm(termId: number) {
		for (const t of lms.academicTerms) {
			t.is_active = t.id === termId;
		}
		lms.persist();
		lms.addToast('Periode akademik aktif berhasil diubah.', 'success');
	}
</script>

<svelte:head>
	<title>Mata Kuliah dan Kelas (S16) — PelitaLearn</title>
</svelte:head>

<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
	<div>
		<h1 class="h2 mb-1">Mata Kuliah, Kelas, dan Enrolment (S16)</h1>
		<p class="text-muted-upl mb-0">
			Kelola struktur fakultas/prodi, periode akademik, mata kuliah, pembukaan kelas, dan enrolment mahasiswa.
		</p>
	</div>
</div>

<ul class="nav nav-tabs flex-nowrap overflow-auto mb-4" role="tablist">
	<li class="nav-item" role="presentation">
		<button
			type="button"
			class="nav-link {activeTab === 'classes' ? 'active' : ''}"
			onclick={() => (activeTab = 'classes')}
		>
			<i class="bi bi-calendar2-range" aria-hidden="true"></i>
			<span>Kelas & Jadwal ({lms.courseClasses.length})</span>
		</button>
	</li>
	<li class="nav-item" role="presentation">
		<button
			type="button"
			class="nav-link {activeTab === 'enrollment' ? 'active' : ''}"
			onclick={() => (activeTab = 'enrollment')}
		>
			<i class="bi bi-person-check" aria-hidden="true"></i>
			<span>Enrolment Peserta ({lms.enrollments.length})</span>
		</button>
	</li>
	<li class="nav-item" role="presentation">
		<button
			type="button"
			class="nav-link {activeTab === 'courses' ? 'active' : ''}"
			onclick={() => (activeTab = 'courses')}
		>
			<i class="bi bi-book" aria-hidden="true"></i>
			<span>Mata Kuliah ({lms.courses.length})</span>
		</button>
	</li>
	<li class="nav-item" role="presentation">
		<button
			type="button"
			class="nav-link {activeTab === 'structure' ? 'active' : ''}"
			onclick={() => (activeTab = 'structure')}
		>
			<i class="bi bi-diagram-3" aria-hidden="true"></i>
			<span>Fakultas, Prodi & Periode</span>
		</button>
	</li>
</ul>

{#if activeTab === 'classes'}
	<div class="row g-3">
		<div class="col-12 col-lg-8">
			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h4 mb-3">Daftar Kelas Semester Aktif (PRD Lampiran A.5)</h2>
					<div class="table-responsive">
						<table class="table table-hover align-middle mb-0">
							<caption class="visually-hidden">Daftar kelas perkuliahan</caption>
							<thead class="table-light">
								<tr>
									<th scope="col">Kode Kelas</th>
									<th scope="col">Mata Kuliah</th>
									<th scope="col">Dosen Pengampu</th>
									<th scope="col">Jadwal & Ruang</th>
									<th scope="col" class="text-end">Peserta</th>
								</tr>
							</thead>
							<tbody>
								{#each lms.courseClasses as cls (cls.id)}
									{@const crs = lms.courses.find((c) => c.id === cls.course_id)}
									{@const lec = lms.lecturers.find((l) => l.id === cls.lecturer_id)}
									{@const enrolledCount = lms.enrollments.filter((e) => e.course_class_id === cls.id).length}
									<tr>
										<td class="mono fw-bold text-primary">{cls.class_code}</td>
										<td>
											<div class="fw-medium">{crs?.name}</div>
											<div class="small text-muted-upl">{crs?.credits} SKS</div>
										</td>
										<td>{lec?.full_name}</td>
										<td>
											<div>{cls.day_of_week} {cls.starts_at}–{cls.ends_at}</div>
											<div class="small text-muted-upl">{cls.room}</div>
										</td>
										<td class="text-end tabular-nums">
											<span class="badge rounded-pill text-bg-light border text-dark">
												{enrolledCount} / {cls.capacity}
											</span>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>

		<div class="col-12 col-lg-4">
			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h4 mb-3">Buka Kelas Baru (FR-AKD-04)</h2>
					<form onsubmit={handleCreateClass}>
						<div class="mb-3">
							<label for="cls-code" class="form-label">Kode kelas *</label>
							<input
								id="cls-code"
								type="text"
								class="form-control mono"
								placeholder="Contoh: INF301-5B"
								bind:value={newClassCode}
								required
							/>
						</div>
						<div class="mb-3">
							<label for="cls-crs" class="form-label">Mata kuliah *</label>
							<select id="cls-crs" class="form-select" bind:value={newClassCourseId}>
								{#each lms.courses as c (c.id)}
									<option value={c.id}>{c.code} — {c.name}</option>
								{/each}
							</select>
						</div>
						<div class="mb-3">
							<label for="cls-lec" class="form-label">Dosen pengampu *</label>
							<select id="cls-lec" class="form-select" bind:value={newClassLecturerId}>
								{#each lms.lecturers as l (l.id)}
									<option value={l.id}>{l.full_name}</option>
								{/each}
							</select>
						</div>
						<div class="row g-2 mb-3">
							<div class="col-4">
								<label for="cls-day" class="form-label">Hari</label>
								<select id="cls-day" class="form-select" bind:value={newClassDay}>
									{#each ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as d}
										<option value={d}>{d}</option>
									{/each}
								</select>
							</div>
							<div class="col-4">
								<label for="cls-start" class="form-label">Mulai</label>
								<input id="cls-start" type="time" class="form-control" bind:value={newClassStarts} />
							</div>
							<div class="col-4">
								<label for="cls-end" class="form-label">Selesai</label>
								<input id="cls-end" type="time" class="form-control" bind:value={newClassEnds} />
							</div>
						</div>
						<div class="row g-2 mb-3">
							<div class="col-8">
								<label for="cls-room" class="form-label">Ruang</label>
								<input id="cls-room" type="text" class="form-control" bind:value={newClassRoom} />
							</div>
							<div class="col-4">
								<label for="cls-cap" class="form-label">Kuota</label>
								<input id="cls-cap" type="number" class="form-control" bind:value={newClassCapacity} />
							</div>
						</div>
						<button type="submit" class="btn btn-primary w-100">Simpan kelas</button>
					</form>
				</div>
			</div>
		</div>
	</div>
{:else if activeTab === 'enrollment'}
	<div class="row g-3">
		<div class="col-12 col-lg-7">
			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h4 mb-3">Data Enrolment per Kelas (PRD Lampiran A.6)</h2>
					<div class="vstack gap-3">
						{#each lms.courseClasses as cls (cls.id)}
							{@const crs = lms.courses.find((c) => c.id === cls.course_id)}
							{@const enrs = lms.enrollments.filter((e) => e.course_class_id === cls.id)}
							<div class="p-3 rounded-3 border">
								<div class="d-flex justify-content-between align-items-center mb-2">
									<div>
										<span class="mono fw-bold text-primary me-2">{cls.class_code}</span>
										<strong>{crs?.name}</strong>
									</div>
									<span class="badge rounded-pill text-bg-light border">{enrs.length} mahasiswa</span>
								</div>
								<div class="d-flex flex-wrap gap-2">
									{#each enrs as enr (enr.id)}
										{@const st = lms.students.find((s) => s.id === enr.student_id)}
										<span class="badge rounded-pill text-bg-light border text-dark py-2 px-3">
											<span class="mono fw-bold">{st?.nim}</span> — {st?.full_name}
										</span>
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
					<h2 class="h4 mb-3">Daftarkan Mahasiswa ke Kelas (FR-AKD-06)</h2>
					<form onsubmit={handleEnrollStudent}>
						<div class="mb-3">
							<label for="enr-cls" class="form-label">Pilih kelas aktif *</label>
							<select id="enr-cls" class="form-select mono" bind:value={enrollClassId}>
								{#each lms.courseClasses as cls (cls.id)}
									{@const crs = lms.courses.find((c) => c.id === cls.course_id)}
									<option value={cls.id}>{cls.class_code} — {crs?.name}</option>
								{/each}
							</select>
						</div>
						<div class="mb-3">
							<label for="enr-st" class="form-label">Pilih mahasiswa aktif *</label>
							<select id="enr-st" class="form-select" bind:value={enrollStudentId}>
								{#each lms.students.filter((s) => s.status === 'active') as st (st.id)}
									<option value={st.id}>{st.nim} — {st.full_name}</option>
								{/each}
							</select>
							<div class="form-text">
								Sesuai BR-03, enrolment hanya pada periode akademik aktif.
							</div>
						</div>
						<button type="submit" class="btn btn-primary w-100">Tambahkan ke kelas</button>
					</form>
				</div>
			</div>
		</div>
	</div>
{:else if activeTab === 'courses'}
	<div class="row g-3">
		<div class="col-12 col-lg-7">
			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h4 mb-3">Katalog Mata Kuliah</h2>
					<div class="table-responsive">
						<table class="table table-hover align-middle mb-0">
							<thead class="table-light">
								<tr>
									<th scope="col">Kode MK</th>
									<th scope="col">Nama Mata Kuliah</th>
									<th scope="col">Program Studi</th>
									<th scope="col" class="text-end">SKS</th>
								</tr>
							</thead>
							<tbody>
								{#each lms.courses as c (c.id)}
									{@const sp = lms.studyPrograms.find((p) => p.id === c.study_program_id)}
									<tr>
										<td class="mono fw-bold">{c.code}</td>
										<td>{c.name}</td>
										<td>{sp?.name}</td>
										<td class="text-end tabular-nums">{c.credits}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
		<div class="col-12 col-lg-5">
			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h4 mb-3">Tambah Mata Kuliah (FR-AKD-03)</h2>
					<form onsubmit={handleCreateCourse}>
						<div class="mb-3">
							<label for="c-code" class="form-label">Kode MK *</label>
							<input id="c-code" type="text" class="form-control mono" placeholder="Contoh: INF308" bind:value={crsCode} required />
						</div>
						<div class="mb-3">
							<label for="c-name" class="form-label">Nama mata kuliah *</label>
							<input id="c-name" type="text" class="form-control" placeholder="Contoh: Pemrograman Web Lanjut" bind:value={crsName} required />
						</div>
						<div class="row g-2 mb-3">
							<div class="col-8">
								<label for="c-prodi" class="form-label">Program studi</label>
								<select id="c-prodi" class="form-select" bind:value={crsProdiId}>
									{#each lms.studyPrograms as sp (sp.id)}
										<option value={sp.id}>{sp.name}</option>
									{/each}
								</select>
							</div>
							<div class="col-4">
								<label for="c-sks" class="form-label">SKS</label>
								<input id="c-sks" type="number" min="1" max="6" class="form-control" bind:value={crsCredits} />
							</div>
						</div>
						<button type="submit" class="btn btn-primary w-100">Simpan mata kuliah</button>
					</form>
				</div>
			</div>
		</div>
	</div>
{:else}
	<!-- Fakultas, Prodi & Periode Akademik (FR-AKD-01..02) -->
	<div class="row g-3">
		<div class="col-12 col-lg-6">
			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h4 mb-3">Fakultas dan Program Studi (Lampiran A.1)</h2>
					<div class="table-responsive">
						<table class="table table-hover align-middle mb-0">
							<thead class="table-light">
								<tr>
									<th scope="col">Kode</th>
									<th scope="col">Program Studi</th>
									<th scope="col">Fakultas</th>
								</tr>
							</thead>
							<tbody>
								{#each lms.studyPrograms as sp (sp.id)}
									{@const fac = lms.faculties.find((f) => f.id === sp.faculty_id)}
									<tr>
										<td class="mono fw-bold">{sp.code}</td>
										<td class="fw-medium">{sp.name}</td>
										<td>{fac?.name}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>

		<div class="col-12 col-lg-6">
			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h4 mb-3">Periode Akademik (FR-AKD-02)</h2>
					<div class="vstack gap-2">
						{#each lms.academicTerms as term (term.id)}
							<div class="p-3 rounded-3 border d-flex justify-content-between align-items-center">
								<div>
									<div class="fw-bold">{term.name}</div>
									<div class="small text-muted-upl">
										{term.starts_on} s.d. {term.ends_on}
									</div>
								</div>
								{#if term.is_active}
									<span class="badge rounded-pill text-bg-success px-3 py-2">Periode Aktif</span>
								{:else}
									<button
										type="button"
										class="btn btn-outline-primary btn-sm"
										onclick={() => setActiveTerm(term.id)}
									>
										Jadikan Aktif
									</button>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

