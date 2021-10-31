import { Box, HStack, Avatar, Text } from "@chakra-ui/react";

const UserTile = ({
	user,
	onClick = undefined,
	title = undefined,
	border = undefined,
	width = undefined,
	maxWidth = undefined,
}) => {
	return (
		<Box
			onClick={onClick}
			shadow="md"
			p={3}
			borderRadius="0.25rem"
			borderWidth={1}
			cursor="pointer"
			width={width || "100%"}
			maxWidth={maxWidth || "100%"}
			title={title}
			border={border}
		>
			<HStack>
				<Box>
					<Avatar name={user.displayName} src={user.photoURL} />
				</Box>
				<Box flex="8">
					<Text fontSize="md" fontWeight={500}>
						{user?.displayName}
					</Text>
					<Text fontSize="sm" color="gray">
						{user.phoneNumber} {user.email}
					</Text>
				</Box>
			</HStack>
		</Box>
	);
};

export default UserTile;
