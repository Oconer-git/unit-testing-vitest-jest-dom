import { delay, http, HttpResponse } from "msw";
import { server } from "./mocks/server";

export const simulateDelay = (endpoint: string) => {
	server.use(
		http.get(endpoint, async () => {
			await delay();
			HttpResponse.json([]);
		})
	);
};

export const simulateError = (endpoint: string) => {
	server.use(http.get(endpoint, async () => HttpResponse.error()));
};
