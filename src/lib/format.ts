import type {
	AttendanceStatus,
	MaterialStatus,
	Role,
	StudentStatus,
	SubmissionStatus
} from './types';

const MONTHS_ID = [
	'Januari',
	'Februari',
	'Maret',
	'April',
	'Mei',
	'Juni',
	'Juli',
	'Agustus',
	'September',
	'Oktober',
	'November',
	'Desember'
];

const MONTHS_SHORT_ID = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'Mei',
	'Jun',
	'Jul',
	'Agu',
	'Sep',
	'Okt',
	'Nov',
	'Des'
];

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/**
 * Format angka desimal memakai koma sesuai desain.md §9 (contoh: 90,50)
 */
export function formatScore(value: number | null | undefined, decimals = 2): string {
	if (value === null || value === undefined || Number.isNaN(value)) return '—';
	return value.toFixed(decimals).replace('.', ',');
}

/**
 * Format tanggal bahasa Indonesia: "25 Oktober 2026"
 */
export function formatDateId(isoOrDate: string, includeDayName = false): string {
	if (!isoOrDate) return '—';
	const d = new Date(isoOrDate);
	if (Number.isNaN(d.getTime())) return isoOrDate;
	const day = d.getDate();
	const month = MONTHS_ID[d.getMonth()];
	const year = d.getFullYear();
	if (includeDayName) {
		const dayName = DAYS_ID[d.getDay()];
		return `${dayName}, ${day} ${month} ${year}`;
	}
	return `${day} ${month} ${year}`;
}

/**
 * Format tanggal singkat: "25 Okt 2026"
 */
export function formatDateShortId(isoOrDate: string): string {
	if (!isoOrDate) return '—';
	const d = new Date(isoOrDate);
	if (Number.isNaN(d.getTime())) return isoOrDate;
	return `${d.getDate()} ${MONTHS_SHORT_ID[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format tanggal + jam WIB sesuai desain.md §9: "25 Oktober 2026 pukul 23.59 WIB" atau "17 Okt 2026 20.14 WIB"
 */
export function formatDateTimeWib(isoOrDate: string, short = false): string {
	if (!isoOrDate) return '—';
	const d = new Date(isoOrDate);
	if (Number.isNaN(d.getTime())) return isoOrDate;
	const hh = String(d.getHours()).padStart(2, '0');
	const mm = String(d.getMinutes()).padStart(2, '0');
	if (short) {
		return `${d.getDate()} ${MONTHS_SHORT_ID[d.getMonth()]} ${d.getFullYear()} ${hh}.${mm} WIB`;
	}
	return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()} pukul ${hh}.${mm} WIB`;
}

/**
 * Badge Status Mahasiswa (desain.md §6.3)
 */
export function studentStatusBadge(status: StudentStatus): { label: string; badgeClass: string } {
	switch (status) {
		case 'active':
			return { label: 'Aktif', badgeClass: 'text-bg-success' };
		case 'on_leave':
			return { label: 'Cuti', badgeClass: 'text-bg-warning' };
		case 'graduated':
			return { label: 'Lulus', badgeClass: 'text-bg-info' };
		case 'inactive':
			return { label: 'Nonaktif', badgeClass: 'text-bg-secondary' };
	}
}

/**
 * Badge Status Tugas sisi mahasiswa (desain.md §6.3)
 */
export function submissionStatusBadge(status: SubmissionStatus): {
	label: string;
	badgeClass: string;
} {
	switch (status) {
		case 'not_submitted':
			return { label: 'Belum dikumpulkan', badgeClass: 'text-bg-secondary' };
		case 'submitted':
			return { label: 'Dikumpulkan', badgeClass: 'text-bg-primary' };
		case 'late':
			return { label: 'Terlambat', badgeClass: 'text-bg-warning' };
		case 'revision':
			return { label: 'Perlu revisi', badgeClass: 'text-bg-danger' };
		case 'graded':
			return { label: 'Dinilai', badgeClass: 'text-bg-success' };
	}
}

/**
 * Badge Status Presensi (desain.md §6.3)
 */
export function attendanceStatusBadge(status: AttendanceStatus): {
	label: string;
	badgeClass: string;
} {
	switch (status) {
		case 'present':
			return { label: 'Hadir', badgeClass: 'text-bg-success' };
		case 'excused':
			return { label: 'Izin', badgeClass: 'text-bg-info' };
		case 'sick':
			return { label: 'Sakit', badgeClass: 'text-bg-warning' };
		case 'absent':
			return { label: 'Alpa', badgeClass: 'text-bg-danger' };
	}
}

/**
 * Badge Status Materi (desain.md §6.3)
 */
export function materialStatusBadge(status: MaterialStatus): {
	label: string;
	badgeClass: string;
} {
	switch (status) {
		case 'draft':
			return { label: 'Draft', badgeClass: 'text-bg-secondary' };
		case 'scheduled':
			return { label: 'Terjadwal', badgeClass: 'text-bg-info' };
		case 'published':
			return { label: 'Terbit', badgeClass: 'text-bg-success' };
	}
}

export function roleLabel(role: Role): string {
	switch (role) {
		case 'student':
			return 'Mahasiswa';
		case 'lecturer':
			return 'Dosen';
		case 'academic_admin':
			return 'Admin Akademik';
		case 'super_admin':
			return 'Super Admin';
	}
}

