import Link from "next/link";
import {
	Box,
	Stack,
	Image,
	Button,
	IconButton,
	ButtonGroup,
} from "@chakra-ui/react";
import { useColorMode } from "@chakra-ui/color-mode";
import styled from "@emotion/styled";
import {
	MdAccountCircle as LoginIcon,
	MdLogout as LogoutIcon,
} from "react-icons/md";
import { FaMoon, FaSun } from "react-icons/fa";

import useStore from "../../hooks/useStore";

const AppHeader = styled(Box)`
	position: fixed;
	border-bottom: 0.075rem solid var(--backgroundgrey);
	padding: var(--mini-spacing);
	z-index: 101;
	background: var(--white);
`;

const Logo = styled(Image)`
	width: 32px;
	height: 32px;
`;

const Container = styled(Stack)`
	max-width: 1100px;
	margin: 0 auto;
`;

const Left = styled.div`
	width: 35%;
`;

const Right = styled(Left)`
	width: 65%;
	text-align: right;
`;

const Header = ({ openLoginModal = () => null, logoutUser = () => null }) => {
	const stateUser = useStore((state) => state.user);
	const isDarkModeActive = useStore((store) => store.isDarkModeActive);
	const toggleDarkMode = useStore((store) => store.toggleDarkMode);
	const { toggleColorMode } = useColorMode();

	const toggleDarkModeForApp = () => {
		toggleColorMode();
		toggleDarkMode(); // Store dark mode in global state as well.
	};

	return (
		<AppHeader w="100%" id="app-header" className="noprint">
			<Container direction="row">
				<Left>
					<Link href="/">
						<Logo src="/images/logo.png" alt="Smallet Logo" />
					</Link>
				</Left>
				<Right>
					<ButtonGroup spacing="3">
						<IconButton
							aria-label="Toggle Dark Mode"
							colorScheme={isDarkModeActive ? "yellow" : "teal"}
							variant="ghost"
							onClick={toggleDarkModeForApp}
						>
							{isDarkModeActive ? <FaSun /> : <FaMoon />}
						</IconButton>
						{!stateUser ? (
							<Button
								colorScheme="teal"
								variant="outline"
								leftIcon={<LoginIcon size="1.375rem" />}
								onClick={openLoginModal}
							>
								Login
							</Button>
						) : (
							<Button
								colorScheme="teal"
								variant="outline"
								leftIcon={<LogoutIcon size="1.375rem" />}
								onClick={logoutUser}
							>
								Logout
							</Button>
						)}
					</ButtonGroup>
				</Right>
			</Container>
		</AppHeader>
	);
};

export default Header;
