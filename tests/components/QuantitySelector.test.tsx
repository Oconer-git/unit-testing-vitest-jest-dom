import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuantitySelector from "../../src/components/QuantitySelector";
import { Product } from "../../src/entities";
import AllProviders from "../AllProviders";

describe("QuantitySelector", () => {
	const product: Product = {
		id: 1,
		name: "Cake",
		price: 12,
		categoryId: 1,
	};

	const renderComponent = () => {
		render(<QuantitySelector product={product} />, {
			wrapper: AllProviders,
		});

		const user = userEvent.setup();

		const addToCartButton = () =>
			screen.queryByRole("button", { name: /Add to Cart/i });

		const getQuantityControls = () => ({
			quantity: screen.queryByRole("status"),
			incrementButton: screen.queryByRole("button", { name: "+" }),
			decrementButton: screen.queryByRole("button", { name: "-" }),
		});

		const addToCart = async () => {
			await user.click(addToCartButton()!);
		};

		const incrementQuantity = async () => {
			const { incrementButton } = getQuantityControls();
			await user.click(incrementButton!);
		};

		const decrementQuantity = async () => {
			const { decrementButton } = getQuantityControls();
			await user.click(decrementButton!);
		};

		return {
			addToCartButton,
			getQuantityControls,
			addToCart,
			incrementQuantity,
			decrementQuantity,

			user: userEvent.setup(),
		};
	};

	it("should render add to cart button", () => {
		const { addToCartButton } = renderComponent();

		expect(addToCartButton()).toBeInTheDocument();
	});

	it("should add product to cart", async () => {
		const { addToCartButton, getQuantityControls, addToCart } =
			renderComponent();

		await addToCart();

		const { quantity, incrementButton, decrementButton } =
			getQuantityControls();

		expect(quantity).toHaveTextContent("1");
		expect(incrementButton).toBeInTheDocument();
		expect(decrementButton).toBeInTheDocument();
		expect(addToCartButton()).not.toBeInTheDocument();
	});

	it("should increase number of order when plus is clicked", async () => {
		const { incrementQuantity, addToCart, getQuantityControls } =
			renderComponent();

		await addToCart();
		//order = 1
		const { quantity } = getQuantityControls();
		await incrementQuantity();
		//1 + 1 = 2

		expect(quantity).toBeInTheDocument();
		expect(quantity).toHaveTextContent("2");
	});

	it("should decrease number of order when minus is clicked", async () => {
		const {
			addToCart,
			incrementQuantity,
			decrementQuantity,
			getQuantityControls,
		} = renderComponent();

		await addToCart();
		//order = 1
		await incrementQuantity();
		//1+1 = 2
		await decrementQuantity();
		//2-1 = 1

		const { quantity } = getQuantityControls();
		expect(quantity).toHaveTextContent("1");
	});

	it("should remove product from the cart", async () => {
		const {
			addToCartButton,
			addToCart,
			decrementQuantity,
			getQuantityControls,
		} = renderComponent();

		await addToCart();
		// order = 1
		await decrementQuantity();
		//1-1 = 0

		const { quantity, incrementButton, decrementButton } =
			getQuantityControls();
		expect(addToCartButton()).toBeInTheDocument();
		expect(quantity).not.toBeInTheDocument();
		expect(incrementButton).not.toBeInTheDocument();
		expect(decrementButton).not.toBeInTheDocument();
	});
});
