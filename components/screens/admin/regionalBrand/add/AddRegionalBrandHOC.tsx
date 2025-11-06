import dynamic from "next/dynamic";

const AddRegionalBrandPage = dynamic(() => import("./AddRegionalBrand"), {
	ssr: true,
});

const AddRegionalBrandHOC = () => {
	return <AddRegionalBrandPage />;
};

export default AddRegionalBrandHOC;