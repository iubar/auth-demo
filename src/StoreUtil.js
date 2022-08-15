import React from 'react';

import * as SecureStore from 'expo-secure-store';

export default class StoreUtil {
	constructor(context) {
		this.context = context;
	}

	clearClient = async () => {
		await SecureStore.deleteItemAsync('clientId');
		await SecureStore.deleteItemAsync('clientSecret');
		this.context.client_id = 0;
		this.context.client_secret = '';
	};

	clearTokens = async () => {
		await SecureStore.deleteItemAsync('accessToken');
		await SecureStore.deleteItemAsync('refreshToken');
		await SecureStore.deleteItemAsync('expiresIn');
		this.context.access_token = '';
		this.context.refresh_token = '';
		this.context.expires_in = 0;
	};

	saveTokens = async (accessToken, refreshToken, expiresIn) => {
		console.log('accessToken : ' + accessToken);
		console.log('refreshToken : ' + refreshToken);
		console.log('expiresIn : ' + expiresIn.toString());
		await SecureStore.setItemAsync('accessToken', accessToken);
		await SecureStore.setItemAsync('refreshToken', refreshToken);
		await SecureStore.setItemAsync('expiresIn', expiresIn.toString());
		this.context.access_token = accessToken;
		this.context.refresh_token = refreshToken;
		this.context.expires_in = expiresIn;
	};

	loadTokens = async () => {
		let accessToken = await SecureStore.getItemAsync('accessToken');
		let refreshToken = await SecureStore.getItemAsync('refreshToken');
		let expiresInString = await SecureStore.getItemAsync('expiresIn');
		let expiresIn = 0;
		if (expiresInString) {
			expiresIn = parseInt(expiresInString);
		}
		this.context.access_token = accessToken;
		this.context.refresh_token = refreshToken;
		this.context.expires_in = expiresIn;
	};

	loadClient = async () => {
		let client_id_as_string = await SecureStore.getItemAsync('clientId');
		let client_id = 0;
		if (client_id_as_string) {
			client_id = parseInt(client_id_as_string);
		}
		let client_secret = await SecureStore.getItemAsync('clientSecret');
		this.context.client_id = client_id;
		this.context.client_secret = client_secret;
	};

	saveClient = async (client_id, client_secret) => {
		await SecureStore.setItemAsync('clientId', client_id.toString());
		await SecureStore.setItemAsync('clientSecret', client_secret);
		this.context.client_id = client_id;
		this.context.client_secret = client_secret;
	};
}
