import * as React from 'react';
import { Text, View } from 'react-native-paper';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { FontAwesome , Ionicons } from '@expo/vector-icons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import PasswordGrant from './src/screens/PasswordGrant';
import AuthorizationCodeGrant from './src/screens/AuthorizationCodeGrant';
import HttpCall from './src/screens/HttpCall';
import Toolbar from './src/components/ToolbarComponent';

 
 
const theme = {
  ...DefaultTheme,
  dark: false, 
  mode: 'exact', // ('adaptive' | 'exact') (adaptive where we follow Material design guidelines)
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    // primary: '#3498db', // primary color for your app, usually your brand color.
    // accent: '#f1c40f', // secondary color for your app which complements the primary color.
    primary: 'red',
	// accent: 'rgb(255, 45, 85)',
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
	  <PaperProvider theme={theme}>
		
		<NavigationContainer theme={theme}>
		<Toolbar />
      <Tab.Navigator	 
	  	  initialRouteName="AuthorizationCodeGrant"
		  tabBarOptions={ {showLabel: false} }
          screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
			size = 20;
            if (route.name === 'PasswordGrant') {
              iconName = focused ? 'tag' : 'camera';
            } else if (route.name === 'AuthorizationCodeGrant') {
              iconName = focused ? 'tag' : 'camera';
            } else if (route.name === 'HttpCall') {
              iconName = focused ? 'tag' : 'camera';
            }

            // You can return any component that you like here!
            return <FontAwesome name={iconName} size={size} color={color} />;
          },
        })}
 
      >
 
			<Tab.Screen options={{tabBarLabel: "Password Grant"}} name="PasswordGrant" component={PasswordGrant} />
			<Tab.Screen options={{tabBarLabel: "Auth Code Grant"}} name="AuthorizationCodeGrant" component={AuthorizationCodeGrant} />
			<Tab.Screen options={{tabBarLabel: "Api call"}} name="HttpCall" component={HttpCall} />
		  </Tab.Navigator>
		</NavigationContainer>		
		</PaperProvider>
	  );
	}
  
  
};

 