import { render, screen } from "@testing-library/react";
import UserAccount from "../../src/components/UserAccount";

describe("UserAccount", () => {
	const admin = { id: 1, name: "Donell", isAdmin: true };
	const normalUser = { id: 2, name: "James" };

	it("should render edit button when user is admin", () => {
		render(<UserAccount user={admin} />);
		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
		expect(button).toHaveTextContent(/Edit/);
	});

	it("should not render edit button when user isn't admin", () => {
		render(<UserAccount user={normalUser} />);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("should render name of user", () => {
		render(<UserAccount user={normalUser} />);
		expect(screen.getByText(normalUser.name)).toBeInTheDocument();
	});
});
