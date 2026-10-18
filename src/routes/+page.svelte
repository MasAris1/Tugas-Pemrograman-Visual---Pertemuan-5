<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { lms } from '$lib/store.svelte';

	onMount(() => {
		if (lms.currentUser) {
			goto('/admin/students', { replaceState: true });
		} else {
			goto('/login', { replaceState: true });
		}
	});
</script>

<div class="container py-5 text-center">
	<div class="spinner-border text-primary" role="status">
		<span class="visually-hidden">Memuat halaman...</span>
	</div>
</div>

