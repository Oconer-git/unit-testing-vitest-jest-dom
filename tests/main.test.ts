import { test, expect } from "vitest";

const add = (a: number, b: number) => {
	return a + b;
};

test("adds 1 and 2 into 3", () => {
	expect(add(1, 2)).toBe(3);
});
