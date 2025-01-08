import { render, screen } from "@testing-library/react";
import ProductList from "../../src/components/ProductList";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";

describe("ProductList", () => {
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
});
