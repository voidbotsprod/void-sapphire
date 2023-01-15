import { HttpCodes, methods, Route } from '@sapphire/plugin-api';
import { Time } from '@sapphire/time-utilities';
import { RateLimitManager } from '@sapphire/ratelimits';
import { isRateLimited } from '#lib/functions';

export class MainRoute extends Route {
	rateLimitTime = Time.Second * 5;

	rateLimitManager = new RateLimitManager(Time.Second * 5, 1);

	constructor(context, options) {
		super(context, {
			...options,
			route: ''
		});
	}

	[methods.GET](request, response) {
		const BASE_URL = 'http://localhost:4000';

		if (
			isRateLimited({
				time: this.rateLimitTime,
				request,
				response,
				manager: this.rateLimitManager
			})
		)
			return response.error(HttpCodes.TooManyRequests);

		response.json({
			current_location: BASE_URL
		});
	}
}
