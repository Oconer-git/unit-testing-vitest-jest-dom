import { render, screen } from "@testing-library/react";
import SearchBox from "../../src/components/SearchBox";
import userEvent from "@testing-library/user-event";

describe("Searchbox", () => {
	const renderSearchBox = () => {
		const onChange = vi.fn();
		render(<SearchBox onChange={onChange} />);
		return {
			input: screen.getByPlaceholderText(/search/i),
			user: userEvent.setup(),
			onChange,
		};
	};

	it("should render searchbox", () => {
		const { input } = renderSearchBox();

		expect(input).toBeInTheDocument();
	});

	it("should call onChange when enter is pressed", async () => {
		const { user, input, onChange } = renderSearchBox();

		const searchTerm = "searchTerm";
		await user.type(input, searchTerm + "{enter}");

		expect(onChange).toHaveBeenCalledWith(searchTerm);
	});

	it("should not call onChange when input field is empty", async () => {
		const { user, input, onChange } = renderSearchBox();

		await user.type(input, "{enter}");

		expect(onChange).not.toHaveBeenCalledWith();
	});
});
