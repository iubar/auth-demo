export const DEBUG = false;

// Url
export const URL_BASE = 'https://hr.iubar.it';
export const URL_OAUTH_LOGIN = URL_BASE + '/oauth/token';
export const URL_AUTH = URL_BASE + '/oauth/authorize';
export const URL_API = URL_BASE + '/api/v1';
export const URL_API_ROUTE1 = URL_API + '/user';

// OAuth
export const OAUTH_CLIENT_SECRET_CLIENT_1 = 'Qw5lBfbgufHf8SBbRKSErqZO3uOCtgphuXHZqaPb';
export const OAUTH_CLIENT_SECRET_CLIENT_7 = 'q5MGqBrcerFM11fBlFD6XFi5eWygC3VKHfJMFuLp';

// Others

export const CLIENTS = [];
CLIENTS[1] = 'Password Grant with secret';
CLIENTS[2] = 'Auth Grant w/o secret'; // Code Grant for Expo (dev app)
CLIENTS[3] = 'Auth Grant w/o secret'; // Code Grant for Expo (dev app)
CLIENTS[4] = 'Auth Grant w/o secret'; // Code Grant for Expo (dev app)
CLIENTS[5] = 'Auth Grant w/o secret'; // Code Grant for Expo (dev app)
CLIENTS[6] = 'Password Grant w/o secret';
CLIENTS[7] = 'Auth Grant with secret'; // Code Grant for Expo (dev app)

export const LARAVEL_REDIRECTS = [];
LARAVEL_REDIRECTS[1] = 'http://localhost';
LARAVEL_REDIRECTS[2] = 'exp://192.168.0.131:19000/--/expo-auth-session';
LARAVEL_REDIRECTS[3] = 'https://auth.expo.io/@borgo/auth-demo';
LARAVEL_REDIRECTS[4] = 'micoolredirect://';
LARAVEL_REDIRECTS[5] = 'exp://192.168.0.131:19000';
LARAVEL_REDIRECTS[6] = 'http://localhost';
LARAVEL_REDIRECTS[7] = 'exp://192.168.0.131:19000/--/expo-auth-session';

export const LARAVEL_SECRETS = [];
LARAVEL_SECRETS[1] = OAUTH_CLIENT_SECRET_CLIENT_1;
LARAVEL_SECRETS[2] = '';
LARAVEL_SECRETS[3] = '';
LARAVEL_SECRETS[4] = '';
LARAVEL_SECRETS[5] = '';
LARAVEL_SECRETS[6] = '';
LARAVEL_SECRETS[7] = OAUTH_CLIENT_SECRET_CLIENT_7;
