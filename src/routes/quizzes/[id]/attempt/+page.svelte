<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { lms } from '$lib/store.svelte';
	import { formatDateTimeWib, formatScore } from '$lib/format';

	const quizId = $derived(Number(page.params.id) || 1);
	const quiz = $derived(lms.quizzes.find((q) => q.id === quizId) ?? lms.quizzes[0]);
	const courseClass = $derived(
		lms.courseClasses.find((c) => c.id === quiz?.course_class_id) ?? lms.courseClasses[0]
	);
	const questions = $derived(lms.quizQuestions.filter((q) => q.quiz_id === quiz.id));

	const student = $derived(lms.currentStudent);
	const enrollment = $derived(
		student
			? lms.enrollments.find(
					(e) => e.course_class_id === courseClass.id && e.student_id === student.id
				) ?? lms.enrollments[0]
			: lms.enrollments[0]
	);

	let currentIndex = $state(0);
	let remainingSeconds = $state(20 * 60);
	let autosaveStatus = $state('Tersimpan otomatis');
	let confirmModalOpen = $state(false);
	let simulatedOffline = $state(false);
	let timeWarningLive = $state('');

	const attempt = $derived(
		lms.quizAttempts.find(
			(a) => a.quiz_id === quiz.id && a.enrollment_id === enrollment?.id
		)
	);

	const currentQuestion = $derived(questions[currentIndex] ?? questions[0]);

	function ensureAttemptStarted() {
		if (!enrollment) return;
		const att = lms.startOrResumeQuizAttempt(quiz.id, enrollment.id);
		syncRemainingTime(att.deadline_at);
	}

	function syncRemainingTime(deadlineIso: string) {
		const diff = Math.floor((new Date(deadlineIso).getTime() - Date.now()) / 1000);
		remainingSeconds = Math.max(0, diff);
	}

	onMount(() => {
		ensureAttemptStarted();

		const timer = setInterval(() => {
			if (!attempt || attempt.status !== 'in_progress') return;
			syncRemainingTime(attempt.deadline_at);

			if (remainingSeconds === 300) {
				timeWarningLive = 'Perhatian: waktu pengerjaan kuis tersisa 5 menit.';
			} else if (remainingSeconds === 60) {
				timeWarningLive = 'Perhatian: waktu pengerjaan kuis tersisa 1 menit.';
			}

			// BR-09: Saat waktu habis jawaban terkirim otomatis
			if (remainingSeconds <= 0) {
				lms.submitQuizAttempt(attempt.id);
			}
		}, 1000);

		// FR-KUI-04: Autosave tiap 15 detik
		const autosaveTimer = setInterval(() => {
			if (!attempt || attempt.status !== 'in_progress' || simulatedOffline) return;
			lms.persist();
			const now = new Date();
			const hh = String(now.getHours()).padStart(2, '0');
			const mm = String(now.getMinutes()).padStart(2, '0');
			const ss = String(now.getSeconds()).padStart(2, '0');
			autosaveStatus = `Tersimpan otomatis (${hh}.${mm}.${ss} WIB)`;
		}, 15000);

		return () => {
			clearInterval(timer);
			clearInterval(autosaveTimer);
		};
	});

	function selectAnswer(questionId: number, optionKey: string) {
		if (!attempt || attempt.status !== 'in_progress') return;
		lms.autosaveQuizAnswer(attempt.id, questionId, optionKey);
		if (simulatedOffline) {
			autosaveStatus = 'Tersimpan di penyangga lokal (menunggu koneksi...)';
		} else {
			const now = new Date();
			const hh = String(now.getHours()).padStart(2, '0');
			const mm = String(now.getMinutes()).padStart(2, '0');
			const ss = String(now.getSeconds()).padStart(2, '0');
			autosaveStatus = `Tersimpan otomatis (${hh}.${mm}.${ss} WIB)`;
		}
	}

	function goToQuestion(idx: number) {
		if (idx < 0 || idx >= questions.length) return;
		currentIndex = idx;
		if (!simulatedOffline) {
			lms.persist();
		}
	}

	function handleConfirmSubmit() {
		if (!attempt) return;
		confirmModalOpen = false;
		lms.submitQuizAttempt(attempt.id);
	}

	function resetQuizForDemo() {
		if (!attempt) return;
		lms.quizAttempts = lms.quizAttempts.filter((a) => a.id !== attempt.id);
		lms.persist();
		currentIndex = 0;
		ensureAttemptStarted();
		lms.addToast('Percobaan kuis direset untuk simulasi ulang.', 'info');
	}

	function formatCountdown(sec: number): string {
		const m = Math.floor(sec / 60);
		const s = sec % 60;
		return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}

	const answeredCount = $derived(
		attempt ? Object.keys(attempt.answers).length : 0
	);
</script>

<svelte:head>
	<title>{quiz.title} (S07) — PelitaLearn</title>
</svelte:head>

<!-- Pengumuman suara untuk pembaca layar pada sisa 5 dan 1 menit (desain.md §10) -->
<div class="visually-hidden" aria-live="assertive">{timeWarningLive}</div>

<nav aria-label="Jejak halaman" class="mb-2">
	<ol class="breadcrumb mb-0 small">
		<li class="breadcrumb-item"><a href="/classes">Kelas Saya</a></li>
		<li class="breadcrumb-item"><a href="/classes/{courseClass.id}" class="mono">{courseClass.class_code}</a></li>
		<li class="breadcrumb-item active" aria-current="page">{quiz.code}</li>
	</ol>
</nav>

<!-- Bilah Atas Kuis: Judul + Penghitung Waktu + Indikator Tersimpan Otomatis (desain.md §8 S07) -->
<div class="card shadow-sm mb-4">
	<div class="card-body p-3 p-lg-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
		<div>
			<div class="d-flex align-items-center gap-2 mb-1">
				<span class="badge rounded-pill text-bg-primary mono">{quiz.code}</span>
				<span class="small text-muted-upl" aria-live="polite">
					<i class="bi {simulatedOffline ? 'bi-wifi-off text-warning' : 'bi-cloud-check-fill text-success'} me-1" aria-hidden="true"></i>
					{autosaveStatus}
				</span>
			</div>
			<h1 class="h3 mb-0">{quiz.title}</h1>
		</div>

		{#if attempt?.status === 'in_progress'}
			<div class="d-flex align-items-center gap-3">
				<div
					class="px-3 py-2 rounded-3 border {remainingSeconds <= 120 ? 'text-bg-danger' : 'bg-light'} text-center"
				>
					<div class="small text-uppercase" style="font-size: 0.7rem;">Sisa Waktu Server</div>
					<div class="mono fs-4 fw-bold tabular-nums">{formatCountdown(remainingSeconds)}</div>
				</div>
				<button
					type="button"
					class="btn btn-primary"
					onclick={() => (confirmModalOpen = true)}
				>
					Kirim kuis
				</button>
			</div>
		{:else if attempt?.status === 'submitted'}
			<div class="d-flex align-items-center gap-2">
				<span class="badge rounded-pill text-bg-success fs-5 px-3 py-2 tabular-nums">
					Skor: {formatScore(attempt.score)} / 100
				</span>
				<button type="button" class="btn btn-outline-secondary btn-sm" onclick={resetQuizForDemo}>
					Ulangi Simulasi Kuis
				</button>
			</div>
		{/if}
	</div>
</div>

{#if simulatedOffline}
	<div class="alert alert-warning d-flex justify-content-between align-items-center mb-3" role="alert">
		<div>
			<strong>Simulasi Koneksi Terputus (AC-06):</strong> Jawaban Anda tetap disimpan di penyimpanan lokal dan penghitung waktu akan disinkronkan kembali dengan waktu server saat koneksi pulih.
		</div>
		<button
			type="button"
			class="btn btn-warning btn-sm flex-shrink-0"
			onclick={() => {
				simulatedOffline = false;
				if (attempt) syncRemainingTime(attempt.deadline_at);
				autosaveStatus = 'Koneksi pulih · Disinkronkan dengan server';
				lms.addToast('Koneksi pulih! Jawaban tersimpan dan waktu dilanjutkan dari waktu server (AC-06).', 'success');
			}}
		>
			Pulihkan Koneksi Sekarang
		</button>
	</div>
{/if}

{#if attempt?.status === 'submitted'}
	<!-- Hasil & Pembahasan Kuis -->
	<div class="card shadow-sm mb-4">
		<div class="card-body p-3 p-lg-4">
			<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
				<div>
					<h2 class="h4 mb-1">Hasil Evaluasi Otomatis (FR-KUI-03)</h2>
					<p class="small text-muted-upl mb-0">
						Dikirim pada {formatDateTimeWib(attempt.submitted_at ?? '')} · Terjawab {answeredCount} dari {questions.length} soal.
					</p>
				</div>
				<a href="/classes/{courseClass.id}" class="btn btn-primary">Kembali ke Kelas</a>
			</div>

			<div class="vstack gap-3">
				{#each questions as q, idx (q.id)}
					{@const userAns = attempt.answers[q.id]}
					{@const isCorrect = userAns === q.answer_key}
					<div class="p-3 rounded-3 border {isCorrect ? 'border-success bg-light' : 'border-danger bg-light'}">
						<div class="d-flex justify-content-between align-items-center mb-2">
							<span class="fw-bold">Soal {idx + 1} ({q.points} poin)</span>
							<span class="badge rounded-pill {isCorrect ? 'text-bg-success' : 'text-bg-danger'}">
								{isCorrect ? 'Benar (+10)' : 'Kurang Tepat (0)'}
							</span>
						</div>
						<p class="fw-medium mb-2">{q.body}</p>
						<div class="small">
							<div>
								Jawaban Anda: <strong>{userAns ? `${userAns}. ${q.options.find((o) => o.key === userAns)?.text}` : 'Tidak dijawab'}</strong>
							</div>
							{#if !isCorrect}
								<div class="text-success fw-semibold mt-1">
									Kunci Jawaban: {q.answer_key}. {q.options.find((o) => o.key === q.answer_key)?.text}
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{:else if currentQuestion && attempt}
	<!-- Layar Pengerjaan Satu Soal per Layar + Navigasi Nomor Soal (desain.md §8 S07) -->
	<div class="row g-3">
		<div class="col-12 col-lg-8">
			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<div class="d-flex justify-content-between align-items-center mb-3">
						<span class="badge rounded-pill text-bg-light border text-dark fs-6">
							Soal {currentIndex + 1} dari {questions.length}
						</span>
						<span class="small text-muted-upl">{currentQuestion.points} poin</span>
					</div>

					<fieldset class="mb-4">
						<legend class="h5 mb-3">{currentQuestion.body}</legend>
						<div class="vstack gap-2">
							{#each currentQuestion.options as opt (opt.key)}
								{@const checked = attempt.answers[currentQuestion.id] === opt.key}
								<label
									for="q-{currentQuestion.id}-{opt.key}"
									class="p-3 rounded-3 border d-flex align-items-center gap-3 {checked ? 'bg-teal-subtle-upl border-primary fw-semibold' : 'bg-white'}"
									style="cursor: pointer;"
								>
									<input
										id="q-{currentQuestion.id}-{opt.key}"
										type="radio"
										name="question-{currentQuestion.id}"
										class="form-check-input mt-0"
										value={opt.key}
										checked={checked}
										onchange={() => selectAnswer(currentQuestion.id, opt.key)}
									/>
									<span>
										<strong class="mono me-1">{opt.key}.</strong> {opt.text}
									</span>
								</label>
							{/each}
						</div>
					</fieldset>

					<div class="d-flex justify-content-between align-items-center pt-3 border-top">
						<button
							type="button"
							class="btn btn-outline-secondary"
							disabled={currentIndex === 0}
							onclick={() => goToQuestion(currentIndex - 1)}
						>
							<i class="bi bi-arrow-left me-1" aria-hidden="true"></i>Soal sebelumnya
						</button>

						{#if currentIndex < questions.length - 1}
							<button
								type="button"
								class="btn btn-primary"
								onclick={() => goToQuestion(currentIndex + 1)}
							>
								Soal berikutnya<i class="bi bi-arrow-right ms-1" aria-hidden="true"></i>
							</button>
						{:else}
							<button
								type="button"
								class="btn btn-primary"
								onclick={() => (confirmModalOpen = true)}
							>
								Selesai & Kirim kuis
							</button>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Panel Navigasi Nomor Soal -->
		<div class="col-12 col-lg-4">
			<div class="card shadow-sm">
				<div class="card-body p-3 p-lg-4">
					<h2 class="h5 mb-2">Navigasi Nomor Soal</h2>
					<p class="small text-muted-upl mb-3">
						Terjawab: <strong>{answeredCount}</strong> dari <strong>{questions.length}</strong> soal
					</p>

					<div class="d-flex flex-wrap gap-2 mb-4">
						{#each questions as q, idx (q.id)}
							{@const isAnswered = Boolean(attempt.answers[q.id])}
							{@const isCurrent = idx === currentIndex}
							<button
								type="button"
								class="btn {isCurrent ? 'btn-primary' : isAnswered ? 'btn-success' : 'btn-outline-secondary'} mono tabular-nums"
								style="width: 46px; height: 46px;"
								aria-label="Ke soal nomor {idx + 1} ({isAnswered ? 'sudah dijawab' : 'belum dijawab'})"
								onclick={() => goToQuestion(idx)}
							>
								{idx + 1}
							</button>
						{/each}
					</div>

					<button
						type="button"
						class="btn btn-primary w-100 mb-3"
						onclick={() => (confirmModalOpen = true)}
					>
						Kirim kuis sekarang
					</button>

					<hr class="my-3" />
					<div class="small text-muted-upl mb-2">
						Uji Kriteria Penerimaan <strong>AC-06</strong> (koneksi putus lalu pulih):
					</div>
					<button
						type="button"
						class="btn btn-outline-warning text-dark btn-sm w-100"
						onclick={() => {
							simulatedOffline = !simulatedOffline;
							if (simulatedOffline) {
								autosaveStatus = 'Koneksi terputus (mode luring sementara)';
							}
						}}
					>
						<i class="bi bi-wifi-off me-1" aria-hidden="true"></i>
						{simulatedOffline ? 'Koneksi Sedang Terputus' : 'Simulasikan Koneksi Putus'}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Modal Konfirmasi Kirim Kuis -->
{#if confirmModalOpen}
	<div class="modal-backdrop fade show"></div>
	<div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="modal-kuis-title">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h2 id="modal-kuis-title" class="h5 modal-title">Kirim Jawaban Kuis?</h2>
					<button
						type="button"
						class="btn-close"
						aria-label="Tutup"
						onclick={() => (confirmModalOpen = false)}
					></button>
				</div>
				<div class="modal-body">
					<p class="mb-2">
						Anda telah menjawab <strong>{answeredCount} dari {questions.length} soal</strong>.
					</p>
					<p class="small text-muted-upl mb-0">
						Setelah dikirim, jawaban tidak dapat diubah lagi dan sistem akan langsung menghitung nilai otomatis Anda (BR-09).
					</p>
				</div>
				<div class="modal-footer">
					<button
						type="button"
						class="btn btn-outline-secondary"
						onclick={() => (confirmModalOpen = false)}
					>
						Periksa kembali
					</button>
					<button type="button" class="btn btn-primary" onclick={handleConfirmSubmit}>
						Kirim kuis
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

