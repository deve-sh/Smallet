import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import styled from "@emotion/styled";
import { Container } from "@chakra-ui/layout";

import useStore from "../hooks/useStore";
import Authentication from "../components/Authentication";

const AuthenticationWrapper = styled(Container)`
	max-width: 576px;
	margin: 0 auto;
	padding: var(--standard-spacing);
	min-height: 80vh;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-flow: column;
`;

const LoginPage = () => {
	const stateUser = useStore((state) => state.user);
	const router = useRouter();

	useEffect(() => {
		if (stateUser) router.push("/");
	}, []);

	return (
		<AuthenticationWrapper>
			<Head>
				<title>Smallet - Login</title>
			</Head>
			<Authentication />
		</AuthenticationWrapper>
	);
};

export default LoginPage;
