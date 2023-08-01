import React from 'react';
import { StyleSheet, View, Alert, ScrollView } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as AuthSession from 'expo-auth-session';
import { Text, Title, Subheading, Headline, Caption, Button, Paragraph, Divider } from 'react-native-paper';
import HttpCall from '../HttpCall';
import { URL_OAUTH_LOGIN, URL_AUTH, LARAVEL_REDIRECTS } from '../Consts';
import StoreUtil from '../StoreUtil';
import { Context } from '../Context';
import { withTheme } from 'react-native-paper';
import { Switch } from 'react-native-paper';
import { useAutoDiscovery, useAuthRequest } from 'expo-auth-session';

class AuthorizationCodeGrantScreen extends React.Component {
	static contextType = Context;

	state = {
		response: '',
		redirects_info: [],
		redirects: [],
		redirect_uri: '',
		redirect_uri_desc: '',
		laravel_redirect_uri: '',
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
		this._unsubscribe = this.props.navigation.addListener('focus', async () => {
			await this.updateGui();
		});

		await this.updateGui(); // NOTA: l'evento 'focus' non viene invocato se lo screen ha già il focus quando l'app si apre
	}

	updateGui = async () => {
		await this.updateConfig(this.context.client_id);
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
		redirects[2] = (await AuthSession.makeRedirectUri()) + '/--/expo-auth-session';
		redirects_info[2] = '/--/expo-auth-session';

		// Published project in the Expo Client (Environment: Production projects that you expo publish'd and opened in the Expo client.)
		redirects[5] = await AuthSession.makeRedirectUri();
		redirects_info[5] = '{}';

		redirects[7] = redirects[2];
		redirects_info[7] = redirects_info[2];

		redirects[8] = redirects[2];
		redirects_info[8] = redirects_info[2];
		redirects[9] = redirects[5];
		redirects_info[9] = redirects_info[5];
		redirects[10] = redirects[2];
		redirects_info[10] = redirects_info[2];

		// Expo Proxy (Environment: Development or production projects in the Expo client, or in a standalone build.)
		// This proxy service is responsible for:
		// - redirecting traffic from your application to the authentication service
		// - redirecting response from the auth service to your application using a deep link
		// The link is constructed from your Expo username and the Expo app name, which are appended to the proxy website.
		redirects[3] = redirects[2];
		redirects_info[3] = redirects_info[5];

		// To make your native app handle "mycoolredirect://" scheme, simply run:
		// npx uri-scheme add mycoolredirect
		// npx uri-scheme list
		// se also the app.json config file
		redirects[4] = await AuthSession.makeRedirectUri({
			native: 'mycoolredirect://',
		});
		redirects_info[4] = "{native: 'mycoolredirect://'}";

		this.state.redirects = redirects;
		this.state.redirects_info = redirects_info;
	};

	/**
	 * see https://docs.expo.io/guides/authentication/#redirect-uri-patterns
	 */
	updateConfig = async (index) => {
		if (index == undefined) {
			this.setState({ screen_disabled: true });
			return;
		}

		await this.initRedirects();

		let b1 = true;
		if (this.context.client_id && this.context.client_id > 0 && this.context.client_id != 1 && this.context.client_id != 6) {
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

		this.setState({
			redirect_uri: redirect_uri,
			redirect_uri_desc: redirect_uri_desc,
			client_id: this.context.client_id,
			screen_disabled: b1,
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
		let randomString = this.randomString(43, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
		return randomString;
	};

	/**
	 * The state parameter is used to provide protection against Cross-Site Request Forgery (CSRF) attacks on OAuth
	 */
	calcState = () => {
		// let randomBytes = await Random.getRandomBytesAsync(10);
		let randomString = this.randomString(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
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
	 * see also https://laravel.com/docs/9.x/passport#code-grant-pkce-redirecting-for-authorization
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
		let digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, buffer, cryptoDigestOptions);
		return digest;
	};

	calcSha256asBase64 = async (buffer) => {
		let cryptoDigestOptions = { encoding: Crypto.CryptoEncoding.BASE64 };
		let digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, buffer, cryptoDigestOptions);
		return digest;
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
		/**
		 * AuthRequestConfig (see https://docs.expo.dev/versions/latest/sdk/auth-session/#authrequestconfig)
		 */
		let config = null;
		if (this.state.usePkce) {
			config = {
				clientId: this.context.client_id,
				// clientSecret: this.context.client_secret,
				// codeChallenge: ....
				redirectUri: this.state.redirect_uri,
				responseType: 'code',
				scopes: ['*'],
				codeChallengeMethod: 'S256',
				usePKCE: true,
				//	prompt: 'SelectAccount' // None Login Consent SelectAccount (see https://docs.expo.io/versions/latest/sdk/auth-session/#prompt)
			};
		} else {
			config = {
				clientId: this.context.client_id,
				// clientSecret: this.context.client_secret,
				// codeChallenge: ....
				redirectUri: this.state.redirect_uri,
				responseType: 'code', // It's the default value
				scopes: ['*'],
				usePKCE: false,
				//	prompt: 'SelectAccount' // None Login Consent SelectAccount (see https://docs.expo.io/versions/latest/sdk/auth-session/#prompt)
			};
		}

		console.log('config : ' + JSON.stringify(config));
		console.log('URL_AUTH : ' + JSON.stringify(URL_AUTH));
		let issuerOrDiscovery = { authorizationEndpoint: URL_AUTH }; // Should use auth.expo.io proxy for redirecting requests. Only works in managed native apps. (https://docs.expo.io/versions/latest/sdk/auth-session/#discoverydocument)
		let request = await AuthSession.loadAsync(config, issuerOrDiscovery);

		console.log('request.state : ' + JSON.stringify(request.state));
		let result = null;
		if (true) {
			result = await request.promptAsync(); // When invoked, a web browser will open up and prompt the user for authentication.
		} else {
			const discovery = useAutoDiscovery('https://hr.iubar.it');
			result = await request.promptAsync(discovery);
		}
		if (result.type != 'success') {
			// es: "error"  or "dismiss"
			console.log('WARNING: result.type is ' + JSON.stringify(result.type));
			return null;
		} else {
			console.log('result: ' + JSON.stringify(result));
		}
		let code = result.params.code;
		if (this.state.usePkce) {
			let verifier = request.codeVerifier;
			await this.exchangeToken(code, verifier);
		} else {
			await this.exchangeToken2(code);
		}
	};

	/**
	 * Metodo alternativo a exchangeToken()
	 * exchange the authorization code for an access token.
	 * https://laravel.com/docs/9.x/passport#requesting-tokens-converting-authorization-codes-to-access-tokens
	 */
	exchangeToken2 = async (code) => {
		console.log('exchangeToken2()');
		if (!code) {
			return null;
		}
		let data_to_send = {
			client_id: this.context.client_id,
			client_secret: this.context.client_secret,
			redirect_uri: this.state.redirect_uri,
			grant_type: 'authorization_code',
			code: code,
		};
		let arg1 = 'POST: ' + URL_OAUTH_LOGIN + ' ' + JSON.stringify(data_to_send);

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
			let store = new StoreUtil(this.context);
			store.updateContext(this.context.client_id, accessToken, refreshToken, expiresIn);
			Alert.alert('OK: authorized');
		}
	};

	/**
	 * exchange the authorization code for an access token.
	 * Code Verifier & Code Challenge
	 * As this authorization grant does not provide a client secret, developers will need to generate a combination of a code verifier and a code challenge in order to request a token.
	 * https://laravel.com/docs/9.x/passport#code-grant-pkce-converting-authorization-codes-to-access-tokens
	 */
	exchangeToken = async (code, verifier) => {
		console.log('exchangeToken()');
		if (!code) {
			return null;
		}
		let data_to_send = {
			client_id: this.context.client_id,
			client_secret: this.context.client_secret,
			redirect_uri: this.state.redirect_uri,
			grant_type: 'authorization_code',
			code: code,
			code_verifier: verifier,
		};
		let arg1 = 'POST: ' + URL_OAUTH_LOGIN + ' ' + JSON.stringify(data_to_send);

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
			let store = new StoreUtil(this.context);
			store.updateContext(this.context.client_id, accessToken, refreshToken, expiresIn);
			Alert.alert('OK: authorized');
		}
	};

	onToggleSwitch = () => this.setState({ usePkce: !this.state.usePkce });

	render() {
		console.log('rendering....');

		let warning = '';
		if (this.state.redirect_uri != this.state.laravel_redirect_uri) {
			warning =
				'Attenzione, il redirect calcolato è diverso da quello configurato sul server. Se stai utilizzando ExpoGo potrebbe essere corretto.';
		}
		return (
			<View>
				<ScrollView style={{ paddingHorizontal: 20 }}>
					<Title>Auth Code Grant</Title>
					<Divider style={{ marginVertical: 5 }} />
					<Paragraph>Client Id: {this.state.client_id}</Paragraph>

					{this.state.screen_disabled && (
						<View>
							<Divider style={{ marginVertical: 20 }} />
							<Paragraph>That client doesn't support the Auth Code Grant flow</Paragraph>
						</View>
					)}

					{!this.state.screen_disabled && (
						<View>
							<View style={styles.box}>
								<View style={styles.centered}>
									<Button
										style={{ marginHorizontal: 20, marginVertical: 20 }}
										mode="contained"
										onPress={this.authCodeGrant1}>
										Authorize 1
									</Button>
									<Caption>loadAsync() + promptAsync()</Caption>
								</View>
							</View>
							<Divider style={{ marginVertical: 20 }} />
							<View style={styles.centered}>
								<View style={styles.inline}>
									<Caption>use Pkce </Caption>
									<Switch
										color={this.props.theme.colors.primary}
										value={this.state.usePkce}
										onValueChange={this.onToggleSwitch}
									/>
								</View>
								<Caption>
									Quando non utilizzo PKCE devo impostare obbligoriamete un valore per il parametro client_secret.
									Pertanto solo i client 7 e 10 sono compatibili con la modalità PKCE = false.
								</Caption>
							</View>
							<Divider style={{ marginVertical: 20 }} />
							<Subheading>Redirect</Subheading>
							<Caption>Description</Caption>
							<Paragraph>{this.state.redirect_uri_desc}</Paragraph>
							<Caption>Uri at runtime</Caption>
							<Paragraph>{this.state.redirect_uri}</Paragraph>
							{warning && <Paragraph theme={{ colors: { text: 'red' } }}>{warning}</Paragraph>}

							<Divider style={{ marginVertical: 20 }} />
							<Subheading>Request</Subheading>
							<Paragraph>{this.state.data_to_send_printable}</Paragraph>
							<Divider style={{ marginVertical: 20 }} />
							<Subheading>Response</Subheading>
							<Paragraph>{this.state.response}</Paragraph>
						</View>
					)}
				</ScrollView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		margin: 10,
	},
	box: {
		//height: 40,
		borderWidth: 0.5,
		padding: 20,
		borderColor: 'gray',
	},
	centered: {
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
	},
	inline: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default withTheme(AuthorizationCodeGrantScreen);
