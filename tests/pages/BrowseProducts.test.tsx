import {
	render,
	screen,
	waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Category, Product } from "../../src/entities";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import AllProviders from "../AllProviders";
import { db, getProductsByCategory } from "../mocks/db";
import { simulateDelay, simulateError } from "../utils";

const categories: Category[] = [];
const products: Product[] = [];

const renderComponent = () => {
	render(<BrowseProducts />, { wrapper: AllProviders });

	const getProductsSkeleton = () =>
		screen.queryByRole("progressbar", { name: /products/i });

	const getCategoriesSkeleton = () =>
		screen.queryByRole("progressbar", { name: /categories/i });

	const getCategoriesCombobox = () => screen.queryByRole("combobox");

	const selectCategory = async (name: RegExp | string) => {
		await waitForElementToBeRemoved(getCategoriesSkeleton);
		const combobox = getCategoriesCombobox();
		expect(combobox).toBeInTheDocument();
		const user = userEvent.setup();
		await user.click(combobox!);

		const option = screen.getByRole("option", {
			name,
		});
		expect(option).toBeInTheDocument();
		await user.click(option);
	};

	const expectProductsTobeInTheDevelopment = (products: Product[]) => {
		const rows = screen.getAllByRole("row");
		const dataRows = rows.slice(1);
		expect(dataRows).toHaveLength(products.length);

		products.forEach((product) => {
			expect(screen.getByText(product.name)).toBeInTheDocument();
		});
	};

	return {
		getProductsSkeleton,
		getCategoriesSkeleton,
		getCategoriesCombobox,
		selectCategory,
		expectProductsTobeInTheDevelopment,
	};
};

describe.only("BrowseProducts", () => {
	it("should render loading skeleton when fetching categories for categories selector", () => {
		simulateDelay("/categories");

		const { getCategoriesSkeleton } = renderComponent();
		expect(getCategoriesSkeleton()).toBeInTheDocument();
	});

	it("should remove loading skeleton after categories are fetched", async () => {
		const { getCategoriesSkeleton } = renderComponent();
		await waitForElementToBeRemoved(getCategoriesSkeleton);
	});

	it("should render loading skeleton when fetching products", async () => {
		simulateDelay("/products");

		const { getProductsSkeleton } = renderComponent();
		expect(getProductsSkeleton());
	});

	it("should hide the loading skeleton after products are fetched", async () => {
		const { getProductsSkeleton } = renderComponent();
		await waitForElementToBeRemoved(getProductsSkeleton);
	});

	it("should not render an error if categories cannot be fetched", async () => {
		simulateError("/categories");

		const { getCategoriesCombobox, getCategoriesSkeleton } =
			renderComponent();

		await waitForElementToBeRemoved(getCategoriesSkeleton);

		expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
		expect(getCategoriesCombobox()).not.toBeInTheDocument();
	});

	it("should show error message when there is error on fetching products", async () => {
		simulateError("/products");
		renderComponent();

		expect(await screen.findByText(/error/i)).toBeInTheDocument();
	});

	it("should render categories", async () => {
		const { getCategoriesSkeleton, getCategoriesCombobox } =
			renderComponent();

		await waitForElementToBeRemoved(getCategoriesSkeleton);

		const combobox = getCategoriesCombobox();
		expect(combobox).toBeInTheDocument();

		const user = userEvent.setup();
		await user.click(combobox!);

		expect(
			screen.getByRole("option", { name: /all/i })
		).toBeInTheDocument();

		categories.forEach((category) => {
			expect(
				screen.getByRole("option", { name: category.name })
			).toBeInTheDocument();
		});
	});

	it("should render products", async () => {
		const { getProductsSkeleton, expectProductsTobeInTheDevelopment } =
			renderComponent();

		await waitForElementToBeRemoved(getProductsSkeleton);

		const products = db.product.getAll();
		expectProductsTobeInTheDevelopment(products);
	});

	it("should filter products by category", async () => {
		const { selectCategory, expectProductsTobeInTheDevelopment } =
			renderComponent();
		const selectedCategory = categories[0];

		await selectCategory(selectedCategory.name);

		const products = getProductsByCategory(selectedCategory.id);

		expectProductsTobeInTheDevelopment(products);
	});

	it("should render all products when All category is selected", async () => {
		const { selectCategory, expectProductsTobeInTheDevelopment } =
			renderComponent();

		await selectCategory(/all/i);

		const products = db.product.getAll();
		expectProductsTobeInTheDevelopment(products);
	});
});

beforeAll(() => {
	[1, 2, 3].forEach(() => {
		const category = db.category.create();
		categories.push(category);

		[1, 2].forEach(() => {
			const product = db.product.create({ categoryId: category.id });
			products.push(product);
		});
	});
});

afterAll(() => {
	const categoriesIds = categories.map((category) => category.id);
	db.category.deleteMany({ where: { id: { in: categoriesIds } } });

	const productsIds = products.map((product) => product.id);
	db.product.deleteMany({ where: { id: { in: productsIds } } });
});
