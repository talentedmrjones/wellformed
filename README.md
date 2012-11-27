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