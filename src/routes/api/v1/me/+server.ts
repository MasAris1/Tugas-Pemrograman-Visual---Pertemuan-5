import { json } from '@sveltejs/kit';
import { createSeedData } from '$lib/seed';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const seed = createSeedData();
	const demoStudent = seed.students[0];
	return json({
		data: {
			id: 101,
			username: demoStudent.nim,
			full_name: demoStudent.full_name,
			email: demoStudent.email,
			role: 'student',
			student_profile: demoStudent
		}
	});
};

