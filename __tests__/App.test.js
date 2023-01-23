import 'react-native';
import React from 'react';
import App from '../App';
import renderer from 'react-test-renderer';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

global.fetch = jest.fn(() =>
	Promise.resolve({
		json: () => Promise.resolve({ status: 400, error: 'mocked', data: [], response: '' }),
	})
);

describe('App snapshot', () => {
	beforeEach(() => {
		fetchMock.mockClear();
		fetchMock.mockReject(() => Promise.reject('API is down'));
	});

	it('renders the root without loading screen', () => {
		let tree;
		renderer.act(() => {
			tree = renderer.create(<App />);
		});
		expect(tree.toJSON()).toMatchSnapshot();
	});
});
