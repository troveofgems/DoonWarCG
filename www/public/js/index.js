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
// Pre-Runners
function _connectEventListeners() {
  // Event Listeners For Pot Actions
  let
    acceptThePotBtn = document.getElementById('btn-acceptPot'),
    declineThePotBtn = document.getElementById('btn-declinePot');

  acceptThePotBtn.addEventListener('click', acceptThePot);
  declineThePotBtn.addEventListener('click', declineThePot);
}

// Game Functions
function beginCardGame() {
  if(game.liveDetails.firstRun) { // Need To Initialize The Game.
    game.liveDetails.firstRun = false; // Set to false so that initialization can't be ran again.
    _connectEventListeners();
    _updateGameboard('Beginning Card Game');
    _updateScores();
    buildDeck();
    dealCardsToPlayers(game.initDetails.baselineShuffle.shuffledDeck);
    console.log('Game Has Been Initialized');
  } else {
    console.log('The Game Has Begun', game.players);
    execAttackRound();
  }
}
function dealCardsToPlayers(deckOfCards) {
  for (let card = 0; card < deckOfCards.length; card += 1 ) {
    let randomlySelectedPlayer = card % 2;
    game.players[randomlySelectedPlayer].push(deckOfCards[card]);
  }
}
function tabulateWinner() {
  const {roundId, rData} = getCurrentRoundInformation();
  if (rData.round === roundId) {
    const
      p1CardValue = rData.turnDraw.pulledCardByPlayer1.cardValue,
      p2CardValue = rData.turnDraw.pulledCardByPlayer2.cardValue,
      player1Wins = p1CardValue > p2CardValue,
      player2Wins = p2CardValue > p1CardValue,
      draw = p1CardValue === p2CardValue,
      score_value = draw ? (p1CardValue + p2CardValue) : player1Wins ? p1CardValue : (p1CardValue + p2CardValue),
      {turnDraw} = rData,
      histolog = {
        player1Wins, player2Wins, draw, score_value, turnDraw
      };

    game.liveDetails.hist[roundId].histolog = histolog;
    if (draw) {
      // TODO: Handle Draws
    } else {
      return routeWinner();
    }
  }
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

  return tabulateWinner();
}
function execAttackRound() {
  if (!game.liveDetails.gameover) {
    return initiateGameRound();
  } else {
    return endGame();
  }
}
function routeWinner() {
  const {rData} = getCurrentRoundInformation();
  if (rData.histolog.player2Wins) {
    const cpuWantsToCashOut = letCPUDecideToCashout();
    if (cpuWantsToCashOut) {
      acceptThePot('cpu');
    } else {
      declineThePot('cpu');
    }
  } else if (rData.histolog.player1Wins) {
    changeButtonView(true, false);
    _updatePotDetails();
    _updateGameboard("Congratulations! How would you like to handle your win?");
  }
}

// Deck Actions
function buildDeck() {
  _updateGameboard('Building Deck...');
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
  shuffleDeck(game.initDetails.baselineShuffle.shuffledDeck).then(() => {}).catch(err => console.error(err));
}
async function shuffleDeck(deckOfCards) { // ASYNC RECURSIVE FUNCTION SHUFFLE_DECK
  _updateGameboard('Shuffling Deck...');
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
    await shuffleDeck(game.initDetails.baselineShuffle.shuffledDeck);
  } else {
    _updateGameboard('Tracking Scores & Loaded Final Deck...Click the button again to start the game');
    let actionButton = document.getElementById('btn-battle');
    actionButton.innerHTML = 'Dooneese Style War!!';
    game.liveDetails.playableDeck = deckOfCards;
  }
}

// Pot Actions
function _updatePotDetails() {
  const
    totalCardsInPot = document.getElementById('totalPotCardCount'),
    potValue = document.getElementById('totalPotValue');

  totalCardsInPot.innerHTML = `${game.liveDetails.pot.length}`;
  potValue.innerHTML = `${game.liveDetails.pot.reduce((sum, card) => sum + card.cardValue, 0)}`;
}
function _flushPot() {
  game.liveDetails.pot = []; // Reset The Pot
  game.liveDetails.potHist.holdoutCount = 0;
  game.liveDetails.potHist.currentTier = 0;

  return null;
}
function changeButtonView(showPotButtons, showNextRoundButton) {
  let
    actionButton = document.getElementById('btn-battle'),
    p1PotActions = document.querySelector('.potActions');

  p1PotActions.style.visibility = showPotButtons      ? 'visible' : 'hidden';
  actionButton.style.visibility = showNextRoundButton ? 'visible' : 'hidden';
}
function acceptThePot(whoAccepts = 'player1') {
  changeButtonView(false, true);
  let
    pid = whoAccepts === 'cpu' ? 1 : 0,
    acceptanceMessage = whoAccepts === 'cpu' ?
      "CPU has decided to send the hand to the pot."
      : "You have decided to cash in on the pot.",
    {rData: { turnDraw: { pulledCardByPlayer1, pulledCardByPlayer2 } }} = getCurrentRoundInformation();

  _updateGameboard(acceptanceMessage);

  let
    { currentTier } = game.liveDetails.potHist,
    multiplier = game.liveDetails.potHist[`tier_${currentTier}`].base,
    score_totalHandValue = pulledCardByPlayer1.cardValue + pulledCardByPlayer2.cardValue,
    score_totalPlayerValue = whoAccepts === 'cpu' ? (
      game.liveDetails.scores.cpu
    ) : (
      game.liveDetails.scores.player1
    ),
    score_basePotScore = game.liveDetails.pot.reduce((sum, card) => sum + card.cardValue, 0),
    score_totalPotScore = score_basePotScore * multiplier;

  const finalScore = score_totalHandValue + score_totalPlayerValue + score_totalPotScore;
  if (whoAccepts === 'cpu') {
    game.liveDetails.scores.cpu = finalScore;
  } else {
    game.liveDetails.scores.player1 = finalScore;
  }
  increaseHand(pid); // Add Cards To The Player's Hand
  _updateScores();
}
function declineThePot(whoDeclines = 'player1') {
  changeButtonView(false, true);
  let
    declinationMessage = whoDeclines === 'cpu' ?
      "CPU has decided to decline the pot."
      : "You have decided to decline the pot.",
    {rData: { turnDraw: { pulledCardByPlayer1, pulledCardByPlayer2 } }} = getCurrentRoundInformation(),
    playedHand = [pulledCardByPlayer1, pulledCardByPlayer2];

  _updateGameboard(declinationMessage);
  game.liveDetails.pot.push(...playedHand);
  _updateTier();
  _updateScores();
}
function increaseHand(pid) {
  // Add Cards From Pot To The Hand
  let luckyNewHand = [].concat(game.players[pid]);
  luckyNewHand = luckyNewHand.concat(game.liveDetails.pot);
  game.players[pid] = luckyNewHand;

  return _flushPot();
}

// Player Actions
function pullACard(playerId) {
  return game.players[playerId].shift();
}
function showCard(cardInPlay, position, cardOwner) {
  let move = position * 40;
  let cardSkeleton = `<div class="gameCard ${cardInPlay.suit} ${cardOwner}" style="left: ${move}px">`;
  cardSkeleton += `<div class="cardTop suit">${cardInPlay.num}<br class="top-buffer"/></div>`;
  cardSkeleton += `<div class="cardMiddle"></div>`;
  cardSkeleton += `<div class="cardBottom suit">${cardInPlay.num}<br class="bottom-buffer"/></div></div>`;
  return cardSkeleton;
}

// CPU Functions
function letCPUDecideToCashout() {
  let
    cpuDecision = Math.random(), // Determine if the CPU will cash the pot.
    { currentTier } = game.liveDetails.potHist,
    chancesOfCPUCashingOut = game.liveDetails.potHist[`tier_${currentTier}`].cpuDesire,
    cashout = cpuDecision < chancesOfCPUCashingOut,
    instantCashout = game.players[1].length <= 7;

  return cashout || instantCashout;
}

// Game Helper Functions
function getCurrentRoundInformation() {
  let
    roundId = game.liveDetails.hist.length - 1,
    rData = game.liveDetails.hist[roundId];
  return {
    roundId,
    rData
  };
}
function _updateGameboard(messageChange) {
  let
    gameBoard = document.getElementById('gameBoard'),
    messagePanel = document.getElementById('message');

  gameBoard.style.visibility = 'visible';
  messagePanel.innerHTML = messageChange;

  return null;
}
function _updateScores() {
  let
    p1ScoreInit = document.querySelector('.p1Score'),
    p2ScoreInit = document.querySelector('.cpuScore');

  p1ScoreInit.innerHTML = `- ${game.liveDetails.scores.player1}`;
  p2ScoreInit.innerHTML = `- ${game.liveDetails.scores.cpu}`;

  return null;
}
function _updateTier() {
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
  return null;
}
function endGame() {
  game.liveDetails.gameover = true;
  const endgame = Object.freeze(game);
  return 'END';
}