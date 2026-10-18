<script lang="ts">
	import { lms } from '$lib/store.svelte';
	import { formatDateTimeWib } from '$lib/format';

	let viewMode = $state<'grid' | 'calendar'>('grid');

	const user = $derived(lms.currentUser);
	const student = $derived(lms.currentStudent);
	const lecturer = $derived(lms.currentLecturer);

	const visibleClasses = $derived.by(() => {
		if (!user) return [];
		if (user.role === 'student' && student) {
			const enrs = lms.enrollments.filter((e) => e.student_id === student.id);
			return enrs
				.map((enr) => {
					const cls = lms.courseClasses.find((c) => c.id === enr.course_class_id);
					const crs = lms.courses.find((c) => c.id === cls?.course_id);
					const lec = lms.lecturers.find((l) => l.id === cls?.lecturer_id);
					const prog = cls ? lms.getClassProgress(cls.id, enr.id) : { completed: 0, total: 0, percent: 0 };
					const attPct = cls ? lms.getAttendancePercentage(cls.id, enr.id) : 100;
					return { cls, crs, lec, enrollment: enr, prog, attPct };
				})
				.filter((item) => item.cls && item.crs);
		}
		if (user.role === 'lecturer' && lecturer) {
			return lms.courseClasses
				.filter((c) => c.lecturer_id === lecturer.id)
				.map((cls) => {
					const crs = lms.courses.find((c) => c.id === cls.course_id);
					const lec = lecturer;
					const count = lms.enrollments.filter((e) => e.course_class_id === cls.id).length;
					return {
						cls,
						crs,
						lec,
						enrollment: null,
						prog: { completed: 5, total: 6, percent: 83 },
						attPct: count
					};
				});
		}
		// Admin melihat semua kelas
		return lms.courseClasses.map((cls) => {
			const crs = lms.courses.find((c) => c.id === cls.course_id);
			const lec = lms.lecturers.find((l) => l.id === cls.lecturer_id);
			const count = lms.enrollments.filter((e) => e.course_class_id === cls.id).length;
			return {
				cls,
				crs,
				lec,
				enrollment: null,
				prog: { completed: 0, total: 0, percent: 0 },
				attPct: count
			};
		});
	});

	const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
</script>

<svelte:head>
	<title>Kelas Saya (S04) — PelitaLearn</title>
</svelte:head>

<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
	<div>
		<h1 class="h2 mb-1">
			{user?.role === 'lecturer' ? 'Kelas yang Diampu' : 'Kelas Saya'}
		</h1>
		<p class="text-muted-upl mb-0">
			{lms.activeTerm.name} · Zona waktu WIB
		</p>
	</div>

	<div class="btn-group" role="group" aria-label="Pilih tampilan kelas">
		<button
			type="button"
			class="btn {viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}"
			onclick={() => (viewMode = 'grid')}
		>
			<i class="bi bi-grid-3x3-gap me-1" aria-hidden="true"></i>Kartu Kelas
		</button>
		<button
			type="button"
			class="btn {viewMode === 'calendar' ? 'btn-primary' : 'btn-outline-secondary'}"
			onclick={() => (viewMode = 'calendar')}
		>
			<i class="bi bi-calendar3-week me-1" aria-hidden="true"></i>Jadwal & Kalender (FR-KAL-01)
		</button>
	</div>
</div>

{#if student?.status === 'on_leave'}
	<div class="card shadow-sm">
		<div class="card-body p-4 text-center">
			<i class="bi bi-slash-circle fs-1 text-warning d-block mb-2" aria-hidden="true"></i>
			<h2 class="h4 mb-2">Akses Kelas Aktif Dibatasi (Status: Cuti)</h2>
			<p class="text-muted-upl mb-3">
				Status Anda saat ini Cuti, sehingga kelas aktif tidak dapat dibuka. Hubungi admin akademik bila status ini keliru (BR-02, AC-03).
			</p>
			<div class="d-flex justify-content-center gap-2">
				<a href="/grades" class="btn btn-primary">Lihat Riwayat Nilai</a>
				<a href="/profile" class="btn btn-outline-secondary">Buka Profil</a>
			</div>
		</div>
	</div>
{:else if viewMode === 'grid'}
	<!-- Pola Grid S04 (desain.md §5.3): row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3 -->
	<div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
		{#each visibleClasses as item (item.cls?.id)}
			<div class="col">
				<div class="card card-interactive shadow-sm h-100 d-flex flex-column">
					<div class="card-body p-3 p-lg-4 d-flex flex-column flex-grow-1">
						<div class="d-flex justify-content-between align-items-center mb-2">
							<span class="badge rounded-pill text-bg-primary mono">{item.cls?.class_code}</span>
							<span class="badge rounded-pill text-bg-light border text-dark">
								{item.crs?.credits} SKS
							</span>
						</div>

						<h2 class="h4 mb-1">
							<a href="/classes/{item.cls?.id}" class="text-decoration-none text-dark">
								{item.crs?.name}
							</a>
						</h2>
						<p class="small text-muted-upl mb-3">
							<i class="bi bi-person-badge me-1" aria-hidden="true"></i>{item.lec?.full_name}
						</p>

						<div class="p-2 px-3 rounded-3 bg-light border small mb-3">
							<div class="fw-medium">
								<i class="bi bi-clock me-1 text-primary" aria-hidden="true"></i>{item.cls?.day_of_week}, {item.cls?.starts_at}–{item.cls?.ends_at} WIB
							</div>
							<div class="text-muted-upl">
								<i class="bi bi-geo-alt me-1" aria-hidden="true"></i>Ruang: {item.cls?.room}
							</div>
						</div>

						{#if user?.role === 'student'}
							<div class="mt-auto">
								<div class="d-flex justify-content-between small mb-1">
									<span>Progres belajar: {item.prog.completed} dari {item.prog.total} materi</span>
									<strong class="tabular-nums">{item.prog.percent}%</strong>
								</div>
								<div
									class="progress mb-3"
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

								<a href="/classes/{item.cls?.id}" class="btn btn-primary w-100">
									Buka Kelas
								</a>
							</div>
						{:else}
							<div class="mt-auto d-flex flex-wrap gap-2">
								<a href="/classes/{item.cls?.id}" class="btn btn-primary flex-grow-1">
									Buka Kelas
								</a>
								<a
									href="/lecturer/grades?class={item.cls?.id}"
									class="btn btn-outline-secondary"
								>
									Nilai
								</a>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
{:else}
	<!-- Kalender Jadwal Kuliah Mingguan & Tenggat (FR-KAL-01) -->
	<div class="card shadow-sm mb-4">
		<div class="card-body p-3 p-lg-4">
			<h2 class="h4 mb-3">Jadwal Kuliah Mingguan ({lms.activeTerm.name})</h2>
			<div class="row row-cols-1 row-cols-md-2 row-cols-xl-5 g-3">
				{#each daysOfWeek as day}
					{@const dayClasses = visibleClasses.filter((c) => c.cls?.day_of_week === day)}
					<div class="col">
						<div class="border rounded-3 p-3 h-100 bg-light">
							<h3 class="h6 fw-bold border-bottom pb-2 mb-3">{day}</h3>
							{#if dayClasses.length === 0}
								<p class="small text-muted-upl mb-0">Tidak ada jadwal kuliah tatap muka.</p>
							{:else}
								<div class="vstack gap-2">
									{#each dayClasses as dc}
										<a
											href="/classes/{dc.cls?.id}"
											class="card border bg-white text-decoration-none text-dark p-2 shadow-sm"
										>
											<div class="mono small fw-bold text-primary">
												{dc.cls?.starts_at}–{dc.cls?.ends_at} WIB
											</div>
											<div class="fw-semibold small">{dc.crs?.name}</div>
											<div class="small text-muted-upl">
												<span class="mono">{dc.cls?.class_code}</span> · {dc.cls?.room}
											</div>
										</a>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="card shadow-sm">
		<div class="card-body p-3 p-lg-4">
			<h2 class="h4 mb-3">Kalender Tenggat Tugas & Kuis</h2>
			<div class="list-group list-group-flush">
				{#each lms.assignments as asg (asg.id)}
					{@const cls = lms.courseClasses.find((c) => c.id === asg.course_class_id)}
					<a
						href="/classes/{asg.course_class_id}/assignments/{asg.id}"
						class="list-group-item list-group-item-action px-0 py-3 d-flex justify-content-between align-items-center"
					>
						<div>
							<span class="badge rounded-pill text-bg-light border mono me-2">{cls?.class_code}</span>
							<strong>{asg.code} — {asg.title}</strong>
							<div class="small text-muted-upl mt-1">
								Tenggat: {formatDateTimeWib(asg.due_at)}
							</div>
						</div>
						<span class="badge rounded-pill text-bg-primary">{asg.submission_label}</span>
					</a>
				{/each}
			</div>
		</div>
	</div>
{/if}

