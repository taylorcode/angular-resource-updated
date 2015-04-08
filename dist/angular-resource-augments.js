var ResourceAugments;

ResourceAugments = (function() {
  var MASTER_OPERATIONS, ngToPlainObject;

  function ResourceAugments() {}

  ngToPlainObject = function(obj) {
    return angular.fromJson(angular.toJson(obj));
  };

  MASTER_OPERATIONS = ['get', 'update', 'save'];

  ResourceAugments.prototype._getChanges = function(prev, now) {
    var c, changes, prop;
    prev = ngToPlainObject(prev);
    now = ngToPlainObject(now);
    changes = {};
    for (prop in now) {
      if (!prev || prev[prop] !== now[prop]) {
        if (_.isObject(now[prop])) {
          c = this._getChanges(prev[prop], now[prop]);
          if (!_.isEmpty(c)) {
            changes[prop] = c;
          }
        } else {
          changes[prop] = now[prop];
        }
      }
    }
    return changes;
  };

  ResourceAugments.prototype.addModified = function(Resource, customOperations) {
    var OPERATIONS, trackMaster, _this;
    OPERATIONS = customOperations ? MASTER_OPERATIONS.concat(customOperations) : MASTER_OPERATIONS;
    _this = this;
    Resource.prototype.$updateModified = function(params, success, error) {
      var result;
      if (typeof params === 'function') {
        error = success;
        success = params;
        params = {};
      }
      result = this.constructor.update.call(this, params, _this._getChanges(this.constructor.$$master, this), success, error);
      return result.$promise || result;
    };
    trackMaster = function(method) {
      var proxy;
      proxy = Resource[method];
      return Resource[method] = function() {
        var deferrend, promise;
        deferrend = proxy.apply(this, arguments);
        promise = this === Resource ? deferrend.$promise : deferrend;
        promise.then((function(_this) {
          return function(data) {
            Resource.$$master = angular.copy((_this === Resource ? data : _this));
            return data;
          };
        })(this));
        return deferrend;
      };
    };
    return _.each(OPERATIONS, function(op) {
      return trackMaster(op);
    });
  };

  return ResourceAugments;

})();

angular.module('angularResourceAugments', []).service('resourceAugments', ResourceAugments);