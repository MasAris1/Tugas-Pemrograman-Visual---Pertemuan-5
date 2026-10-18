import { json } from '@sveltejs/kit';
import { createSeedData } from '$lib/seed';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const seed = createSeedData();
	const data = seed.courseClasses.map((cls) => {
		const course = seed.courses.find((c) => c.id === cls.course_id);
		const lecturer = seed.lecturers.find((l) => l.id === cls.lecturer_id);
		return {
			id: cls.id,
			class_code: cls.class_code,
			course_code: course?.code,
			course_name: course?.name,
			credits: course?.credits,
			lecturer_name: lecturer?.full_name,
			day_of_week: cls.day_of_week,
			starts_at: cls.starts_at,
			ends_at: cls.ends_at,
			room: cls.room,
			capacity: cls.capacity
		};
	});

	return json({
		data,
		meta: {
			current_page: 1,
			per_page: 20,
			total: data.length,
			academic_term: seed.academicTerms[0].name
		}
	});
};

