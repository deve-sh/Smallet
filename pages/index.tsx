import Link from "next/link";
import {
	Container,
	Image,
	Heading,
	Text,
	Button,
	HStack,
} from "@chakra-ui/react";
import styled from "@emotion/styled";
import { MdOutlineArrowForward } from "react-icons/md";
import { FaUser } from "react-icons/fa";

import ContentWrapper from "../components/Layout/ContentWrapper";

import useStore from "../hooks/useStore";

const HomeHeroSection = styled(Container)`
	padding-top: 1rem;
`;

const HomeHeroImage = styled(Image)`
	max-width: 375px;
	margin: 0 auto;
`;

export default function Home({ openLoginModal = () => null }) {
	const user = useStore((state) => state.user);

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
					{user ? (
						<HStack spacing={3}>
							<Link href="/user/wallet">
								<a>
									<Button
										colorScheme="teal"
										size="lg"
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
										size="lg"
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
								size="lg"
								rightIcon={<MdOutlineArrowForward />}
								onClick={openLoginModal}
							>
								Get Started
							</Button>
						</HStack>
					)}
				</ContentWrapper>
			</HomeHeroSection>
		</>
	);
}
