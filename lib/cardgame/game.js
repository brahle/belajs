var Deck = require('./deck.js').Deck;

var Game = function () {
  this.trumpSuite = null;
  this.suites = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
  this.cardNames =      ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10',
                         'Jack', 'Queen', 'King'];
  this.normalStrength = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  this.trumpStrength =  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  this.normalPoints =   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  this.trumpPoints =    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  this.deck = null;
};


Game.prototype.name = function(card_id) {
  return this.cardNames[this.number(card_id)] +
    ' of ' + this.suites[this.suite(card_id)];
};

Game.prototype.suite = function(card_id) {
  return Math.floor(card_id / this.cardNames.length);
};

Game.prototype.number = function(card_id) {
  return card_id % this.cardNames.length;
};

Game.prototype.getCount = function () {
  return this.cardNames.length * this.suites.length;
};

Game.prototype.setTrumpSuite = function(trump_suite) {
  this.trumpSuite = trump_suite;
  return this;
};

Game.prototype.isTrump = function(card_id) {
  return this.suite(card_id) === this.trumpSuite;
};

Game.prototype.getStrengthInSuite = function(card_id) {
  if (this.isTrump(card_id)) {
    return this.trumpStrength[this.number(card_id)];
  }
  return this.normalStrength[this.number(card_id)];
};

Game.prototype.points = function (card) {
  if (this.isTrump(card)) {
    return this.trumpPoints[card];
  }
  return this.normalPoints[card];
};

Game.prototype.strongerEZ = function(id_1, id_2) {
  if (this.getStrengthInSuite(id_1) > this.getStrengthInSuite(id_2)) {
    return id_1;
  }
  return id_2;
};

Game.prototype.stronger = function (id_1, id_2) {
  return this.strongerEZ(id_1, id_2);
};

Game.prototype.compare = function(id_1, id_2) {
  if (this.suite(id_1) === this.suite(id_2)) {
    return this.getStrengthInSuite(id_2) - this.getStrengthInSuite(id_1);
  }

  if (this.isTrump(id_1)) {
    if (this.isTrump(id_2)) {
      return this.getStrengthInSuite(id_2) - this.getStrengthInSuite(id_1);
    }
    return -1;
  }

  if (this.isTrump(id_2)) {
    return 1;
  }

  return this.suite(id_1) - this.suite(id_2);
};

Game.prototype.sort = function(cards) {
  cards.sort(this.compare);
  return cards;
};

Game.prototype.canThrow = function() {
  return false;
};

Game.prototype.getDeck = function() {
  var total_cards = this.suites.length * this.cardNames.length;
  if (this.deck) {
    return this.deck;
  }
  this.deck = new Deck(total_cards);
  return this.deck;
};

Game.prototype.shuffle = function(cards) {
  var i = cards.length, other, tmp;
  while (i !== 0) {
    other = Math.floor(Math.random() * i--);
    tmp = cards[i];
    cards[i] = cards[other];
    cards[other] = tmp;
  }
  return cards;
};

Game.prototype.deal = function(counts) {
  var ret = [], i, deck = this.getDeck();
  for (i = 0; i < counts.length; ++i) {
    ret.push(deck.deal(counts[i]));
  }
  return ret;
};

Game.prototype.handlePlay = function() {
  // Implement play logic here
};

module.exports = Game;

