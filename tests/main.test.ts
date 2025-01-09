import { faker } from "@faker-js/faker";
import { db } from "./mocks/db";

describe("group", () => {
	it("should", async () => {
		const response = await fetch("/categories");
		const data = await response.json();

		const product = db.product.create({ name: "cake" });
		console.log(
			db.product.delete({ where: { id: { equals: product.id } } })
		);
		console.log({
			name: faker.commerce.product(),
			price: faker.commerce.price(),
		});
		expect(data).toHaveLength(3);
	});
});
