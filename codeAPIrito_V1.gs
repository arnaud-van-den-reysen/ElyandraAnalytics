function mainFunction() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("jungler");
  var api_key = "RGAPI-e89555d5-1822-49a1-bc47-eaa7a508de21"; //reset toutes les 24H !!!!!!!
  var pseudo = "eYa Stormax";
  var champions = getChampions();
  
  var data = getSummonersByName(pseudo,api_key);
  var matchListData = getMatchsList(data.accountId,api_key);
  for (var i = 0; i<97/*matchListData['matches'].length*/; i++) {
    var matchData = getMatchData(pseudo,matchListData['matches'][i].gameId,api_key,champions);
    console.log(matchData[4]);
    writeSheet(sheet,data,matchListData['matches'][i].gameId,matchData);
  }
  
}

function workMatchData(pseudo,matchData,champions) {
  try {
    for (var i = 0; i<matchData['participantIdentities'].length; i++) {
      if(matchData['participantIdentities'][i]['player'].summonerName == pseudo) {
        var playerID = matchData['participantIdentities'][i].participantId;
      }
    }
    
    for (var i = 0; i<matchData['participantIdentities'].length; i++) {
      if(matchData['participants'][i].participantId == playerID) {
        var teamPlayer = matchData['participants'][i].teamId;
        var winner = matchData['participants'][i]['stats'].win;
      }
    }
    
    for (var i = 0; i<matchData['participants'].length; i++) {
      if(matchData['participants'][i].participantId == playerID) {
        var lane = matchData['participants'][i].timeline.lane;
        var championPick = getChampionName(champions,matchData['participants'][i].championId);
      }
    }
    
    //Cherche champion adversaire direct
     for (var i = 0; i<matchData['participants'].length; i++) {
      if(matchData['participants'][i].timeline.lane == lane && matchData['participants'][i].participantId != playerID) {
        var championPickOpp = getChampionName(champions,matchData['participants'][i].championId);
      }
    }
    
    
    
    var data = [teamPlayer,winner,lane,championPick,championPickOpp];
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
  var moreData = workMatchData(pseudo,data,champions);//moreData
  
  return moreData;
}

function writeSheet(sheet,data,matchListData,matchData) {
  sheet.appendRow([data.name,data.accountId,matchListData,matchData[0],matchData[1],matchData[2],matchData[3],matchData[4]]);
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