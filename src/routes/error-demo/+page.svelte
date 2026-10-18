<script lang="ts">
	let selectedCode = $state<403 | 404 | 500>(404);
</script>

<svelte:head>
	<title>Halaman Galat (S21) — PelitaLearn</title>
</svelte:head>

<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
	<div>
		<h1 class="h2 mb-1">Pratinjau Halaman Galat (S21)</h1>
		<p class="text-muted-upl mb-0">
			Standar tampilan pesan galat 403, 404, dan 500 sesuai microcopy pada <span class="mono">desain.md §9</span>.
		</p>
	</div>
	<div class="btn-group" role="group" aria-label="Pilih kode galat">
		<button
			type="button"
			class="btn {selectedCode === 404 ? 'btn-primary' : 'btn-outline-secondary'}"
			onclick={() => (selectedCode = 404)}
		>
			404 Tidak Ditemukan
		</button>
		<button
			type="button"
			class="btn {selectedCode === 403 ? 'btn-primary' : 'btn-outline-secondary'}"
			onclick={() => (selectedCode = 403)}
		>
			403 Akses Ditolak
		</button>
		<button
			type="button"
			class="btn {selectedCode === 500 ? 'btn-primary' : 'btn-outline-secondary'}"
			onclick={() => (selectedCode = 500)}
		>
			500 Gangguan Sistem
		</button>
	</div>
</div>

<div class="row justify-content-center py-3">
	<div class="col-12 col-md-8 col-lg-6">
		<div class="card p-4 p-lg-5 text-center shadow-sm">
			<div class="mb-3">
				<span class="badge rounded-pill text-bg-danger fs-6 px-3 py-2 mono">
					HTTP {selectedCode}
				</span>
			</div>
			{#if selectedCode === 404}
				<h2 class="h3 mb-2">Halaman Tidak Ditemukan</h2>
				<p class="text-muted-upl mb-4">
					Halaman tidak ditemukan. Periksa alamatnya atau kembali ke Dashboard.
				</p>
			{:else if selectedCode === 403}
				<h2 class="h3 mb-2">Akses Tidak Diizinkan</h2>
				<p class="text-muted-upl mb-4">
					Anda tidak memiliki hak akses untuk membuka halaman atau kelas ini (BR-12). Silakan kembali ke Dashboard sesuai peran Anda.
				</p>
			{:else}
				<h2 class="h3 mb-2">Terjadi Gangguan pada Sistem</h2>
				<p class="text-muted-upl mb-4">
					Permintaan Anda belum dapat diproses saat ini. Silakan coba lagi beberapa saat lagi atau hubungi Tim IT Kampus.
				</p>
			{/if}

			<div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
				<a href="/dashboard" class="btn btn-primary">
					<i class="bi bi-house-door me-2" aria-hidden="true"></i>Kembali ke Dashboard
				</a>
				<button type="button" class="btn btn-outline-secondary" onclick={() => location.reload()}>
					<i class="bi bi-arrow-clockwise me-2" aria-hidden="true"></i>Coba lagi
				</button>
			</div>
		</div>
	</div>
</div>

