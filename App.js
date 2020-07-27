import * as React from 'react';
import { BottomNavigation, Text } from 'react-native-paper';
import PasswordGrant from './src/screens/PasswordGrant';
import AuthorizationCodeGrant from './src/screens/AuthorizationCodeGrant';

const PasswordGrantRoute = () => <PasswordGrant/>;
const AuthorizationCodeGrantRoute = () => <AuthorizationCodeGrant/>;

const App = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'password_grant', title: 'Password grant', icon: 'album' },
    { key: 'authorization_code_grant', title: 'Authorization Code grant', icon: 'album' },
  ]); 

  const renderScene = BottomNavigation.SceneMap({
    password_grant: PasswordGrantRoute,
    authorization_code_grant: AuthorizationCodeGrantRoute,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
};

export default App;