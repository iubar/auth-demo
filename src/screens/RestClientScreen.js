import React from 'react';
import { StyleSheet, View, Alert, ScrollView, SafeAreaView } from 'react-native';
import { Paragraph, Divider, Caption, Title, Button, Subheading } from 'react-native-paper';

import HttpCall from '../HttpCall';
import StoreUtil from '../StoreUtil';
import { URL_OAUTH_LOGIN, URL_API_ROUTE1 } from '../Consts';
import { Context } from '../Context';

export default class RestClientScreen extends React.Component {
	static contextType = Context;

	state = {
		access_token: '',
		refresh_token: '',
		expiresIn: 0,
		data_to_send_printable: '',
		response: '',
		disabled: true,
		client_id: 0,
	};

	constructor(props) {
		super(props);
		this.api = new HttpCall();
	}

	async componentDidMount() {
		this.store = new StoreUtil(this.context);

		this._unsubscribe = this.props.navigation.addListener('focus', () => {
			console.log('RestApi has focus ****************** ');
			let disabled = true;
			if (this.context.access_token) {
				disabled = false;
			}
			this.setState({
				client_id: this.context.clientId,
				access_token: this.context.access_token,
				refresh_token: this.context.refresh_token,
				expiresIn: this.context.expires_in,
				disabled: disabled,
			});
		});
	}

	/**
	 * https://reactnavigation.org/docs/navigation-events/
	 */
	componentWillUnmount() {
		if (this._unsubscribe) {
			this._unsubscribe();
		}
	}

	/**
	 * https://laravel.com/docs/9.x/passport#refreshing-tokens
	 */
	refreshToken = async () => {
		let data_to_send = {
			grant_type: 'refresh_token',
			client_id: this.context.client_id,
			client_secret: this.context.client_secret,
			scope: '',
			refresh_token: this.state.refresh_token,
		};

		console.log('data_to_send: ' + JSON.stringify(data_to_send));

		let arg1 = 'POST: ' + URL_OAUTH_LOGIN + ' ' + JSON.stringify(data_to_send);
		let result = await this.api.callApi2('POST', URL_OAUTH_LOGIN, data_to_send);
		if (result.status != 200) {
			let errorMsg = 'HTTP ERROR: ' + result.status + '\n' + result.error;
			console.log(errorMsg);
			Alert.alert(errorMsg);
			this.setState({
				data_to_send_printable: arg1,
				response: JSON.stringify(result),
			});
		} else {
			let data = result.data;
			console.log('data: ' + JSON.stringify(data));

			let accessToken = data.access_token;
			let refreshToken = data.refresh_token;
			let expiresIn = data.expires_in;

			this.setState({
				data_to_send_printable: arg1,
				response: JSON.stringify(data),
				access_token: accessToken,
				refresh_token: refreshToken,
				expiresIn: expiresIn,
			});

			let msg1 = 'The access token was not changed';
			if (accessToken != this.state.access_token) {
				msg1 = 'The access was changed';
			}
			let msg2 = 'The refresh token was not changed';
			if (refreshToken != this.state.refresh_token) {
				msg2 = 'The refresh token was changed';
			}

			await this.store.saveTokens(accessToken, refreshToken, expiresIn);
			let msg3 = 'Done: tokens saved' + '\n' + msg1 + '\n' + msg2;
			console.log(msg3);
			Alert.alert('Done: tokens saved');
		}
	};

	callApi = async () => {
		let arg1 = 'GET: ' + URL_API_ROUTE1;
		let result = await this.api.callApi3('GET', URL_API_ROUTE1, this.state.access_token, null);
		let data = '';
		if (result.status != 200) {
			let errorMsg = 'HTTP ERROR: ' + result.status + '\n' + result.error;
			console.log(errorMsg);
			Alert.alert(errorMsg);
			this.setState({
				data_to_send_printable: arg1,
				response: JSON.stringify(result),
			});
		} else {
			data = result.data;
			console.log('data: ' + JSON.stringify(data));
			this.setState({ data_to_send_printable: arg1, response: JSON.stringify(data) });
		}
	};

	handlePress = () => this.setState({ expanded: !this.state.expanded });

	render() {
		console.log('RestApi.render() ******************');
		let expires = '';
		if (this.state.expiresIn > 0) {
			let expiresAtTime = new Date().getTime() + this.state.expiresIn * 1000;
			let expiresAt = this.api.formatTime(expiresAtTime);
			let isExpired = "(it's not expired yet)";
			if (this.api.isExpired(expiresAtTime)) {
				isExpired = "(it's expired)";
			}
			expires = this.state.expiresIn + ' seconds, on ' + expiresAt + ' ' + isExpired;
		}

		return (
			<SafeAreaView>
				<ScrollView style={{ paddingHorizontal: 20 }}>
					<Title>Rest Api</Title>
					<Paragraph>Client Id: {this.state.client_id}</Paragraph>
					<Paragraph>Access token: {this.state.access_token}</Paragraph>
					<Paragraph>Refresh token: {this.state.refresh_token}</Paragraph>
					<Paragraph>Expires in: {expires}</Paragraph>
					{/* <Button style={{marginHorizontal: 20, marginVertical: 20}} mode="contained" onPress={this.refreshToken} disabled={this.state.accessToken === '' || this.state.accessToken === null}>Info</Button> */}
					<Button
						style={{ marginHorizontal: 20, marginVertical: 20 }}
						mode="contained"
						onPress={this.refreshToken}
						disabled={this.state.disabled}>
						Refresh token
					</Button>
					<Divider style={{ marginVertical: 20 }} />
					<Subheading>Rest Api</Subheading>
					<Button
						style={{ marginHorizontal: 20, marginVertical: 20 }}
						mode="contained"
						onPress={this.callApi}
						disabled={this.state.disabled}>
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
