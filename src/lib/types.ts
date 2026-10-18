export type Role = 'student' | 'lecturer' | 'academic_admin' | 'super_admin';
export type StudentStatus = 'active' | 'on_leave' | 'graduated' | 'inactive';
export type MaterialType = 'file' | 'link';
export type MaterialStatus = 'draft' | 'published' | 'scheduled';
export type SubmissionType = 'file' | 'text' | 'link' | 'file_and_link';
export type LatePolicy = 'reject' | 'penalty';
export type AssignmentStatus = 'draft' | 'published' | 'closed' | 'scheduled';
export type SubmissionStatus = 'not_submitted' | 'submitted' | 'late' | 'graded' | 'revision';
export type AttendanceStatus = 'present' | 'excused' | 'sick' | 'absent';
export type GradeSource = 'attendance' | 'assignment' | 'quiz' | 'manual';
export type QuestionType = 'mcq' | 'true_false' | 'short_answer';
export type QuizAttemptStatus = 'in_progress' | 'submitted' | 'expired';

export interface User {
	id: number;
	username: string;
	email: string;
	password: string;
	role: Role;
	full_name: string;
	is_active: boolean;
	failed_login_count: number;
	locked_until: string | null;
	last_login_at: string | null;
	totp_enabled?: boolean;
	is_demo?: boolean;
}

export interface Faculty {
	id: number;
	name: string;
}

export interface StudyProgram {
	id: number;
	faculty_id: number;
	code: string;
	name: string;
}

export interface AcademicTerm {
	id: number;
	name: string;
	starts_on: string;
	ends_on: string;
	is_active: boolean;
	enrollment_weeks: number;
}

export interface Student {
	id: number;
	user_id: number;
	study_program_id: number;
	nim: string;
	full_name: string;
	cohort_year: number;
	semester: number;
	status: StudentStatus;
	email: string;
	avatar_url?: string;
	whatsapp?: string;
	peminatan?: string;
	jenis_kelas?: 'Reguler' | 'Karyawan';
	ttl?: string;
	alamat?: string;
	portfolio?: string;
	github?: string;
	instagram?: string;
	threads?: string;
	updated_at?: string;
}

export interface Lecturer {
	id: number;
	user_id: number;
	nidn: string;
	code: string;
	full_name: string;
	study_program_id: number;
	email: string;
}

export interface Course {
	id: number;
	study_program_id: number;
	code: string;
	name: string;
	credits: number;
}

export interface CourseClass {
	id: number;
	course_id: number;
	academic_term_id: number;
	lecturer_id: number;
	class_code: string;
	day_of_week: string;
	starts_at: string;
	ends_at: string;
	room: string;
	capacity: number;
	meeting_link?: string;
}

export interface Enrollment {
	id: number;
	course_class_id: number;
	student_id: number;
	final_score: number | null;
	letter_grade: string | null;
	grade_points: number | null;
	grades_locked_at: string | null;
}

export interface Material {
	id: number;
	course_class_id: number;
	meeting_no: number;
	code: string;
	title: string;
	description?: string;
	type: MaterialType;
	file_format: 'PDF' | 'PPTX' | 'DOCX' | 'URL';
	file_name?: string;
	file_size_mb?: number;
	url?: string;
	status: MaterialStatus;
	publish_at: string;
}

export interface MaterialProgress {
	material_id: number;
	enrollment_id: number;
	completed_at: string;
}

export interface SubmissionVersion {
	version: number;
	submitted_at: string;
	file_name?: string;
	file_size_mb?: number;
	link?: string;
	text_content?: string;
}

export interface Assignment {
	id: number;
	code: string;
	course_class_id: number;
	title: string;
	instructions: string;
	attachment_name?: string;
	due_at: string;
	max_score: number;
	submission_type: SubmissionType;
	submission_label: string;
	late_policy: LatePolicy;
	status: AssignmentStatus;
	publish_at: string;
}

export interface Submission {
	id: number;
	assignment_id: number;
	enrollment_id: number;
	status: SubmissionStatus;
	submitted_at: string;
	file_name?: string;
	file_size_mb?: number;
	link?: string;
	text_content?: string;
	score: number | null;
	penalty_applied: number;
	feedback: string;
	version: number;
	history: SubmissionVersion[];
	scan_status: 'pending' | 'clean' | 'infected';
}

export interface QuizQuestion {
	id: number;
	quiz_id: number;
	type: QuestionType;
	body: string;
	options: { key: string; text: string }[];
	answer_key: string;
	points: number;
}

export interface Quiz {
	id: number;
	code: string;
	course_class_id: number;
	title: string;
	description: string;
	opens_at: string;
	closes_at: string;
	duration_minutes: number;
	max_attempts: number;
	shuffle_questions: boolean;
}

export interface QuizAttempt {
	id: number;
	quiz_id: number;
	enrollment_id: number;
	status: QuizAttemptStatus;
	started_at: string;
	deadline_at: string;
	submitted_at?: string;
	last_saved_at?: string;
	answers: Record<number, string>;
	score: number | null;
}

export interface AttendanceSession {
	id: number;
	course_class_id: number;
	meeting_no: number;
	session_date: string;
	topic: string;
	code: string;
	opens_at: string;
	closes_at: string;
	is_open: boolean;
}

export interface AttendanceRecord {
	id: number;
	attendance_session_id: number;
	enrollment_id: number;
	status: AttendanceStatus;
	checked_in_at: string | null;
	note: string;
}

export interface GradeComponent {
	id: number;
	course_class_id: number;
	name: string;
	source: GradeSource;
	weight: number;
}

export interface GradeEntry {
	id: number;
	grade_component_id: number;
	enrollment_id: number;
	score: number;
}

export interface DiscussionThread {
	id: number;
	course_class_id: number;
	author_user_id: number;
	author_name: string;
	author_role: Role;
	title: string;
	body: string;
	created_at: string;
	is_pinned: boolean;
	is_closed: boolean;
}

export interface DiscussionPost {
	id: number;
	thread_id: number;
	author_user_id: number;
	author_name: string;
	author_role: Role;
	body: string;
	created_at: string;
}

export interface Announcement {
	id: number;
	course_class_id: number | null;
	author_user_id: number;
	author_name: string;
	author_role_label: string;
	title: string;
	body: string;
	published_at: string;
}

export interface NotificationItem {
	id: number;
	user_id: number;
	type: 'deadline' | 'announcement' | 'grade' | 'submission' | 'attendance';
	title: string;
	message: string;
	link: string;
	created_at: string;
	read_at: string | null;
}

export interface AuditLog {
	id: number;
	user_id: number;
	user_name: string;
	user_role: Role;
	action: string;
	subject_type: string;
	subject_id: string;
	old_values: string;
	new_values: string;
	reason: string;
	ip: string;
	created_at: string;
}

export interface GradeScaleBand {
	min: number;
	max: number;
	letter: string;
	points: number;
}

export interface AppSettings {
	upload_max_assignment_mb: number;
	upload_max_material_mb: number;
	late_penalty_per_day_percent: number;
	late_max_days: number;
	min_attendance_percent: number;
	login_max_attempts: number;
	login_lock_minutes: number;
	grade_scale: GradeScaleBand[];
}

export interface ToastMessage {
	id: number;
	type: 'success' | 'danger' | 'warning' | 'info';
	message: string;
}

