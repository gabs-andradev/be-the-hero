const knex = require('knex');
const configuration = require('../../knexfile');

const connection = knex(configuration.development);

// exporta as configurações do banco de dados
module.exports = connection; 