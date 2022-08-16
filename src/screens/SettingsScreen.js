import React from 'react';
import { StyleSheet, View, Alert, ScrollView, SafeAreaView } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as Random from 'expo-random';
import * as AuthSession from 'expo-auth-session';
import HttpCall from '../HttpCall';
import { CLIENTS, OAUTH_CLIENT_SECRET } from '../Consts';
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
import { Context } from '../Context';

export default class SettingsScreen extends React.Component {
	static contextType = Context;

	state = {
		clients: [],
		client_desc: '',
		expanded: false,
		client_id: 0,
		access_token: '',
		refresh_token: '',
		expires_in: 0,
	};

	constructor(props) {
		super(props);
		this.api = new HttpCall();
	}

	async componentDidMount() {
		this.store = new StoreUtil(this.context);
		this.initClients();
		this._unsubscribe = this.props.navigation.addListener('focus', () => {
			console.log('SettingsScreen has focus ****************** ');
			this.updateGui();
		});

		this.updateGui(); // NOTA: l'evento 'focus' non viene invocato se lo screen ha già il focus quando l'app si apre
	}

	updateGui = async () => {
		this.updateConfig(this.context.client_id);
	};

	/**
	 * https://reactnavigation.org/docs/navigation-events/
	 */
	componentWillUnmount() {
		if (this._unsubscribe) {
			this._unsubscribe();
		}
	}

	initClients() {
		this.state.clients = CLIENTS;
	}

	updateConfig = async (index) => {
		if (index == undefined) {
			index = 1;
		}
		let client_id = parseInt(index);

		let client_secret = '';
		if (client_id == 1) {
			client_secret = OAUTH_CLIENT_SECRET;
		} else {
			// without client_secret
		}
		console.log('clientSecret: ' + client_secret);
		let client_desc = client_id + ' ' + this.state.clients[client_id];
		this.context.client_id = client_id;
		this.context.client_secret = client_secret;

		this.setState({
			client_id: this.context.client_id,
			access_token: this.context.access_token,
			refresh_token: this.context.refresh_token,
			expires_in: this.context.expires_in,
			client_desc: client_desc,
			expanded: false,
		});
	};

	saveDataInStore = () => {
		this.store.saveClient(this.context.client_id, this.context.client_secret);
	};

	clearDataFromStore = async () => {
		await this.store.clear();
		this.setState({
			client_desc: '',
		});
	};

	handlePress = () => this.setState({ expanded: !this.state.expanded });

	readDataFromStore = async () => {
		await this.store.load();
		this.updateConfig(this.context.client_id);
		console.log('data loaded successfully');
	};

	getExpiredDesc = () => {
		let expires = '';
		if (this.state.expires_in > 0) {
			let expiresAtTime = new Date().getTime() + this.state.expires_in * 1000;
			let expiresAt = this.api.formatTime(expiresAtTime);
			let isExpired = "(it's not expired yet)";
			if (this.api.isExpired(expiresAtTime)) {
				isExpired = "(it's expired)";
			}
			expires = this.state.expires_in + ' seconds, on ' + expiresAt + ' ' + isExpired;
		}
		return expires;
	};

	render() {
		return (
			<SafeAreaView>
				<ScrollView style={{ paddingHorizontal: 20 }}>
					<Title>Settings</Title>
					<List.Section title="IubarHR client id">
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
					<Divider style={{ marginVertical: 20 }} />
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
					<Title>Tokens</Title>
					<Subheading>Access token</Subheading>
					<Paragraph>{this.state.access_token}</Paragraph>
					<Subheading>Refresh token</Subheading>
					<Paragraph>{this.state.refresh_token}</Paragraph>
					<Subheading>Expires in</Subheading>
					<Paragraph>{this.getExpiredDesc()}</Paragraph>
				</ScrollView>
			</SafeAreaView>
		);
	}
}
