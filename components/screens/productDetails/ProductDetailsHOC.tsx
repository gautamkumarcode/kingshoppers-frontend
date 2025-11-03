import dynamic from "next/dynamic";

const ProductDetailsPage = dynamic(() => import("./ProductDetails"), {
	ssr: true,
});
const ProductDetailsHOC = () => {
	return <ProductDetailsPage />;
};

export default ProductDetailsHOC;
