export interface FirebaseUser {
	uid: string;
	isAnonymous: boolean;
	displayName?: null;
	email?: null;
	photoURL?: null;
	emailVerified: boolean;
	phoneNumber: string;
	lastSignInTime: string;
	creationTime: string;
	providerData?: ProviderDataEntity[] | null;
}
export interface ProviderDataEntity {
	uid: string;
	displayName?: null;
	photoURL?: null;
	email?: null;
	phoneNumber: string;
	providerId: string;
}

export interface NotificationContent {
	text: string;
	type:
		| "wallet"
		| "profile"
		| "moneyrequest"
		| "moneydeducted"
		| "moneycredited";
	read: boolean;
	url?: string;
	image?: string;
	amountChange?: number;
}
