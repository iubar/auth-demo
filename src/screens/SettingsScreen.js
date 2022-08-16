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
import * as SecureStore from 'expo-secure-store';

export default class SettingsScreen extends React.Component {
	static contextType = Context;

	state = {
		clients: [],
		client_desc: '',
		expanded: false,
	};

	constructor(props) {
		super(props);
	}

	async componentDidMount() {
		this.store = new StoreUtil(this.context);
		this.initClients();
		await this.updateConfig(1); // TODO : in alternativa invocare load()
	}

	initClients() {
		this.state.clients = CLIENTS;
	}

	updateConfig = async (index) => {
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
		this.setState({ client_desc: client_desc, expanded: false });
	};

	saveDataInStore = () => {
		this.store.saveClient(this.context.client_id, this.context.client_secret);
	};

	clearDataFromStore = async () => {
		await this.store.clearTokens();
		await this.store.clearClient();
		this.setState({
			client_desc: '',
		});
	};

	handlePress = () => this.setState({ expanded: !this.state.expanded });

	readDataFromStore = async () => {
		await this.store.loadTokens();
		await this.store.loadClient();
		this.setState({
			client_id: this.context.client_id,
		});
	};

	render() {
		return (
			<SafeAreaView>
				<ScrollView style={{ paddingHorizontal: 20 }}>
					<Title>Settings</Title>
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
				</ScrollView>
			</SafeAreaView>
		);
	}
}
