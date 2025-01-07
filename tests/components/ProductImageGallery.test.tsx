import { render, screen } from "@testing-library/react";
import ProductImageGallery from "../../src/components/ProductImageGallery";

describe("ProductImageGallery", () => {
	it("should not render when imageUrls array is empty", () => {
		const { container } = render(<ProductImageGallery imageUrls={[]} />);
		expect(container).toBeEmptyDOMElement();
	});

	it("should render when there are imageUrls", () => {
		const imageUrls = ["space.jpg", "moon.jpg"];
		render(<ProductImageGallery imageUrls={imageUrls} />);

		const images = screen.getAllByRole("img");
		expect(images).toHaveLength(2);

		imageUrls.forEach((url, index) => {
			expect(images[index]).toHaveAttribute("src", `${url}`);
		});
	});
});
