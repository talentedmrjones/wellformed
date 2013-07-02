var validator = require('validator'),
    _ = require('underscore'),
    validators = validator.validators,
    util = require('util')
    ;

/*
  getNested & setNested borrowed from https://github.com/powmedia/backbone-deep-model/blob/master/src/deep-model.js
*/
var getNested  = function (obj, path) {

  var fields = path.split(".");
  var result = obj;
  for (var i = 0, n = fields.length; i < n; i++) {

    result = result[fields[i]];

    if (result == null && i < n - 1) {
        result = {};
    }
    
    if (typeof result === 'undefined') {
        return result;
    }
  }
  return result;
}; // getNested

var setNested = function (obj, path, val, options) {
  options = options || {};

  var fields = path.split(".");
  var result = obj;
  for (var i = 0, n = fields.length; i < n && result !== undefined ; i++) {
    var field = fields[i];

    //If the last in the path, set the value
    if (i === n - 1) {
      if (options.unset) delete result[field] 
      else if (options.push) {
        if (!_.isArray(result[field])) result[field]=[];
        result[field].push(val);
      } else result[field] = val;
    } else {
      //Create the child object if it doesn't exist, or isn't an object
      if (typeof result[field] === 'undefined' || ! _.isObject(result[field])) {
          result[field] = {};
      }
      //Move onto the next part of the path
      result = result[field];
    }
  }
};


/*
 * prototype Form
 */
var Form = module.exports = function (req) {
  
  // property names map to request param names, use to set validators and filters
  this.elements={}
  
  // property names map to request param names, values are arrays of errors
  this.errors={};
  
  // contains filtered values
  this.values={};
  
  // holds the request object as sent from a controller
  this.req = req;

  // reference so we can use validators in subclasses
  this.validators = validators;

  this.initialize();

};

Form.prototype.initialize = function () {};

/*
 * Validate data from all the fields in the form (thus all the properties of the req.body object).
 *
 * @return boolean
 * @api public
 */
Form.prototype.isValid = function () {
  
  var self = this
  ,isValid = true
  ,field
  ,element
  ,value
  ,filter
  ,params = _.extend({},this.req.params,this.req.body);
  

  for (field in this.elements) {
    
    element = this.elements[field];
    value = getNested(params, field, false);
    filter = new validator.Filter();
    
    //setNested(self.errors, field, []);
    self.elements[field].isValid = true;
    
    this.value = value;
    
    if (value == undefined) {
      value=''; // so filters and validators may run .match() or .replace()
    }

    if ('filters' in element) {
      element.filters.forEach(function (f) {
        filter.sanitize(value);
        value = filter[f.type].apply(filter, f.args);
      });
    }
    
    var required = true; // defaults to true
    
    if ('required' in element) {
      switch (typeof element.required) {
        case 'function':
          required = element.required.call(self);
          break;
        case 'boolean':
          required = (element.required || this.value!=undefined);
          break;
      }
    }

    if (required && 'validators' in element) {

      element.validators.forEach(function IterateValidators (validator) {
  
        if (!validator.args) {
          validator.args=[]; // so we can unshift below
        }

        validator.args.unshift(value);

        if (!validators[validator.type].apply(validator,validator.args)) {
          
          // add the error for that field
          self.elements[field].isValid = false;
          setNested(self.errors, field, validator.message, {push:true})
          isValid = false;

        }
        
      }); //validators.forEach
    }
    
    setNested(this.values, field, value);

    
  };

  return isValid;
  
} // Form.prototype.isValid()


Form.prototype.getValues = function () {
  return this.values;
}; // getValues

Form.prototype.getErrors = function () {
  return this.errors;
}; // getErrors

Form.prototype.getRequest = function () {
  return this.req;
}

Form.prototype.getInitials = function () {
  var initials = {};
  for (field in this.elements) {
    if (this.elements[field].initial==undefined) {
      initials[field] = '';  
    } else {
     initials[field] = this.elements[field].initial; 
    }
  }
  return initials;
}

Form.extend = function (prototypeProps) {
  var Surrogate = function () { return Form.apply(this, arguments); };
  util.inherits(Surrogate, Form);
  _.extend(Surrogate.prototype, prototypeProps);
  return Surrogate;
};