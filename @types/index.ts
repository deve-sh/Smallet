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
