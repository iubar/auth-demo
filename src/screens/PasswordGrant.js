import React from 'react';
import { StyleSheet, View, Alert, ScrollView, SafeAreaView } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as Random from 'expo-random';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import { Text, Title, Subheading, Button, Paragraph, Divider, List, TextInput } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';


export default class PasswordGrant extends React.Component {

    state = {    
        client_desc: '',
        data_to_send: {},
        data_to_send_printable: '',
        username: '',
        password: '',
		expanded: false,
    }

    clients = [];

    constructor(props){
        super(props);
        this.initClients();
    }

    initClients(){
        this.clients[1] = 'with client_secret';
        this.clients[6] = 'without client_secret';
    }

    componentDidMount(){
        this.updateConfig(1);
    }

    updateConfig = async (itemValue) => {
		let client_id = parseInt(itemValue);
    
        let data_to_send = {
            grant_type: 'password',
            client_id: client_id,
            scope: ''
        };

        if (client_id == 1){ // with client_secret
            data_to_send.client_secret = 'Qw5lBfbgufHf8SBbRKSErqZO3uOCtgphuXHZqaPb';
		} else if (client_id == 6){ // without client_secret
			
		}
 
        let client_desc = client_id + ' ' + this.clients[client_id]	;
		this.setState({data_to_send: data_to_send, client_desc: client_desc }); 
    }

    setUsername(username) {
        this.setState({username: username});
    }
    
    setPassword(password) {
        this.setState({password: password});
    }

    getHeaders = () => {
        let headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };

        return headers;
    }

    authPasswordGrant = async () => {     
        try {
            let url = 'https://hr.iubar.it/oauth/token';

            let data_to_send = this.state.data_to_send;
            data_to_send.username = this.state.username;
            data_to_send.password = this.state.password;
         
		 this.setState({data_to_send: data_to_send, data_to_send_printable: 'POST: ' + url + ' ' + JSON.stringify(data_to_send)});
		 
            let result = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data_to_send)
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
                console.log('HTTP OK: ' + statusCode + ' (POST: ' + url + ')');
                //this.loginSuccess(email, json);            
                console.log('loginSuccess(): ' + JSON.stringify(json));
                let token_type = json.token_type;
                let expires_in = json.expires_in;
                let access_token = json.access_token;
                let refresh_token = json.refresh_token;

                console.log('accessToken: ' + access_token);
                console.log('refreshToken: ' + refresh_token);
                console.log('expiresIn: ' + expires_in);
                console.log('clientId: ' + this.state.data_to_send.client_id);
                console.log('clientSecret: ' + this.state.data_to_send.client_secret);
                
                SecureStore.setItemAsync('accessToken', access_token);
                SecureStore.setItemAsync('refreshToken', refresh_token);
                SecureStore.setItemAsync('expiresIn', expires_in.toString());
                SecureStore.setItemAsync('clientId', this.state.data_to_send.client_id.toString());
                SecureStore.setItemAsync('clientSecret', this.state.data_to_send.client_secret);

                this.setState({access_token: access_token});

                Alert.alert('Authentication done: token saved'); 
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

    handlePress = () => this.setState({expanded: !this.state.expanded });
	
    render() {
		return (
            <SafeAreaView>
            <ScrollView style={{ paddingHorizontal: 20 }}>
                <Subheading>Password Grant</Subheading>
                <List.Section title="Client type">
                    <List.Accordion title={this.state.client_desc} expanded={this.state.expanded} onPress={this.handlePress}>
                        {this.clients.map((desc, index) => {
                            if (desc !== null){
                                return <List.Item key={index} title={index + ' - ' + desc} onPress={() => this.updateConfig(index)} />  
                            }
                        })}
                    </List.Accordion>
                </List.Section>
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
                <Divider style={{marginVertical: 20}} />
				<Button style={{marginHorizontal: 20, marginVertical: 20}} disabled={this.state.username === '' || this.state.password === ''} mode="contained" onPress={this.authPasswordGrant}>Login</Button>
                <Divider style={{marginVertical: 20}} />
		        <Subheading>Request</Subheading>
				<Paragraph>{this.state.data_to_send_printable}</Paragraph>
				<Divider style={{marginVertical: 20}} />
				<Subheading>Access token</Subheading>
                <Paragraph>{this.state.access_token}</Paragraph> 
            </ScrollView>
            </SafeAreaView>
        );
    }

}