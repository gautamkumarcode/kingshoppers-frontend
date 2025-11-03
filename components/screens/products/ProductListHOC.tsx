import dynamic from "next/dynamic";

const ProductListPage = dynamic(() => import("./ProductList"), {
	ssr: true,
});

const ProductListHOC = () => {
	return <ProductListPage />;
};

export default ProductListHOC;
