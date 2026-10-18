<script lang="ts">
	import { page } from '$app/state';
	import { lms } from '$lib/store.svelte';
	import { formatDateTimeWib, formatScore } from '$lib/format';

	let selectedClassId = $state(Number(page.url.searchParams.get('class')) || 1);
	let confirmFinalizeOpen = $state(false);
	let weightError = $state('');

	const currentClass = $derived(
		lms.courseClasses.find((c) => c.id === selectedClassId) ?? lms.courseClasses[0]
	);
	const currentCourse = $derived(
		lms.courses.find((c) => c.id === currentClass?.course_id)
	);

	const classComponents = $derived(
		lms.gradeComponents.filter((c) => c.course_class_id === selectedClassId)
	);

	const classEnrollments = $derived(
		lms.enrollments.filter((e) => e.course_class_id === selectedClassId)
	);

	const isClassLocked = $derived(
		classEnrollments.some((e) => Boolean(e.grades_locked_at))
	);

	let editableWeights = $state<Record<number, number>>({});

	$effect(() => {
		const map: Record<number, number> = {};
		for (const c of classComponents) {
			map[c.id] = c.weight;
		}
		editableWeights = map;
	});

	const totalWeight = $derived(
		classComponents.reduce((sum, c) => sum + Number(editableWeights[c.id] ?? c.weight), 0)
	);

	function handleSaveWeights(e: SubmitEvent) {
		e.preventDefault();
		weightError = '';
		const payload = classComponents.map((c) => ({
			componentId: c.id,
			weight: Number(editableWeights[c.id] ?? c.weight)
		}));
		const res = lms.saveClassGradeWeights(selectedClassId, payload);
		if (!res.ok) {
			weightError = res.error ?? 'Total bobot harus 100%.';
		}
	}

	function getScore(enrollmentId: number, componentId: number): number {
		return (
			lms.gradeEntries.find(
				(ge) => ge.enrollment_id === enrollmentId && ge.grade_component_id === componentId
			)?.score ?? 0
		);
	}

	function handleScoreChange(enrollmentId: number, componentId: number, val: string) {
		lms.updateStudentComponentScore(enrollmentId, componentId, Number(val));
	}

	function handleConfirmFinalize() {
		const res = lms.finalizeClassGrades(selectedClassId);
		if (!res.ok) {
			weightError = res.error ?? '';
		}
		confirmFinalizeOpen = false;
	}

	function unlockForDemo() {
		for (const enr of classEnrollments) {
			enr.grades_locked_at = null;
		}
		lms.persist();
		lms.addToast('Kunci nilai dibuka kembali untuk keperluan demo.', 'info');
	}

	function exportSiakadCsv() {
		const headers = [
			'NIM',
			'Nama Mahasiswa',
			...classComponents.map((c) => `${c.name} (${c.weight}%)`),
			'Nilai Akhir',
			'Huruf Mutu',
			'Bobot Mutu'
		];
		const rows = classEnrollments.map((enr) => {
			const st = lms.students.find((s) => s.id === enr.student_id);
			return [
				st?.nim ?? '',
				st?.full_name ?? '',
				...classComponents.map((c) => formatScore(getScore(enr.id, c.id))),
				formatScore(enr.final_score),
				enr.letter_grade ?? 'E',
				formatScore(enr.grade_points)
			];
		});
		const csv = [headers, ...rows].map((r) => r.join(';')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `Rekap-Nilai-SIAKAD-${currentClass.class_code}.csv`;
		a.click();
		URL.revokeObjectURL(url);
		lms.addToast(`Berkas CSV nilai ${currentClass.class_code} berhasil diekspor untuk SIAKAD.`, 'success');
	}
</script>

<svelte:head>
	<title>Bobot dan Rekap Nilai (S13) — PelitaLearn</title>
</svelte:head>

<div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
	<div>
		<h1 class="h2 mb-1">Bobot dan Rekap Nilai (S13)</h1>
		<p class="text-muted-upl mb-0">
			Atur bobot komponen (wajib total 100%), input nilai UTS/UAS, dan finalisasi nilai akhir semester.
		</p>
	</div>

	<div class="d-flex flex-wrap align-items-center gap-2">
		<label for="cls-grade-select" class="form-label mb-0 small fw-semibold">Kelas:</label>
		<select id="cls-grade-select" class="form-select w-auto mono" bind:value={selectedClassId}>
			{#each lms.courseClasses.slice(0, 3) as cls (cls.id)}
				{@const crs = lms.courses.find((c) => c.id === cls.course_id)}
				<option value={cls.id}>{cls.class_code} — {crs?.name}</option>
			{/each}
		</select>
		<button type="button" class="btn btn-outline-primary" onclick={exportSiakadCsv}>
			<i class="bi bi-file-earmark-spreadsheet me-1" aria-hidden="true"></i>Ekspor CSV SIAKAD
		</button>
		{#if !isClassLocked}
			<button
				type="button"
				class="btn btn-primary"
				disabled={totalWeight !== 100}
				onclick={() => (confirmFinalizeOpen = true)}
			>
				<i class="bi bi-lock-fill me-1" aria-hidden="true"></i>Finalisasi Nilai
			</button>
		{/if}
	</div>
</div>

{#if isClassLocked}
	<div class="alert alert-success d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4" role="alert">
		<div>
			<i class="bi bi-lock-fill me-2" aria-hidden="true"></i>
			<strong>Nilai Kelas {currentClass.class_code} Telah Dikunci (AC-07).</strong> Semua kolom nilai kini bersifat baca-saja bagi dosen. Perubahan berikutnya hanya dapat dilakukan oleh Admin Akademik dengan alasan tertulis di <a href="/admin/reports?tab=override" class="alert-link">Layar S20</a>.
		</div>
		<button type="button" class="btn btn-outline-success btn-sm flex-shrink-0" onclick={unlockForDemo}>
			Buka Kunci (Mode Demo)
		</button>
	</div>
{/if}

{#if weightError}
	<div class="alert alert-danger" role="alert">{weightError}</div>
{/if}

<!-- Panel Pengaturan Bobot Komponen (BR-04: Total harus 100%) -->
<section class="card shadow-sm mb-4" aria-labelledby="heading-bobot">
	<div class="card-body p-3 p-lg-4">
		<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
			<div>
				<h2 id="heading-bobot" class="h4 mb-1">Komponen dan Bobot Penilaian (BR-04)</h2>
				<p class="small text-muted-upl mb-0">
					Total bobot seluruh komponen pada satu kelas harus tepat 100%.
				</p>
			</div>
			<div>
				<span class="badge rounded-pill {totalWeight === 100 ? 'text-bg-success' : 'text-bg-danger'} fs-6 px-3 py-2 tabular-nums">
					Total: {totalWeight}%
				</span>
			</div>
		</div>

		<form onsubmit={handleSaveWeights}>
			<div class="row g-3 align-items-end">
				{#each classComponents as comp (comp.id)}
					<div class="col-6 col-md-2">
						<label for="weight-{comp.id}" class="form-label">
							{comp.name} (%)
						</label>
						<input
							id="weight-{comp.id}"
							type="number"
							min="0"
							max="100"
							class="form-control tabular-nums {totalWeight !== 100 ? 'is-invalid' : ''}"
							bind:value={editableWeights[comp.id]}
							disabled={isClassLocked}
						/>
					</div>
				{/each}
				<div class="col-12 col-md-2">
					<button
						type="submit"
						class="btn btn-primary w-100"
						disabled={isClassLocked || totalWeight !== 100}
					>
						Simpan bobot
					</button>
				</div>
			</div>
			{#if totalWeight !== 100}
				<div class="text-danger small mt-2" role="alert">
					Total bobot saat ini {totalWeight}%. Sesuaikan agar tepat 100% sebelum menyimpan.
				</div>
			{/if}
		</form>
	</div>
</section>

<!-- Tabel Rekap Nilai Akhir Semester (PRD Lampiran A.9) -->
<section class="card shadow-sm" aria-labelledby="heading-rekap">
	<div class="card-body p-3 p-lg-4">
		<h2 id="heading-rekap" class="h4 mb-3">
			Tabel Rekap Nilai Akhir — {currentClass.class_code} ({currentCourse?.name})
		</h2>

		<div class="table-responsive">
			<table class="table table-hover align-middle mb-0">
				<caption class="visually-hidden">Rekap nilai mahasiswa kelas {currentClass.class_code}</caption>
				<thead class="table-light">
					<tr>
						<th scope="col">NIM</th>
						<th scope="col">Nama</th>
						{#each classComponents as comp (comp.id)}
							<th scope="col" class="text-end">{comp.name} ({comp.weight}%)</th>
						{/each}
						<th scope="col" class="text-end">Nilai Akhir</th>
						<th scope="col" class="text-center">Huruf</th>
					</tr>
				</thead>
				<tbody class="tabular-nums">
					{#each classEnrollments as enr (enr.id)}
						{@const st = lms.students.find((s) => s.id === enr.student_id)}
						<tr>
							<td class="mono">{st?.nim}</td>
							<td class="fw-medium">{st?.full_name}</td>
							{#each classComponents as comp (comp.id)}
								{@const val = getScore(enr.id, comp.id)}
								<td class="text-end" style="min-width: 105px;">
									{#if !isClassLocked}
										<input
											type="number"
											min="0"
											max="100"
											aria-label="Nilai {comp.name} {st?.full_name}"
											class="form-control form-control-sm text-end tabular-nums ms-auto"
											style="max-width: 90px;"
											value={val}
											onchange={(e) =>
												handleScoreChange(enr.id, comp.id, (e.target as HTMLInputElement).value)}
										/>
									{:else}
										<span>{formatScore(val, 0)}</span>
									{/if}
								</td>
							{/each}
							<td class="text-end fw-bold fs-6 text-primary">
								{formatScore(enr.final_score)}
							</td>
							<td class="text-center">
								<span class="badge rounded-pill text-bg-success fs-6 px-3">
									{enr.letter_grade}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>

<!-- Modal Konfirmasi Finalisasi Nilai sesuai microcopy desain.md §9 -->
{#if confirmFinalizeOpen}
	<div class="modal-backdrop fade show"></div>
	<div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="modal-lock-title">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h2 id="modal-lock-title" class="h5 modal-title">
						Kunci nilai {currentClass.class_code}?
					</h2>
					<button
						type="button"
						class="btn-close"
						aria-label="Tutup"
						onclick={() => (confirmFinalizeOpen = false)}
					></button>
				</div>
				<div class="modal-body">
					<p class="mb-0">
						Kunci nilai <strong>{currentClass.class_code}</strong>? Setelah dikunci, nilai hanya dapat diubah admin akademik dengan alasan tertulis.
					</p>
				</div>
				<div class="modal-footer">
					<button
						type="button"
						class="btn btn-outline-secondary"
						onclick={() => (confirmFinalizeOpen = false)}
					>
						Batal
					</button>
					<button type="button" class="btn btn-primary" onclick={handleConfirmFinalize}>
						Kunci nilai
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

