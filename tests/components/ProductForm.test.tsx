import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductForm from "../../src/components/ProductForm";
import { Category, Product } from "../../src/entities";
import AllProviders from "../AllProviders";
import { db } from "../mocks/db";

describe("ProductForm", () => {
	const categories: Category[] = [];
	const categoriesId: number[] = [];

	it("should render form fields", async () => {
		const { waitForFormToLoad } = renderComponent();

		const { nameInput, priceInput, categoryInput } =
			await waitForFormToLoad();

		expect(nameInput).toBeInTheDocument();
		expect(priceInput).toBeInTheDocument();
		expect(categoryInput).toBeInTheDocument();
	});

	it("should populate form fields when editing", async () => {
		const product: Product = {
			id: 1,
			name: "Bread",
			price: 123,
			categoryId: categoriesId[0],
		};
		const { waitForFormToLoad } = renderComponent(product);

		const { nameInput, priceInput, categoryInput } =
			await waitForFormToLoad();

		expect(nameInput).toHaveValue(product.name);
		expect(priceInput).toHaveValue(product.price.toString());
		expect(categoryInput).toHaveTextContent(categories[0].name);
	});

	it("should render categories", async () => {
		const { waitForFormToLoad } = renderComponent();

		const form = await waitForFormToLoad();
		const button = form.categoryInput;
		expect(button).toBeInTheDocument();
		const user = userEvent.setup();
		await user.click(button);

		categories.forEach((category) =>
			expect(
				screen.getByRole("option", { name: category.name })
			).toBeInTheDocument()
		);
	});

	it("should put focus on the name field", async () => {
		const { waitForFormToLoad } = renderComponent();

		const form = await waitForFormToLoad();

		expect(form.nameInput).toHaveFocus();
	});

	it.each([
		{ scenario: "missing", errorMessage: /required/ },
		{
			scenario: "more than 255 characters",
			name: "a".repeat(256),
			errorMessage: /255/,
		},
	])(
		"should display an error if name is $scenario",
		async ({ name, errorMessage }) => {
			const { waitForFormToLoad } = renderComponent();

			const form = await waitForFormToLoad();
			const user = userEvent.setup();
			if (name !== undefined) await user.type(form.nameInput, name);
			await user.type(form.priceInput, "10");
			await user.click(form.categoryInput);
			const options = screen.getAllByRole("option");
			await user.click(options[0]);
			await user.click(form.submitButton);

			const error = screen.getByRole("alert");
			expect(error).toBeInTheDocument();
			expect(error).toHaveTextContent(errorMessage);
		}
	);

	beforeAll(() => {
		[1, 2, 3].forEach((item) => {
			const category = db.category.create({ name: "category" + item });
			categories.push(category);
			categoriesId.push(category.id);
		});
	});

	afterAll(() => {
		db.category.deleteMany({ where: { id: { in: categoriesId } } });
	});

	const renderComponent = (product?: Product) => {
		render(<ProductForm product={product} onSubmit={vi.fn()} />, {
			wrapper: AllProviders,
		});

		return {
			waitForFormToLoad: async () => {
				await screen.findByRole("form");
				return {
					nameInput: screen.getByPlaceholderText(/name/i),
					priceInput: screen.getByPlaceholderText(/price/i),
					categoryInput: screen.getByRole("combobox", {
						name: /category/i,
					}),
					submitButton: screen.getByRole("button"),
				};
			},
		};
	};
});
