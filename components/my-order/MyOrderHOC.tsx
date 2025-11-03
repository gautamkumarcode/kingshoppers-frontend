import dynamic from "next/dynamic";

const MyOrderPage = dynamic(() => import("./MyOrder"), {
	ssr: true,
});

const MyOrderHOC = () => {
	return <MyOrderPage />;
};

export default MyOrderHOC;
