import { http, HttpResponse } from "msw";
import { categories, products } from "./data";
import { db } from "./db";

export const handlers = [
	http.get("/categories", () => {
		return HttpResponse.json(categories);
	}),

	...db.product.toHandlers("rest"),
];
