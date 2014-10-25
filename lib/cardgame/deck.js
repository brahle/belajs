var bignum = require('bignum');

var kthPermutation = function(k, n) {
  var fact = [];
  var perm = [];
  var i, j;

  fact.push(bignum(1));
  for (i = 1; i < n; ++i) {
    fact.push(fact[i-1].mul(i));
  }

  for (i = 0; i < n; ++i) {
    perm[i] = k.div(fact[n-i-1]).toNumber();
    k = k.mod(fact[n-i-1]);
  }

  for (i = n-1; i > 0; --i) {
    for (j = i-1; j >= 0; --j) {
      if (perm[j] <= perm[i]) {
        perm[i]++;
      }
    }
  }

  return perm;
};

var factorial = function (n) {
  var x = bignum(1), i;
  for (i = 2; i <= n; ++i) {
    x = x.mul(i);
  }
  return x;
};

var NotEnoughCards = function(message) {
  this.message = message;
};

var Deck = function(total_cards, seed) {
  this.top = 0;
  this.total = total_cards;
  this.seed = (seed || Deck.createSeed(this.total));
  this.cards = kthPermutation(this.seed, this.total);
  this.past_seeds = [];
};

Deck.prototype.deal = function (n) {
  var ret = [];
  n += this.top;
  if (n > this.total) {
    throw NotEnoughCards;
  }
  while (this.top < n) {
    ret.push(this.cards[this.top++]);
  }
  return ret;
};

Deck.prototype.shuffle = function () {
  this.past_seeds.push(this.seed);
  this.seed = Deck.createSeed(this.total);
  this.cards = kthPermutation(this.seed, this.total);
  this.top = 0;
};

Deck.createSeed = function (cards) {
  return bignum.rand(factorial(cards));
};

module.exports = Deck;

