// Roll20 API Script to add additional functionality for rolling a 1d100 for Deathwatch campaigns
on("chat:message", function(msg) {
    
  // Only provides additional info when the player or gm rolls any number of d10s
  if( (msg.type == 'rollresult' || msg.type == 'gmrollresult') && msg.origRoll.includes('d10') ) {
      
    // Initialize variables to parse through the roll for its total sum
    var indexTotal = msg.content.indexOf('\"total\":');
    var valueTotal = Number(msg.content.substring(indexTotal+8, indexTotal+10).replace('}', ''));
    
    // Initialize variables to parse through the roll for the values of every individual roll
    var diceResults = [];
    var msgCopy = msg.content;
    var indexRoll = 0;
    var totalRoll = 0;
    while( msgCopy.includes('\"v\":') ) {
        indexRoll = msgCopy.indexOf('\"v\":');
        totalRoll = Number(msgCopy.substring(indexRoll+4, indexRoll+6).replace('}', ''));
        diceResults.push(totalRoll);
        msgCopy = msgCopy.replace('\"v\":', '');
    }
    
    // Initialize variables for the final message, including the number of 10s and 9s+10s rolled
    var finalMessage = '';
    var totalTens = diceResults.filter( (curr) => curr==10 ).length>0 ? 1 : 0;
    var totalNinesTens = diceResults.filter( (curr) => curr==10||curr==9 ).length>0 ? 1 : 0;
    var additionalConfirms = [];
    var additionalRolls = [];
    var additionalTotals = [];
    
    // Sends a message only if any 9s or 10s are rolled, activating Righteous Fury on a rolled 9 or 10 and on future rolls
    if(totalNinesTens>0) {
        var newTotal = valueTotal;
        while (totalNinesTens > 0) {
            var damageConfirm = Math.floor(Math.random()*100)+1;
            var damageDie = Math.floor(Math.random()*10)+1;
            newTotal+=damageDie;
            if (damageDie == 9 || damageDie == 10) {
                totalNinesTens++;
            }
            additionalConfirms.push(damageConfirm);
            additionalRolls.push(damageDie);
            additionalTotals.push(newTotal);
            totalNinesTens--;
        }
        finalMessage+=`\n**Righteous Fury (9s & 10s): Base Dmg:** ${valueTotal}`;
        finalMessage+=`\n**Additional Hit Confirms:** ${additionalConfirms}`;
        finalMessage+=`\n**Additional Dmg Rolls:**    ${additionalRolls}`;
        finalMessage+=`\n**New Dmg Totals:**          ${additionalTotals}`;
    }
    
    // Sends a message only if any 10s are rolled, activating Righteous Fury on a rolled 10 and on future rolls
    if(totalTens>0) {
        var newTotal = valueTotal;
        for (let i = 0; i < additionalRolls.length; i++) {
            if (additionalRolls[i] != 10) {
                additionalConfirms = additionalConfirms.slice(0, i+1);
                additionalRolls = additionalRolls.slice(0, i+1);
                additionalTotals = additionalTotals.slice(0, i+1);
                break;
            }
        }
        finalMessage+=`\n**Righteous Fury (10s): Base Dmg:** ${valueTotal}`;
        finalMessage+=`\n**Additional Hit Confirms:** ${additionalConfirms}`;
        finalMessage+=`\n**Additional Dmg Rolls:**    ${additionalRolls}`;
        finalMessage+=`\n**New Dmg Totals:**          ${additionalTotals}`;
    }
    
    // Sends the final message to the roll20 chat only if Righteous Fury was activated
    sendChat('',finalMessage);
    
  }
});
