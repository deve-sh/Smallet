import axios from "axios";

export default async function request(
	endpoint: string,
	data: any,
	options: any,
	requestType: string,
	callback?: (errorMessage: string | null, responseData: any) => any
) {
	try {
		let response = await axios[requestType](endpoint, data, options);
		if (callback) return callback(null, response.data);
		else return response.data;
	} catch (err) {
		if (process.env.NODE_ENV === "development") console.log(err);
		if (callback) {
			return callback(
				err.response && err.response.data && err.response.data.error
					? err.response.data.error
					: "Something went wrong. Please try again later.",
				null
			);
		} else return null;
	}
}
