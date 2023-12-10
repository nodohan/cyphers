class nodoRepository {
    constructor(maria) {
        this.maria = maria;
    }
    
    selectTodayHiddenNicknames = async(playerId) => {
        const query = `        
            SELECT 
                jsonData 
            FROM matches 
            WHERE matchDate > DATE_FORMAT(NOW(), '%y-%m-%d')
            AND playerId = ? `;
        return await this.maria.doQuery(query, playerId);
    }

}

module.exports = nodoRepository;