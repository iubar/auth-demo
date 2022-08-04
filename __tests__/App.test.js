import React from 'react';
import renderer from 'react-test-renderer';
import App from '../App';
 
describe('<App />', () => {
	//it('has 1 child', () => {
	//	const tree = renderer.create(<App />).toJSON();
	//	expect(tree.children.length).toBe(1);
	//});
	it('renders correctly', async () => {
		const tree = await renderer.create(<App />).toJSON();
		expect(tree).toMatchSnapshot();
	});  
});
 


/*
describe('<App /> Basics', () => {
  it('has 1 child', async () => {
    let tree
    renderer.act(()=>{
       tree = renderer.create(<App />)
    })
    expect(tree).toMatchSnapshot();
  });
})
*/






 

