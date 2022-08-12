import React from 'react';
import { StyleSheet, View, Alert, ScrollView, SafeAreaView } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as Random from 'expo-random';
import * as AuthSession from 'expo-auth-session';
import { Paragraph, Divider, Caption, Title, Button, Subheading } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';

export default class HttpCall extends React.Component {
	state = {
		accessToken: '',
		refreshToken: '',
		expiresIn: 0,
		client_id: 0,
		client_secret: '',
		data_to_send_printable: '',
		response: '',
	};

	readDataFromStore = async () => {
		let accessToken = await SecureStore.getItemAsync('accessToken');
		let refreshToken = await SecureStore.getItemAsync('refreshToken');
		let expiresInString = await SecureStore.getItemAsync('expiresIn');
		let expiresIn = 0;
		if (expiresInString) {
			expiresIn = parseInt(expiresInString);
		}
		let client_id_as_string = await SecureStore.getItemAsync('clientId');
		let client_id = 0;
		if (client_id_as_string) {
			client_id = parseInt(client_id_as_string);
		}
		let client_secret = await SecureStore.getItemAsync('clientSecret');

		this.setState({
			accessToken: accessToken,
			refreshToken: refreshToken,
			expiresIn: expiresIn,
			client_id: client_id,
			client_secret: client_secret,
		});
	};

	clearDataFromStore = async () => {
		await SecureStore.deleteItemAsync('accessToken');
		await SecureStore.deleteItemAsync('refreshToken');
		await SecureStore.deleteItemAsync('expiresIn');
		await SecureStore.deleteItemAsync('clientId');
		await SecureStore.deleteItemAsync('clientSecret');

		this.setState({
			accessToken: null,
			refreshToken: null,
			expiresIn: null,
			client_id: null,
			client_secret: null,
			response: null,
			data_to_send_printable: null,
		});
	};

	getHeaders = () => {
		let headers = {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + this.state.accessToken,
		};

		return headers;
	};

	refreshToken = async () => {
		let url = 'https://hr.iubar.it/oauth/token';
		let data_to_send = {
			grant_type: 'refresh_token',
			client_id: this.state.client_id,
			scope: '',
			refresh_token: this.state.refreshToken,
			client_secret: this.state.client_secret,
		};

		console.log('data_to_send: ' + JSON.stringify(data_to_send));

		this.setState({
			data_to_send_printable: 'POST: ' + url + ' ' + JSON.stringify(data_to_send),
		});

		let result = await fetch(url, {
			method: 'POST',
			headers: this.getHeaders(),
			body: JSON.stringify(data_to_send),
		});

		const statusCode = result.status;
		console.log('status: ' + statusCode);
		let json = await result.json();
		console.log('json: ' + JSON.stringify(json));

		this.setState({ response: JSON.stringify(json) });

		let accessToken = json.access_token;
		let refreshToken = json.refresh_token;
		let expiresIn = json.expires_in;

		console.log('accessToken: ' + JSON.stringify(accessToken));
		console.log('refreshToken: ' + JSON.stringify(refreshToken));
		console.log('expiresIn: ' + JSON.stringify(expiresIn));

		let msg1 = 'The access token was not changed';
		if (accessToken != this.state.accessToken) {
			msg1 = 'The access was changed';
		}
		let msg2 = 'The refresh token was not changed';
		if (refreshToken != this.state.refreshToken) {
			msg2 = 'The refresh token was changed';
		}

		SecureStore.setItemAsync('accessToken', accessToken);
		SecureStore.setItemAsync('refreshToken', refreshToken);
		SecureStore.setItemAsync('expiresIn', expiresIn.toString());
		SecureStore.setItemAsync('clientId', this.state.client_id.toString());
		SecureStore.setItemAsync('clientSecret', this.state.client_secret);

		this.setState({
			accessToken: accessToken,
			refreshToken: refreshToken,
			expiresIn: expiresIn,
			client_id: this.state.client_id,
			client_secret: this.state.client_secret,
		});

		if (accessToken !== null) {
			let msg3 = 'Done: tokens saved' + '\n' + msg1 + '\n' + msg2;
			console.log(msg3);
			Alert.alert('Done: tokens saved');
		}
	};

	callApi = async () => {
		let url = 'https://hr.iubar.it/api/v1/user';
		let result = await fetch(url, {
			method: 'GET',
			headers: this.getHeaders(),
		});

		this.setState({ data_to_send_printable: 'GET: ' + url });

		let json = await result.json();
		console.log('json: ' + JSON.stringify(json));
		const statusCode = result.status;
		if (statusCode != 200) {
			Alert.alert('Http error: ' + statusCode);
		} else {
			Alert.alert('Ok: ' + statusCode);
		}

		this.setState({ response: JSON.stringify(json) });
	};

	handlePress = () => this.setState({ expanded: !this.state.expanded });

	formatTime(unix_timestamp_in_ms) {
		var date = new Date(unix_timestamp_in_ms);

		var day = date.getDate();
		var month = date.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12
		var year = date.getFullYear();

		// Hours part from the timestamp
		var hours = date.getHours();
		// Minutes part from the timestamp
		var minutes = '0' + date.getMinutes();
		// Seconds part from the timestamp
		var seconds = '0' + date.getSeconds();

		// Will display time in 10:30:23 format
		var formattedTime =
			day +
			'/' +
			month +
			'/' +
			year +
			' ' +
			hours +
			':' +
			minutes.substr(-2) +
			':' +
			seconds.substr(-2);

		console.log(formattedTime);

		return formattedTime;
	}

	isExpired(exp) {
		if (Date.now() <= exp * 1000) {
			console.log(true, 'token is not expired');
			return false;
		} else {
			console.log(false, 'token is expired');
			return true;
		}
	}

	render() {
		let expires = '';
		if (this.state.expiresIn > 0) {
			let expiresAtTime = new Date().getTime() + this.state.expiresIn * 1000;
			let expiresAt = this.formatTime(expiresAtTime);
			let isExpired = "(it's not expired yet)";
			if (this.isExpired(expiresAtTime)) {
				isExpired = "(it's expired)";
			}
			expires = this.state.expiresIn + ' seconds, on ' + expiresAt + ' ' + isExpired;
		}

		return (
			<SafeAreaView>
				<ScrollView style={{ paddingHorizontal: 20 }}>
					<Subheading>Secure store</Subheading>
					<Button
						style={{ marginHorizontal: 20, marginVertical: 20 }}
						mode="contained"
						onPress={this.readDataFromStore}>
						Read data from store
					</Button>
					<Button
						style={{ marginHorizontal: 20, marginVertical: 20 }}
						mode="contained"
						onPress={this.clearDataFromStore}>
						Clear data in store
					</Button>
					<Divider style={{ marginVertical: 20 }} />
					<Subheading>Token</Subheading>
					<Paragraph>Access token: {this.state.accessToken}</Paragraph>
					<Paragraph>Refresh token: {this.state.refreshToken}</Paragraph>
					<Paragraph>Expires in: {expires}</Paragraph>
					{/* <Button style={{marginHorizontal: 20, marginVertical: 20}} mode="contained" onPress={this.refreshToken} disabled={this.state.accessToken === '' || this.state.accessToken === null}>Info</Button> */}
					<Button
						style={{ marginHorizontal: 20, marginVertical: 20 }}
						mode="contained"
						onPress={this.refreshToken}
						disabled={this.state.accessToken === '' || this.state.accessToken === null}>
						Refresh token
					</Button>
					<Divider style={{ marginVertical: 20 }} />
					<Subheading>Rest Api</Subheading>
					<Button
						style={{ marginHorizontal: 20, marginVertical: 20 }}
						mode="contained"
						onPress={this.callApi}
						disabled={this.state.accessToken === '' || this.state.accessToken === null}>
						Call route
					</Button>
					<Divider style={{ marginVertical: 20 }} />
					<Subheading>Request</Subheading>
					<Paragraph>{this.state.data_to_send_printable}</Paragraph>
					<Divider style={{ marginVertical: 20 }} />
					<Subheading>Response</Subheading>
					<Paragraph>{this.state.response}</Paragraph>
				</ScrollView>
			</SafeAreaView>
		);
	}
}
