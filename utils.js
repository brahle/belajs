/* jslint node: true */
module.exports = {
    /**
     * Function that checks if the given value is a number.
     */
    isNumeric: function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
};

