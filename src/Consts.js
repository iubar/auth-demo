export const DEBUG = false;

// Url
export const URL_BASE = "https://hr.iubar.it";
export const URL_OAUTH_LOGIN = URL_BASE + "/oauth/token";
export const URL_AUTH = URL_BASE + "/oauth/authorize";
export const URL_API = URL_BASE + "/api/v1";
export const URL_API_ROUTE1 = URL_API + "/user";

// OAuth
export const OAUTH_CLIENT_SECRET_CLIENT_1 = "Qw5lBfbgufHf8SBbRKSErqZO3uOCtgphuXHZqaPb";
export const OAUTH_CLIENT_SECRET_CLIENT_7 = "q5MGqBrcerFM11fBlFD6XFi5eWygC3VKHfJMFuLp";

// Others

// Il client 4 è compatibile solo con app native, ovvero pubblicate sullo store.
// Infatti il comando seguente per aggiungere lo schema restituirebbe errore:
// npx uri-scheme add mycoolredirect
// npx uri-scheme list
// Maggiori dettagli: https://docs.expo.dev/versions/latest/sdk/auth-session/
export const CLIENTS = [];
CLIENTS[0] = "Change me";
CLIENTS[1] = "Password with secret";
CLIENTS[2] = "Auth w/o secret";
CLIENTS[3] = "Auth w/o secret (proxy required)";
CLIENTS[4] = "Auth w/o secret (custom scheme)";
CLIENTS[5] = "Auth w/o secret";
CLIENTS[6] = "Password w/o secret";
CLIENTS[7] = "Auth with secret";
CLIENTS[8] = "Auth w/o secret";
CLIENTS[9] = "Auth w/o secret";
CLIENTS[10] = "Auth with secret";

export const LARAVEL_REDIRECTS = [];
LARAVEL_REDIRECTS[1] = "http://localhost";
LARAVEL_REDIRECTS[2] = "exp://192.168.0.131:19000/--/expo-auth-session";
LARAVEL_REDIRECTS[3] = "https://auth.expo.io/@borgo/auth-demo";
LARAVEL_REDIRECTS[4] = "mycoolredirect://";
LARAVEL_REDIRECTS[5] = "exp://192.168.0.131:19000";
LARAVEL_REDIRECTS[6] = "http://localhost";
LARAVEL_REDIRECTS[7] = "exp://192.168.0.131:19000/--/expo-auth-session";
LARAVEL_REDIRECTS[8] = "exp://exp.host/@borgo/auth-demo/--/expo-auth-session";
LARAVEL_REDIRECTS[9] = "exp://exp.host/@borgo/auth-demo";
LARAVEL_REDIRECTS[10] = "exp://exp.host/@borgo/auth-demo/--/expo-auth-session";

export const LARAVEL_SECRETS = [];
LARAVEL_SECRETS[1] = OAUTH_CLIENT_SECRET_CLIENT_1;
LARAVEL_SECRETS[2] = "";
LARAVEL_SECRETS[3] = "";
LARAVEL_SECRETS[4] = "";
LARAVEL_SECRETS[5] = "";
LARAVEL_SECRETS[6] = "";
LARAVEL_SECRETS[7] = OAUTH_CLIENT_SECRET_CLIENT_7;
LARAVEL_SECRETS[8] = "";
LARAVEL_SECRETS[9] = "";
LARAVEL_SECRETS[10] = OAUTH_CLIENT_SECRET_CLIENT_7; // OK it's not a typing error
