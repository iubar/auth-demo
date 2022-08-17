import * as React from 'react';
import {
	DefaultTheme,
	// DarkTheme,
	Provider as PaperProvider,
} from 'react-native-paper';
import {
	FontAwesome,
	//Ionicons
} from '@expo/vector-icons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import {
	NavigationContainer,
	// DarkTheme as DarkThemeNav,
	//DefaultTheme as DefaultThemeNav,
} from '@react-navigation/native';
import PasswordGrantScreen from './src/screens/PasswordGrantScreen';
import AuthorizationCodeGrantScreen from './src/screens/AuthorizationCodeGrantScreen';
import RestClientScreen from './src/screens/RestClientScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { Context } from './src/Context';
import Toolbar from './src/components/ToolbarComponent';

const AppTheme = {
	...DefaultTheme,
	dark: false,
	mode: 'exact', // ('adaptive' | 'exact') (adaptive where we follow Material design guidelines)
	roundness: 2,
	colors: {
		...DefaultTheme.colors,
		// primary: '#3498db', // primary color for your app, usually your brand color.
		// accent: '#f1c40f', // secondary color for your app which complements the primary color.
		primary: 'red',
		accent: 'rgb(259, 247, 0)',
		background: 'rgb(242, 242, 242)',
		card: 'rgb(255, 255, 255)',
		text: 'rgb(28, 28, 30)',
		border: 'rgb(199, 199, 204)',
		notification: 'rgb(255, 69, 58)',
	},
};

const Tab = createMaterialBottomTabNavigator();

export default class App extends React.Component {
	defaultValue = {
		client_id: 1,
		client_secret: '',
		access_token: '',
		refresh_token: '',
		expires_in: 0,
	};

	render() {
		return (
			<PaperProvider theme={AppTheme}>
				<Context.Provider value={this.defaultValue}>
					<NavigationContainer theme={AppTheme}>
						<Toolbar />
						<Tab.Navigator
							initialRouteName="Settings"
							screenOptions={({ route }) => ({
								tabBarIcon: ({ focused, color }) => {
									let iconName;
									if (route.name === 'PasswordGrant') {
										iconName = focused ? 'key' : 'key';
									} else if (route.name === 'AuthorizationCodeGrant') {
										iconName = focused ? 'unlock-alt' : 'unlock-alt';
									} else if (route.name === 'RestClient') {
										iconName = focused ? 'code' : 'code';
									} else if (route.name === 'Settings') {
										iconName = focused ? 'cogs' : 'cogs';
									}
									// You can return any component that you like here!
									return <FontAwesome name={iconName} size={21} color={color} />;
								},
							})}>
							<Tab.Screen
								options={{ tabBarLabel: 'Password Grant' }}
								name="PasswordGrant"
								component={PasswordGrantScreen}
							/>
							<Tab.Screen
								options={{ tabBarLabel: 'Auth Code Grant' }}
								name="AuthorizationCodeGrant"
								component={AuthorizationCodeGrantScreen}
							/>

							<Tab.Screen
								options={{ tabBarLabel: 'Api' }}
								name="RestClient"
								component={RestClientScreen}
							/>
							<Tab.Screen
								options={{ tabBarLabel: 'Settings' }}
								name="Settings"
								component={SettingsScreen}
							/>
						</Tab.Navigator>
					</NavigationContainer>
				</Context.Provider>
			</PaperProvider>
		);
	}
}
