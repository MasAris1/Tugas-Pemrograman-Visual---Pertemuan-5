<script lang="ts">
	import { goto } from '$app/navigation';
	import { lms } from '$lib/store.svelte';
	import { formatDateTimeWib } from '$lib/format';

	let filterMode = $state<'all' | 'unread'>('all');

	const user = $derived(lms.currentUser);
	const userNotifications = $derived(
		lms.notifications.filter((n) => {
			if (user && n.user_id !== user.id) return false;
			if (filterMode === 'unread') return !n.read_at;
			return true;
		})
	);

	function markReadAndOpen(notifId: number, link: string) {
		const item = lms.notifications.find((n) => n.id === notifId);
		if (item && !item.read_at) {
			item.read_at = new Date().toISOString();
			lms.persist();
		}
		goto(link);
	}

	function markAllAsRead() {
		if (!user) return;
		const nowIso = new Date().toISOString();
		for (const n of lms.notifications) {
			if (n.user_id === user.id && !n.read_at) {
				n.read_at = nowIso;
			}
		}
		lms.persist();
		lms.addToast('Seluruh notifikasi telah ditandai sudah dibaca.', 'info');
	}
</script>

<svelte:head>
	<title>Notifikasi (S18) — PelitaLearn</title>
</svelte:head>

<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
	<div>
		<h1 class="h2 mb-1">Notifikasi (S18)</h1>
		<p class="text-muted-upl mb-0">
			Pemberitahuan tenggat tugas, pengumuman penting, dan pembaruan nilai.
		</p>
	</div>

	<div class="d-flex flex-wrap gap-2">
		<div class="btn-group" role="group" aria-label="Filter notifikasi">
			<button
				type="button"
				class="btn {filterMode === 'all' ? 'btn-primary' : 'btn-outline-secondary'}"
				onclick={() => (filterMode = 'all')}
			>
				Semua
			</button>
			<button
				type="button"
				class="btn {filterMode === 'unread' ? 'btn-primary' : 'btn-outline-secondary'}"
				onclick={() => (filterMode = 'unread')}
			>
				Belum dibaca ({lms.unreadNotificationsCount})
			</button>
		</div>
		{#if lms.unreadNotificationsCount > 0}
			<button type="button" class="btn btn-outline-primary" onclick={markAllAsRead}>
				Tandai semua dibaca
			</button>
		{/if}
	</div>
</div>

<div class="card shadow-sm">
	{#if userNotifications.length === 0}
		<div class="card-body p-5 text-center">
			<i class="bi bi-bell-slash fs-1 text-muted-upl mb-2 d-block" aria-hidden="true"></i>
			<h2 class="h5 mb-1">Tidak Ada Notifikasi</h2>
			<p class="text-muted-upl mb-0">
				Seluruh pemberitahuan Anda telah dibaca.
			</p>
		</div>
	{:else}
		<div class="list-group list-group-flush">
			{#each userNotifications as notif (notif.id)}
				<button
					type="button"
					class="list-group-item list-group-item-action p-3 p-lg-4 text-start d-flex justify-content-between align-items-start gap-3 {!notif.read_at ? 'bg-teal-subtle-upl' : ''}"
					onclick={() => markReadAndOpen(notif.id, notif.link)}
				>
					<div class="d-flex gap-3 align-items-start">
						<div
							class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
							style="width: 40px; height: 40px; background: {!notif.read_at ? 'var(--upl-teal-700)' : '#e2e8f0'}; color: {!notif.read_at ? '#fff' : '#475569'};"
						>
							<i
								class="bi {notif.type === 'deadline' ? 'bi-alarm' : notif.type === 'grade' ? 'bi-award' : 'bi-megaphone'}"
								aria-hidden="true"
							></i>
						</div>
						<div>
							<div class="d-flex align-items-center gap-2 mb-1">
								<span class="fw-bold">{notif.title}</span>
								{#if !notif.read_at}
									<span class="badge rounded-pill text-bg-primary">Baru</span>
								{/if}
							</div>
							<p class="mb-1 text-muted-upl">{notif.message}</p>
							<small class="text-muted-upl">{formatDateTimeWib(notif.created_at, true)}</small>
						</div>
					</div>
					<i class="bi bi-chevron-right text-muted-upl mt-2" aria-hidden="true"></i>
				</button>
			{/each}
		</div>
	{/if}
</div>

