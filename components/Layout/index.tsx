/**
 * Common App Layout
 */

import { ChakraProvider } from "@chakra-ui/react";

import GlobalStyles from "./GlobalStyles";
import Header from "./Header";
import AppContentContainer from "./AppContentContainer";

import useStore from "../../hooks/useStore";

const AppLayout = ({ children, logoutUser = () => null }) => {
	const isDarkModeActive = useStore((store) => store.isDarkModeActive);

	return (
		<ChakraProvider>
			<GlobalStyles darkMode={isDarkModeActive} />
			<Header logoutUser={logoutUser} />
			<AppContentContainer>{children}</AppContentContainer>
		</ChakraProvider>
	);
};

export default AppLayout;
