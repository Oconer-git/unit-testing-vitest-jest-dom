import { render, screen } from "@testing-library/react";
import ExpandableText from "../../src/components/ExpandableText";
import userEvent from "@testing-library/user-event";

describe("Expandable Text", () => {
	const limit = 255;
	const longText = "a".repeat(limit + 1);
	const truncatedText = longText.substring(0, limit) + "...";

	it("should render full text if less than 255 characters", () => {
		const shortText = "b".repeat(100);

		render(<ExpandableText text={shortText} />);
		expect(screen.getByText(shortText)).toBeInTheDocument();
	});

	it("should render expand button when text reach characters limit", () => {
		render(<ExpandableText text={longText} />);

		expect(screen.getByText(truncatedText)).toBeInTheDocument();
		const button = screen.getByRole("button");
		expect(button).toHaveTextContent(/more/i);
		expect(button).toBeInTheDocument();
	});

	it("should collapse text when show less button is clicked", async () => {
		render(<ExpandableText text={longText} />);
		const showMoreButton = screen.getByRole("button", { name: /more/i });
		const user = userEvent.setup();
		await user.click(showMoreButton);
		expect(screen.getByText(longText)).toBeInTheDocument();

		const showLessButton = screen.getByRole("button", { name: /less/i });
		await user.click(showLessButton);

		expect(screen.getByText(truncatedText)).toBeInTheDocument();
	});
});
