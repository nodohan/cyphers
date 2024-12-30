class userRepository {
    constructor(maria) {
        this.maria = maria;
    }
    
    selectUserMatches = async (playerId) => {
        //let searchDateStr = commonUtil.getYYYYMMDD(commonUtil.addDays(day, -1));
        const query = `
        select
            jsonData
        from matches_map 
        where playerId = '${playerId}'
        and matchDate >= '2024-09-26 11:00:00'
        limit 3000`;

        let pool = await this.maria.getPool();
        try {
            let rows = await pool.query(query);
            return rows;
        } catch (err) {
            console.log("에러1",err);
            logger.error(err);
        }
        return null;
    }
}

module.exports = userRepository;