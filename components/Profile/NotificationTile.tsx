import Link from "next/link";
import {
	Box,
	HStack,
	Image,
	Text,
	Stat,
	StatHelpText,
	StatArrow,
} from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";

const NotificationTile = ({ text, url, image, amountChange }) => {
	return (
		<Link href={url || "#"}>
			<a title="View Notification">
				<HStack padding="0.75rem" alignItems="center">
					<Box flex="1" maxWidth="4.5rem">
						{image ? (
							<Image
								borderRadius="full"
								boxSize="100%"
								src={image}
								alt={text || "Notification Image"}
							/>
						) : (
							<BellIcon w={9} h={9} fontSize="1.375rem" color="gray.500" />
						)}
					</Box>
					<Box flex="9">
						<Text fontSize="sm" color="gray.800">
							{text}
						</Text>
					</Box>
					{amountChange ? (
						<Box flex="1">
							<Stat>
								<StatHelpText>
									<StatArrow
										type={amountChange > 0 ? "increase" : "decrease"}
									/>
									{amountChange}
								</StatHelpText>
							</Stat>
						</Box>
					) : (
						""
					)}
				</HStack>
			</a>
		</Link>
	);
};

export default NotificationTile;
