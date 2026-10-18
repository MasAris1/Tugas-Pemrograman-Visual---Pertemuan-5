<script lang="ts">
	import { lms } from '$lib/store.svelte';
	import {
		formatDateShortId,
		formatDateTimeWib,
		formatScore,
		studentStatusBadge,
		submissionStatusBadge
	} from '$lib/format';

	const user = $derived(lms.currentUser);
	const student = $derived(lms.currentStudent);
	const lecturer = $derived(lms.currentLecturer);

	// Data untuk Mahasiswa (S03)
	const studentEnrollments = $derived(
		student ? lms.enrollments.filter((e) => e.student_id === student.id) : []
	);
	const studentClasses = $derived(
		studentEnrollments
			.map((enr) => {
				const cls = lms.courseClasses.find((c) => c.id === enr.course_class_id);
				const crs = lms.courses.find((c) => c.id === cls?.course_id);
				const lec = lms.lecturers.find((l) => l.id === cls?.lecturer_id);
				const prog = cls ? lms.getClassProgress(cls.id, enr.id) : { completed: 0, total: 0, percent: 0 };
				return { enrollment: enr, cls, crs, lec, prog };
			})
			.filter((item) => item.cls && item.crs)
	);

	const studentDeadlines = $derived.by(() => {
		if (!student) return [];
		const classIds = studentEnrollments.map((e) => e.course_class_id);
		const items: {
			id: string;
			dateShort: string;
			dueAt: string;
			title: string;
			classCode: string;
			href: string;
			badgeLabel: string;
			badgeClass: string;
		}[] = [];

		// Kuis
		for (const q of lms.quizzes.filter((qz) => classIds.includes(qz.course_class_id))) {
			const cls = lms.courseClasses.find((c) => c.id === q.course_class_id);
			const enr = studentEnrollments.find((e) => e.course_class_id === q.course_class_id);
			const att = lms.quizAttempts.find(
				(a) => a.quiz_id === q.id && a.enrollment_id === enr?.id
			);
			items.push({
				id: `quiz-${q.id}`,
				dateShort: formatDateShortId(q.opens_at).replace(' 2026', ''),
				dueAt: q.opens_at,
				title: `${q.title} (${q.duration_minutes} mnt)`,
				classCode: cls?.class_code ?? '',
				href: `/quizzes/${q.id}/attempt`,
				badgeLabel:
					att?.status === 'submitted'
						? 'Selesai'
						: att?.status === 'in_progress'
							? 'Berlangsung'
							: 'Belum dibuka',
				badgeClass:
					att?.status === 'submitted'
						? 'text-bg-success'
						: att?.status === 'in_progress'
							? 'text-bg-primary'
							: 'text-bg-secondary'
			});
		}

		// Tugas aktif
		for (const asg of lms.assignments.filter(
			(a) => classIds.includes(a.course_class_id) && a.status === 'published'
		)) {
			const cls = lms.courseClasses.find((c) => c.id === asg.course_class_id);
			const enr = studentEnrollments.find((e) => e.course_class_id === asg.course_class_id);
			const sub = lms.submissions.find(
				(s) => s.assignment_id === asg.id && s.enrollment_id === enr?.id
			);
			const statusBadge = submissionStatusBadge(sub?.status ?? 'not_submitted');
			items.push({
				id: `asg-${asg.id}`,
				dateShort: formatDateShortId(asg.due_at).replace(' 2026', ''),
				dueAt: asg.due_at,
				title: asg.title,
				classCode: cls?.class_code ?? '',
				href: `/classes/${asg.course_class_id}/assignments/${asg.id}`,
				badgeLabel: statusBadge.label,
				badgeClass: statusBadge.badgeClass
			});
		}

		return items.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
	});

	const unsubmittedAssignmentsCount = $derived.by(() => {
		if (!student) return 0;
		const classIds = studentEnrollments.map((e) => e.course_class_id);
		const activeAsgs = lms.assignments.filter(
			(a) => classIds.includes(a.course_class_id) && a.status === 'published'
		);
		let count = 0;
		for (const asg of activeAsgs) {
			const enr = studentEnrollments.find((e) => e.course_class_id === asg.course_class_id);
			const sub = lms.submissions.find(
				(s) => s.assignment_id === asg.id && s.enrollment_id === enr?.id
			);
			if (!sub) count++;
		}
		return count;
	});

	// Data untuk Dosen (S09)
	const lecturerClasses = $derived(
		lecturer
			? lms.courseClasses.filter((c) => c.lecturer_id === lecturer.id)
			: lms.courseClasses.slice(0, 2)
	);

	const pendingSubmissionsForLecturer = $derived.by(() => {
		const classIds = lecturerClasses.map((c) => c.id);
		const classAsgs = lms.assignments.filter((a) => classIds.includes(a.course_class_id));
		const asgIds = classAsgs.map((a) => a.id);

		return lms.submissions
			.filter(
				(s) =>
					asgIds.includes(s.assignment_id) &&
					(s.status === 'submitted' || s.status === 'late')
			)
			.map((sub) => {
				const asg = lms.assignments.find((a) => a.id === sub.assignment_id);
				const cls = lms.courseClasses.find((c) => c.id === asg?.course_class_id);
				const enr = lms.enrollments.find((e) => e.id === sub.enrollment_id);
				const st = lms.students.find((s) => s.id === enr?.student_id);
				return { sub, asg, cls, st };
			});
	});
</script>

<svelte:head>
	<title>Dashboard — PelitaLearn | LMS Universitas Pelita Bangsa</title>
</svelte:head>

{#if !user}
	<div class="alert alert-info" role="alert">
		Silakan <a href="/login" class="alert-link">masuk terlebih dahulu</a> untuk membuka Dashboard.
	</div>
{:else if user.role === 'student'}
	<!-- ===================================================================== -->
	<!-- S03 — DASHBOARD MAHASISWA (desain.md §8 S03 & PRD FR-DSH-01)          -->
	<!-- ===================================================================== -->
	<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
		<div>
			<h1 class="h2 mb-1">Halo, {user.full_name.split(' ')[0]}!</h1>
			<p class="text-muted-upl mb-0">
				Senin, 19 Oktober 2026 · {lms.activeTerm.name}
			</p>
		</div>
		{#if student && student.status === 'active'}
			<div class="d-flex flex-wrap gap-2">
				<a href="/classes/1?tab=presensi" class="btn btn-primary">
					<i class="bi bi-qr-code-scan me-2" aria-hidden="true"></i>Presensi Kode Sesi
				</a>
				<a href="/classes" class="btn btn-outline-secondary">Lihat Semua Kelas</a>
			</div>
		{/if}
	</div>

	{#if student?.status === 'on_leave'}
		<!-- Tampilan khusus Mahasiswa Cuti (Sari Dewi - AC-03 & BR-02) -->
		<div class="row g-3">
			<div class="col-12 col-lg-7">
				<div class="card shadow-sm">
					<div class="card-body p-3 p-lg-4">
						<h2 class="h4 mb-3">Ringkasan Akademik Mahasiswa Cuti</h2>
						<p class="text-muted-upl">
							Sesuai aturan akademik <strong>BR-02</strong>, mahasiswa berstatus <strong>Cuti</strong> dapat masuk ke PelitaLearn untuk melihat profil dan riwayat nilai, namun tidak dapat mengakses kelas aktif atau mengumpulkan tugas pada semester berjalan.
						</p>
						<dl class="row mb-0">
							<dt class="col-sm-4 text-muted-upl">NIM</dt>
							<dd class="col-sm-8 mono fw-semibold">{student.nim}</dd>
							<dt class="col-sm-4 text-muted-upl">Nama Lengkap</dt>
							<dd class="col-sm-8">{student.full_name}</dd>
							<dt class="col-sm-4 text-muted-upl">Program Studi</dt>
							<dd class="col-sm-8">Informatika (Fakultas Teknik)</dd>
							<dt class="col-sm-4 text-muted-upl">Status Semester Ini</dt>
							<dd class="col-sm-8"><span class="badge rounded-pill text-bg-warning">Cuti</span></dd>
						</dl>
						<div class="d-flex flex-wrap gap-2 mt-3">
							<a href="/grades" class="btn btn-primary">Lihat Riwayat Nilai</a>
							<a href="/profile" class="btn btn-outline-secondary">Lihat Profil Saya</a>
						</div>
					</div>
				</div>
			</div>
			<div class="col-12 col-lg-5">
				<div class="card bg-teal-subtle-upl border-0 shadow-sm">
					<div class="card-body p-3 p-lg-4">
						<h2 class="h5 mb-2">Butuh Bantuan Administrasi?</h2>
						<p class="small text-muted-upl mb-3">
							Apabila Anda telah menyelesaikan masa cuti atau terdapat kekeliruan status akademik, hubungi bagian Admin Akademik:
						</p>
						<div class="p-3 bg-white rounded-3 border small">
							<div class="fw-bold">Agus Setiawan (Admin Akademik)</div>
							<div class="mono text-muted-upl">agus.setiawan@lms.example</div>
							<div class="text-muted-upl mt-1">Gedung Rektorat Lt. 2 · Senin–Jumat 08.00–16.00 WIB</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<!-- Kartu Ringkasan (col-6 col-lg-3 sesuai desain.md §5.3) -->
		<div class="row g-3 mb-4">
			<div class="col-6 col-lg-3">
				<div class="card upl-stat-card h-100">
					<div class="card-body p-3">
						<div class="small text-muted-upl fw-medium mb-1">Kelas aktif</div>
						<div class="upl-stat-value">{studentClasses.length}</div>
						<div class="small text-muted-upl mt-1">9 SKS semester ini</div>
					</div>
				</div>
			</div>
			<div class="col-6 col-lg-3">
				<div class="card upl-stat-card h-100">
					<div class="card-body p-3">
						<div class="small text-muted-upl fw-medium mb-1">Tugas belum kumpul</div>
						<div class="upl-stat-value">{unsubmittedAssignmentsCount}</div>
						<div class="small text-muted-upl mt-1">Tenggat terdekat 22 Okt</div>
					</div>
				</div>
			</div>
			<div class="col-6 col-lg-3">
				<div class="card upl-stat-card h-100">
					<div class="card-body p-3">
						<div class="small text-muted-upl fw-medium mb-1">Kuis minggu ini</div>
						<div class="upl-stat-value">1</div>
						<div class="small text-muted-upl mt-1">Selasa, 20 Okt (20 mnt)</div>
					</div>
				</div>
			</div>
			<div class="col-6 col-lg-3">
				<div class="card upl-stat-card h-100">
					<div class="card-body p-3">
						<div class="small text-muted-upl fw-medium mb-1">Kehadiran INF301</div>
						<div class="upl-stat-value">100%</div>
						<div class="small text-muted-upl mt-1">Memenuhi syarat UAS (≥75%)</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Susunan Grid S03: Jadwal col-12 col-lg-7; Tenggat col-12 col-lg-5 -->
		<div class="row g-3">
			<!-- Kolom Kiri: Jadwal Hari Ini & Progres Kelas & Pengumuman -->
			<div class="col-12 col-lg-7 vstack gap-3">
				<section class="card shadow-sm" aria-labelledby="heading-jadwal">
					<div class="card-body p-3 p-lg-4">
						<div class="d-flex justify-content-between align-items-center mb-3">
							<h2 id="heading-jadwal" class="h4 mb-0">Jadwal hari ini</h2>
							<span class="badge rounded-pill text-bg-primary">Senin</span>
						</div>

						<div class="p-3 rounded-3 border bg-light mb-3">
							<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-start gap-2">
								<div>
									<div class="d-flex align-items-center gap-2 mb-1">
										<span class="mono fw-bold text-primary">08:00–10:30 WIB</span>
										<span class="badge rounded-pill text-bg-success">Sesi Presensi Terbuka</span>
									</div>
									<h3 class="h5 mb-1">Pemrograman Visual (<span class="mono">INF301-5A</span>)</h3>
									<div class="small text-muted-upl">
										<i class="bi bi-geo-alt me-1" aria-hidden="true"></i>Lab Komputer 2 · Dr. Ahmad Fauzi, M.Kom.
									</div>
								</div>
								<div class="d-flex flex-sm-column gap-2">
									<a href="/classes/1?tab=presensi" class="btn btn-primary btn-sm">
										Isi Presensi (PV-7X4K)
									</a>
									<a href="/classes/1" class="btn btn-outline-secondary btn-sm">
										Buka Kelas
									</a>
								</div>
							</div>
						</div>

						<h3 class="h6 text-muted-upl mb-2">Progres Belajar Semester Ini</h3>
						<div class="vstack gap-3">
							{#each studentClasses as item}
								<div class="border rounded-3 p-3">
									<div class="d-flex justify-content-between align-items-center mb-1">
										<a href="/classes/{item.cls?.id}" class="fw-bold text-decoration-none">
											<span class="mono">{item.cls?.class_code}</span> — {item.crs?.name}
										</a>
										<span class="small text-muted-upl tabular-nums">
											{item.prog.completed} dari {item.prog.total} materi selesai
										</span>
									</div>
									<div
										class="progress"
										role="progressbar"
										aria-label="Progres belajar {item.cls?.class_code}"
										aria-valuenow={item.prog.percent}
										aria-valuemin={0}
										aria-valuemax={100}
									>
										<div class="progress-bar" style="width: {item.prog.percent}%">
											{item.prog.percent}%
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</section>

				<!-- Pengumuman Terbaru -->
				<section class="card shadow-sm" aria-labelledby="heading-pengumuman">
					<div class="card-body p-3 p-lg-4">
						<div class="d-flex justify-content-between align-items-center mb-3">
							<h2 id="heading-pengumuman" class="h4 mb-0">Pengumuman terbaru</h2>
							<a href="/announcements" class="small fw-medium">Lihat semua</a>
						</div>
						<div class="list-group list-group-flush">
							{#each lms.announcements.slice(0, 3) as ann}
								{@const cls = lms.courseClasses.find((c) => c.id === ann.course_class_id)}
								<a href="/announcements" class="list-group-item list-group-item-action px-0 py-3">
									<div class="d-flex justify-content-between align-items-center mb-1 gap-2">
										<span class="badge rounded-pill {cls ? 'text-bg-primary' : 'text-bg-dark'}">
											{cls ? cls.class_code : 'Global Kampus'}
										</span>
										<small class="text-muted-upl">{formatDateShortId(ann.published_at)}</small>
									</div>
									<div class="fw-semibold">{ann.title}</div>
									<div class="small text-muted-upl text-truncate">{ann.body}</div>
								</a>
							{/each}
						</div>
					</div>
				</section>
			</div>

			<!-- Kolom Kanan: Tenggat Terdekat (col-12 col-lg-5) -->
			<div class="col-12 col-lg-5 vstack gap-3">
				<section class="card shadow-sm" aria-labelledby="heading-tenggat">
					<div class="card-body p-3 p-lg-4">
						<div class="d-flex justify-content-between align-items-center mb-3">
							<h2 id="heading-tenggat" class="h4 mb-0">Tenggat terdekat</h2>
							<span class="badge rounded-pill text-bg-light border text-dark">Oktober 2026</span>
						</div>

						<div class="list-group list-group-flush">
							{#each studentDeadlines as dl (dl.id)}
								<a
									href={dl.href}
									class="list-group-item list-group-item-action px-0 py-3 d-flex justify-content-between align-items-start gap-3"
								>
									<div class="d-flex gap-3 align-items-start">
										<div
											class="rounded-3 p-2 text-center border bg-light flex-shrink-0"
											style="min-width: 58px;"
										>
											<div class="fw-bold small text-primary">{dl.dateShort}</div>
											<div class="text-muted-upl" style="font-size: 0.7rem;">23.59 WIB</div>
										</div>
										<div>
											<div class="fw-semibold mb-1">{dl.title}</div>
											<div class="small text-muted-upl">
												<span class="mono">{dl.classCode}</span> · {formatDateTimeWib(dl.dueAt, true)}
											</div>
										</div>
									</div>
									<span class="badge rounded-pill {dl.badgeClass} flex-shrink-0">{dl.badgeLabel}</span>
								</a>
							{/each}
						</div>
					</div>
				</section>

				<!-- Ringkasan Nilai Sementara -->
				<section class="card bg-teal-subtle-upl border-0 shadow-sm" aria-labelledby="heading-nilai-ringkas">
					<div class="card-body p-3 p-lg-4">
						<h2 id="heading-nilai-ringkas" class="h5 mb-2">Nilai Sementara INF301-5A</h2>
						<p class="small text-muted-upl mb-3">
							Simulasi rekap nilai berdasarkan bobot komponen (Kehadiran 10%, Tugas 30%, Kuis 10%, UTS 25%, UAS 25%):
						</p>
						<div class="d-flex justify-content-between align-items-center bg-white p-3 rounded-3 border mb-3">
							<div>
								<div class="small text-muted-upl">Nilai Akhir Sementara</div>
								<div class="h3 mb-0 tabular-nums">{formatScore(studentEnrollments[0]?.final_score ?? 90.5)}</div>
							</div>
							<div class="text-end">
								<div class="small text-muted-upl">Huruf Mutu</div>
								<span class="badge rounded-pill text-bg-success fs-5 px-3">
									{studentEnrollments[0]?.letter_grade ?? 'A'}
								</span>
							</div>
						</div>
						<a href="/grades" class="btn btn-outline-primary w-100">
							Lihat Rincian Nilai Semua Kelas (S08)
						</a>
					</div>
				</section>
			</div>
		</div>
	{/if}
{:else if user.role === 'lecturer'}
	<!-- ===================================================================== -->
	<!-- S09 — DASHBOARD DOSEN (desain.md §8 S09 & PRD FR-DSH-02)              -->
	<!-- ===================================================================== -->
	<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
		<div>
			<h1 class="h2 mb-1">Dashboard Dosen</h1>
			<p class="text-muted-upl mb-0">
				Selamat datang, <strong>{user.full_name}</strong> (<span class="mono">NIDN {user.username}</span>) · {lms.activeTerm.name}
			</p>
		</div>
		<div class="d-flex flex-wrap gap-2">
			<a href="/lecturer/attendance" class="btn btn-primary">
				<i class="bi bi-qr-code me-2" aria-hidden="true"></i>Buka Sesi Presensi (S12)
			</a>
			<a href="/lecturer/content" class="btn btn-outline-secondary">
				<i class="bi bi-plus-circle me-1" aria-hidden="true"></i>Kelola Konten (S10)
			</a>
		</div>
	</div>

	<!-- Kartu Ringkasan Dosen -->
	<div class="row g-3 mb-4">
		<div class="col-6 col-lg-3">
			<div class="card upl-stat-card h-100">
				<div class="card-body p-3">
					<div class="small text-muted-upl fw-medium mb-1">Tugas perlu dinilai</div>
					<div class="upl-stat-value">{pendingSubmissionsForLecturer.length}</div>
					<div class="small text-muted-upl mt-1">T-002 Audit UI/UX</div>
				</div>
			</div>
		</div>
		<div class="col-6 col-lg-3">
			<div class="card upl-stat-card h-100">
				<div class="card-body p-3">
					<div class="small text-muted-upl fw-medium mb-1">Kelas diampu</div>
					<div class="upl-stat-value">{lecturerClasses.length}</div>
					<div class="small text-muted-upl mt-1">INF301-5A & INF312-5A</div>
				</div>
			</div>
		</div>
		<div class="col-6 col-lg-3">
			<div class="card upl-stat-card h-100">
				<div class="card-body p-3">
					<div class="small text-muted-upl fw-medium mb-1">Sesi presensi hari ini</div>
					<div class="upl-stat-value">1</div>
					<div class="small text-muted-upl mt-1">Kode aktif: <span class="mono fw-bold">PV-7X4K</span></div>
				</div>
			</div>
		</div>
		<div class="col-6 col-lg-3">
			<div class="card upl-stat-card h-100">
				<div class="card-body p-3">
					<div class="small text-muted-upl fw-medium mb-1">Total peserta kelas</div>
					<div class="upl-stat-value">6</div>
					<div class="small text-muted-upl mt-1">Mahasiswa terdaftar aktif</div>
				</div>
			</div>
		</div>
	</div>

	<div class="row g-3">
		<div class="col-12 col-lg-8">
			<section class="card shadow-sm" aria-labelledby="heading-perlu-dinilai">
				<div class="card-body p-3 p-lg-4">
					<div class="d-flex justify-content-between align-items-center mb-3">
						<h2 id="heading-perlu-dinilai" class="h4 mb-0">Pengumpulan Perlu Dinilai</h2>
						<a href="/lecturer/grading" class="btn btn-outline-primary btn-sm">
							Buka Layar Penilaian (S11)
						</a>
					</div>

					{#if pendingSubmissionsForLecturer.length === 0}
						<div class="text-center py-4 text-muted-upl">
							<i class="bi bi-check2-all fs-2 d-block mb-2 text-success" aria-hidden="true"></i>
							Seluruh pengumpulan tugas mahasiswa telah selesai dinilai.
						</div>
					{:else}
						<!-- Tabel untuk >= 768px -->
						<div class="table-responsive d-none d-md-block">
							<table class="table table-hover align-middle mb-0">
								<caption class="visually-hidden">Daftar pengumpulan tugas mahasiswa yang perlu dinilai</caption>
								<thead class="table-light">
									<tr>
										<th scope="col">NIM</th>
										<th scope="col">Mahasiswa</th>
										<th scope="col">Kelas / Tugas</th>
										<th scope="col">Waktu Kumpul</th>
										<th scope="col" class="text-end">Aksi</th>
									</tr>
								</thead>
								<tbody>
									{#each pendingSubmissionsForLecturer as item (item.sub.id)}
										<tr>
											<td class="mono">{item.st?.nim}</td>
											<td class="fw-medium">{item.st?.full_name}</td>
											<td>
												<span class="mono badge text-bg-light border">{item.cls?.class_code}</span>
												<div class="small text-muted-upl">{item.asg?.code} — {item.asg?.title}</div>
											</td>
											<td class="small">{formatDateTimeWib(item.sub.submitted_at, true)}</td>
											<td class="text-end">
												<a
													href="/lecturer/grading?assignment={item.asg?.id}&submission={item.sub.id}"
													class="btn btn-primary btn-sm"
													aria-label="Nilai tugas {item.st?.full_name}"
												>
													Nilai
												</a>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>

						<!-- Kartu untuk < 768px (desain.md §6.2) -->
						<div class="d-md-none vstack gap-2">
							{#each pendingSubmissionsForLecturer as item (item.sub.id)}
								<div class="card">
									<div class="card-body p-3">
										<div class="d-flex justify-content-between align-items-start mb-1">
											<h3 class="h6 mb-0">{item.st?.full_name}</h3>
											<span class="badge rounded-pill text-bg-primary">Dikumpulkan</span>
										</div>
										<p class="small text-muted-upl mb-2">
											<span class="mono">{item.st?.nim}</span> · {item.cls?.class_code} ({item.asg?.code})
										</p>
										<div class="small text-muted-upl mb-3">
											Dikumpulkan: {formatDateTimeWib(item.sub.submitted_at, true)}
										</div>
										<a
											href="/lecturer/grading?assignment={item.asg?.id}&submission={item.sub.id}"
											class="btn btn-primary btn-sm w-100"
										>
											Nilai Pengumpulan
										</a>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</section>
		</div>

		<div class="col-12 col-lg-4 vstack gap-3">
			<section class="card shadow-sm" aria-labelledby="heading-kelas-dosen">
				<div class="card-body p-3 p-lg-4">
					<h2 id="heading-kelas-dosen" class="h4 mb-3">Kelas yang Diampu</h2>
					<div class="vstack gap-3">
						{#each lecturerClasses as cls}
							{@const crs = lms.courses.find((c) => c.id === cls.course_id)}
							<div class="border rounded-3 p-3">
								<div class="d-flex justify-content-between align-items-center mb-1">
									<span class="mono fw-bold text-primary">{cls.class_code}</span>
									<span class="badge rounded-pill text-bg-light border">{crs?.credits} SKS</span>
								</div>
								<h3 class="h6 mb-1">{crs?.name}</h3>
								<div class="small text-muted-upl mb-3">
									{cls.day_of_week}, {cls.starts_at}–{cls.ends_at} WIB · {cls.room}
								</div>
								<div class="d-flex flex-wrap gap-2">
									<a href="/classes/{cls.id}" class="btn btn-outline-primary btn-sm">Detail</a>
									<a href="/lecturer/grades?class={cls.id}" class="btn btn-outline-secondary btn-sm">
										Rekap Nilai (S13)
									</a>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</section>
		</div>
	</div>
{:else}
	<!-- ===================================================================== -->
	<!-- FR-DSH-03 — DASHBOARD ADMIN AKADEMIK & SUPER ADMIN                    -->
	<!-- ===================================================================== -->
	<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
		<div>
			<h1 class="h2 mb-1">Dashboard Administrasi Akademik</h1>
			<p class="text-muted-upl mb-0">
				{user.full_name} · {lms.activeTerm.name}
			</p>
		</div>
		<div class="d-flex flex-wrap gap-2">
			<a href="/admin/students/create" class="btn btn-primary">
				<i class="bi bi-person-plus-fill me-2" aria-hidden="true"></i>Tambah Mahasiswa (S15)
			</a>
			<a href="/admin/classes" class="btn btn-outline-secondary">
				Kelola Kelas & Enrolment (S16)
			</a>
		</div>
	</div>

	<div class="row g-3 mb-4">
		<div class="col-6 col-lg-3">
			<div class="card upl-stat-card h-100">
				<div class="card-body p-3">
					<div class="small text-muted-upl fw-medium mb-1">Mahasiswa terdaftar</div>
					<div class="upl-stat-value">{lms.students.length}</div>
					<div class="small text-muted-upl mt-1">
						{lms.students.filter((s) => s.status === 'active').length} Aktif · {lms.students.filter((s) => s.status === 'on_leave').length} Cuti
					</div>
				</div>
			</div>
		</div>
		<div class="col-6 col-lg-3">
			<div class="card upl-stat-card h-100">
				<div class="card-body p-3">
					<div class="small text-muted-upl fw-medium mb-1">Kelas aktif</div>
					<div class="upl-stat-value">{lms.courseClasses.length}</div>
					<div class="small text-muted-upl mt-1">5 Program Studi</div>
				</div>
			</div>
		</div>
		<div class="col-6 col-lg-3">
			<div class="card upl-stat-card h-100">
				<div class="card-body p-3">
					<div class="small text-muted-upl fw-medium mb-1">Dosen pengampu</div>
					<div class="upl-stat-value">{lms.lecturers.length}</div>
					<div class="small text-muted-upl mt-1">FT & FEB</div>
				</div>
			</div>
		</div>
		<div class="col-6 col-lg-3">
			<div class="card upl-stat-card h-100">
				<div class="card-body p-3">
					<div class="small text-muted-upl fw-medium mb-1">Jejak audit tercatat</div>
					<div class="upl-stat-value">{lms.auditLogs.length}</div>
					<div class="small text-muted-upl mt-1">Kesehatan sistem: 99,9%</div>
				</div>
			</div>
		</div>
	</div>

	<div class="row g-3">
		<div class="col-12 col-lg-7">
			<section class="card shadow-sm" aria-labelledby="heading-audit-terbaru">
				<div class="card-body p-3 p-lg-4">
					<div class="d-flex justify-content-between align-items-center mb-3">
						<h2 id="heading-audit-terbaru" class="h4 mb-0">Aktivitas Audit Log Terbaru</h2>
						<a href="/admin/reports?tab=audit" class="btn btn-outline-primary btn-sm">
							Lihat Semua Audit Log (S20)
						</a>
					</div>
					<div class="list-group list-group-flush">
						{#each lms.auditLogs.slice(0, 5) as log (log.id)}
							<div class="list-group-item px-0 py-3">
								<div class="d-flex justify-content-between align-items-center mb-1">
									<span class="mono badge text-bg-light border text-dark">{log.action}</span>
									<small class="text-muted-upl">{formatDateTimeWib(log.created_at, true)}</small>
								</div>
								<div class="fw-semibold small">
									{log.user_name} → <span class="mono">{log.subject_id}</span>
								</div>
								<div class="small text-muted-upl">{log.reason}</div>
							</div>
						{/each}
					</div>
				</div>
			</section>
		</div>

		<div class="col-12 col-lg-5">
			<section class="card shadow-sm" aria-labelledby="heading-modul-admin">
				<div class="card-body p-3 p-lg-4">
					<h2 id="heading-modul-admin" class="h4 mb-3">Pintasan Modul Admin</h2>
					<div class="vstack gap-2">
						<a href="/admin/students" class="btn btn-outline-primary text-start d-flex justify-content-between align-items-center">
							<span><i class="bi bi-people me-2" aria-hidden="true"></i>Data Mahasiswa & Impor CSV (S14)</span>
							<i class="bi bi-chevron-right" aria-hidden="true"></i>
						</a>
						<a href="/admin/students/create" class="btn btn-outline-primary text-start d-flex justify-content-between align-items-center">
							<span><i class="bi bi-person-plus me-2" aria-hidden="true"></i>Form Tambah Mahasiswa (S15)</span>
							<i class="bi bi-chevron-right" aria-hidden="true"></i>
						</a>
						<a href="/admin/classes" class="btn btn-outline-primary text-start d-flex justify-content-between align-items-center">
							<span><i class="bi bi-building-gear me-2" aria-hidden="true"></i>Mata Kuliah, Kelas & Enrolment (S16)</span>
							<i class="bi bi-chevron-right" aria-hidden="true"></i>
						</a>
						<a href="/admin/reports" class="btn btn-outline-primary text-start d-flex justify-content-between align-items-center">
							<span><i class="bi bi-file-earmark-bar-graph me-2" aria-hidden="true"></i>Laporan, Koreksi Nilai & Audit Log (S20)</span>
							<i class="bi bi-chevron-right" aria-hidden="true"></i>
						</a>
					</div>
				</div>
			</section>
		</div>
	</div>
{/if}

