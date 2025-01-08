import { http, HttpResponse } from "msw";

export const handlers = [
	http.get("/categories", () => {
		return HttpResponse.json([
			{ id: 1, name: "Electronics" },
			{ id: 2, name: "Beauty" },
			{ id: 3, name: "Gardening" },
		]);
	}),

	http.get("/products", () => {
		return HttpResponse.json([
			{ id: 1, name: "Cake" },
			{ id: 2, name: "Bread" },
			{ id: 3, name: "Taco" },
		]);
	}),

	http.get("products/:[id]", ({ params }) => {
		const { id } = params;

		return HttpResponse.json({
			id: id,
			name: "Coffee",
			price: 13,
		});
	}),
];
