import {
	render,
	screen,
	waitForElementToBeRemoved,
} from "@testing-library/react";
import ProductDetail from "../../src/components/ProductDetail";
import { server } from "../mocks/server";
import { http, HttpResponse, delay } from "msw";
import { db } from "../mocks/db";
import { beforeAll, afterAll } from "vitest";
import AllProviders from "../AllProviders";

describe("ProductDetail", () => {
	let productId: number;

	beforeAll(() => {
		const product = db.product.create();
		productId = product.id;
	});

	afterAll(() => {
		db.product.delete({ where: { id: { equals: productId } } });
	});

	it("should render product detail", async () => {
		const product = db.product.findFirst({
			where: { id: { equals: productId } },
		});

		render(<ProductDetail productId={productId} />, {
			wrapper: AllProviders,
		});

		const productName = await screen.findByText(new RegExp(product!.name));
		const productPrice = await screen.findByText(
			new RegExp(product!.price.toString())
		);

		expect(productName).toBeInTheDocument();
		expect(productPrice).toBeInTheDocument();
	});

	it("should render product not found when there is no product", async () => {
		server.use(http.get("/products/1", () => HttpResponse.json(null)));
		render(<ProductDetail productId={1} />, { wrapper: AllProviders });

		const message = await screen.findByText(/not found/i);
		expect(message).toBeInTheDocument();
	});

	it("should render an error for invalid product id", async () => {
		render(<ProductDetail productId={0} />, { wrapper: AllProviders });

		const message = await screen.findByText(/invalid/i);
		expect(message).toBeInTheDocument();
	});

	it("should render an error if data fetching fails", async () => {
		server.use(http.get("/products/1", () => HttpResponse.error()));
		render(<ProductDetail productId={1} />, { wrapper: AllProviders });

		expect(await screen.findByText(/error/i)).toBeInTheDocument();
	});

	it("should render a loading indicator when fetching data", async () => {
		server.use(
			http.get("/products/1", async () => {
				await delay();
				HttpResponse.json([]);
			})
		);

		render(<ProductDetail productId={1} />, { wrapper: AllProviders });

		expect(await screen.findByText(/loading/i)).toBeInTheDocument;
	});

	it("should remove loading indicator after the data is fetched", async () => {
		render(<ProductDetail productId={1} />, { wrapper: AllProviders });

		await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
	});
});
