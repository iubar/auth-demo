import React from 'react';
import { StyleSheet, View, Alert, ScrollView } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as Random from 'expo-random';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import { Paragraph, Divider, Caption, Title, Button, Subheading} from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';


export default class HttpCall extends React.Component {

    state = {
        accessToken: '',
		data_to_send: '',
		response: '',
    }

    getAccessToken = async () => {
        let accessToken = await SecureStore.getItemAsync('accessToken');
        this.setState({accessToken: accessToken});
    }

    clearAccessToken = async () => {
        await SecureStore.deleteItemAsync('accessToken');
        this.setState({accessToken: null});
    }

    getHeaders = () => {		  
        let headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + this.state.accessToken,
        };   

        return headers;
    }

    callApi = async () => {
	    let url = 'https://hr.iubar.it/api/user';
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
            <ScrollView style={{paddingHorizontal: 20}}>
 
	            <Subheading>Secure store</Subheading>	  
                <Button style={{marginHorizontal: 20, marginVertical: 20}} mode="contained" onPress={this.getAccessToken}>Read access token</Button>
                <Button style={{marginHorizontal: 20, marginVertical: 20}} mode="contained" onPress={this.clearAccessToken}>Clear access token</Button>
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
        );
    }

}