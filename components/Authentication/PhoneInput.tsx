import ReactPhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";

const PhoneInput = (props) => (
	<ReactPhoneInput
		country={"in"}
		containerStyle={{ width: "100%" }}
		inputStyle={{ width: "100%" }}
		value={props.phone}
		onChange={props.onChange || (() => null)}
		onlyCountries={["in"]}
		disabled={props.disabled}
		inputProps={
			props.inputProps || {
				id: props.id || "",
				required: false,
			}
		}
	/>
);

export default PhoneInput;
