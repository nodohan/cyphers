class userRepository {
    constructor(maria) {
        this.maria = maria;
    }
    
    selectUserMatches = async (playerId) => {
        const query = `
        select
            jsonData
        from matches_map 
        where playerId = ?
        and matchDate >= '2024-09-26 11:00:00'
        limit 3000`;

        try {
            return await this.maria.doQuery(query, [playerId]);
        } catch (err) {
            console.log("에러1",err);
            logger.error(err);
        }
        return null;
    }
}

module.exports = userRepository;