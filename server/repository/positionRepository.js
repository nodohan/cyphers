class positionRepository {
    constructor(maria) {
        this.maria = maria;
    }

    selectPositionAttrList = async(todayStr, charName) => {
        const query = `select * 
                    from position_attr_stats
                    where checkDate = ?
                    and charName = ? `;
        return await this.maria.doQuery(query, [todayStr, charName]);
    }

}

module.exports = positionRepository;