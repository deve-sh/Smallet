import { Container, Image, Text } from "@chakra-ui/react";

export default function Error({ errorMessage }) {
	return (
		<Container centerContent maxW="container.xl" padding="1rem">
			<Image src="/error.svg" boxSize="15rem" objectFit="cover" alt="Error" />
			<br />
			<Text fontSize="lg">{errorMessage}</Text>
		</Container>
	);
}
