import React from "react";
import {
  StyleSheet,
  View,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import * as Crypto from "expo-crypto";
import * as Random from "expo-random";
import * as AuthSession from "expo-auth-session";
import * as Application from "expo-application";
import HttpCall from "../HttpCall";
import { CLIENTS, LARAVEL_REDIRECTS, LARAVEL_SECRETS } from "../Consts";
import {
  Text,
  Title,
  Subheading,
  Button,
  Caption,
  Paragraph,
  Divider,
  List,
  TextInput,
} from "react-native-paper";
import StoreUtil from "../StoreUtil";
import { Context } from "../Context";
import { withTheme } from "react-native-paper";

class SettingsScreen extends React.Component {
  static contextType = Context;

  state = {
    clients: [],
    client_desc: "",
    expanded: false,
    client_id: 0,
    access_token: "",
    refresh_token: "",
    expires_in: 0,
    laravel_redirect_uri: "",
  };

  constructor(props) {
    super(props);
    this.api = new HttpCall();
  }

  async componentDidMount() {
    this.store = new StoreUtil(this.context);
    await this.store.load();

    this.initClients();
    this._unsubscribe = this.props.navigation.addListener("focus", () => {
      this.updateGui();
    });

    this.updateGui(); // NOTA: l'evento 'focus' non viene invocato se lo screen ha già il focus quando l'app si apre
  }

  updateGui = async () => {
    this.updateConfig(this.context.client_id);
  };

  /**
   * https://reactnavigation.org/docs/navigation-events/
   */
  componentWillUnmount() {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }

  initClients() {
    this.state.clients = CLIENTS;
  }

  updateConfig = async (index) => {
    if (index == undefined) {
      index = 1;
    }
    let client_id = parseInt(index);

    let client_secret = LARAVEL_SECRETS[client_id];

    console.log("clientSecret: " + client_secret);
    let client_desc = client_id + " " + this.state.clients[client_id];
    this.context.client_id = client_id;
    this.context.client_secret = client_secret;

    let laravel_redirect_uri = LARAVEL_REDIRECTS[index];

    this.setState({
      client_id: this.context.client_id,
      access_token: this.context.access_token,
      refresh_token: this.context.refresh_token,
      expires_in: this.context.expires_in,
      client_desc: client_desc,
      expanded: false,
      laravel_redirect_uri: laravel_redirect_uri,
    });
  };

  saveDataInStore = async () => {
    await this.store.saveClient(
      this.context.client_id,
      this.context.client_secret
    );
    await this.store.saveTokens(
      this.context.access_token,
      this.context.refresh_token,
      this.context.expires_in
    );
  };

  clearDataFromStore = async () => {
    await this.store.clear();
    this.setState({
      client_desc: "",
    });
  };

  handlePress = () => this.setState({ expanded: !this.state.expanded });

  readDataFromStore = async () => {
    await this.store.load();
    this.updateConfig(this.context.client_id);
    console.log("data loaded successfully");
  };

  getExpiredDesc = () => {
    let expires = "";
    if (this.state.expires_in > 0) {
      let expiresAtTime = new Date().getTime() + this.state.expires_in * 1000;
      let expiresAt = this.api.formatTime(expiresAtTime);
      let isExpired = "(it's not expired yet)";
      if (this.api.isExpired(expiresAtTime)) {
        isExpired = "(it's expired)";
      }
      expires =
        this.state.expires_in + " seconds, on " + expiresAt + " " + isExpired;
    }
    return expires;
  };

  render() {
    return (
      <SafeAreaView>
        <ScrollView style={{ paddingHorizontal: 20 }}>
          <Title>Settings</Title>
          <Divider style={{ marginVertical: 5 }} />
          <Caption>Iubar HR client and relative OAuth2 grant type</Caption>
          <List.Section title="">
            <List.Accordion
              title={this.state.client_desc}
              expanded={this.state.expanded}
              onPress={this.handlePress}
            >
              {this.state.clients.map((desc, index) => {
                if (desc !== null) {
                  return (
                    <List.Item
                      key={index}
                      title={index + " - " + desc}
                      onPress={() => this.updateConfig(index)}
                    />
                  );
                }
              })}
            </List.Accordion>
          </List.Section>

          {this.state.laravel_redirect_uri && (
            <View>
              <Caption>Redirect configured on the server</Caption>
              <Paragraph>{this.state.laravel_redirect_uri}</Paragraph>
            </View>
          )}

          <Divider style={{ marginVertical: 5 }} />
          <Button
            style={{ marginHorizontal: 20, marginVertical: 20 }}
            mode="contained"
            onPress={this.readDataFromStore}
          >
            Load data
          </Button>
          <Button
            color={this.props.theme.colors.accent}
            style={{ marginHorizontal: 20, marginVertical: 20 }}
            mode="contained"
            onPress={this.saveDataInStore}
          >
            Save data
          </Button>
          <Button
            style={{ marginHorizontal: 20, marginVertical: 20 }}
            mode="contained"
            onPress={this.clearDataFromStore}
          >
            Clear data
          </Button>
          <Divider style={{ marginVertical: 20 }} />
          <Title>Tokens</Title>
          <Caption>Access token</Caption>
          <Paragraph>{this.state.access_token}</Paragraph>
          <Caption>Refresh token</Caption>
          <Paragraph>{this.state.refresh_token}</Paragraph>
          <Caption>Expires</Caption>
          <Paragraph>{this.getExpiredDesc()}</Paragraph>
          <Divider style={{ marginVertical: 20 }} />
          {/*
					<Title>About</Title>
					<Paragraph>Name {Application.applicationName}</Paragraph>				
					<Paragraph>Id {Application.applicationId}</Paragraph>
					<Paragraph>Version {Application.nativeApplicationVersion}</Paragraph>				
					<Paragraph>Build {Application.nativeBuildVersion}</Paragraph>				
					*/}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default withTheme(SettingsScreen);
