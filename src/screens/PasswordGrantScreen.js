import React from 'react';
import { StyleSheet, View, Alert, ScrollView, SafeAreaView } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as Random from 'expo-random';
import * as AuthSession from 'expo-auth-session';
import { Context } from '../Context';
import HttpCall from '../HttpCall';
import { URL_OAUTH_LOGIN } from '../Consts';
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
import StoreUtil from '../StoreUtil';

export default class PasswordGrantScreen extends React.Component {
	static contextType = Context;

	state = {
		access_token: '',
		data_to_send_printable: '',
		username: '',
		password: '',
		expanded: false,
	};

	constructor(props) {
		super(props);
		this.api = new HttpCall();
	}

	async componentDidMount() {
		this.store = new StoreUtil(this.context);
	}

	setUsername(username) {
		this.setState({ username: username });
	}

	setPassword(password) {
		this.setState({ password: password });
	}

	authPasswordGrant = async () => {
		let data_to_send = {
			grant_type: 'password',
			scope: '',
			username: this.state.username,
			password: this.state.password,
		};

		let accessToken = '';
		let result = await this.api.callApi2('POST', URL_OAUTH_LOGIN, data_to_send);
		if (result.status != 200) {
			let errorMsg = 'HTTP ERROR: ' + result.status + '\n' + result.error;
			console.log(errorMsg);
			Alert.alert(errorMsg);
		} else {
			console.log('loginSuccess(): ' + JSON.stringify(data));
			let data = result.data;
			let token_type = data.token_type;
			let expiresIn = data.expires_in;
			accessToken = data.access_token;
			let refreshToken = data.refresh_token;
			this.store.saveTokens(accessToken, refreshToken, expiresIn);
			Alert.alert('Authentication done: token saved');
		}
		this.setState({
			data_to_send_printable: 'POST: ' + URL_OAUTH_LOGIN + ' ' + JSON.stringify(data_to_send),
			access_token: accessToken,
		});
	};

	render() {
		return (
			<SafeAreaView>
				<ScrollView style={{ paddingHorizontal: 20 }}>
					<Title>Password Grant</Title>

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
