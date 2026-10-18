<script lang="ts">
	import 'bootstrap/dist/css/bootstrap.min.css';
	import 'bootstrap-icons/font/bootstrap-icons.css';
	import '../app.css';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { lms } from '$lib/store.svelte';
	import { roleLabel, studentStatusBadge } from '$lib/format';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	let mobileMenuOpen = $state(false);
	let userMenuOpen = $state(false);
	let demoMenuOpen = $state(false);
	let searchQuery = $state('');
	let searchOpen = $state(false);

	const pathname = $derived(page.url.pathname);
	const isPublicRoute = $derived(
		pathname.startsWith('/login') || pathname.startsWith('/forgot-password')
	);

	const user = $derived(lms.currentUser);
	const student = $derived(lms.currentStudent);
	const isStudentOnLeave = $derived(student?.status === 'on_leave');

	const navItems = $derived.by(() => {
		if (!user) return [];
		if (user.role === 'student') {
			return [
				{ href: '/admin/students', label: 'Data Mahasiswa', icon: 'bi-people-fill' },
				{ href: '/admin/students/create', label: 'Tambah Mahasiswa', icon: 'bi-person-plus-fill' },
				{ href: '/profile', label: 'Profil & Kelengkapan Data', icon: 'bi-person-vcard-fill' },
				{ href: '/dashboard', label: 'Dashboard Akademik', icon: 'bi-grid-1x2-fill' },
				{ href: '/classes', label: 'Kelas Saya', icon: 'bi-journal-bookmark-fill' },
				{ href: '/classes/1/assignments/2', label: 'Tugas', icon: 'bi-file-earmark-check-fill' },
				{ href: '/quizzes/1/attempt', label: 'Kuis', icon: 'bi-stopwatch-fill' },
				{ href: '/grades', label: 'Nilai Saya', icon: 'bi-bar-chart-line-fill' },
				{ href: '/announcements', label: 'Pengumuman', icon: 'bi-megaphone-fill' },
				{ href: '/notifications', label: 'Notifikasi', icon: 'bi-bell-fill', badge: lms.unreadNotificationsCount }
			];
		}
		if (user.role === 'lecturer') {
			return [
				{ href: '/admin/students', label: 'Data Mahasiswa', icon: 'bi-people-fill' },
				{ href: '/dashboard', label: 'Dashboard Dosen', icon: 'bi-grid-1x2-fill' },
				{ href: '/classes', label: 'Kelas Diampu', icon: 'bi-journal-bookmark-fill' },
				{ href: '/lecturer/content', label: 'Kelola Konten (S10)', icon: 'bi-folder2-open' },
				{ href: '/lecturer/grading', label: 'Penilaian Tugas (S11)', icon: 'bi-check2-square' },
				{ href: '/lecturer/attendance', label: 'Presensi Kelas (S12)', icon: 'bi-qr-code' },
				{ href: '/lecturer/grades', label: 'Bobot & Rekap Nilai (S13)', icon: 'bi-calculator-fill' },
				{ href: '/announcements', label: 'Pengumuman', icon: 'bi-megaphone-fill' },
				{ href: '/notifications', label: 'Notifikasi', icon: 'bi-bell-fill', badge: lms.unreadNotificationsCount },
				{ href: '/profile', label: 'Profil & Sandi', icon: 'bi-person-circle' }
			];
		}
		// academic_admin or super_admin
		return [
			{ href: '/admin/students', label: 'Data Mahasiswa (S14)', icon: 'bi-people-fill' },
			{ href: '/admin/students/create', label: 'Tambah Mahasiswa (S15)', icon: 'bi-person-plus-fill' },
			{ href: '/dashboard', label: 'Dashboard Admin', icon: 'bi-speedometer2' },
			{ href: '/admin/classes', label: 'Mata Kuliah & Kelas (S16)', icon: 'bi-building-fill-gear' },
			{ href: '/admin/reports', label: 'Laporan & Audit Log (S20)', icon: 'bi-shield-check' },
			{ href: '/announcements', label: 'Pengumuman Global (S17)', icon: 'bi-megaphone-fill' },
			{ href: '/notifications', label: 'Notifikasi (S18)', icon: 'bi-bell-fill', badge: lms.unreadNotificationsCount },
			{ href: '/profile', label: 'Profil & Keamanan (S19)', icon: 'bi-person-lock' }
		];
	});

	const searchResults = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		if (q.length < 2) return [];
		const results: { title: string; subtitle: string; href: string; type: string }[] = [];

		for (const st of lms.students) {
			if (st.nim.toLowerCase().includes(q) || st.full_name.toLowerCase().includes(q)) {
				const sp = lms.studyPrograms.find((p) => p.id === st.study_program_id);
				results.push({
					title: `${st.full_name} (${st.nim})`,
					subtitle: `${sp?.name ?? 'Mahasiswa'} · Semester ${st.semester}`,
					href: `/admin/students/${st.id}/edit`,
					type: 'Mahasiswa'
				});
			}
		}

		for (const cls of lms.courseClasses) {
			const crs = lms.courses.find((c) => c.id === cls.course_id);
			if (
				cls.class_code.toLowerCase().includes(q) ||
				crs?.name.toLowerCase().includes(q)
			) {
				results.push({
					title: `${cls.class_code} — ${crs?.name}`,
					subtitle: `${cls.day_of_week} ${cls.starts_at}–${cls.ends_at} · ${cls.room}`,
					href: `/classes/${cls.id}`,
					type: 'Kelas'
				});
			}
		}

		for (const mat of lms.materials) {
			if (mat.title.toLowerCase().includes(q) || mat.code.toLowerCase().includes(q)) {
				results.push({
					title: `${mat.code}: ${mat.title}`,
					subtitle: `Materi ${mat.file_format}`,
					href: `/classes/${mat.course_class_id}?tab=materi`,
					type: 'Materi'
				});
			}
		}

		for (const asg of lms.assignments) {
			if (asg.title.toLowerCase().includes(q) || asg.code.toLowerCase().includes(q)) {
				results.push({
					title: `${asg.code}: ${asg.title}`,
					subtitle: `Tugas · Maks ${asg.max_score}`,
					href: `/classes/${asg.course_class_id}/assignments/${asg.id}`,
					type: 'Tugas'
				});
			}
		}

		return results.slice(0, 6);
	});

	function isNavActive(itemHref: string): boolean {
		const cleanHref = itemHref.split('?')[0];
		if (cleanHref === '/dashboard') return pathname === '/dashboard';
		if (cleanHref === '/admin/students' && pathname === '/admin/students/create') return false;
		return pathname === cleanHref || pathname.startsWith(cleanHref + '/');
	}

	function handleDemoSwitch(username: string) {
		const switched = lms.switchDemoUser(username);
		demoMenuOpen = false;
		mobileMenuOpen = false;
		if (switched) {
			goto('/admin/students');
		}
	}

	function handleLogout() {
		userMenuOpen = false;
		lms.logout();
		goto('/login');
	}
</script>

<a href="#konten" class="skip-link">Lompat ke konten</a>

{#if isPublicRoute || !user}
	<main id="konten">
		{@render children()}
	</main>
{:else}
	<div class="upl-shell">
		<!-- Sidebar Desktop (>= 992px) -->
		<aside class="upl-sidebar d-none d-lg-flex flex-column justify-content-between p-3" aria-label="Bilah samping">
			<div>
				<div class="d-flex align-items-center gap-2 px-2 py-2 mb-3 border-bottom border-secondary border-opacity-25">
					<div
						class="rounded-3 d-flex align-items-center justify-content-center p-1 bg-white shadow-sm"
						style="width: 42px; height: 42px; flex-shrink: 0;"
					>
						<img
							src="/logo-universitas-pelita-bangsa-upb-png-svg.webp"
							alt="Logo Universitas Pelita Bangsa"
							style="width: 34px; height: 34px; object-fit: contain;"
						/>
					</div>
					<div>
						<div class="fw-bold text-white" style="font-family: 'Montserrat', sans-serif; letter-spacing: -0.02em;">
							Data Mahasiswa
						</div>
						<div class="small" style="color: rgba(255,255,255,0.7); font-size: 0.74rem;">
							Universitas Pelita Bangsa
						</div>
					</div>
				</div>

				<div class="px-2 mb-2">
					<span class="text-uppercase fw-semibold" style="font-size: 0.7rem; letter-spacing: 0.06em; color: rgba(255,255,255,0.5);">
						Menu Utama · {roleLabel(user.role)}
					</span>
				</div>

				<nav aria-label="Navigasi utama" class="vstack gap-1">
					{#each navItems as item}
						<a
							href={item.href}
							class="upl-nav-link {isNavActive(item.href) ? 'active' : ''}"
						>
							<i class="bi {item.icon}" aria-hidden="true"></i>
							<span class="flex-grow-1">{item.label}</span>
							{#if item.badge && item.badge > 0}
								<span class="badge rounded-pill text-bg-danger">{item.badge}</span>
							{/if}
						</a>
					{/each}
				</nav>
			</div>

			<!-- Quick Screen Jump & Info Semester -->
			<div class="mt-4 pt-3 border-top border-secondary border-opacity-25">
				<div class="p-2 rounded-3" style="background: rgba(255,255,255,0.06);">
					<div class="small fw-semibold text-white">Aris Maulana · 312410466</div>
					<div class="small" style="color: rgba(255,255,255,0.65); font-size: 0.76rem;">
						Pemrograman Visual · Pertemuan 5
					</div>
				</div>
			</div>
		</aside>

		<!-- Sidebar Mobile Offcanvas (< 992px) -->
		{#if mobileMenuOpen}
			<div
				class="offcanvas-backdrop fade show d-lg-none"
				onclick={() => (mobileMenuOpen = false)}
				role="presentation"
			></div>
			<aside
				id="sidebar"
				class="offcanvas offcanvas-start show text-bg-dark d-lg-none"
				style="width: 280px; background-color: var(--upl-navy-900) !important; visibility: visible;"
				tabindex="-1"
				aria-label="Navigasi utama ponsel"
			>
				<div class="offcanvas-header border-bottom border-secondary border-opacity-25">
					<div class="d-flex align-items-center gap-2">
						<div
							class="rounded-3 d-flex align-items-center justify-content-center p-1 bg-white"
							style="width: 36px; height: 36px;"
						>
							<img
								src="/logo-universitas-pelita-bangsa-upb-png-svg.webp"
								alt="Logo UPB"
								style="width: 28px; height: 28px; object-fit: contain;"
							/>
						</div>
						<div>
							<h2 class="h6 mb-0 text-white">Data Mahasiswa</h2>
							<small class="text-white-50">Universitas Pelita Bangsa</small>
						</div>
					</div>
					<button
						type="button"
						class="btn-close btn-close-white"
						aria-label="Tutup menu"
						onclick={() => (mobileMenuOpen = false)}
					></button>
				</div>
				<div class="offcanvas-body d-flex flex-column justify-content-between">
					<nav aria-label="Navigasi utama" class="vstack gap-1">
						{#each navItems as item}
							<a
								href={item.href}
								class="upl-nav-link {isNavActive(item.href) ? 'active' : ''}"
								onclick={() => (mobileMenuOpen = false)}
							>
								<i class="bi {item.icon}" aria-hidden="true"></i>
								<span class="flex-grow-1">{item.label}</span>
								{#if item.badge && item.badge > 0}
									<span class="badge rounded-pill text-bg-danger">{item.badge}</span>
								{/if}
							</a>
						{/each}
					</nav>

					<div class="mt-4 pt-3 border-top border-secondary border-opacity-25">
						<button
							type="button"
							class="btn btn-outline-light w-100"
							onclick={handleLogout}
						>
							<i class="bi bi-box-arrow-right me-2" aria-hidden="true"></i>Keluar
						</button>
					</div>
				</div>
			</aside>
		{/if}

		<!-- Area Utama -->
		<div class="upl-main-wrapper">
			<header class="navbar bg-white border-bottom sticky-top px-2 px-sm-3 py-2">
				<div class="container-xl px-0 d-flex align-items-center justify-content-between gap-1 gap-sm-2">
					<div class="d-flex align-items-center gap-2 min-w-0">
						<button
							type="button"
							class="btn btn-outline-secondary d-lg-none px-2"
							aria-controls="sidebar"
							aria-expanded={mobileMenuOpen}
							aria-label="Buka menu"
							onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
						>
							<i class="bi bi-list fs-5" aria-hidden="true"></i>
						</button>

						<a href="/admin/students" class="navbar-brand d-lg-none fw-bold mb-0 me-0 fs-6 d-flex align-items-center gap-1 text-truncate" style="color: var(--upl-navy-900); font-family: 'Montserrat', sans-serif;">
							<img
								src="/logo-universitas-pelita-bangsa-upb-png-svg.webp"
								alt="Logo UPB"
								style="width: 22px; height: 22px; object-fit: contain;"
							/>
							<span>Data Mahasiswa</span>
						</a>

						<!-- Pencarian -->
						<div class="position-relative d-none d-md-block" style="max-width: 340px; width: 100%;">
							<div class="input-group">
								<span class="input-group-text bg-light border-end-0 text-muted-upl">
									<i class="bi bi-search" aria-hidden="true"></i>
								</span>
								<input
									type="search"
									class="form-control bg-light border-start-0"
									placeholder="Cari NIM, nama mahasiswa, kelas..."
									aria-label="Cari NIM, nama mahasiswa, atau kelas"
									bind:value={searchQuery}
									onfocus={() => (searchOpen = true)}
									onblur={() => setTimeout(() => (searchOpen = false), 200)}
								/>
							</div>
							{#if searchOpen && searchResults.length > 0}
								<div class="dropdown-menu show w-100 shadow-sm mt-1 p-1">
									{#each searchResults as res}
										<a href={res.href} class="dropdown-item rounded-2 py-2 text-wrap">
											<div class="d-flex justify-content-between align-items-center">
												<strong class="small">{res.title}</strong>
												<span class="badge rounded-pill text-bg-light border">{res.type}</span>
											</div>
											<div class="small text-muted-upl">{res.subtitle}</div>
										</a>
									{/each}
								</div>
							{/if}
						</div>
					</div>

					<!-- Kanan: Switcher Peran Demo, Notifikasi, Profil -->
					<div class="d-flex align-items-center gap-1 gap-sm-2 flex-shrink-0">
						<!-- Quick Role Switcher untuk Demo -->
						<div class="dropdown position-relative">
							<button
								type="button"
								class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 px-2"
								aria-expanded={demoMenuOpen}
								onclick={() => {
									demoMenuOpen = !demoMenuOpen;
									userMenuOpen = false;
								}}
								title="Pintasan ganti akun demo untuk pengujian peran"
							>
								<i class="bi bi-people-fill" aria-hidden="true"></i>
								<span class="d-none d-md-inline">Peran Demo:</span>
								<strong class="small">{roleLabel(user.role)}</strong>
								<i class="bi bi-chevron-down small" aria-hidden="true"></i>
							</button>

							{#if demoMenuOpen}
								<div
									class="dropdown-menu dropdown-menu-end show shadow p-2"
									style="min-width: 300px; right: 0;"
								>
									<div class="px-2 py-1 small fw-bold text-muted-upl border-bottom mb-1">
										Pilih Persona Demo (Proyek Lama + PRD)
									</div>
									<button
										type="button"
										class="dropdown-item rounded-2 py-2 d-flex justify-content-between align-items-center {user.username === '312410466' ? 'active' : ''}"
										onclick={() => handleDemoSwitch('312410466')}
									>
										<div class="d-flex align-items-center gap-2">
											<img
												src="/foto-aris.jpg"
												alt="Aris Maulana"
												class="rounded-circle object-fit-cover"
												style="width: 28px; height: 28px;"
											/>
											<div>
												<div class="fw-semibold">Aris Maulana</div>
												<div class="small opacity-75 mono">312410466 · Teknik Informatika</div>
											</div>
										</div>
										<span class="badge rounded-pill text-bg-success">Utama</span>
									</button>
									<button
										type="button"
										class="dropdown-item rounded-2 py-2 d-flex justify-content-between align-items-center {user.username === '24010101' ? 'active' : ''}"
										onclick={() => handleDemoSwitch('24010101')}
									>
										<div>
											<div class="fw-semibold">Naila Putri</div>
											<div class="small opacity-75 mono">24010101 · Mahasiswa Aktif</div>
										</div>
										<span class="badge rounded-pill text-bg-success">Aktif</span>
									</button>
									<button
										type="button"
										class="dropdown-item rounded-2 py-2 d-flex justify-content-between align-items-center {user.username === '24010103' ? 'active' : ''}"
										onclick={() => handleDemoSwitch('24010103')}
									>
										<div>
											<div class="fw-semibold">Sari Dewi (Uji BR-02)</div>
											<div class="small opacity-75 mono">24010103 · Mahasiswa Cuti</div>
										</div>
										<span class="badge rounded-pill text-bg-warning">Cuti</span>
									</button>
									<button
										type="button"
										class="dropdown-item rounded-2 py-2 d-flex justify-content-between align-items-center {user.username === '9900000001' ? 'active' : ''}"
										onclick={() => handleDemoSwitch('9900000001')}
									>
										<div>
											<div class="fw-semibold">Dr. Ahmad Fauzi, M.Kom.</div>
											<div class="small opacity-75 mono">9900000001 · Dosen</div>
										</div>
										<span class="badge rounded-pill text-bg-primary">Dosen</span>
									</button>
									<button
										type="button"
										class="dropdown-item rounded-2 py-2 d-flex justify-content-between align-items-center {user.username === 'A001' ? 'active' : ''}"
										onclick={() => handleDemoSwitch('A001')}
									>
										<div>
											<div class="fw-semibold">Agus Setiawan</div>
											<div class="small opacity-75 mono">A001 · Admin Akademik</div>
										</div>
										<span class="badge rounded-pill text-bg-info">Admin</span>
									</button>
									<button
										type="button"
										class="dropdown-item rounded-2 py-2 d-flex justify-content-between align-items-center {user.username === 'superadmin' ? 'active' : ''}"
										onclick={() => handleDemoSwitch('superadmin')}
									>
										<div>
											<div class="fw-semibold">Tim IT Kampus</div>
											<div class="small opacity-75 mono">superadmin · Super Admin</div>
										</div>
										<span class="badge rounded-pill text-bg-dark">Super</span>
									</button>
									<div class="border-top mt-2 pt-2 d-flex justify-content-between gap-2 px-1">
										<button
											type="button"
											class="btn btn-outline-secondary btn-sm w-100"
											onclick={() => {
												demoMenuOpen = false;
												lms.resetToDemoSeed();
											}}
										>
											<i class="bi bi-arrow-counterclockwise me-1" aria-hidden="true"></i>Reset Data Dummy
										</button>
									</div>
								</div>
							{/if}
						</div>

						<!-- Ikon Notifikasi (S18) -->
						<a
							href="/notifications"
							class="btn btn-outline-secondary btn-sm position-relative px-2"
							aria-label="Notifikasi ({lms.unreadNotificationsCount} belum dibaca)"
						>
							<i class="bi bi-bell fs-5" aria-hidden="true"></i>
							{#if lms.unreadNotificationsCount > 0}
								<span
									class="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger"
									style="font-size: 0.7rem;"
								>
									{lms.unreadNotificationsCount}
									<span class="visually-hidden">notifikasi belum dibaca</span>
								</span>
							{/if}
						</a>

						<!-- Menu Pengguna -->
						<div class="dropdown position-relative">
							<button
								type="button"
								class="btn btn-light border btn-sm d-flex align-items-center gap-2"
								aria-expanded={userMenuOpen}
								onclick={() => {
									userMenuOpen = !userMenuOpen;
									demoMenuOpen = false;
								}}
							>
								{#if student?.avatar_url}
									<img
										src={student.avatar_url}
										alt={user.full_name}
										class="rounded-circle object-fit-cover border"
										style="width: 28px; height: 28px;"
									/>
								{:else}
									<span
										class="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold text-white"
										style="width: 28px; height: 28px; background: var(--upl-navy-900); font-size: 0.8rem;"
									>
										{user.full_name.charAt(0)}
									</span>
								{/if}
								<span class="d-none d-md-inline fw-medium">{user.full_name}</span>
								<i class="bi bi-chevron-down small" aria-hidden="true"></i>
							</button>

							{#if userMenuOpen}
								<div class="dropdown-menu dropdown-menu-end show shadow-sm p-2" style="min-width: 220px; right: 0;">
									<div class="px-3 py-2 border-bottom mb-1">
										<div class="fw-bold">{user.full_name}</div>
										<div class="small text-muted-upl mono">{user.username}</div>
										{#if student}
											{@const badge = studentStatusBadge(student.status)}
											<span class="badge rounded-pill {badge.badgeClass} mt-1">{badge.label}</span>
										{/if}
									</div>
									<a
										href="/profile"
										class="dropdown-item rounded-2 py-2"
										onclick={() => (userMenuOpen = false)}
									>
										<i class="bi bi-person-gear me-2" aria-hidden="true"></i>Profil & Kata Sandi
									</a>
									<a
										href="/login"
										class="dropdown-item rounded-2 py-2"
										onclick={() => (userMenuOpen = false)}
									>
										<i class="bi bi-box-arrow-in-right me-2" aria-hidden="true"></i>Halaman Login (S01)
									</a>
									<button
										type="button"
										class="dropdown-item rounded-2 py-2 text-danger"
										onclick={handleLogout}
									>
										<i class="bi bi-box-arrow-right me-2" aria-hidden="true"></i>Keluar
									</button>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</header>

			<main id="konten" class="container-xl py-4 flex-grow-1">
				<!-- Alert Kondisi Akun Mahasiswa Cuti (desain.md Lampiran C & PRD AC-03 / BR-02) -->
				{#if isStudentOnLeave}
					<div class="alert alert-warning d-flex align-items-start gap-2 mb-4" role="alert">
						<i class="bi bi-exclamation-triangle-fill fs-5 mt-1" aria-hidden="true"></i>
						<div>
							<strong>Status Anda: Cuti.</strong> Status Anda saat ini Cuti, sehingga kelas aktif tidak dapat dibuka dan Anda tidak dapat mengumpulkan tugas. Hubungi admin akademik (<span class="mono">agus.setiawan@lms.example</span>) bila status ini keliru. Anda tetap dapat mengakses <a href="/profile" class="alert-link">Profil</a> dan <a href="/grades" class="alert-link">Riwayat Nilai</a>.
						</div>
					</div>
				{/if}

				{@render children()}
			</main>

			<footer class="border-top bg-white py-3 px-3 mt-auto">
				<div class="container-xl px-0 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small text-muted-upl">
					<div>
						<strong>PelitaLearn v1.0</strong> — Universitas Pelita Bangsa · Aris Maulana (NIM: 312410466) · Pertemuan 5
					</div>
					<div class="d-flex flex-wrap gap-3">
						<a href="/admin/students" class="text-decoration-none text-muted-upl">Data Mahasiswa</a>
						<a href="/admin/students/create" class="text-decoration-none text-muted-upl">Tambah Mahasiswa</a>
						<a href="/profile" class="text-decoration-none text-muted-upl">Profil</a>
					</div>
				</div>
			</footer>

			<!-- Navigasi Bawah untuk Ponsel (< 992px) sesuai desain.md §5.2 -->
			<nav class="upl-bottom-nav d-lg-none" aria-label="Navigasi bawah ponsel">
				<a href="/admin/students" class={pathname === '/admin/students' ? 'active' : ''}>
					<i class="bi bi-people-fill fs-5" aria-hidden="true"></i>
					<span>Mahasiswa</span>
				</a>
				<a href="/admin/students/create" class={pathname.startsWith('/admin/students/create') ? 'active' : ''}>
					<i class="bi bi-person-plus-fill fs-5" aria-hidden="true"></i>
					<span>Tambah</span>
				</a>
				<a href="/profile" class={pathname.startsWith('/profile') ? 'active' : ''}>
					<i class="bi bi-person-vcard-fill fs-5" aria-hidden="true"></i>
					<span>Profil</span>
				</a>
				<a href="/dashboard" class={pathname === '/dashboard' ? 'active' : ''}>
					<i class="bi bi-grid-1x2-fill fs-5" aria-hidden="true"></i>
					<span>Dashboard</span>
				</a>
			</nav>
		</div>
	</div>
{/if}

<!-- Toast Container sesuai desain.md Lampiran C -->
<div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 2050;">
	{#each lms.toasts as t (t.id)}
		<div
			class="toast show text-bg-{t.type} border-0 mb-2 shadow"
			role="status"
			aria-live="polite"
			aria-atomic="true"
		>
			<div class="d-flex align-items-center">
				<div class="toast-body">{t.message}</div>
				<button
					type="button"
					class="btn-close btn-close-white me-2 m-auto"
					aria-label="Tutup"
					onclick={() => lms.dismissToast(t.id)}
				></button>
			</div>
		</div>
	{/each}
</div>

