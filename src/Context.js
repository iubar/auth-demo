import React from 'react';
//import { OAUTH_CLIENT_SECRET } from './Consts';

export const Context = React.createContext({
	client_id: 0,
	client_secret: '',
	access_token: 'a',
	refresh_token: 'a',
	expires_in: 0,
});
