import React from "react";
import { StyleSheet, View, Alert, ScrollView, SafeAreaView } from "react-native";
import * as Crypto from "expo-crypto";
import * as Random from "expo-random";
import * as AuthSession from "expo-auth-session";
import { Context } from "../Context";
import HttpCall from "../HttpCall";
import { URL_OAUTH_LOGIN } from "../Consts";
import { Text, Title, Subheading, Button, Paragraph, Divider, List, TextInput } from "react-native-paper";
import StoreUtil from "../StoreUtil";

export default class PasswordGrantScreen extends React.Component {
	static contextType = Context;

	state = {
		response: "",
		data_to_send_printable: "",
		username: "",
		password: "",
		expanded: false,
		client_id: 0,
		screen_disabled: true,
	};

	constructor(props) {
		super(props);
		this.api = new HttpCall();
	}

	async componentDidMount() {
		this._unsubscribe = this.props.navigation.addListener("focus", () => {
			this.updateGui();
		});
		this.updateGui(); // NOTA: l'evento 'focus' non viene invocato se lo screen ha già il focus quando l'app si apre
	}

	updateGui() {
		let b = true;
		if (this.context.client_id == 1 || this.context.client_id == 6) {
			b = false;
		}
		this.setState({
			client_id: this.context.client_id,
			screen_disabled: b,
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

	setUsername(username) {
		this.setState({ username: username });
	}

	setPassword(password) {
		this.setState({ password: password });
	}

	/**
	 * https://laravel.com/docs/9.x/passport#requesting-password-grant-tokens
	 */
	authPasswordGrant = async () => {
		let data_to_send = {
			grant_type: "password",
			scope: "", // vedi anche https://laravel.com/docs/9.x/passport#requesting-all-scopes
			client_id: this.context.client_id,
			client_secret: this.context.client_secret,
			username: this.state.username,
			password: this.state.password,
		};

		let arg1 = "POST: " + URL_OAUTH_LOGIN + " " + JSON.stringify(data_to_send);

		let result = await this.api.callApi2("POST", URL_OAUTH_LOGIN, data_to_send);
		if (result.status != 200) {
			let errorMsg = "HTTP ERROR: " + result.status + "\n" + result.error;
			console.log(errorMsg);

			this.setState({
				data_to_send_printable: arg1,
				response: JSON.stringify(result),
			});

			let errorMsg2 = "HTTP ERROR: " + result.status;
			Alert.alert(errorMsg2);
		} else {
			console.log("loginSuccess(): " + JSON.stringify(data));
			let data = result.data;

			this.setState({
				data_to_send_printable: arg1,
				response: JSON.stringify(data),
			});

			let expiresIn = data.expires_in;
			let accessToken = data.access_token;
			let refreshToken = data.refresh_token;
			let store = new StoreUtil(this.context);
			store.updateContext(this.context.client_id, accessToken, refreshToken, expiresIn);
			Alert.alert("OK: authorized");
		}
	};

	render() {
		return (
			<SafeAreaView>
				<ScrollView style={{ paddingHorizontal: 20 }}>
					<Title>Password Grant</Title>
					<Divider style={{ marginVertical: 5 }} />
					<Paragraph>Client Id: {this.state.client_id}</Paragraph>

					{this.state.screen_disabled && (
						<View>
							<Divider style={{ marginVertical: 20 }} />
							<Paragraph>That client doesn't support the Password Grant flow</Paragraph>
						</View>
					)}

					{!this.state.screen_disabled && (
						<View>
							<TextInput label="Username" value={this.state.username} onChangeText={(text) => this.setUsername(text)} />
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
								disabled={this.state.username === "" || this.state.password === ""}
								mode="contained"
								onPress={this.authPasswordGrant}>
								Login
							</Button>
							<Divider style={{ marginVertical: 20 }} />
							<Subheading>Request</Subheading>
							<Paragraph>{this.state.data_to_send_printable}</Paragraph>
							<Divider style={{ marginVertical: 20 }} />
							<Subheading>Response</Subheading>
							<Paragraph>{this.state.response}</Paragraph>
						</View>
					)}
				</ScrollView>
			</SafeAreaView>
		);
	}
}
