import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "react-hot-toast";
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
		"should display an error if name field input is $scenario",
		async ({ name, errorMessage }) => {
			const { waitForFormToLoad, expectErrorToBeInTheDocument } =
				renderComponent();
			const form = await waitForFormToLoad();

			await form.fill({ ...form.formData, name });

			expectErrorToBeInTheDocument(errorMessage);
		}
	);

	it.each([
		{ scenario: "missing", errorMessage: /required/i },
		{
			scenario: "less than 1",
			price: 0,
			errorMessage: /1/,
		},
		{
			scenario: "negative",
			price: -1,
			errorMessage: /1/,
		},
		{
			scenario: "greater than 1000",
			price: 10001,
			errorMessage: /1000/,
		},
		{
			scenario: "not a number",
			price: "123x",
			errorMessage: /required/i,
		},
	])(
		"should display an error if price field input is $scenario",
		async ({ price, errorMessage }) => {
			const { waitForFormToLoad, expectErrorToBeInTheDocument } =
				renderComponent();

			const form = await waitForFormToLoad();
			await form.fill({ ...form.formData, price });

			expectErrorToBeInTheDocument(errorMessage);
		}
	);

	it("should display an error if category is 'missing'", async () => {
		const { waitForFormToLoad, expectErrorToBeInTheDocument } =
			renderComponent();

		const form = await waitForFormToLoad();
		const user = userEvent.setup();
		await user.type(form.nameInput, "James");
		await user.type(form.priceInput, "123");
		await user.click(form.submitButton);

		expectErrorToBeInTheDocument(/required/i);
	});

	it("should call onSubmit with the correct data", async () => {
		const { waitForFormToLoad, onSubmit } = renderComponent();

		const form = await waitForFormToLoad();
		await form.fill(form.formData);

		const { id, ...formData } = form.formData;
		expect(onSubmit).toHaveBeenCalledWith(formData);
	});

	it("should display a toast if submission fails", async () => {
		const { waitForFormToLoad, onSubmit } = renderComponent();
		onSubmit.mockRejectedValue({});

		const form = await waitForFormToLoad();
		await form.fill(form.formData);

		const toast = await screen.findByRole("status");
		expect(toast).toBeInTheDocument();
		expect(toast).toHaveTextContent(/error/i);
	});

	it("should disable the submit button upon submission", async () => {
		const { waitForFormToLoad, onSubmit } = renderComponent();

		onSubmit.mockReturnValue(new Promise(() => {}));
		const form = await waitForFormToLoad();
		await form.fill(form.formData);

		expect(form.submitButton).toBeDisabled();
	});

	it("should re-enable submit button after submission", async () => {
		const { waitForFormToLoad, onSubmit } = renderComponent();
		onSubmit.mockRejectedValue({});

		const form = await waitForFormToLoad();
		await form.fill(form.formData);

		expect(form.submitButton).not.toBeDisabled();
	});

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
		const onSubmit = vi.fn();
		render(
			<>
				<ProductForm product={product} onSubmit={onSubmit} />{" "}
				<Toaster />
			</>,
			{
				wrapper: AllProviders,
			}
		);

		return {
			onSubmit,
			expectErrorToBeInTheDocument: async (
				errorMessage: RegExp | string
			) => {
				const error = await screen.findByRole("alert");
				expect(error).toBeInTheDocument();
				expect(error).toHaveTextContent(errorMessage);
			},

			waitForFormToLoad: async () => {
				await screen.findByRole("form");

				const formData = {
					id: 1,
					name: "a",
					price: 1,
					categoryId: categoriesId[0],
				};

				const nameInput = screen.getByPlaceholderText(/name/i);
				const priceInput = screen.getByPlaceholderText(/price/i);
				const categoryInput = screen.getByRole("combobox", {
					name: /category/i,
				});
				const submitButton = screen.getByRole("button");

				type FormData = {
					[K in keyof Product]: any;
				};

				const fill = async (product: FormData) => {
					const user = userEvent.setup();
					if (product.name !== undefined)
						await user.type(nameInput, product.name);
					if (product.price !== undefined)
						await user.type(priceInput, product.price.toString());
					await user.tab();
					await user.click(categoryInput);
					const options = screen.getAllByRole("option");
					await user.click(options[0]);
					await user.click(submitButton);
				};

				return {
					nameInput,
					priceInput,
					categoryInput,
					submitButton,
					fill,
					formData,
				};
			},
		};
	};
});
