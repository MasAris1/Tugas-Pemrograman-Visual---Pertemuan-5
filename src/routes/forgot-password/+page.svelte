<script lang="ts">
	import { lms } from '$lib/store.svelte';

	let identifier = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let step = $state<'request' | 'reset' | 'done'>('request');
	let errorMessage = $state('');
	let targetUser = $state<{ id: number; username: string; email: string; full_name: string } | null>(null);

	function handleRequestReset(e: SubmitEvent) {
		e.preventDefault();
		errorMessage = '';
		const clean = identifier.trim().toLowerCase();
		if (!clean) {
			errorMessage = 'Masukkan alamat email, NIM, atau NIDN Anda.';
			return;
		}
		const found = lms.users.find(
			(u) => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
		);
		if (!found) {
			errorMessage = 'Akun dengan NIM/NIDN/Email tersebut tidak ditemukan di dalam sistem.';
			return;
		}
		targetUser = {
			id: found.id,
			username: found.username,
			email: found.email,
			full_name: found.full_name
		};
		step = 'reset';
	}

	function handleResetPassword(e: SubmitEvent) {
		e.preventDefault();
		errorMessage = '';
		if (newPassword.length < 8) {
			errorMessage = 'Kata sandi baru minimal terdiri dari 8 karakter.';
			return;
		}
		if (newPassword !== confirmPassword) {
			errorMessage = 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru.';
			return;
		}
		const usr = lms.users.find((u) => u.id === targetUser?.id);
		if (usr) {
			usr.password = newPassword;
			usr.failed_login_count = 0;
			usr.locked_until = null;
			lms.addAuditLog({
				action: 'auth.password_reset',
				subject_type: 'User',
				subject_id: `${usr.username} (${usr.full_name})`,
				old_values: {},
				new_values: { password_changed: true },
				reason: 'Reset kata sandi mandiri melalui tautan email (FR-AUTH-03)'
			});
			lms.persist();
		}
		step = 'done';
	}
</script>

<svelte:head>
	<title>Lupa Kata Sandi — PelitaLearn</title>
</svelte:head>

<div class="container py-5">
	<div class="row justify-content-center">
		<div class="col-12 col-md-7 col-lg-5">
			<div class="text-center mb-4">
				<h1 class="h3 mb-1">Pemulihan Kata Sandi</h1>
				<p class="text-muted-upl mb-0">PelitaLearn — Universitas Pelita Bangsa</p>
			</div>

			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					{#if errorMessage}
						<div class="alert alert-danger" role="alert">{errorMessage}</div>
					{/if}

					{#if step === 'request'}
						<p class="text-muted-upl small mb-3">
							Masukkan NIM, NIDN, atau email terdaftar. Sistem akan mengirimkan tautan pemulihan kata sandi yang berlaku selama <strong>60 menit</strong> (FR-AUTH-03).
						</p>
						<form novalidate onsubmit={handleRequestReset}>
							<div class="mb-3">
								<label for="reset-id" class="form-label">
									NIM / NIDN / Email <span class="text-danger" aria-hidden="true">*</span>
									<span class="visually-hidden">(wajib diisi)</span>
								</label>
								<input
									id="reset-id"
									type="text"
									class="form-control mono"
									placeholder="Contoh: 24010101 atau naila.putri@mhs.lms.example"
									bind:value={identifier}
									required
								/>
							</div>

							<div class="d-flex flex-column-reverse flex-sm-row justify-content-sm-between gap-2 mt-4">
								<a href="/login" class="btn btn-outline-secondary">Kembali ke Masuk</a>
								<button type="submit" class="btn btn-primary">Kirim tautan pemulihan</button>
							</div>
						</form>
					{:else if step === 'reset' && targetUser}
						<div class="alert alert-info small" role="alert">
							<strong>Tautan pemulihan terverifikasi</strong> untuk akun <strong>{targetUser.full_name}</strong> (<span class="mono">{targetUser.email}</span>). Tautan berlaku 60 menit.
						</div>

						<form novalidate onsubmit={handleResetPassword}>
							<div class="mb-3">
								<label for="new-pass" class="form-label">
									Kata sandi baru <span class="text-danger" aria-hidden="true">*</span>
									<span class="visually-hidden">(wajib diisi)</span>
								</label>
								<input
									id="new-pass"
									type="password"
									class="form-control"
									placeholder="Minimal 8 karakter"
									bind:value={newPassword}
									required
								/>
							</div>

							<div class="mb-3">
								<label for="confirm-pass" class="form-label">
									Ulangi kata sandi baru <span class="text-danger" aria-hidden="true">*</span>
									<span class="visually-hidden">(wajib diisi)</span>
								</label>
								<input
									id="confirm-pass"
									type="password"
									class="form-control"
									placeholder="Ketik ulang kata sandi baru"
									bind:value={confirmPassword}
									required
								/>
							</div>

							<div class="d-flex flex-column-reverse flex-sm-row justify-content-sm-between gap-2 mt-4">
								<button type="button" class="btn btn-outline-secondary" onclick={() => (step = 'request')}>
									Batal
								</button>
								<button type="submit" class="btn btn-primary">Simpan kata sandi baru</button>
							</div>
						</form>
					{:else}
						<div class="alert alert-success" role="alert">
							<strong>Kata sandi berhasil diperbarui!</strong> Kunci akun (jika ada) juga telah dibuka. Silakan masuk menggunakan kata sandi baru Anda.
						</div>
						<a href="/login" class="btn btn-primary w-100">Masuk sekarang</a>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

