<script lang="ts">
	import { goto } from '$app/navigation';
	import { lms } from '$lib/store.svelte';

	let identifier = $state('24010101');
	let password = $state('Demo#2026');
	let rememberMe = $state(true);
	let showPassword = $state(false);
	let errorMessage = $state('');
	let isLocked = $state(false);
	let submitted = $state(false);

	let identifierInput: HTMLInputElement | undefined = $state();
	let passwordInput: HTMLInputElement | undefined = $state();

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		submitted = true;
		errorMessage = '';

		if (!identifier.trim()) {
			identifierInput?.focus();
			return;
		}
		if (!password) {
			passwordInput?.focus();
			return;
		}

		const res = lms.login(identifier, password);
		if (!res.ok) {
			errorMessage = res.error ?? 'Gagal masuk. Periksa kembali kredensial Anda.';
			isLocked = Boolean(res.locked);
			return;
		}

		goto('/dashboard');
	}

	function fillAndLogin(userCode: string) {
		identifier = userCode;
		password = 'Demo#2026';
		errorMessage = '';
		isLocked = false;
		lms.unlockAccount(userCode);
		const res = lms.login(userCode, 'Demo#2026');
		if (res.ok) {
			goto('/dashboard');
		}
	}

	function simulateFiveFailedLogins() {
		errorMessage = '';
		for (let i = 0; i < 5; i++) {
			const res = lms.login(identifier || '24010101', 'SandiSalah123');
			if (!res.ok) {
				errorMessage = res.error ?? '';
				isLocked = Boolean(res.locked);
			}
		}
	}
</script>

<svelte:head>
	<title>Masuk — PelitaLearn | LMS Universitas Pelita Bangsa</title>
</svelte:head>

<div class="container py-5">
	<div class="row justify-content-center g-4 align-items-start">
		<div class="col-12 col-md-8 col-lg-5">
			<div class="text-center mb-4">
				<div
					class="d-inline-flex align-items-center justify-content-center rounded-3 fw-bold mb-2 shadow-sm"
					style="width: 52px; height: 52px; background: var(--upl-navy-900); color: var(--upl-teal-500); font-family: 'Montserrat', sans-serif; font-size: 1.35rem;"
				>
					PL
				</div>
				<h1 class="h2 mb-1">PelitaLearn</h1>
				<p class="text-muted-upl mb-0">Universitas Pelita Bangsa — LMS</p>
			</div>

			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h4 mb-3">Masuk</h2>

					{#if errorMessage}
						<div class="alert {isLocked ? 'alert-danger' : 'alert-warning'} mb-3" role="alert">
							<div class="d-flex align-items-start gap-2">
								<i class="bi {isLocked ? 'bi-lock-fill' : 'bi-exclamation-circle-fill'} mt-1" aria-hidden="true"></i>
								<div class="flex-grow-1">
									<div>{errorMessage}</div>
									{#if isLocked}
										<button
											type="button"
											class="btn btn-sm btn-outline-danger mt-2"
											onclick={() => {
												lms.unlockAccount(identifier);
												errorMessage = '';
												isLocked = false;
											}}
										>
											<i class="bi bi-unlock me-1" aria-hidden="true"></i>Buka Kunci Akun Sekarang (Mode Demo)
										</button>
									{/if}
								</div>
							</div>
						</div>
					{/if}

					<form novalidate onsubmit={handleSubmit}>
						<div class="mb-3">
							<label for="identifier" class="form-label">
								NIM / NIDN / Email <span class="text-danger" aria-hidden="true">*</span>
								<span class="visually-hidden">(wajib diisi)</span>
							</label>
							<input
								bind:this={identifierInput}
								id="identifier"
								name="identifier"
								type="text"
								class="form-control mono {submitted && !identifier.trim() ? 'is-invalid' : ''}"
								placeholder="Contoh: 24010101 atau ahmad.fauzi@lms.example"
								bind:value={identifier}
								required
								aria-describedby="id-help"
							/>
							<div id="id-help" class="form-text">
								Gunakan NIM (8 digit), NIDN (10 digit), kode admin, atau email kampus.
							</div>
							<div class="invalid-feedback">
								Masukkan NIM, NIDN, atau alamat email Anda.
							</div>
						</div>

						<div class="mb-3">
							<label for="password" class="form-label">
								Kata sandi <span class="text-danger" aria-hidden="true">*</span>
								<span class="visually-hidden">(wajib diisi)</span>
							</label>
							<div class="input-group has-validation">
								<input
									bind:this={passwordInput}
									id="password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									class="form-control {submitted && !password ? 'is-invalid' : ''}"
									placeholder="Masukkan kata sandi"
									bind:value={password}
									required
								/>
								<button
									type="button"
									class="btn btn-outline-secondary"
									aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
									onclick={() => (showPassword = !showPassword)}
								>
									{showPassword ? 'Sembunyikan' : 'Tampilkan'}
								</button>
								<div class="invalid-feedback">Kata sandi wajib diisi.</div>
							</div>
						</div>

						<div class="d-flex justify-content-between align-items-center mb-4">
							<div class="form-check">
								<input
									id="remember"
									type="checkbox"
									class="form-check-input"
									bind:checked={rememberMe}
								/>
								<label for="remember" class="form-check-label">Ingat saya</label>
							</div>
							<a href="/forgot-password" class="small fw-medium">Lupa kata sandi?</a>
						</div>

						<button type="submit" class="btn btn-primary w-100">
							<i class="bi bi-box-arrow-in-right me-2" aria-hidden="true"></i>Masuk
						</button>
					</form>
				</div>
			</div>
		</div>

		<!-- Panel Pintas Akun Demo (PRD Lampiran A.2 & AC-01 / AC-03) -->
		<div class="col-12 col-md-8 col-lg-5">
			<div class="card bg-teal-subtle-upl border-0 shadow-sm mt-lg-5">
				<div class="card-body p-3 p-lg-4">
					<div class="d-flex align-items-center justify-content-between mb-2">
						<h2 class="h5 mb-0">
							<i class="bi bi-lightning-charge-fill me-1 text-primary" aria-hidden="true"></i>Akun Demo Siap Pakai
						</h2>
						<span class="badge rounded-pill text-bg-primary">PRD Lampiran A.2</span>
					</div>
					<p class="small text-muted-upl mb-3">
						Klik salah satu akun di bawah untuk langsung masuk (kata sandi default: <code class="mono fw-bold">Demo#2026</code>):
					</p>

					<div class="vstack gap-2">
						<div class="card border bg-white">
							<div class="card-body p-2 px-3 d-flex justify-content-between align-items-center gap-2">
								<div>
									<div class="fw-bold small">Naila Putri <span class="badge rounded-pill text-bg-success ms-1">Mahasiswa Aktif</span></div>
									<div class="small text-muted-upl mono">NIM: 24010101 · Informatika Sem. 5</div>
								</div>
								<button
									type="button"
									class="btn btn-primary btn-sm"
									onclick={() => fillAndLogin('24010101')}
								>
									Masuk
								</button>
							</div>
						</div>

						<div class="card border bg-white">
							<div class="card-body p-2 px-3 d-flex justify-content-between align-items-center gap-2">
								<div>
									<div class="fw-bold small">Sari Dewi <span class="badge rounded-pill text-bg-warning ms-1">Mahasiswa Cuti</span></div>
									<div class="small text-muted-upl mono">NIM: 24010103 · Uji BR-02 & AC-03</div>
								</div>
								<button
									type="button"
									class="btn btn-outline-primary btn-sm"
									onclick={() => fillAndLogin('24010103')}
								>
									Masuk
								</button>
							</div>
						</div>

						<div class="card border bg-white">
							<div class="card-body p-2 px-3 d-flex justify-content-between align-items-center gap-2">
								<div>
									<div class="fw-bold small">Dr. Ahmad Fauzi, M.Kom. <span class="badge rounded-pill text-bg-primary ms-1">Dosen</span></div>
									<div class="small text-muted-upl mono">NIDN: 9900000001 · INF301-5A & INF312-5A</div>
								</div>
								<button
									type="button"
									class="btn btn-outline-primary btn-sm"
									onclick={() => fillAndLogin('9900000001')}
								>
									Masuk
								</button>
							</div>
						</div>

						<div class="card border bg-white">
							<div class="card-body p-2 px-3 d-flex justify-content-between align-items-center gap-2">
								<div>
									<div class="fw-bold small">Agus Setiawan <span class="badge rounded-pill text-bg-info ms-1">Admin Akademik</span></div>
									<div class="small text-muted-upl mono">Username: A001 · Kelola Mahasiswa & Kelas</div>
								</div>
								<button
									type="button"
									class="btn btn-outline-primary btn-sm"
									onclick={() => fillAndLogin('A001')}
								>
									Masuk
								</button>
							</div>
						</div>

						<div class="card border bg-white">
							<div class="card-body p-2 px-3 d-flex justify-content-between align-items-center gap-2">
								<div>
									<div class="fw-bold small">Tim IT Kampus <span class="badge rounded-pill text-bg-dark ms-1">Super Admin</span></div>
									<div class="small text-muted-upl mono">Username: superadmin · Audit & Konfigurasi</div>
								</div>
								<button
									type="button"
									class="btn btn-outline-primary btn-sm"
									onclick={() => fillAndLogin('superadmin')}
								>
									Masuk
								</button>
							</div>
						</div>
					</div>

					<hr class="my-3" />

					<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
						<span class="small text-muted-upl">
							Uji Kriteria Penerimaan <strong>AC-01</strong> (5× salah kata sandi):
						</span>
						<button
							type="button"
							class="btn btn-outline-danger btn-sm"
							onclick={simulateFiveFailedLogins}
						>
							<i class="bi bi-shield-lock me-1" aria-hidden="true"></i>Simulasikan 5× Gagal Login
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

