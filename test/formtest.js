var expect = require('chai').expect,
	Form = require('../lib/form'),
	util = require('util'),
	LoginForm = require('../examples/login')
	;

describe('Form', function () {
	it('should be a function', function () {
		expect(Form).to.be.a('function');
	});

	describe('#extend', function () {
		var extended = Form.extend();
		it('should return a function', function () {
			expect(extended).to.be.a('function');
		});

		it('and that function should create an instance of Form', function () {
			expect(new extended).to.be.an.instanceOf(Form);
		});
	});

	describe('#isValid', function () {
		it('should return false with missing data', function () {
			var login = new LoginForm();
			var isValid = login.isValid();
			expect(isValid).to.be.false;
		});

		it('should return false with invalid data', function () {
			var login = new LoginForm({email:"me@me", pass:"two"});
			var isValid = login.isValid();
			expect(isValid).to.be.false;
		});

		it('should return true with valid data', function () {
			var login = new LoginForm({email:"me@me.com", pass:"four"});
			var isValid = login.isValid();
			expect(isValid).to.be.true;
		});
	});

	describe('#getErrors', function () {
		var login = new LoginForm();
		var isValid = login.isValid();
		var errors = login.getErrors();
		it('should return an object', function () {
			expect(errors).to.be.an('object');
		});

		it('and that object should have keys "email" and "pass"', function () {
			expect(errors).to.contain.keys('email','pass');
		});

		it('and that object should contain arrays as its values', function () {
			expect(errors.email).to.be.an('array');
			expect(errors.pass).to.be.an('array');
		});
	});

});