import dynamic from "next/dynamic";

type Props = {};

const AdminBrandAddPage = dynamic(() => import("./AddBrands"), {
	ssr: true,
});

const AddBrandsHOC = (props: Props) => {
	return <AdminBrandAddPage />;
};

export default AddBrandsHOC;
