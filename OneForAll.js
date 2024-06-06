// Roll20 API Script to add additional functionality for rolling a 1d100 for Deathwatch campaigns
on("chat:message", function(msg) {
    
  // Only provides additional info when the player or gm rolls a 1d100
  if( (msg.type == 'rollresult' || msg.type == 'gmrollresult') && msg.origRoll.includes('d100') ) { 
    // Debugging message content metadata
    // sendChat("Debugger", msg.content);

    // Initializes the final message variable, and calculates the roll result and reverse result with switched digits
    var finalMessage = '';
    var roll = msg.content.indexOf('\"v\":');
    var result = msg.content.substring(roll+4, roll+7).replace('}', '').replace(']', '');
    var senderName = 'Test'
    if (result.length == 1) result = `0${result}`;
    if (result.length == 2) result = `0${result}`;
    var reverseResult = 1;
    if (Number(result)%1000 != 100) reverseResult = Number(result)%10*10 + Math.floor(Number(result)/10);
    
    // Gets the message text if applicable and adds it to the final message
    var titleIndex = msg.content.indexOf('text\":\" ');
    if (titleIndex != -1) {
        var titleString = msg.content.substring(titleIndex+8, titleIndex+23)
            .replace('"', '').replace('}', '').replace(']', '').replace(',', '').replace('"', '');
        if (titleString[0] == "S") titleString=titleString.substring(0, titleString.length-2);
        if (titleString[0] == "T") titleString=titleString.substring(0, titleString.length-1);
        if (titleString[0] == "A") titleString=titleString.substring(0, titleString.length-3);
        if (titleString[0] == "M") titleString=titleString.substring(0, titleString.length-1);
        if (titleString[0] == "W" && titleString[1] == "i") titleString=titleString.substring(0, titleString.length-1);
        senderName = `${titleString} Test`;
        finalMessage+=`${result}`;
        // Gets the message modifiers if applicable and adds it to the final message
        var sheetIndex = msg.content.indexOf('expr\":\"+');
        if (sheetIndex != -1) {
            var characteristic, modifier, aptitude = '';
            var sheetValues = msg.content.substring(sheetIndex+8, sheetIndex+19)
                .replace('}', '').replace('{', '').replace('"', '').replace(',', '').replace('"', '');
            [characteristic, modifier, aptitude] = sheetValues.split('+');
            finalMessage+=`\n**Characteristic/Modifier/Aptitude:** ${characteristic}/${modifier}/${aptitude}`;
            
            // Calculates Degree(s) of Success and adds it to the final message
            var sucDegrees = ( ( Number(characteristic) + Number(modifier) + Number(aptitude) - Number(result) ) / 10 ).toFixed(1);
            finalMessage+=`\n**Degree(s):**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${sucDegrees}`;
        }
    }
    else finalMessage+=`${result}`;
    
    
    
    
    // Calculations for hit location
    const head = Array(10).fill('Head');
    const rightArm = Array(10).fill('Right Arm');
    const leftArm = Array(10).fill('Left Arm');
    const body = Array(40).fill('Body');
    const rightLeg = Array(15).fill('Left Leg');
    const leftLeg = Array(15).fill('Right Leg');
    const hitLocationTable = head.concat(rightArm).concat(leftArm).concat(body).concat(rightLeg).concat(leftLeg);
    
    // Dictionary table converting hit location to multiple hit locations
    const multipleHitsTable = {
        'Head': 'H, A, B, A, B+',
        'Right Arm': 'A, B, H, B, A+',
        'Left Arm': 'A, B, H, B, A+',
        'Body': 'B, A, H, A, B+',
        'Right Leg': 'L, B, A, H, B+',
        'Left Leg': 'L, B, A, H, B+'
    };
    
    // Calculations for scatter direction and distance
    const scatterDirection = Math.floor(Math.random()*10)+1;
    const scatterDistance = Math.floor(Math.random()*5)+1;
    
    // Dictionary table converting random scatter roll to a direction
    const scatterTable = {
        1: 'Northwest (1)',
        2: 'North (2)',
        3: 'Northeast (3)',
        5: 'East (5)',
        9: 'Southeast (9-10)',
        10: 'Southeast (9-10)',
        8: 'South (8)',
        6: 'Southwest (6-7)',
        7: 'Southwest (6-7)',
        4: 'West (4)'
    };
    
    // Adds the hit location, multiple hit locations, and scatter information to the final message
    finalMessage+=`\n**Hit Location:**&nbsp;&nbsp;${hitLocationTable[reverseResult-1]} (${reverseResult})`;
    finalMessage+=`\n**More Hits:** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${multipleHitsTable[hitLocationTable[reverseResult-1]]}`;
    finalMessage+=`\n**Scatter:** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${scatterTable[scatterDirection]} ${scatterDistance} meter(s)`;
    
    // Sends the final message to the roll20 chat
    sendChat(senderName, finalMessage);
    
  }
});
