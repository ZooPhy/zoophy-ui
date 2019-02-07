## ZooPhy: Reconstructing Virus Spread using Phylogeography

Web Interface for [ZooPhy](https://zodo.asu.edu/zoophy/). The Web Services are available [here](https://github.com/ZooPhy/zoophy-services).

### Dependencies:

* [NodeJS 6.10.x](https://nodejs.org/en/)
* [npm 3.10.x](https://www.npmjs.com/)
* [Redis 3.x](https://redis.io/)
* [AngularJS 1.6.x](https://angularjs.org/)
* [Bootstrap 3.x](http://getbootstrap.com/)
* [FontAwesome 4.x](http://fontawesome.io/icons/)
* [Latest ZooPhy Services](https://github.com/developerDemetri/zoophy-services)
* Your Favorite Text Editor, [VS Code](https://code.visualstudio.com/) is full featured NodeJS IDE. 

### Setup:

1) Create a secret_settings.js file in the bin folder with your configuration details. Refer to [settings_template.js](bin/settings_template.js)
2) Create a utils.js file in public/javascript folder with your uri details. Refer to [utils_template.js](public/javascript/utils_template.js)
3) Run `npm install` to install required NodeJS packages.
4) Run `npm test` to ensure that tests are passing.
5) Run `npm start` to start the application. 
