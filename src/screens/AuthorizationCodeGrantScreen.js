import React from 'react';
import { StyleSheet, View, Alert, ScrollView, SafeAreaView } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as AuthSession from 'expo-auth-session';
import {
	Text,
	Title,
	Subheading,
	Headline,
	Caption,
	Button,
	Paragraph,
	Divider,
} from 'react-native-paper';
import HttpCall from '../HttpCall';
import { URL_OAUTH_LOGIN, URL_AUTH, LARAVEL_REDIRECTS } from '../Consts';

import { Context } from '../Context';
import { withTheme } from 'react-native-paper';
import { Switch } from 'react-native-paper';

class AuthorizationCodeGrantScreen extends React.Component {
	static contextType = Context;

	state = {
		response: '',
		redirects_info: [],
		redirects: [],
		redirect_uri: '',
		redirect_uri_desc: '',
		laravel_redirect_uri: '',
		useProxy: false,
		data_to_send_printable: '',
		client_id: 0,
		screen_disabled: true,
		usePkce: true,
	};

	constructor(props) {
		super(props);
		console.log('Theme: ' + JSON.stringify(this.props.theme));
		this.api = new HttpCall();
	}

	async componentDidMount() {
		await this.initRedirects();

		this._unsubscribe = this.props.navigation.addListener('focus', async () => {
			console.log('AuthorizationCodeGrant has focus ****************** ');
			this.updateGui();
		});

		this.updateGui(); // NOTA: l'evento 'focus' non viene invocato se lo screen ha già il focus quando l'app si apre
	}

	updateGui = () => {
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

	initRedirects = async () => {
		let redirects = [];
		let redirects_info = [];

		// Published project in the Expo Client (Environment: Production projects that you expo publish'd and opened in the Expo client.)
		redirects[5] = await AuthSession.makeRedirectUri({});
		redirects_info[5] = '{}';

		// expo client
		// Published project in the Expo Client (Environment: Production projects that you expo publish'd and opened in the Expo client.)
		redirects[2] = (await AuthSession.makeRedirectUri({})) + '/--/expo-auth-session';
		redirects_info[2] = '/--/expo-auth-session';

		// Expo Proxy (Environment: Development or production projects in the Expo client, or in a standalone build.)
		// This proxy service is responsible for:
		// - redirecting traffic from your application to the authentication service
		// - redirecting response from the auth service to your application using a deep link
		// The link is constructed from your Expo username and the Expo app name, which are appended to the proxy website.
		// The auth.expo.io proxy is only used when startAsync is called, or when useProxy: true is passed to the promptAsync() method of an AuthRequest.
		// Should use the `auth.expo.io` proxy: this is useful for testing managed native apps that require a custom URI scheme.
		redirects[3] = await AuthSession.makeRedirectUri({ useProxy: true });
		redirects_info[3] = '{useProxy: true}';

		// To make your native app handle "mycoolredirect://" scheme, simply run:
		// npx uri-scheme add mycoolredirect
		// npx uri-scheme list
		// se also the app.json config file
		redirects[4] = await AuthSession.makeRedirectUri({ native: 'mycoolredirect://' });
		redirects_info[4] = "{native: 'mycoolredirect://'}";

		this.state.redirects = redirects;
		this.state.redirects_info = redirects_info;
	};

	/**
	 * see https://docs.expo.io/guides/authentication/#redirect-uri-patterns
	 */
	updateConfig = (index) => {
		console.log('*************** client id selected: ' + JSON.stringify(index));
		if (index == undefined) {
			this.setState({ screen_disabled: true });
			return;
		}

		let b1 = true;
		if (
			this.context.client_id &&
			(this.context.client_id == 2 ||
				this.context.client_id == 3 ||
				this.context.client_id == 4 ||
				this.context.client_id == 5)
		) {
			b1 = false;
		}
		if (b1) {
			this.setState({ screen_disabled: true });
			return;
		}
		//let client_id = parseInt(itemValue);
		let redirect_uri = this.state.redirects[index];
		let laravel_redirect_uri = LARAVEL_REDIRECTS[index];
		let redirect_uri_desc = this.state.redirects_info[index];
		// The result is
		// For a managed app: https://auth.expo.io/@your-username/your-app-slug/redirect
		// For a web app: https://localhost:19006/redirect

		if (!redirect_uri) {
			console.log('Errore nella logica del metodo, index: ' + index);
		}
		let b2 = false;
		if (index == 3) {
			b2 = true;
		}

		this.setState({
			redirect_uri: redirect_uri,
			redirect_uri_desc: redirect_uri_desc,
			client_id: this.context.client_id,
			screen_disabled: b1,
			useProxy: b2,
			laravel_redirect_uri: laravel_redirect_uri,
		});
	};

	randomString = (length, chars) => {
		let result = '';
		for (let i = length; i > 0; --i) {
			result += chars[Math.floor(Math.random() * chars.length)];
		}
		return result;
	};

	/**
	 * The code verifier should be a random string of between 43 and 128 characters containing letters, numbers and "-", ".", "_", "~"
	 */
	calcVerifier = () => {
		// let randomBytes = await Random.getRandomBytesAsync(128);
		let randomString = this.randomString(
			43,
			'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
		);
		return randomString;
	};

	calcVerifierMock = () => {
		return 'OENZUUJGNXJDOUIzVGJITkJ6Q3A3V2kycG1jbDFJYnRFcExnblFLQ0ZOZQ';
	};

	/**
	 *
	 * Proof Key for Code Exchange by OAuth Public Clients: https://tools.ietf.org/html/rfc7636
	 *
	 * The code challenge should be a Base64 encoded string with URL and filename-safe characters.
	 * The trailing '=' characters should be removed and no line breaks, whitespace, or other additional characters should be present.
	 *
	 * PHP:
	 * $encoded = base64_encode(hash('sha256', $code_verifier, true));
	 * $codeChallenge = strtr(rtrim($encoded, '='), '+/', '-_');
	 *
	 * TEST IT ON: https://tonyxu-io.github.io/pkce-generator/
	 *
	 */
	calcCodeChallenge = async (verifier) => {
		let hash = await this.calcSha256asBase64(verifier);
		return this.toURLEncode(hash);
	};

	calcCodeChallengeMock = () => {
		return 'CUsFvFDG_Q8AtartzgKEEX3vjHuan-a-4iBmvqSJ72E';
	};

	/**
	 * RFC 4648 (see https://tools.ietf.org/html/rfc4648)
	 *
	 * Using standard Base64 in URL requires encoding of '+', '/' and '=' characters
	 * vedi commento del metodo calcCodeChallenge()
	 *
	 */
	toURLEncode = (str) => {
		let encoded = str.replace(/\+/g, '-').replace(/\//g, '_');
		encoded = encoded.replace(/=/g, ''); // questo statement dovrebbe sostituire solo l'ultimo carattere '=', ma in realtà essendocene uno solo è corretto
		return encoded;
	};

	calcSha256 = async (buffer) => {
		let cryptoDigestOptions = { encoding: Crypto.CryptoEncoding.HEX }; // dafault value
		//let cryptoDigestOptions = { encoding: Crypto.CryptoEncoding.BASE64 };
		let digest = await Crypto.digestStringAsync(
			Crypto.CryptoDigestAlgorithm.SHA256,
			buffer,
			cryptoDigestOptions
		);
		return digest;
	};

	calcSha256asBase64 = async (buffer) => {
		let cryptoDigestOptions = { encoding: Crypto.CryptoEncoding.BASE64 };
		let digest = await Crypto.digestStringAsync(
			Crypto.CryptoDigestAlgorithm.SHA256,
			buffer,
			cryptoDigestOptions
		);
		return digest;
	};

	calcState = () => {
		// let randomBytes = await Random.getRandomBytesAsync(10);
		let randomString = this.randomString(
			10,
			'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
		);
		return randomString;
	};

	/**
	 * Rihiede: import Base64 from 'Base64'; npm install Base64
	 */
	// base64 = (str) => {
	//    let base64 = Base64.btoa(str);
	//    return base64;
	//}

	buildUrl = (url, parameters) => {
		var qs = '';
		for (var key in parameters) {
			var value = parameters[key];
			qs += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
		}

		if (qs.length > 0) {
			qs = qs.substring(0, qs.length - 1); // chop off last "&"
			url = url + '?' + qs;
		}

		return url;
	};

	authCodeGrant1 = async () => {
		// AuthRequestConfig (see https://github.com/expo/expo/blob/abfa127e40706ce5b234e219ecc27ed8e7531f23/packages/expo-auth-session/src/AuthRequest.ts#L49)
		let config = {
			clientId: this.context.client_id,
			clientSecret: this.context.client_secret,
			redirectUri: this.state.redirect_uri,
			responseType: 'code', // It's the default value
			scopes: ['*'],
			codeChallengeMethod: 'S256', // It's the default value
			usePKCE: true,
			//	prompt: 'SelectAccount' // None Login Consent SelectAccount (see https://docs.expo.io/versions/latest/sdk/auth-session/#prompt)
		};

		console.log('config : ' + JSON.stringify(config));
		console.log('URL_AUTH : ' + JSON.stringify(URL_AUTH));
		let issuerOrDiscovery = { authorizationEndpoint: URL_AUTH }; // Should use auth.expo.io proxy for redirecting requests. Only works in managed native apps. (https://docs.expo.io/versions/latest/sdk/auth-session/#discoverydocument)
		let request = await AuthSession.loadAsync(config, issuerOrDiscovery);
		let state = request.state;

		const result = await request.promptAsync(issuerOrDiscovery, {
			useProxy: this.state.useProxy,
		}); // When invoked, a web browser will open up and prompt the user for authentication.
		console.log('result: ' + JSON.stringify(result));
		let code = result.params.code;

		//////////////////////////////////////////////////
		// TODO: capire l'utilità dei metodi seguenti
		const urlAuth = await request.makeAuthUrlAsync(issuerOrDiscovery);
		console.log('urlAuth: ' + urlAuth);
		const requestConfig = await request.getAuthRequestConfigAsync();
		console.log('requestConfig: ' + JSON.stringify(requestConfig));
		//////////////////////////////////////////////////
		console.log('result : ' + JSON.stringify(result));

		if (result.type == 'success') {
			if (this.state.usePkce) {
				console.log('use pkce...');
				let verifier = request.codeVerifier;
				console.log('verifier : ' + JSON.stringify(verifier));
				await this.exchangeToken(code, verifier);
			} else {
				await this.exchangeToken2(code);
			}
		} else {
			console.log('WARNING: AuthSessionResult is ' + JSON.stringify(result));
		}
	};

	/**
	 * When requesting an access token using the authorization code grant,
	 * consumers should specify their desired scopes as the scope query string parameter.
	 * The scope parameter should be a space-delimited list of scopes (!)
	 *
	 * https://laravel.com/docs/9.x/passport#requesting-tokens
	 *
	 */
	authCodeGrant2 = async () => {
		let verifier = this.calcVerifier();
		console.log('verifier: ' + verifier);
		let codeChallenge = await this.calcCodeChallenge(verifier);
		console.log('codeChallenge: ' + codeChallenge);
		let state = this.calcState();
		console.log('state: ' + state);

		let config = {
			client_id: this.context.client_id,
			redirect_uri: this.state.redirect_uri,
			response_type: 'code',
			scope: '*', // TODO: la documentazione dice di usare: 'scope' => '',
			state: state,
			code_challenge_method: 'S256',
			code_challenge: codeChallenge,
		};
		console.log('config : ' + JSON.stringify(config));

		let url = this.buildUrl(URL_AUTH, config);

		console.log('authUrl: ' + url);

		// let discovery2 = await AuthSession.fetchDiscoveryAsync('https://hr.iubar.it'); // Fetch a DiscoveryDocument from a well-known resource provider that supports auto discovery.
		// console.log('discovery2; ' + JSON.stringify(discovery2))  // let discovery2 = await AuthSession.fetchDiscoveryAsync('https://hr.iubar.it'); // Fetch a DiscoveryDocument from a well-known resource provider that supports auto discovery.

		// se returnUrl non è specificato, startAsync() calcolerà il valore di dafault con sessionUrlProvider.getDefaultReturnUrl();

		let returnUrl = AuthSession.getDefaultReturnUrl();
		console.log('returnUrl (default): ' + JSON.stringify(returnUrl));

		this.state.data_to_send_printable = 'AuthSession.startAsync({authUrl: ' + url + '})';

		let result = await AuthSession.startAsync({ authUrl: url }); // NOTICE: The auth.expo.io proxy is ALWAYS used (it calls openAuthSessionAsync)
		// Attenzione: redirectUrl rappresenta il deepLink all'app e non ha nulla a che vedere con redirect_uri
		console.log('result: ' + JSON.stringify(result));
		let code = result.params.code;

		/**
		 * Possibili risposte: 'cancel' | 'dismiss' | 'opened' | 'locked'
		 * C'è un errore nella documentazione di Expo, perchè 'success' non è indicato
		 * probabilemnte 'opened' non esiste
		 * https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionresult
		 */
		if (result.type == 'success') {
			if (this.state.usePkce) {
				console.log('use pkce...');
				await this.exchangeToken(code, verifier);
			} else {
				await this.exchangeToken2(code);
			}
		} else {
			console.log('WARNING: AuthSessionResult is ' + JSON.stringify(result));
		}
	};

	/**
	 * Metodo alternativo a exchangeToken()
	 * exchange the authorization code for an access token.
	 * https://laravel.com/docs/9.x/passport#requesting-tokens-converting-authorization-codes-to-access-tokens
	 */
	exchangeToken2 = async (code) => {
		console.log('code: ' + JSON.stringify(code));
		if (code) {
			let data_to_send = {
				client_id: this.context.client_id,
				client_secret: this.context.client_secret,
				redirect_uri: this.state.redirect_uri,
				grant_type: 'authorization_code',
				code: code,
			};
			let arg1 = 'POST: ' + URL_OAUTH_LOGIN + ' ' + JSON.stringify(data_to_send);
			console.log(arg1);

			let result = await this.api.callApi2('POST', URL_OAUTH_LOGIN, data_to_send);
			if (result.status != 200) {
				let errorMsg = 'HTTP ERROR: ' + result.status + '\n' + result.error;
				console.log(errorMsg);

				this.setState({
					data_to_send_printable: arg1,
					response: JSON.stringify(result),
				});

				let errorMsg2 = 'HTTP ERROR: ' + result.status;
				Alert.alert(errorMsg2);
			} else {
				let data = result.data;

				this.setState({
					data_to_send_printable: arg1,
					response: JSON.stringify(data),
				});

				let accessToken = data.access_token;
				let refreshToken = data.refresh_token;
				let expiresIn = data.expires_in;
				this.store.updateContext(
					this.context.client_id,
					accessToken,
					refreshToken,
					expiresIn
				);
				Alert.alert('OK: authorized');
			}
		}
	};

	/**
	 * exchange the authorization code for an access token.
	 * Code Verifier & Code Challenge
	 * As this authorization grant does not provide a client secret, developers will need to generate a combination of a code verifier and a code challenge in order to request a token.
	 * https://laravel.com/docs/9.x/passport#code-grant-pkce-converting-authorization-codes-to-access-tokens
	 */
	exchangeToken = async (code, verifier) => {
		console.log('code: ' + JSON.stringify(code));
		if (code) {
			let data_to_send = {
				client_id: this.context.client_id,
				redirect_uri: this.state.redirect_uri,
				grant_type: 'authorization_code',
				code: code,
				code_verifier: verifier,
			};
			let arg1 = 'POST: ' + URL_OAUTH_LOGIN + ' ' + JSON.stringify(data_to_send);
			console.log(arg1);

			let result = await this.api.callApi2('POST', URL_OAUTH_LOGIN, data_to_send);
			if (result.status != 200) {
				let errorMsg = 'HTTP ERROR: ' + result.status + '\n' + result.error;
				console.log(errorMsg);

				this.setState({
					data_to_send_printable: arg1,
					response: JSON.stringify(result),
				});
				let errorMsg2 = 'HTTP ERROR: ' + result.status;
				Alert.alert(errorMsg2);
			} else {
				let data = result.data;

				this.setState({
					data_to_send_printable: arg1,
					response: JSON.stringify(data),
				});

				let accessToken = data.access_token;
				let refreshToken = data.refresh_token;
				let expiresIn = data.expires_in;
				this.store.updateContext(
					this.context.client_id,
					accessToken,
					refreshToken,
					expiresIn
				);
				Alert.alert('OK: authorized');
			}
		}
	};

	onToggleSwitch = () => this.setState({ usePkce: !this.state.usePkce });

	onToggleSwitch2 = () => console.log('nothing to do');

	render() {
		console.log('rendering....');

		let warning = '';
		if (this.state.redirect_uri != this.state.laravel_redirect_uri) {
			warning =
				'Attenzione, il redirect calcolato è diverso da quello configurato sul server. Se stai utilizzando ExpoGo potrebbe essere corretto.';
		}
		return (
			<SafeAreaView>
				<ScrollView style={{ paddingHorizontal: 20 }}>
					<Title>Auth Code Grant</Title>
					<Paragraph>Client Id: {this.state.client_id}</Paragraph>

					{this.state.screen_disabled && (
						<View>
							<Divider style={{ marginVertical: 20 }} />
							<Paragraph>
								That client doesn't support the Auth Code Grant flow
							</Paragraph>
						</View>
					)}

					{!this.state.screen_disabled && (
						<View>
							<Divider style={{ marginVertical: 20 }} />

							<View
								style={{
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
								}}>
								<Button
									style={{ marginHorizontal: 20, marginVertical: 20 }}
									mode="contained"
									onPress={this.authCodeGrant1}>
									Authorize 1
								</Button>
								<Caption>loadAsync() + promptAsync()</Caption>
								<Button
									color={this.props.theme.colors.accent}
									style={{ marginHorizontal: 20, marginVertical: 20 }}
									mode="contained"
									onPress={this.authCodeGrant2}>
									Authorize 2
								</Button>
								<Caption>startAsync()</Caption>
								<Caption>(usa sempre e comunque il proxy)</Caption>
							</View>
							<Divider style={{ marginVertical: 20 }} />
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
								}}>
								<Caption>use Proxy </Caption>
								<Switch
									color={this.props.theme.colors.primary}
									disabled="true"
									value={this.state.useProxy}
									onValueChange={this.onToggleSwitch2}
								/>
							</View>
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
								}}>
								<Caption>use Pkce </Caption>
								<Switch
									color={this.props.theme.colors.primary}
									value={this.state.usePkce}
									onValueChange={this.onToggleSwitch}
								/>
							</View>
							<Divider style={{ marginVertical: 20 }} />
							<Subheading>Redirect uri</Subheading>
							<Caption>Argument</Caption>
							<Paragraph>{this.state.redirect_uri_desc}</Paragraph>
							<Caption>Result</Caption>
							<Paragraph>{this.state.redirect_uri}</Paragraph>
							{warning && (
								<Paragraph theme={{ colors: { text: 'red' } }}>{warning}</Paragraph>
							)}

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

export default withTheme(AuthorizationCodeGrantScreen);
