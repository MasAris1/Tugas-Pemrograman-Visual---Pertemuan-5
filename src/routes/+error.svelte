<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} — Halaman Tidak Ditemukan | PelitaLearn</title>
</svelte:head>

<div class="container py-5">
	<div class="row justify-content-center">
		<div class="col-12 col-md-8 col-lg-6">
			<div class="card p-4 p-lg-5 text-center shadow-sm">
				<div class="mb-3">
					<span class="badge rounded-pill text-bg-danger fs-6 px-3 py-2 mono">
						Galat {page.status}
					</span>
				</div>
				<h1 class="h2 mb-3">
					{#if page.status === 403}
						Akses Ditolak
					{:else if page.status === 500}
						Gangguan Server Internal
					{:else}
						Halaman Tidak Ditemukan
					{/if}
				</h1>
				<p class="text-muted-upl mb-4">
					{#if page.status === 403}
						Anda tidak memiliki izin untuk membuka sumber daya ini. Pastikan Anda masuk dengan peran yang sesuai.
					{:else}
						Halaman tidak ditemukan. Periksa alamatnya atau kembali ke Dashboard.
					{/if}
				</p>
				<div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
					<a href="/dashboard" class="btn btn-primary">
						<i class="bi bi-arrow-left me-2" aria-hidden="true"></i>Kembali ke Dashboard
					</a>
					<a href="/classes" class="btn btn-outline-secondary">Lihat Kelas Saya</a>
				</div>
			</div>
		</div>
	</div>
</div>

