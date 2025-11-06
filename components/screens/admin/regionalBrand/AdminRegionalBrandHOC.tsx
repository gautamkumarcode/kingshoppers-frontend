import dynamic from "next/dynamic";

const AdminRegionalBrandPage = dynamic(() => import("./AdminRegionalBrand"), {
	ssr: true,
});

const AdminRegionalBrandHOC = () => {
	return <AdminRegionalBrandPage />;
};

export default AdminRegionalBrandHOC;
