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
CLIENTS[1] = 'Password Grant with secret';
CLIENTS[2] = 'Auth Grant w/o secret'; // Code Grant for Expo (dev app)
CLIENTS[3] = 'Auth Grant w/o secret'; // Code Grant for Expo (dev app)
CLIENTS[4] = 'Auth Grant w/o secret'; // Code Grant for Expo (dev app)
CLIENTS[5] = 'Auth Grant w/o secret'; // Code Grant for Expo (dev app)
CLIENTS[6] = 'Password Grant w/o secret';

export const LARAVEL_REDIRECTS = [];
LARAVEL_REDIRECTS[1] = 'http://localhost';
LARAVEL_REDIRECTS[2] = 'exp://192.168.0.131:19000/--/expo-auth-session';
LARAVEL_REDIRECTS[3] = 'https://auth.expo.io/@borgo/auth-demo';
LARAVEL_REDIRECTS[4] = 'micoolredirect://';
LARAVEL_REDIRECTS[5] = 'exp://192.168.0.131:19000';
LARAVEL_REDIRECTS[6] = 'http://localhost';
