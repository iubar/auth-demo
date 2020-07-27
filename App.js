import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Button, Alert, ScrollView } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as Random from 'expo-random';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import {Picker} from '@react-native-community/picker';
import { Title } from 'react-native-paper';
import { Subheading } from 'react-native-paper';
import { Paragraph } from 'react-native-paper';
import { Divider } from 'react-native-paper';
import { List } from 'react-native-paper';
import { TextInput } from 'react-native-paper';
import { BottomNavigation } from 'react-native-paper';

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

callApi = async () => {
	 let url = 'https://hr.iubar.it/area-personale/licenza'; // see http://192.168.0.103:90/iubar/hr-laravel/public/docs/#api-Frontend-Area_personale_-_Licenza
      let result = await fetch(url, {
        method: 'GET',
		headers: this.getHeaders2()
      });	
	      let json = await result.json();
	  console.log('json: ' + JSON.stringify(json));
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
		
 	let code = null;
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
   let email = this.state.username;
      let password = this.state.password;
	 
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

setUsername(username) {
    this.setState({username: username});
}

setPassword(password) {
    this.setState({password: password});
}
    render(){
		return (
            <ScrollView style={{ paddingVertical: 40, paddingHorizontal: 20 }}>
	            <Title>Config</Title>	  
                <List.Section title="Client type">
                    <List.Accordion
                        title={this.state.client_id}
                    >
                        <List.Item title="Code Grant for Expo (dev app)" onPress={() => this.updateConfig(2)} />
                        <List.Item title="Code Grant for Expo (web)" onPress={() => this.updateConfig(3)} />
                        <List.Item title="Code Grant for Expo (standalone managed app)" onPress={() => this.updateConfig(4)} />
                        <List.Item title="Password credential" onPress={() => this.updateConfig(5)} />  
                    </List.Accordion>
                </List.Section>
	            <Paragraph>Client id: {this.state.client_id}</Paragraph>
		        <Paragraph>Redirect uri: {this.state.redirect_uri}</Paragraph>
                <Divider />
	            <Subheading>Authorization Code Grant with PKCE</Subheading>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                    <Button
                        title="Authorize 1"          
                        onPress={this.authCodeGrant1}
                    />
                    <Button
                        title="Authorize 2"          
                        onPress={this.authCodeGrant2}
                    />
                </View>
		        <Divider />
		        <Subheading>Password Grant</Subheading>
                    <TextInput
                        label="Username"
                        value={this.state.username}
                        onChangeText={text => this.setUsername(text)}
                    />
                    <View>
                    <TextInput
                        label="Password"
                        secureTextEntry
                        value={this.state.password}
                        onChangeText={text => this.setPassword(text)}
                    />
                </View>
		        <Button
                    title="Login"          
                    onPress={this.authPasswordGrant}
                />		
		        <Divider />
		        <Subheading>Authorization code (solo per auth code grant)</Subheading>
		        <Paragraph>{this.state.code}</Paragraph>
		        <Paragraph>Access token: {this.state.access_token}</Paragraph>
		        <Paragraph>Api response: {this.state.api_response}</Paragraph>
                <StatusBar style="auto" />
            </ScrollView>
		)
	}
}
