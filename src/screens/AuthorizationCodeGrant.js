import React from 'react';
import { Text } from 'react-native-paper';
import { StyleSheet, View, Button, Alert, ScrollView } from 'react-native';
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
import Base64 from 'Base64';

export default class AuthorizationCodeGrant extends React.Component {

    state = {
	    client_id: 2,
	    redirect_uri: '',
	    code: '',
	    access_token: '',
	    api_response: '',
		expanded: false
    }

    updateConfig = async (itemValue) => {
		console.log('item selected: ' + JSON.stringify(itemValue));
		let client_id = parseInt(itemValue);
  		let redirect_uri = await AuthSession.makeRedirectUri(); 
		console.log('redirect_uri; ' + JSON.stringify(redirect_uri));
		// The result is
		// For a managed app: https://auth.expo.io/@your-username/your-app-slug/redirect
		// For a web app: https://localhost:19006/redirect		
		this.setState({client_id: client_id, redirect_uri: redirect_uri, expanded: false});
    }

    randomString = (length, chars) => {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }

/**
* The code verifier should be a random string of between 43 and 128 characters containing letters, numbers and "-", ".", "_", "~"
*/
    calcVerifier = async () => {
        // let randomBytes = await Random.getRandomBytesAsync(128);
        let randomString = this.randomString(43, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        return randomString;
 
    }
	
	
/**
* The code challenge should be a Base64 encoded string with URL and filename-safe characters. 
* The trailing '=' characters should be removed and no line breaks, whitespace, or other additional characters should be present.
*
* PHP:
* $encoded = base64_encode(hash('sha256', $code_verifier, true));
* $codeChallenge = strtr(rtrim($encoded, '='), '+/', '-_');
*
*/
    calcCodeChallenge  = async (verifier) => {
		
		let h = await this.calcSha256(verifier); // OK
		let hash2 = this.base64(h); // se lo statement non è utilizzato rimuovere la dipendneza Base64 da questo file sorgente e dal file package.json
		let hash = await this.calcSha256asBase64(verifier); 
		console.log('h: ' + h);
		console.log('hash2: ' + hash2);
		console.log('hash: ' + hash);
		
        return this.toURLEncode(hash2);
		
    }
	
	/**
	* RFC 4648 (see https://tools.ietf.org/html/rfc4648)
	*/
    toURLEncode = (str) => {
		let encoded = str.replace(/\+/g, '-').replace(/\//g, '_');
		encoded = encoded.replace(/=/g, '');
		return encoded;
    }    	

    calcSha256 = async (buffer) => {
		let cryptoDigestOptions = { encoding: Crypto.CryptoEncoding.HEX }; // dafault value
		//let cryptoDigestOptions = { encoding: Crypto.CryptoEncoding.BASE64 };		
        let digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, buffer, cryptoDigestOptions);		
	    return digest;
    }
	
       calcSha256asBase64 = async (buffer) => {
		let cryptoDigestOptions = { encoding: Crypto.CryptoEncoding.BASE64 };		
        let digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, buffer, cryptoDigestOptions);		
	    return digest;
    }
	
    calcState = () => {
        // let randomBytes = await Random.getRandomBytesAsync(10);
        let randomString = this.randomString(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        return randomString;
    }	

    base64 = (str) => {
        let base64 = Base64.btoa(str);
        return base64;
    }
	

    
    buildUrl = (url, parameters) => {
        var qs = "";
        for (var key in parameters) {
            var value = parameters[key];
            qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
        }

        if (qs.length > 0){
            qs = qs.substring(0, qs.length-1); // chop off last "&"
            url = url + "?" + qs;
        }

        return url;
    }

    authCodeGrant1  = async () => {  
        let verifier = await this.calcVerifier();
		console.log('verifier: ' + verifier); 
		let verifierBase64 =  this.base64(verifier);
		console.log('verifierBase64: ' + verifierBase64); 
		let verifierBase64Encoded =  this.toURLEncode(verifierBase64);
		console.log('verifierBase64Encoded: ' + verifierBase64Encoded); 
        let codeChallenge = await this.calcCodeChallenge(verifier);
 
        let state = this.calcState();
	 
        let url = 'https://hr.iubar.it/oauth/authorize';     
        let config = { // AuthRequestConfig
            clientId: this.state.client_id,
            redirectUri: this.state.redirect_uri,
            responseType: 'code',
            scopes: [], // ['*'],
            state: state,
            codeChallengeMethod: 'S256',
            codeChallenge: codeChallenge,	
            usePKCE: true,
            //	prompt: 'SelectAccount' // None Login Consent SelectAccount
        };         
        console.log('OK');
        let issuerOrDiscovery = {authorizationEndpoint: url}; // Should use auth.expo.io proxy for redirecting requests. Only works in managed native apps. (https://docs.expo.io/versions/latest/sdk/auth-session/#discoverydocument)             
        let request = await AuthSession.loadAsync(config, issuerOrDiscovery)		 
        console.log('OK 2');
        // Prompt for an auth code
        const result = await request.promptAsync({useProxy: true}); // When invoked, a web browser will open up and prompt the user for authentication. 
        console.log('result: ' + JSON.stringify(result));
     
        // Get the URL to invoke
        const url3 = await request.makeAuthUrlAsync(issuerOrDiscovery); // Get the built authorization URL
		console.log('********************');
        console.log('url3: ' + JSON.stringify(url3));
		console.log('********************');
    
        // Get the URL to invoke
        const parsed = result.url;
		console.log('********************');
        console.log('parsed: ' + JSON.stringify(parsed));
		console.log('********************');
         
        let code = result.params.code;
		console.log('********************');
        console.log('code: ' + JSON.stringify(code));          
		console.log('********************');
		
        if (true){
            let access_token = await this.exchangeToken(verifier, code, state);
            this.setState({access_token: access_token});
        }
    }

    authCodeGrant2 = async () => {
        let verifier = await this.calcVerifier();
		console.log('verifier: ' + verifier); 
		let verifierBase64 =  this.base64(verifier);
		console.log('verifierBase64: ' + verifierBase64);
		let verifierBase64Encoded =  this.toURLEncode(verifierBase64);
		console.log('verifierBase64Encoded: ' + verifierBase64Encoded); 		
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
		console.log('discovery: ' + JSON.stringify(discovery));

        /*
        
		    Possibili risposte
		
            If the user cancelled the authentication session by closing the browser, the result is { type: 'cancel' }.
            If the authentication is dismissed manually with AuthSession.dismiss(), the result is { type: 'dismiss' }.
            If the authentication flow is successful, the result is {type: 'success', params: Object, event: Object }
            If the authentication flow is returns an error, the result is {type: 'error', params: Object, errorCode: string, event: Object }
            If you call AuthSession.startAsync more than once before the first call has returned, the result is {type: 'locked'}, because only one AuthSession can be in progress at any time.
        */
		
       let code = discovery.params.code;
       console.log('code: ' + JSON.stringify(code));
	    if (code){
            let access_token = await this.exchangeToken(verifier, code, state);
		    this.setState({access_token: access_token});
	    }		
    }
 
    /**
    * exchange the authorization code for an access token.
    */
    exchangeToken = async (verifier, code, state) => {	        
        let url = 'https://hr.iubar.it/oauth/token';
		console.log('verifier: ' + verifier); 
		console.log('verifier len: ' + verifier.length); // should be 40 
 
        let data = {	  
            client_id: this.state.client_id,
            redirect_uri: this.state.redirect_uri,
            grant_type: 'authorization_code',			
            code: code,		
            code_verifier: verifier
        };
 
        console.log('data: ' + JSON.stringify(data));
  
        let result = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(),
            body:  JSON.stringify(data) ,
        });
     
        const statusCode = result.status;
        console.log('! statusCode: ' + statusCode);          
        let json = await result.json();
        console.log('json: ' + JSON.stringify(json));
     
        let accessToken = json.access_token; 
        console.log('accessToken: ' + JSON.stringify(accessToken));
    
        return accessToken;
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

    callApi = async () => {
	    let url = 'https://hr.iubar.it/api/user'; // see http://192.168.0.103:90/iubar/hr-laravel/public/docs/#api-Frontend-Area_personale_-_Licenza
        let result = await fetch(url, {
            method: 'GET',
		    headers: this.getHeaders2()
        });	
	    let json = await result.json();
	    console.log('json: ' + JSON.stringify(json));
    }

handlePress = () =>
    this.setState({
      expanded: !this.state.expanded 
 
    });
	
    render() {
		return (
            <ScrollView style={{ paddingVertical: 40, paddingHorizontal: 20 }}>
	            <Title>Config</Title>	  
                <List.Section title="Client type">
                    <List.Accordion title={this.state.client_id} expanded={this.state.expanded} onPress={this.handlePress}>
                        <List.Item title="2 - Code Grant for Expo (dev app)" onPress={() => this.updateConfig(2)} />
                        <List.Item title="3 - Code Grant for Expo (web)" onPress={() => this.updateConfig(3)} />
                        <List.Item title="4 - Code Grant for Expo (standalone managed app)" onPress={() => this.updateConfig(4)} />
                        <List.Item title="5 - Password credential" onPress={() => this.updateConfig(5)} />  
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
                <Subheading>Authorization code</Subheading>
                <Paragraph>{this.state.code}</Paragraph>
                <Paragraph>Access token: {this.state.access_token}</Paragraph>
                <Paragraph>Api response: {this.state.api_response}</Paragraph>
                <Divider />
                <Button
                    title="Call api"
                    onPress={this.callApi}
                    disabled={this.state.access_token === '' || this.state.access_token === undefined}
                />
            </ScrollView>
        );
    }

}