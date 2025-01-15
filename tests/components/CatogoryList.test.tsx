import {
	render,
	screen,
	waitForElementToBeRemoved,
} from "@testing-library/react";
import CategoryList from "../../src/components/CategoryList";
import { Category } from "../../src/entities";
import AllProviders from "../AllProviders";
import { db } from "../mocks/db";
import { simulateDelay, simulateError } from "../utils";

describe("CategoryList", () => {
	const categories: Category[] = [];
	const categoriesId: number[] = [];

	beforeAll(() => {
		[1, 2].forEach((item) => {
			const category = db.category.create({ name: "category" + item });
			categoriesId.push(category.id);
			categories.push(category);
		});
	});

	afterAll(() => {
		db.category.delete({ where: { id: { in: categoriesId } } });
	});
	const renderComponent = () => {
		render(<CategoryList />, { wrapper: AllProviders });
	};

	it("should render categories", async () => {
		renderComponent();

		await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

		categories.forEach((category) => {
			expect(screen.getByText(category.name)).toBeInTheDocument();
		});
	});

	it("should render a loading message when fetching categories", async () => {
		renderComponent();

		simulateDelay("/categories");

		expect(screen.getByText(/loading/i)).toBeInTheDocument();
	});

	it("should render an error message when fetching categories fails", async () => {
		renderComponent();

		simulateError("/categories");

		expect(screen.getByText(/loading/i)).toBeInTheDocument();
	});
});
