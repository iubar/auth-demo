import React from 'react';
import { StyleSheet, View, Alert, ScrollView, SafeAreaView } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as Random from 'expo-random';
import * as AuthSession from 'expo-auth-session';

import HttpCall from '../HttpCall';
import { URL_OAUTH_LOGIN, OAUTH_CLIENT_SECRET } from '../Consts';
import {
	Text,
	Title,
	Subheading,
	Button,
	Paragraph,
	Divider,
	List,
	TextInput,
} from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';

export default class PasswordGrantScreen extends React.Component {
	state = {
		clients: [],
		client_desc: '',
		data_to_send: {},
		data_to_send_printable: '',
		username: '',
		password: '',
		expanded: false,
	};

	constructor(props) {
		super(props);
		this.api = new HttpCall();
		this.initClients();
	}

	initClients() {
		let clients = [];
		clients[1] = 'with client_secret';
		clients[6] = 'without client_secret';
		this.state.clients = clients;
	}

	async componentDidMount() {
		await this.updateConfig(1);
	}

	updateConfig = async (itemValue) => {
		let client_id = parseInt(itemValue);

		let data_to_send = {
			grant_type: 'password',
			client_id: client_id,
			scope: '',
		};

		if (client_id == 1) {
			// with client_secret
			data_to_send.client_secret = OAUTH_CLIENT_SECRET;
		} else if (client_id == 6) {
			// without client_secret
		}

		let client_desc = client_id + ' ' + this.state.clients[client_id];
		this.setState({ data_to_send: data_to_send, client_desc: client_desc });
	};

	setUsername(username) {
		this.setState({ username: username });
	}

	setPassword(password) {
		this.setState({ password: password });
	}

	authPasswordGrant = async () => {
		let data_to_send = this.state.data_to_send;
		data_to_send.username = this.state.username;
		data_to_send.password = this.state.password;

		this.setState({
			data_to_send: data_to_send,
			data_to_send_printable: 'POST: ' + URL_OAUTH_LOGIN + ' ' + JSON.stringify(data_to_send),
		});

		let result = await this.api.callApi2('POST', URL_OAUTH_LOGIN, data_to_send);
		if (result.status != 200) {
			let errorMsg = 'HTTP ERROR: ' + result.status + ' MESSAGE: ' + result.error;
			console.log(errorMsg);
			Alert.alert(errorMsg);
			this.setState({ access_token: '' });
		} else {
			console.log('loginSuccess(): ' + JSON.stringify(data));
			let data = result.data;
			let token_type = data.token_type;
			let expires_in = data.expires_in;
			let access_token = data.access_token;
			let refresh_token = data.refresh_token;

			console.log('accessToken: ' + access_token);
			console.log('refreshToken: ' + refresh_token);
			console.log('expiresIn: ' + expires_in);
			console.log('clientId: ' + this.state.data_to_send.client_id);
			console.log('clientSecret: ' + this.state.data_to_send.client_secret);

			SecureStore.setItemAsync('accessToken', access_token);
			SecureStore.setItemAsync('refreshToken', refresh_token);
			SecureStore.setItemAsync('expiresIn', expires_in.toString());
			SecureStore.setItemAsync('clientId', this.state.data_to_send.client_id.toString());
			SecureStore.setItemAsync('clientSecret', this.state.data_to_send.client_secret);
			Alert.alert('Authentication done: token saved');
			this.setState({ access_token: access_token });
		}
	};

	handlePress = () => this.setState({ expanded: !this.state.expanded });

	render() {
		return (
			<SafeAreaView>
				<ScrollView style={{ paddingHorizontal: 20 }}>
					<Subheading>Password Grant</Subheading>
					<List.Section title="Client type">
						<List.Accordion
							title={this.state.client_desc}
							expanded={this.state.expanded}
							onPress={this.handlePress}>
							{this.state.clients.map((desc, index) => {
								if (desc !== null) {
									return (
										<List.Item
											key={index}
											title={index + ' - ' + desc}
											onPress={() => this.updateConfig(index)}
										/>
									);
								}
							})}
						</List.Accordion>
					</List.Section>
					<TextInput
						label="Username"
						value={this.state.username}
						onChangeText={(text) => this.setUsername(text)}
					/>
					<View>
						<TextInput
							label="Password"
							secureTextEntry
							value={this.state.password}
							onChangeText={(text) => this.setPassword(text)}
						/>
					</View>
					<Divider style={{ marginVertical: 20 }} />
					<Button
						style={{ marginHorizontal: 20, marginVertical: 20 }}
						disabled={this.state.username === '' || this.state.password === ''}
						mode="contained"
						onPress={this.authPasswordGrant}>
						Login
					</Button>
					<Divider style={{ marginVertical: 20 }} />
					<Subheading>Request</Subheading>
					<Paragraph>{this.state.data_to_send_printable}</Paragraph>
					<Divider style={{ marginVertical: 20 }} />
					<Subheading>Access token</Subheading>
					<Paragraph>{this.state.access_token}</Paragraph>
				</ScrollView>
			</SafeAreaView>
		);
	}
}
