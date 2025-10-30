import dynamic from "next/dynamic";

const RegisterPage = dynamic(() => import("./Register"), {
	ssr: true,
	loading: () => <p>Loading...</p>,
});
const RegisterHOC = () => {
	return <RegisterPage />;
};

export default RegisterHOC;
