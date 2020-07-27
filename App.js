import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as Random from 'expo-random';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import {Picker} from '@react-native-community/picker';


export default class App extends React.Component {	

state = {
	client_id: 2,
	redirect_uri: '',
	code: '.',
	access_token: '.',
	api_response: '.'	
}

	async componentDidMount(){
		console.log('Welcome');
	}
	
getHeaders = () => {		  
    let headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    };
    return headers;
  }
  
  getHeaders2 = () => {		  
    let headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: 'Bearer ' + this.state.access_token,
    };
    return headers;
  }
  
	base64URLEncode = (str) => {
		console.log('base64URLEncode: ' + str);
		return str.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=/g, '');
	}

	calcSha256 = async (buffer) => {
		console.log('buffer: ' + buffer);
       const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        // 'Github stars are neat 🌟'
		buffer
      );
	return digest;
	}
	
	
buildUrl = (url, parameters) => {
  var qs = "";
  for(var key in parameters) {
    var value = parameters[key];
    qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
  }
  if (qs.length > 0){
    qs = qs.substring(0, qs.length-1); // chop off last "&"
    url = url + "?" + qs;
  }
  return url;
}


calcVerifier = async () => {
	let randomBytes = await Random.getRandomBytesAsync(32);
	let verifier = this.base64URLEncode(randomBytes);
	return verifier;
}

calcCodeChallenge  = async (verifier) => {
	let hash = await this.calcSha256(verifier);
	let codeChallenge = this.base64URLEncode(hash);
	return codeChallenge;
}

calcState = async () => {
	let randomBytes = await Random.getRandomBytesAsync(8);
	let state = this.base64URLEncode(randomBytes);
}		 
		 
authCodeGrant1  = async () => {
  
	let verifier = await this.calcVerifier();
	let codeChallenge = await this.calcCodeChallenge(verifier);
	let state = this.calcState();
	let url = 'https://hr.iubar.it/oauth/authorize';
		 
 
		let config = { // AuthRequestConfig
			clientId: this.state.client_id,
			redirectUri: this.state.redirect_uri,
			responseType: 'code',
			scopes: ['*'],
			state: state,
			codeChallengeMethod: 'S256',
			codeChallenge: codeChallenge,	
			usePKCE: true,
		//	prompt: 'SelectAccount' // None Login Consent SelectAccount
		};
	 
 
let issuerOrDiscovery = {authorizationEndpoint: url}; // Should use auth.expo.io proxy for redirecting requests. Only works in managed native apps. (https://docs.expo.io/versions/latest/sdk/auth-session/#discoverydocument)
		 
let request = await AuthSession.loadAsync(config, issuerOrDiscovery)		 
 
// Prompt for an auth code
const result = await request.promptAsync({useProxy: true}); // When invoked, a web browser will open up and prompt the user for authentication. 
console.log('result: ' + JSON.stringify(result));
 
 	 // Get the URL to invoke
	 const url3 = await request.makeAuthUrlAsync(issuerOrDiscovery); // Get the built authorization URL
	 console.log('url3: ' + JSON.stringify(url3));

// Get the URL to invoke
		const parsed = result.url;
	 console.log('parsed: ' + JSON.stringify(parsed));
	 
	 let code = result.params.code;
	  console.log('code: ' + JSON.stringify(code));
	  
	  
	 if(code){
		let access_token = await this.exchangeToken(verifier, code);
		this.setState({access_token: access_token});
	 }else{
		// 
	 }
	  
}

callApi = () => {
	 let url = 'https://hr.iubar.it/area-personale/licenza?code=' + code; // see http://192.168.0.103:90/iubar/hr-laravel/public/docs/#api-Frontend-Area_personale_-_Licenza
}

/**
* exchange the authorization code for an access token.
*/
exchangeToken = async (verifier, code) => {	
	 let url = 'https://hr.iubar.it/oauth/token';
	 let data = {	  
			client_id: this.state.client_id,
			code: code,		
			grant_type: 'authorization_code',
            redirect_uri: this.state.redirect_uri,
            code_verifier: verifier
		};
   
      let result = await fetch(url, {
        method: 'POST',
		headers: this.getHeaders(),
		body: JSON.stringify(data),
      });
	  
	  const statusCode = result.status;
	  console.log('statusCode: ' + statusCode);
	  
  	  console.log('result: ' + JSON.stringify(result));
	  
	  
      let json = await result.json();
	  console.log('json: ' + JSON.stringify(json));
	  
	  	 let accessToken = json.access_token; 
	  console.log('accessToken: ' + JSON.stringify(accessToken));
	 
	 return accessToken;
	  
}

 
authCodeGrant2 = async () => {
		 		
 	 
	let verifier = await this.calcVerifier();
	let codeChallenge = await this.calcCodeChallenge(verifier);
	let state = this.calcState();
 
	 let url = 'https://hr.iubar.it/oauth/authorize';
		 
 
		let config = {	 
			client_id: this.state.client_id,
			redirect_uri: this.state.redirect_uri,
			response_type: 'code',
			scope: '*',
			state: state,
			code_challenge_method: 'S256',
			code_challenge: codeChallenge 
		};
	  url = this.buildUrl(url, config)
  
	console.log('url; ' + JSON.stringify(url));
						
		// let discovery2 = await AuthSession.fetchDiscoveryAsync('https://hr.iubar.it'); // Fetch a DiscoveryDocument from a well-known resource provider that supports auto discovery.
		// console.log('discovery2; ' + JSON.stringify(discovery2))  
		let discovery = await AuthSession.startAsync({authUrl: url, returnUrl : this.state.redirect_uri, showInRecents: false}); // The auth.expo.io proxy is used 
		console.log('discovery; ' + JSON.stringify(discovery));
;

/*
		
		Possibili risposte
		
If the user cancelled the authentication session by closing the browser, the result is { type: 'cancel' }.
If the authentication is dismissed manually with AuthSession.dismiss(), the result is { type: 'dismiss' }.
If the authentication flow is successful, the result is {type: 'success', params: Object, event: Object }
If the authentication flow is returns an error, the result is {type: 'error', params: Object, errorCode: string, event: Object }
If you call AuthSession.startAsync more than once before the first call has returned, the result is {type: 'locked'}, because only one AuthSession can be in progress at any time.

*/
		
 
	 if(code){
		let access_token = await this.exchangeToken(verifier, code);
		this.setState({access_token: access_token});
	 }else{
		// 
	 }
		
	 }
 
 authPasswordGrant = async () => {
    console.log('loginFetch');
 
    try {
 
	let url = 'https://hr.iubar.it/oauth/authorize';
 
 let OAUTH_CLIENT_SECRECT = '';
   let email = '';
      let password = '';
	 
      let result = await fetch(url, {
        method: 'POST',
		headers: this.getHeaders(),
        body: JSON.stringify({
          grant_type: 'password',
          client_id: this.state.client_id,
          client_secret: OAUTH_CLIENT_SECRECT,
          username: email,
          password: password,
          scope: '', // oppure  'scope' => '*',
        }),
      });
	  

      const statusCode = result.status;
      let json = await result.json();

      if (statusCode != 200) {
        console.log('HTTP ERROR: ' + statusCode + ' (GET: ' + url + ')');
		console.log('HTTP MESSAGE; ' + JSON.stringify(json));
        if (json && json.hasOwnProperty('error_description')) {
          //this.loginFailure(json.error_description);
		  console.log(json.error_description);
          // TODO: come traduciamo i messaggi di socialite ? (verificare con Daniele)
          // eg: 'The user credentials were incorrect.'
        } else if (json && json.hasOwnProperty('error')) {
          //this.loginFailure(json.error);
		  console.log(json.error);
        } else {
          //this.loginFailure('HTTP ERROR: ' + statusCode);
		  console.log('HTTP ERROR: ' + statusCode);
        }
      } else {
        console.log('HTTP OK: ' + statusCode + ' (POST: ' + LOGIN_URL + ')');
        //this.loginSuccess(email, json);
		
		    console.log('loginSuccess(): ' + JSON.stringify(json));

    let token_type = json.token_type;
    let expires_in = json.expires_in;
    let access_token = json.access_token;
    let refresh_token = json.refresh_token;
	this.setState({access_token: access_token});
	
      }
    } catch (error) {
      console.log('ERROR', error.message);
      //this.loginFailure(error.message);
      // Error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        // console.log(error.response.data);
        // console.log(error.response.status);
        // console.log(error.response.headers);
        console.log('Error, server ', error.response);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log('Error, no response', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Unexpected error', error.message);
      }
     // throw error;
    }
  }
		
		
		
updateConfig = async (itemValue) => {
		console.log('item selected: ' + JSON.stringify(itemValue));
		let client_id = parseInt(itemValue);
  		let redirect_uri = await AuthSession.makeRedirectUri(); 
		console.log('redirect_uri; ' + JSON.stringify(redirect_uri));
		// The result is
		// For a managed app: https://auth.expo.io/@your-username/your-app-slug/redirect
		// For a web app: https://localhost:19006/redirect		
		this.setState({client_id: client_id, redirect_uri: redirect_uri});
}


    render(){
		return (
    <View style={styles.container}>
      
	  {/*
      <Button
          title="Press me"          
          onPress={() => Alert.alert('Hello')}
        />
	  */}
	  
	  <Text>Config</Text>	  
 
  <Text>Client type</Text>	
<Picker
  selectedValue={this.state.client_id}
  style={{height: 50, width: 100}}
  onValueChange={(itemValue, itemIndex) => this.updateConfig(itemValue)}>
  <Picker.Item label="Code Grant for Expo (dev app)" value="2" />
  <Picker.Item label="Code Grant for Expo (web)" value="3" />
  <Picker.Item label="Code Grant for Expo (standalone/managed app)" value="4" />
  <Picker.Item label="Password credential" value="5" />  
</Picker>

	<Text>Client id</Text>
	<Text>{this.state.client_id}</Text>
		  <Text>Redirect uri</Text>
	  <Text>{this.state.redirect_uri}</Text>
	  
	<Text>---------------------------</Text>
	<Text>Authorization Code Grant with PKCE</Text>
      <Button
          title="Authorize 1"          
          onPress={this.authCodeGrant1}
        />		
      <Button
          title="Authorize 2"          
          onPress={this.authCodeGrant2}
        />
		<Text>---------------------------</Text>
		<Text>Password Grant</Text>
		<Text>User</Text>
		<Text>Password</Text>
		      <Button
          title="Login"          
          onPress={this.authPasswordGrant}
        />
		
		<Text>---------------------------</Text>
		<Text>Authorization code (solo per auth code grant)</Text>
		<Text>{this.state.code}</Text>
		
		<Text>Access token</Text>
		<Text>{this.state.access_token}</Text>
		
		<Text>Api response</Text>
		<Text>{this.state.api_response}</Text>
 
	
      <StatusBar style="auto" />
    </View>
		)
	}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
