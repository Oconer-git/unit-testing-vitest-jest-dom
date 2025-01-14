import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuantitySelector from "../../src/components/QuantitySelector";
import { Product } from "../../src/entities";
import AllProviders from "../AllProviders";
import { db } from "../mocks/db";

describe("QuantitySelector", () => {
	let product: Product;

	beforeAll(() => {
		product = db.product.create();
	});
	afterAll(() => {
		db.product.delete({ where: { id: { equals: product.id } } });
	});

	const renderComponent = () => {
		render(<QuantitySelector product={product} />, {
			wrapper: AllProviders,
		});

		return {
			addToCartButton: screen.getByRole("button", {
				name: /Add to Cart/i,
			}),
			getQuantity: () => screen.getByRole("status"),
			getIncrementButton: () => screen.getByRole("button", { name: "+" }),
			getDecrementButton: () => screen.getByRole("button", { name: "-" }),
			user: userEvent.setup(),
		};
	};

	it("should render add to cart button", () => {
		const { addToCartButton } = renderComponent();

		expect(addToCartButton).toBeInTheDocument();
	});

	it("should add product to cart", async () => {
		const {
			addToCartButton,
			getIncrementButton,
			getDecrementButton,
			getQuantity,
			user,
		} = renderComponent();

		await user.click(addToCartButton);

		expect(getQuantity()).toHaveTextContent("1");
		expect(getIncrementButton()).toBeInTheDocument();
		expect(getDecrementButton()).toBeInTheDocument();
		expect(addToCartButton).not.toBeInTheDocument();
	});

	it("should increase number of order when plus is clicked", async () => {
		let order = 1;
		const { addToCartButton, getIncrementButton, getQuantity, user } =
			renderComponent();

		await user.click(addToCartButton);
		await user.click(getIncrementButton());
		order++; //1+1 = 2

		expect(getQuantity()).toHaveTextContent("2");
	});

	it("should decrease number of order when minus is clicked", async () => {
		let order = 1;
		const {
			addToCartButton,
			getIncrementButton,
			getDecrementButton,
			getQuantity,
			user,
		} = renderComponent();

		await user.click(addToCartButton);
		await user.click(getIncrementButton());
		order++; //1+1 = 2

		await user.click(getDecrementButton());
		order--; //2-1 = 1

		const status = getQuantity();
		expect(status).toHaveTextContent("1");
	});

	it("should go back to add to cart button when order reached 0", async () => {
		let order = 1;
		const {
			addToCartButton,
			getDecrementButton,
			getQuantity,
			getIncrementButton,
			user,
		} = renderComponent();

		await user.click(addToCartButton);

		await user.click(getDecrementButton());
		order--; //1-1 = 0

		const newButton = screen.getByRole("button", { name: "Add to Cart" });
		expect(newButton).toBeInTheDocument();
		expect(getQuantity()).not.toBeInTheDocument();
		expect(getIncrementButton()).not.toBeInTheDocument();
		expect(getDecrementButton()).not.toBeInTheDocument();
	});
});
