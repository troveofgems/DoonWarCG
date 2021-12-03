// Event Listeners For DOM Manipulation
let battleBtn = document.getElementById('btn-battle');
battleBtn.addEventListener('click', beginCardGame);

const game = {
  edition: {
    cardFace: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"],
    suits: ["spades", "hearts", "clubs", "diams"],
    filledSuits: ["H", "D"],
    label: 'Classic Cards'
  },
  players: [[], []],
  initDetails: {
    baselineShuffle: {
      maxRounds: Math.ceil(Math.random() * (8 - 3) + 3),
      shufflesCompleted: false,
      shuffledDeck: [],
      currentShuffleRound: 0
    }
  },
  liveDetails: {
    playableDeck: [],
    firstRun: true,
    gameover: false,
    hist: [],
    pot: [],
    scores: {
      player1: 0,
      cpu: 0
    },
    potHist: {
      tier_0: {
        base: 1,
        cpuDesire: .13,
        limit: 0
      },
      tier_1: {
        base: 1.25,
        cpuDesire: .17,
        limit: 5,
      },
      tier_2: {
        base: 1.75,
        cpuDesire: .25,
        limit: 12
      },
      tier_3: {
        base: 3.5,
        cpuDesire: .5,
        limit: 15
      },
      currentTier: 0,
      holdoutCount: 0,
      p1Hist: [],
      cpuHist: []
    }
  }
};

// Game Functions
function beginCardGame() {
  if(game.liveDetails.firstRun) { // Need To Initialize The Game.
    connectEventListeners();
    let
      gameBoard = document.getElementById('gameBoard'),
      messagePanel = document.getElementById('message'),
      p1ScoreInit = document.querySelector('.p1Score'),
      p2ScoreInit = document.querySelector('.cpuScore');

    gameBoard.style.visibility = 'visible';
    messagePanel.innerHTML = 'Beginning Card Game';
    p1ScoreInit.innerHTML = `- ${game.liveDetails.scores.player1}`;
    p2ScoreInit.innerHTML = `- ${game.liveDetails.scores.cpu}`;

    game.liveDetails.firstRun = false; // Set to false so that initialization can't be ran again.

    buildDeck(messagePanel);
    dealCardsToPlayers(game.liveDetails.playableDeck);
    console.log('Game Has Been Initialized');
  } else {
    console.log('The Game Has Begun', game.players);
    execAttackRound();
  }
}
function updateTier() {
  const {potHist} = game.liveDetails;
  game.liveDetails.potHist.holdoutCount += 1;
  if (potHist.holdoutCount <= potHist.tier_0.limit) {
    game.liveDetails.potHist.currentTier = 0;
  } else if (potHist.holdoutCount >= potHist.tier_1.limit) {
    game.liveDetails.potHist.currentTier = 1;
  } else if (potHist.holdoutCount >= potHist.tier_2.limit) {
    game.liveDetails.potHist.currentTier = 2;
  } else if (potHist.holdoutCount >= potHist.tier_3.limit) {
    game.liveDetails.potHist.currentTier = 3;
  }
}
async function shuffleDeck(deckOfCards, messagePanel) { // ASYNC RECURSIVE FUNCTION SHUFFLE_DECK
  messagePanel.innerHTML = 'Shuffling Deck...';
  for (let deckSize = deckOfCards.length - 1; deckSize > 0; deckSize -= 1) {
    let randomCardId = Math.ceil(Math.random() * (deckSize + 1));

    let containCard = deckOfCards[deckSize];

    // Perform A Swap
    deckOfCards[deckSize] = deckOfCards[randomCardId]
    deckOfCards[randomCardId] = containCard;
  }

  if (!game.initDetails.baselineShuffle.shufflesCompleted) {
    game.initDetails.baselineShuffle.shuffledDeck = deckOfCards;
    game.initDetails.baselineShuffle.shufflesCompleted =
      (game.initDetails.baselineShuffle.currentShuffleRound === game.initDetails.baselineShuffle.maxRounds);
    game.initDetails.baselineShuffle.currentShuffleRound += 1;
    await shuffleDeck(game.initDetails.baselineShuffle.shuffledDeck, messagePanel);
  } else {
    messagePanel.innerHTML = 'Tracking Scores & Loaded Final Deck...Click the button again to start the game';
    let actionButton = document.getElementById('btn-battle');
    actionButton.innerHTML = 'Dooneese Style War!!';
    game.liveDetails.playableDeck = deckOfCards;
  }
}
function buildDeck(messagePanel) {
  messagePanel.innerHTML = 'Building Deck...';
  for (let suit in game.edition.suits) {
    let icon = (game.edition.suits[suit][0]).toUpperCase();
    for (let selection in game.edition.cardFace) {
      let card = {
        suit: game.edition.suits[suit],
        num: game.edition.cardFace[selection],
        cardValue: parseInt(selection) + 2,
        icon
      }
      game.initDetails.baselineShuffle.shuffledDeck.push(card);
    }
  }
  shuffleDeck(game.initDetails.baselineShuffle.shuffledDeck, messagePanel);
}
function dealCardsToPlayers(deckOfCards) {
  for (let card = 0; card < deckOfCards.length; card += 1 ) {
    let randomlySelectedPlayer = card % 2;
    game.players[randomlySelectedPlayer].push(deckOfCards[card]);
  }
}
function connectEventListeners() {
  // Event Listeners For Pot Actions
  let
    acceptThePotBtn = document.getElementById('btn-acceptPot'),
    declineThePotBtn = document.getElementById('btn-declinePot');

  acceptThePotBtn.addEventListener('click', acceptThePot);
  declineThePotBtn.addEventListener('click', declineThePot);
}

function acceptThePot() {
  console.log('Calling Accept The Pot');
  let
    actionButton = document.getElementById('btn-battle'),
    p1PotActions = document.querySelector('.potActions');

  p1PotActions.style.visibility = 'hidden';
  actionButton.style.visibility = 'visible'; // Action Decided

  let
    messagePanel = document.getElementById('message'),
    roundId = game.liveDetails.hist.length - 1,
    roundData = game.liveDetails.hist[roundId];
  messagePanel.innerHTML = "You have decided to cash in on the pot.";

  let
    currentPotValue = game.liveDetails.pot.reduce((sum, card) => sum + card.cardValue, 0),
    currentPlayedHandValue = (
      roundData.turnDraw.pulledCardByPlayer1.cardValue +
      roundData.turnDraw.pulledCardByPlayer2.cardValue
    ),
    { currentTier } = game.liveDetails.potHist,
    multiplier = game.liveDetails.potHist[`tier_${currentTier}`].base;


  console.log(roundData, currentPotValue, currentPlayedHandValue, game.liveDetails.scores.player1);
  let test = currentPotValue + currentPlayedHandValue + game.liveDetails.scores.player1;
  console.log('The Current Pot Value Is: ', currentPotValue);
  console.log('The Current Hand Value Is: ', currentPlayedHandValue);
  console.log('Player 1 Current Points: ', game.liveDetails.scores.player1);
  console.log('Total Points ', test);
  let
    p1ScoreInit = document.querySelector('.p1Score'),
    currentPlayerScore = game.liveDetails.scores.player1,
    subtotalForPot = currentPotValue * multiplier,
    subtotalForHand = currentPlayedHandValue,
    totalCalculatedScore = subtotalForPot + subtotalForHand + currentPlayerScore;

  game.liveDetails.scores.player1 = totalCalculatedScore;
  p1ScoreInit.innerHTML = `- ${game.liveDetails.scores.player1}`;
  // Add Cards To The Player's Hand
  let newHand = [].concat(game.players[0]);
  newHand = newHand.concat(game.liveDetails.pot);

  game.liveDetails.pot = []; // Reset The Pot
  game.liveDetails.potHist.holdoutCount = 0;
  game.liveDetails.potHist.currentTier = 0;
  game.players[0] = newHand;
}
function declineThePot() {
  let
    actionButton = document.getElementById('btn-battle'),
    p1PotActions = document.querySelector('.potActions');

  p1PotActions.style.visibility = 'hidden';
  actionButton.style.visibility = 'visible'; // Action Decided

  let
    roundId = game.liveDetails.hist.length - 1,
    roundData = game.liveDetails.hist[roundId];

  let // No Points are awarded as the cards instead go to the pot.
    {pulledCardByPlayer1, pulledCardByPlayer2} = roundData.turnDraw,
    messagePanel = document.getElementById('message'),
    playedHand = [pulledCardByPlayer1, pulledCardByPlayer2];

  messagePanel.innerHTML = "You've declined the pot.";
  game.liveDetails.pot.push(...playedHand);
  return updateTier();
}

function endGame() {

  const endgame = Object.freeze(game);
  return 'END';
}

function execAttackRound() {
  function checkWinnerOfRound() {
    let
      roundId = game.liveDetails.hist.length - 1,
      roundData = game.liveDetails.hist[roundId];
    if (roundData.round === roundId) {
      const
        p1CardValue = roundData.turnDraw.pulledCardByPlayer1.cardValue,
        p2CardValue = roundData.turnDraw.pulledCardByPlayer2.cardValue,
        player1Wins = p1CardValue > p2CardValue,
        player2Wins = p2CardValue > p1CardValue,
        draw = p1CardValue === p2CardValue,
        score_value = draw ? (p1CardValue + p2CardValue) : player1Wins ? p1CardValue : (p1CardValue + p2CardValue),
        {turnDraw} = roundData,
        histolog = {
          player1Wins, player2Wins, draw, score_value, turnDraw
        };

      game.liveDetails.hist[roundId].histolog = histolog;
      if (draw) {
        // TODO: Handle Draws
      } else {
        return calculateScore(histolog);
      }
    }
  }



  function calculateScore(histolog) {
    let
      messagePanel = document.getElementById('message'),
      totalCardCountInPot = document.getElementById('totalPotCardCount'),
      totalPotValue = document.getElementById('totalPotValue'),
      p1PotActions = document.querySelector('.potActions');




    if (histolog.player2Wins) {
      let
        cpuDecision = Math.random(), // Determine if the CPU will cash the pot.
        { currentTier } = game.liveDetails.potHist,
        chancesOfCPUCashingOut = game.liveDetails.potHist[`tier_${currentTier}`].cpuDesire;

      if (cpuDecision < chancesOfCPUCashingOut || game.players[1].length === 1) {
        messagePanel.innerHTML = "CPU has decided to cash in on the pot.";
        let
          currentPotValue = game.liveDetails.pot.reduce((sum, card) => sum + card.cardValue, 0),
          { currentTier } = game.liveDetails.potHist,
          multiplier = game.liveDetails.potHist[`tier_${currentTier}`].base;

        let p2ScoreInit = document.querySelector('.cpuScore');

        game.liveDetails.scores.cpu = currentPotValue * multiplier;
        p2ScoreInit.innerHTML = `- ${game.liveDetails.scores.cpu}`;
        // Add Cards To The CPU's Hand
        let newHand = [].concat(game.players[1]);
        newHand = newHand.concat(game.liveDetails.pot);

        game.liveDetails.pot = []; // Reset The Pot
        game.liveDetails.potHist.holdoutCount = 0;
        game.liveDetails.potHist.currentTier = 0;
        game.players[1] = newHand;
      } else {
        let // No Points are awarded as the cards instead go to the pot.
          {pulledCardByPlayer1, pulledCardByPlayer2} = histolog.turnDraw,
          playedHand = [pulledCardByPlayer1, pulledCardByPlayer2];

        messagePanel.innerHTML = "CPU has decided to send the hand to the pot.";
        game.liveDetails.pot.push(...playedHand);
        updateTier();
      }
    }


    else if (histolog.player1Wins) {
      let actionButton = document.getElementById('btn-battle');
      actionButton.style.visibility = 'hidden'; // Disable Next Round Until Player Decides Pot

      const
        currentPotValue = game.liveDetails.pot.reduce((sum, card) => sum + card.cardValue, 0),
        { currentTier } = game.liveDetails.potHist,
        multiplier = game.liveDetails.potHist[`tier_${currentTier}`].base;

      messagePanel.innerHTML = "Congratulations! How would you like to handle your win?";
      totalCardCountInPot.innerHTML = `${game.liveDetails.pot.length}`;
      totalPotValue.innerHTML = `${currentPotValue * multiplier}`;
      p1PotActions.style.visibility = 'visible';
    }
  }







  function showCard(cardInPlay, position, cardOwner) {
    let move = position * 40;
    let cardSkeleton = `<div class="gameCard ${cardInPlay.suit} ${cardOwner}" style="left: ${move}px">`;
    cardSkeleton += `<div class="cardTop suit">${cardInPlay.num}<br class="top-buffer"/></div>`;
    cardSkeleton += `<div class="cardMiddle"></div>`;
    cardSkeleton += `<div class="cardBottom suit">${cardInPlay.num}<br class="bottom-buffer"/></div></div>`;
    return cardSkeleton;
  }
  function initiateGameRound() {
    let
      player1_hand = document.querySelector("#player_1 .hand"),
      player2_hand = document.querySelector("#player_2_cpu .cpu-hand"),
      pulledCardByPlayer1 = pullACard(0),
      pulledCardByPlayer2 = pullACard(1),
      currentRound = {
        round: game.liveDetails.hist.length,
        turnDraw: { pulledCardByPlayer1, pulledCardByPlayer2 }
      };


    game.liveDetails.hist.push(currentRound);

    player1_hand.innerHTML = showCard(pulledCardByPlayer1, 0, 'p1CardSlot');
    player2_hand.innerHTML = showCard(pulledCardByPlayer2, 0, 'p2CardSlot');
    checkWinnerOfRound();
  }
  function pullACard(playerId) {
    return game.players[playerId].shift();
  }

  if (!game.liveDetails.gameover) {
    return initiateGameRound();
  }
  else {
    return endGame();
  }
}