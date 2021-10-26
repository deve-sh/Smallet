/**
 * Common App Layout
 */

import { FunctionComponent } from "react";
import { ChakraProvider } from "@chakra-ui/react";

import GlobalStyles from "./GlobalStyles";
import Header from "./Header";

import useStore from "../../hooks/useStore";

const AppLayout: FunctionComponent = ({ children }) => {
	const isDarkModeActive = useStore((store) => store.isDarkModeActive);

	return (
		<ChakraProvider>
			<GlobalStyles darkMode={isDarkModeActive} />
			<Header />
			{children}
		</ChakraProvider>
	);
};

export default AppLayout;
