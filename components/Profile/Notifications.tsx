import { useState } from "react";
import {
	IconButton,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
} from "@chakra-ui/react";
import { MdNotifications, MdNotificationImportant } from "react-icons/md";

import NoneFound from "../Layout/NoneFound";

const UserNotifications = () => {
	const [notifications, setNotifications] = useState([]);

	return (
		<>
			<Menu>
				<MenuButton
					variant="ghost"
					colorScheme="gray"
					as={IconButton}
					icon={<MdNotifications />}
					aria-label="Toggle Notifications"
				/>
				<MenuList minHeight="50vh" minWidth="35vw">
					{notifications.length ? (
						notifications.map((notification) => (
							<MenuItem>{notification.text}</MenuItem>
						))
					) : (
						<NoneFound
							label="No Notifications Here."
							icon={() => (
								<MdNotificationImportant color="gray" fontSize="5rem" />
							)}
						/>
					)}
				</MenuList>
			</Menu>
		</>
	);
};

export default UserNotifications;
