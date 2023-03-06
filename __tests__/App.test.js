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

beforeEach(() => {
	fetchMock.mockClear();
	fetchMock.mockReject(() => Promise.reject('API is down'));
});

describe('<App />', () => {
	it('has 1 child', () => {
		const tree = renderer.create(<App />).toJSON();
		expect(tree.children.length).toBe(1);
	});
	it('matches snapshot and renders correctly', () => {
		let tree = renderer.create(<App />);
		expect(tree).toMatchSnapshot();
	});
});
