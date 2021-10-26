/**
 * Common App Layout
 */

import {
	ChakraProvider,
	useDisclosure as useToggleableModal,
} from "@chakra-ui/react";

import GlobalStyles from "./GlobalStyles";
import Header from "./Header";
import AppContentContainer from "./AppContentContainer";

import useStore from "../../hooks/useStore";
import LoginModal from "../Authentication/LoginModal";

const AppLayout = ({ children, logoutUser = () => null }) => {
	const isDarkModeActive = useStore((store) => store.isDarkModeActive);

	// User Authentication
	const stateUser = useStore((store) => store.user);
	const {
		isOpen: showLoginModal,
		onOpen: openLoginModal,
		onClose: closeLoginModal,
	} = useToggleableModal();

	return (
		<ChakraProvider>
			<GlobalStyles darkMode={isDarkModeActive} />
			<Header logoutUser={logoutUser} openLoginModal={openLoginModal} />
			{!stateUser && (
				<LoginModal closeModal={closeLoginModal} isOpen={showLoginModal} />
			)}
			<AppContentContainer>{children}</AppContentContainer>
		</ChakraProvider>
	);
};

export default AppLayout;
