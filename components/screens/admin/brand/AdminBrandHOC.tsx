import dynamic from "next/dynamic";

const AdminBrandPage = dynamic(() => import("./AdminBrand"), {
	ssr: true,
});

const AdminBrandHOC = () => {
	return <AdminBrandPage />;
};

export default AdminBrandHOC;
