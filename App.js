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
import AuthorizationCodeGrant from './src/screens/AuthorizationCodeGrant';
import RestClientScreen from './src/screens/RestClientScreen';
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
	render() {
		return (
			<PaperProvider theme={AppTheme}>
				<NavigationContainer theme={AppTheme}>
					<Toolbar />
					<Tab.Navigator
						initialRouteName="AuthorizationCodeGrant"
						screenOptions={({ route }) => ({
							tabBarIcon: ({ focused, color }) => {
								// a Luglio 2020 c'è un bug nella documentazione ufficiale, qui corretto
								let iconName;
								if (route.name === 'PasswordGrant') {
									iconName = focused ? 'tag' : 'camera';
								} else if (route.name === 'AuthorizationCodeGrant') {
									iconName = focused ? 'tag' : 'camera';
								} else if (route.name === 'RestClient') {
									iconName = focused ? 'tag' : 'camera';
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
							children={() => <AuthorizationCodeGrant theme={AppTheme} />}
						/>
						<Tab.Screen
							options={{ tabBarLabel: 'Api call' }}
							name="RestClient"
							component={RestClientScreen}
						/>
					</Tab.Navigator>
				</NavigationContainer>
			</PaperProvider>
		);
	}
}
