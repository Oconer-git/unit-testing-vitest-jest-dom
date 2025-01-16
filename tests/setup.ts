import { useAuth0, User } from "@auth0/auth0-react";
import "@testing-library/jest-dom/vitest";
import ResizeObserver from "resize-observer-polyfill";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./mocks/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock("@auth0/auth0-react");

global.ResizeObserver = ResizeObserver;

window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();

Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(), // deprecated
		removeListener: vi.fn(), // deprecated
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

type AuthState = {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: User | undefined;
};

export const mockAuthState = (authState: AuthState) => {
	vi.mocked(useAuth0).mockReturnValue({
		...authState,
		getAccessTokenSilently: vi.fn().mockResolvedValue("a"),
		getAccessTokenWithPopup: vi.fn(),
		getIdTokenClaims: vi.fn(),
		loginWithRedirect: vi.fn(),
		loginWithPopup: vi.fn(),
		logout: vi.fn(),
		handleRedirectCallback: vi.fn(),
	});
};
