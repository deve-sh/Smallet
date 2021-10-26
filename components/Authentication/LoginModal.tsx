import { useRef, useState } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	Button,
	Text,
	Divider,
} from "@chakra-ui/react";
import styled from "@emotion/styled";

import { FcGoogle } from "react-icons/fc";
import { MdSend } from "react-icons/md";

import PhoneInput from "./PhoneInput";
import OTPInput from "./OTPInput";

import {
	loginWithGoogle,
	sendOTPToUser,
	setupRecaptchaVerifier,
	submitOTP,
} from "../../API/auth";
import toasts from "../../utils/toasts";

const LoginModalBody = styled(ModalBody)`
	text-align: center;
	padding: calc(2 * var(--standard-spacing));
	padding-bottom: var(--standard-spacing);
`;

const LoginModal = ({ isOpen, closeModal }) => {
	const [phoneNumber, setPhoneNumber] = useState("");
	const [showOTPInputs, setShowOTPInputs] = useState(false);
	const [phoneNumberConfirmationResult, setPhoneNumberConfirmationResult] =
		useState(null);
	const resendOTPTime = useRef(0);
	const [resendOTPTimeState, setResendOTPTimeState] = useState(0);
	const [showResendOTPButton, setShowResendOTPButton] = useState(false);
	const [isLoggingIn, setIsLoggingIn] = useState(false);

	const signInUser = (mode = "google") => {
		// Use 'mode' in the future to distinguish between multiple OAuth Based login modes.
		setIsLoggingIn(true);
		const callback = (err) => {
			setIsLoggingIn(false);
			if (err) return toasts.generateError(err);
		};
		if (mode === "google") loginWithGoogle(callback);
	};

	const setupOTPResendInterval = () => {
		if (window["otpResendInterval"])
			window["otpResendInterval"] = clearInterval(window["otpResendInterval"]);
		else {
			resendOTPTime.current = 60;
			window["otpResendInterval"] = setInterval(() => {
				resendOTPTime.current--;
				setResendOTPTimeState(resendOTPTime.current);
				if (resendOTPTime.current <= 0) {
					setShowResendOTPButton(true);
					window["otpResendInterval"] = clearInterval(
						window["otpResendInterval"]
					);
				}
			}, 1000);
		}
	};

	const sendOTP = () => {
		setIsLoggingIn(true);
		sendOTPToUser(phoneNumber, (err, confirmationResult) => {
			setIsLoggingIn(false);
			if (err) return toasts.generateError(err);
			if (confirmationResult) {
				setupOTPResendInterval();
				setPhoneNumberConfirmationResult(confirmationResult);
				setShowOTPInputs(true);
			}
		});
	};

	const startSignInWithOTP = async (event) => {
		event.preventDefault();
		if (phoneNumberConfirmationResult || showOTPInputs) return;
		setIsLoggingIn(true);
		setupRecaptchaVerifier((err) => {
			setIsLoggingIn(false);
			if (err) return toasts.generateError(err);
			sendOTP();
		});
	};

	const submitEnteredOTP = (enteredOTP) => {
		if (
			!enteredOTP ||
			!phoneNumberConfirmationResult ||
			typeof enteredOTP !== "string" ||
			enteredOTP.length < 6 ||
			enteredOTP.replace(/\s/g, "").length < 6
		)
			return;

		setIsLoggingIn(true);
		submitOTP(phoneNumberConfirmationResult, enteredOTP, (err) => {
			setIsLoggingIn(false);
			if (err) return toasts.generateError(err);
		});
	};

	return (
		<Modal isOpen={isOpen} onClose={closeModal}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader borderBottom="0.075rem solid var(--backgroundgrey)">
					Login
				</ModalHeader>
				<LoginModalBody>
					<PhoneInput
						id="phonenumber"
						value={phoneNumber}
						onChange={(value) => setPhoneNumber("+" + value)}
						disabled={isLoggingIn}
					/>
					<div id="recaptcha-container" style={{ display: "block" }} />
					{showOTPInputs && (
						<>
							<br />
							<Text color="grey">Enter OTP Sent To Your Phone Number</Text>
							<OTPInput
								disabled={isLoggingIn}
								length={6}
								submitOTP={submitEnteredOTP}
							/>
						</>
					)}
					<Text color="grey" marginTop="15px">
						{showResendOTPButton ? (
							<>
								<Button
									color="primary"
									variant="ghost"
									href="#"
									onClick={sendOTP}
								>
									Resend OTP
								</Button>
							</>
						) : resendOTPTimeState ? (
							"Resend OTP in " + resendOTPTimeState + " seconds."
						) : (
							""
						)}
					</Text>
					{!showOTPInputs && (
						<Button
							isLoading={isLoggingIn}
							autoFocus
							variant="solid"
							onClick={startSignInWithOTP}
							isFullWidth
							colorScheme="teal"
							marginTop="20px"
							rightIcon={<MdSend size="1.25rem" />}
						>
							Send OTP
						</Button>
					)}
					<Divider margin="20px 0" colorScheme="blue" size="large" />
					<Button
						isLoading={isLoggingIn}
						isFullWidth
						variant="outline"
						colorScheme="gray"
						leftIcon={<FcGoogle size="1.5rem" />}
						onClick={() => signInUser("google")}
						size="lg"
					>
						Sign In With Google
					</Button>
				</LoginModalBody>
				<ModalFooter>
					<Button
						colorScheme="gray"
						variant="ghost"
						onClick={closeModal}
						disabled={isLoggingIn}
					>
						Cancel
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default LoginModal;
