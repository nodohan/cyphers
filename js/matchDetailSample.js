

const mergeMatchChar = (jsonArr, userId) => {
    const myTeam = new Map();
    const enemyTeam = new Map();

    jsonArr.forEach(row => {
        const isWin = row.teams[0].players.includes(userId);
        const winningTeam = isWin ? row.teams[0].players : row.teams[1].players;        
        
        row.players.forEach(player => {
            const youWin = winningTeam.includes(player.playerId);
            const isMyTeam = !(youWin !== isWin);

            if(isMyTeam) {
                setMap(myTeam, isWin, player.playInfo.characterName);
            } else {
                setMap(enemyTeam, isWin, player.playInfo.characterName);
            }
        });
    });

    const result =  {
        myTeam : Object.fromEntries(myTeam), 
        enemyTeam : Object.fromEntries(enemyTeam)
    }

    console.log(result);
    return result;
};


const setMap = (map, isWin, characterName) => {
    if(isWin) {
        map.set(characterName, {
            win: (map.get(characterName)?.win || 0) + 1,
            lose: map.get(characterName)?.lose || 0,
        });
    }else {
        map.set(characterName, {
            win: map.get(characterName)?.win || 0,
            lose: (map.get(characterName)?.lose || 0 ) + 1,
        });
    }
}

const matchDetailSample = [{
    "date": "2023-11-27 01:32",
    "gameTypeId": "rating",
    "map": {
        "mapId": "105",
        "name": "그랑플람 아시아 지부"
    },
    "teams": [
        {
            "result": "win",
            "players": [
                "c0910a9a692517c19cf39597d093328b",
                "030296f6cb4fa535639ca4811bf451dc",
                "afd543635491dc2634f05f7d130808e4",
                "55a9bbc9936fa531e43071f014964e80",
                "98270ff2a689292aaf29a412346d237a"
            ]
        },
        {
            "result": "lose",
            "players": [
                "1826e7c7f0becbc1e65ee644c28f0072",
                "87b0465151fb6572931a96593d8486c0",
                "a476fa3918802da500b35329d44dd935",
                "7791dc0e4b08791dd606405678e4c98b",
                "8e5f6e41d4706ac9d2709f6f256295fb"
            ]
        }
    ],
    "players": [
        {
            "playerId": "c0910a9a692517c19cf39597d093328b",
            "nickname": "양양이",
            "map": {
                "mapId": "105",
                "name": "그랑플람 아시아 지부"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 2,
                "partyId": "fe544f88e05b21f2df8435ddcb24deed",
                "playTypeName": "정상",
                "characterId": "1d5ac6423cc85695a37185c38bb1b528",
                "characterName": "스텔라",
                "level": 39,
                "killCount": 5,
                "deathCount": 5,
                "assistCount": 9,
                "attackPoint": 22592,
                "damagePoint": 32284,
                "battlePoint": 166,
                "sightPoint": 306,
                "towerAttackPoint": 0,
                "backAttackCount": 22,
                "comboCount": 34,
                "spellCount": 0,
                "healAmount": 0,
                "sentinelKillCount": 17,
                "demolisherKillCount": 0,
                "trooperKillCount": 0,
                "guardianKillCount": 0,
                "guardTowerKillCount": 0,
                "getCoin": 12050,
                "spendCoin": 11975,
                "spendConsumablesCoin": 2700,
                "playTime": 854,
                "responseTime": 126,
                "minLifeTime": 39,
                "maxLifeTime": 180
            },
            "position": {
                "name": "탱커",
                "explain": "체력 +7%, 회피 +5%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "58cbc9f18d436570e76534c2f0d8dc12",
                        "name": "마운트"
                    },
                    {
                        "level": 2,
                        "id": "809f6fa4aced8ec003b40f2cf09f9f12",
                        "name": "고독한 늑대"
                    },
                    {
                        "level": 3,
                        "id": "309cb18ddba5e26b81c47ad7d792124a",
                        "name": "재빠른 대응"
                    },
                    {
                        "level": 4,
                        "id": "678bca255e575ae96aceefacaa7aee4e",
                        "name": "최후의 저항"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "2533231fdb97d896f8a2ea7715636bc5",
                    "itemName": "DB서치 마노",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "183b22ee67dfeb6e3dc08b99a71e5190",
                    "itemName": "이너 스코프 ",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "6067426a2ea5dc4c5b1e9c1abbd06334",
                    "itemName": "E 바이퍼트론",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "5df983897f8320d00710b159b21e5ed9",
                    "itemName": "E 스트로매크 ",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "dc030616f39abf6116e4779f991853e2",
                    "itemName": "E 러스티 하츠",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "326be6735fe1643648e321d497e24697",
                    "itemName": "E 퓨엘 제너레이터",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "6e9e2c8f5d0f837627034531406f6bf4",
                    "itemName": "축퇴 레그람",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "89f73fe661e2966376419e2f3b1de56b",
                    "itemName": "최심장 레그람",
                    "slotCode": "203",
                    "slotName": "장신구2",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "b70014b47a4fedfca3937a6f9294092f",
                    "itemName": "서치 스파클링 ",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "c0432d98a1e2d21bda6e726ef4dafce3",
                    "itemName": "런업 스프린터",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "05f9a58662c0205e643a31c8d930d2fe",
                    "itemName": "레버 파이크 ",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "a5829b6da66c7bb983e58fc5cc207f30",
                    "itemName": "솔리드 스위퍼",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "8be7e6254b58ecbf2a13e81931a7435f",
                    "itemName": "인사이트 엔진T7 ",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "102",
                    "rarityName": "언커먼",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "dede8b1202059f7a06c461c905bb891a",
                    "itemName": "E 스타리 나이트 SU",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "7f83de127fa530f7b28e189956f324b8",
                    "itemName": "섬전연각 포천",
                    "slotCode": "204",
                    "slotName": "장신구3",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "96585faf04552dabf54125f491dcf19f",
                    "itemName": "스타 포드인포서 SU",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        },
        {
            "playerId": "030296f6cb4fa535639ca4811bf451dc",
            "nickname": "스슥",
            "map": {
                "mapId": "105",
                "name": "그랑플람 아시아 지부"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 2,
                "partyId": "fe544f88e05b21f2df8435ddcb24deed",
                "playTypeName": "정상",
                "characterId": "798afd40efb445158c963b6de2588a6e",
                "characterName": "토마스",
                "level": 40,
                "killCount": 0,
                "deathCount": 4,
                "assistCount": 28,
                "attackPoint": 10058,
                "damagePoint": 28298,
                "battlePoint": 232,
                "sightPoint": 320,
                "towerAttackPoint": 5603,
                "backAttackCount": 29,
                "comboCount": 36,
                "spellCount": 29,
                "healAmount": 0,
                "sentinelKillCount": 8,
                "demolisherKillCount": 9,
                "trooperKillCount": 0,
                "guardianKillCount": 0,
                "guardTowerKillCount": 0,
                "getCoin": 13250,
                "spendCoin": 12850,
                "spendConsumablesCoin": 3600,
                "playTime": 854,
                "responseTime": 112,
                "minLifeTime": 38,
                "maxLifeTime": 319
            },
            "position": {
                "name": "서포터",
                "explain": "주변 아군의 스킬 공격력 +3%, 방어력 +4%, 회피 +4%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "df59f2eb5ed6bc0072f5416123654f32",
                        "name": "코인 은행"
                    },
                    {
                        "level": 2,
                        "id": "28bcd65c129d0c93789c321e0a183bd8",
                        "name": "호위"
                    },
                    {
                        "level": 3,
                        "id": "d80ac19ac1572686e3a033c84dfb91ee",
                        "name": "치유 증폭기"
                    },
                    {
                        "level": 4,
                        "id": "50ce90f1013b152718b1dcc4c3023f36",
                        "name": "부서진 갑옷"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "22f4720521fb69b89aede8e72240fec6",
                    "itemName": "E 아이스 컴포지션",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "b99afb71fd7668e99b00482b86d8382c",
                    "itemName": "잭 아이실드 ",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "14891851fa85e9c54b2d398419a757b1",
                    "itemName": "E 윈터 히어로",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "a799fcdd964870e7b6db4ba5c78af77c",
                    "itemName": "E 스노우 플라워",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "bc50a21945ec4d434ac18a4a6cb60863",
                    "itemName": "E 미스틱 아이스",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "8e678a6a46c8629f73345f4dda90239f",
                    "itemName": "E 블리자드 기어 ",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "ca3a99302c679316548a2614298a73f9",
                    "itemName": "빙산 레그람",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "35fa92417f07531df908c02e5faeeb7d",
                    "itemName": "프리즌 콜드밴드",
                    "slotCode": "203",
                    "slotName": "장신구2",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "26b2981ec73f48b10c391d49aabffeaa",
                    "itemName": "쿨 스파클링 ",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "058d06590a1996cee1065aedc3d47a4b",
                    "itemName": "프로스트 엑셀",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "17846766a53f7598f88fe35ec3b3391b",
                    "itemName": "프로스트 파이크 ",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "cd4e84dccbb310805fc701507b448c23",
                    "itemName": "프로스트 타즈 ",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "a6abfd4505fb46cde75dc5b4414b60b8",
                    "itemName": "PS 레이더 R4",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "102",
                    "rarityName": "언커먼",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "147cea4b1c6a5b1c9f437481a4682af8",
                    "itemName": "E 프로스트 솔리드",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "6437448e0cfc02a15e6118007fd650da",
                    "itemName": "냉각 도스프로퍼",
                    "slotCode": "204",
                    "slotName": "장신구3",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "aa0cbb61f4ecd32a0a2629d23ea9a79e",
                    "itemName": "설풍 레그람",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        },
        {
            "playerId": "afd543635491dc2634f05f7d130808e4",
            "nickname": "경상도오빠조아",
            "map": {
                "mapId": "105",
                "name": "그랑플람 아시아 지부"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 0,
                "partyId": "b762303013093c43599c55f64fdcff53",
                "playTypeName": "정상",
                "characterId": "5ee187dd8ba81f5bb7141688d8aa1c28",
                "characterName": "탄야",
                "level": 56,
                "killCount": 12,
                "deathCount": 1,
                "assistCount": 6,
                "attackPoint": 67197,
                "damagePoint": 4689,
                "battlePoint": 147,
                "sightPoint": 242,
                "towerAttackPoint": 59478,
                "backAttackCount": 49,
                "comboCount": 83,
                "spellCount": 0,
                "healAmount": 0,
                "sentinelKillCount": 21,
                "demolisherKillCount": 23,
                "trooperKillCount": 2,
                "guardianKillCount": 0,
                "guardTowerKillCount": 0,
                "getCoin": 18150,
                "spendCoin": 17785,
                "spendConsumablesCoin": 3360,
                "playTime": 854,
                "responseTime": 38,
                "minLifeTime": 283,
                "maxLifeTime": 533
            },
            "position": {
                "name": "원거리딜러",
                "explain": "치명타 피해량 +12%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "e29cbec17de6ae981984c6d279400483",
                        "name": "완벽주의자"
                    },
                    {
                        "level": 2,
                        "id": "309cb18ddba5e26b81c47ad7d792124a",
                        "name": "재빠른 대응"
                    },
                    {
                        "level": 3,
                        "id": "2ee2eeb641442593cc234332b0809202",
                        "name": "할인 판매"
                    },
                    {
                        "level": 4,
                        "id": "3a161b331b17d723237b2af3f1000022",
                        "name": "태세전환"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "2b4db5ca2326e66d8be16e9019e3c816",
                    "itemName": "S 죽음의 손길",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "139778831093bb488a7cf418c3e646e5",
                    "itemName": "E Ms.다크니스",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "9da4c090ef90ddf451324247af4d29d0",
                    "itemName": "E 헌터의 여유",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "f416ef9879c0c43843695a6c2f427275",
                    "itemName": "S 위키드 액트",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "f65b7be9654260147ef83cc090e55a56",
                    "itemName": "E 강제적 질서",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "acad9f77db386a37f5c1567bf378ccdd",
                    "itemName": "S 이블 퀸",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "ec8a7514563a6d46d0a7cbd2b77bce68",
                    "itemName": "독전갈 칼세도니",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "40d27e9b0dd6f28d9d5d561941208b7f",
                    "itemName": "SB블러썸 루차",
                    "slotCode": "203",
                    "slotName": "장신구2",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "2934f62fb6eb7eca2b6d634b804a834a",
                    "itemName": "체스터 더블버거",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "c0432d98a1e2d21bda6e726ef4dafce3",
                    "itemName": "런업 스프린터",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "b37373156f360fb1d0805bd0d846b0b9",
                    "itemName": "이펙트 이펙션",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "7d3991e7b349a41d043cc0064f7c4ea2",
                    "itemName": "스테민 터틀",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "61e023b65b8d476c361ab52fe131d70d",
                    "itemName": "여신 맥시머",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "16db756b81cf2fee53390307c02945a1",
                    "itemName": "S 데들리 드러그",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "7fefef99a47074a660040ce98a9aa587",
                    "itemName": "스토커 칼세도니",
                    "slotCode": "201",
                    "slotName": "장신구ALL",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "59f7fb5a28da7b7873478360c68e2850",
                    "itemName": "페이탈 리퀴르",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        },
        {
            "playerId": "1826e7c7f0becbc1e65ee644c28f0072",
            "nickname": "마을주민1",
            "map": {
                "mapId": "105",
                "name": "그랑플람 아시아 지부"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 0,
                "partyId": "b762303013093c43599c55f64fdcff53",
                "playTypeName": "정상",
                "characterId": "149913567cfcc642a07e46ad41049da6",
                "characterName": "제키엘",
                "level": 20,
                "killCount": 0,
                "deathCount": 8,
                "assistCount": 7,
                "attackPoint": 5073,
                "damagePoint": 60648,
                "battlePoint": 226,
                "sightPoint": 285,
                "towerAttackPoint": 1127,
                "backAttackCount": 19,
                "comboCount": 13,
                "spellCount": 0,
                "healAmount": 0,
                "sentinelKillCount": 6,
                "demolisherKillCount": 1,
                "trooperKillCount": 0,
                "guardianKillCount": 0,
                "guardTowerKillCount": 0,
                "getCoin": 8150,
                "spendCoin": 7550,
                "spendConsumablesCoin": 3100,
                "playTime": 854,
                "responseTime": 137,
                "minLifeTime": 33,
                "maxLifeTime": 196
            },
            "position": {
                "name": "탱커",
                "explain": "체력 +7%, 회피 +5%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "a681dbe9ad002a1ebe7f9c9229de9c7d",
                        "name": "전선 유지"
                    },
                    {
                        "level": 2,
                        "id": "809f6fa4aced8ec003b40f2cf09f9f12",
                        "name": "고독한 늑대"
                    },
                    {
                        "level": 3,
                        "id": "bd9cbd5e0ae14ea1b1870265818fb358",
                        "name": "단단한 피부"
                    },
                    {
                        "level": 4,
                        "id": "6d8fb905d69edf1c9f73495c3ee44d28",
                        "name": "선봉장"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "2053bf052b2c9290dbc9bc924a055e2c",
                    "itemName": "E 잔혹한 구원",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "529c8548bd7ba8bb2c4ae57a3404020b",
                    "itemName": "E 안티 메시아",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "786d12e75ecccdbf0b38ef9880731517",
                    "itemName": "S 거부당한 기도",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "860daaea14b345cb620282b2c1f486f7",
                    "itemName": "RA데들리 가이드",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "da2819975912337d47be767348f89953",
                    "itemName": "E 불공정한 안식",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "029cf5bd03085bc87623d064e917fa52",
                    "itemName": "E 약속된 재림",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "f00768c1dc98b95a99cb4e89b59e2aee",
                    "itemName": "인도 레그람",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "d68512c6c75bff2b419765b5213de1ca",
                    "itemName": "단죄 레그람",
                    "slotCode": "203",
                    "slotName": "장신구2",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "e6b1ed0c3052d8b5602eb66e9a7f96ec",
                    "itemName": "파나틱 스파클링 ",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "c0432d98a1e2d21bda6e726ef4dafce3",
                    "itemName": "런업 스프린터",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "06a08ac3aefb8e0412febd4d43a8deae",
                    "itemName": "파나틱 파이크 ",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "14ff9beceac60980ab3e651b55118760",
                    "itemName": "파나틱 플래쉬 ",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "8be7e6254b58ecbf2a13e81931a7435f",
                    "itemName": "인사이트 엔진T7 ",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "102",
                    "rarityName": "언커먼",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "74d59b2ff5e9808d3c1bda5dfdf92160",
                    "itemName": "톨 레더마스크 ",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "8b302419c3f126c00b6cf3ad8d25b04b",
                    "itemName": "사도강림 스탠볼",
                    "slotCode": "204",
                    "slotName": "장신구3",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "78050b98e1ae56cf4ad7261f3e56d6b3",
                    "itemName": "묵시록 레그람",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        },
        {
            "playerId": "87b0465151fb6572931a96593d8486c0",
            "nickname": "ㅣ서비스종료ㅣ",
            "map": {
                "mapId": "105",
                "name": "그랑플람 아시아 지부"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 0,
                "partyId": "b762303013093c43599c55f64fdcff53",
                "playTypeName": "정상",
                "characterId": "cc357fcea986318e6f6b4fe4501f4a1f",
                "characterName": "타라",
                "level": 42,
                "killCount": 2,
                "deathCount": 8,
                "assistCount": 12,
                "attackPoint": 28286,
                "damagePoint": 21213,
                "battlePoint": 120,
                "sightPoint": 158,
                "towerAttackPoint": 34582,
                "backAttackCount": 25,
                "comboCount": 67,
                "spellCount": 0,
                "healAmount": 0,
                "sentinelKillCount": 10,
                "demolisherKillCount": 18,
                "trooperKillCount": 1,
                "guardianKillCount": 0,
                "guardTowerKillCount": 0,
                "getCoin": 13390,
                "spendCoin": 13030,
                "spendConsumablesCoin": 2780,
                "playTime": 854,
                "responseTime": 209,
                "minLifeTime": 30,
                "maxLifeTime": 158
            },
            "position": {
                "name": "원거리딜러",
                "explain": "치명타 피해량 +12%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "e29cbec17de6ae981984c6d279400483",
                        "name": "완벽주의자"
                    },
                    {
                        "level": 2,
                        "id": "309cb18ddba5e26b81c47ad7d792124a",
                        "name": "재빠른 대응"
                    },
                    {
                        "level": 3,
                        "id": "2ee2eeb641442593cc234332b0809202",
                        "name": "할인 판매"
                    },
                    {
                        "level": 4,
                        "id": "ac75b2be060e121bbea9548d599f278e",
                        "name": "완전한 성장"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "0eb4c8df351615983cdb5d69b2823602",
                    "itemName": "S 데몰리션 파이어",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "df4d114123f8e174915876b8af05413c",
                    "itemName": "E 아이리스 보터 ",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "66f7385f5d3d8da1d97f7a3f7f1606dd",
                    "itemName": "플레어 플라밍고",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "aee93fbf0e634ad0ffb2ed338e92f121",
                    "itemName": "E 무크 디토네이터",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "47fed9f957d5094eda773b33532cd6ef",
                    "itemName": "E 스칼렛 랩소디",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "19f0134c20a835546c760c38293ce67a",
                    "itemName": "E 파이어 포르테",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "a9139207df09f106662a5dcf5ee32f63",
                    "itemName": "불놀이 하우레스",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "0921b695ef5e52fe2ce160a65f0ca489",
                    "itemName": "발화 하우레스",
                    "slotCode": "203",
                    "slotName": "장신구2",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "782b0f48a0141ed3c8d08fa39e2f2ed7",
                    "itemName": "체스터 더블버거",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "c0432d98a1e2d21bda6e726ef4dafce3",
                    "itemName": "런업 스프린터",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "fe9215f104595f0b416dbad620e38ac6",
                    "itemName": "플레어 이펙트 ",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "a5829b6da66c7bb983e58fc5cc207f30",
                    "itemName": "솔리드 스위퍼",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "7ce42cd7ba086e2eb77b969a12d77e8f",
                    "itemName": "공간발화 임팩트",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "102",
                    "rarityName": "언커먼",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "732cb7a331ea636a507ad2c7cc1e529b",
                    "itemName": "E 스티즈 머쉬 SU",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "0747998b1469f21dd060446f2f8d712e",
                    "itemName": "불꽃마녀-혼불",
                    "slotCode": "201",
                    "slotName": "장신구ALL",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "e5bc8e620f861ae33354e7ff7c8ebd8f",
                    "itemName": "메테오 카티에르 SU",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        },
        {
            "playerId": "55a9bbc9936fa531e43071f014964e80",
            "nickname": "드렁큰삼룡퀴엠",
            "map": {
                "mapId": "105",
                "name": "그랑플람 아시아 지부"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 0,
                "partyId": "b762303013093c43599c55f64fdcff53",
                "playTypeName": "정상",
                "characterId": "42ba0da0781020231280624071c3574d",
                "characterName": "플로리안",
                "level": 36,
                "killCount": 3,
                "deathCount": 4,
                "assistCount": 22,
                "attackPoint": 22599,
                "damagePoint": 31244,
                "battlePoint": 281,
                "sightPoint": 383,
                "towerAttackPoint": 9018,
                "backAttackCount": 47,
                "comboCount": 57,
                "spellCount": 0,
                "healAmount": 0,
                "sentinelKillCount": 1,
                "demolisherKillCount": 7,
                "trooperKillCount": 0,
                "guardianKillCount": 0,
                "guardTowerKillCount": 1,
                "getCoin": 12750,
                "spendCoin": 12000,
                "spendConsumablesCoin": 4200,
                "playTime": 854,
                "responseTime": 105,
                "minLifeTime": 66,
                "maxLifeTime": 333
            },
            "position": {
                "name": "탱커",
                "explain": "체력 +7%, 회피 +5%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "ce65e78d295a624270d418ebafa8d1c0",
                        "name": "기민한 몸놀림"
                    },
                    {
                        "level": 2,
                        "id": "745942f7f2c5030a057d3c9cc3a0ce04",
                        "name": "수플렉스"
                    },
                    {
                        "level": 3,
                        "id": "90cbe4d23334af802602d85abdeb32ad",
                        "name": "추진력"
                    },
                    {
                        "level": 4,
                        "id": "6d8fb905d69edf1c9f73495c3ee44d28",
                        "name": "선봉장"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "bfaa2e6c8afc7a870dcf12687f2807bc",
                    "itemName": "S 빼앗은 증표",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "45b0e83299d12ca94ed09aee0e629584",
                    "itemName": "의존적 자기애",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "2c5718e2038f710a46ff2b13ffcc9891",
                    "itemName": "E 영원한 소년",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "7a3a128abc8c6e67898b10d8b2b49fe0",
                    "itemName": "RA퍼시스턴트",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "0ab96f1c0500a7d307157cd023bd28f0",
                    "itemName": "E 에고 디펜스",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "9aa3111f79694e1cbb7d95e57849ab18",
                    "itemName": "S 스포일드 차일드",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "3b410620557ade361b4f4566211012df",
                    "itemName": "끈끈이 이어링",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "c8529b10118c2eee39fa0ed16b99cc19",
                    "itemName": "섭취 레그람",
                    "slotCode": "203",
                    "slotName": "장신구2",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "1d8f428c1747f4fab7793fc19e59aaf5",
                    "itemName": "첼시 콜라 V",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "c0432d98a1e2d21bda6e726ef4dafce3",
                    "itemName": "런업 스프린터",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "0d4016d531f366de68c4af5329337b74",
                    "itemName": "디시브 파이크 ",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "64756e25420b2237e6ddcbf83795280c",
                    "itemName": "디시브 플래쉬 ",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "a6abfd4505fb46cde75dc5b4414b60b8",
                    "itemName": "PS 레이더 R4",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "102",
                    "rarityName": "언커먼",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "166d176c9ee01902e90e69849f8d99c7",
                    "itemName": "S 거짓된 관계",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "47bd03b5dddc673f4bec718b45a4b761",
                    "itemName": "줄기 레그람",
                    "slotCode": "204",
                    "slotName": "장신구3",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "5eafa42ce3592a26381731d68aafe23c",
                    "itemName": "탐욕의 권화",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        },
        {
            "playerId": "98270ff2a689292aaf29a412346d237a",
            "nickname": "말이야막걸리야",
            "map": {
                "mapId": "105",
                "name": "그랑플람 아시아 지부"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 0,
                "partyId": "b762303013093c43599c55f64fdcff53",
                "playTypeName": "정상",
                "characterId": "1e2129fcb1eebba2101ee5de6c4b168a",
                "characterName": "테이",
                "level": 60,
                "killCount": 14,
                "deathCount": 2,
                "assistCount": 8,
                "attackPoint": 49141,
                "damagePoint": 12675,
                "battlePoint": 111,
                "sightPoint": 154,
                "towerAttackPoint": 6838,
                "backAttackCount": 22,
                "comboCount": 39,
                "spellCount": 0,
                "healAmount": 0,
                "sentinelKillCount": 48,
                "demolisherKillCount": 32,
                "trooperKillCount": 1,
                "guardianKillCount": 1,
                "guardTowerKillCount": 0,
                "getCoin": 20630,
                "spendCoin": 19325,
                "spendConsumablesCoin": 3700,
                "playTime": 854,
                "responseTime": 89,
                "minLifeTime": 77,
                "maxLifeTime": 501
            },
            "position": {
                "name": "근거리딜러",
                "explain": "치명타 피해량 +12%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "984e475dde2591d36151e8ca1744cfd9",
                        "name": "급소 가격"
                    },
                    {
                        "level": 2,
                        "id": "43c56f15f90192f7ead0a8eba794fbed",
                        "name": "전장의 학살자"
                    },
                    {
                        "level": 3,
                        "id": "90cbe4d23334af802602d85abdeb32ad",
                        "name": "추진력"
                    },
                    {
                        "level": 4,
                        "id": "47b288f44ffb19009e9d2adc73c62472",
                        "name": "최후의 일격"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "7bc346ad3593cab577c0edea006ed030",
                    "itemName": "E 호사수구",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "562a340451e34b40a50feae21af589d8",
                    "itemName": "E 용주",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "64f7c00951139533c1607413a788a700",
                    "itemName": "S 의금지영",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "b3b65b91f9d3e11568cfa83c217a6b06",
                    "itemName": "E 백낙일고",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "719f4aa3001b19282f8eee6812450e29",
                    "itemName": "S 공명수죽백",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "2d8b718440412d7680175d578d92f07b",
                    "itemName": "S 극세척도",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "91688c498eb99236b96853ed3983c0a8",
                    "itemName": "암영 타이클립",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "d213a21109ecf7a92880d9c73a1f3d9d",
                    "itemName": "SB흑풍각 루차",
                    "slotCode": "203",
                    "slotName": "장신구2",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "d1aadaa48dd9e20fda39fcb86d2b423b",
                    "itemName": "체스터 더블버거",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "c0432d98a1e2d21bda6e726ef4dafce3",
                    "itemName": "런업 스프린터",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "b37373156f360fb1d0805bd0d846b0b9",
                    "itemName": "이펙트 이펙션",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "a5829b6da66c7bb983e58fc5cc207f30",
                    "itemName": "솔리드 스위퍼",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "e8cc99bd440a00231f6d4266ba682c05",
                    "itemName": "무영격 임팩트",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "102",
                    "rarityName": "언커먼",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "b5eb40c2a91b47120aa9e77f4534ad2c",
                    "itemName": "S 붉은 반그림자 SU",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "9360c9b3c5dd6f3ec727ab7aadf5f84c",
                    "itemName": "무영격 타이클립",
                    "slotCode": "204",
                    "slotName": "장신구3",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "608fc37d7c4f71472ce3b9c34cd1510d",
                    "itemName": "도주지부 SU",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        },
        {
            "playerId": "a476fa3918802da500b35329d44dd935",
            "nickname": "진구인",
            "map": {
                "mapId": "105",
                "name": "그랑플람 아시아 지부"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 0,
                "partyId": "b762303013093c43599c55f64fdcff53",
                "playTypeName": "정상",
                "characterId": "caa0168d0c68ec4dfe64d025df2673f0",
                "characterName": "아이작",
                "level": 26,
                "killCount": 0,
                "deathCount": 8,
                "assistCount": 5,
                "attackPoint": 9500,
                "damagePoint": 50314,
                "battlePoint": 230,
                "sightPoint": 327,
                "towerAttackPoint": 0,
                "backAttackCount": 28,
                "comboCount": 15,
                "spellCount": 0,
                "healAmount": 0,
                "sentinelKillCount": 0,
                "demolisherKillCount": 3,
                "trooperKillCount": 0,
                "guardianKillCount": 0,
                "guardTowerKillCount": 0,
                "getCoin": 8170,
                "spendCoin": 7650,
                "spendConsumablesCoin": 2300,
                "playTime": 854,
                "responseTime": 174,
                "minLifeTime": 27,
                "maxLifeTime": 172
            },
            "position": {
                "name": "탱커",
                "explain": "체력 +7%, 회피 +5%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "a681dbe9ad002a1ebe7f9c9229de9c7d",
                        "name": "전선 유지"
                    },
                    {
                        "level": 2,
                        "id": "809f6fa4aced8ec003b40f2cf09f9f12",
                        "name": "고독한 늑대"
                    },
                    {
                        "level": 3,
                        "id": "bd9cbd5e0ae14ea1b1870265818fb358",
                        "name": "단단한 피부"
                    },
                    {
                        "level": 4,
                        "id": "6d8fb905d69edf1c9f73495c3ee44d28",
                        "name": "선봉장"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "35ef85617c20bc885c93569dbd7e0169",
                    "itemName": "S 리트릿 프리벤트",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "dfeb3975bb25b631025dd594c769d26d",
                    "itemName": "언노운 페이스",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "b3a4671081d601d65dc2114d4fa0215d",
                    "itemName": "S 빅 블랙 머신",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "d7d3db29e44b9f9cb37fa776b2089cd0",
                    "itemName": "S 인휴먼 퍼슈어",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "3a3e4d188d5806203c37ce89b0b92f8e",
                    "itemName": "E 킬링 머신",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "8ef23a5ac4da682b801b36db14bfc2d0",
                    "itemName": "S 데드 컨트랩션",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "f20e6f5322e1070c3f55f11f236c24d6",
                    "itemName": "저지먼트 레그람",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "90002390dcaa24d2051dfc9c26cf9929",
                    "itemName": "그런트-레이지",
                    "slotCode": "201",
                    "slotName": "장신구ALL",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "6680ccd0ed62d2ab0e1cfdbcfac8a79c",
                    "itemName": "블랙 스파클링 ",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "5b9a8108b0b92457abc225c565fde466",
                    "itemName": "리세스 스프린터",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "7c373d1b093c600863bbee2a46f53e52",
                    "itemName": "블랙 파이크 ",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "2e68b656a3f4d3e4ac535f5c9fb4890f",
                    "itemName": "블랙 플래쉬",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "8be7e6254b58ecbf2a13e81931a7435f",
                    "itemName": "인사이트 엔진T7 ",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "102",
                    "rarityName": "언커먼",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "f3d9921bbd7dc3b3c3fb5f9a3203a3c1",
                    "itemName": "어벤징 이모션",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "6115a58bebb8be90c4e9e0581d9768b0",
                    "itemName": "데드맨 레그람",
                    "slotCode": "204",
                    "slotName": "장신구3",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "7c5dba1d51aa42f7176f5c2f61aaaa42",
                    "itemName": "스윙 레그람",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        },
        {
            "playerId": "7791dc0e4b08791dd606405678e4c98b",
            "nickname": "여자가말대꾸",
            "map": {
                "mapId": "105",
                "name": "그랑플람 아시아 지부"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 0,
                "partyId": "b762303013093c43599c55f64fdcff53",
                "playTypeName": "정상",
                "characterId": "345130ea32fe807df9588e9bb3cf4759",
                "characterName": "호타루",
                "level": 47,
                "killCount": 8,
                "deathCount": 7,
                "assistCount": 5,
                "attackPoint": 39531,
                "damagePoint": 23288,
                "battlePoint": 153,
                "sightPoint": 222,
                "towerAttackPoint": 6113,
                "backAttackCount": 39,
                "comboCount": 70,
                "spellCount": 0,
                "healAmount": 0,
                "sentinelKillCount": 21,
                "demolisherKillCount": 24,
                "trooperKillCount": 0,
                "guardianKillCount": 0,
                "guardTowerKillCount": 0,
                "getCoin": 14490,
                "spendCoin": 13995,
                "spendConsumablesCoin": 2220,
                "playTime": 854,
                "responseTime": 195,
                "minLifeTime": 46,
                "maxLifeTime": 222
            },
            "position": {
                "name": "근거리딜러",
                "explain": "치명타 피해량 +12%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "984e475dde2591d36151e8ca1744cfd9",
                        "name": "급소 가격"
                    },
                    {
                        "level": 2,
                        "id": "3a9d372c4c7ce1abbe681118154d2933",
                        "name": "첼시 버거 주니어"
                    },
                    {
                        "level": 3,
                        "id": "2ee2eeb641442593cc234332b0809202",
                        "name": "할인 판매"
                    },
                    {
                        "level": 4,
                        "id": "47b288f44ffb19009e9d2adc73c62472",
                        "name": "최후의 일격"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "736cce2fd1087b15fd88404a2ba2454a",
                    "itemName": "E 아마테라스",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "50ffc77719f5aa1107aa36bd404a70cc",
                    "itemName": "E 백연 비천무",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "a77f2d685678767254b05a0f1af5aee3",
                    "itemName": "S 아카 토리노",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "c345e76fa30db64e9670d2ed37ed3269",
                    "itemName": "E 팔문괘장",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "e2a3386356c822c88dea736874038857",
                    "itemName": "E 바케모노 가타리",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "32f4d1f24165a845b598fe71765be3f8",
                    "itemName": "S 은월기담",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "8f0087b9e59ba656a26f5bfc69f1eae2",
                    "itemName": "쐐기 카무이",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "95234ab98732d4b66a8393302f044874",
                    "itemName": "SB폭연 루차",
                    "slotCode": "203",
                    "slotName": "장신구2",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "e85511c684774e098b2f38e6033cb6a2",
                    "itemName": "폭연 스파클링",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "5b9a8108b0b92457abc225c565fde466",
                    "itemName": "리세스 스프린터",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "349b81987be72f3157eed745ab249952",
                    "itemName": "폭연 이펙트",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "a5829b6da66c7bb983e58fc5cc207f30",
                    "itemName": "솔리드 스위퍼",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "8be7e6254b58ecbf2a13e81931a7435f",
                    "itemName": "인사이트 엔진T7 ",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "102",
                    "rarityName": "언커먼",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "724731dfd2b411b955668c88dc5d6543",
                    "itemName": "E 아카 오오조라",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "1608d97bb2ca1f2fc26b6bbf42cf30f5",
                    "itemName": "비연폭 카무이",
                    "slotCode": "204",
                    "slotName": "장신구3",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "2d24f3578459a77ef9f9813aaaab40a3",
                    "itemName": "환영술 두루마리",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        },
        {
            "playerId": "8e5f6e41d4706ac9d2709f6f256295fb",
            "nickname": "AAPL무한매수",
            "map": {
                "mapId": "105",
                "name": "그랑플람 아시아 지부"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 0,
                "partyId": "b762303013093c43599c55f64fdcff53",
                "playTypeName": "정상",
                "characterId": "3dab248071530f76ea748d54c188b48b",
                "characterName": "바스티안",
                "level": 48,
                "killCount": 6,
                "deathCount": 5,
                "assistCount": 6,
                "attackPoint": 26800,
                "damagePoint": 16124,
                "battlePoint": 105,
                "sightPoint": 139,
                "towerAttackPoint": 10731,
                "backAttackCount": 34,
                "comboCount": 67,
                "spellCount": 0,
                "healAmount": 0,
                "sentinelKillCount": 24,
                "demolisherKillCount": 22,
                "trooperKillCount": 0,
                "guardianKillCount": 0,
                "guardTowerKillCount": 0,
                "getCoin": 13830,
                "spendCoin": 13175,
                "spendConsumablesCoin": 1100,
                "playTime": 854,
                "responseTime": 163,
                "minLifeTime": 32,
                "maxLifeTime": 317
            },
            "position": {
                "name": "원거리딜러",
                "explain": "치명타 피해량 +12%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "e29cbec17de6ae981984c6d279400483",
                        "name": "완벽주의자"
                    },
                    {
                        "level": 2,
                        "id": "ff6a4b6ab1d0fe84d63cace2e0c24a69",
                        "name": "사냥꾼의 본능"
                    },
                    {
                        "level": 3,
                        "id": "16b2ec9059c36ce969a6981d4146b24b",
                        "name": "가속화"
                    },
                    {
                        "level": 4,
                        "id": "ac75b2be060e121bbea9548d599f278e",
                        "name": "완전한 성장"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "fa9db77c6297c95585316d7edd64b14f",
                    "itemName": "투 홈랜드",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "5542cdb5d1c3e07f23a08df148dcc4e8",
                    "itemName": "S 듀얼 내셔널리티",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "9d402134602af2108ba2a247f1b51e48",
                    "itemName": "E 어브덕터",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "1caf5e11dd50c70687601d7f1466b2c8",
                    "itemName": "S 샤프 텅",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "22ff2cb1ec80a441aa9c02bfd225c813",
                    "itemName": "E 불리보이",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "9e81402ef547f874bbedc9efce7c03c6",
                    "itemName": "E 절망의 수렁",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "65d945dc4145fc972f70ab12cb7784f1",
                    "itemName": "스웨지 핸드 본",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "e6b97549e390ed979e1c1b85e6faf952",
                    "itemName": "스닉 텍스타일",
                    "slotCode": "203",
                    "slotName": "장신구2",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "78fdbdd58dc7e4d32afee626a8502391",
                    "itemName": "트레이터 스파클링",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "c0432d98a1e2d21bda6e726ef4dafce3",
                    "itemName": "런업 스프린터",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "b37373156f360fb1d0805bd0d846b0b9",
                    "itemName": "이펙트 이펙션",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "a5829b6da66c7bb983e58fc5cc207f30",
                    "itemName": "솔리드 스위퍼",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "1f164368a70dee47932cb9972af1d91b",
                    "itemName": "아바돈 맥시머",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "3371d94f02a5402da223e03879841d35",
                    "itemName": "E 리드 뉴 에이지",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "1c7d13e6c68b8893cd9daaac067abe1e",
                    "itemName": "리퀴드 텍스타일",
                    "slotCode": "204",
                    "slotName": "장신구3",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "4a71ef88933786f30af841eaedcbd75c",
                    "itemName": "파괴적 망상",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        }
    ]
}, 


{
    "date": "2023-11-28 00:06",
    "gameTypeId": "rating",
    "map": {
        "mapId": "101",
        "name": "리버포드"
    },
    "teams": [
        {
            "result": "lose",
            "players": [
                "4d96b2eb84520c929d5f69719fdcd66f",
                "1826e7c7f0becbc1e65ee644c28f0072",
                "34ca8555083772f37d888dde2b87d8cc",
                "e35785b6d08bec3d3b5edeca958dd4ed",
                "aca779a9a6f580a70a655e8f60e48b5a"
            ]
        },
        {
            "result": "win",
            "players": [
                "8d0caff773dca864c737f344ccfa1d48",
                "6cefd729d8c756d5f47b4d67f47177ba",
                "e99e0ccd8265006fa23295dec8142e17",
                "1eba9e6fe1cec7af179906f5e7041f60",
                "a357c918b695e1a85d212a1c2f32de25"
            ]
        }
    ],
    "players": [
        {
            "playerId": "4d96b2eb84520c929d5f69719fdcd66f",
            "nickname": "닥터미유",
            "map": {
                "mapId": "101",
                "name": "리버포드"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 0,
                "partyId": "b762303013093c43599c55f64fdcff53",
                "playTypeName": "정상",
                "characterId": "f414d81d3be548d47d856bfcabd50bce",
                "characterName": "나이오비",
                "level": 48,
                "killCount": 3,
                "deathCount": 5,
                "assistCount": 7,
                "attackPoint": 41111,
                "damagePoint": 22922,
                "battlePoint": 195,
                "sightPoint": 256,
                "towerAttackPoint": 18915,
                "backAttackCount": 21,
                "comboCount": 45,
                "spellCount": 0,
                "healAmount": 0,
                "sentinelKillCount": 14,
                "demolisherKillCount": 25,
                "trooperKillCount": 0,
                "guardianKillCount": 0,
                "guardTowerKillCount": 0,
                "getCoin": 13510,
                "spendCoin": 13470,
                "spendConsumablesCoin": 1420,
                "playTime": 930,
                "responseTime": 148,
                "minLifeTime": 30,
                "maxLifeTime": 260
            },
            "position": {
                "name": "원거리딜러",
                "explain": "치명타 피해량 +12%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "e29cbec17de6ae981984c6d279400483",
                        "name": "완벽주의자"
                    },
                    {
                        "level": 2,
                        "id": "43c56f15f90192f7ead0a8eba794fbed",
                        "name": "전장의 학살자"
                    },
                    {
                        "level": 3,
                        "id": "2ee2eeb641442593cc234332b0809202",
                        "name": "할인 판매"
                    },
                    {
                        "level": 4,
                        "id": "abd29ed2134647107bdf5bfaa424a494",
                        "name": "전장의 열기"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "167b0d3f6fb1fe761ecfa25dc10525b8",
                    "itemName": "S 레이지 파이어월",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "15e55bad69a59f16b14ce6be486ac585",
                    "itemName": "E 앨더란 ",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "67fb7dfcfda214f1b0decc431261d423",
                    "itemName": "E 버밀리온 하트",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "ed0fb5085395ca545c93cd1651e6ef19",
                    "itemName": "E 플레임 시타델",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "b7da52aa49df3560f51f11f5e5f15311",
                    "itemName": "E 그레이스 스콧 ",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "7fb256ebe71d53a76a8ff0b344e0d56c",
                    "itemName": "E 불꽃의 윤무",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "e3356a290a92d602186c340e56255b56",
                    "itemName": "불놀이 로임",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "cc1afb10104f6fa867a405059bf1254a",
                    "itemName": "불꽃성채 로임",
                    "slotCode": "203",
                    "slotName": "장신구2",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "181ee2d5d1514ef759518747d27b0ebd",
                    "itemName": "루비 스파클링 ",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "eedf3c75e024fb3e9ec5577821bae050",
                    "itemName": "블레이즈 스프린터 ",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "bfcb212a766df907a9b8da06d6d40dfc",
                    "itemName": "블레이즈 파이크 ",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "a5829b6da66c7bb983e58fc5cc207f30",
                    "itemName": "솔리드 스위퍼",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "c1281cc97fcd01dc1fd190bc9dce74dd",
                    "itemName": "초열지옥 맥시머",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "d361ca77141798fb9874244a0dd6f58b",
                    "itemName": "E 인퍼널 배일",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "f2e0e3a06b51c7ec51c94ae0a3469810",
                    "itemName": "정념폭발 로임",
                    "slotCode": "204",
                    "slotName": "장신구3",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "978a62eacab98038a0402e8596eefded",
                    "itemName": "헬 세티스피아",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        },
        {
            "playerId": "1826e7c7f0becbc1e65ee644c28f0072",
            "nickname": "마을주민1",
            "map": {
                "mapId": "101",
                "name": "리버포드"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 0,
                "partyId": "b762303013093c43599c55f64fdcff53",
                "playTypeName": "정상",
                "characterId": "0c972ec7ba90f52229419f6b44a71c89",
                "characterName": "제레온",
                "level": 33,
                "killCount": 2,
                "deathCount": 8,
                "assistCount": 8,
                "attackPoint": 19359,
                "damagePoint": 40903,
                "battlePoint": 219,
                "sightPoint": 260,
                "towerAttackPoint": 5873,
                "backAttackCount": 17,
                "comboCount": 38,
                "spellCount": 0,
                "healAmount": 0,
                "sentinelKillCount": 10,
                "demolisherKillCount": 5,
                "trooperKillCount": 0,
                "guardianKillCount": 0,
                "guardTowerKillCount": 0,
                "getCoin": 10230,
                "spendCoin": 10100,
                "spendConsumablesCoin": 2800,
                "playTime": 930,
                "responseTime": 164,
                "minLifeTime": 32,
                "maxLifeTime": 259
            },
            "position": {
                "name": "탱커",
                "explain": "체력 +7%, 회피 +5%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "58cbc9f18d436570e76534c2f0d8dc12",
                        "name": "마운트"
                    },
                    {
                        "level": 2,
                        "id": "711f424bc5801dcdee09eee1863f5e0e",
                        "name": "낙법"
                    },
                    {
                        "level": 3,
                        "id": "809f6fa4aced8ec003b40f2cf09f9f12",
                        "name": "고독한 늑대"
                    },
                    {
                        "level": 4,
                        "id": "678bca255e575ae96aceefacaa7aee4e",
                        "name": "최후의 저항"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "056fa7da49de9ef6466bdbe784b30806",
                    "itemName": "S 그레이스 애퀼러",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "48b74931809f6c4f0a55ae34a86ae6b6",
                    "itemName": "E 루미넌 애퀼러",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "89245621ad69e5922ba2a9587101293a",
                    "itemName": "S 로열 히페리온",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "10ee7f3c2f5928b5133f5bd4d0b7beb4",
                    "itemName": "E 템플러 소린",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "375ea7a0e0134af51ab443c7f9f7463a",
                    "itemName": "E 헤본 가디언",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "d121460f335ff5757bd96850a10a68eb",
                    "itemName": "E 인그레이 가디언",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "ed3f68ea4cd85be4a75723c66235d67a",
                    "itemName": "가디언 도미닌",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "7d68b9b503f8bba79797e45297840f5c",
                    "itemName": "프렐류드 레그람",
                    "slotCode": "203",
                    "slotName": "장신구2",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "189b6aec96fecbf3deebff1c7930b3fc",
                    "itemName": "로열 스파클링 ",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "c0432d98a1e2d21bda6e726ef4dafce3",
                    "itemName": "런업 스프린터",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "3b7e1b4892f5ccfb879bc212e0946c10",
                    "itemName": "로열 파이크",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "f9db0cb119d6b39dfbc4680faf750969",
                    "itemName": "로열 타즈 ",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "cf4fdb7f6499d6ebc62c21746e66bfe7",
                    "itemName": "T11-스파이더",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "102",
                    "rarityName": "언커먼",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "9bd0af694250d63e269ea10e1de8f7e7",
                    "itemName": "E 바요넷 플로리쉬 SU",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "713ccee999b070d87178ce41d3c2aef7",
                    "itemName": "템페스트 도미닌",
                    "slotCode": "204",
                    "slotName": "장신구3",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "bce97abfb9a2c45f0fda6f02f38d9008",
                    "itemName": "오버로드 레그람",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        },
        {
            "playerId": "8d0caff773dca864c737f344ccfa1d48",
            "nickname": "비둘기암살단",
            "map": {
                "mapId": "101",
                "name": "리버포드"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 2,
                "partyId": "6f79121020f906785ddaaf6fa5abb14f",
                "playTypeName": "정상",
                "characterId": "6d576eca97a6d8255164ff0c2a017d7e",
                "characterName": "엘리",
                "level": 48,
                "killCount": 3,
                "deathCount": 4,
                "assistCount": 19,
                "attackPoint": 36013,
                "damagePoint": 16032,
                "battlePoint": 161,
                "sightPoint": 192,
                "towerAttackPoint": 33245,
                "backAttackCount": 34,
                "comboCount": 74,
                "spellCount": 0,
                "healAmount": 0,
                "sentinelKillCount": 36,
                "demolisherKillCount": 22,
                "trooperKillCount": 0,
                "guardianKillCount": 0,
                "guardTowerKillCount": 0,
                "getCoin": 16570,
                "spendCoin": 16000,
                "spendConsumablesCoin": 3900,
                "playTime": 930,
                "responseTime": 113,
                "minLifeTime": 67,
                "maxLifeTime": 272
            },
            "position": {
                "name": "원거리딜러",
                "explain": "치명타 피해량 +12%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "e29cbec17de6ae981984c6d279400483",
                        "name": "완벽주의자"
                    },
                    {
                        "level": 2,
                        "id": "43c56f15f90192f7ead0a8eba794fbed",
                        "name": "전장의 학살자"
                    },
                    {
                        "level": 3,
                        "id": "16b2ec9059c36ce969a6981d4146b24b",
                        "name": "가속화"
                    },
                    {
                        "level": 4,
                        "id": "4f666ed126fdf3bdf7e62ac9f368faca",
                        "name": "사격술"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "d622a7263acd6cc6d47ff5fbfa58c5cf",
                    "itemName": "S 행복한 상상",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "d06c8156ccc0872b31deeba53cfbc8b9",
                    "itemName": "S 미유미유",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "f80014a070aacaf0d97cf705d86ef242",
                    "itemName": "E 러블리 드리머",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "afa4325daefef60c3a28155ff60166b7",
                    "itemName": "S 심술맞은 고양이",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "eb49c4f34b4f438cdc58eb5faf4e4c6c",
                    "itemName": "E 땡글땡글",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "5cc245aeef324d3386f646fe0860e71d",
                    "itemName": "S 사박사박 발걸음",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "6256772c2a023cf7e94dbbc64aab18c1",
                    "itemName": "깜짝 쥬빌레",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "fae7bb227ec29c12abddb39f564b7093",
                    "itemName": "씽씽 장난감",
                    "slotCode": "201",
                    "slotName": "장신구ALL",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "efbade7a22879d8f83868717c1f2e25f",
                    "itemName": "체스터 더블버거",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "7cecb536b15b90c328499de4ab6f7d9e",
                    "itemName": "페스티네이션",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "c8b588eac395b1cc80279e78b8c80b13",
                    "itemName": "파이크 이펙션",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "a5829b6da66c7bb983e58fc5cc207f30",
                    "itemName": "솔리드 스위퍼",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "b40b137e443eb619ab9f4f76da03d265",
                    "itemName": "별똥별 맥시머",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "e5e4362afa73c28cddfdf746ec109a50",
                    "itemName": "S 콩닥콩닥 마음",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "dbc56e1e702d1d0f0f725de3fdc01823",
                    "itemName": "반짝 쥬빌레",
                    "slotCode": "204",
                    "slotName": "장신구3",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "919afc46602fe2ce9ef57728d261cbcc",
                    "itemName": "신나는 폭죽상자",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        },
        {
            "playerId": "6cefd729d8c756d5f47b4d67f47177ba",
            "nickname": "함정의신",
            "map": {
                "mapId": "101",
                "name": "리버포드"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 2,
                "partyId": "6f79121020f906785ddaaf6fa5abb14f",
                "playTypeName": "정상",
                "characterId": "affdeb9a1b0f7185a36db81270ce8c70",
                "characterName": "벨져",
                "level": 39,
                "killCount": 0,
                "deathCount": 6,
                "assistCount": 13,
                "attackPoint": 20319,
                "damagePoint": 42684,
                "battlePoint": 236,
                "sightPoint": 335,
                "towerAttackPoint": 4676,
                "backAttackCount": 18,
                "comboCount": 50,
                "spellCount": 0,
                "healAmount": 0,
                "sentinelKillCount": 10,
                "demolisherKillCount": 1,
                "trooperKillCount": 0,
                "guardianKillCount": 0,
                "guardTowerKillCount": 0,
                "getCoin": 11170,
                "spendCoin": 11050,
                "spendConsumablesCoin": 2200,
                "playTime": 930,
                "responseTime": 121,
                "minLifeTime": 34,
                "maxLifeTime": 268
            },
            "position": {
                "name": "탱커",
                "explain": "체력 +7%, 회피 +5%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "41bfd92f66759e4cfddf82a620eea7e0",
                        "name": "전투 태세"
                    },
                    {
                        "level": 2,
                        "id": "309cb18ddba5e26b81c47ad7d792124a",
                        "name": "재빠른 대응"
                    },
                    {
                        "level": 3,
                        "id": "16b2ec9059c36ce969a6981d4146b24b",
                        "name": "가속화"
                    },
                    {
                        "level": 4,
                        "id": "678bca255e575ae96aceefacaa7aee4e",
                        "name": "최후의 저항"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "c4356adb027a26266155e94044d580cc",
                    "itemName": "S 쉬레 슈나이더",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "da3678417a7ddf6bd25797ed9abc3449",
                    "itemName": "오치드 크로우",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "f7dfd483168c411b45cec9260de569de",
                    "itemName": "E 예니체리",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "38a558de1f04ec843509a74e4d5de959",
                    "itemName": "S 에보니 샤르페",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "1fe3618233c864ef3cdad6884ebee69a",
                    "itemName": "E 님블 사브르",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "9af5bb0c31bbe31d50446dca1bcd6b27",
                    "itemName": "E 크레시에 슈트름",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "3faa45026e0600cac289cbb65b42d702",
                    "itemName": "제야 레그람",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "ffc9ab69ecc05acf67d18a1a18fe31d1",
                    "itemName": "섬광 루벨라이트",
                    "slotCode": "203",
                    "slotName": "장신구2",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "c2a7138967e2aa8567a3014fcf0bbb4e",
                    "itemName": "프라우드 스파클링",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "5b9a8108b0b92457abc225c565fde466",
                    "itemName": "리세스 스프린터",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "1b952ae0e33007ff6e44dc29914ea1a3",
                    "itemName": "프라우드 파이크",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "a5829b6da66c7bb983e58fc5cc207f30",
                    "itemName": "솔리드 스위퍼",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "8be7e6254b58ecbf2a13e81931a7435f",
                    "itemName": "인사이트 엔진T7 ",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "102",
                    "rarityName": "언커먼",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "a6bf4c75a6b0b31841acf92ebef7210f",
                    "itemName": "S 딥 프라우드 SU",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "b3a355dcb2ec1f699fcd05291bce4e8d",
                    "itemName": "격류 레그람",
                    "slotCode": "204",
                    "slotName": "장신구3",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "8e3f6b6340abd4e02a92f27b5e025b37",
                    "itemName": "쉬베르트 트레네 SU",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        },
        {
            "playerId": "e99e0ccd8265006fa23295dec8142e17",
            "nickname": "악당공룡",
            "map": {
                "mapId": "101",
                "name": "리버포드"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 0,
                "partyId": "b762303013093c43599c55f64fdcff53",
                "playTypeName": "정상",
                "characterId": "a4636e5b1ac646c6f320b53004a34e29",
                "characterName": "히카르도",
                "level": 58,
                "killCount": 12,
                "deathCount": 2,
                "assistCount": 12,
                "attackPoint": 57902,
                "damagePoint": 8566,
                "battlePoint": 175,
                "sightPoint": 222,
                "towerAttackPoint": 12347,
                "backAttackCount": 33,
                "comboCount": 91,
                "spellCount": 0,
                "healAmount": 0,
                "sentinelKillCount": 34,
                "demolisherKillCount": 20,
                "trooperKillCount": 2,
                "guardianKillCount": 0,
                "guardTowerKillCount": 0,
                "getCoin": 18590,
                "spendCoin": 18400,
                "spendConsumablesCoin": 3500,
                "playTime": 930,
                "responseTime": 38,
                "minLifeTime": 125,
                "maxLifeTime": 630
            },
            "position": {
                "name": "근거리딜러",
                "explain": "치명타 피해량 +12%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "984e475dde2591d36151e8ca1744cfd9",
                        "name": "급소 가격"
                    },
                    {
                        "level": 2,
                        "id": "16b2ec9059c36ce969a6981d4146b24b",
                        "name": "가속화"
                    },
                    {
                        "level": 3,
                        "id": "309cb18ddba5e26b81c47ad7d792124a",
                        "name": "재빠른 대응"
                    },
                    {
                        "level": 4,
                        "id": "d10f92492701526d64b18428ec8ce0d3",
                        "name": "거인 사냥꾼"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "19cd2c72a57d712db9b98ff090933708",
                    "itemName": "E 복수의 인장",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "52beeb5b67307a30ba59fd24ae49f9e8",
                    "itemName": "E 크래쉬 벤데타",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "62f8efc24f2533e909f89d44a18e5ae9",
                    "itemName": "E 절제된 분노",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "76200a91171bcbd919884425e43969cd",
                    "itemName": "S 트리아토마",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "0fdbadb229dfb109931df036874f3e49",
                    "itemName": "E 앤셔스 위시",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "accc7e91fe04b07f097a59afb7a7397d",
                    "itemName": "S 크루얼 스탬프",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "a2134d372f74d2ca5007d6e08ad1c715",
                    "itemName": "힐킥 알렉토",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "69d187919354312f96f6a9a73cb249ea",
                    "itemName": "스탬핑 그라넛 T",
                    "slotCode": "201",
                    "slotName": "장신구ALL",
                    "rarityCode": "102",
                    "rarityName": "언커먼",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "6c122bff7e815a81c38f7279f776119b",
                    "itemName": "체스터 더블버거",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "b21319f9d965bc9d0348353d26504b96",
                    "itemName": "인섹트 스프린터",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "b37373156f360fb1d0805bd0d846b0b9",
                    "itemName": "이펙트 이펙션",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "a5829b6da66c7bb983e58fc5cc207f30",
                    "itemName": "솔리드 스위퍼",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "c1cdb62a4c114f41b159349acd9b22b4",
                    "itemName": "힐킥 임팩트",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "102",
                    "rarityName": "언커먼",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "36385dd58dc56610052aa74e5f38530c",
                    "itemName": "E 벤젼스 임프린트",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "c086b140193b5ba824b98f1415bee958",
                    "itemName": "벌레 알렉토",
                    "slotCode": "204",
                    "slotName": "장신구3",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "756236946640a43f46546295af3726b0",
                    "itemName": "블러디 플레쥬",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        },
        {
            "playerId": "1eba9e6fe1cec7af179906f5e7041f60",
            "nickname": "햄찌와함께춤을",
            "map": {
                "mapId": "101",
                "name": "리버포드"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 0,
                "partyId": "b762303013093c43599c55f64fdcff53",
                "playTypeName": "정상",
                "characterId": "3dab248071530f76ea748d54c188b48b",
                "characterName": "바스티안",
                "level": 59,
                "killCount": 12,
                "deathCount": 2,
                "assistCount": 12,
                "attackPoint": 39858,
                "damagePoint": 9088,
                "battlePoint": 163,
                "sightPoint": 189,
                "towerAttackPoint": 42084,
                "backAttackCount": 41,
                "comboCount": 134,
                "spellCount": 0,
                "healAmount": 0,
                "sentinelKillCount": 22,
                "demolisherKillCount": 37,
                "trooperKillCount": 1,
                "guardianKillCount": 0,
                "guardTowerKillCount": 0,
                "getCoin": 19010,
                "spendCoin": 18300,
                "spendConsumablesCoin": 3000,
                "playTime": 930,
                "responseTime": 38,
                "minLifeTime": 63,
                "maxLifeTime": 631
            },
            "position": {
                "name": "원거리딜러",
                "explain": "치명타 피해량 +12%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "e29cbec17de6ae981984c6d279400483",
                        "name": "완벽주의자"
                    },
                    {
                        "level": 2,
                        "id": "3db41122c3584a1e385f1a83d8d062c0",
                        "name": "임기응변"
                    },
                    {
                        "level": 3,
                        "id": "16b2ec9059c36ce969a6981d4146b24b",
                        "name": "가속화"
                    },
                    {
                        "level": 4,
                        "id": "abd29ed2134647107bdf5bfaa424a494",
                        "name": "전장의 열기"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "f6c21079c10c70450854151f423a58f9",
                    "itemName": "S 상승욕구",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "aef3a88f00b5709288a8560163debe28",
                    "itemName": "E 듀얼 내셔널리티",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "9d402134602af2108ba2a247f1b51e48",
                    "itemName": "E 어브덕터",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "24cbb6ac0a3520d99c08e5894b74a706",
                    "itemName": "E 샤프 텅",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "22ff2cb1ec80a441aa9c02bfd225c813",
                    "itemName": "E 불리보이",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "6122fc43409053b4731a2972ded276c4",
                    "itemName": "S 절망의 수렁",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "5f2d673ba05b89af5df89182e563ed1f",
                    "itemName": "스웨지 후스테츠카",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "e6b97549e390ed979e1c1b85e6faf952",
                    "itemName": "스닉 텍스타일",
                    "slotCode": "203",
                    "slotName": "장신구2",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "86cb43bfcca1fd11d617736a9c2706b4",
                    "itemName": "체스터 더블버거",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "7cecb536b15b90c328499de4ab6f7d9e",
                    "itemName": "페스티네이션",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "b37373156f360fb1d0805bd0d846b0b9",
                    "itemName": "이펙트 이펙션",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "a5829b6da66c7bb983e58fc5cc207f30",
                    "itemName": "솔리드 스위퍼",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "1e618beed78c69803e9a3e32db5292ae",
                    "itemName": "스닉 임팩트",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "102",
                    "rarityName": "언커먼",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "9ab378d1f5bb15e3a6f69ea6a8acb5ad",
                    "itemName": "S 리드 뉴 에이지",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "1c7d13e6c68b8893cd9daaac067abe1e",
                    "itemName": "리퀴드 텍스타일",
                    "slotCode": "204",
                    "slotName": "장신구3",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "4a71ef88933786f30af841eaedcbd75c",
                    "itemName": "파괴적 망상",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        },
        {
            "playerId": "34ca8555083772f37d888dde2b87d8cc",
            "nickname": "푸삡뺩",
            "map": {
                "mapId": "101",
                "name": "리버포드"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 0,
                "partyId": "b762303013093c43599c55f64fdcff53",
                "playTypeName": "정상",
                "characterId": "a121f236ecffb4508dd208608c3fe2a5",
                "characterName": "리사",
                "level": 25,
                "killCount": 0,
                "deathCount": 4,
                "assistCount": 14,
                "attackPoint": 12028,
                "damagePoint": 29340,
                "battlePoint": 191,
                "sightPoint": 316,
                "towerAttackPoint": 5250,
                "backAttackCount": 27,
                "comboCount": 45,
                "spellCount": 6,
                "healAmount": 10143,
                "sentinelKillCount": 5,
                "demolisherKillCount": 2,
                "trooperKillCount": 0,
                "guardianKillCount": 0,
                "guardTowerKillCount": 0,
                "getCoin": 9390,
                "spendCoin": 8575,
                "spendConsumablesCoin": 2800,
                "playTime": 930,
                "responseTime": 116,
                "minLifeTime": 48,
                "maxLifeTime": 523
            },
            "position": {
                "name": "서포터",
                "explain": "주변 아군의 스킬 공격력 +3%, 방어력 +4%, 회피 +4%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "100b40cb5e22f5613492234dcba705c6",
                        "name": "활성화 지원"
                    },
                    {
                        "level": 2,
                        "id": "d80ac19ac1572686e3a033c84dfb91ee",
                        "name": "치유 증폭기"
                    },
                    {
                        "level": 3,
                        "id": "28bcd65c129d0c93789c321e0a183bd8",
                        "name": "호위"
                    },
                    {
                        "level": 4,
                        "id": "bde4b55ab109f1f725ad0ae81be0a94a",
                        "name": "보호 방벽"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "667e6be5dfc85897659f60aa3864246b",
                    "itemName": "E 순백의 하모니",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "9cf0fa56473ed5f770a8226a1ca489bc",
                    "itemName": "E 러브 앤 너버스",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "0c158cb10f9dd9b2c740eb69cc7e83e4",
                    "itemName": "S 엔젤 심포니",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "14c934a14eb9ed57743f171fd420f6a9",
                    "itemName": "S 절망 속 빛줄기",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "c87f8b8f034324ee9a5765cf552475ae",
                    "itemName": "E 마음의 벽",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "4669d74439a8025aebf952067c1ebafe",
                    "itemName": "E 소리없는 비명",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "b08253261d9ee6fbe98d9583a8adf8fe",
                    "itemName": "칸타빌레 비트",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "44ff36cf4fddec5d939f6c98c35390e2",
                    "itemName": "단절 모렌도",
                    "slotCode": "203",
                    "slotName": "장신구2",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "4c40dc5711d0cf3b568c758e8dd1035b",
                    "itemName": "첼시 콜라 MAX",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "2a553efa707b8adcdbf3bcf22d474899",
                    "itemName": "아리아 페스티나",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "11009f6766a65a4648c9de8467451253",
                    "itemName": "아리아 이펙트",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "a5829b6da66c7bb983e58fc5cc207f30",
                    "itemName": "솔리드 스위퍼",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "428ef7ff9f1f44007795c840e0faa0e8",
                    "itemName": "단절의 임팩트",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "102",
                    "rarityName": "언커먼",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "4e10d755d03e67fe16cbf9efd4d069e0",
                    "itemName": "E 독백의 녹턴",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "480fec56f8c53adde2141b5689d34a2f",
                    "itemName": "천상의 시트",
                    "slotCode": "204",
                    "slotName": "장신구3",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "a880bfd0a0b9368e141f14310ad6990f",
                    "itemName": "믿음의 트윈링",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        },
        {
            "playerId": "e35785b6d08bec3d3b5edeca958dd4ed",
            "nickname": "뀨비레인",
            "map": {
                "mapId": "101",
                "name": "리버포드"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 0,
                "partyId": "b762303013093c43599c55f64fdcff53",
                "playTypeName": "정상",
                "characterId": "d6b4e72d01c4b5551b179e8e623b3365",
                "characterName": "리첼",
                "level": 29,
                "killCount": 0,
                "deathCount": 6,
                "assistCount": 5,
                "attackPoint": 9036,
                "damagePoint": 53009,
                "battlePoint": 225,
                "sightPoint": 347,
                "towerAttackPoint": 1642,
                "backAttackCount": 22,
                "comboCount": 33,
                "spellCount": 0,
                "healAmount": 0,
                "sentinelKillCount": 13,
                "demolisherKillCount": 2,
                "trooperKillCount": 0,
                "guardianKillCount": 0,
                "guardTowerKillCount": 0,
                "getCoin": 8870,
                "spendCoin": 8600,
                "spendConsumablesCoin": 2400,
                "playTime": 930,
                "responseTime": 124,
                "minLifeTime": 72,
                "maxLifeTime": 209
            },
            "position": {
                "name": "탱커",
                "explain": "체력 +7%, 회피 +5%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "a681dbe9ad002a1ebe7f9c9229de9c7d",
                        "name": "전선 유지"
                    },
                    {
                        "level": 2,
                        "id": "809f6fa4aced8ec003b40f2cf09f9f12",
                        "name": "고독한 늑대"
                    },
                    {
                        "level": 3,
                        "id": "bd9cbd5e0ae14ea1b1870265818fb358",
                        "name": "단단한 피부"
                    },
                    {
                        "level": 4,
                        "id": "6d8fb905d69edf1c9f73495c3ee44d28",
                        "name": "선봉장"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "af611370274ce52493288c1d1dc3461c",
                    "itemName": "E 터쳐블 웨이브",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "d5fbb1f1a388a1869d6e40ea755d4998",
                    "itemName": "E 러브 앤 헤이트",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "1e0c937c02072cc787d81ea6704808dc",
                    "itemName": "E 히든 하이라이트",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "3bf21729183c648ca283aeb521f5f2c3",
                    "itemName": "E 그란디오소",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "a121a105c7207cf2af44704175045ed1",
                    "itemName": "E 다이나믹 딥퍼플",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "cd3101233a026ccaa8d22b77f515973c",
                    "itemName": "S 블랙캣 스텝",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "d01ba2d0ee26b7d6514657ba0a5584e2",
                    "itemName": "블래스트 레그람",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "b2b6f638462bdd9b7e5a6be747ade784",
                    "itemName": "밀키웨이 에코",
                    "slotCode": "201",
                    "slotName": "장신구ALL",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "d531334fdaa22951c7ddb74107d743f7",
                    "itemName": "뮤지션 스파클링 ",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "96142e000a1352277ed947ea6d5c201e",
                    "itemName": "뮤지션 엑셀",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "329b794ef24d421711a5d564d5d69092",
                    "itemName": "뮤지션 파이크 ",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "03575e34ed788493832047784089bf0d",
                    "itemName": "뮤지션 타즈 ",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "a6abfd4505fb46cde75dc5b4414b60b8",
                    "itemName": "PS 레이더 R4",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "102",
                    "rarityName": "언커먼",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "1abfc7a9f62a9f97df662b8fe8ed9eca",
                    "itemName": "이기적인 마음",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "65303c3f5e1c3dcb3766ef004fd7938e",
                    "itemName": "바이올렛 레그람",
                    "slotCode": "204",
                    "slotName": "장신구3",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "4da93bfeaf36e196222cf43a4e27d3f0",
                    "itemName": "약속의 트윈링",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        },
        {
            "playerId": "a357c918b695e1a85d212a1c2f32de25",
            "nickname": "한근두근동근",
            "map": {
                "mapId": "101",
                "name": "리버포드"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 0,
                "partyId": "b762303013093c43599c55f64fdcff53",
                "playTypeName": "정상",
                "characterId": "d69971a6762d94340bb2332e8735238a",
                "characterName": "휴톤",
                "level": 31,
                "killCount": 2,
                "deathCount": 3,
                "assistCount": 14,
                "attackPoint": 17331,
                "damagePoint": 46465,
                "battlePoint": 299,
                "sightPoint": 398,
                "towerAttackPoint": 2226,
                "backAttackCount": 35,
                "comboCount": 23,
                "spellCount": 0,
                "healAmount": 0,
                "sentinelKillCount": 14,
                "demolisherKillCount": 3,
                "trooperKillCount": 0,
                "guardianKillCount": 0,
                "guardTowerKillCount": 0,
                "getCoin": 11390,
                "spendCoin": 10300,
                "spendConsumablesCoin": 3200,
                "playTime": 930,
                "responseTime": 61,
                "minLifeTime": 81,
                "maxLifeTime": 319
            },
            "position": {
                "name": "탱커",
                "explain": "체력 +7%, 회피 +5%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "a681dbe9ad002a1ebe7f9c9229de9c7d",
                        "name": "전선 유지"
                    },
                    {
                        "level": 2,
                        "id": "809f6fa4aced8ec003b40f2cf09f9f12",
                        "name": "고독한 늑대"
                    },
                    {
                        "level": 3,
                        "id": "28bcd65c129d0c93789c321e0a183bd8",
                        "name": "호위"
                    },
                    {
                        "level": 4,
                        "id": "6d8fb905d69edf1c9f73495c3ee44d28",
                        "name": "선봉장"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "b71c039a8130f54b3fb90e89fde86e59",
                    "itemName": "S 블래스터 비트 ",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "bca1cd01665d99ae61564a951364cd6c",
                    "itemName": "E 해일매리 패스",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "a6e41b7439db21cd3242123b343e0df0",
                    "itemName": "E 터스킨 ",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "0f2055a436544b8755c05140da52c5f7",
                    "itemName": "E 데모닉 펀쳐",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "92f61a077d61e958e843a4c7039fee5c",
                    "itemName": "E 스톤 크래셔",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "6f7e4483f9be24b7cd93f28b85d48012",
                    "itemName": "E 아이언 룰러",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "a33d3a1756cfff57da67dff0f3c1dd02",
                    "itemName": "지옥구멍 레그람",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "2904a0d85eaab19d5cb8efba3c102c49",
                    "itemName": "바야바 레그람",
                    "slotCode": "203",
                    "slotName": "장신구2",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "c5565d156f31bf774d708cab04d2da1e",
                    "itemName": "본 스파클링 ",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "5b9a8108b0b92457abc225c565fde466",
                    "itemName": "리세스 스프린터",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "b37373156f360fb1d0805bd0d846b0b9",
                    "itemName": "이펙트 이펙션",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "a5829b6da66c7bb983e58fc5cc207f30",
                    "itemName": "솔리드 스위퍼",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "8be7e6254b58ecbf2a13e81931a7435f",
                    "itemName": "인사이트 엔진T7 ",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "102",
                    "rarityName": "언커먼",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "a6de0dcbc476a27521a0a07bd8c69934",
                    "itemName": "E 브레이킹 스매쉬 SU",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "a27ddf742bb7ae7e97e7755beda50480",
                    "itemName": "서든어퍼 바쿠스",
                    "slotCode": "204",
                    "slotName": "장신구3",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "a1b7ae5888afbbb818f2db2bd35a9d8c",
                    "itemName": "누크 퓨리피스트 SU",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        },
        {
            "playerId": "aca779a9a6f580a70a655e8f60e48b5a",
            "nickname": "여포의꿈",
            "map": {
                "mapId": "101",
                "name": "리버포드"
            },
            "playInfo": {
                "random": false,
                "partyUserCount": 0,
                "partyId": "b762303013093c43599c55f64fdcff53",
                "playTypeName": "정상",
                "characterId": "627db8b10d95ba73f0d2765130430454",
                "characterName": "케니스",
                "level": 47,
                "killCount": 11,
                "deathCount": 6,
                "assistCount": 4,
                "attackPoint": 41301,
                "damagePoint": 25249,
                "battlePoint": 130,
                "sightPoint": 218,
                "towerAttackPoint": 25069,
                "backAttackCount": 19,
                "comboCount": 62,
                "spellCount": 0,
                "healAmount": 0,
                "sentinelKillCount": 21,
                "demolisherKillCount": 28,
                "trooperKillCount": 1,
                "guardianKillCount": 0,
                "guardTowerKillCount": 0,
                "getCoin": 14890,
                "spendCoin": 14795,
                "spendConsumablesCoin": 2820,
                "playTime": 930,
                "responseTime": 155,
                "minLifeTime": 51,
                "maxLifeTime": 252
            },
            "position": {
                "name": "근거리딜러",
                "explain": "치명타 피해량 +12%",
                "attribute": [
                    {
                        "level": 1,
                        "id": "984e475dde2591d36151e8ca1744cfd9",
                        "name": "급소 가격"
                    },
                    {
                        "level": 2,
                        "id": "43c56f15f90192f7ead0a8eba794fbed",
                        "name": "전장의 학살자"
                    },
                    {
                        "level": 3,
                        "id": "2ee2eeb641442593cc234332b0809202",
                        "name": "할인 판매"
                    },
                    {
                        "level": 4,
                        "id": "47b288f44ffb19009e9d2adc73c62472",
                        "name": "최후의 일격"
                    }
                ]
            },
            "items": [
                {
                    "itemId": "cd5c79d2b1354915051e8a4c6ac1ed32",
                    "itemName": "E 격변의 시대",
                    "slotCode": "101",
                    "slotName": "손(공격)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "101",
                    "equipSlotName": "손(공격)"
                },
                {
                    "itemId": "f15d68a2f5b06700928e49569507f7e8",
                    "itemName": "E 완벽한 후계자",
                    "slotCode": "102",
                    "slotName": "머리(치명)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "102",
                    "equipSlotName": "머리(치명)"
                },
                {
                    "itemId": "e56c62c87fbc14e8cffcdf4aa9c8c404",
                    "itemName": "S 비질란테",
                    "slotCode": "103",
                    "slotName": "가슴(체력)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "103",
                    "equipSlotName": "가슴(체력)"
                },
                {
                    "itemId": "45d6f634efe3381650e1a94f6bae00b6",
                    "itemName": "S 이상적인 리더",
                    "slotCode": "104",
                    "slotName": "허리(회피)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "104",
                    "equipSlotName": "허리(회피)"
                },
                {
                    "itemId": "6f3daac4238421130ad15fe3ceb399aa",
                    "itemName": "E 꿈꾸는 자",
                    "slotCode": "105",
                    "slotName": "다리(방어)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "105",
                    "equipSlotName": "다리(방어)"
                },
                {
                    "itemId": "0ce9097f42ccb8473159229bf854e51d",
                    "itemName": "E 인헤리터",
                    "slotCode": "106",
                    "slotName": "발(이동)",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "106",
                    "equipSlotName": "발(이동)"
                },
                {
                    "itemId": "9f1af9cf56d2974aa3a66c2a565df9cc",
                    "itemName": "스파우트 네임카드",
                    "slotCode": "202",
                    "slotName": "장신구1",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "202",
                    "equipSlotName": "장신구1"
                },
                {
                    "itemId": "3050f6c05c5e11b1fd4d466801fab1c4",
                    "itemName": "SB피크 루차",
                    "slotCode": "203",
                    "slotName": "장신구2",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "203",
                    "equipSlotName": "장신구2"
                },
                {
                    "itemId": "fcde04211af924aaaedb989cedc487e2",
                    "itemName": "체인지 스파클링",
                    "slotCode": "301",
                    "slotName": "회복킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "301",
                    "equipSlotName": "회복킷"
                },
                {
                    "itemId": "5b9a8108b0b92457abc225c565fde466",
                    "itemName": "리세스 스프린터",
                    "slotCode": "302",
                    "slotName": "가속킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "302",
                    "equipSlotName": "가속킷"
                },
                {
                    "itemId": "b37373156f360fb1d0805bd0d846b0b9",
                    "itemName": "이펙트 이펙션",
                    "slotCode": "303",
                    "slotName": "공격킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "303",
                    "equipSlotName": "공격킷"
                },
                {
                    "itemId": "a5829b6da66c7bb983e58fc5cc207f30",
                    "itemName": "솔리드 스위퍼",
                    "slotCode": "304",
                    "slotName": "방어킷",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "304",
                    "equipSlotName": "방어킷"
                },
                {
                    "itemId": "8fd116487d9d0a1d5919ec2a1302367d",
                    "itemName": "래피드 임팩트",
                    "slotCode": "305",
                    "slotName": "특수킷",
                    "rarityCode": "102",
                    "rarityName": "언커먼",
                    "equipSlotCode": "305",
                    "equipSlotName": "특수킷"
                },
                {
                    "itemId": "4e9292d758fb9ea4db16010cedd45b55",
                    "itemName": "E 소울즈 앵커",
                    "slotCode": "107",
                    "slotName": "목",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "107",
                    "equipSlotName": "목"
                },
                {
                    "itemId": "60acc8bc9d41dcb67cd2c232d2b0fee8",
                    "itemName": "래피드 네임카드",
                    "slotCode": "204",
                    "slotName": "장신구3",
                    "rarityCode": "103",
                    "rarityName": "레어",
                    "equipSlotCode": "204",
                    "equipSlotName": "장신구3"
                },
                {
                    "itemId": "51d60ee69d4e6f52635d4d9353e69d69",
                    "itemName": "자유의 갈망",
                    "slotCode": "205",
                    "slotName": "장신구4",
                    "rarityCode": "104",
                    "rarityName": "유니크",
                    "equipSlotCode": "205",
                    "equipSlotName": "장신구4"
                }
            ]
        }
    ]
}

];