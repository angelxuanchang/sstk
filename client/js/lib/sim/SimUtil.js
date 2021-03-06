/** Utility functions for Simulator **/
var Object3DUtil = require('geo/Object3DUtil');
var _ = require('util');

function SimUtil() {
}

/**
 * Find objects in observation matching category
 * @param {SimState} state - Simulator state
 * @param {Object} objects - Observations for objects (semantic mask)
 * @param {string|array} categories - categories to find
 * @param {boolean} [includeOtherObjects=boolean] whether to include objects that are not model instances
 */
SimUtil.findObjectsByCategory = function(state, objects, categories, includeOtherObjects) {
  if (!Array.isArray(categories)) {
    categories = [categories];
  }
  var objectIds = _.keys(objects.counts);
  var objectInfos = state.getObjectInfos(objectIds);
  var filtered = objectInfos.filter(function(x) {
    var modelInstance = Object3DUtil.getModelInstance(x.node);
    if (modelInstance) {
      return modelInstance.model.hasCategoryIn(categories, true);
    } else {
      if (includeOtherObjects && x.node.userData.type) {
        var t = x.node.userData.type.toLowerCase();
        return _.any(categories, function(cat) { return t === cat.toLowerCase(); });
      } else {
        return false;
      }
    }
  });
  _.each(filtered, function(x) {
    x.modelInstance = Object3DUtil.getModelInstance(x.node);
    x.count = objects.counts[x.id];
  });
  filtered = _.sortBy(filtered, function(x) { return -x.count; });
  return filtered;
};

/**
 * Find objects in observation matching category
 * @param {SimState} state - Simulator state
 * @param {Object} objects - Observations for objects (semantic mask)
 * @param {Function} filter - Filter of objects
 */
SimUtil.findObjects = function(state, objects, filter) {
  var objectIds = _.keys(objects.counts);
  var objectInfos = state.getObjectInfos(objectIds);
  var filtered = objectInfos.filter(filter);
  _.each(filtered, function(x) {
    x.modelInstance = Object3DUtil.getModelInstance(x.node);
    x.count = objects.counts[x.id];
  });
  filtered = _.sortBy(filtered, function(x) { return -x.count; });
  return filtered;
};

/**
 * Return category to object count
 * @param {SimState} state - Simulator state
 * @param {Object} objects - Observations for objects (semantic mask)
 */
SimUtil.getCategoryCounts = function(state, objects) {
  var objectIds = _.keys(objects.counts);
  var objectInfos = state.getObjectInfos(objectIds);
  //console.log(objectInfos);
  var counts = _.countByMulti(objectInfos, function(x,k) {
    var modelInstance = Object3DUtil.getModelInstance(x.node);
    if (modelInstance) {
      return modelInstance.model.getCategories();
    } else if (x.node && x.node.userData.type != undefined) {
      return [x.node.userData.type];
    } else {
      return [];
    }
  });
  return counts;
};


module.exports = SimUtil;