import { screen, render } from "@testing-library/react";
import Greet from "../../src/components/Greet";

describe("Greet", () => {
	it("should render button", () => {
		render(<Greet />);
		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
		expect(button).toHaveTextContent(/Login/i);
	});
});
