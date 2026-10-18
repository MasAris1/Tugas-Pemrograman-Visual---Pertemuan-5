<script lang="ts">
	import { page } from '$app/state';
	import { lms } from '$lib/store.svelte';
	import {
		attendanceStatusBadge,
		formatDateId,
		formatDateShortId,
		formatDateTimeWib,
		formatScore,
		materialStatusBadge,
		submissionStatusBadge
	} from '$lib/format';

	const classId = $derived(Number(page.params.id) || 1);
	const initialTab = $derived(page.url.searchParams.get('tab') || 'ringkasan');
	let activeTab = $state('ringkasan');

	$effect(() => {
		const t = page.url.searchParams.get('tab');
		if (t) activeTab = t;
	});

	const user = $derived(lms.currentUser);
	const student = $derived(lms.currentStudent);
	const isStudentOnLeave = $derived(student?.status === 'on_leave');

	const courseClass = $derived(
		lms.courseClasses.find((c) => c.id === classId) ?? lms.courseClasses[0]
	);
	const course = $derived(lms.courses.find((c) => c.id === courseClass?.course_id));
	const lecturer = $derived(lms.lecturers.find((l) => l.id === courseClass?.lecturer_id));

	const currentEnrollment = $derived(
		student
			? lms.enrollments.find(
					(e) => e.course_class_id === courseClass.id && e.student_id === student.id
				) ?? lms.enrollments.find((e) => e.course_class_id === courseClass.id)
			: lms.enrollments.find((e) => e.course_class_id === courseClass.id)
	);

	const classMaterials = $derived(
		lms.materials
			.filter(
				(m) =>
					m.course_class_id === courseClass.id &&
					(user?.role !== 'student' || m.status === 'published')
			)
			.sort((a, b) => a.meeting_no - b.meeting_no)
	);

	const classProgress = $derived(
		currentEnrollment
			? lms.getClassProgress(courseClass.id, currentEnrollment.id)
			: { completed: 4, total: 5, percent: 80 }
	);

	const classAssignments = $derived(
		lms.assignments.filter((a) => a.course_class_id === courseClass.id)
	);

	const classQuizzes = $derived(
		lms.quizzes.filter((q) => q.course_class_id === courseClass.id)
	);

	const classAnnouncements = $derived(
		lms.announcements.filter((a) => a.course_class_id === courseClass.id)
	);

	const classSessions = $derived(
		lms.attendanceSessions
			.filter((s) => s.course_class_id === courseClass.id)
			.sort((a, b) => a.meeting_no - b.meeting_no)
	);

	const openSession = $derived(classSessions.find((s) => s.is_open));

	// State Presensi Mahasiswa (AC-04)
	let attendanceCodeInput = $state('PV-7X4K');
	let attendanceFeedback = $state<{ ok: boolean; message: string } | null>(null);

	function handleAttendanceCheckIn(e: SubmitEvent) {
		e.preventDefault();
		if (!currentEnrollment) return;
		attendanceFeedback = lms.checkInWithCode({
			courseClassId: courseClass.id,
			enrollmentId: currentEnrollment.id,
			code: attendanceCodeInput
		});
	}

	// State Forum Diskusi (FR-FRM-01..02)
	const classThreads = $derived(
		lms.discussionThreads
			.filter((t) => t.course_class_id === courseClass.id)
			.sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned))
	);
	let newThreadTitle = $state('');
	let newThreadBody = $state('');
	let replyTexts = $state<Record<number, string>>({});

	function handleCreateThread(e: SubmitEvent) {
		e.preventDefault();
		if (!newThreadTitle.trim() || !newThreadBody.trim() || !user) return;
		const newId = Math.max(0, ...lms.discussionThreads.map((t) => t.id)) + 1;
		lms.discussionThreads.push({
			id: newId,
			course_class_id: courseClass.id,
			author_user_id: user.id,
			author_name: user.full_name,
			author_role: user.role,
			title: newThreadTitle.trim(),
			body: newThreadBody.trim(),
			created_at: new Date().toISOString(),
			is_pinned: false,
			is_closed: false
		});
		newThreadTitle = '';
		newThreadBody = '';
		lms.persist();
		lms.addToast('Topik diskusi baru berhasil diterbitkan.', 'success');
	}

	function handleReply(threadId: number) {
		const text = replyTexts[threadId]?.trim();
		if (!text || !user) return;
		const newId = Math.max(0, ...lms.discussionPosts.map((p) => p.id)) + 1;
		lms.discussionPosts.push({
			id: newId,
			thread_id: threadId,
			author_user_id: user.id,
			author_name: user.full_name,
			author_role: user.role,
			body: text,
			created_at: new Date().toISOString()
		});
		replyTexts[threadId] = '';
		lms.persist();
		lms.addToast('Balasan diskusi berhasil dikirim.', 'success');
	}

	function togglePin(threadId: number) {
		const th = lms.discussionThreads.find((t) => t.id === threadId);
		if (th) {
			th.is_pinned = !th.is_pinned;
			lms.persist();
			lms.addToast(
				th.is_pinned ? 'Diskusi disematkan di urutan teratas.' : 'Semat diskusi dilepas.',
				'info'
			);
		}
	}

	function toggleCloseThread(threadId: number) {
		const th = lms.discussionThreads.find((t) => t.id === threadId);
		if (th) {
			th.is_closed = !th.is_closed;
			lms.persist();
			lms.addToast(th.is_closed ? 'Thread diskusi ditutup.' : 'Thread diskusi dibuka kembali.', 'info');
		}
	}

	function deleteThread(threadId: number) {
		lms.discussionThreads = lms.discussionThreads.filter((t) => t.id !== threadId);
		lms.persist();
		lms.addToast('Thread diskusi berhasil dihapus.', 'info');
	}

	function isMaterialCompleted(materialId: number): boolean {
		if (!currentEnrollment) return false;
		return lms.materialProgress.some(
			(mp) => mp.material_id === materialId && mp.enrollment_id === currentEnrollment.id
		);
	}
</script>

<svelte:head>
	<title>{courseClass.class_code} — {course?.name} | PelitaLearn</title>
</svelte:head>

<!-- Breadcrumb (desain.md §6 & §8 S05) -->
<nav aria-label="Jejak halaman" class="mb-2">
	<ol class="breadcrumb mb-0 small">
		<li class="breadcrumb-item"><a href="/classes">Kelas Saya</a></li>
		<li class="breadcrumb-item active mono" aria-current="page">{courseClass.class_code}</li>
	</ol>
</nav>

{#if isStudentOnLeave}
	<div class="card shadow-sm p-4 text-center">
		<h1 class="h3 mb-2">Kelas Tidak Dapat Dibuka (Status Cuti)</h1>
		<p class="text-muted-upl mb-3">
			Status Anda saat ini Cuti, sehingga kelas aktif tidak dapat dibuka. Hubungi admin akademik bila status ini keliru (AC-03).
		</p>
		<div>
			<a href="/grades" class="btn btn-primary">Lihat Riwayat Nilai</a>
		</div>
	</div>
{:else}
	<!-- Header Kelas sesuai Wireframe S05 -->
	<div class="card shadow-sm mb-4">
		<div class="card-body p-3 p-lg-4">
			<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
				<div>
					<div class="d-flex align-items-center gap-2 mb-1">
						<span class="badge rounded-pill text-bg-primary mono">{courseClass.class_code}</span>
						<span class="badge rounded-pill text-bg-light border text-dark">{course?.credits} SKS</span>
					</div>
					<h1 class="h2 mb-1">{course?.name}</h1>
					<p class="text-muted-upl mb-0">
						{lecturer?.full_name} &nbsp;|&nbsp; {courseClass.day_of_week} {courseClass.starts_at}–{courseClass.ends_at} WIB &nbsp;|&nbsp; {courseClass.room}
					</p>
				</div>
				<div class="d-flex flex-wrap gap-2">
					{#if courseClass.meeting_link}
						<a
							href={courseClass.meeting_link}
							target="_blank"
							rel="noopener noreferrer"
							class="btn btn-primary"
						>
							<i class="bi bi-camera-video me-2" aria-hidden="true"></i>Buka tautan kelas
						</a>
					{/if}
					{#if user?.role === 'lecturer'}
						<a href="/lecturer/content?class={courseClass.id}" class="btn btn-outline-secondary">
							Kelola Konten (S10)
						</a>
					{/if}
				</div>
			</div>

			<!-- Sub-halaman Kelas nav-tabs (desain.md §6 & §8 S05) -->
			<ul class="nav nav-tabs flex-nowrap overflow-auto mt-4" role="tablist">
				{#each [
					{ id: 'ringkasan', label: 'Ringkasan', icon: 'bi-layout-text-window-reverse' },
					{ id: 'materi', label: 'Materi', icon: 'bi-file-earmark-pdf' },
					{ id: 'tugas', label: 'Tugas', icon: 'bi-file-earmark-check' },
					{ id: 'kuis', label: 'Kuis', icon: 'bi-stopwatch' },
					{ id: 'forum', label: 'Forum', icon: 'bi-chat-left-text' },
					{ id: 'presensi', label: 'Presensi', icon: 'bi-qr-code-scan' },
					{ id: 'nilai', label: 'Nilai', icon: 'bi-bar-chart-line' }
				] as tab}
					<li class="nav-item" role="presentation">
						<button
							type="button"
							class="nav-link {activeTab === tab.id ? 'active' : ''}"
							role="tab"
							aria-selected={activeTab === tab.id}
							onclick={() => (activeTab = tab.id)}
						>
							<i class="bi {tab.icon}" aria-hidden="true"></i>
							<span>{tab.label}</span>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<!-- ISI TAB -->
	{#if activeTab === 'ringkasan'}
		<div class="row g-3">
			<div class="col-12 col-lg-8 vstack gap-3">
				<!-- Progres Belajar (desain.md Lampiran D) -->
				<div class="card shadow-sm">
					<div class="card-body p-3 p-lg-4">
						<div class="d-flex justify-content-between align-items-center mb-2">
							<div class="fw-semibold">
								Progres belajar: {classProgress.completed} dari {classProgress.total} materi selesai
							</div>
							<span class="fw-bold text-primary tabular-nums">{classProgress.percent}%</span>
						</div>
						<div
							class="progress"
							role="progressbar"
							aria-label="Progres belajar {courseClass.class_code}"
							aria-valuenow={classProgress.percent}
							aria-valuemin={0}
							aria-valuemax={100}
						>
							<div class="progress-bar" style="width: {classProgress.percent}%">
								{classProgress.percent}%
							</div>
						</div>
					</div>
				</div>

				<!-- Materi Terbaru -->
				<div class="card shadow-sm">
					<div class="card-body p-3 p-lg-4">
						<div class="d-flex justify-content-between align-items-center mb-3">
							<h2 class="h4 mb-0">Materi terbaru</h2>
							<button
								type="button"
								class="btn btn-link btn-sm p-0"
								onclick={() => (activeTab = 'materi')}
							>
								Lihat semua pertemuan
							</button>
						</div>

						<div class="list-group list-group-flush">
							{#each classMaterials.slice(-3).reverse() as mat (mat.id)}
								<div class="list-group-item px-0 py-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
									<div>
										<div class="d-flex align-items-center gap-2 mb-1">
											<span class="mono fw-bold text-primary">{mat.code}</span>
											<span class="badge rounded-pill text-bg-light border">{mat.file_format}</span>
											{#if isMaterialCompleted(mat.id)}
												<span class="badge rounded-pill text-bg-success">Selesai</span>
											{/if}
										</div>
										<div class="fw-semibold">{mat.title}</div>
										<div class="small text-muted-upl">{mat.description}</div>
									</div>
									<div class="d-flex gap-2 flex-shrink-0">
										<button
											type="button"
											class="btn btn-outline-primary btn-sm"
											onclick={() =>
												lms.addToast(`Mengunduh berkas ${mat.file_name} (${mat.file_size_mb} MB)...`, 'info')}
										>
											<i class="bi bi-download me-1" aria-hidden="true"></i>Unduh
										</button>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<div class="col-12 col-lg-4 vstack gap-3">
				<!-- Pengumuman Kelas -->
				<div class="card shadow-sm">
					<div class="card-body p-3 p-lg-4">
						<h2 class="h5 mb-3">Pengumuman kelas</h2>
						{#if classAnnouncements.length === 0}
							<p class="small text-muted-upl mb-0">Belum ada pengumuman khusus untuk kelas ini.</p>
						{:else}
							{#each classAnnouncements as ann (ann.id)}
								<div class="p-3 rounded-3 bg-teal-subtle-upl mb-2">
									<div class="fw-bold small mb-1">{ann.title}</div>
									<p class="small mb-2">{ann.body}</p>
									<div class="small text-muted-upl">
										{ann.author_name} · {formatDateShortId(ann.published_at)}
									</div>
								</div>
							{/each}
						{/if}
					</div>
				</div>

				<!-- Pintasan Tugas & Kuis Aktif -->
				<div class="card shadow-sm">
					<div class="card-body p-3 p-lg-4">
						<h2 class="h5 mb-3">Kewajiban Aktif</h2>
						<div class="vstack gap-2">
							{#each classAssignments.filter((a) => a.status === 'published') as asg}
								<a
									href="/classes/{courseClass.id}/assignments/{asg.id}"
									class="btn btn-outline-primary text-start d-flex justify-content-between align-items-center"
								>
									<span>
										<strong class="mono">{asg.code}:</strong> {asg.title}
									</span>
									<i class="bi bi-chevron-right" aria-hidden="true"></i>
								</a>
							{/each}
							{#each classQuizzes as qz}
								<a
									href="/quizzes/{qz.id}/attempt"
									class="btn btn-outline-secondary text-start d-flex justify-content-between align-items-center"
								>
									<span>
										<strong class="mono">{qz.code}:</strong> {qz.title}
									</span>
									<i class="bi bi-chevron-right" aria-hidden="true"></i>
								</a>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else if activeTab === 'materi'}
		<!-- TAB MATERI (FR-MAT-01..04) -->
		<div class="card shadow-sm">
			<div class="card-body p-3 p-lg-4">
				<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
					<div>
						<h2 class="h4 mb-1">Materi Perkuliahan per Pertemuan</h2>
						<p class="small text-muted-upl mb-0">
							Unduh bahan ajar dan tandai selesai untuk mencatat progres belajar Anda.
						</p>
					</div>
					{#if user?.role === 'lecturer'}
						<a href="/lecturer/content?class={courseClass.id}" class="btn btn-primary btn-sm">
							<i class="bi bi-upload me-1" aria-hidden="true"></i>Unggah Materi Baru
						</a>
					{/if}
				</div>

				<div class="vstack gap-3">
					{#each classMaterials as mat (mat.id)}
						{@const completed = isMaterialCompleted(mat.id)}
						{@const matBadge = materialStatusBadge(mat.status)}
						<div class="card border">
							<div class="card-body p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
								<div>
									<div class="d-flex flex-wrap align-items-center gap-2 mb-1">
										<span class="badge rounded-pill text-bg-dark mono">Pertemuan {mat.meeting_no} ({mat.code})</span>
										<span class="badge rounded-pill text-bg-light border">{mat.file_format}</span>
										<span class="badge rounded-pill {matBadge.badgeClass}">{matBadge.label}</span>
										{#if completed}
											<span class="badge rounded-pill text-bg-success">
												<i class="bi bi-check-lg me-1" aria-hidden="true"></i>Selesai dipelajari
											</span>
										{/if}
									</div>
									<h3 class="h5 mb-1">{mat.title}</h3>
									<p class="small text-muted-upl mb-1">{mat.description}</p>
									{#if mat.file_name}
										<div class="small text-muted-upl mono">
											Berkas: {mat.file_name} ({mat.file_size_mb} MB)
										</div>
									{/if}
								</div>

								<div class="d-flex flex-wrap gap-2 flex-shrink-0">
									<button
										type="button"
										class="btn btn-outline-secondary btn-sm"
										onclick={() =>
											lms.addToast(`Membuka pratinjau ${mat.file_name ?? mat.title}...`, 'info')}
									>
										<i class="bi bi-file-earmark-arrow-down me-1" aria-hidden="true"></i>Unduh ({mat.file_format})
									</button>
									{#if currentEnrollment}
										<button
											type="button"
											class="btn {completed ? 'btn-outline-success' : 'btn-primary'} btn-sm"
											onclick={() => lms.toggleMaterialCompleted(mat.id, currentEnrollment.id)}
										>
											<i class="bi {completed ? 'bi-check-circle-fill' : 'bi-check2-circle'} me-1" aria-hidden="true"></i>
											{completed ? 'Sudah selesai' : 'Tandai selesai'}
										</button>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{:else if activeTab === 'tugas'}
		<!-- TAB TUGAS (FR-TGS-01..04) -->
		<div class="card shadow-sm">
			<div class="card-body p-3 p-lg-4">
				<div class="d-flex justify-content-between align-items-center mb-3">
					<h2 class="h4 mb-0">Daftar Tugas Kelas</h2>
					{#if user?.role === 'lecturer'}
						<a href="/lecturer/content?class={courseClass.id}&tab=tugas" class="btn btn-primary btn-sm">
							+ Buat Tugas Baru
						</a>
					{/if}
				</div>

				<div class="vstack gap-3">
					{#each classAssignments as asg (asg.id)}
						{@const sub = lms.submissions.find(
							(s) => s.assignment_id === asg.id && s.enrollment_id === currentEnrollment?.id
						)}
						{@const badge = submissionStatusBadge(sub?.status ?? 'not_submitted')}
						<div class="card border">
							<div class="card-body p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
								<div>
									<div class="d-flex flex-wrap align-items-center gap-2 mb-1">
										<span class="mono fw-bold text-primary">{asg.code}</span>
										{#if asg.status === 'scheduled'}
											<span class="badge rounded-pill text-bg-info">
												Terjadwal terbit {formatDateShortId(asg.publish_at)}
											</span>
										{:else}
											<span class="badge rounded-pill {badge.badgeClass}">{badge.label}</span>
										{/if}
										<span class="badge rounded-pill text-bg-light border">
											Pengumpulan: {asg.submission_label}
										</span>
									</div>
									<h3 class="h5 mb-1">{asg.title}</h3>
									<div class="small text-muted-upl">
										Tenggat: <strong>{formatDateTimeWib(asg.due_at)}</strong> · Nilai maks: {asg.max_score}
									</div>
									{#if sub?.score !== null && sub?.score !== undefined}
										<div class="mt-2 small fw-bold text-success">
											Nilai Anda: {formatScore(sub.score)} / {asg.max_score}
										</div>
									{/if}
								</div>

								<div class="d-flex gap-2 flex-shrink-0">
									<a
										href="/classes/{courseClass.id}/assignments/{asg.id}"
										class="btn btn-primary btn-sm"
									>
										{sub ? 'Lihat Pengumpulan (S06)' : 'Buka & Kumpulkan (S06)'}
									</a>
									{#if user?.role === 'lecturer'}
										<a
											href="/lecturer/grading?assignment={asg.id}"
											class="btn btn-outline-secondary btn-sm"
										>
											Nilai Mahasiswa (S11)
										</a>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{:else if activeTab === 'kuis'}
		<!-- TAB KUIS (FR-KUI-01..04) -->
		<div class="card shadow-sm">
			<div class="card-body p-3 p-lg-4">
				<h2 class="h4 mb-3">Kuis Daring</h2>
				{#each classQuizzes as qz (qz.id)}
					{@const att = lms.quizAttempts.find(
						(a) => a.quiz_id === qz.id && a.enrollment_id === currentEnrollment?.id
					)}
					<div class="card border">
						<div class="card-body p-3 p-lg-4">
							<div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
								<div>
									<span class="mono fw-bold text-primary me-2">{qz.code}</span>
									<span class="badge rounded-pill {att?.status === 'submitted' ? 'text-bg-success' : att?.status === 'in_progress' ? 'text-bg-primary' : 'text-bg-secondary'}">
										{att?.status === 'submitted'
											? 'Selesai'
											: att?.status === 'in_progress'
												? 'Berlangsung'
												: 'Siap dikerjakan'}
									</span>
								</div>
								<span class="small text-muted-upl">
									Durasi: <strong>{qz.duration_minutes} menit</strong> · {qz.max_attempts} percobaan
								</span>
							</div>
							<h3 class="h5 mb-2">{qz.title}</h3>
							<p class="small text-muted-upl mb-3">{qz.description}</p>
							<div class="p-3 bg-light rounded-3 border small mb-3">
								<div><strong>Dibuka:</strong> {formatDateTimeWib(qz.opens_at)}</div>
								<div><strong>Ditutup:</strong> {formatDateTimeWib(qz.closes_at)}</div>
								<div><strong>Fitur:</strong> Simpan otomatis (autosave) tiap 15 detik dan saat berpindah soal (AC-06).</div>
							</div>
							{#if att?.status === 'submitted'}
								<div class="alert alert-success d-flex justify-content-between align-items-center mb-3">
									<span>Kuis telah diselesaikan. Skor otomatis Anda:</span>
									<strong class="fs-5 tabular-nums">{formatScore(att.score)} / 100</strong>
								</div>
							{/if}
							<a href="/quizzes/{qz.id}/attempt" class="btn btn-primary">
								<i class="bi bi-play-circle me-2" aria-hidden="true"></i>
								{att?.status === 'submitted'
									? 'Lihat Hasil & Pembahasan Kuis (S07)'
									: att?.status === 'in_progress'
										? 'Lanjutkan Pengerjaan Kuis (S07)'
										: 'Mulai Kerjakan Kuis (S07)'}
							</a>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if activeTab === 'forum'}
		<!-- TAB FORUM DISKUSI (FR-FRM-01..02 & PRD Lampiran A.11) -->
		<div class="row g-3">
			<div class="col-12 col-lg-8 vstack gap-3">
				{#each classThreads as thread (thread.id)}
					{@const posts = lms.discussionPosts.filter((p) => p.thread_id === thread.id)}
					<div class="card shadow-sm">
						<div class="card-body p-3 p-lg-4">
							<div class="d-flex justify-content-between align-items-start gap-2 mb-2">
								<div class="d-flex flex-wrap align-items-center gap-2">
									{#if thread.is_pinned}
										<span class="badge rounded-pill text-bg-primary">
											<i class="bi bi-pin-angle-fill me-1" aria-hidden="true"></i>Disematkan
										</span>
									{/if}
									{#if thread.is_closed}
										<span class="badge rounded-pill text-bg-secondary">Diskusi Ditutup</span>
									{/if}
									<span class="small text-muted-upl">
										Oleh <strong>{thread.author_name}</strong> · {formatDateShortId(thread.created_at)}
									</span>
								</div>

								{#if user?.role === 'lecturer' || user?.role === 'super_admin'}
									<div class="btn-group btn-group-sm">
										<button
											type="button"
											class="btn btn-outline-secondary btn-sm"
											onclick={() => togglePin(thread.id)}
											title="Sematkan / lepas sematan"
										>
											{thread.is_pinned ? 'Lepas Semat' : 'Sematkan'}
										</button>
										<button
											type="button"
											class="btn btn-outline-secondary btn-sm"
											onclick={() => toggleCloseThread(thread.id)}
										>
											{thread.is_closed ? 'Buka' : 'Tutup'}
										</button>
										<button
											type="button"
											class="btn btn-outline-danger btn-sm"
											onclick={() => deleteThread(thread.id)}
										>
											Hapus
										</button>
									</div>
								{/if}
							</div>

							<h2 class="h5 mb-2">{thread.title}</h2>
							<p class="mb-3">{thread.body}</p>

							<div class="vstack gap-2 ps-3 border-start border-2 mb-3">
								{#each posts as post (post.id)}
									<div class="p-2 px-3 rounded-3 bg-light">
										<div class="d-flex justify-content-between align-items-center mb-1">
											<strong class="small">
												{post.author_name}
												{#if post.author_role === 'lecturer'}
													<span class="badge rounded-pill text-bg-primary ms-1">Dosen</span>
												{/if}
											</strong>
											<small class="text-muted-upl">{formatDateShortId(post.created_at)}</small>
										</div>
										<p class="small mb-0">{post.body}</p>
									</div>
								{/each}
							</div>

							{#if !thread.is_closed}
								<div class="d-flex gap-2">
									<input
										type="text"
										class="form-control"
										placeholder="Tulis balasan diskusi..."
										aria-label="Tulis balasan untuk {thread.title}"
										bind:value={replyTexts[thread.id]}
									/>
									<button
										type="button"
										class="btn btn-primary flex-shrink-0"
										onclick={() => handleReply(thread.id)}
									>
										Kirim balasan
									</button>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<div class="col-12 col-lg-4">
				<div class="card shadow-sm">
					<div class="card-body p-3 p-lg-4">
						<h2 class="h5 mb-3">Buat Topik Diskusi Baru</h2>
						<form onsubmit={handleCreateThread}>
							<div class="mb-3">
								<label for="thread-title" class="form-label">
									Judul pertanyaan / topik <span class="text-danger" aria-hidden="true">*</span>
									<span class="visually-hidden">(wajib diisi)</span>
								</label>
								<input
									id="thread-title"
									type="text"
									class="form-control"
									placeholder="Contoh: Pertanyaan penggunaan offcanvas"
									bind:value={newThreadTitle}
									required
								/>
							</div>
							<div class="mb-3">
								<label for="thread-body" class="form-label">
									Isi diskusi <span class="text-danger" aria-hidden="true">*</span>
									<span class="visually-hidden">(wajib diisi)</span>
								</label>
								<textarea
									id="thread-body"
									rows="4"
									class="form-control"
									placeholder="Jelaskan pertanyaan atau pendapat Anda..."
									bind:value={newThreadBody}
									required
								></textarea>
							</div>
							<button type="submit" class="btn btn-primary w-100">Terbitkan diskusi</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	{:else if activeTab === 'presensi'}
		<!-- TAB PRESENSI MAHASISWA (FR-PRS-01..04 & AC-04) -->
		<div class="row g-3">
			<div class="col-12 col-lg-5">
				<div class="card shadow-sm">
					<div class="card-body p-3 p-lg-4">
						<h2 class="h4 mb-2">Presensi dengan Kode Sesi</h2>
						<p class="small text-muted-upl mb-3">
							Masukkan kode 6 karakter yang ditampilkan dosen di layar kelas untuk mencatat kehadiran Anda (AC-04).
						</p>

						{#if openSession}
							<div class="alert alert-info small" role="alert">
								<strong>Sesi Pertemuan {openSession.meeting_no} sedang terbuka!</strong><br />
								Topik: {openSession.topic}<br />
								Kode sesi aktif untuk demo: <code class="mono fw-bold fs-6">{openSession.code}</code>
							</div>
						{/if}

						{#if attendanceFeedback}
							<div
								class="alert {attendanceFeedback.ok ? 'alert-success' : 'alert-danger'}"
								role="alert"
							>
								{attendanceFeedback.message}
							</div>
						{/if}

						<form onsubmit={handleAttendanceCheckIn}>
							<div class="mb-3">
								<label for="att-code" class="form-label">
									Kode presensi <span class="text-danger" aria-hidden="true">*</span>
									<span class="visually-hidden">(wajib diisi)</span>
								</label>
								<input
									id="att-code"
									type="text"
									class="form-control mono text-uppercase fs-5"
									placeholder="Contoh: PV-7X4K"
									maxlength="8"
									bind:value={attendanceCodeInput}
									required
								/>
								<div class="form-text">
									Contoh kode sesi aktif INF301-5A: <span class="mono fw-semibold">PV-7X4K</span>
								</div>
							</div>
							<button type="submit" class="btn btn-primary w-100">
								Catat kehadiran sekarang
							</button>
						</form>
					</div>
				</div>
			</div>

			<div class="col-12 col-lg-7">
				<div class="card shadow-sm">
					<div class="card-body p-3 p-lg-4">
						<div class="d-flex justify-content-between align-items-center mb-3">
							<h2 class="h4 mb-0">Riwayat Kehadiran Anda</h2>
							{#if currentEnrollment}
								{@const pct = lms.getAttendancePercentage(courseClass.id, currentEnrollment.id)}
								<span class="badge rounded-pill {pct >= 75 ? 'text-bg-success' : 'text-bg-danger'} fs-6">
									Kehadiran: {pct}%
								</span>
							{/if}
						</div>

						<div class="table-responsive">
							<table class="table table-hover align-middle mb-0">
								<caption class="visually-hidden">Tabel riwayat presensi per pertemuan</caption>
								<thead class="table-light">
									<tr>
										<th scope="col">Pertemuan</th>
										<th scope="col">Tanggal</th>
										<th scope="col">Topik</th>
										<th scope="col">Status</th>
									</tr>
								</thead>
								<tbody>
									{#each classSessions as sess (sess.id)}
										{@const rec = lms.attendanceRecords.find(
											(r) =>
												r.attendance_session_id === sess.id &&
												r.enrollment_id === currentEnrollment?.id
										)}
										<tr>
											<td class="mono fw-semibold">P{sess.meeting_no}</td>
											<td>{formatDateId(sess.session_date)}</td>
											<td>{sess.topic}</td>
											<td>
												{#if rec}
													{@const b = attendanceStatusBadge(rec.status)}
													<span class="badge rounded-pill {b.badgeClass}">{b.label}</span>
												{:else if sess.is_open}
													<span class="badge rounded-pill text-bg-primary">Sesi terbuka</span>
												{:else}
													<span class="badge rounded-pill text-bg-secondary">Terjadwal</span>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else if activeTab === 'nilai'}
		<!-- TAB NILAI KELAS -->
		<div class="card shadow-sm">
			<div class="card-body p-3 p-lg-4">
				<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
					<div>
						<h2 class="h4 mb-1">Rincian Nilai Kelas {courseClass.class_code}</h2>
						<p class="small text-muted-upl mb-0">
							Rumus nilai akhir = Σ (nilai komponen × bobot ÷ 100) sesuai PRD Lampiran A.9.
						</p>
					</div>
					<a href="/grades" class="btn btn-outline-primary btn-sm">
						Buka Halaman Nilai Saya (S08)
					</a>
				</div>

				{#if currentEnrollment}
					{@const comps = lms.gradeComponents.filter((c) => c.course_class_id === courseClass.id)}
					<div class="table-responsive">
						<table class="table table-hover align-middle">
							<caption class="visually-hidden">Rincian komponen nilai kelas {courseClass.class_code}</caption>
							<thead class="table-light">
								<tr>
									<th scope="col">Komponen Penilaian</th>
									<th scope="col" class="text-end">Bobot (%)</th>
									<th scope="col" class="text-end">Nilai Komponen</th>
									<th scope="col" class="text-end">Kontribusi Nilai</th>
								</tr>
							</thead>
							<tbody>
								{#each comps as comp (comp.id)}
									{@const ge = lms.gradeEntries.find(
										(g) => g.grade_component_id === comp.id && g.enrollment_id === currentEnrollment.id
									)}
									{@const sc = ge?.score ?? 0}
									<tr class="tabular-nums">
										<td class="fw-medium">{comp.name}</td>
										<td class="text-end">{comp.weight}%</td>
										<td class="text-end">{formatScore(sc)}</td>
										<td class="text-end fw-semibold">{formatScore((sc * comp.weight) / 100)}</td>
									</tr>
								{/each}
							</tbody>
							<tfoot class="table-light fw-bold tabular-nums">
								<tr>
									<td>Total / Nilai Akhir</td>
									<td class="text-end">100%</td>
									<td class="text-end">Huruf Mutu: <span class="badge rounded-pill text-bg-success">{currentEnrollment.letter_grade}</span></td>
									<td class="text-end fs-5 text-primary">{formatScore(currentEnrollment.final_score)}</td>
								</tr>
							</tfoot>
						</table>
					</div>
				{/if}
			</div>
		</div>
	{/if}
{/if}

