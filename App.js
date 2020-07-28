import * as React from 'react';
import { Text, View } from 'react-native-paper';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import PasswordGrant from './src/screens/PasswordGrant';
import AuthorizationCodeGrant from './src/screens/AuthorizationCodeGrant';
import HttpCall from './src/screens/HttpCall';
import Toolbar from './src/components/ToolbarComponent';

 
 const Tab = createMaterialBottomTabNavigator(); 
 
export default class App extends React.Component {	



 
 /*
  const [routes] = React.useState([
    { key: 'password_grant', title: 'Password grant', icon: 'album' },
    { key: 'authorization_code_grant', title: 'Authorization Code grant', icon: 'album' },
    { key: 'http_call', title: 'Http call', icon: 'album' },
  ]); 

  const renderScene = BottomNavigation.SceneMap({
    password_grant: PasswordGrantRoute,
    authorization_code_grant: AuthorizationCodeGrantRoute,
    http_call: HttpCallRoute,
  });
*/



 
	render() {
		

		
	  return (
	  <PaperProvider>
		
		<NavigationContainer>
		<Toolbar />
      <Tab.Navigator
	  	  initialRouteName="AuthorizationCodeGrant"
		  activeColor="#f0edf6"
		  inactiveColor="#3e2465"
		  barStyle={{ backgroundColor: '#694fad' }}		  
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Password Grant') {
              iconName = focused ? 'ios-information-circle' : 'ios-information-circle-outline';
            } else if (route.name === 'Auth Code Grant') {
              iconName = focused ? 'ios-list-box' : 'ios-list';
            } else if (route.name === 'Api call') {
              iconName = focused ? 'ios-list-box' : 'ios-list';
            }

            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'gray',
        }}
      >
 
			<Tab.Screen name="Password Grant" component={PasswordGrant} />
			<Tab.Screen name="Auth Code Grant" component={AuthorizationCodeGrant} />
			<Tab.Screen name="Api call" component={HttpCall} />
		  </Tab.Navigator>
		</NavigationContainer>		
		</PaperProvider>
	  );
	}
  
  
};

 