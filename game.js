
var Game = function() {
    this.trumpSuite = null;
    this.suites = ["Spades", "Hearts", "Diamonds", "Clubs"];
    this.cardNames =      ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];
    this.normalStrength = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    this.trumpStrength =  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    this.normalPoints =   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    this.trumpPoints =    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
};


Game.prototype.getName = function(card_id) {
    return this.cardNames[this.getID(card_id)] + " of " + this.suites[this.getSuite(card_id)];
};

Game.prototype.getSuite = function(card_id) {
    return Math.floor(card_id / this.cardNames.length);
};

Game.prototype.getID = function(card_id) {
    return card_id % this.cardNames.length;
}

Game.prototype.getCount = function(card_id) {
    return this.cardNames.length * this.suites.length;
}

Game.prototype.setTrumpSuite = function(trump_suite) {
    this.trumpSuite = trump_suite;
    return this;
}

Game.prototype.isTrump = function(card_id) {
    return this.getSuite(card_id) === this.trumpSuite;
}

Game.prototype.getStrengthInSuite = function(card_id) {
    if (this.isTrump(card_id)) {
        return this.trumpStrength[this.getID(card_id)];
    }
    return this.normalStrength[this.getID(card_id)];
}

Game.prototype.strongerEZ = function(id_1, id_2) {
    return this.getStrengthInSuite(id_1) > this.getStrengthInSuite(id_2) ? id_1 : id_2;
}

Game.prototype.stronger = function(id_1, id_2, additional_data={}) {
    return this.strongerEZ(id_1, id_2);
}

Game.prototype.compare = function(id_1, id_2) {
    if (this.getSuite(id_1) === this.getSuite(id_2)) {
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

    return this.getSuite(id_1) - this.getSuite(id_2);
}

Game.prototype.sort = function(cards) {
    cards.sort(this.compare);
    return cards;
}

Game.prototype.canThrow = function(thrown, card) {
    return false;
}

Game.prototype.getDeck = function() {
    var total_cards = this.suites.length * this.cardNames.length;
    var cards = new Array(total_cards);
    for (var i = 0; i < total_cards; ++i) {
        cards[i] = i;
    }
    return cards;    
}

Game.prototype.shuffle = function(cards) {
    var i = cards.length, other, tmp;
    while (i !== 0) {
        other = Math.floor(Math.random() * i--);
        tmp = cards[i];
        cards[i] = cards[other];
        cards[other] = tmp;
    }
    return cards;
}

Game.prototype.deal = function(players) {
    var hands = new Array(players);
    var deck = this.shuffle(this.getDeck());
    var cards_per_player = Math.floor(this.getCount() / players); 
    for (var i = 0; i < hands.length; ++i) {
        hands[i] = new Array(cards_per_player);
        for (var j = 0; j < cards_per_player; ++j) {
            hands[i][j] = deck[i*cards_per_player+j];
        }
        hands[i].sort(function (a,b){return a-b;});
    }
    return hands;
}

Game.prototype.handlePlay = function() {
    // Implement play logic here
}



var BelaGame = function() {
    Game.call(this);
    this.suites = ["Pik", "Karo", "Herc", "Tref"];
    this.cardNames =      ["Sedmica", "Osmica", "Devetka", "Desetka", "Decko", "Baba", "Kralj", "As"];
    this.normalStrength = [    0,         1,        2,         6,        3,       4,      5,      7];
    this.trumpStrength =  [    0,         1,        6,         4,        7,       2,      3,      5];
    this.normalPoints =   [    0,         0,        0,         10,       2,       3,      4,     11];
    this.trumpPoints =    [    0,         0,        14,        10,       20,      3,      4,     11];
}

BelaGame.prototype = Object.create(Game.prototype);
BelaGame.prototype.constructor = BelaGame;

Game.prototype.getName = function(card_id) {
    return this.cardNames[this.getID(card_id)] + " " + this.suites[this.getSuite(card_id)];
};

BelaGame.prototype.stronger = function(id_1, id_2, additional_data={}) {
    if (this.isTrump(id_1)) {
        if (this.isTrump(id_2)) {
            return this.strongerEZ(id_1, id_2);
        }
        return id_1;
    }

    if (this.isTrump(id_2)) {
        return id_2;
    }

    if (this.getSuite(id_1) === additional_data.original_suite) {
        if (this.getSuite(id_2) === additional_data.original_suite) {
            return this.strongerEZ(id_1, id_2);
        }
        return id_1;
    }

    if (this.getSuite(id_2) === additional_data.original_suite) {
        return id_2;
    }

    return null;
}

BelaGame.prototype.strongestThrown = function(thrown, i=0) {
    if (i >= thrown.length) {
        return null;
    }

    if (i+1 == thrown.length) {
        return thrown[i];
    }

    return this.stronger(
        thrown[i],
        this.strongestThrown(thrown, i+1),
        {original_suite: this.getSuite(thrown[0]),}
    );
}

BelaGame.prototype.canThrow = function(thrown, cards) {
    if (thrown.length === 0) {
        return cards;
    }

    var original_suite = this.getSuite(thrown[0]);
    var strongest = this.strongestThrown(thrown);
    var strongest_trump = this.isTrump(strongest);
    var additional_data = {
         original_suite: this.getSuite(thrown[0]),
    };

    // 1. Check if I have a stronger card in the original suite
    //    ** or **
    // 2. Trump has been thrown, so I can throw any card from the original suite
    var can_throw = [];
    for (var i = 0; i < cards.length; ++i) {
        var card = cards[i];
        if (this.getSuite(card) === original_suite) {
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
    for (var i = 0; i < cards.length; ++i) {
        var card = cards[i];
        if (this.getSuite(card) === original_suite) {
            can_throw.push(card);
            continue;
        }
    }
    if (can_throw.length > 0) {
        return can_throw;
    }

    // 4. Check if I have any stronger trumps
    for (var i = 0; i < cards.length; ++i) {
        var card = cards[i];
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
    for (var i = 0; i < cards.length; ++i) {
        var card = cards[i];
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
}

BelaGame.prototype.handlePlay = function() {
    var deck = this.deal(4);

    // 1. Select the trump suite.
    this.setTrumpSuite(this.chooseTrumpSuite());

    // 2. "Zvanja"

    // 3. Igra

    // 4. Zbrajanje bodova

    // 5. Spremanje rezultata
}

var bela = new BelaGame();
bela.setTrumpSuite(1);
var deck = bela.deal(4);
