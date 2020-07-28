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
import * as SecureStore from 'expo-secure-store';

export default class HttpCall extends React.Component {

    state = {
        accessToken: null
    }

    async getAccessToken(){
        let accessToken = await SecureStore.getItemAsync('accessToken');
        this.setState({accessToken: accessToken});
    }

    async clearAccessToken(){
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
	    let json = await result.json();
        console.log('json: ' + JSON.stringify(json));
        const statusCode = result.status;
        if (statusCode == 200){
            alert('Http call done');
        }
    }

    handlePress = () => this.setState({expanded: !this.state.expanded });
	
    render() {
		return (
            <ScrollView style={{ paddingVertical: 40, paddingHorizontal: 20 }}>
	            <Title>Http</Title>	  
                <Button
                    title="Get access token from storage"
                    onPress={() => this.getAccessToken()}
                />
                <Divider style={{marginVertical: 20}} />
                <Button
                    title="Clear access token from storage"
                    onPress={() => this.clearAccessToken()}
                />
                <Divider style={{marginVertical: 20}} />
                <Button
                    title="Call api"
                    onPress={this.callApi}
                    disabled={this.state.accessToken === '' || this.state.accessToken === null}
                />         
            </ScrollView>
        );
    }

}