import { render, screen } from "@testing-library/react";
import AuthStatus from "../../src/components/AuthStatus";
import { mockAuthState } from "../setup";

describe.only("AuthStatus", () => {
	it("Should render the loading message while fetching the auth status", () => {
		mockAuthState({
			isLoading: true,
			isAuthenticated: false,
			user: undefined,
		});

		render(<AuthStatus />);

		expect(screen.getByText(/loading/i)).toBeInTheDocument();
	});

	it("Should render the login button if the user is not authenticated", () => {
		mockAuthState({
			isLoading: false,
			isAuthenticated: false,
			user: undefined,
		});

		render(<AuthStatus />);

		expect(
			screen.getByRole("button", { name: /log in/i })
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /log out/i })
		).not.toBeInTheDocument();
	});

	it("should render the user username if authenticated", () => {
		mockAuthState({
			isLoading: false,
			isAuthenticated: true,
			user: { name: "Donell" },
		});

		render(<AuthStatus />);

		expect(screen.getByText("Donell")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /log out/i }));
		expect(
			screen.queryByRole("button", { name: /log in/i })
		).not.toBeInTheDocument();
	});
});
