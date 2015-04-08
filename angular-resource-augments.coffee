class ResourceAugments

    ngToPlainObject = (obj) ->
      angular.fromJson angular.toJson obj

    MASTER_OPERATIONS = ['get', 'update', 'save']

    # calculates the changes between two object by converting them to primitive key-value objs
    _getChanges: (prev, now) ->
      prev = ngToPlainObject(prev)
      now = ngToPlainObject(now)
      changes = {}
      for prop of now
        if not prev or prev[prop] isnt now[prop]
          if _.isObject(now[prop])
            c = @_getChanges(prev[prop], now[prop])
            # underscore
            changes[prop] = c  unless _.isEmpty(c)
          else
            changes[prop] = now[prop]
      changes
      
    # adds an $updateModified method onto a resource that when called, will only PUT the updates to the server
    addModified: (Resource, customOperations) ->

        OPERATIONS = if customOperations then MASTER_OPERATIONS.concat(customOperations) else MASTER_OPERATIONS

        _this = @ # retain inner-context because we need the context
        # add $updateModified method
        Resource::$updateModified = (params, success, error) ->
            if typeof params is 'function'
                error = success
                success = params
                params = {}
            result = @constructor.update.call(this, params, _this._getChanges(@constructor.$$master, @), success, error)
            result.$promise or result

        # on the method call, update the master
        trackMaster = (method) ->
            proxy = Resource[method]
            Resource[method] = ->
                deferrend = proxy.apply(@, arguments)
                promise = if @ is Resource then deferrend.$promise else deferrend
                promise.then (data) =>
                    Resource.$$master = angular.copy (if @ is Resource then data else @) # same as above
                    data
                deferrend

        _.each OPERATIONS, (op) -> trackMaster op

angular.module('angularResourceAugments', []).service('resourceAugments', ResourceAugments)