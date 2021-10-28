import razorpay from "razorpay";

const rzpInstance = new razorpay({
	key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default rzpInstance;
