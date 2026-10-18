<script lang="ts">
	import { lms } from '$lib/store.svelte';
	import { roleLabel, studentStatusBadge } from '$lib/format';

	let activeTab = $state<'profile' | 'password' | '2fa'>('profile');

	const user = $derived(lms.currentUser);
	const student = $derived(lms.currentStudent);

	let fullName = $state(lms.currentUser?.full_name ?? '');
	let email = $state(lms.currentUser?.email ?? '');
	let whatsapp = $state(lms.currentStudent?.whatsapp ?? '');
	let peminatan = $state(lms.currentStudent?.peminatan ?? '');
	let jenisKelas = $state<'Reguler' | 'Karyawan'>(lms.currentStudent?.jenis_kelas ?? 'Reguler');
	let ttl = $state(lms.currentStudent?.ttl ?? '');
	let alamat = $state(lms.currentStudent?.alamat ?? '');
	let portfolio = $state(lms.currentStudent?.portfolio ?? '');
	let github = $state(lms.currentStudent?.github ?? '');
	let instagram = $state(lms.currentStudent?.instagram ?? '');
	let threads = $state(lms.currentStudent?.threads ?? '');

	$effect(() => {
		if (user) {
			fullName = user.full_name;
			email = user.email;
		}
		if (student) {
			whatsapp = student.whatsapp ?? '';
			peminatan = student.peminatan ?? '';
			jenisKelas = student.jenis_kelas ?? 'Reguler';
			ttl = student.ttl ?? '';
			alamat = student.alamat ?? '';
			portfolio = student.portfolio ?? '';
			github = student.github ?? '';
			instagram = student.instagram ?? '';
			threads = student.threads ?? '';
		}
	});

	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let passwordError = $state('');
	let totpCodeInput = $state('482910');

	function handleSaveProfile(e: SubmitEvent) {
		e.preventDefault();
		if (!user || !fullName.trim()) return;
		user.full_name = fullName.trim();
		user.email = email.trim();
		if (student) {
			student.full_name = fullName.trim();
			student.email = email.trim();
			student.whatsapp = whatsapp.trim();
			student.peminatan = peminatan.trim();
			student.jenis_kelas = jenisKelas;
			student.ttl = ttl.trim();
			student.alamat = alamat.trim();
			student.portfolio = portfolio.trim();
			student.github = github.trim();
			student.instagram = instagram.trim();
			student.threads = threads.trim();
		}
		lms.persist();
		lms.addToast('Profil dan kelengkapan data mahasiswa berhasil diperbarui.', 'success');
	}

	function handleChangePassword(e: SubmitEvent) {
		e.preventDefault();
		passwordError = '';
		if (!user) return;
		if (currentPassword !== user.password) {
			passwordError = 'Kata sandi saat ini tidak sesuai.';
			return;
		}
		if (newPassword.length < 10) {
			passwordError =
				'Kebijakan keamanan (architecture.md §9.1): Kata sandi baru minimal terdiri dari 10 karakter.';
			return;
		}
		if (newPassword !== confirmPassword) {
			passwordError = 'Konfirmasi kata sandi baru tidak cocok.';
			return;
		}
		user.password = newPassword;
		currentPassword = '';
		newPassword = '';
		confirmPassword = '';
		lms.persist();
		lms.addToast('Kata sandi Anda berhasil diubah.', 'success');
	}

	function toggleTwoFactor() {
		if (!user) return;
		user.totp_enabled = !user.totp_enabled;
		lms.addAuditLog({
			action: user.totp_enabled ? 'auth.2fa_enabled' : 'auth.2fa_disabled',
			subject_type: 'User',
			subject_id: `${user.username} (${user.full_name})`,
			old_values: { totp_enabled: !user.totp_enabled },
			new_values: { totp_enabled: user.totp_enabled },
			reason: 'Pengaturan autentikasi dua faktor TOTP (FR-AUTH-06)'
		});
		lms.persist();
		lms.addToast(
			user.totp_enabled
				? 'Autentikasi Dua Faktor (TOTP) berhasil diaktifkan.'
				: 'Autentikasi Dua Faktor (TOTP) dinonaktifkan.',
			'success'
		);
	}
</script>

<svelte:head>
	<title>Profil &amp; Kelengkapan Data Mahasiswa — Universitas Pelita Bangsa</title>
</svelte:head>

<div class="mb-4">
	<h1 class="h2 mb-1">Profil &amp; Kelengkapan Data Mahasiswa</h1>
	<p class="text-muted-upl mb-0">
		Redesign halaman profil proyek sebelumnya menggunakan komponen Bootstrap 5 yang terstruktur, jelas, dan aksesibel.
	</p>
</div>

<ul class="nav nav-tabs flex-nowrap overflow-auto mb-4" role="tablist">
	<li class="nav-item" role="presentation">
		<button
			type="button"
			class="nav-link {activeTab === 'profile' ? 'active' : ''}"
			onclick={() => (activeTab = 'profile')}
		>
			<i class="bi bi-person-vcard" aria-hidden="true"></i>
			<span>Profil &amp; Kelengkapan Data</span>
		</button>
	</li>
	<li class="nav-item" role="presentation">
		<button
			type="button"
			class="nav-link {activeTab === 'password' ? 'active' : ''}"
			onclick={() => (activeTab = 'password')}
		>
			<i class="bi bi-key" aria-hidden="true"></i>
			<span>Ubah Kata Sandi (FR-AUTH-04)</span>
		</button>
	</li>
	<li class="nav-item" role="presentation">
		<button
			type="button"
			class="nav-link {activeTab === '2fa' ? 'active' : ''}"
			onclick={() => (activeTab = '2fa')}
		>
			<i class="bi bi-shield-lock" aria-hidden="true"></i>
			<span>Autentikasi 2FA TOTP (FR-AUTH-06)</span>
		</button>
	</li>
</ul>

{#if user}
	{#if activeTab === 'profile'}
		<div class="row g-4 align-items-start">
			<!-- Kolom Kiri (col-12 col-lg-7): Data Read-Only & Form Kelengkapan Data -->
			<div class="col-12 col-lg-7">
				<!-- Kartu Data Mahasiswa Read-Only -->
				<div class="card shadow-sm mb-4">
					<div class="card-body p-3 p-lg-4">
						<div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
							<h2 class="h5 mb-0">
								<i class="bi bi-lock-fill me-2 text-muted-upl" aria-hidden="true"></i>Data Akademik Terkunci
							</h2>
							<span class="badge text-bg-light border">Read-Only</span>
						</div>
						<div class="row g-3 small">
							<div class="col-12 col-sm-6">
								<div class="p-3 rounded-3 bg-light border h-100">
									<div class="text-muted-upl mb-1">Nama Lengkap</div>
									<div class="fw-bold">{user.full_name}</div>
								</div>
							</div>
							<div class="col-12 col-sm-6">
								<div class="p-3 rounded-3 bg-light border h-100">
									<div class="text-muted-upl mb-1">NIM / Username</div>
									<div class="mono fw-bold">{user.username}</div>
								</div>
							</div>
							<div class="col-12 col-sm-6">
								<div class="p-3 rounded-3 bg-light border h-100">
									<div class="text-muted-upl mb-1">Fakultas &amp; Program Studi</div>
									<div class="fw-medium">Fakultas Teknik · Teknik Informatika (S1)</div>
								</div>
							</div>
							<div class="col-12 col-sm-6">
								<div class="p-3 rounded-3 bg-light border h-100">
									<div class="text-muted-upl mb-1">Semester &amp; Status</div>
									<div class="d-flex align-items-center gap-2">
										<span>Semester {student?.semester ?? 5} / Angkatan {student?.cohort_year ?? 2024}</span>
										{#if student}
											{@const b = studentStatusBadge(student.status)}
											<span class="badge rounded-pill {b.badgeClass}">{b.label}</span>
										{/if}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Kartu Form Kelengkapan Data & Sosial Media -->
				<div class="card shadow-sm">
					<div class="card-body p-3 p-lg-4">
						<h2 class="h4 mb-1">Lengkapi Data Anda</h2>
						<p class="small text-muted-upl mb-3">
							Perbarui informasi kontak, peminatan akademik, dan tautan akun sosial media.
						</p>

						<form onsubmit={handleSaveProfile}>
							<div class="row g-3">
								<div class="col-12 col-sm-6">
									<label for="prof-name" class="form-label">
										Nama lengkap <span class="text-danger" aria-hidden="true">*</span>
									</label>
									<input
										id="prof-name"
										type="text"
										class="form-control"
										bind:value={fullName}
										required
									/>
								</div>

								<div class="col-12 col-sm-6">
									<label for="prof-email" class="form-label">
										Alamat email <span class="text-danger" aria-hidden="true">*</span>
									</label>
									<input
										id="prof-email"
										type="email"
										class="form-control"
										bind:value={email}
										required
									/>
								</div>

								{#if student}
									<div class="col-12 col-sm-6">
										<label for="prof-wa" class="form-label">Nomor WhatsApp</label>
										<input
											id="prof-wa"
											type="tel"
											class="form-control"
											placeholder="081234567890"
											bind:value={whatsapp}
										/>
									</div>

									<div class="col-12 col-sm-6">
										<label for="prof-kelas" class="form-label">Jenis kelas</label>
										<select id="prof-kelas" class="form-select" bind:value={jenisKelas}>
											<option value="Reguler">Reguler</option>
											<option value="Karyawan">Karyawan</option>
										</select>
									</div>

									<div class="col-12">
										<label for="prof-peminatan" class="form-label">Peminatan akademik</label>
										<select id="prof-peminatan" class="form-select" bind:value={peminatan}>
											<option value="">Pilih peminatan...</option>
											<option value="Software Engineering & Web Development">Software Engineering & Web Development</option>
											<option value="Mobile App Development">Mobile App Development</option>
											<option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
											<option value="Cybersecurity & Network Engineering">Cybersecurity & Network Engineering</option>
											<option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
										</select>
									</div>

									<div class="col-12 col-sm-6">
										<label for="prof-ttl" class="form-label">Tempat, tanggal lahir</label>
										<input
											id="prof-ttl"
											type="text"
											class="form-control"
											placeholder="Bekasi, 12 Agustus 2003"
											bind:value={ttl}
										/>
									</div>

									<div class="col-12 col-sm-6">
										<label for="prof-portfolio" class="form-label">Link portofolio / website</label>
										<input
											id="prof-portfolio"
											type="url"
											class="form-control"
											placeholder="https://arismaulana.dev"
											bind:value={portfolio}
										/>
									</div>

									<div class="col-12">
										<label for="prof-alamat" class="form-label">Alamat domisili</label>
										<textarea
											id="prof-alamat"
											rows="2"
											class="form-control"
											bind:value={alamat}
										></textarea>
									</div>

									<div class="col-12 col-sm-4">
										<label for="prof-gh" class="form-label">Link GitHub</label>
										<input id="prof-gh" type="url" class="form-control" bind:value={github} />
									</div>

									<div class="col-12 col-sm-4">
										<label for="prof-ig" class="form-label">Link Instagram</label>
										<input id="prof-ig" type="url" class="form-control" bind:value={instagram} />
									</div>

									<div class="col-12 col-sm-4">
										<label for="prof-th" class="form-label">Link Threads</label>
										<input id="prof-th" type="url" class="form-control" bind:value={threads} />
									</div>
								{/if}
							</div>

							<div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
								<button type="submit" class="btn btn-primary">Simpan perubahan</button>
							</div>
						</form>
					</div>
				</div>
			</div>

			<!-- Kolom Kanan (col-12 col-lg-5): Foto Profil & Quick Social Badges (Integrasi Proyek Lama) -->
			<div class="col-12 col-lg-5">
				<div class="card shadow-sm mb-3 overflow-hidden">
					<div class="card-body p-3 text-center">
						<img
							src={student?.avatar_url || '/foto-aris.jpg'}
							alt="Foto Profil {user.full_name}"
							class="rounded-4 object-fit-cover border shadow-sm w-100 mb-3"
							style="max-height: 360px; object-position: center top;"
						/>
						<h2 class="h5 mb-1">{user.full_name}</h2>
						<p class="small text-muted-upl mb-2">
							NIM: <strong class="mono text-dark">{user.username}</strong> · Teknik Informatika (S1)
						</p>
						<span class="badge rounded-pill text-bg-success">Mahasiswa Aktif · Universitas Pelita Bangsa</span>
					</div>
				</div>

				<div class="card shadow-sm">
					<div class="card-body p-3">
						<h3 class="h6 mb-3">Quick Social Badges</h3>
						<div class="row g-2">
							<div class="col-6">
								<a
									href={github || '#'}
									target="_blank"
									rel="noopener noreferrer"
									class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 btn-sm py-2"
								>
									<i class="bi bi-github" aria-hidden="true"></i>
									<span>GitHub</span>
								</a>
							</div>
							<div class="col-6">
								<a
									href={instagram || '#'}
									target="_blank"
									rel="noopener noreferrer"
									class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 btn-sm py-2"
								>
									<i class="bi bi-instagram" aria-hidden="true"></i>
									<span>Instagram</span>
								</a>
							</div>
							<div class="col-6">
								<a
									href={threads || '#'}
									target="_blank"
									rel="noopener noreferrer"
									class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 btn-sm py-2"
								>
									<i class="bi bi-threads" aria-hidden="true"></i>
									<span>Threads</span>
								</a>
							</div>
							<div class="col-6">
								<a
									href={whatsapp ? `https://wa.me/62${whatsapp.replace(/^0/, '')}` : '#'}
									target="_blank"
									rel="noopener noreferrer"
									class="btn btn-outline-success w-100 d-flex align-items-center justify-content-center gap-2 btn-sm py-2"
								>
									<i class="bi bi-whatsapp" aria-hidden="true"></i>
									<span>WhatsApp</span>
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else if activeTab === 'password'}
		<div class="row g-3">
			<div class="col-12 col-lg-8 col-xl-6">
				<div class="card shadow-sm">
					<div class="card-body p-3 p-lg-4">
						<h2 class="h4 mb-3">Ubah Kata Sandi</h2>
						{#if passwordError}
							<div class="alert alert-danger" role="alert">{passwordError}</div>
						{/if}
						<form onsubmit={handleChangePassword} novalidate>
							<div class="mb-3">
								<label for="curr-pwd" class="form-label">
									Kata sandi saat ini <span class="text-danger" aria-hidden="true">*</span>
								</label>
								<input
									id="curr-pwd"
									type="password"
									class="form-control"
									placeholder="Kata sandi demo: Demo#2026"
									bind:value={currentPassword}
									required
								/>
							</div>

							<div class="mb-3">
								<label for="new-pwd" class="form-label">
									Kata sandi baru <span class="text-danger" aria-hidden="true">*</span>
								</label>
								<input
									id="new-pwd"
									type="password"
									class="form-control"
									placeholder="Minimal 10 karakter"
									bind:value={newPassword}
									required
								/>
								<div class="form-text">
									Kebijakan kata sandi menggunakan hash Argon2id dengan panjang minimal 10 karakter.
								</div>
							</div>

							<div class="mb-4">
								<label for="conf-pwd" class="form-label">
									Ulangi kata sandi baru <span class="text-danger" aria-hidden="true">*</span>
								</label>
								<input
									id="conf-pwd"
									type="password"
									class="form-control"
									bind:value={confirmPassword}
									required
								/>
							</div>

							<div class="d-flex justify-content-end">
								<button type="submit" class="btn btn-primary">Simpan kata sandi baru</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="row g-3">
			<div class="col-12 col-lg-8 col-xl-6">
				<div class="card shadow-sm">
					<div class="card-body p-3 p-lg-4">
						<div class="d-flex justify-content-between align-items-center mb-3">
							<h2 class="h4 mb-0">Autentikasi Dua Faktor (TOTP)</h2>
							<span class="badge rounded-pill {user.totp_enabled ? 'text-bg-success' : 'text-bg-secondary'}">
								{user.totp_enabled ? 'Aktif' : 'Belum Aktif'}
							</span>
						</div>
						<p class="text-muted-upl small">
							Lindungi akun akademik dengan kode 6 digit dari aplikasi autentikator (Google Authenticator / Authy).
						</p>

						<div class="p-3 bg-light border rounded-3 mb-3">
							<div class="small fw-semibold mb-1">Kunci Rahasia TOTP Simulasi:</div>
							<code class="mono fs-6">UPB-PELITALEARN-2026-TOTP</code>
						</div>

						<div class="mb-3">
							<label for="totp-code" class="form-label">Kode verifikasi 6 digit</label>
							<input
								id="totp-code"
								type="text"
								maxlength="6"
								class="form-control mono"
								style="max-width: 180px;"
								bind:value={totpCodeInput}
							/>
						</div>

						<button
							type="button"
							class="btn {user.totp_enabled ? 'btn-outline-danger' : 'btn-primary'}"
							onclick={toggleTwoFactor}
						>
							{user.totp_enabled ? 'Nonaktifkan 2FA' : 'Aktifkan 2FA Sekarang'}
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
{/if}
