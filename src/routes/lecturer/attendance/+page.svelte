<script lang="ts">
	import { lms } from '$lib/store.svelte';
	import { attendanceStatusBadge, formatDateId } from '$lib/format';
	import type { AttendanceStatus } from '$lib/types';

	let selectedClassId = $state(1);
	let selectedMeetingNo = $state(6);
	let durationMinutes = $state(15);
	let topicInput = $state('Form dan Validasi');
	let customCodeInput = $state('PV-7X4K');

	const currentClass = $derived(
		lms.courseClasses.find((c) => c.id === selectedClassId) ?? lms.courseClasses[0]
	);
	const currentCourse = $derived(
		lms.courses.find((c) => c.id === currentClass?.course_id)
	);

	const classSessions = $derived(
		lms.attendanceSessions
			.filter((s) => s.course_class_id === selectedClassId)
			.sort((a, b) => a.meeting_no - b.meeting_no)
	);

	const activeSession = $derived(
		classSessions.find((s) => s.meeting_no === selectedMeetingNo) ??
			classSessions[classSessions.length - 1]
	);

	const classEnrollments = $derived(
		lms.enrollments.filter((e) => e.course_class_id === selectedClassId)
	);

	function handleOpenSession(e: SubmitEvent) {
		e.preventDefault();
		lms.openAttendanceSession({
			courseClassId: selectedClassId,
			meetingNo: Number(selectedMeetingNo),
			topic: topicInput,
			durationMinutes: Number(durationMinutes),
			customCode: customCodeInput
		});
	}

	function handleStatusChange(enrollmentId: number, status: AttendanceStatus, note: string) {
		if (!activeSession) return;
		lms.updateAttendanceManual({
			sessionId: activeSession.id,
			enrollmentId,
			status,
			note
		});
	}
</script>

<svelte:head>
	<title>Presensi Kelas (S12) — PelitaLearn</title>
</svelte:head>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
	<div>
		<h1 class="h2 mb-1">Presensi Kelas (S12)</h1>
		<p class="text-muted-upl mb-0">
			Buka sesi presensi dengan kode acak 6 karakter (5–30 menit) dan kelola rekap kehadiran mahasiswa.
		</p>
	</div>

	<div class="d-flex align-items-center gap-2">
		<label for="cls-att-select" class="form-label mb-0 small fw-semibold">Kelas:</label>
		<select id="cls-att-select" class="form-select mono" bind:value={selectedClassId}>
			{#each lms.courseClasses as cls (cls.id)}
				{@const crs = lms.courses.find((c) => c.id === cls.course_id)}
				<option value={cls.id}>{cls.class_code} — {crs?.name}</option>
			{/each}
		</select>
	</div>
</div>

<div class="row g-3 mb-4">
	<!-- Panel Buka Sesi & Kode Besar (desain.md §8 S12) -->
	<div class="col-12 col-lg-5">
		<div class="card shadow-sm h-100">
			<div class="card-body p-3 p-lg-4">
				<h2 class="h4 mb-3">Buka Sesi Presensi (FR-PRS-01)</h2>

				{#if activeSession?.is_open}
					<div class="p-4 rounded-3 bg-navy-upl text-white text-center mb-3">
						<div class="small text-uppercase opacity-75 mb-1">
							Kode Sesi Pertemuan {activeSession.meeting_no} ({currentClass.class_code})
						</div>
						<div class="display-4 fw-bold mono" style="color: var(--upl-teal-500); letter-spacing: 0.08em;">
							{activeSession.code}
						</div>
						<div class="small mt-2">
							Berlaku selama {durationMinutes} menit · Tampilkan di proyektor kelas
						</div>
					</div>
				{/if}

				<form onsubmit={handleOpenSession}>
					<div class="row g-2 mb-3">
						<div class="col-6">
							<label for="meet-no" class="form-label">Pertemuan</label>
							<select id="meet-no" class="form-select mono" bind:value={selectedMeetingNo}>
								{#each [1, 2, 3, 4, 5, 6, 7, 8] as m}
									<option value={m}>Pertemuan P{m}</option>
								{/each}
							</select>
						</div>
						<div class="col-6">
							<label for="dur-min" class="form-label">Durasi (5–30 mnt)</label>
							<select id="dur-min" class="form-select" bind:value={durationMinutes}>
								<option value={5}>5 menit</option>
								<option value={10}>10 menit</option>
								<option value={15}>15 menit (Default)</option>
								<option value={30}>30 menit</option>
							</select>
						</div>
					</div>

					<div class="mb-3">
						<label for="att-topic" class="form-label">Topik pertemuan</label>
						<input
							id="att-topic"
							type="text"
							class="form-control"
							bind:value={topicInput}
							required
						/>
					</div>

					<div class="mb-3">
						<label for="att-custom-code" class="form-label">
							Kode sesi (kosongkan untuk acak otomatis)
						</label>
						<input
							id="att-custom-code"
							type="text"
							class="form-control mono"
							placeholder="PV-7X4K"
							bind:value={customCodeInput}
						/>
					</div>

					<button type="submit" class="btn btn-primary w-100">
						<i class="bi bi-broadcast me-2" aria-hidden="true"></i>Buka sesi presensi
					</button>
				</form>
			</div>
		</div>
	</div>

	<!-- Daftar Hadir & Koreksi Manual (FR-PRS-03..04) -->
	<div class="col-12 col-lg-7">
		<div class="card shadow-sm h-100">
			<div class="card-body p-3 p-lg-4">
				<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
					<div>
						<h2 class="h4 mb-0">
							Daftar Hadir Pertemuan P{activeSession?.meeting_no ?? selectedMeetingNo}
						</h2>
						<div class="small text-muted-upl">
							Tanggal: {activeSession ? formatDateId(activeSession.session_date) : '19 Oktober 2026'} · Koreksi manual Izin/Sakit/Alpa (FR-PRS-04)
						</div>
					</div>
				</div>

				<div class="vstack gap-2">
					{#each classEnrollments as enr (enr.id)}
						{@const st = lms.students.find((s) => s.id === enr.student_id)}
						{@const rec = activeSession
							? lms.attendanceRecords.find(
									(r) => r.attendance_session_id === activeSession.id && r.enrollment_id === enr.id
								)
							: undefined}
						{@const pct = lms.getAttendancePercentage(selectedClassId, enr.id)}
						<div class="p-3 rounded-3 border bg-white">
							<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
								<div>
									<div class="d-flex align-items-center gap-2">
										<span class="mono fw-bold">{st?.nim}</span>
										<strong>{st?.full_name}</strong>
										{#if rec}
											{@const b = attendanceStatusBadge(rec.status)}
											<span class="badge rounded-pill {b.badgeClass}">{b.label}</span>
										{:else}
											<span class="badge rounded-pill text-bg-secondary">Belum check-in</span>
										{/if}
									</div>
									<div class="small text-muted-upl mt-1">
										Total kehadiran semester: <strong class={pct < 75 ? 'text-danger' : 'text-success'}>{pct}%</strong>
										{pct < 75 ? '(Di bawah syarat UAS 75% - BR-06)' : '(Memenuhi syarat UAS ≥ 75%)'}
										{#if rec?.note}
											· Catatan: <em>{rec.note}</em>
										{/if}
									</div>
								</div>

								<div class="btn-group btn-group-sm" role="group" aria-label="Koreksi kehadiran {st?.full_name}">
									<button
										type="button"
										class="btn {rec?.status === 'present' ? 'btn-success' : 'btn-outline-secondary'}"
										onclick={() => handleStatusChange(enr.id, 'present', 'Hadir di kelas')}
									>
										Hadir
									</button>
									<button
										type="button"
										class="btn {rec?.status === 'excused' ? 'btn-info' : 'btn-outline-secondary'}"
										onclick={() => handleStatusChange(enr.id, 'excused', 'Izin terverifikasi dosen')}
									>
										Izin
									</button>
									<button
										type="button"
										class="btn {rec?.status === 'sick' ? 'btn-warning' : 'btn-outline-secondary'}"
										onclick={() => handleStatusChange(enr.id, 'sick', 'Sakit dengan surat keterangan')}
									>
										Sakit
									</button>
									<button
										type="button"
										class="btn {rec?.status === 'absent' ? 'btn-danger' : 'btn-outline-secondary'}"
										onclick={() => handleStatusChange(enr.id, 'absent', 'Alpa tanpa keterangan')}
									>
										Alpa
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Rekap Matriks Pertemuan P1 - P5 (PRD Lampiran A.8) -->
<div class="card shadow-sm">
	<div class="card-body p-3 p-lg-4">
		<h2 class="h4 mb-3">Matriks Rekap Kehadiran Semester ({currentClass.class_code})</h2>
		<div class="table-responsive">
			<table class="table table-hover align-middle mb-0">
				<caption class="visually-hidden">Rekap kehadiran per pertemuan {currentClass.class_code}</caption>
				<thead class="table-light">
					<tr>
						<th scope="col">NIM</th>
						<th scope="col">Nama Mahasiswa</th>
						{#each classSessions as sess (sess.id)}
							<th scope="col" class="text-center">P{sess.meeting_no}</th>
						{/each}
						<th scope="col" class="text-end">Persentase (BR-06)</th>
					</tr>
				</thead>
				<tbody>
					{#each classEnrollments as enr (enr.id)}
						{@const st = lms.students.find((s) => s.id === enr.student_id)}
						{@const pct = lms.getAttendancePercentage(selectedClassId, enr.id)}
						<tr>
							<td class="mono">{st?.nim}</td>
							<td class="fw-medium">{st?.full_name}</td>
							{#each classSessions as sess (sess.id)}
								{@const rec = lms.attendanceRecords.find(
									(r) => r.attendance_session_id === sess.id && r.enrollment_id === enr.id
								)}
								<td class="text-center">
									{#if rec}
										{@const b = attendanceStatusBadge(rec.status)}
										<span class="badge rounded-pill {b.badgeClass}">{b.label}</span>
									{:else}
										<span class="text-muted-upl small">—</span>
									{/if}
								</td>
							{/each}
							<td class="text-end fw-bold tabular-nums">
								<span class="badge rounded-pill {pct >= 75 ? 'text-bg-success' : 'text-bg-danger'}">
									{pct}%
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

