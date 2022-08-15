import React from 'react';
import { StyleSheet, View, Alert, ScrollView, SafeAreaView } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as AuthSession from 'expo-auth-session';
import { Text, Title, Subheading, Button, Paragraph, Divider, List } from 'react-native-paper';
import HttpCall from '../HttpCall';
import { URL_OAUTH_LOGIN, URL_AUTH, OAUTH_CLIENT_SECRET } from '../Consts';
import StoreUtil from '../StoreUtil';
import { Context } from '../Context';
import { withTheme } from 'react-native-paper';

class AuthorizationCodeGrantScreen extends React.Component {
	static contextType = Context;

	state = {
		redirects_descs: [],
		redirects: [],
		redirect_uri: '',
		access_token: '',
		expanded: false,
		useProxy: false,
		data_to_send_printable: '',
	};

	constructor(props) {
		super(props);
		console.log('Theme: ' + JSON.stringify(this.props.theme));
		this.api = new HttpCall();
	}

	async componentDidMount() {
		this.store = new StoreUtil(this.context);
		await this.initRedirects();
		await this.updateConfig(1);

		this._unsubscribe = this.props.navigation.addListener('focus', () => {
			console.log('AuthorizationCodeGrant has focus ****************** ');
			this.setState({ access_token: this.context.accessToken });
		});

		// NOTA: l'evento 'focus' non viene invocato se lo screen ha già il focus quando l'app si apre
	}

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
		let redirects_descs = [];
		let redirect_uri = null;

		// Published project in the Expo Client (Environment: Production projects that you expo publish'd and opened in the Expo client.)
		redirect_uri = await AuthSession.makeRedirectUri({});
		redirects[1] = redirect_uri;
		redirects_descs[1] = '{}';

		// expo client
		// Published project in the Expo Client (Environment: Production projects that you expo publish'd and opened in the Expo client.)
		redirect_uri = (await AuthSession.makeRedirectUri({})) + '/--/expo-auth-session';
		redirects[2] = redirect_uri;
		redirects_descs[2] = '/--/expo-auth-session';

		// Expo Proxy (Environment: Development or production projects in the Expo client, or in a standalone build.)
		// This proxy service is responsible for:
		// - redirecting traffic from your application to the authentication service
		// - redirecting response from the auth service to your application using a deep link
		// The link is constructed from your Expo username and the Expo app name, which are appended to the proxy website.
		// The auth.expo.io proxy is only used when startAsync is called, or when useProxy: true is passed to the promptAsync() method of an AuthRequest.
		// Should use the `auth.expo.io` proxy: this is useful for testing managed native apps that require a custom URI scheme.
		redirect_uri = await AuthSession.makeRedirectUri({ useProxy: true });

		redirects[3] = redirect_uri; // USE PROXY
		redirects_descs[3] = '{useProxy: true}';

		// To make your native app handle "mycoolredirect://" scheme, simply run:
		// npx uri-scheme add mycoolredirect
		// npx uri-scheme list
		// se also the app.json config file
		redirect_uri = await AuthSession.makeRedirectUri({ native: 'mycoolredirect://' });
		redirects[4] = redirect_uri; // NATIVE
		redirects_descs[4] = "{native: 'mycoolredirect://'}";

		this.state.redirects = redirects;
		this.state.redirects_descs = redirects_descs;
	};

	/**
	 * see https://docs.expo.io/guides/authentication/#redirect-uri-patterns
	 */
	updateConfig = async (index) => {
		console.log('*************** item selected: ' + JSON.stringify(index));
		//let client_id = parseInt(itemValue);
		let redirect_uri = this.state.redirects[index];
		// The result is
		// For a managed app: https://auth.expo.io/@your-username/your-app-slug/redirect
		// For a web app: https://localhost:19006/redirect

		if (!redirect_uri) {
			Alert.alert('Errore nella logica del metodo, index: ' + index);
		}
		this.state.useProxy = false;
		if (index == 3) {
			this.state.useProxy = true;
		}
		this.setState({
			redirect_uri: redirect_uri,
			expanded: false,
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
		let verifier = request.codeVerifier;
		const result = await request.promptAsync(issuerOrDiscovery, {
			useProxy: this.state.useProxy,
		}); // When invoked, a web browser will open up and prompt the user for authentication.

		//////////////////////////////////////////////////
		const urlAuth = await request.makeAuthUrlAsync(issuerOrDiscovery);
		console.log('urlAuth: ' + urlAuth);
		const requestConfig = await request.getAuthRequestConfigAsync();
		console.log('requestConfig: ' + JSON.stringify(requestConfig));
		//////////////////////////////////////////////////

		console.log('verifier : ' + JSON.stringify(verifier));
		console.log('result : ' + JSON.stringify(result));

		if (result.params == 'opened') {
			console.log('result.params !== undefined');
			let code = result.params.code;
			console.log('code : ' + JSON.stringify(code));
			await this.exchangeToken(verifier, code);
		} else {
			console.log('WARNING: AuthSessionResult is ' + result.params);
		}
	};

	/**
	 * When requesting an access token using the authorization code grant,
	 * consumers should specify their desired scopes as the scope query string parameter.
	 * The scope parameter should be a space-delimited list of scopes (!)
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
			scope: '*',
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

		let result = await AuthSession.startAsync({ authUrl: url }); // The auth.expo.io proxy is ALWAYS used  (it calls openAuthSessionAsync)
		// Attenzione: redirectUrl rappresenta il deepLink all'app e non ha nulla a che vedere con redirect_uri
		console.log('result: ' + JSON.stringify(result));

		/**
		 * Possibili risposte: 'cancel' | 'dismiss' | 'opened' | 'locked'
		 */
		if (result.params == 'opened') {
			let code = result.params.code;
			await this.readToken(verifier, code);
		} else {
			console.log('WARNING: AuthSessionResult is ' + result.params);
		}
	};

	/**
	 * exchange the authorization code for an access token.
	 */
	exchangeToken = async (verifier, code) => {
		console.log('code: ' + JSON.stringify(code));
		if (code) {
			let data_to_send = {
				client_id: this.context.client_id,
				redirect_uri: this.state.redirect_uri,
				grant_type: 'authorization_code',
				code: code,
				code_verifier: verifier,
			};
			console.log('data_to_send: ' + JSON.stringify(data_to_send));

			let accessToken = '';
			let result = await this.api.callApi2('POST', URL_OAUTH_LOGIN, data_to_send);
			if (result.status != 200) {
				let errorMsg = 'HTTP ERROR: ' + result.status + '\n' + result.error;
				console.log(errorMsg);
				Alert.alert(errorMsg);
			} else {
				let data = result.data;
				accessToken = data.access_token;
				let refreshToken = data.refresh_token;
				let expiresIn = data.expires_in;
				this.store.saveTokens(accessToken, refreshToken, expiresIn);
				Alert.alert('Authentication done: token saved');
			}
			this.setState({
				access_token: accessToken,
				data_to_send_printable:
					'POST: ' + URL_OAUTH_LOGIN + ' ' + JSON.stringify(data_to_send),
			});
		}
	};

	handlePress = () => this.setState({ expanded: !this.state.expanded });

	render() {
		console.log('rendering....');
		return (
			<SafeAreaView>
				<ScrollView style={{ paddingHorizontal: 20 }}>
					<Title>Auth Code Grant with PKCE</Title>
					<List.Section title="Redirects uri">
						<List.Accordion
							title={this.state.redirect_uri}
							expanded={this.state.expanded}
							onPress={this.handlePress}>
							{this.state.redirects.map((elem, index) => {
								if (elem) {
									return (
										<List.Item
											key={index}
											title={this.state.redirects_descs[index] + ' - ' + elem}
											onPress={() => this.updateConfig(index)}
										/>
									);
								}
							})}
						</List.Accordion>
					</List.Section>
					<Divider style={{ marginVertical: 20 }} />
					<Paragraph>Client Id: {this.context.client_id}</Paragraph>

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
						<Text>[loadAsync() + promptAsync()]</Text>
						<Button
							color={this.props.theme.colors.accent}
							style={{ marginHorizontal: 20, marginVertical: 20 }}
							mode="contained"
							onPress={this.authCodeGrant2}>
							Authorize 2
						</Button>
						<Text>[startAsync(), it always uses proxy]</Text>
					</View>
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

export default withTheme(AuthorizationCodeGrantScreen);