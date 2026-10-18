import type {
	AcademicTerm,
	Announcement,
	AppSettings,
	Assignment,
	AttendanceRecord,
	AttendanceSession,
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
	StudyProgram,
	Submission,
	User
} from './types';

export interface SeedData {
	users: User[];
	faculties: Faculty[];
	studyPrograms: StudyProgram[];
	academicTerms: AcademicTerm[];
	students: Student[];
	lecturers: Lecturer[];
	courses: Course[];
	courseClasses: CourseClass[];
	enrollments: Enrollment[];
	materials: Material[];
	materialProgress: MaterialProgress[];
	assignments: Assignment[];
	submissions: Submission[];
	quizzes: Quiz[];
	quizQuestions: QuizQuestion[];
	quizAttempts: QuizAttempt[];
	attendanceSessions: AttendanceSession[];
	attendanceRecords: AttendanceRecord[];
	gradeComponents: GradeComponent[];
	gradeEntries: GradeEntry[];
	discussionThreads: DiscussionThread[];
	discussionPosts: DiscussionPost[];
	announcements: Announcement[];
	notifications: NotificationItem[];
	auditLogs: AuditLog[];
	appSettings: AppSettings;
}

export function createSeedData(): SeedData {
	const faculties: Faculty[] = [
		{ id: 1, name: 'Fakultas Teknik' },
		{ id: 2, name: 'Fakultas Ekonomi dan Bisnis' }
	];

	const studyPrograms: StudyProgram[] = [
		{ id: 1, faculty_id: 1, code: 'INF', name: 'Informatika' },
		{ id: 2, faculty_id: 1, code: 'SI', name: 'Sistem Informasi' },
		{ id: 3, faculty_id: 1, code: 'TI', name: 'Teknik Industri' },
		{ id: 4, faculty_id: 2, code: 'MJ', name: 'Manajemen' },
		{ id: 5, faculty_id: 2, code: 'AK', name: 'Akuntansi' }
	];

	const academicTerms: AcademicTerm[] = [
		{
			id: 1,
			name: 'Semester Ganjil 2026/2027',
			starts_on: '2026-09-07',
			ends_on: '2027-01-22',
			is_active: true,
			enrollment_weeks: 2
		},
		{
			id: 2,
			name: 'Semester Genap 2025/2026',
			starts_on: '2026-02-09',
			ends_on: '2026-06-26',
			is_active: false,
			enrollment_weeks: 2
		}
	];

	const users: User[] = [
		// Super Admin & Admin Akademik (A.2)
		{
			id: 1,
			username: 'superadmin',
			email: 'superadmin@lms.example',
			password: 'Demo#2026',
			role: 'super_admin',
			full_name: 'Tim IT Kampus',
			is_active: true,
			failed_login_count: 0,
			locked_until: null,
			last_login_at: '2026-10-18T08:00:00+07:00',
			totp_enabled: true,
			is_demo: true
		},
		{
			id: 2,
			username: 'A001',
			email: 'agus.setiawan@lms.example',
			password: 'Demo#2026',
			role: 'academic_admin',
			full_name: 'Agus Setiawan',
			is_active: true,
			failed_login_count: 0,
			locked_until: null,
			last_login_at: '2026-10-18T08:30:00+07:00',
			totp_enabled: false,
			is_demo: true
		},
		// Dosen D001 - D005 (A.3)
		{
			id: 3,
			username: '9900000001',
			email: 'ahmad.fauzi@lms.example',
			password: 'Demo#2026',
			role: 'lecturer',
			full_name: 'Dr. Ahmad Fauzi, M.Kom.',
			is_active: true,
			failed_login_count: 0,
			locked_until: null,
			last_login_at: '2026-10-18T09:15:00+07:00',
			is_demo: true
		},
		{
			id: 4,
			username: '9900000002',
			email: 'rina.marlina@lms.example',
			password: 'Demo#2026',
			role: 'lecturer',
			full_name: 'Rina Marlina, S.Kom., M.T.',
			is_active: true,
			failed_login_count: 0,
			locked_until: null,
			last_login_at: '2026-10-17T14:20:00+07:00',
			is_demo: true
		},
		{
			id: 5,
			username: '9900000003',
			email: 'hendra.wijaya@lms.example',
			password: 'Demo#2026',
			role: 'lecturer',
			full_name: 'Hendra Wijaya, M.Si.',
			is_active: true,
			failed_login_count: 0,
			locked_until: null,
			last_login_at: '2026-10-17T11:00:00+07:00',
			is_demo: true
		},
		{
			id: 6,
			username: '9900000004',
			email: 'dewi.lestari@lms.example',
			password: 'Demo#2026',
			role: 'lecturer',
			full_name: 'Dewi Lestari, S.E., M.M.',
			is_active: true,
			failed_login_count: 0,
			locked_until: null,
			last_login_at: '2026-10-16T15:00:00+07:00',
			is_demo: true
		},
		{
			id: 7,
			username: '9900000005',
			email: 'budi.santoso@lms.example',
			password: 'Demo#2026',
			role: 'lecturer',
			full_name: 'Budi Santoso, S.T., M.T.',
			is_active: true,
			failed_login_count: 0,
			locked_until: null,
			last_login_at: '2026-10-16T10:00:00+07:00',
			is_demo: true
		},
		// Mahasiswa (Proyek Sebelumnya: Aris Maulana + PRD Lampiran A.4)
		{
			id: 100,
			username: '312410466',
			email: 'aris.maulana@mhs.pelitabangsa.ac.id',
			password: 'Demo#2026',
			role: 'student',
			full_name: 'Aris Maulana',
			is_active: true,
			failed_login_count: 0,
			locked_until: null,
			last_login_at: '2026-10-18T12:00:00+07:00',
			is_demo: true
		},
		{
			id: 101,
			username: '24010101',
			email: 'naila.putri@mhs.lms.example',
			password: 'Demo#2026',
			role: 'student',
			full_name: 'Naila Putri',
			is_active: true,
			failed_login_count: 0,
			locked_until: null,
			last_login_at: '2026-10-18T11:00:00+07:00',
			is_demo: true
		},
		{
			id: 102,
			username: '24010102',
			email: 'bima.arya@mhs.lms.example',
			password: 'Demo#2026',
			role: 'student',
			full_name: 'Bima Arya',
			is_active: true,
			failed_login_count: 0,
			locked_until: null,
			last_login_at: '2026-10-17T19:00:00+07:00',
			is_demo: true
		},
		{
			id: 103,
			username: '24010103',
			email: 'sari.dewi@mhs.lms.example',
			password: 'Demo#2026',
			role: 'student',
			full_name: 'Sari Dewi',
			is_active: true,
			failed_login_count: 0,
			locked_until: null,
			last_login_at: '2026-10-15T10:00:00+07:00',
			is_demo: true
		},
		{
			id: 104,
			username: '24020101',
			email: 'rizky.pratama@mhs.lms.example',
			password: 'Demo#2026',
			role: 'student',
			full_name: 'Rizky Pratama',
			is_active: true,
			failed_login_count: 0,
			locked_until: null,
			last_login_at: '2026-10-17T16:30:00+07:00',
			is_demo: true
		},
		{
			id: 105,
			username: '24020102',
			email: 'aulia.rahma@mhs.lms.example',
			password: 'Demo#2026',
			role: 'student',
			full_name: 'Aulia Rahma',
			is_active: true,
			failed_login_count: 0,
			locked_until: null,
			last_login_at: '2026-10-18T09:10:00+07:00',
			is_demo: true
		},
		{
			id: 106,
			username: '24030101',
			email: 'dimas.saputra@mhs.lms.example',
			password: 'Demo#2026',
			role: 'student',
			full_name: 'Dimas Saputra',
			is_active: true,
			failed_login_count: 0,
			locked_until: null,
			last_login_at: '2026-10-16T08:00:00+07:00',
			is_demo: true
		},
		{
			id: 107,
			username: '24040101',
			email: 'maya.anggraini@mhs.lms.example',
			password: 'Demo#2026',
			role: 'student',
			full_name: 'Maya Anggraini',
			is_active: true,
			failed_login_count: 0,
			locked_until: null,
			last_login_at: '2026-10-16T09:00:00+07:00',
			is_demo: true
		},
		{
			id: 108,
			username: '24050101',
			email: 'fajar.nugroho@mhs.lms.example',
			password: 'Demo#2026',
			role: 'student',
			full_name: 'Fajar Nugroho',
			is_active: true,
			failed_login_count: 0,
			locked_until: null,
			last_login_at: '2026-10-15T13:00:00+07:00',
			is_demo: true
		}
	];

	const lecturers: Lecturer[] = [
		{
			id: 1,
			user_id: 3,
			code: 'D001',
			nidn: '9900000001',
			full_name: 'Dr. Ahmad Fauzi, M.Kom.',
			study_program_id: 1,
			email: 'ahmad.fauzi@lms.example'
		},
		{
			id: 2,
			user_id: 4,
			code: 'D002',
			nidn: '9900000002',
			full_name: 'Rina Marlina, S.Kom., M.T.',
			study_program_id: 1,
			email: 'rina.marlina@lms.example'
		},
		{
			id: 3,
			user_id: 5,
			code: 'D003',
			nidn: '9900000003',
			full_name: 'Hendra Wijaya, M.Si.',
			study_program_id: 2,
			email: 'hendra.wijaya@lms.example'
		},
		{
			id: 4,
			user_id: 6,
			code: 'D004',
			nidn: '9900000004',
			full_name: 'Dewi Lestari, S.E., M.M.',
			study_program_id: 4,
			email: 'dewi.lestari@lms.example'
		},
		{
			id: 5,
			user_id: 7,
			code: 'D005',
			nidn: '9900000005',
			full_name: 'Budi Santoso, S.T., M.T.',
			study_program_id: 3,
			email: 'budi.santoso@lms.example'
		}
	];

	const students: Student[] = [
		{
			id: 9,
			user_id: 100,
			study_program_id: 1,
			nim: '312410466',
			full_name: 'Aris Maulana',
			cohort_year: 2024,
			semester: 5,
			status: 'active',
			email: 'aris.maulana@mhs.pelitabangsa.ac.id',
			avatar_url: '/foto-aris.jpg',
			whatsapp: '081234567890',
			peminatan: 'Software Engineering & Web Development',
			jenis_kelas: 'Reguler',
			ttl: 'Bekasi, 12 Agustus 2003',
			alamat: 'Cikarang Selatan, Kab. Bekasi, Jawa Barat',
			portfolio: 'https://arismaulana.dev',
			github: 'https://github.com/arismaulana',
			instagram: 'https://instagram.com/arismaulana',
			threads: 'https://threads.net/@arismaulana'
		},
		{
			id: 1,
			user_id: 101,
			study_program_id: 1,
			nim: '24010101',
			full_name: 'Naila Putri',
			cohort_year: 2024,
			semester: 5,
			status: 'active',
			email: 'naila.putri@mhs.lms.example',
			whatsapp: '081298765432',
			peminatan: 'Software Engineering & Web Development',
			jenis_kelas: 'Reguler'
		},
		{
			id: 2,
			user_id: 102,
			study_program_id: 1,
			nim: '24010102',
			full_name: 'Bima Arya',
			cohort_year: 2024,
			semester: 5,
			status: 'active',
			email: 'bima.arya@mhs.lms.example',
			whatsapp: '081311223344',
			peminatan: 'Artificial Intelligence & Data Science',
			jenis_kelas: 'Reguler'
		},
		{
			id: 3,
			user_id: 103,
			study_program_id: 1,
			nim: '24010103',
			full_name: 'Sari Dewi',
			cohort_year: 2024,
			semester: 5,
			status: 'on_leave',
			email: 'sari.dewi@mhs.lms.example',
			whatsapp: '081566778899',
			peminatan: 'Mobile App Development',
			jenis_kelas: 'Karyawan'
		},
		{
			id: 4,
			user_id: 104,
			study_program_id: 2,
			nim: '24020101',
			full_name: 'Rizky Pratama',
			cohort_year: 2024,
			semester: 5,
			status: 'active',
			email: 'rizky.pratama@mhs.lms.example',
			whatsapp: '081744556677',
			peminatan: 'Cloud Computing & DevOps',
			jenis_kelas: 'Reguler'
		},
		{
			id: 5,
			user_id: 105,
			study_program_id: 2,
			nim: '24020102',
			full_name: 'Aulia Rahma',
			cohort_year: 2024,
			semester: 5,
			status: 'active',
			email: 'aulia.rahma@mhs.lms.example',
			whatsapp: '081922334455',
			peminatan: 'Software Engineering & Web Development',
			jenis_kelas: 'Reguler'
		},
		{
			id: 6,
			user_id: 106,
			study_program_id: 3,
			nim: '24030101',
			full_name: 'Dimas Saputra',
			cohort_year: 2024,
			semester: 5,
			status: 'active',
			email: 'dimas.saputra@mhs.lms.example',
			whatsapp: '082133445566',
			jenis_kelas: 'Karyawan'
		},
		{
			id: 7,
			user_id: 107,
			study_program_id: 4,
			nim: '24040101',
			full_name: 'Maya Anggraini',
			cohort_year: 2024,
			semester: 5,
			status: 'active',
			email: 'maya.anggraini@mhs.lms.example',
			whatsapp: '082255667788',
			jenis_kelas: 'Reguler'
		},
		{
			id: 8,
			user_id: 108,
			study_program_id: 5,
			nim: '24050101',
			full_name: 'Fajar Nugroho',
			cohort_year: 2024,
			semester: 5,
			status: 'active',
			email: 'fajar.nugroho@mhs.lms.example',
			whatsapp: '085266778899',
			jenis_kelas: 'Karyawan'
		}
	];

	const courses: Course[] = [
		{ id: 1, study_program_id: 1, code: 'INF301', name: 'Pemrograman Visual', credits: 3 },
		{ id: 2, study_program_id: 1, code: 'INF305', name: 'Basis Data Lanjut', credits: 3 },
		{ id: 3, study_program_id: 1, code: 'INF312', name: 'Rekayasa Perangkat Lunak', credits: 3 },
		{
			id: 4,
			study_program_id: 2,
			code: 'SI302',
			name: 'Analisis dan Perancangan Sistem',
			credits: 3
		},
		{ id: 5, study_program_id: 4, code: 'MJ301', name: 'Manajemen Pemasaran', credits: 3 },
		{ id: 6, study_program_id: 3, code: 'TI303', name: 'Pengendalian Kualitas', credits: 3 }
	];

	const courseClasses: CourseClass[] = [
		{
			id: 1,
			course_id: 1,
			academic_term_id: 1,
			lecturer_id: 1,
			class_code: 'INF301-5A',
			day_of_week: 'Senin',
			starts_at: '08:00',
			ends_at: '10:30',
			room: 'Lab Komputer 2',
			capacity: 40,
			meeting_link: 'https://meet.google.com/upl-inf301-5a'
		},
		{
			id: 2,
			course_id: 2,
			academic_term_id: 1,
			lecturer_id: 2,
			class_code: 'INF305-5A',
			day_of_week: 'Selasa',
			starts_at: '10:00',
			ends_at: '12:30',
			room: 'B-204',
			capacity: 40,
			meeting_link: 'https://meet.google.com/upl-inf305-5a'
		},
		{
			id: 3,
			course_id: 3,
			academic_term_id: 1,
			lecturer_id: 1,
			class_code: 'INF312-5A',
			day_of_week: 'Rabu',
			starts_at: '13:00',
			ends_at: '15:30',
			room: 'B-205',
			capacity: 40,
			meeting_link: 'https://meet.google.com/upl-inf312-5a'
		},
		{
			id: 4,
			course_id: 4,
			academic_term_id: 1,
			lecturer_id: 3,
			class_code: 'SI302-5A',
			day_of_week: 'Kamis',
			starts_at: '08:00',
			ends_at: '10:30',
			room: 'B-301',
			capacity: 40,
			meeting_link: 'https://meet.google.com/upl-si302-5a'
		},
		{
			id: 5,
			course_id: 5,
			academic_term_id: 1,
			lecturer_id: 4,
			class_code: 'MJ301-5A',
			day_of_week: 'Jumat',
			starts_at: '09:00',
			ends_at: '11:30',
			room: 'C-101',
			capacity: 40,
			meeting_link: 'https://meet.google.com/upl-mj301-5a'
		},
		{
			id: 6,
			course_id: 6,
			academic_term_id: 1,
			lecturer_id: 5,
			class_code: 'TI303-5A',
			day_of_week: 'Selasa',
			starts_at: '13:00',
			ends_at: '15:30',
			room: 'C-202',
			capacity: 40,
			meeting_link: 'https://meet.google.com/upl-ti303-5a'
		}
	];

	// Enrolments (A.6 + A.9 simulasi nilai akhir)
	const enrollments: Enrollment[] = [
		// INF301-5A: Naila (1), Bima (2), Rizky (4), Aulia (5)
		{
			id: 1,
			course_class_id: 1,
			student_id: 1,
			final_score: 90.5,
			letter_grade: 'A',
			grade_points: 4.0,
			grades_locked_at: null
		},
		{
			id: 2,
			course_class_id: 1,
			student_id: 2,
			final_score: 83.4,
			letter_grade: 'A-',
			grade_points: 3.7,
			grades_locked_at: null
		},
		{
			id: 3,
			course_class_id: 1,
			student_id: 4,
			final_score: 74.0,
			letter_grade: 'B',
			grade_points: 3.0,
			grades_locked_at: null
		},
		{
			id: 4,
			course_class_id: 1,
			student_id: 5,
			final_score: 94.0,
			letter_grade: 'A',
			grade_points: 4.0,
			grades_locked_at: null
		},
		// INF305-5A: Naila (1), Bima (2)
		{
			id: 5,
			course_class_id: 2,
			student_id: 1,
			final_score: 86.25,
			letter_grade: 'A',
			grade_points: 4.0,
			grades_locked_at: null
		},
		{
			id: 6,
			course_class_id: 2,
			student_id: 2,
			final_score: 81.0,
			letter_grade: 'A-',
			grade_points: 3.7,
			grades_locked_at: null
		},
		// INF312-5A: Naila (1), Bima (2)
		{
			id: 7,
			course_class_id: 3,
			student_id: 1,
			final_score: 88.0,
			letter_grade: 'A',
			grade_points: 4.0,
			grades_locked_at: null
		},
		{
			id: 8,
			course_class_id: 3,
			student_id: 2,
			final_score: 79.5,
			letter_grade: 'B+',
			grade_points: 3.3,
			grades_locked_at: null
		},
		// SI302-5A: Rizky (4), Aulia (5)
		{
			id: 9,
			course_class_id: 4,
			student_id: 4,
			final_score: 77.5,
			letter_grade: 'B+',
			grade_points: 3.3,
			grades_locked_at: null
		},
		{
			id: 10,
			course_class_id: 4,
			student_id: 5,
			final_score: 91.0,
			letter_grade: 'A',
			grade_points: 4.0,
			grades_locked_at: null
		},
		// MJ301-5A: Maya (7), Fajar (8)
		{
			id: 11,
			course_class_id: 5,
			student_id: 7,
			final_score: 85.0,
			letter_grade: 'A',
			grade_points: 4.0,
			grades_locked_at: null
		},
		{
			id: 12,
			course_class_id: 5,
			student_id: 8,
			final_score: 82.0,
			letter_grade: 'A-',
			grade_points: 3.7,
			grades_locked_at: null
		},
		// TI303-5A: Dimas (6)
		{
			id: 13,
			course_class_id: 6,
			student_id: 6,
			final_score: 84.0,
			letter_grade: 'A-',
			grade_points: 3.7,
			grades_locked_at: null
		},
		// Aris Maulana (9) di INF301-5A, INF305-5A, INF312-5A
		{
			id: 14,
			course_class_id: 1,
			student_id: 9,
			final_score: 95.0,
			letter_grade: 'A',
			grade_points: 4.0,
			grades_locked_at: null
		},
		{
			id: 15,
			course_class_id: 2,
			student_id: 9,
			final_score: 92.0,
			letter_grade: 'A',
			grade_points: 4.0,
			grades_locked_at: null
		},
		{
			id: 16,
			course_class_id: 3,
			student_id: 9,
			final_score: 91.5,
			letter_grade: 'A',
			grade_points: 4.0,
			grades_locked_at: null
		}
	];

	// Materi INF301-5A (A.7) + kelas lain
	const materials: Material[] = [
		{
			id: 1,
			course_class_id: 1,
			meeting_no: 1,
			code: 'P01',
			title: 'Pengantar Pemrograman Visual dan Bootstrap',
			description: 'Konsep antarmuka pengguna modern, instalasi Bootstrap 5.3, dan struktur dasar halaman.',
			type: 'file',
			file_format: 'PDF',
			file_name: 'P01-Pengantar-Pemrograman-Visual-Bootstrap.pdf',
			file_size_mb: 3.2,
			status: 'published',
			publish_at: '2026-09-14T07:00:00+07:00'
		},
		{
			id: 2,
			course_class_id: 1,
			meeting_no: 2,
			code: 'P02',
			title: 'Struktur HTML dan Utilitas Bootstrap',
			description: 'Semantic HTML5, spacing utilities (margin, padding, gap), warna, dan tipografi.',
			type: 'file',
			file_format: 'PPTX',
			file_name: 'P02-Struktur-HTML-dan-Utilitas-Bootstrap.pptx',
			file_size_mb: 5.8,
			status: 'published',
			publish_at: '2026-09-21T07:00:00+07:00'
		},
		{
			id: 3,
			course_class_id: 1,
			meeting_no: 3,
			code: 'P03',
			title: 'Layout: Container, Row, dan Kolom',
			description: 'Sistem grid 12 kolom Bootstrap, breakpoint responsif (xs, sm, md, lg, xl), dan mobile-first layout.',
			type: 'file',
			file_format: 'PDF',
			file_name: 'P03-Layout-Container-Row-Kolom.pdf',
			file_size_mb: 4.1,
			status: 'published',
			publish_at: '2026-09-28T07:00:00+07:00'
		},
		{
			id: 4,
			course_class_id: 1,
			meeting_no: 4,
			code: 'P04',
			title: 'Komponen Dasar: Button, Card, Navbar',
			description: 'Pemilihan komponen berdasarkan tugas pengguna: tombol primer/sekunder, kartu informasi, dan navigasi offcanvas.',
			type: 'file',
			file_format: 'PDF',
			file_name: 'P04-Komponen-Dasar-Button-Card-Navbar.pdf',
			file_size_mb: 3.9,
			status: 'published',
			publish_at: '2026-10-05T07:00:00+07:00'
		},
		{
			id: 5,
			course_class_id: 1,
			meeting_no: 5,
			code: 'P05',
			title: 'Rancang UI yang Jelas, Bukan Sekadar Cantik',
			description: 'Enam prinsip UI/UX (Konsistensi, Kejelasan, Hierarki, Feedback, Aksesibilitas WCAG AA, Responsivitas).',
			type: 'file',
			file_format: 'PDF',
			file_name: 'P05-Rancang-UI-yang-Jelas.pdf',
			file_size_mb: 2.7,
			status: 'published',
			publish_at: '2026-10-12T07:00:00+07:00'
		},
		{
			id: 6,
			course_class_id: 1,
			meeting_no: 6,
			code: 'P06',
			title: 'Form dan Validasi',
			description: 'Pola form yang jelas, label terlihat, pesan validasi spesifik per field, dan pencegahan salah input.',
			type: 'file',
			file_format: 'PDF',
			file_name: 'P06-Form-dan-Validasi.pdf',
			file_size_mb: 3.5,
			status: 'draft',
			publish_at: '2026-10-19T07:00:00+07:00'
		},
		// Materi INF305-5A
		{
			id: 7,
			course_class_id: 2,
			meeting_no: 1,
			code: 'P01',
			title: 'Arsitektur DBMS dan Model Relasional',
			description: 'Konsep kunci primer, kunci asing, dan integritas referensial.',
			type: 'file',
			file_format: 'PDF',
			file_name: 'INF305-P01-Model-Relasional.pdf',
			file_size_mb: 2.4,
			status: 'published',
			publish_at: '2026-09-15T08:00:00+07:00'
		},
		{
			id: 8,
			course_class_id: 2,
			meeting_no: 2,
			code: 'P02',
			title: 'Ketergantungan Fungsional dan Normalisasi 1NF–BCNF',
			description: 'Langkah sistematis mengeliminasi redundansi data.',
			type: 'file',
			file_format: 'PDF',
			file_name: 'INF305-P02-Normalisasi-1NF-3NF.pdf',
			file_size_mb: 3.1,
			status: 'published',
			publish_at: '2026-09-22T08:00:00+07:00'
		},
		// Materi INF312-5A
		{
			id: 9,
			course_class_id: 3,
			meeting_no: 1,
			code: 'P01',
			title: 'Penyusunan PRD dan Spesifikasi Kebutuhan Perangkat Lunak',
			description: 'Menulis User Stories, MoSCoW prioritization, dan Acceptance Criteria.',
			type: 'file',
			file_format: 'PDF',
			file_name: 'INF312-P01-Penyusunan-PRD.pdf',
			file_size_mb: 4.0,
			status: 'published',
			publish_at: '2026-09-16T08:00:00+07:00'
		}
	];

	// Progres belajar Naila di INF301-5A: 4 dari 5 materi selesai (80%) sesuai desain.md §8 S05
	const materialProgress: MaterialProgress[] = [
		{ material_id: 1, enrollment_id: 1, completed_at: '2026-09-14T11:00:00+07:00' },
		{ material_id: 2, enrollment_id: 1, completed_at: '2026-09-21T11:15:00+07:00' },
		{ material_id: 3, enrollment_id: 1, completed_at: '2026-09-28T11:30:00+07:00' },
		{ material_id: 4, enrollment_id: 1, completed_at: '2026-10-05T11:20:00+07:00' },
		{ material_id: 7, enrollment_id: 5, completed_at: '2026-09-16T14:00:00+07:00' },
		{ material_id: 9, enrollment_id: 7, completed_at: '2026-09-17T16:00:00+07:00' }
	];

	// Tugas (A.8)
	const assignments: Assignment[] = [
		{
			id: 1,
			code: 'T-001',
			course_class_id: 1,
			title: 'Setup Proyek dan Halaman Hello Bootstrap',
			instructions:
				'Buat halaman profil sederhana menggunakan grid Bootstrap 5 (container, row, col-12 col-lg-6) dan kumpulkan dalam bundel ZIP.',
			attachment_name: 'Panduan-Setup-Bootstrap5.pdf',
			due_at: '2026-10-04T23:59:00+07:00',
			max_score: 100,
			submission_type: 'file',
			submission_label: 'ZIP',
			late_policy: 'penalty',
			status: 'closed',
			publish_at: '2026-09-21T08:00:00+07:00'
		},
		{
			id: 2,
			code: 'T-002',
			course_class_id: 1,
			title: 'Audit UI/UX Aplikasi Data Mahasiswa',
			instructions:
				'Temukan minimal 3 masalah UI/UX pada tampilan lama aplikasi data mahasiswa (hierarki visual, kontras warna, responsivitas tabel di ponsel, atau kejelasan label form). Sertakan tangkapan layar sebelum perbaikan dan alasan perbaikan berdasarkan 6 prinsip desain.',
			attachment_name: 'Rubrik penilaian.pdf',
			due_at: '2026-10-25T23:59:00+07:00',
			max_score: 100,
			submission_type: 'file_and_link',
			submission_label: 'PDF + tautan',
			late_policy: 'penalty',
			status: 'published',
			publish_at: '2026-10-12T08:00:00+07:00'
		},
		{
			id: 3,
			code: 'T-003',
			course_class_id: 1,
			title: 'Redesign Form Tambah Mahasiswa (Bootstrap 5)',
			instructions:
				'Implementasikan ulang halaman Form Tambah Mahasiswa menggunakan komponen form Bootstrap 5 dengan validasi per field, tombol aksi yang jelas, dan dukungan aksesibilitas keyboard.',
			attachment_name: 'Spesifikasi-Form-S15.pdf',
			due_at: '2026-11-01T23:59:00+07:00',
			max_score: 100,
			submission_type: 'file_and_link',
			submission_label: 'ZIP + tautan repo',
			late_policy: 'penalty',
			status: 'scheduled',
			publish_at: '2026-10-26T08:00:00+07:00'
		},
		{
			id: 4,
			code: 'T-004',
			course_class_id: 2,
			title: 'Normalisasi Basis Data Perpustakaan (1NF–3NF)',
			instructions:
				'Lakukan dekomposisi tabel transaksi peminjaman buku perpustakaan kampus dari bentuk tidak normal (UNF) hingga memenuhi 1NF, 2NF, dan 3NF beserta diagram relasinya.',
			attachment_name: 'Studi-Kasus-Perpustakaan.pdf',
			due_at: '2026-10-22T23:59:00+07:00',
			max_score: 100,
			submission_type: 'file',
			submission_label: 'PDF',
			late_policy: 'penalty',
			status: 'published',
			publish_at: '2026-10-08T08:00:00+07:00'
		},
		{
			id: 5,
			code: 'T-005',
			course_class_id: 4,
			title: 'Diagram Use Case Sistem Peminjaman',
			instructions:
				'Susun Use Case Diagram dan Use Case Scenario untuk aktor Anggota, Petugas, dan Kepala Perpustakaan.',
			attachment_name: 'Template-UseCase.docx',
			due_at: '2026-10-29T23:59:00+07:00',
			max_score: 100,
			submission_type: 'file',
			submission_label: 'PDF',
			late_policy: 'reject',
			status: 'published',
			publish_at: '2026-10-15T08:00:00+07:00'
		}
	];

	// Pengumpulan Tugas (A.8):
	// Nilai T-001: Naila 88, Bima 80, Rizky 70, Aulia 95.
	// Status T-002 per 18 Okt 2026 11:30: Naila Dikumpulkan (17 Okt 20:14), Aulia Dikumpulkan (18 Okt 09:05), Bima dan Rizky Belum dikumpulkan.
	const submissions: Submission[] = [
		{
			id: 1,
			assignment_id: 1,
			enrollment_id: 1, // Naila
			status: 'graded',
			submitted_at: '2026-10-03T19:40:00+07:00',
			file_name: 'hello-bootstrap-naila.zip',
			file_size_mb: 1.8,
			score: 88,
			penalty_applied: 0,
			feedback: 'Struktur grid sudah sangat rapi dan responsif di layar 360px. Pertahankan!',
			version: 1,
			history: [
				{
					version: 1,
					submitted_at: '2026-10-03T19:40:00+07:00',
					file_name: 'hello-bootstrap-naila.zip',
					file_size_mb: 1.8
				}
			],
			scan_status: 'clean'
		},
		{
			id: 2,
			assignment_id: 1,
			enrollment_id: 2, // Bima
			status: 'graded',
			submitted_at: '2026-10-04T21:15:00+07:00',
			file_name: 'tugas1-bima-arya.zip',
			file_size_mb: 2.1,
			score: 80,
			penalty_applied: 0,
			feedback: 'Layout desktop sudah baik, namun jarak antar kartu di mobile masih perlu g-3.',
			version: 1,
			history: [
				{
					version: 1,
					submitted_at: '2026-10-04T21:15:00+07:00',
					file_name: 'tugas1-bima-arya.zip',
					file_size_mb: 2.1
				}
			],
			scan_status: 'clean'
		},
		{
			id: 3,
			assignment_id: 1,
			enrollment_id: 3, // Rizky
			status: 'graded',
			submitted_at: '2026-10-04T23:50:00+07:00',
			file_name: 'hello-bootstrap-rizky.zip',
			file_size_mb: 1.5,
			score: 70,
			penalty_applied: 0,
			feedback: 'Perhatikan kontras teks pada tombol dan tambahkan atribut alt pada gambar.',
			version: 1,
			history: [
				{
					version: 1,
					submitted_at: '2026-10-04T23:50:00+07:00',
					file_name: 'hello-bootstrap-rizky.zip',
					file_size_mb: 1.5
				}
			],
			scan_status: 'clean'
		},
		{
			id: 4,
			assignment_id: 1,
			enrollment_id: 4, // Aulia
			status: 'graded',
			submitted_at: '2026-10-02T16:20:00+07:00',
			file_name: 'setup-bootstrap-aulia.zip',
			file_size_mb: 2.4,
			score: 95,
			penalty_applied: 0,
			feedback: 'Sangat baik! Penggunaan semantic HTML, navbar offcanvas, dan kontras warna sudah memenuhi standar.',
			version: 1,
			history: [
				{
					version: 1,
					submitted_at: '2026-10-02T16:20:00+07:00',
					file_name: 'setup-bootstrap-aulia.zip',
					file_size_mb: 2.4
				}
			],
			scan_status: 'clean'
		},
		// T-002 Submissions
		{
			id: 17,
			assignment_id: 2,
			enrollment_id: 1, // Naila
			status: 'submitted',
			submitted_at: '2026-10-17T20:14:00+07:00',
			file_name: 'audit-uiux.pdf',
			file_size_mb: 4.0,
			link: 'https://github.com/example/audit-uiux-naila',
			score: null,
			penalty_applied: 0,
			feedback: '',
			version: 1,
			history: [
				{
					version: 1,
					submitted_at: '2026-10-17T20:14:00+07:00',
					file_name: 'audit-uiux.pdf',
					file_size_mb: 4.0,
					link: 'https://github.com/example/audit-uiux-naila'
				}
			],
			scan_status: 'clean'
		},
		{
			id: 18,
			assignment_id: 2,
			enrollment_id: 4, // Aulia
			status: 'submitted',
			submitted_at: '2026-10-18T09:05:00+07:00',
			file_name: 'audit-uiux-aulia-rahma.pdf',
			file_size_mb: 3.5,
			link: 'https://github.com/example/audit-uiux-aulia',
			score: null,
			penalty_applied: 0,
			feedback: '',
			version: 1,
			history: [
				{
					version: 1,
					submitted_at: '2026-10-18T09:05:00+07:00',
					file_name: 'audit-uiux-aulia-rahma.pdf',
					file_size_mb: 3.5,
					link: 'https://github.com/example/audit-uiux-aulia'
				}
			],
			scan_status: 'clean'
		}
	];

	// Kuis (A.8)
	const quizzes: Quiz[] = [
		{
			id: 1,
			code: 'K-001',
			course_class_id: 1,
			title: 'Kuis 1 — Dasar Komponen Bootstrap',
			description:
				'Kuis evaluasi materi Pertemuan 1 s.d. 5 mengenai sistem grid 12 kolom, komponen dasar Bootstrap 5, kontras warna WCAG AA, dan prinsip kejelasan UI.',
			opens_at: '2026-10-20T08:00:00+07:00',
			closes_at: '2026-10-20T23:59:00+07:00',
			duration_minutes: 20,
			max_attempts: 1,
			shuffle_questions: true
		}
	];

	const quizQuestions: QuizQuestion[] = [
		{
			id: 1,
			quiz_id: 1,
			type: 'mcq',
			body: 'Kelas mana yang membuat kolom menumpuk di layar kecil dan berbagi ruang sama rata di layar besar (≥ 992px)?',
			options: [
				{ key: 'A', text: 'col-12 col-lg-6' },
				{ key: 'B', text: 'container-fluid' },
				{ key: 'C', text: 'd-none' },
				{ key: 'D', text: 'g-3' }
			],
			answer_key: 'A',
			points: 10
		},
		{
			id: 2,
			quiz_id: 1,
			type: 'mcq',
			body: 'Berapa rasio kontras minimum teks normal terhadap latar belakang agar memenuhi standar aksesibilitas WCAG 2.1 level AA?',
			options: [
				{ key: 'A', text: '2,5 : 1' },
				{ key: 'B', text: '3,0 : 1' },
				{ key: 'C', text: '4,5 : 1' },
				{ key: 'D', text: '7,0 : 1' }
			],
			answer_key: 'C',
			points: 10
		},
		{
			id: 3,
			quiz_id: 1,
			type: 'mcq',
			body: 'Ukuran target sentuh (touch target) minimum yang direkomendasikan untuk tombol dan input pada layar ponsel adalah…',
			options: [
				{ key: 'A', text: '24 × 24 px' },
				{ key: 'B', text: '32 × 32 px' },
				{ key: 'C', text: '44 × 44 px' },
				{ key: 'D', text: '64 × 64 px' }
			],
			answer_key: 'C',
			points: 10
		},
		{
			id: 4,
			quiz_id: 1,
			type: 'mcq',
			body: 'Kapan sebuah tabel data sebaiknya diubah menjadi daftar kartu (card list) pada layar ponsel (< 768px)?',
			options: [
				{ key: 'A', text: 'Saat tabel hanya memiliki 2 kolom angka singkat' },
				{ key: 'B', text: 'Saat tabel memiliki > 4 kolom, teks panjang, atau tombol aksi per baris' },
				{ key: 'C', text: 'Tidak pernah, selalu gunakan tabel biasa tanpa pembungkus' },
				{ key: 'D', text: 'Hanya pada layar monitor 1920px' }
			],
			answer_key: 'B',
			points: 10
		},
		{
			id: 5,
			quiz_id: 1,
			type: 'mcq',
			body: 'Komponen Bootstrap 5 mana yang paling tepat untuk menampilkan pesan konfirmasi singkat yang hilang otomatis setelah data berhasil disimpan?',
			options: [
				{ key: 'A', text: 'Modal konfirmasi (.modal)' },
				{ key: 'B', text: 'Toast (.toast dengan aria-live="polite")' },
				{ key: 'C', text: 'Breadcrumb (.breadcrumb)' },
				{ key: 'D', text: 'Accordion (.accordion)' }
			],
			answer_key: 'B',
			points: 10
		},
		{
			id: 6,
			quiz_id: 1,
			type: 'mcq',
			body: 'Pada prinsip Kejelasan (Clarity), label tombol aksi utama pada form pengumpulan tugas sebaiknya ditulis sebagai…',
			options: [
				{ key: 'A', text: 'OK' },
				{ key: 'B', text: 'Submit' },
				{ key: 'C', text: 'Kumpulkan tugas' },
				{ key: 'D', text: 'Proses' }
			],
			answer_key: 'C',
			points: 10
		},
		{
			id: 7,
			quiz_id: 1,
			type: 'mcq',
			body: 'Kelas utilitas Bootstrap 5 untuk memberikan jarak (gap) konsisten sebesar 1rem antar kolom di dalam elemen .row adalah…',
			options: [
				{ key: 'A', text: 'g-3' },
				{ key: 'B', text: 'p-5' },
				{ key: 'C', text: 'm-auto' },
				{ key: 'D', text: 'col-gap-0' }
			],
			answer_key: 'A',
			points: 10
		},
		{
			id: 8,
			quiz_id: 1,
			type: 'mcq',
			body: 'Mengapa status pada badge (misalnya Aktif, Cuti, Terlambat) tidak boleh hanya dibedakan dengan warna saja?',
			options: [
				{ key: 'A', text: 'Agar file CSS menjadi lebih besar' },
				{
					key: 'B',
					text: 'Agar tetap dapat dipahami oleh pengguna buta warna dan pembaca layar (screen reader)'
				},
				{ key: 'C', text: 'Karena Bootstrap tidak mendukung warna pada badge' },
				{ key: 'D', text: 'Agar halaman tidak bisa dicetak' }
			],
			answer_key: 'B',
			points: 10
		},
		{
			id: 9,
			quiz_id: 1,
			type: 'mcq',
			body: 'Komponen navigasi Bootstrap yang tampil tetap sebagai panel samping di layar besar (≥ 992px) dan berubah menjadi laci geser di ponsel adalah…',
			options: [
				{ key: 'A', text: 'offcanvas-lg' },
				{ key: 'B', text: 'carousel-fade' },
				{ key: 'C', text: 'popover' },
				{ key: 'D', text: 'scrollspy' }
			],
			answer_key: 'A',
			points: 10
		},
		{
			id: 10,
			quiz_id: 1,
			type: 'mcq',
			body: 'Bagaimana cara terbaik menangani isian form ketika validasi gagal saat pengguna menekan tombol Simpan?',
			options: [
				{ key: 'A', text: 'Menghapus seluruh isian form agar pengguna mengetik ulang dari awal' },
				{
					key: 'B',
					text: 'Mempertahankan isian pengguna, menampilkan pesan invalid-feedback di bawah field terkait, dan memindahkan fokus ke field galat pertama'
				},
				{ key: 'C', text: 'Menutup halaman secara otomatis' },
				{ key: 'D', text: 'Menampilkan kode error angka saja tanpa penjelasan' }
			],
			answer_key: 'B',
			points: 10
		}
	];

	const quizAttempts: QuizAttempt[] = [];

	// Presensi INF301-5A (A.8: P1 - P6, kode contoh PV-7X4K)
	const attendanceSessions: AttendanceSession[] = [
		{
			id: 1,
			course_class_id: 1,
			meeting_no: 1,
			session_date: '2026-09-14',
			topic: 'Pengantar Pemrograman Visual dan Bootstrap',
			code: 'PV-1A2B',
			opens_at: '2026-09-14T08:00:00+07:00',
			closes_at: '2026-09-14T08:15:00+07:00',
			is_open: false
		},
		{
			id: 2,
			course_class_id: 1,
			meeting_no: 2,
			session_date: '2026-09-21',
			topic: 'Struktur HTML dan Utilitas Bootstrap',
			code: 'PV-2C3D',
			opens_at: '2026-09-21T08:00:00+07:00',
			closes_at: '2026-09-21T08:15:00+07:00',
			is_open: false
		},
		{
			id: 3,
			course_class_id: 1,
			meeting_no: 3,
			session_date: '2026-09-28',
			topic: 'Layout: Container, Row, dan Kolom',
			code: 'PV-3E4F',
			opens_at: '2026-09-28T08:00:00+07:00',
			closes_at: '2026-09-28T08:15:00+07:00',
			is_open: false
		},
		{
			id: 4,
			course_class_id: 1,
			meeting_no: 4,
			session_date: '2026-10-05',
			topic: 'Komponen Dasar: Button, Card, Navbar',
			code: 'PV-4G5H',
			opens_at: '2026-10-05T08:00:00+07:00',
			closes_at: '2026-10-05T08:15:00+07:00',
			is_open: false
		},
		{
			id: 5,
			course_class_id: 1,
			meeting_no: 5,
			session_date: '2026-10-12',
			topic: 'Rancang UI yang Jelas, Bukan Sekadar Cantik',
			code: 'PV-5J6K',
			opens_at: '2026-10-12T08:00:00+07:00',
			closes_at: '2026-10-12T08:15:00+07:00',
			is_open: false
		},
		{
			id: 6,
			course_class_id: 1,
			meeting_no: 6,
			session_date: '2026-10-19',
			topic: 'Form dan Validasi',
			code: 'PV-7X4K',
			opens_at: '2026-10-19T08:00:00+07:00',
			closes_at: '2026-10-19T08:15:00+07:00',
			is_open: true // Sesi aktif untuk demo AC-04 dengan kode PV-7X4K
		}
	];

	// Rekaman Presensi P1-P5 (A.8):
	// P1: Semua Hadir
	// P2: Semua Hadir
	// P3: Bima Izin, lainnya Hadir
	// P4: Rizky Alpa, lainnya Hadir
	// P5: Semua Hadir
	const attendanceRecords: AttendanceRecord[] = [
		// P1
		{ id: 1, attendance_session_id: 1, enrollment_id: 1, status: 'present', checked_in_at: '2026-09-14T08:03:00+07:00', note: '' },
		{ id: 2, attendance_session_id: 1, enrollment_id: 2, status: 'present', checked_in_at: '2026-09-14T08:04:00+07:00', note: '' },
		{ id: 3, attendance_session_id: 1, enrollment_id: 3, status: 'present', checked_in_at: '2026-09-14T08:06:00+07:00', note: '' },
		{ id: 4, attendance_session_id: 1, enrollment_id: 4, status: 'present', checked_in_at: '2026-09-14T08:02:00+07:00', note: '' },
		// P2
		{ id: 5, attendance_session_id: 2, enrollment_id: 1, status: 'present', checked_in_at: '2026-09-21T08:02:00+07:00', note: '' },
		{ id: 6, attendance_session_id: 2, enrollment_id: 2, status: 'present', checked_in_at: '2026-09-21T08:05:00+07:00', note: '' },
		{ id: 7, attendance_session_id: 2, enrollment_id: 3, status: 'present', checked_in_at: '2026-09-21T08:07:00+07:00', note: '' },
		{ id: 8, attendance_session_id: 2, enrollment_id: 4, status: 'present', checked_in_at: '2026-09-21T08:01:00+07:00', note: '' },
		// P3 (Bima Izin)
		{ id: 9, attendance_session_id: 3, enrollment_id: 1, status: 'present', checked_in_at: '2026-09-28T08:04:00+07:00', note: '' },
		{ id: 10, attendance_session_id: 3, enrollment_id: 2, status: 'excused', checked_in_at: null, note: 'Delegasi lomba pemrograman tingkat wilayah (Surat Tugas Fakultas)' },
		{ id: 11, attendance_session_id: 3, enrollment_id: 3, status: 'present', checked_in_at: '2026-09-28T08:08:00+07:00', note: '' },
		{ id: 12, attendance_session_id: 3, enrollment_id: 4, status: 'present', checked_in_at: '2026-09-28T08:03:00+07:00', note: '' },
		// P4 (Rizky Alpa)
		{ id: 13, attendance_session_id: 4, enrollment_id: 1, status: 'present', checked_in_at: '2026-10-05T08:02:00+07:00', note: '' },
		{ id: 14, attendance_session_id: 4, enrollment_id: 2, status: 'present', checked_in_at: '2026-10-05T08:06:00+07:00', note: '' },
		{ id: 15, attendance_session_id: 4, enrollment_id: 3, status: 'absent', checked_in_at: null, note: 'Tanpa keterangan' },
		{ id: 16, attendance_session_id: 4, enrollment_id: 4, status: 'present', checked_in_at: '2026-10-05T08:03:00+07:00', note: '' },
		// P5
		{ id: 17, attendance_session_id: 5, enrollment_id: 1, status: 'present', checked_in_at: '2026-10-12T08:01:00+07:00', note: '' },
		{ id: 18, attendance_session_id: 5, enrollment_id: 2, status: 'present', checked_in_at: '2026-10-12T08:04:00+07:00', note: '' },
		{ id: 19, attendance_session_id: 5, enrollment_id: 3, status: 'present', checked_in_at: '2026-10-12T08:05:00+07:00', note: '' },
		{ id: 20, attendance_session_id: 5, enrollment_id: 4, status: 'present', checked_in_at: '2026-10-12T08:02:00+07:00', note: '' }
	];

	// Komponen Nilai (A.9)
	const gradeComponents: GradeComponent[] = [
		// INF301-5A (id: 1..5)
		{ id: 1, course_class_id: 1, name: 'Kehadiran', source: 'attendance', weight: 10 },
		{ id: 2, course_class_id: 1, name: 'Tugas', source: 'assignment', weight: 30 },
		{ id: 3, course_class_id: 1, name: 'Kuis', source: 'quiz', weight: 10 },
		{ id: 4, course_class_id: 1, name: 'UTS', source: 'manual', weight: 25 },
		{ id: 5, course_class_id: 1, name: 'UAS', source: 'manual', weight: 25 },
		// INF305-5A (id: 6..10)
		{ id: 6, course_class_id: 2, name: 'Kehadiran', source: 'attendance', weight: 10 },
		{ id: 7, course_class_id: 2, name: 'Tugas', source: 'assignment', weight: 30 },
		{ id: 8, course_class_id: 2, name: 'Kuis', source: 'quiz', weight: 15 },
		{ id: 9, course_class_id: 2, name: 'UTS', source: 'manual', weight: 20 },
		{ id: 10, course_class_id: 2, name: 'UAS', source: 'manual', weight: 25 },
		// INF312-5A (id: 11..15)
		{ id: 11, course_class_id: 3, name: 'Kehadiran', source: 'attendance', weight: 10 },
		{ id: 12, course_class_id: 3, name: 'Tugas', source: 'assignment', weight: 35 },
		{ id: 13, course_class_id: 3, name: 'Kuis', source: 'quiz', weight: 10 },
		{ id: 14, course_class_id: 3, name: 'UTS', source: 'manual', weight: 20 },
		{ id: 15, course_class_id: 3, name: 'UAS', source: 'manual', weight: 25 }
	];

	// Entri Nilai Simulasi (A.9):
	// Naila (enrollment 1): 100, 90, 85, 88, 92 -> 90,50 (A)
	// Bima (enrollment 2): 100, 82, 78, 80, 84 -> 83,40 (A-)
	// Rizky (enrollment 3): 80, 70, 75, 72, 78 -> 74,00 (B)
	// Aulia (enrollment 4): 100, 95, 90, 92, 94 -> 94,00 (A)
	const gradeEntries: GradeEntry[] = [
		// Naila - INF301-5A
		{ id: 1, grade_component_id: 1, enrollment_id: 1, score: 100 },
		{ id: 2, grade_component_id: 2, enrollment_id: 1, score: 90 },
		{ id: 3, grade_component_id: 3, enrollment_id: 1, score: 85 },
		{ id: 4, grade_component_id: 4, enrollment_id: 1, score: 88 },
		{ id: 5, grade_component_id: 5, enrollment_id: 1, score: 92 },
		// Bima - INF301-5A
		{ id: 6, grade_component_id: 1, enrollment_id: 2, score: 100 },
		{ id: 7, grade_component_id: 2, enrollment_id: 2, score: 82 },
		{ id: 8, grade_component_id: 3, enrollment_id: 2, score: 78 },
		{ id: 9, grade_component_id: 4, enrollment_id: 2, score: 80 },
		{ id: 10, grade_component_id: 5, enrollment_id: 2, score: 84 },
		// Rizky - INF301-5A
		{ id: 11, grade_component_id: 1, enrollment_id: 3, score: 80 },
		{ id: 12, grade_component_id: 2, enrollment_id: 3, score: 70 },
		{ id: 13, grade_component_id: 3, enrollment_id: 3, score: 75 },
		{ id: 14, grade_component_id: 4, enrollment_id: 3, score: 72 },
		{ id: 15, grade_component_id: 5, enrollment_id: 3, score: 78 },
		// Aulia - INF301-5A
		{ id: 16, grade_component_id: 1, enrollment_id: 4, score: 100 },
		{ id: 17, grade_component_id: 2, enrollment_id: 4, score: 95 },
		{ id: 18, grade_component_id: 3, enrollment_id: 4, score: 90 },
		{ id: 19, grade_component_id: 4, enrollment_id: 4, score: 92 },
		{ id: 20, grade_component_id: 5, enrollment_id: 4, score: 94 },
		// Naila - INF305-5A (enrollment 5)
		{ id: 21, grade_component_id: 6, enrollment_id: 5, score: 100 },
		{ id: 22, grade_component_id: 7, enrollment_id: 5, score: 85 },
		{ id: 23, grade_component_id: 8, enrollment_id: 5, score: 85 },
		{ id: 24, grade_component_id: 9, enrollment_id: 5, score: 85 },
		{ id: 25, grade_component_id: 10, enrollment_id: 5, score: 84 },
		// Naila - INF312-5A (enrollment 7)
		{ id: 26, grade_component_id: 11, enrollment_id: 7, score: 100 },
		{ id: 27, grade_component_id: 12, enrollment_id: 7, score: 88 },
		{ id: 28, grade_component_id: 13, enrollment_id: 7, score: 82 },
		{ id: 29, grade_component_id: 14, enrollment_id: 7, score: 85 },
		{ id: 30, grade_component_id: 15, enrollment_id: 7, score: 88 }
	];

	// Forum Diskusi INF301-5A (A.11)
	const discussionThreads: DiscussionThread[] = [
		{
			id: 1,
			course_class_id: 1,
			author_user_id: 101,
			author_name: 'Naila Putri',
			author_role: 'student',
			title: 'Kapan tabel lebih baik diganti kartu di layar kecil?',
			body: 'Selamat pagi Pak Ahmad dan teman-teman. Saat mengerjakan audit UI/UX halaman Data Mahasiswa (T-002), saya melihat tabel dengan 5 kolom terasa sempit di layar 360px. Apakah sebaiknya semua tabel diubah menjadi daftar kartu di ponsel, atau cukup memakai .table-responsive?',
			created_at: '2026-10-17T10:15:00+07:00',
			is_pinned: true,
			is_closed: false
		},
		{
			id: 2,
			course_class_id: 1,
			author_user_id: 3,
			author_name: 'Dr. Ahmad Fauzi, M.Kom.',
			author_role: 'lecturer',
			title: 'Tips Persiapan Kuis 1 — Dasar Komponen Bootstrap',
			body: 'Rekan-rekan mahasiswa, Kuis 1 akan dibuka pada Selasa, 20 Oktober 2026 pukul 08.00 s.d. 23.59 WIB dengan durasi 20 menit. Pastikan membaca kembali materi P01 sampai P05, terutama tentang pemilihan komponen berdasarkan tugas pengguna dan standar aksesibilitas WCAG AA.',
			created_at: '2026-10-16T14:00:00+07:00',
			is_pinned: false,
			is_closed: false
		}
	];

	const discussionPosts: DiscussionPost[] = [
		{
			id: 1,
			thread_id: 1,
			author_user_id: 3,
			author_name: 'Dr. Ahmad Fauzi, M.Kom.',
			author_role: 'lecturer',
			body: 'Pertanyaan bagus, Naila. Tabel dengan banyak kolom (> 4 kolom), teks panjang, atau tombol aksi per baris biasanya lebih nyaman diubah menjadi daftar kartu (card list) di bawah 768 px agar pengguna tidak perlu menggeser horizontal untuk menekan tombol aksi.',
			created_at: '2026-10-17T11:05:00+07:00'
		},
		{
			id: 2,
			thread_id: 1,
			author_user_id: 102,
			author_name: 'Bima Arya',
			author_role: 'student',
			body: 'Setuju Pak. Untuk tabel sederhana yang hanya berisi 3–4 kolom angka ringkas tanpa tombol aksi per baris, cukup dibungkus dengan .table-responsive.',
			created_at: '2026-10-17T13:20:00+07:00'
		}
	];

	// Pengumuman (A.10)
	const announcements: Announcement[] = [
		{
			id: 1,
			course_class_id: null,
			author_user_id: 2,
			author_name: 'Agus Setiawan',
			author_role_label: 'Admin Akademik',
			title: 'Jadwal UTS Semester Ganjil 2026/2027: 2–7 November 2026',
			body: 'Ujian Tengah Semester (UTS) Ganjil 2026/2027 akan dilaksanakan pada tanggal 2 s.d. 7 November 2026. Mahasiswa wajib memenuhi kehadiran minimal 75% dan memastikan seluruh kewajiban administrasi akademik telah aktif.',
			published_at: '2026-10-15T09:00:00+07:00'
		},
		{
			id: 2,
			course_class_id: null,
			author_user_id: 1,
			author_name: 'Tim IT Kampus',
			author_role_label: 'Super Admin',
			title: 'Pemeliharaan Sistem LMS, Minggu 25 Oktober 2026 pukul 01:00–03:00 WIB',
			body: 'PelitaLearn akan menjalani pemeliharaan rutin peningkatan basis data dan penyimpanan objek pada hari Minggu, 25 Oktober 2026 pukul 01.00–03.00 WIB. Mohon mengumpulkan tugas sebelum jadwal pemeliharaan tersebut.',
			published_at: '2026-10-16T10:30:00+07:00'
		},
		{
			id: 3,
			course_class_id: 1,
			author_user_id: 3,
			author_name: 'Dr. Ahmad Fauzi, M.Kom.',
			author_role_label: 'Dosen Pengampu INF301-5A',
			title: 'Kuis 1 dibuka Selasa 20 Oktober 2026, durasi 20 menit, satu percobaan',
			body: 'Kuis 1 — Dasar Komponen Bootstrap terdiri dari 10 soal pilihan ganda dengan urutan diacak. Jawaban Anda akan tersimpan otomatis setiap 15 detik dan saat berpindah soal.',
			published_at: '2026-10-16T13:45:00+07:00'
		}
	];

	// Notifikasi dalam aplikasi (S18)
	const notifications: NotificationItem[] = [
		{
			id: 1,
			user_id: 101,
			type: 'announcement',
			title: 'Kuis 1 INF301-5A Dijadwalkan',
			message: 'Dr. Ahmad Fauzi menerbitkan pengumuman: Kuis 1 dibuka Selasa 20 Oktober 2026 (durasi 20 menit).',
			link: '/classes/1',
			created_at: '2026-10-16T13:45:00+07:00',
			read_at: null
		},
		{
			id: 2,
			user_id: 101,
			type: 'deadline',
			title: 'Pengingat Tenggat Tugas T-004',
			message: 'Tugas Normalisasi Basis Data Perpustakaan (1NF–3NF) pada kelas INF305-5A jatuh tempo pada 22 Oktober 2026 pukul 23.59 WIB.',
			link: '/classes/2/assignments/4',
			created_at: '2026-10-18T07:00:00+07:00',
			read_at: null
		},
		{
			id: 3,
			user_id: 101,
			type: 'grade',
			title: 'Nilai Tugas T-001 Telah Terbit',
			message: 'Tugas Setup Proyek dan Halaman Hello Bootstrap (INF301-5A) telah dinilai: 88,00 / 100.',
			link: '/classes/1/assignments/1',
			created_at: '2026-10-06T10:15:00+07:00',
			read_at: null
		},
		{
			id: 4,
			user_id: 3, // Dr. Ahmad Fauzi
			type: 'submission',
			title: '2 Pengumpulan Baru pada Tugas T-002',
			message: 'Naila Putri dan Aulia Rahma telah mengumpulkan Tugas T-002 Audit UI/UX Aplikasi Data Mahasiswa.',
			link: '/lecturer/grading?assignment=2',
			created_at: '2026-10-18T09:05:00+07:00',
			read_at: null
		},
		{
			id: 5,
			user_id: 2, // Agus Setiawan
			type: 'announcement',
			title: 'Impor Enrolment Semester Ganjil Selesai',
			message: '13 data enrolment kelas aktif Semester Ganjil 2026/2027 berhasil diverifikasi.',
			link: '/admin/classes',
			created_at: '2026-10-15T08:40:00+07:00',
			read_at: null
		}
	];

	// Audit Log (S20)
	const auditLogs: AuditLog[] = [
		{
			id: 1,
			user_id: 2,
			user_name: 'Agus Setiawan',
			user_role: 'academic_admin',
			action: 'student.status_updated',
			subject_type: 'Student',
			subject_id: '24010103 (Sari Dewi)',
			old_values: '{"status": "active"}',
			new_values: '{"status": "on_leave"}',
			reason: 'Permohonan cuti akademik Semester Ganjil 2026/2027 disetujui Dekan FT (SK No. 142/FT-UPB/IX/2026)',
			ip: '103.18.44.12',
			created_at: '2026-09-10T10:20:00+07:00'
		},
		{
			id: 2,
			user_id: 3,
			user_name: 'Dr. Ahmad Fauzi, M.Kom.',
			user_role: 'lecturer',
			action: 'submission.graded',
			subject_type: 'Submission',
			subject_id: 'T-001 / 24010101 (Naila Putri)',
			old_values: '{"score": null, "status": "submitted"}',
			new_values: '{"score": 88, "status": "graded"}',
			reason: 'Penilaian reguler Tugas 1 INF301-5A',
			ip: '103.18.44.55',
			created_at: '2026-10-06T10:15:00+07:00'
		},
		{
			id: 3,
			user_id: 2,
			user_name: 'Agus Setiawan',
			user_role: 'academic_admin',
			action: 'enrollment.csv_imported',
			subject_type: 'CourseClass',
			subject_id: 'Semester Ganjil 2026/2027',
			old_values: '{}',
			new_values: '{"imported_rows": 13, "failed_rows": 0}',
			reason: 'Impor awal peserta kelas dari SIAKAD CSV',
			ip: '103.18.44.12',
			created_at: '2026-09-08T09:00:00+07:00'
		},
		{
			id: 4,
			user_id: 1,
			user_name: 'Tim IT Kampus',
			user_role: 'super_admin',
			action: 'auth.login_success',
			subject_type: 'User',
			subject_id: 'superadmin',
			old_values: '{}',
			new_values: '{"2fa_verified": true}',
			reason: 'Pemeriksaan kesehatan sistem mingguan',
			ip: '103.18.44.2',
			created_at: '2026-10-18T08:00:00+07:00'
		}
	];

	// Konfigurasi Sistem Default (A.9 & BR-04..BR-11)
	const appSettings: AppSettings = {
		upload_max_assignment_mb: 20,
		upload_max_material_mb: 100,
		late_penalty_per_day_percent: 10,
		late_max_days: 3,
		min_attendance_percent: 75,
		login_max_attempts: 5,
		login_lock_minutes: 15,
		grade_scale: [
			{ min: 85, max: 100, letter: 'A', points: 4.0 },
			{ min: 80, max: 84.99, letter: 'A-', points: 3.7 },
			{ min: 75, max: 79.99, letter: 'B+', points: 3.3 },
			{ min: 70, max: 74.99, letter: 'B', points: 3.0 },
			{ min: 65, max: 69.99, letter: 'B-', points: 2.7 },
			{ min: 60, max: 64.99, letter: 'C+', points: 2.3 },
			{ min: 55, max: 59.99, letter: 'C', points: 2.0 },
			{ min: 40, max: 54.99, letter: 'D', points: 1.0 },
			{ min: 0, max: 39.99, letter: 'E', points: 0.0 }
		]
	};

	return {
		users,
		faculties,
		studyPrograms,
		academicTerms,
		students,
		lecturers,
		courses,
		courseClasses,
		enrollments,
		materials,
		materialProgress,
		assignments,
		submissions,
		quizzes,
		quizQuestions,
		quizAttempts,
		attendanceSessions,
		attendanceRecords,
		gradeComponents,
		gradeEntries,
		discussionThreads,
		discussionPosts,
		announcements,
		notifications,
		auditLogs,
		appSettings
	};
}

