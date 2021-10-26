// An input tray for OTP

import { useRef, useState } from "react";
import styled from "@emotion/styled";

const OTPInputsWrapper = styled.div`
	display: flex;
	width: 100%;
	margin-top: 0.75rem;
	max-width: 100%;
	padding: 0.75rem;
	justify-content: center;
	align-items: center;
`;

const OTPInputField = styled.input`
	border: 0.1rem solid var(--bordergrey);
	margin: 0 0.5rem;
	padding: 1rem;
	text-align: center;
	border-radius: 0.25rem;
	min-width: 2rem;
	max-width: 4rem;

	&:active,
	&:focus {
		border: 0.1rem solid var(--primary);
		outline: none;
	}
`;

const OTPInput = ({ length = 6, submitOTP, disabled }) => {
	const [OTPValue, setOTPValue] = useState([...new Array(length)].join(" "));
	const inputRefs = useRef([]);

	const setInputRef = (element, index) => (inputRefs.current[index] = element);

	const handleTyping = (event, index) => {
		event.persist();
		let newValue = OTPValue.split("");
		newValue[index] = event.target?.value || " ";
		setOTPValue(newValue.join(""));
		if (index === length - 1) {
			// Submit the form
			if (submitOTP && submitOTP instanceof Function) submitOTP(newValue);
		} else {
			if (
				inputRefs.current[index] &&
				inputRefs.current[index + 1] &&
				event.target?.value
			) {
				// Move focus to next input.
				inputRefs.current[index + 1].focus();
			}
			if (
				inputRefs.current[index] &&
				inputRefs.current[index - 1] &&
				!event.target?.value
			) {
				// Move focus to previous input in case of backspace.
				inputRefs.current[index - 1].focus();
			}
		}
	};

	return (
		<OTPInputsWrapper>
			{[...new Array(length)].map((_, index) => (
				<OTPInputField
					required
					ref={(inputElement) => setInputRef(inputElement, index)}
					onChange={(event) => handleTyping(event, index)}
					maxLength={1}
					placeholder="0"
					disabled={disabled}
				/>
			))}
		</OTPInputsWrapper>
	);
};

export default OTPInput;
