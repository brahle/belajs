/* jslint node: true */
var uuid = require("node-uuid");

/**
 * Handles saving and fetching objects from db.
 */
function DynamoObject() {
  this.id = uuid.v1();
  this.type = arguments.callee.caller.name;
  this._table = "Bela_Objects";
}

DynamoObject.prototype = {

  load: function (db, callback) {
    var self = this,
    parameters = {
      "Key": {
        "id": {
          "S": this.id.toString()
        },
        "type": {
          "S": this.type.toString()
        }
      },
      "TableName": this._table
    };
    db.getItem(parameters, function (error, data) {
      var key;
      if (error) {
        return callback(error);
      }
      for (key in data.Item) {
        var obj = data.Item[key];
        if (obj.hasOwnProperty("N")) {
          self[key] = obj.N;
        } else {
          self[key] = obj.S;
        }
      }
      callback(null, self);
    });
  },

  save: function (db, callback) {
    db.putItem(
      this.asDynamoItemSync(),
      callback
    );
  },

  /**
   * Helper function used to give the representation of the current item in
   * db-friendly format.
   */
  asDynamoItemSync: function () {
    var ret = {
      "Item": {},
      "TableName": this._table
    },
    key;
    for (key in this) {
      if (key[0] === "_") {
        continue;
      }
      var obj = this[key];
      if (obj === null) {
        continue;
      }
      if (obj instanceof Function) {
        continue;
      }
      ret.Item[key] = { "S": obj.toString() };
      continue;
    }
    return ret;
  }
};

module.exports = DynamoObject;
