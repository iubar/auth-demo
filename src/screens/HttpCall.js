import React from 'react';
import { StyleSheet, View, Alert, ScrollView, SafeAreaView } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as Random from 'expo-random';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import { Paragraph, Divider, Caption, Title, Button, Subheading} from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';


export default class HttpCall extends React.Component {

    state = {
        accessToken: '',
        refreshToken: '',
        expiresIn: '',
        client_id: '', 
        client_secret: '',
		data_to_send: '',
        response: ''               
    }

    readDataFromStorage = async () => {
        let accessToken = await SecureStore.getItemAsync('accessToken');
        let refreshToken = await SecureStore.getItemAsync('refreshToken');
        let expiresIn = await SecureStore.getItemAsync('expiresIn');
        let client_id = await SecureStore.getItemAsync('clientId');
        let client_secret = await SecureStore.getItemAsync('clientSecret');

        this.setState({
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiresIn: expiresIn,
            client_id: client_id,
            client_secret: client_secret
        });
    }

    clearDataFromStorage = async () => {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('expiresIn');
        await SecureStore.deleteItemAsync('clientId');
        await SecureStore.deleteItemAsync('clientSecret');

        this.setState({
            accessToken: null,
            refreshToken: null,
            expiresIn: null,
            client_id: null,
            client_secret: null
        });
    }

    getHeaders = () => {		  
        let headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + this.state.accessToken,
        };   

        return headers;
    }

    refreshToken = async () => {        
        let url = 'https://hr.iubar.it/oauth/token';
        let data_to_send = {            
            grant_type: 'refresh_token',			
            client_id: this.state.client_id,
            scope: '',
            refresh_token: this.state.refreshToken,
            client_secret: this.state.client_secret,
        };

        let result = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(),
            body:  JSON.stringify(data_to_send) ,
        });

        const statusCode = result.status;
        console.log('! statusCode: ' + statusCode);          
        let json = await result.json();
        console.log('json: ' + JSON.stringify(json));
     
        let accessToken = json.access_token; 
        let refreshToken = json.refresh_token; 
        let expiresIn = json.expires_in; 

        console.log('accessToken: ' + JSON.stringify(accessToken));

        SecureStore.setItemAsync('accessToken', accessToken);
        SecureStore.setItemAsync('refreshToken', refreshToken);
        SecureStore.setItemAsync('expiresIn', expiresIn.toString());
        SecureStore.setItemAsync('clientId', this.state.client_id.toString());
        SecureStore.setItemAsync('clientSecret', this.state.client_secret);

        this.setState({
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiresIn: expiresIn,
            client_id: this.state.client_id,
            client_secret: this.state.client_secret
        });

        if (accessToken !== null){
            Alert.alert('Refresh done: token saved'); 
        }
    }

    callApi = async () => {
	    let url = 'https://hr.iubar.it/api/v1/user';
        let result = await fetch(url, {
            method: 'GET',
		    headers: this.getHeaders()
        });	
		
		
		this.setState({data_to_send: url});
		
		let json = await result.json();
        console.log('json: ' + JSON.stringify(json));		
        const statusCode = result.status;             
		if (statusCode != 200){
			Alert.alert('Http error: ' + statusCode);			
		}else{			
			Alert.alert('Ok: ' + statusCode);
		}

	this.setState({response: JSON.stringify(json)});

    }

    handlePress = () => this.setState({expanded: !this.state.expanded });
	
    render() {
		return (
            <SafeAreaView>
            <ScrollView style={{paddingHorizontal: 20}}>
 
	            <Subheading>Secure store</Subheading>	  
                <Button style={{marginHorizontal: 20, marginVertical: 20}} mode="contained" onPress={this.readDataFromStorage}>Read data</Button>
                <Button style={{marginHorizontal: 20, marginVertical: 20}} mode="contained" onPress={this.clearDataFromStorage}>Clear data</Button>
                <Divider style={{marginVertical: 20}} />
				<Subheading>Token</Subheading>
                <Paragraph>Access token: {this.state.accessToken}</Paragraph> 
                <Paragraph>Refresh token: {this.state.refreshToken}</Paragraph> 
                <Paragraph>Expires in: {this.state.expiresIn}</Paragraph> 
                {/* <Button style={{marginHorizontal: 20, marginVertical: 20}} mode="contained" onPress={this.refreshToken} disabled={this.state.accessToken === '' || this.state.accessToken === null}>Info</Button> */}
                <Button style={{marginHorizontal: 20, marginVertical: 20}} mode="contained" onPress={this.refreshToken} disabled={this.state.accessToken === '' || this.state.accessToken === null}>Refresh</Button>                
				<Divider style={{marginVertical: 20}} />                
				<Subheading>Rest Api</Subheading>
                <Button style={{marginHorizontal: 20, marginVertical: 20}} mode="contained" onPress={this.callApi} disabled={this.state.accessToken === '' || this.state.accessToken === null}>Call route</Button>
				<Divider style={{marginVertical: 20}} />
		        <Subheading>Request</Subheading>
				<Paragraph>{this.state.data_to_send}</Paragraph>
				<Divider style={{marginVertical: 20}} />
		        <Subheading>Response</Subheading>
				<Paragraph>{this.state.response}</Paragraph>								
            </ScrollView>
            </SafeAreaView>
        );
    }

}