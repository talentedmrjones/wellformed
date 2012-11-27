# wellformed v0.2

Wellformed provides easy form validation, filtering, and packaging of errors and values. Keep your controllers and models clean by separating form logic.


## 1. Build a Form

forms/loginform.js

```javascript
var util = require('util'),
Form = require('wellformed').Form,
LoginForm = function () {
  
  // inherit properties from super
  Form.apply(this,arguments);

  this.elements = {
    
    // keys map directly to input names
    email:{
      required:true,
      validators:[
        {type:'isEmail', message:"Please enter a valid email."}
      ]
    }, // email
    
    pass:{
      required:true,
      validators:[
        {type:"len",args:[4], message:"Please enter a valid password."}
      ]
    } // pass
    
    
  }; // elements

}; // LoginForm

// LoginForm should extend Form
util.inherits(LoginForm, Form);

// expose
module.exports = LoginForm;
```

## 2. Use Form in a Controller

```javascript
app.post('/login', function (req, res) {
  
  var LoginForm = require('./forms/loginform');
  var Form = new LoginForm(req);
  var isValid = Form.isValid();
  
  if (!isValid) {
    // errors will be an object where key maps to input name, values are arrays of errors for that input.
    var errors = Form.getErrors();
    res.json(400, {"errors":errors});
  } else {
    // values will be an object where the keys map to input names, and the values are what the user enter. (filtered if filters were used in the form)
    var values = Form.getValues();
    // do something with values. Perhaps pass to the model to verify user existance.
    res.json(200, {"values":values})
  }
  
});
```

## Advanced Usage

Wellformed also supports filters and dot notation for inputs using array notation.

Let's take a payment form for example:

```html
<form action="/order" method="post">
  <!-- Ignoring name and billing address for the sake of brevity -->
  <fieldset>
    <h2>Payment</h2>
    <input type="text" name="payment[number]" placeholder="Card Number" maxlength="20" autocomplete="off">
    <input type="text" name="payment[exp_month]" placeholder="MM" maxlength="2" autocomplete="off">
    <input type="text" name="payment[exp_year]" placeholder="YYYY" maxlength="4" autocomplete="off">
    <input type="text" name="payment[cvc]" placeholder="CVC" maxlength="4" autocomplete="off">
    <input type="submit" value="Place Order">
  </fieldset>
</form>
```


```javascript

var util = require('../lib/util')
,Form = require('wellformed').form
,OrderForm = function () {

  this.years = []
  this.date = new Date(),
  this.year = this.date.getFullYear();

  for (var i = 0; i < 12; i++) {
      this.years.push(i + this.year);
  }

  // inherit properties
  Form.apply(this,arguments);

  this.elements = {
    
    // Ignoring name and billing address for the sake of brevity
    
    "payment.number":{
      required:true,
      validators:[
        {type:'isCreditCard', message:"Enter a valid credit card number."}
      ]
    },
    
    "payment.exp_month":{
      required:true,
      validators:[
        {type:'regex',args:['01|02|03|04|05|06|07|08|09|10|11|12'],message:"Enter a valid expiration month."}
      ]
    },
    
    "payment.exp_year":{
      required:true,
      validators:[
        {type:'regex',args:[this.years.join('|')],message:"Enter a valid expiration year."}
      ]
    },
    
    "payment.cvc":{
      required:true,
      validators:[
        {type:'regex',args:['[0-9]{3,4}'],message:"Enter a valid CVC."}
      ]
    }

    
  }; // elements
  
}; // OrderForm


util.inherits(OrderForm, Form);

// Override the default isValid method to provide custom validation after individual fields have been checked
OrderForm.prototype.isValid = function () {

  // run form validation through super isValid method first
  var isValid = Form.prototype.isValid.apply(this, arguments),
  self = this;
  
  // ensure expiration is right: if year == this year, exp_month should be > than this month
  if (isValid) {
    var values = this.getValues();
    if (values.payment.exp_year == this.year && values.payment.exp_month < this.date.getMonth()) {
      isValid = false;
      this.errors.payment={exp_month: ["It appears this card has expired."]};
    }  
  }
  
  return isValid;
  
};

module.exports = OrderForm;


```

You can see in the code above, when using inputs in array notation, we name the elements keys with dot notation. The output of getErrors and getValues will then be nested as well.