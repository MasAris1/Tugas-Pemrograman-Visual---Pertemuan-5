import { browser } from '$app/environment';
import { createSeedData, type SeedData } from './seed';
import type {
	AcademicTerm,
	Announcement,
	AppSettings,
	Assignment,
	AttendanceRecord,
	AttendanceSession,
	AttendanceStatus,
	AuditLog,
	Course,
	CourseClass,
	DiscussionPost,
	DiscussionThread,
	Enrollment,
	Faculty,
	GradeComponent,
	GradeEntry,
	Lecturer,
	Material,
	MaterialProgress,
	NotificationItem,
	Quiz,
	QuizAttempt,
	QuizQuestion,
	Student,
	StudentStatus,
	StudyProgram,
	Submission,
	ToastMessage,
	User
} from './types';

const STORAGE_KEY = 'pelitalearn_lms_state_v2';
const SESSION_USER_KEY = 'pelitalearn_current_user_id_v2';

const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'pptx', 'xlsx', 'zip', 'jpg', 'jpeg', 'png', 'txt'];

class LmsStore {
	users = $state<User[]>([]);
	faculties = $state<Faculty[]>([]);
	studyPrograms = $state<StudyProgram[]>([]);
	academicTerms = $state<AcademicTerm[]>([]);
	students = $state<Student[]>([]);
	lecturers = $state<Lecturer[]>([]);
	courses = $state<Course[]>([]);
	courseClasses = $state<CourseClass[]>([]);
	enrollments = $state<Enrollment[]>([]);
	materials = $state<Material[]>([]);
	materialProgress = $state<MaterialProgress[]>([]);
	assignments = $state<Assignment[]>([]);
	submissions = $state<Submission[]>([]);
	quizzes = $state<Quiz[]>([]);
	quizQuestions = $state<QuizQuestion[]>([]);
	quizAttempts = $state<QuizAttempt[]>([]);
	attendanceSessions = $state<AttendanceSession[]>([]);
	attendanceRecords = $state<AttendanceRecord[]>([]);
	gradeComponents = $state<GradeComponent[]>([]);
	gradeEntries = $state<GradeEntry[]>([]);
	discussionThreads = $state<DiscussionThread[]>([]);
	discussionPosts = $state<DiscussionPost[]>([]);
	announcements = $state<Announcement[]>([]);
	notifications = $state<NotificationItem[]>([]);
	auditLogs = $state<AuditLog[]>([]);
	appSettings = $state<AppSettings>(createSeedData().appSettings);

	currentUserId = $state<number | null>(100); // Default logged in: Aris Maulana (312410466)
	toasts = $state<ToastMessage[]>([]);
	highlightedStudentId = $state<number | null>(9);
	lastStudentSuccessMessage = $state<string>(
		'Data mahasiswa berhasil disimpan. Anda dapat menambah mahasiswa lain, memperbarui data pelengkap, atau memeriksa status pada tabel.'
	);

	constructor() {
		this.loadFromSeedOrStorage();
	}

	loadFromSeedOrStorage() {
		const seed = createSeedData();
		if (browser) {
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				const savedUser = localStorage.getItem(SESSION_USER_KEY);
				if (savedUser !== null) {
					this.currentUserId = savedUser === 'null' ? null : Number(savedUser);
				}
				if (raw) {
					const parsed = JSON.parse(raw) as SeedData;
					this.applyData(parsed);
					return;
				}
			} catch (e) {
				console.warn('Gagal memuat state dari localStorage, menggunakan data seed.', e);
			}
		}
		this.applyData(seed);
	}

	applyData(data: SeedData) {
		this.users = data.users;
		this.faculties = data.faculties;
		this.studyPrograms = data.studyPrograms;
		this.academicTerms = data.academicTerms;
		this.students = data.students;
		this.lecturers = data.lecturers;
		this.courses = data.courses;
		this.courseClasses = data.courseClasses;
		this.enrollments = data.enrollments;
		this.materials = data.materials;
		this.materialProgress = data.materialProgress;
		this.assignments = data.assignments;
		this.submissions = data.submissions;
		this.quizzes = data.quizzes;
		this.quizQuestions = data.quizQuestions;
		this.quizAttempts = data.quizAttempts;
		this.attendanceSessions = data.attendanceSessions;
		this.attendanceRecords = data.attendanceRecords;
		this.gradeComponents = data.gradeComponents;
		this.gradeEntries = data.gradeEntries;
		this.discussionThreads = data.discussionThreads;
		this.discussionPosts = data.discussionPosts;
		this.announcements = data.announcements;
		this.notifications = data.notifications;
		this.auditLogs = data.auditLogs;
		this.appSettings = data.appSettings;
	}

	persist() {
		if (!browser) return;
		try {
			const payload: SeedData = {
				users: this.users,
				faculties: this.faculties,
				studyPrograms: this.studyPrograms,
				academicTerms: this.academicTerms,
				students: this.students,
				lecturers: this.lecturers,
				courses: this.courses,
				courseClasses: this.courseClasses,
				enrollments: this.enrollments,
				materials: this.materials,
				materialProgress: this.materialProgress,
				assignments: this.assignments,
				submissions: this.submissions,
				quizzes: this.quizzes,
				quizQuestions: this.quizQuestions,
				quizAttempts: this.quizAttempts,
				attendanceSessions: this.attendanceSessions,
				attendanceRecords: this.attendanceRecords,
				gradeComponents: this.gradeComponents,
				gradeEntries: this.gradeEntries,
				discussionThreads: this.discussionThreads,
				discussionPosts: this.discussionPosts,
				announcements: this.announcements,
				notifications: this.notifications,
				auditLogs: this.auditLogs,
				appSettings: this.appSettings
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
			localStorage.setItem(SESSION_USER_KEY, String(this.currentUserId));
		} catch (e) {
			console.warn('Gagal menyimpan state ke localStorage:', e);
		}
	}

	resetToDemoSeed() {
		const seed = createSeedData();
		this.applyData(seed);
		this.currentUserId = 100;
		this.highlightedStudentId = 9;
		this.lastStudentSuccessMessage =
			'Data mahasiswa berhasil dikembalikan ke kondisi awal (Aris Maulana · NIM 312410466 & 8 mahasiswa lainnya).';
		this.persist();
		this.addToast('Data demo berhasil dikembalikan ke kondisi awal (Lampiran A PRD).', 'info');
	}

	get currentUser(): User | null {
		if (this.currentUserId === null) return null;
		return this.users.find((u) => u.id === this.currentUserId) ?? null;
	}

	get currentStudent(): Student | null {
		const u = this.currentUser;
		if (!u || u.role !== 'student') return null;
		return this.students.find((s) => s.user_id === u.id) ?? null;
	}

	get currentLecturer(): Lecturer | null {
		const u = this.currentUser;
		if (!u || u.role !== 'lecturer') return null;
		return this.lecturers.find((l) => l.user_id === u.id) ?? null;
	}

	get activeTerm(): AcademicTerm {
		return this.academicTerms.find((t) => t.is_active) ?? this.academicTerms[0];
	}

	get unreadNotificationsCount(): number {
		const u = this.currentUser;
		if (!u) return 0;
		return this.notifications.filter((n) => n.user_id === u.id && !n.read_at).length;
	}

	addToast(message: string, type: ToastMessage['type'] = 'success') {
		const id = Date.now() + Math.floor(Math.random() * 1000);
		this.toasts.push({ id, type, message });
		if (browser) {
			setTimeout(() => {
				this.dismissToast(id);
			}, 5000);
		}
	}

	dismissToast(id: number) {
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}

	addAuditLog(entry: {
		action: string;
		subject_type: string;
		subject_id: string;
		old_values?: unknown;
		new_values?: unknown;
		reason: string;
	}) {
		const u = this.currentUser;
		const newLog: AuditLog = {
			id: Math.max(0, ...this.auditLogs.map((a) => a.id)) + 1,
			user_id: u?.id ?? 0,
			user_name: u?.full_name ?? 'Sistem / Tamu',
			user_role: u?.role ?? 'student',
			action: entry.action,
			subject_type: entry.subject_type,
			subject_id: entry.subject_id,
			old_values:
				typeof entry.old_values === 'string'
					? entry.old_values
					: JSON.stringify(entry.old_values ?? {}),
			new_values:
				typeof entry.new_values === 'string'
					? entry.new_values
					: JSON.stringify(entry.new_values ?? {}),
			reason: entry.reason,
			ip: '103.18.44.88',
			created_at: new Date().toISOString()
		};
		this.auditLogs = [newLog, ...this.auditLogs];
	}

	addNotification(item: {
		user_id: number;
		type: NotificationItem['type'];
		title: string;
		message: string;
		link: string;
	}) {
		const newId = Math.max(0, ...this.notifications.map((n) => n.id)) + 1;
		this.notifications = [
			{
				id: newId,
				user_id: item.user_id,
				type: item.type,
				title: item.title,
				message: item.message,
				link: item.link,
				created_at: new Date().toISOString(),
				read_at: null
			},
			...this.notifications
		];
	}

	// =========================================================================
	// 1. AUTENTIKASI & AKUN (FR-AUTH-01..05, BR-02, AC-01)
	// =========================================================================
	login(identifier: string, password: string): { ok: boolean; error?: string; locked?: boolean } {
		const cleanId = identifier.trim().toLowerCase();
		const user = this.users.find(
			(u) => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
		);

		if (!user) {
			return {
				ok: false,
				error: 'Akun tidak ditemukan. Periksa kembali NIM, NIDN, atau alamat email Anda.'
			};
		}

		// Cek status mahasiswa Nonaktif (BR-02)
		if (user.role === 'student') {
			const student = this.students.find((s) => s.user_id === user.id);
			if (student?.status === 'inactive' || !user.is_active) {
				return {
					ok: false,
					error:
						'Status akun Anda saat ini Nonaktif sehingga tidak dapat masuk. Hubungi bagian Admin Akademik.'
				};
			}
		}

		// Cek kunci akun (FR-AUTH-05, AC-01)
		if (user.locked_until) {
			const lockTime = new Date(user.locked_until).getTime();
			if (Date.now() < lockTime) {
				const minutesLeft = Math.max(1, Math.ceil((lockTime - Date.now()) / 60000));
				return {
					ok: false,
					locked: true,
					error: `Terlalu banyak percobaan masuk. Coba lagi dalam ${minutesLeft} menit atau hubungi admin akademik.`
				};
			} else {
				user.locked_until = null;
				user.failed_login_count = 0;
			}
		}

		if (user.password !== password) {
			user.failed_login_count += 1;
			const maxAttempts = this.appSettings.login_max_attempts || 5;
			if (user.failed_login_count >= maxAttempts) {
				const lockMins = this.appSettings.login_lock_minutes || 15;
				const unlockAt = new Date(Date.now() + lockMins * 60 * 1000).toISOString();
				user.locked_until = unlockAt;
				this.addAuditLog({
					action: 'auth.account_locked',
					subject_type: 'User',
					subject_id: `${user.username} (${user.full_name})`,
					old_values: { failed_login_count: maxAttempts - 1 },
					new_values: { failed_login_count: user.failed_login_count, locked_until: unlockAt },
					reason: `Gagal login ${maxAttempts} kali berturut-turut`
				});
				this.persist();
				return {
					ok: false,
					locked: true,
					error: `Terlalu banyak percobaan masuk. Coba lagi dalam ${lockMins} menit atau hubungi admin akademik.`
				};
			}
			const remaining = maxAttempts - user.failed_login_count;
			this.persist();
			return {
				ok: false,
				error: `Kata sandi tidak sesuai. Sisa percobaan sebelum akun dikunci: ${remaining} kali.`
			};
		}

		// Sukses login
		user.failed_login_count = 0;
		user.locked_until = null;
		user.last_login_at = new Date().toISOString();
		this.currentUserId = user.id;
		this.addAuditLog({
			action: 'auth.login_success',
			subject_type: 'User',
			subject_id: `${user.username} (${user.full_name})`,
			old_values: {},
			new_values: { role: user.role },
			reason: 'Login pengguna melalui halaman masuk'
		});
		this.persist();
		return { ok: true };
	}

	unlockAccount(identifierOrId: string | number) {
		const user = this.users.find(
			(u) =>
				u.id === identifierOrId ||
				u.username.toLowerCase() === String(identifierOrId).toLowerCase() ||
				u.email.toLowerCase() === String(identifierOrId).toLowerCase()
		);
		if (user) {
			user.failed_login_count = 0;
			user.locked_until = null;
			this.persist();
			this.addToast(`Kunci akun ${user.full_name} (${user.username}) telah dibuka.`, 'info');
		}
	}

	switchDemoUser(username: string): User | null {
		const user = this.users.find((u) => u.username === username);
		if (!user) return null;
		user.failed_login_count = 0;
		user.locked_until = null;
		this.currentUserId = user.id;
		this.persist();
		this.addToast(`Beralih ke akun demo: ${user.full_name}`, 'info');
		return user;
	}

	logout() {
		this.currentUserId = null;
		this.persist();
	}

	// =========================================================================
	// 2. PERHITUNGAN NILAI (architecture.md §7 & PRD Lampiran A.9)
	// =========================================================================
	calculateLetterGrade(score: number): { letter: string; points: number } {
		const sortedScale = [...this.appSettings.grade_scale].sort((a, b) => b.min - a.min);
		for (const band of sortedScale) {
			if (score >= band.min) {
				return { letter: band.letter, points: band.points };
			}
		}
		return { letter: 'E', points: 0.0 };
	}

	recalculateEnrollmentGrade(enrollmentId: number) {
		const enrollment = this.enrollments.find((e) => e.id === enrollmentId);
		if (!enrollment) return;

		const components = this.gradeComponents.filter(
			(c) => c.course_class_id === enrollment.course_class_id
		);
		if (components.length === 0) return;

		let total = 0;
		for (const comp of components) {
			const entry = this.gradeEntries.find(
				(ge) => ge.grade_component_id === comp.id && ge.enrollment_id === enrollmentId
			);
			const score = entry?.score ?? 0;
			total += (score * comp.weight) / 100;
		}

		const rounded = Math.round(total * 100) / 100;
		const { letter, points } = this.calculateLetterGrade(rounded);
		enrollment.final_score = rounded;
		enrollment.letter_grade = letter;
		enrollment.grade_points = points;
	}

	getAttendancePercentage(courseClassId: number, enrollmentId: number): number {
		const sessions = this.attendanceSessions.filter((s) => s.course_class_id === courseClassId);
		const recordedSessions = sessions.filter((s) =>
			this.attendanceRecords.some((r) => r.attendance_session_id === s.id)
		);
		if (recordedSessions.length === 0) return 100;

		let attendedCount = 0;
		for (const s of recordedSessions) {
			const rec = this.attendanceRecords.find(
				(r) => r.attendance_session_id === s.id && r.enrollment_id === enrollmentId
			);
			// BR-06: hadir + izin/sakit terverifikasi dibagi total sesi
			if (rec && (rec.status === 'present' || rec.status === 'excused' || rec.status === 'sick')) {
				attendedCount += 1;
			}
		}
		return Math.round((attendedCount / recordedSessions.length) * 100);
	}

	getClassProgress(courseClassId: number, enrollmentId: number): {
		completed: number;
		total: number;
		percent: number;
	} {
		const publishedMaterials = this.materials.filter(
			(m) => m.course_class_id === courseClassId && m.status === 'published'
		);
		const total = publishedMaterials.length;
		if (total === 0) return { completed: 0, total: 0, percent: 0 };

		const completed = publishedMaterials.filter((m) =>
			this.materialProgress.some(
				(mp) => mp.material_id === m.id && mp.enrollment_id === enrollmentId
			)
		).length;

		return {
			completed,
			total,
			percent: Math.round((completed / total) * 100)
		};
	}

	// =========================================================================
	// 3. MATERI & PROGRES (FR-MAT-01..04)
	// =========================================================================
	toggleMaterialCompleted(materialId: number, enrollmentId: number) {
		const idx = this.materialProgress.findIndex(
			(mp) => mp.material_id === materialId && mp.enrollment_id === enrollmentId
		);
		if (idx >= 0) {
			this.materialProgress.splice(idx, 1);
			this.addToast('Penanda selesai materi dibatalkan.', 'info');
		} else {
			this.materialProgress.push({
				material_id: materialId,
				enrollment_id: enrollmentId,
				completed_at: new Date().toISOString()
			});
			this.addToast('Materi berhasil ditandai selesai.', 'success');
		}
		this.persist();
	}

	saveMaterial(payload: Omit<Material, 'id'> & { id?: number }) {
		if (payload.id) {
			const idx = this.materials.findIndex((m) => m.id === payload.id);
			if (idx >= 0) {
				this.materials[idx] = { ...payload, id: payload.id };
				this.addToast('Materi berhasil diperbarui.', 'success');
			}
		} else {
			const newId = Math.max(0, ...this.materials.map((m) => m.id)) + 1;
			this.materials.push({ ...payload, id: newId });
			this.addToast('Materi baru berhasil disimpan.', 'success');
		}
		this.persist();
	}

	// =========================================================================
	// 4. TUGAS & PENGUMPULAN (FR-TGS-01..04, BR-07, BR-08, BR-11, AC-02)
	// =========================================================================
	validateAndSubmitAssignment(params: {
		assignmentId: number;
		enrollmentId: number;
		fileName?: string;
		fileSizeMb?: number;
		link?: string;
		textContent?: string;
		simulateLateDays?: number;
	}): { ok: boolean; error?: string; message?: string } {
		const assignment = this.assignments.find((a) => a.id === params.assignmentId);
		if (!assignment) return { ok: false, error: 'Tugas tidak ditemukan.' };

		const maxMb = this.appSettings.upload_max_assignment_mb || 20;

		if (params.fileName) {
			const ext = params.fileName.split('.').pop()?.toLowerCase() ?? '';
			if (!ALLOWED_EXTENSIONS.includes(ext)) {
				return {
					ok: false,
					error: `Tipe berkas .${ext} tidak diizinkan. Gunakan berkas: ${ALLOWED_EXTENSIONS.join(', ')}.`
				};
			}
		}

		if (params.fileSizeMb !== undefined && params.fileSizeMb > maxMb) {
			return {
				ok: false,
				error: `Ukuran berkas maksimal ${maxMb} MB. Kompres berkas lalu coba lagi.`
			};
		}

		if (!params.fileName && !params.link && !params.textContent) {
			return {
				ok: false,
				error: 'Pilih berkas atau masukkan tautan pengumpulan sebelum mengirim tugas.'
			};
		}

		const lateDays = params.simulateLateDays ?? 0;
		let isLate = lateDays > 0;
		let penalty = 0;

		if (isLate) {
			if (assignment.late_policy === 'reject') {
				return {
					ok: false,
					error: 'Tenggat tugas telah berakhir dan tugas ini tidak menerima pengumpulan terlambat.'
				};
			}
			if (lateDays > this.appSettings.late_max_days) {
				return {
					ok: false,
					error: `Keterlambatan melebihi batas maksimal ${this.appSettings.late_max_days} hari sehingga pengumpulan ditolak (BR-07).`
				};
			}
			penalty = lateDays * this.appSettings.late_penalty_per_day_percent;
		}

		const nowIso = '2026-10-18T11:55:00+07:00';
		const existing = this.submissions.find(
			(s) => s.assignment_id === params.assignmentId && s.enrollment_id === params.enrollmentId
		);

		if (existing) {
			const nextVersion = existing.version + 1;
			const newVer = {
				version: nextVersion,
				submitted_at: nowIso,
				file_name: params.fileName || existing.file_name,
				file_size_mb: params.fileSizeMb ?? existing.file_size_mb,
				link: params.link ?? existing.link,
				text_content: params.textContent ?? existing.text_content
			};
			// BR-08: simpan maksimal 3 versi terakhir
			const updatedHistory = [newVer, ...existing.history].slice(0, 3);
			existing.status = isLate ? 'late' : 'submitted';
			existing.submitted_at = nowIso;
			existing.file_name = newVer.file_name;
			existing.file_size_mb = newVer.file_size_mb;
			existing.link = newVer.link;
			existing.text_content = newVer.text_content;
			existing.penalty_applied = penalty;
			existing.version = nextVersion;
			existing.history = updatedHistory;
			existing.scan_status = 'clean';
		} else {
			const newId = Math.max(0, ...this.submissions.map((s) => s.id)) + 1;
			this.submissions.push({
				id: newId,
				assignment_id: params.assignmentId,
				enrollment_id: params.enrollmentId,
				status: isLate ? 'late' : 'submitted',
				submitted_at: nowIso,
				file_name: params.fileName,
				file_size_mb: params.fileSizeMb,
				link: params.link,
				text_content: params.textContent,
				score: null,
				penalty_applied: penalty,
				feedback: '',
				version: 1,
				history: [
					{
						version: 1,
						submitted_at: nowIso,
						file_name: params.fileName,
						file_size_mb: params.fileSizeMb,
						link: params.link,
						text_content: params.textContent
					}
				],
				scan_status: 'clean'
			});
		}

		const msg =
			'Tugas berhasil dikumpulkan pada 18 Oktober 2026 pukul 11.55 WIB. Anda masih dapat mengumpulkan ulang sebelum tenggat.';
		this.addToast(msg, 'success');
		this.persist();
		return { ok: true, message: msg };
	}

	gradeSubmission(params: {
		submissionId: number;
		score: number;
		feedback: string;
		requestRevision: boolean;
	}) {
		const sub = this.submissions.find((s) => s.id === params.submissionId);
		if (!sub) return;

		const oldScore = sub.score;
		const oldStatus = sub.status;
		const effectiveScore = Math.max(0, params.score - sub.penalty_applied);

		sub.score = params.requestRevision ? null : effectiveScore;
		sub.feedback = params.feedback;
		sub.status = params.requestRevision ? 'revision' : 'graded';

		const enrollment = this.enrollments.find((e) => e.id === sub.enrollment_id);
		const student = this.students.find((st) => st.id === enrollment?.student_id);
		const assignment = this.assignments.find((a) => a.id === sub.assignment_id);

		// Hitung ulang rata-rata komponen Tugas bila tidak sedang terkunci
		if (enrollment && !enrollment.grades_locked_at && !params.requestRevision) {
			const classAssignments = this.assignments.filter(
				(a) => a.course_class_id === enrollment.course_class_id && a.status !== 'scheduled'
			);
			const gradedSubs = this.submissions.filter(
				(s) =>
					s.enrollment_id === enrollment.id &&
					classAssignments.some((ca) => ca.id === s.assignment_id) &&
					s.score !== null
			);
			if (gradedSubs.length > 0) {
				const avg =
					Math.round(
						(gradedSubs.reduce((acc, item) => acc + (item.score ?? 0), 0) / gradedSubs.length) * 100
					) / 100;
				const assignmentComp = this.gradeComponents.find(
					(c) =>
						c.course_class_id === enrollment.course_class_id && c.source === 'assignment'
				);
				if (assignmentComp) {
					const ge = this.gradeEntries.find(
						(g) =>
							g.grade_component_id === assignmentComp.id && g.enrollment_id === enrollment.id
					);
					if (ge) ge.score = avg;
					this.recalculateEnrollmentGrade(enrollment.id);
				}
			}
		}

		if (student) {
			this.addNotification({
				user_id: student.user_id,
				type: 'grade',
				title: params.requestRevision
					? `Permintaan Revisi: ${assignment?.title}`
					: `Tugas Dinilai: ${assignment?.title}`,
				message: params.requestRevision
					? `Dosen meminta revisi pada tugas ${assignment?.code}. Catatan: ${params.feedback}`
					: `Nilai Anda untuk ${assignment?.code}: ${effectiveScore} / 100.`,
				link: `/classes/${enrollment?.course_class_id}/assignments/${sub.assignment_id}`
			});
		}

		this.addAuditLog({
			action: params.requestRevision ? 'submission.revision_requested' : 'submission.graded',
			subject_type: 'Submission',
			subject_id: `${assignment?.code} / ${student?.nim} (${student?.full_name})`,
			old_values: { score: oldScore, status: oldStatus },
			new_values: { score: sub.score, status: sub.status },
			reason: params.feedback || 'Penilaian tugas oleh dosen pengampu'
		});

		this.addToast(
			params.requestRevision
				? `Permintaan revisi dikirim kepada ${student?.full_name}.`
				: `Nilai tugas ${student?.full_name} berhasil disimpan.`,
			'success'
		);
		this.persist();
	}

	// =========================================================================
	// 5. PRESENSI (FR-PRS-01..04, AC-04, BR-06)
	// =========================================================================
	openAttendanceSession(params: {
		courseClassId: number;
		meetingNo: number;
		topic: string;
		durationMinutes: number;
		customCode?: string;
	}): AttendanceSession {
		// Tutup sesi lain yang terbuka di kelas ini
		for (const s of this.attendanceSessions) {
			if (s.course_class_id === params.courseClassId) {
				s.is_open = false;
			}
		}

		const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
		let randomPart = '';
		for (let i = 0; i < 4; i++) {
			randomPart += chars[Math.floor(Math.random() * chars.length)];
		}
		const code = (params.customCode?.trim().toUpperCase() || `PV-${randomPart}`).slice(0, 8);
		const now = new Date();
		const closes = new Date(now.getTime() + params.durationMinutes * 60000);

		const existing = this.attendanceSessions.find(
			(s) => s.course_class_id === params.courseClassId && s.meeting_no === params.meetingNo
		);

		if (existing) {
			existing.code = code;
			existing.topic = params.topic;
			existing.opens_at = now.toISOString();
			existing.closes_at = closes.toISOString();
			existing.is_open = true;
			this.persist();
			this.addToast(
				`Sesi presensi Pertemuan ${params.meetingNo} dibuka dengan kode ${code} selama ${params.durationMinutes} menit.`,
				'success'
			);
			return existing;
		}

		const newSession: AttendanceSession = {
			id: Math.max(0, ...this.attendanceSessions.map((s) => s.id)) + 1,
			course_class_id: params.courseClassId,
			meeting_no: params.meetingNo,
			session_date: now.toISOString().slice(0, 10),
			topic: params.topic,
			code,
			opens_at: now.toISOString(),
			closes_at: closes.toISOString(),
			is_open: true
		};
		this.attendanceSessions.push(newSession);
		this.persist();
		this.addToast(
			`Sesi presensi Pertemuan ${params.meetingNo} dibuka dengan kode ${code} selama ${params.durationMinutes} menit.`,
			'success'
		);
		return newSession;
	}

	checkInWithCode(params: {
		courseClassId: number;
		enrollmentId: number;
		code: string;
	}): { ok: boolean; message: string } {
		const cleanCode = params.code.trim().toUpperCase();
		if (!cleanCode) {
			return {
				ok: false,
				message: 'Masukkan kode presensi yang ditampilkan dosen terlebih dahulu.'
			};
		}

		const openSession = this.attendanceSessions.find(
			(s) => s.course_class_id === params.courseClassId && s.is_open
		);

		if (!openSession) {
			return {
				ok: false,
				message: 'Tidak ada sesi presensi yang sedang terbuka untuk kelas ini.'
			};
		}

		if (openSession.code.toUpperCase() !== cleanCode) {
			return {
				ok: false,
				message: 'Kode presensi tidak cocok. Periksa kode yang ditampilkan dosen, lalu coba lagi.'
			};
		}

		const existingRec = this.attendanceRecords.find(
			(r) =>
				r.attendance_session_id === openSession.id && r.enrollment_id === params.enrollmentId
		);

		const nowIso = '2026-10-19T08:07:00+07:00';
		if (existingRec) {
			existingRec.status = 'present';
			existingRec.checked_in_at = nowIso;
		} else {
			this.attendanceRecords.push({
				id: Math.max(0, ...this.attendanceRecords.map((r) => r.id)) + 1,
				attendance_session_id: openSession.id,
				enrollment_id: params.enrollmentId,
				status: 'present',
				checked_in_at: nowIso,
				note: 'Presensi mandiri dengan kode sesi'
			});
		}

		this.persist();
		const msg = `Kehadiran Pertemuan ${openSession.meeting_no} berhasil dicatat sebagai Hadir pada 19 Oktober 2026 pukul 08.07 WIB.`;
		this.addToast(msg, 'success');
		return { ok: true, message: msg };
	}

	updateAttendanceManual(params: {
		sessionId: number;
		enrollmentId: number;
		status: AttendanceStatus;
		note: string;
	}) {
		const existing = this.attendanceRecords.find(
			(r) => r.attendance_session_id === params.sessionId && r.enrollment_id === params.enrollmentId
		);
		if (existing) {
			existing.status = params.status;
			existing.note = params.note;
		} else {
			this.attendanceRecords.push({
				id: Math.max(0, ...this.attendanceRecords.map((r) => r.id)) + 1,
				attendance_session_id: params.sessionId,
				enrollment_id: params.enrollmentId,
				status: params.status,
				checked_in_at: params.status === 'present' ? new Date().toISOString() : null,
				note: params.note
			});
		}

		// Update komponen nilai kehadiran
		const enrollment = this.enrollments.find((e) => e.id === params.enrollmentId);
		if (enrollment && !enrollment.grades_locked_at) {
			const pct = this.getAttendancePercentage(enrollment.course_class_id, enrollment.id);
			const attComp = this.gradeComponents.find(
				(c) => c.course_class_id === enrollment.course_class_id && c.source === 'attendance'
			);
			if (attComp) {
				const ge = this.gradeEntries.find(
					(g) => g.grade_component_id === attComp.id && g.enrollment_id === enrollment.id
				);
				if (ge) ge.score = pct;
				this.recalculateEnrollmentGrade(enrollment.id);
			}
		}

		this.persist();
		this.addToast('Status kehadiran mahasiswa berhasil diperbarui.', 'success');
	}

	// =========================================================================
	// 6. BOBOT, REKAP, DAN PENGUNCIAN NILAI (FR-NIL-01..05, BR-04, BR-10, AC-07)
	// =========================================================================
	saveClassGradeWeights(
		courseClassId: number,
		weights: { componentId: number; weight: number }[]
	): { ok: boolean; error?: string } {
		const total = weights.reduce((acc, w) => acc + Number(w.weight || 0), 0);
		if (Math.round(total * 100) / 100 !== 100) {
			return {
				ok: false,
				error: `Total bobot komponen saat ini ${total}%. Total bobot harus tepat 100% (BR-04).`
			};
		}

		for (const w of weights) {
			const comp = this.gradeComponents.find((c) => c.id === w.componentId);
			if (comp) comp.weight = Number(w.weight);
		}

		const classEnrollments = this.enrollments.filter((e) => e.course_class_id === courseClassId);
		for (const enr of classEnrollments) {
			if (!enr.grades_locked_at) {
				this.recalculateEnrollmentGrade(enr.id);
			}
		}

		this.persist();
		this.addToast('Bobot komponen nilai berhasil disimpan dan nilai akhir dihitung ulang.', 'success');
		return { ok: true };
	}

	updateStudentComponentScore(enrollmentId: number, componentId: number, score: number) {
		const enrollment = this.enrollments.find((e) => e.id === enrollmentId);
		if (!enrollment || enrollment.grades_locked_at) return;

		const clamped = Math.max(0, Math.min(100, Number(score) || 0));
		const existing = this.gradeEntries.find(
			(ge) => ge.enrollment_id === enrollmentId && ge.grade_component_id === componentId
		);
		if (existing) {
			existing.score = clamped;
		} else {
			this.gradeEntries.push({
				id: Math.max(0, ...this.gradeEntries.map((g) => g.id)) + 1,
				enrollment_id: enrollmentId,
				grade_component_id: componentId,
				score: clamped
			});
		}
		this.recalculateEnrollmentGrade(enrollmentId);
		this.persist();
	}

	finalizeClassGrades(courseClassId: number): { ok: boolean; error?: string } {
		const comps = this.gradeComponents.filter((c) => c.course_class_id === courseClassId);
		const totalWeight = comps.reduce((s, c) => s + c.weight, 0);
		if (totalWeight !== 100) {
			return {
				ok: false,
				error: 'Tidak dapat memfinalisasi nilai karena total bobot komponen belum 100%.'
			};
		}

		const nowIso = new Date().toISOString();
		const cls = this.courseClasses.find((c) => c.id === courseClassId);
		const classEnrollments = this.enrollments.filter((e) => e.course_class_id === courseClassId);

		for (const enr of classEnrollments) {
			this.recalculateEnrollmentGrade(enr.id);
			enr.grades_locked_at = nowIso;
			const st = this.students.find((s) => s.id === enr.student_id);
			if (st) {
				this.addNotification({
					user_id: st.user_id,
					type: 'grade',
					title: `Nilai Akhir ${cls?.class_code} Telah Difinalisasi`,
					message: `Nilai akhir Anda pada kelas ${cls?.class_code} adalah ${enr.final_score?.toFixed(2).replace('.', ',')} (${enr.letter_grade}).`,
					link: '/grades'
				});
			}
		}

		this.addAuditLog({
			action: 'grades.finalized',
			subject_type: 'CourseClass',
			subject_id: cls?.class_code ?? String(courseClassId),
			old_values: { grades_locked_at: null },
			new_values: { grades_locked_at: nowIso, total_students: classEnrollments.length },
			reason: `Finalisasi dan penguncian nilai akhir semester kelas ${cls?.class_code}`
		});

		this.persist();
		this.addToast(
			`Nilai kelas ${cls?.class_code} berhasil dikunci. Seluruh kolom nilai kini berstatus baca-saja.`,
			'success'
		);
		return { ok: true };
	}

	adminOverrideLockedGrade(params: {
		enrollmentId: number;
		componentId: number;
		newScore: number;
		reason: string;
	}): { ok: boolean; error?: string } {
		if (!params.reason || params.reason.trim().length < 10) {
			return {
				ok: false,
				error:
					'Alasan tertulis wajib diisi (minimal 10 karakter) untuk mengoreksi nilai yang sudah terkunci (BR-10).'
			};
		}

		const enrollment = this.enrollments.find((e) => e.id === params.enrollmentId);
		if (!enrollment) return { ok: false, error: 'Data enrolment tidak ditemukan.' };

		const comp = this.gradeComponents.find((c) => c.id === params.componentId);
		const student = this.students.find((s) => s.id === enrollment.student_id);
		const cls = this.courseClasses.find((c) => c.id === enrollment.course_class_id);

		const entry = this.gradeEntries.find(
			(ge) => ge.enrollment_id === params.enrollmentId && ge.grade_component_id === params.componentId
		);
		const oldScore = entry?.score ?? 0;
		const oldFinal = enrollment.final_score;
		const oldLetter = enrollment.letter_grade;

		if (entry) {
			entry.score = Number(params.newScore);
		} else {
			this.gradeEntries.push({
				id: Math.max(0, ...this.gradeEntries.map((g) => g.id)) + 1,
				enrollment_id: params.enrollmentId,
				grade_component_id: params.componentId,
				score: Number(params.newScore)
			});
		}

		this.recalculateEnrollmentGrade(params.enrollmentId);

		this.addAuditLog({
			action: 'grades.locked_override',
			subject_type: 'GradeEntry',
			subject_id: `${cls?.class_code} / ${student?.nim} (${student?.full_name}) / ${comp?.name}`,
			old_values: {
				component_score: oldScore,
				final_score: oldFinal,
				letter_grade: oldLetter
			},
			new_values: {
				component_score: Number(params.newScore),
				final_score: enrollment.final_score,
				letter_grade: enrollment.letter_grade
			},
			reason: params.reason.trim()
		});

		this.persist();
		this.addToast(
			`Koreksi nilai ${student?.full_name} berhasil disimpan dan tercatat di Audit Log.`,
			'success'
		);
		return { ok: true };
	}

	// =========================================================================
	// 7. KUIS & AUTOSAVE (FR-KUI-01..04, AC-06, BR-09)
	// =========================================================================
	startOrResumeQuizAttempt(quizId: number, enrollmentId: number): QuizAttempt {
		const existing = this.quizAttempts.find(
			(qa) => qa.quiz_id === quizId && qa.enrollment_id === enrollmentId
		);
		if (existing) return existing;

		const quiz = this.quizzes.find((q) => q.id === quizId);
		const durationMins = quiz?.duration_minutes ?? 20;
		const now = new Date();
		const deadline = new Date(now.getTime() + durationMins * 60000);

		const attempt: QuizAttempt = {
			id: Math.max(0, ...this.quizAttempts.map((a) => a.id)) + 1,
			quiz_id: quizId,
			enrollment_id: enrollmentId,
			status: 'in_progress',
			started_at: now.toISOString(),
			deadline_at: deadline.toISOString(),
			last_saved_at: now.toISOString(),
			answers: {},
			score: null
		};
		this.quizAttempts.push(attempt);
		this.persist();
		return attempt;
	}

	autosaveQuizAnswer(attemptId: number, questionId: number, selectedOption: string) {
		const attempt = this.quizAttempts.find((a) => a.id === attemptId);
		if (!attempt || attempt.status !== 'in_progress') return;
		attempt.answers = { ...attempt.answers, [questionId]: selectedOption };
		attempt.last_saved_at = new Date().toISOString();
		this.persist();
	}

	submitQuizAttempt(attemptId: number): QuizAttempt | null {
		const attempt = this.quizAttempts.find((a) => a.id === attemptId);
		if (!attempt) return null;

		const questions = this.quizQuestions.filter((q) => q.quiz_id === attempt.quiz_id);
		let totalPoints = 0;
		let earnedPoints = 0;

		for (const q of questions) {
			totalPoints += q.points;
			const ans = attempt.answers[q.id];
			if (ans && ans.trim().toUpperCase() === q.answer_key.trim().toUpperCase()) {
				earnedPoints += q.points;
			}
		}

		const finalScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
		attempt.status = 'submitted';
		attempt.submitted_at = new Date().toISOString();
		attempt.score = finalScore;

		// Update komponen nilai Kuis jika belum dikunci
		const enrollment = this.enrollments.find((e) => e.id === attempt.enrollment_id);
		if (enrollment && !enrollment.grades_locked_at) {
			const quizComp = this.gradeComponents.find(
				(c) => c.course_class_id === enrollment.course_class_id && c.source === 'quiz'
			);
			if (quizComp) {
				const ge = this.gradeEntries.find(
					(g) => g.grade_component_id === quizComp.id && g.enrollment_id === enrollment.id
				);
				if (ge) {
					ge.score = finalScore;
				}
				this.recalculateEnrollmentGrade(enrollment.id);
			}
		}

		this.persist();
		this.addToast(`Kuis berhasil dikirim! Nilai otomatis Anda: ${finalScore} / 100.`, 'success');
		return attempt;
	}

	// =========================================================================
	// 8. ADMIN AKADEMIK CRUD & IMPOR CSV (FR-AKD-01..07, S14, S15)
	// =========================================================================
	saveStudent(params: {
		id?: number;
		nim: string;
		full_name: string;
		study_program_id: number;
		cohort_year: number;
		semester: number;
		status: StudentStatus;
		email: string;
		whatsapp?: string;
		peminatan?: string;
		jenis_kelas?: 'Reguler' | 'Karyawan';
		ttl?: string;
		alamat?: string;
		portfolio?: string;
		github?: string;
		instagram?: string;
		threads?: string;
		avatar_url?: string;
		reason?: string;
	}): { ok: boolean; error?: string; studentId?: number } {
		const cleanNim = params.nim.trim();
		if (!/^[0-9]{8,9}$/.test(cleanNim)) {
			return { ok: false, error: 'NIM harus terdiri dari 8–9 digit angka, contoh: 312410466 atau 24010101.' };
		}
		if (!params.full_name.trim()) {
			return { ok: false, error: 'Nama lengkap wajib diisi.' };
		}
		if (!params.study_program_id) {
			return { ok: false, error: 'Pilih salah satu program studi.' };
		}

		const duplicate = this.students.find(
			(s) => s.nim === cleanNim && (params.id === undefined || s.id !== params.id)
		);
		if (duplicate) {
			return {
				ok: false,
				error: `NIM ${cleanNim} sudah terdaftar atas nama ${duplicate.full_name}.`
			};
		}

		if (params.id) {
			const existing = this.students.find((s) => s.id === params.id);
			if (!existing) return { ok: false, error: 'Data mahasiswa tidak ditemukan.' };
			const oldStatus = existing.status;
			existing.nim = cleanNim;
			existing.full_name = params.full_name.trim();
			existing.study_program_id = Number(params.study_program_id);
			existing.cohort_year = Number(params.cohort_year || 2024);
			existing.semester = Number(params.semester || 5);
			existing.status = params.status;
			existing.email = params.email.trim() || `${cleanNim}@mhs.pelitabangsa.ac.id`;
			if (params.whatsapp !== undefined) existing.whatsapp = params.whatsapp.trim();
			if (params.peminatan !== undefined) existing.peminatan = params.peminatan.trim();
			if (params.jenis_kelas !== undefined) existing.jenis_kelas = params.jenis_kelas;
			if (params.ttl !== undefined) existing.ttl = params.ttl.trim();
			if (params.alamat !== undefined) existing.alamat = params.alamat.trim();
			if (params.portfolio !== undefined) existing.portfolio = params.portfolio.trim();
			if (params.github !== undefined) existing.github = params.github.trim();
			if (params.instagram !== undefined) existing.instagram = params.instagram.trim();
			if (params.threads !== undefined) existing.threads = params.threads.trim();
			if (params.avatar_url !== undefined) existing.avatar_url = params.avatar_url;
			existing.updated_at = new Date().toISOString();

			const usr = this.users.find((u) => u.id === existing.user_id);
			if (usr) {
				usr.username = cleanNim;
				usr.full_name = existing.full_name;
				usr.email = existing.email;
				usr.is_active = params.status !== 'inactive';
			}

			if (oldStatus !== params.status) {
				this.addAuditLog({
					action: 'student.status_updated',
					subject_type: 'Student',
					subject_id: `${existing.nim} (${existing.full_name})`,
					old_values: { status: oldStatus },
					new_values: { status: params.status },
					reason: params.reason || 'Perubahan status akademik mahasiswa oleh Admin Akademik'
				});
			}

			this.highlightedStudentId = existing.id;
			this.lastStudentSuccessMessage = `Data mahasiswa ${existing.full_name} (NIM ${cleanNim}) berhasil diperbarui. Anda dapat mengubah data lain atau memeriksa daftar di bawah.`;
			this.persist();
			this.addToast(
				'Data mahasiswa berhasil disimpan. Anda dapat menambah mahasiswa lain atau kembali ke daftar.',
				'success'
			);
			return { ok: true, studentId: existing.id };
		} else {
			const newUserId = Math.max(200, ...this.users.map((u) => u.id)) + 1;
			const newStudentId = Math.max(0, ...this.students.map((s) => s.id)) + 1;
			const email =
				params.email.trim() ||
				`${params.full_name.trim().toLowerCase().replace(/[^a-z0-9]/g, '.')}@mhs.pelitabangsa.ac.id`;

			this.users.push({
				id: newUserId,
				username: cleanNim,
				email,
				password: 'Demo#2026',
				role: 'student',
				full_name: params.full_name.trim(),
				is_active: params.status !== 'inactive',
				failed_login_count: 0,
				locked_until: null,
				last_login_at: null
			});

			this.students = [
				{
					id: newStudentId,
					user_id: newUserId,
					study_program_id: Number(params.study_program_id),
					nim: cleanNim,
					full_name: params.full_name.trim(),
					cohort_year: Number(params.cohort_year || 2024),
					semester: Number(params.semester || 5),
					status: params.status,
					email,
					whatsapp: params.whatsapp?.trim() || '',
					peminatan: params.peminatan?.trim() || '',
					jenis_kelas: params.jenis_kelas || 'Reguler',
					ttl: params.ttl?.trim() || '',
					alamat: params.alamat?.trim() || '',
					portfolio: params.portfolio?.trim() || '',
					github: params.github?.trim() || '',
					instagram: params.instagram?.trim() || '',
					threads: params.threads?.trim() || '',
					avatar_url: params.avatar_url,
					updated_at: new Date().toISOString()
				},
				...this.students
			];

			this.addAuditLog({
				action: 'student.created',
				subject_type: 'Student',
				subject_id: `${cleanNim} (${params.full_name.trim()})`,
				old_values: {},
				new_values: { nim: cleanNim, status: params.status, study_program_id: params.study_program_id },
				reason: 'Penambahan mahasiswa baru'
			});

			this.highlightedStudentId = newStudentId;
			this.lastStudentSuccessMessage = `Data mahasiswa ${params.full_name.trim()} (NIM ${cleanNim}) berhasil disimpan. Anda dapat menambah mahasiswa lain atau memeriksa baris yang disorot di bawah.`;
			this.persist();
			this.addToast(
				'Data mahasiswa berhasil disimpan. Anda dapat menambah mahasiswa lain atau kembali ke daftar.',
				'success'
			);
			return { ok: true, studentId: newStudentId };
		}
	}
}

export const lms = new LmsStore();

