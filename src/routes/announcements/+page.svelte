<script lang="ts">
	import { lms } from '$lib/store.svelte';
	import { formatDateId, roleLabel } from '$lib/format';

	let scopeFilter = $state<'all' | 'global' | 'class'>('all');
	let newTitle = $state('');
	let newBody = $state('');
	let newClassId = $state<string>('global');

	const user = $derived(lms.currentUser);
	const canCreate = $derived(
		user?.role === 'lecturer' || user?.role === 'academic_admin' || user?.role === 'super_admin'
	);

	const filteredAnnouncements = $derived(
		lms.announcements.filter((a) => {
			if (scopeFilter === 'global') return a.course_class_id === null;
			if (scopeFilter === 'class') return a.course_class_id !== null;
			return true;
		})
	);

	function handleCreateAnnouncement(e: SubmitEvent) {
		e.preventDefault();
		if (!newTitle.trim() || !newBody.trim() || !user) return;

		const isGlobal = newClassId === 'global' && user.role !== 'lecturer';
		const targetClassId = isGlobal ? null : Number(newClassId === 'global' ? 1 : newClassId);
		const cls = lms.courseClasses.find((c) => c.id === targetClassId);

		const newId = Math.max(0, ...lms.announcements.map((a) => a.id)) + 1;
		lms.announcements = [
			{
				id: newId,
				course_class_id: targetClassId,
				author_user_id: user.id,
				author_name: user.full_name,
				author_role_label: targetClassId
					? `Dosen Pengampu ${cls?.class_code}`
					: roleLabel(user.role),
				title: newTitle.trim(),
				body: newBody.trim(),
				published_at: new Date().toISOString()
			},
			...lms.announcements
		];

		newTitle = '';
		newBody = '';
		lms.persist();
		lms.addToast('Pengumuman berhasil diterbitkan.', 'success');
	}
</script>

<svelte:head>
	<title>Pengumuman (S17) — PelitaLearn</title>
</svelte:head>

<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
	<div>
		<h1 class="h2 mb-1">Pengumuman (S17)</h1>
		<p class="text-muted-upl mb-0">
			Informasi akademik resmi tingkat universitas (Global) dan pengumuman per kelas.
		</p>
	</div>

	<div class="btn-group" role="group" aria-label="Filter cakupan pengumuman">
		<button
			type="button"
			class="btn {scopeFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}"
			onclick={() => (scopeFilter = 'all')}
		>
			Semua
		</button>
		<button
			type="button"
			class="btn {scopeFilter === 'global' ? 'btn-primary' : 'btn-outline-secondary'}"
			onclick={() => (scopeFilter = 'global')}
		>
			Global Kampus
		</button>
		<button
			type="button"
			class="btn {scopeFilter === 'class' ? 'btn-primary' : 'btn-outline-secondary'}"
			onclick={() => (scopeFilter = 'class')}
		>
			Kelas
		</button>
	</div>
</div>

<div class="row g-3">
	<div class="col-12 {canCreate ? 'col-lg-7' : 'col-lg-12'} vstack gap-3">
		{#each filteredAnnouncements as ann (ann.id)}
			{@const cls = lms.courseClasses.find((c) => c.id === ann.course_class_id)}
			<article class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<div class="d-flex justify-content-between align-items-center mb-2">
						<span class="badge rounded-pill {cls ? 'text-bg-primary mono' : 'text-bg-dark'}">
							{cls ? `Kelas ${cls.class_code}` : 'Global Kampus'}
						</span>
						<span class="small text-muted-upl">{formatDateId(ann.published_at)}</span>
					</div>
					<h2 class="h4 mb-2">{ann.title}</h2>
					<p class="mb-3">{ann.body}</p>
					<div class="small text-muted-upl border-top pt-2">
						Diterbitkan oleh <strong>{ann.author_name}</strong> ({ann.author_role_label})
					</div>
				</div>
			</article>
		{/each}
	</div>

	{#if canCreate}
		<div class="col-12 col-lg-5">
			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h4 mb-3">Terbitkan Pengumuman Baru (FR-PGM-01)</h2>
					<form onsubmit={handleCreateAnnouncement}>
						<div class="mb-3">
							<label for="ann-scope" class="form-label">Cakupan penerima *</label>
							<select id="ann-scope" class="form-select" bind:value={newClassId}>
								{#if user?.role !== 'lecturer'}
									<option value="global">Global (Seluruh Civitas Kampus)</option>
								{/if}
								{#each lms.courseClasses as cls (cls.id)}
									{@const crs = lms.courses.find((c) => c.id === cls.course_id)}
									<option value={String(cls.id)}>Kelas {cls.class_code} — {crs?.name}</option>
								{/each}
							</select>
						</div>

						<div class="mb-3">
							<label for="ann-title" class="form-label">
								Judul pengumuman <span class="text-danger" aria-hidden="true">*</span>
								<span class="visually-hidden">(wajib diisi)</span>
							</label>
							<input
								id="ann-title"
								type="text"
								class="form-control"
								placeholder="Masukkan judul informasi..."
								bind:value={newTitle}
								required
							/>
						</div>

						<div class="mb-3">
							<label for="ann-body" class="form-label">
								Isi pengumuman <span class="text-danger" aria-hidden="true">*</span>
								<span class="visually-hidden">(wajib diisi)</span>
							</label>
							<textarea
								id="ann-body"
								rows="4"
								class="form-control"
								placeholder="Tuliskan isi pengumuman secara jelas..."
								bind:value={newBody}
								required
							></textarea>
						</div>

						<button type="submit" class="btn btn-primary w-100">Terbitkan pengumuman</button>
					</form>
				</div>
			</div>
		</div>
	{/if}
</div>

