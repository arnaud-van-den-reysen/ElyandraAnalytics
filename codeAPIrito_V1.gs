function mainFunction() {
  var api_key = "RGAPI-abfcd0ee-5896-4de9-a43f-b27728ed9bbd"; //reset toutes les 24H !!!!!!!
  
  var sheetTOP = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("top");
  var sheetJGL = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("jgl");
  var sheetMID = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("mid");
  var sheetADC = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("adc");
  var sheetSUP = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("sup");
  
  var pseudoTOP = "eYa Whip";
  var pseudoJGL = "eYa Stormax";
  var pseudoMID = "eYa Pacou";
  var pseudoADC = "eYa Hydrale";
  var pseudoSUP = "eYa Hazen";
  
  var champions = getChampions();
  
  //gestionPseudoEtPage(champions,api_key,sheetTOP,pseudoTOP);
  //gestionPseudoEtPage(champions,api_key,sheetJGL,pseudoJGL);
  gestionPseudoEtPage(champions,api_key,sheetMID,pseudoMID);
  //gestionPseudoEtPage(champions,api_key,sheetADC,pseudoADC);
  //gestionPseudoEtPage(champions,api_key,sheetSUP,pseudoSUP);
}

function gestionPseudoEtPage(champions,api_key,sheet,pseudo) {
  try {
    var data = getSummonersByName(pseudo,api_key);
    var matchListData = getMatchsList(data.accountId,api_key);
    for (var i = 0; i<97/*matchListData['matches'].length*/; i++) {
      var matchData = getMatchData(pseudo,matchListData['matches'][i].gameId,api_key,champions);
      writeSheet(sheet,data,matchListData['matches'][i].gameId,matchData);
    }
  } catch(e) {
    Logger.log(e);
  }
}

function writeSheet(sheet,data,matchListData,matchData) {
  try {
    //console.log([matchData[5]]);
    sheet.appendRow([data.name,data.accountId,matchListData,matchData[0],matchData[1],matchData[2],matchData[3],matchData[4],matchData[5][0],matchData[5][1],matchData[6],matchData[7],matchData[8],matchData[9],matchData[5][2]]);
  } catch(e) {
    Logger.log(e);
  }
}

function workTimelineData(data,playerID,playerIDOpp) {
  var textWardPlaced = "";
  for(var i = 0; i<data['frames'].length; i++) {
    try {
      var nbWardPlaceMinute = 0;
      for(var j = 0; j<=data['frames'][i].events.length; j++) {
        if("WARD_PLACED" == data['frames'][i].events[j].type) {  
          if(playerID == data['frames'][i].events[j].creatorId) {
            if(data['frames'][i].events[j].type == "WARD_PLACED") {
              nbWardPlaceMinute = nbWardPlaceMinute + 1;
            }
          }
        }
      }
    } catch(e) {
      Logger.log(e);
    }
    if(nbWardPlaceMinute != 0) {
      textWardPlaced = textWardPlaced + "M" + i + "=WP" + nbWardPlaceMinute + " - ";
    }
    
    if(i == 10) {
      for(var j = 1; j<=10; j++) {
        if(playerID == data['frames'][i].participantFrames[j].participantId) {
          var totalGold = data['frames'][i].participantFrames[j].totalGold;
        }
        if(playerIDOpp == data['frames'][i].participantFrames[j].participantId) {
          var totalGoldOpp = data['frames'][i].participantFrames[j].totalGold;
        }
      }
    }
    if(i == 20) {
      for(var j = 1; j<=10; j++) {
        if(playerID == data['frames'][i].participantFrames[j].participantId) {
          var totalGold20 = data['frames'][i].participantFrames[j].totalGold;
        }
        if(playerIDOpp == data['frames'][i].participantFrames[j].participantId) {
          var totalGold20Opp = data['frames'][i].participantFrames[j].totalGold;
        }
      }
    }
    if(i == data['frames'].length-1) console.log(i);
  }
  if(totalGold != 0 || totalGoldOpp != 0) {
    var diffGold10_20 = (totalGold20 - totalGold) - (totalGold20Opp - totalGoldOpp);
  } else {
    var diffGold10_20 = totalGold20 - totalGold20Opp;
  }
  var diffGold00_10 = totalGold - totalGoldOpp;
  
  var data = [diffGold00_10,diffGold10_20,textWardPlaced];
  
  return data;
}

//inutile pour le moment
function getPlayerPost(pseudo,matchData) {
  for (var i = 0; i<matchData['participants'].length; i++) {
    if(matchData['participants'][i].participantId == playerID) {
      var lane = matchData['participants'][i].timeline.lane;
      var role = matchData['participants'][i].timeline.role;
    }
  }
  
  if(lane == "BOTTOM" && role == "DUO_CARRY") {
   var playerPoste = "ADC";
  } else if(lane == "BOTTOM" && role == "DUO_SUPPORT") {
    var playerPoste = "SUP";
  } else if(lane == "TOP" && role == "SOLO") {
    var playerPoste = "TOP"; 
  } else if(lane == "MIDDLE" && role == "SOLO") {
    var playerPoste = "MID";
  } else if(lane == "JUNGLE" && role == "NONE") {
    var playerPoste = "JGL";
  }
  
  return playerPoste;
}

function colorTeam(teamId) {
  if(teamId == 100) {
    return "BLUE";
  } else {
    return "RED";
  }
}

function workMatchData(pseudo,matchData,champions,matchId,api_key) {
  try {
    for (var i = 0; i<matchData['participantIdentities'].length; i++) {
      if(matchData['participantIdentities'][i]['player'].summonerName == pseudo) {
        var playerID = matchData['participantIdentities'][i].participantId;
      }
    }
    
    for (var i = 0; i<matchData['participantIdentities'].length; i++) {
      if(matchData['participants'][i].participantId == playerID) {
        var teamPlayer = colorTeam(matchData['participants'][i].teamId);
        var winner = matchData['participants'][i]['stats'].win;
      }
    }
    
    for (var i = 0; i<matchData['participants'].length; i++) {
      if(matchData['participants'][i].participantId == playerID) {
        var lane = matchData['participants'][i].timeline.lane;
        var championPick = getChampionName(champions,matchData['participants'][i].championId);
        var visionScore = matchData['participants'][i].stats.visionScore;
        var wardsKilled = matchData['participants'][i].stats.wardsKilled;
        var visionWardsBoughtInGame = matchData['participants'][i].stats.visionWardsBoughtInGame;
        var wardsPlaced = matchData['participants'][i].stats.wardsPlaced;
      }
    }
    
    //Cherche champion adversaire direct
     for (var i = 0; i<matchData['participants'].length; i++) {
      if(matchData['participants'][i].timeline.lane == lane && matchData['participants'][i].participantId != playerID) {
        var playerIDOpp = matchData['participants'][i].participantId;
        var championPickOpp = getChampionName(champions,matchData['participants'][i].championId);
      }
    }
    
    var dataTimeline = getTimeline(playerID,playerIDOpp,matchId,api_key);
    
    var data = [teamPlayer,winner,lane,championPick,championPickOpp,dataTimeline,visionScore,wardsKilled,visionWardsBoughtInGame,wardsPlaced];
  } catch (e) {
    Logger.log(e);
  }
  return data;
}

function getSummonersByName(pseudo,api_key) {
  var url = "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/"+pseudo+"?api_key="+api_key;
  try {
      var cookie = "new_visitor=false; _ga=GA1.2.1031275918.1523789907; ajs_group_id=null; s_fid=084E61FD2F17B1A9-1289DE22C7C4D704; C3UID-694=13974767501535292492; C3UID=13974767501535292492; __qca=P0-1655653013-1549286329912; _tlp=2820:16705877; __cfduid=da3ac128a3b3a4bb9b8a6efd6a9eec2921555402977; _scid=92ea0b26-1de4-472c-b7d4-b545cb5180b9; notice_preferences=2:; notice_gdpr_prefs=0,1,2:; _hjid=91d2d6ca-565f-4a84-b767-d17d36043bc0; rp2=1575806458255-Repeat; ajs_user_id=null; _gcl_au=1.1.1748260163.1576528939; PVPNET_TOKEN_EUW=eyJkYXRlX3RpbWUiOjE1NzY1Mjg5NDk2NjksImdhc19hY2NvdW50X2lkIjozNjE3MTI0MCwicHZwbmV0X2FjY291bnRfaWQiOjM2MTcxMjQwLCJzdW1tb25lcl9uYW1lIjoiYXJuYWh1ZCIsInZvdWNoaW5nX2tleV9pZCI6IjkwMzQ3NTJiMmI0NTYwNDRhZTg3ZjI1OTgyZGFkMDdkIiwic2lnbmF0dXJlIjoicE5RWWVua0IyZEdUZW12N0JIc2xaTEcvQVVZb0VGdkJWaXNOUys5K0JJUk5iVWVrK3NOR2RaZ1hlYmhNald5OTAxU2x5UXZYb0xwYVlnV1d0Vk9sM3NvYmt1dDlteFpjYWJuSk02M0N3RXVWdmw2TlRGWjMwd1d1L2hBSlhSNGxiZlBVa3MwMzZlYzBnazVQNExKVXh2L2paVnh6TkM4Y2RrWjFEeEliOTNjPSJ9; PVPNET_ACCT_EUW=arnahud; PVPNET_ID_EUW=36171240; PVPNET_REGION=euw; PVPNET_LANG=fr_FR; id_token=eyJraWQiOiJzMSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIxOTFiZjkyOC0zMzBhLTU3MjAtYjMzYy1mZTQ5OGNmODdlOTYiLCJjb3VudHJ5IjoiZnJhIiwiYW1yIjpbImNvb2tpZSJdLCJpc3MiOiJodHRwczpcL1wvYXV0aC5yaW90Z2FtZXMuY29tIiwibG9sIjpbeyJjdWlkIjozNjE3MTI0MCwiY3BpZCI6IkVVVzEiLCJ1aWQiOjM2MTcxMjQwLCJ1bmFtZSI6ImFybmF1ZDMwMTIiLCJwdHJpZCI6bnVsbCwicGlkIjoiRVVXMSIsInN0YXRlIjoiRU5BQkxFRCJ9XSwibG9jYWxlIjoiZnJfRlIiLCJhdWQiOiJyc28td2ViLWNsaWVudC1wcm9kIiwiYWNyIjoiMCIsImV4cCI6MTU3NjYxNTM0OCwiaWF0IjoxNTc2NTI4OTQ4LCJhY2N0Ijp7ImdhbWVfbmFtZSI6ImFybmFodWQiLCJ0YWdfbGluZSI6IkVVVyJ9LCJqdGkiOiJkTzExOEVpVGpQRSIsImxvZ2luX2NvdW50cnkiOiJmcmEifQ.GVGM4Ss5cc4lQKXaZnkXYXjbp5F4iSWYd6HPkqCqT4l0va7EF0INbHNLONmOKnS4c9-htLnMCpl1I9LmlexRIM58CodTO7OGz5tqP8kirtJ7KCeqAIbrsvWrDN3jQA5bHyoWiX3IPB3E8C76AOZ5BaAN-AE0sYSy5TpDjHo_hOw; id_hint=sub%3D191bf928-330a-5720-b33c-fe498cf87e96%26lang%3Dfr%26game_name%3Darnahud%26tag_line%3DEUW%26id%3D36171240%26summoner%3Darnahud%26region%3DEUW1%26tag%3Deuw; _tlc=:1576531469:euw.leagueoflegends.com%2Ffr%2F:leagueoflegends.com; _tlv=92.1550590967.1567793215.1576531488.242.1.2; ping_session_id=3adfe217-a333-4dab-996e-3c8a2d1a61c4; _gid=GA1.2.803505458.1577904415; _gat=1";
      var headers = {"cookie": cookie};
      var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true,'headers': headers});
      var json = response.getContentText();
      var data = JSON.parse(json);
    } catch (e) {
      Logger.log(e); // This will catch fetching error, like if the MH link is wrong
    }
  return data;
}

function getMatchsList(AccountId,api_key) {
  var url = "https://euw1.api.riotgames.com/lol/match/v4/matchlists/by-account/"+AccountId+"?queue=420&season=13&api_key="+api_key;
  try {
      var cookie = "new_visitor=false; _ga=GA1.2.1031275918.1523789907; ajs_group_id=null; s_fid=084E61FD2F17B1A9-1289DE22C7C4D704; C3UID-694=13974767501535292492; C3UID=13974767501535292492; __qca=P0-1655653013-1549286329912; _tlp=2820:16705877; __cfduid=da3ac128a3b3a4bb9b8a6efd6a9eec2921555402977; _scid=92ea0b26-1de4-472c-b7d4-b545cb5180b9; notice_preferences=2:; notice_gdpr_prefs=0,1,2:; _hjid=91d2d6ca-565f-4a84-b767-d17d36043bc0; rp2=1575806458255-Repeat; ajs_user_id=null; _gcl_au=1.1.1748260163.1576528939; PVPNET_TOKEN_EUW=eyJkYXRlX3RpbWUiOjE1NzY1Mjg5NDk2NjksImdhc19hY2NvdW50X2lkIjozNjE3MTI0MCwicHZwbmV0X2FjY291bnRfaWQiOjM2MTcxMjQwLCJzdW1tb25lcl9uYW1lIjoiYXJuYWh1ZCIsInZvdWNoaW5nX2tleV9pZCI6IjkwMzQ3NTJiMmI0NTYwNDRhZTg3ZjI1OTgyZGFkMDdkIiwic2lnbmF0dXJlIjoicE5RWWVua0IyZEdUZW12N0JIc2xaTEcvQVVZb0VGdkJWaXNOUys5K0JJUk5iVWVrK3NOR2RaZ1hlYmhNald5OTAxU2x5UXZYb0xwYVlnV1d0Vk9sM3NvYmt1dDlteFpjYWJuSk02M0N3RXVWdmw2TlRGWjMwd1d1L2hBSlhSNGxiZlBVa3MwMzZlYzBnazVQNExKVXh2L2paVnh6TkM4Y2RrWjFEeEliOTNjPSJ9; PVPNET_ACCT_EUW=arnahud; PVPNET_ID_EUW=36171240; PVPNET_REGION=euw; PVPNET_LANG=fr_FR; id_token=eyJraWQiOiJzMSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIxOTFiZjkyOC0zMzBhLTU3MjAtYjMzYy1mZTQ5OGNmODdlOTYiLCJjb3VudHJ5IjoiZnJhIiwiYW1yIjpbImNvb2tpZSJdLCJpc3MiOiJodHRwczpcL1wvYXV0aC5yaW90Z2FtZXMuY29tIiwibG9sIjpbeyJjdWlkIjozNjE3MTI0MCwiY3BpZCI6IkVVVzEiLCJ1aWQiOjM2MTcxMjQwLCJ1bmFtZSI6ImFybmF1ZDMwMTIiLCJwdHJpZCI6bnVsbCwicGlkIjoiRVVXMSIsInN0YXRlIjoiRU5BQkxFRCJ9XSwibG9jYWxlIjoiZnJfRlIiLCJhdWQiOiJyc28td2ViLWNsaWVudC1wcm9kIiwiYWNyIjoiMCIsImV4cCI6MTU3NjYxNTM0OCwiaWF0IjoxNTc2NTI4OTQ4LCJhY2N0Ijp7ImdhbWVfbmFtZSI6ImFybmFodWQiLCJ0YWdfbGluZSI6IkVVVyJ9LCJqdGkiOiJkTzExOEVpVGpQRSIsImxvZ2luX2NvdW50cnkiOiJmcmEifQ.GVGM4Ss5cc4lQKXaZnkXYXjbp5F4iSWYd6HPkqCqT4l0va7EF0INbHNLONmOKnS4c9-htLnMCpl1I9LmlexRIM58CodTO7OGz5tqP8kirtJ7KCeqAIbrsvWrDN3jQA5bHyoWiX3IPB3E8C76AOZ5BaAN-AE0sYSy5TpDjHo_hOw; id_hint=sub%3D191bf928-330a-5720-b33c-fe498cf87e96%26lang%3Dfr%26game_name%3Darnahud%26tag_line%3DEUW%26id%3D36171240%26summoner%3Darnahud%26region%3DEUW1%26tag%3Deuw; _tlc=:1576531469:euw.leagueoflegends.com%2Ffr%2F:leagueoflegends.com; _tlv=92.1550590967.1567793215.1576531488.242.1.2; ping_session_id=3adfe217-a333-4dab-996e-3c8a2d1a61c4; _gid=GA1.2.803505458.1577904415; _gat=1";
      var headers = {"cookie": cookie};
      var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true,'headers': headers});
      var json = response.getContentText();
      var data = JSON.parse(json);
    } catch (e) {
      Logger.log(e); // This will catch fetching error, like if the MH link is wrong
    }
  return data;
}

function getMatchData(pseudo,matchId,api_key,champions) {
  var url = "https://euw1.api.riotgames.com/lol/match/v4/matches/"+matchId+"?api_key="+api_key;
  try {
      var cookie = "new_visitor=false; _ga=GA1.2.1031275918.1523789907; ajs_group_id=null; s_fid=084E61FD2F17B1A9-1289DE22C7C4D704; C3UID-694=13974767501535292492; C3UID=13974767501535292492; __qca=P0-1655653013-1549286329912; _tlp=2820:16705877; __cfduid=da3ac128a3b3a4bb9b8a6efd6a9eec2921555402977; _scid=92ea0b26-1de4-472c-b7d4-b545cb5180b9; notice_preferences=2:; notice_gdpr_prefs=0,1,2:; _hjid=91d2d6ca-565f-4a84-b767-d17d36043bc0; rp2=1575806458255-Repeat; ajs_user_id=null; _gcl_au=1.1.1748260163.1576528939; PVPNET_TOKEN_EUW=eyJkYXRlX3RpbWUiOjE1NzY1Mjg5NDk2NjksImdhc19hY2NvdW50X2lkIjozNjE3MTI0MCwicHZwbmV0X2FjY291bnRfaWQiOjM2MTcxMjQwLCJzdW1tb25lcl9uYW1lIjoiYXJuYWh1ZCIsInZvdWNoaW5nX2tleV9pZCI6IjkwMzQ3NTJiMmI0NTYwNDRhZTg3ZjI1OTgyZGFkMDdkIiwic2lnbmF0dXJlIjoicE5RWWVua0IyZEdUZW12N0JIc2xaTEcvQVVZb0VGdkJWaXNOUys5K0JJUk5iVWVrK3NOR2RaZ1hlYmhNald5OTAxU2x5UXZYb0xwYVlnV1d0Vk9sM3NvYmt1dDlteFpjYWJuSk02M0N3RXVWdmw2TlRGWjMwd1d1L2hBSlhSNGxiZlBVa3MwMzZlYzBnazVQNExKVXh2L2paVnh6TkM4Y2RrWjFEeEliOTNjPSJ9; PVPNET_ACCT_EUW=arnahud; PVPNET_ID_EUW=36171240; PVPNET_REGION=euw; PVPNET_LANG=fr_FR; id_token=eyJraWQiOiJzMSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIxOTFiZjkyOC0zMzBhLTU3MjAtYjMzYy1mZTQ5OGNmODdlOTYiLCJjb3VudHJ5IjoiZnJhIiwiYW1yIjpbImNvb2tpZSJdLCJpc3MiOiJodHRwczpcL1wvYXV0aC5yaW90Z2FtZXMuY29tIiwibG9sIjpbeyJjdWlkIjozNjE3MTI0MCwiY3BpZCI6IkVVVzEiLCJ1aWQiOjM2MTcxMjQwLCJ1bmFtZSI6ImFybmF1ZDMwMTIiLCJwdHJpZCI6bnVsbCwicGlkIjoiRVVXMSIsInN0YXRlIjoiRU5BQkxFRCJ9XSwibG9jYWxlIjoiZnJfRlIiLCJhdWQiOiJyc28td2ViLWNsaWVudC1wcm9kIiwiYWNyIjoiMCIsImV4cCI6MTU3NjYxNTM0OCwiaWF0IjoxNTc2NTI4OTQ4LCJhY2N0Ijp7ImdhbWVfbmFtZSI6ImFybmFodWQiLCJ0YWdfbGluZSI6IkVVVyJ9LCJqdGkiOiJkTzExOEVpVGpQRSIsImxvZ2luX2NvdW50cnkiOiJmcmEifQ.GVGM4Ss5cc4lQKXaZnkXYXjbp5F4iSWYd6HPkqCqT4l0va7EF0INbHNLONmOKnS4c9-htLnMCpl1I9LmlexRIM58CodTO7OGz5tqP8kirtJ7KCeqAIbrsvWrDN3jQA5bHyoWiX3IPB3E8C76AOZ5BaAN-AE0sYSy5TpDjHo_hOw; id_hint=sub%3D191bf928-330a-5720-b33c-fe498cf87e96%26lang%3Dfr%26game_name%3Darnahud%26tag_line%3DEUW%26id%3D36171240%26summoner%3Darnahud%26region%3DEUW1%26tag%3Deuw; _tlc=:1576531469:euw.leagueoflegends.com%2Ffr%2F:leagueoflegends.com; _tlv=92.1550590967.1567793215.1576531488.242.1.2; ping_session_id=3adfe217-a333-4dab-996e-3c8a2d1a61c4; _gid=GA1.2.803505458.1577904415; _gat=1";
      var headers = {"cookie": cookie};
      var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true,'headers': headers});
      var json = response.getContentText();
      var data = JSON.parse(json);
      //Logger.log(data); 
    } catch (e) {
      Logger.log(e); // This will catch fetching error, like if the MH link is wrong
    }
  var moreData = workMatchData(pseudo,data,champions,matchId,api_key);//moreData
  return moreData;
}

function getChampions() {
  var url = 'https://ddragon.leagueoflegends.com/cdn/10.4.1/data/en_GB/champion.json';
  try {
    var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
    var json = response.getContentText();
    return JSON.parse(json);
  } catch (e) { //Error fetching champions
    Logger.log(e);
  }
}

function getChampionName(champions, id) {
  var championName = "Default";
  var championKeys = Object.keys(champions['data']);
  for (var i = 0; i < championKeys.length; i++) {
    if (champions['data'][championKeys[i]]['key'] == id)
      championName = champions['data'][championKeys[i]]['name'];
  }
  return championName;
}

function getTimeline(playerID,playerIDOpp,matchId,api_key) {
  var url = "https://euw1.api.riotgames.com/lol/match/v4/timelines/by-match/"+matchId+"?api_key="+api_key;
  try {
      var cookie = "new_visitor=false; _ga=GA1.2.1031275918.1523789907; ajs_group_id=null; s_fid=084E61FD2F17B1A9-1289DE22C7C4D704; C3UID-694=13974767501535292492; C3UID=13974767501535292492; __qca=P0-1655653013-1549286329912; _tlp=2820:16705877; __cfduid=da3ac128a3b3a4bb9b8a6efd6a9eec2921555402977; _scid=92ea0b26-1de4-472c-b7d4-b545cb5180b9; notice_preferences=2:; notice_gdpr_prefs=0,1,2:; _hjid=91d2d6ca-565f-4a84-b767-d17d36043bc0; rp2=1575806458255-Repeat; ajs_user_id=null; _gcl_au=1.1.1748260163.1576528939; PVPNET_TOKEN_EUW=eyJkYXRlX3RpbWUiOjE1NzY1Mjg5NDk2NjksImdhc19hY2NvdW50X2lkIjozNjE3MTI0MCwicHZwbmV0X2FjY291bnRfaWQiOjM2MTcxMjQwLCJzdW1tb25lcl9uYW1lIjoiYXJuYWh1ZCIsInZvdWNoaW5nX2tleV9pZCI6IjkwMzQ3NTJiMmI0NTYwNDRhZTg3ZjI1OTgyZGFkMDdkIiwic2lnbmF0dXJlIjoicE5RWWVua0IyZEdUZW12N0JIc2xaTEcvQVVZb0VGdkJWaXNOUys5K0JJUk5iVWVrK3NOR2RaZ1hlYmhNald5OTAxU2x5UXZYb0xwYVlnV1d0Vk9sM3NvYmt1dDlteFpjYWJuSk02M0N3RXVWdmw2TlRGWjMwd1d1L2hBSlhSNGxiZlBVa3MwMzZlYzBnazVQNExKVXh2L2paVnh6TkM4Y2RrWjFEeEliOTNjPSJ9; PVPNET_ACCT_EUW=arnahud; PVPNET_ID_EUW=36171240; PVPNET_REGION=euw; PVPNET_LANG=fr_FR; id_token=eyJraWQiOiJzMSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIxOTFiZjkyOC0zMzBhLTU3MjAtYjMzYy1mZTQ5OGNmODdlOTYiLCJjb3VudHJ5IjoiZnJhIiwiYW1yIjpbImNvb2tpZSJdLCJpc3MiOiJodHRwczpcL1wvYXV0aC5yaW90Z2FtZXMuY29tIiwibG9sIjpbeyJjdWlkIjozNjE3MTI0MCwiY3BpZCI6IkVVVzEiLCJ1aWQiOjM2MTcxMjQwLCJ1bmFtZSI6ImFybmF1ZDMwMTIiLCJwdHJpZCI6bnVsbCwicGlkIjoiRVVXMSIsInN0YXRlIjoiRU5BQkxFRCJ9XSwibG9jYWxlIjoiZnJfRlIiLCJhdWQiOiJyc28td2ViLWNsaWVudC1wcm9kIiwiYWNyIjoiMCIsImV4cCI6MTU3NjYxNTM0OCwiaWF0IjoxNTc2NTI4OTQ4LCJhY2N0Ijp7ImdhbWVfbmFtZSI6ImFybmFodWQiLCJ0YWdfbGluZSI6IkVVVyJ9LCJqdGkiOiJkTzExOEVpVGpQRSIsImxvZ2luX2NvdW50cnkiOiJmcmEifQ.GVGM4Ss5cc4lQKXaZnkXYXjbp5F4iSWYd6HPkqCqT4l0va7EF0INbHNLONmOKnS4c9-htLnMCpl1I9LmlexRIM58CodTO7OGz5tqP8kirtJ7KCeqAIbrsvWrDN3jQA5bHyoWiX3IPB3E8C76AOZ5BaAN-AE0sYSy5TpDjHo_hOw; id_hint=sub%3D191bf928-330a-5720-b33c-fe498cf87e96%26lang%3Dfr%26game_name%3Darnahud%26tag_line%3DEUW%26id%3D36171240%26summoner%3Darnahud%26region%3DEUW1%26tag%3Deuw; _tlc=:1576531469:euw.leagueoflegends.com%2Ffr%2F:leagueoflegends.com; _tlv=92.1550590967.1567793215.1576531488.242.1.2; ping_session_id=3adfe217-a333-4dab-996e-3c8a2d1a61c4; _gid=GA1.2.803505458.1577904415; _gat=1";
      var headers = {"cookie": cookie};
      var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true,'headers': headers});
      var json = response.getContentText();
      var data = JSON.parse(json);
    } catch (e) {
      Logger.log(e); // This will catch fetching error, like if the MH link is wrong
    }
  var workData = workTimelineData(data,playerID,playerIDOpp);
  console.log([workData]);
  return workData;
}
