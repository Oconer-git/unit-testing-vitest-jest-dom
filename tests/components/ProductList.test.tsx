import {
	render,
	screen,
	waitForElementToBeRemoved,
} from "@testing-library/react";
import ProductList from "../../src/components/ProductList";
import { http, HttpResponse, delay } from "msw";
import { server } from "../mocks/server";
import { beforeAll, afterAll } from "vitest";
import { db } from "../mocks/db";

describe("ProductList", () => {
	const productIds: number[] = [];

	beforeAll(() => {
		[1, 2, 3].forEach(() => {
			const product = db.product.create();
			productIds.push(product.id);
		});
	});

	afterAll(() => {
		db.product.deleteMany({ where: { id: { in: productIds } } });
	});

	it("should render the lists of products", async () => {
		render(<ProductList />);

		const lists = await screen.findAllByRole("listitem");
		expect(lists.length).toBeGreaterThan(0);
	});

	it("should render no products available if there is no product", async () => {
		server.use(http.get("/products", () => HttpResponse.json([])));
		render(<ProductList />);

		const message = await screen.findByText(/no products/i);
		expect(message).toBeInTheDocument();
	});

	it("should render an error message when there is error", async () => {
		server.use(http.get("/products", () => HttpResponse.error()));
		render(<ProductList />);

		const message = await screen.findByText(/error/i);
		expect(message).toBeInTheDocument();
	});

	it("should render loading message when fetching data", async () => {
		server.use(
			http.get("/products", async () => {
				await delay();
				return HttpResponse.json([]);
			})
		);

		render(<ProductList />);

		expect(await screen.findByText(/loading/i)).toBeInTheDocument();
	});

	it("should remove the loading indicator after the data is fetched", async () => {
		render(<ProductList />);

		await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
	});
});
