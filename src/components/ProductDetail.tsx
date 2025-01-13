import axios from "axios";
import { useQuery } from "react-query";
import { Product } from "../entities";

const ProductDetail = ({ productId }: { productId: number }) => {
	const fetchProduct = (productId: number) => {
		return axios
			.get<Product>(`products/${productId}`)
			.then((res) => res.data);
	};
	const {
		data: product,
		isLoading,
		error,
	} = useQuery<Product, Error>({
		queryKey: ["productId", productId],
		queryFn: () => fetchProduct(productId),
	});

	if (!productId) return <div>Invalid productId</div>;

	if (isLoading) return <div>Loading...</div>;

	if (error) return <div>Error: {error.message}</div>;

	if (!product) return <div>The given product was not found.</div>;

	return (
		<div>
			<h1>Product Detail</h1>
			<div>Name: {product.name}</div>
			<div>Price: ${product.price}</div>
		</div>
	);
};

export default ProductDetail;
