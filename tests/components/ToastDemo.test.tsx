import { render, screen } from "@testing-library/react";
import ToastDemo from "../../src/components/ToastDemo";
import { Toaster } from "react-hot-toast";
import userEvent from "@testing-library/user-event";

describe("ToastDemo", () => {
	it("should render toaster upon click", async () => {
		render(
			<>
				<ToastDemo />
				<Toaster />
			</>
		);

		const button = screen.getByRole("button");
		const user = userEvent.setup();

		await user.click(button);
		const toastbar = await screen.findByText(/success/i);
		expect(toastbar).toBeInTheDocument();
	});
});
