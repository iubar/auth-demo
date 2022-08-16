import React from 'react';
//import { OAUTH_CLIENT_SECRET } from './Consts';

export const Context = React.createContext({
	client_id: 0,
	client_secret: '',
	access_token: '',
	refresh_token: '',
	expires_in: 0,
});
