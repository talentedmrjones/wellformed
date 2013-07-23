var Form = require('../lib/form'),
LoginForm = module.exports = Form.extend({

  initialize: function () {

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

  } // initialize

}); // LoginForm