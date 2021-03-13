const connection = require('../database/connection');

module.exports = {

    /**
     * Lista todos os incidentes cadastrados no banco
     * @param {*} request 
     * @param {*} response 
     * @returns json
     */
    async index(request, response) {
        const { page = 1 } = request.query;
        
        const [count] = await connection('incidents').count();

        const incidents = await connection('incidents')
        .join('ongs', 'ongs.id', '=', 'incidents.ong_id')
        .limit(5)
        .offset((page - 1) * 5)
        .select(['incidents.*', 'ongs.name', 'ongs.email', 'ongs.whatsapp', 'ongs.city', 'ongs.uf']);
        
        response.header('X-Total-Count', count['count(*)']);

        return response.json(incidents);
    },

    /**
     * Insere um novo caso no banco 
     * @param {*} request 
     * @param {*} response 
     * @returns json - id
     */
    async create(request, response) {
        const {title, description, value } = request.body;
        const ong_id = request.headers.authorization //guarda informações da autenticação do usuário, dados do indioma, tudo que caracteriza o contexto da requisição

        const [id] = await connection('incidents').insert({
            title,
            description,
            value,
            ong_id,
        });

        return response.json({ id });    
    },
    /**
     * Deleta um incidente no banco
     * @param {*} request 
     * @param {*} response 
     * @returns json
     */
    async delete(request, response) {
        const { id } = request.params;
        const ong_id = request.headers.authorization;

        const incident = await connection('incidents')
        .where('id', id)
        .select('ong_id')
        .first();

        if(incident){
            if (incident.ong_id != ong_id) {
                return response.status(401).json({ error: 'Operation not permitted.'})
            }
            await connection('incidents').where('id', id).delete();
                return response.status(200).json({ success: 'Incident successfully deleted.'});               
        }else{
            return response.status(404).json({ error: 'Incident not found.'})
        } 
    },
};