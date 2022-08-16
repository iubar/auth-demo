export const DEBUG = true;

// Url
export const URL_BASE = 'https://hr.iubar.it';
export const URL_OAUTH_LOGIN = URL_BASE + '/oauth/token';
export const URL_AUTH = URL_BASE + '/oauth/authorize';
export const URL_API = URL_BASE + '/api/v1';
export const URL_API_ROUTE1 = URL_API + '/user';

// OAuth
export const OAUTH_CLIENT_SECRET = 'Qw5lBfbgufHf8SBbRKSErqZO3uOCtgphuXHZqaPb';

// Others

export const CLIENTS = [];
CLIENTS[1] = 'Password Grant Client with secret';
CLIENTS[2] = 'Auth grant without client secret'; // Code Grant for Expo (dev app)
CLIENTS[3] = 'Auth grant without client secret'; // Code Grant for Expo (dev app)
CLIENTS[4] = 'Auth grant without client secret'; // Code Grant for Expo (dev app)
CLIENTS[5] = 'Auth grant without client secret'; // Code Grant for Expo (dev app)
CLIENTS[6] = 'Password Grant Client without secret';

export const REDIRECTS = [];
REDIRECTS[1] = 'http://localhost';
REDIRECTS[2] = 'exp://192.168.0.131:19000/--/expo-auth-session';
REDIRECTS[3] = 'https://auth.expo.io/@borgo/auth-demo';
REDIRECTS[4] = 'micoolredirect://';
REDIRECTS[5] = 'exp://192.168.0.131:19000';
REDIRECTS[6] = 'http://localhost';
