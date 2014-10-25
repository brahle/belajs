var Game = require('./game.js');

var sortNumber = function (a, b) {
  return a - b;
};

var BelaGame = function () {
  Game.call(this);
  this.suites = ['Pik', 'Karo', 'Herc', 'Tref'];
  this.cardNames = [
    'Sedmica',
    'Osmica',
    'Devetka',
    'Desetka',
    'Decko',
    'Baba',
    'Kralj',
    'As'
  ];
  this.normalStrength = [0, 1, 2, 6, 3, 4, 5, 7];
  this.trumpStrength = [0, 1, 6, 4, 7, 2, 3, 5];
  this.normalPoints = [0, 0, 0, 10, 2, 3, 4, 11];
  this.trumpPoints = [0, 0, 14, 10, 20, 3, 4, 11];
  this.sameDeclarationPoints = [0, 0, 150, 100, 200, 100, 100, 100];
  this.sequencePoints = [null, 0, 0, 20, 50, 100, 100, 100, 1001];
};

BelaGame.prototype = Object.create(Game.prototype);
BelaGame.prototype.constructor = BelaGame;

Game.prototype.name = function (card_id) {
  return this.cardNames[this.number(card_id)] +
    ' ' + this.suites[this.suite(card_id)];
};

BelaGame.prototype.stronger = function (id_1, id_2, additional_data) {
  if (this.isTrump(id_1)) {
    if (this.isTrump(id_2)) {
      return this.strongerEZ(id_1, id_2);
    }
    return id_1;
  }

  if (this.isTrump(id_2)) {
    return id_2;
  }

  if (this.suite(id_1) === additional_data.original_suite) {
    if (this.suite(id_2) === additional_data.original_suite) {
      return this.strongerEZ(id_1, id_2);
    }
    return id_1;
  }

  if (this.suite(id_2) === additional_data.original_suite) {
    return id_2;
  }

  return null;
};

BelaGame.prototype.strongestThrown = function (thrown, i) {
  if (i >= thrown.length) {
    return null;
  }

  if (i+1 === thrown.length) {
    return thrown[i];
  }

  return this.stronger(
    thrown[i],
    this.strongestThrown(thrown, i+1),
    {original_suite: this.suite(thrown[0]),}
  );
};

BelaGame.prototype.canThrow = function(thrown, cards) {
  if (thrown.length === 0) {
    return cards;
  }

  var i, card;
  var original_suite = this.suite(thrown[0]);
  var strongest = this.strongestThrown(thrown);
  var strongest_trump = this.isTrump(strongest);
  var additional_data = {
    original_suite: this.suite(thrown[0]),
  };

  // 1. Check if I have a stronger card in the original suite
  //    ** or **
  // 2. Trump has been thrown, so I can throw any card from the original suite
  var can_throw = [];
  for (i = 0; i < cards.length; ++i) {
    card = cards[i];
    if (this.suite(card) === original_suite) {
      if (strongest_trump) {
        can_throw.push(card);
        continue;
      }
      if (this.stronger(card, strongest, additional_data) === card) {
        can_throw.push(card);
        continue;
      }
    }
  }
  if (can_throw.length > 0) {
    return can_throw;
  }

  // 3. Check if I have any cards in the suite
  for (i = 0; i < cards.length; ++i) {
    card = cards[i];
    if (this.suite(card) === original_suite) {
      can_throw.push(card);
      continue;
    }
  }
  if (can_throw.length > 0) {
    return can_throw;
  }

  // 4. Check if I have any stronger trumps
  for (i = 0; i < cards.length; ++i) {
    card = cards[i];
    if (this.isTrump(card) && // This check is actually redundant...
        this.stronger(card, strongest, additional_data) === card) {
      can_throw.push(card);
    continue;
    }
  }
  if (can_throw.length > 0) {
    return can_throw;
  }

  // 5. Check if I have any trumps
  for (i = 0; i < cards.length; ++i) {
    card = cards[i];
    if (this.isTrump(card)) {
      can_throw.push(card);
      continue;
    }
  }
  if (can_throw.length > 0) {
    return can_throw;
  }

  // 6. I don't have original suite nor trump cards so I can throw whatever.
  return cards;
};

var UnusedCardsInDeclaration = function (message) {
  this.message = message;
};

BelaGame.prototype.checkSame = function (cards) {
  var i, j, cnt, score = 0, used = [];
  for (i = 0; i < cards.length; ++i) {
    cnt = 1;
    for (j = i+1; j < cards.length; ++j) {
      if (this.number(cards[i]) === this.number(cards[j])) {
        ++cnt;
      }
    }
    if (cnt === 4) {
      if (!this.sameDeclarationPoints[this.number(cards[i])]) {
        throw new UnusedCardsInDeclaration();
      }
      for (j = i+1; j < cards.length; ++j) {
        if (this.number(cards[i]) === this.number(cards[j])) {
          used.push(j);
        }
      }
      score += this.sameDeclarationPoints[this.number(cards[i])];
    }
  }
  used.sort(sortNumber);
  return {
    score: score,
    used: used
  };
};

BelaGame.prototype.checkSequence = function (cards) {
  var score = 0, used = [], i, cnt = 1, j, x;
  x = cards.slice(0);
  x.push(-1);
  for (i = 1; i < x.length; ++i) {
    if (x[i-1]+1 === x[i] && this.suite(x[i-1]) === this.suite(x[i])) {
      ++cnt;
    } else {
      if (this.sequencePoints[cnt]) {
        score += this.sequencePoints[cnt];
        used.push(i-1);
        for (j = i-2; j >= 0; --j) {
          if (x[j]+1 !== x[j+1] || this.suite(x[j]) !== this.suite(x[j+1])) {
            break;
          }
          used.push(j);
        }
      }
      cnt = 1;
    }
  }
  used.sort(sortNumber);
  return {
    score: score,
    used: used
  };
};

BelaGame.prototype.checkDeclarations = function (cards) {
  var mycards = cards.slice(0);
  var same, sequence, i;
  var used = new Array(cards.length);
  mycards.sort(sortNumber);
  same = this.checkSame(mycards);
  sequence = this.checkSequence(mycards);
  for (i = 0; i < same.used.length; ++i) {
    used[same.used[i]] = 1;
  }
  for (i = 0; i < sequence.used.length; ++i) {
    used[sequence.used[i]] = 1;
  }
  for (i = 0; i < used.length; ++i) {
    if (!used[i]) {
      throw new UnusedCardsInDeclaration();
    }
  }
  return same.score + sequence.score;
};

BelaGame.prototype.tallyOne = function (cards) {
  var sum = 0;
  for (var i = 0; i < cards; ++i) {
    sum += this.points(cards[i]);
  }
  return sum;
};

BelaGame.prototype.tally = function (declarations, tricks) {
  var scores = [0, 0];
  var i;
  for (i = 0; i < declarations.length; ++i) {
    scores[i%2] += declarations[i].score;
  }
  for (i = 0; i < tricks.length; ++i) {
    scores[tricks[i].winner%2] += this.tallyOne(tricks[i].cards);
    if (tricks.bela) {
      scores[tricks[i].winner%2] += 20;
    }
  }
  scores[tricks[7].winner%2] += 10;
  return scores;
};

BelaGame.prototype.finalResult = function (bidder, declarations, tricks) {
  var scores = this.tally(declarations, tricks);
  var other = (bidder+1)%2;
  bidder %= 2;
  if (scores[other] >= scores[bidder]) {
    if (scores[bidder] === 0) {
      scores[other] += 90;
    }
    scores[other] += scores[bidder];
    scores[bidder] = 0;
    return scores;
  }
  if (scores[other] === 0) {
    scores[bidder] += 90;
  }
  return scores;
};

BelaGame.prototype.handlePlay = function () {
  var deal = this.deal([6, 6, 6, 6, 2, 2, 2, 2]);
  var declarations = new Array(4);
  var tricks = new Array(8);

  // 0. Deal cards to players

  // 1. Select the trump suite.
  var trump = this.chooseTrumpSuite();
  this.setTrumpSuite(trump.suite);
  var bidder = trump.bidder;

  // 1.5. Give additional cards to players


  // 2. 'Zvanja'

  // 3. Igra

  // 4. Zbrajanje bodova
  var result = this.finalResult(bidder, declarations, tricks);

  // 5. Spremanje rezultata
  return result;
};

var bela = new BelaGame();
bela.setTrumpSuite(1);
var cards = [5, 6, 7, 8, 9, 10];
try {
  console.log(bela.checkSame(cards));
} catch (UnusedCardsInDeclaration) {
  console.log('UnusedCardsInDeclaration');
}
try {
  console.log(bela.checkSequence(cards));
} catch (UnusedCardsInDeclaration) {
  console.log('UnusedCardsInDeclaration');
}
try {
  console.log(bela.checkDeclarations(cards));
} catch (UnusedCardsInDeclaration) {
  console.log('UnusedCardsInDeclaration');
}
