import Link from "next/link";
import {
	Container,
	Image,
	Heading,
	Box,
	Text,
	Button,
	HStack,
	Flex,
} from "@chakra-ui/react";
import styled from "@emotion/styled";
import { MdOutlineArrowForward } from "react-icons/md";
import { FaUser } from "react-icons/fa";

import ContentWrapper from "../components/Layout/ContentWrapper";

import useStore from "../hooks/useStore";

const HomeHeroSection = styled(Container)`
	padding-top: 1rem;
	min-height: 90vh;
`;

const HomeHeroImage = styled(Image)`
	max-width: 375px;
	margin: 0 auto;
`;

const HomeSecondSection = styled(HomeHeroSection)`
	background: var(--black);
	color: var(--white);
	min-height: auto;
	width: 100vw;
	margin: 0;
	max-width: 100vw;
	margin-inline-end: 0;
	margin-inline-start: 0;
`;

const HomeSecondSectionFlex = styled(Flex)`
	width: 100%;
	@media (max-width: 768px) {
		flex-direction: column;
	}
`;

export default function Home({ openLoginModal = () => null }) {
	const user = useStore((state) => state.user);

	const UserOptions = ({ size = "lg" }) =>
		user ? (
			<HStack spacing={3}>
				<Link href="/user/wallet">
					<a>
						<Button
							colorScheme="teal"
							size={size}
							rightIcon={<MdOutlineArrowForward />}
							variant="solid"
						>
							Go To Wallet
						</Button>
					</a>
				</Link>
				<Link href="/user/profile">
					<a>
						<Button
							colorScheme="teal"
							size={size}
							leftIcon={<FaUser />}
							variant="outline"
						>
							View Profile
						</Button>
					</a>
				</Link>
			</HStack>
		) : (
			<HStack spacing={5}>
				<Button
					colorScheme="teal"
					variant="solid"
					size={size}
					rightIcon={<MdOutlineArrowForward />}
					onClick={openLoginModal}
				>
					Get Started
				</Button>
			</HStack>
		);

	return (
		<>
			<HomeHeroSection centerContent>
				<ContentWrapper centerContent>
					<HomeHeroImage src="/images/homehero.svg" alt="Guy With Phone" />
					<Heading my={3} mt={5}>
						Simple, Digital Wallet.
					</Heading>
					<Text my={1} mb={3} fontSize="lg" color="gray">
						For Everyone, Made with ❤ in India.
					</Text>
					<UserOptions />
				</ContentWrapper>
			</HomeHeroSection>
			<HomeSecondSection>
				<HomeSecondSectionFlex alignItems="center">
					<Box flex="1" p={5}>
						<Image
							borderRadius="0.5rem"
							border="1px solid var(--white)"
							src="/images/walletscreely.png"
							alt="Wallet You'll Love"
						/>
					</Box>
					<Box flex="1" p={5}>
						<Heading>A Wallet You'll Love</Heading>
						<Text mt={5}>Use it to store and track funds.</Text>
						<Text mt={5}>
							Transfer money to your friends and family securely.
						</Text>
						<Text mt={5}>Pay for items on supported merchants seamlessly.</Text>
						<br />
						<UserOptions size="md" />
					</Box>
				</HomeSecondSectionFlex>
			</HomeSecondSection>
		</>
	);
}
