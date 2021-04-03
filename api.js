const request = require('request-promise-native');
 
function api () {
	this.call = async function (opt){
		return await request(opt);
	}
}

module.exports = api;