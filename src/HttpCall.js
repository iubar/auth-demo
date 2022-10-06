import React from "react";
import { URL_OAUTH_LOGIN, DEBUG } from "./Consts.js";

import * as SecureStore from "expo-secure-store";

export default class HttpCall extends React.Component {
	getHeaders = (accessToken) => {
		let headers = {
			"Content-Type": "application/json",
			"Accept": "application/json",
		};

		if (accessToken) {
			headers.Authorization = "Bearer " + accessToken;
		}

		return headers;
	};

	getAuthHeaders = async () => {
		const access_token = await SecureStore.getItemAsync("accessToken");
		const headers = {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": "Bearer " + access_token,
		};
		return headers;
	};

	getAuthHeaders2 = (access_token) => {
		const headers = {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": "Bearer " + access_token,
		};
		return headers;
	};

	/**
	 * https://laravel.com/docs/9.x/passport#refreshing-tokens
	 */
	refreshToken = async (clientId, refreshToken, clientSecret) => {
		let data_to_send = {
			grant_type: "refresh_token",
			refresh_token: refreshToken,
			client_id: clientId,
			scope: "",
			client_secret: clientSecret,
		};
		return this.callApi("POST", URL_OAUTH_LOGIN, data_to_send);
	};

	/**
	 * read the access_token from SecureStore
	 */
	callApi = async (method, url, data_to_send) => {
		return this.callApiGeneric(method, url, await this.getAuthHeaders(), data_to_send);
	};

	callApi2 = async (method, url, data_to_send) => {
		return this.callApiGeneric(method, url, this.getHeaders(), data_to_send);
	};

	callApi3 = async (method, url, access_token, data_to_send) => {
		return this.callApiGeneric(method, url, this.getAuthHeaders2(access_token), data_to_send);
	};

	callApiGeneric = async (method, url, headers, data_to_send) => {
		let status = null;
		let _error = null;
		let _body = null;
		let _data = null;
		let responseMsg = null;
		if (data_to_send) {
			_body = JSON.stringify(data_to_send);
			if (DEBUG) {
				console.log(method + ": " + url);
				console.log("DATA TO SEND: " + JSON.stringify(data_to_send));
			}
		}
		try {
			let response = await fetch(url, {
				method: method,
				headers: headers,
				body: _body,
			});
			status = response.status;
			let json = await response.json();
			if (DEBUG) {
				console.log("RESPONSE: " + JSON.stringify(json));
			}
			if (json) {
				// API DI IUBAR
				if (Object.prototype.hasOwnProperty.call(json, "data")) {
					_data = json.data;
				}
				if (Object.prototype.hasOwnProperty.call(json, "response")) {
					// Attenzione nell'API IUBAR, json.response contiene il testo di un erorre quanto status != 200
					if (status !== 200) {
						_error = json.response;
					} else {
						responseMsg = json.response;
					}
				}
				// FINE API DI IUBAR

				// API DI PASSPORT (ricordati che è un middleware per Laravel)
				if (Object.prototype.hasOwnProperty.call(json, "error")) {
					_error = json.error;
				}
				if (Object.prototype.hasOwnProperty.call(json, "error_description")) {
					_error = _error + " | " + json.error_description;
				}
				if (Object.prototype.hasOwnProperty.call(json, "message")) {
					if (status === 200) {
						responseMsg = json.message;
					} else {
						_error = json.message; // Ha un contenuto informativo superoriore rispetto al valore di json.error
					}
				}
				if (Object.prototype.hasOwnProperty.call(json, "token_type")) {
					_data = json;
				}
			}
			// FINE API DI PASSPORT
		} catch (error) {
			console.log("ERROR: " + error.message);
			_error = error.message;
		}
		return {
			status: status,
			error: _error,
			data: _data,
			response: responseMsg,
		};
	};

	isExpired(exp) {
		if (Date.now() <= exp * 1000) {
			console.log(true, "token is not expired");
			return false;
		} else {
			console.log(false, "token is expired");
			return true;
		}
	}

	formatTime(unix_timestamp_in_ms) {
		let date = new Date(unix_timestamp_in_ms);

		let day = date.getDate();
		let month = date.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12
		let year = date.getFullYear();

		// Hours part from the timestamp
		let hours = date.getHours();
		// Minutes part from the timestamp
		let minutes = "0" + date.getMinutes();
		// Seconds part from the timestamp
		let seconds = "0" + date.getSeconds();

		// Will display time in 10:30:23 format
		let formattedTime = day + "/" + month + "/" + year + " " + hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);

		// console.log(formattedTime);

		return formattedTime;
	}

	handleResult = (url, result) => {
		if (!DEBUG) {
			return;
		}
		let statusCode = result.status;
		let _error = result.error;
		console.log("URL: " + url);
		if (statusCode !== 200) {
			console.log("HTTP ERROR: " + statusCode);
			console.log("RESPONSE (riformattata): " + JSON.stringify(result));
		} else {
			console.log("HTTP OK: " + statusCode);
			console.log("RESPONSE (riformattata): " + JSON.stringify(result));
			if (_error) {
				console.log("ATTENZIONE: errore in presenza di codice http 200");
			}
		}
	};
}
