class matchDetailCharRepository {
    constructor(maria) {
        this.maria = maria;
    }
    
    selectMatchDetailByMatchDate = async(dateStr) => {
        const query = `        
            SELECT 
                jsonData 
            FROM matches 
            WHERE matchDate >= STR_TO_DATE(?, '%Y-%m-%d')
            AND matchDate < STR_TO_DATE(?, '%Y-%m-%d') + INTERVAL 1 DAY limit 3 `;
        return await this.maria.doQuery(query,[dateStr, dateStr]);
    }

}

module.exports = matchDetailCharRepository;