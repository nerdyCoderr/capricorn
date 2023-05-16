// Function to check for token
const token = () => {
	const token = localStorage.getItem('token');

	if (token) {
		return token;
	}

	localStorage.clear();
	window.location = '/';
	return;
};

export default token;
