import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json({
		status: 'ok',
		service: 'PelitaLearn LMS Universitas Pelita Bangsa',
		version: '1.0.0',
		timezone: 'Asia/Jakarta',
		timestamp: new Date().toISOString()
	});
};

