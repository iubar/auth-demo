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

export default class PasswordGrant extends React.Component {

    state = {
        username: '',
        password: ''	
    }

    setUsername(username) {
        this.setState({username: username});
    }
    
    setPassword(password) {
        this.setState({password: password});
    }

    authPasswordGrant = async () => {     
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

    render() {
		return (
            <ScrollView style={{ paddingVertical: 40, paddingHorizontal: 20 }}>
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
            </ScrollView>
        );
    }

}