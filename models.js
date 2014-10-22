/* jslint node: true */
var DynamoObject = require('./dynamo_object.js');

function User(name) {
  DynamoObject.call(this);
  this.Name = name;
  this.FacebookID = null;
  this.Photo = null;
  this.FacebookProfile = null;
}
User.prototype = Object.create(DynamoObject.prototype, {});
User.prototype.constructor = User;

function FBIDtoBelaObject(fbid) {
  DynamoObject.call(this);
  this.id = fbid.toString();
  this.myid = null;
  this._table = 'Bela_FBID';
}
FBIDtoBelaObject.prototype = Object.create(DynamoObject.prototype, {});
FBIDtoBelaObject.prototype.constructor = FBIDtoBelaObject;

User.prototype.save = function (db, callback) {
  var self = this;
  DynamoObject.prototype.save.call(this, db, function (error) {
    if (error) { return callback(error); }
    if (!self.FacebookID) {
      return callback(null, self);
    }
    var glue = new FBIDtoBelaObject(self.FacebookID);
    glue.myid = self.id;
    glue.save(db, function (error) {
      if (error) { return callback(error); }
      return callback(null, self);
    });
  });
};

var UserNotFound = {};

User.getFromFBID = function (fbid, db, callback) {
  var glue_object = new FBIDtoBelaObject(fbid);
  glue_object.load(
    db,
    function (error, data) {
      if (error) { return callback(error); }
      if (!data.myid) { return callback(UserNotFound); }
      var user = new User();
      user.id = data.myid;
      user.load(db, callback);
    }
  );
};

User.createFromFbProfile = function (profile, db, callback) {
  var user = new User();
  user.Name = profile.displayName;
  user.FacebookID = profile.id;
  user.FacebookProfile = profile.profileUrl;
  user.save(db, callback);
};

User.getOrCreateFromFbProfile = function (profile, db, callback) {
  User.getFromFBID(
    profile.id,
    db,
    function (error, data) {
      if (error) {
        if (error === UserNotFound) {
          return User.createFromFbProfile(profile, db, callback);
        }
        return callback(error);
      }
      return callback(null, data);
    }
  );
};

module.exports = {
  User: User,
  UserNotFound: UserNotFound
};

