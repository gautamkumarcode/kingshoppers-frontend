import dynamic from "next/dynamic";

const LoginPage = dynamic(() => import("./Login"), {
	ssr: true,
	loading: () => <p>Loading...</p>,
});
const LoginHOC = () => {
	return <LoginPage />;
};

export default LoginHOC;
