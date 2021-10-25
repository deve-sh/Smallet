import useStore from "../hooks/useStore";

const App = ({ Component, pageProps }) => {
	useStore();
	return <Component {...pageProps} />;
};

export default App;
