"use strict";

var encryption = require("../../../utilities/encryption"),
    users = require("../data/users"),
    DUPL_ERR_CODE = 11000;

var UserController = {
    /**
     * Creates a user.
     * @param req - Request object
     * @param res - Response object
     * @returns {*}
     */
    createUser: function (req, res) {
        var userObject,
            validationErrMsgs;

        validationErrMsgs = UserController._validate(req.body);

        // Validation
        if (validationErrMsgs.length > 0) {
            res.status(400);
            return res.send({ errors: validationErrMsgs });
        }

        userObject = {
            username: req.body.username,
            email: req.body.email
        };

        // Password
        userObject.salt = encryption.generateSalt();
        userObject.hashPass = encryption.generateHashedPassword(userObject.salt, req.body.password);

        // Creating
        users.create(userObject, function (error, user) {
            // Mongo errors
            if (error) {
                res.status(400);
                return res.send({ errors: [UserController._mongoValidation(error)] });
            }

            req.logIn(user, function (error) {
                if (error) {
                    res.status(400);
                    return res.send({ errors: error.toString() });
                }

                res.send(user);
            });
        });
    },

    /**
     * Combines all validation methods.
     * @param body - Request body
     * @returns {Array.<string>} Error messages array
     * @private
     */
    _validate: function (body) {
        var errors = [];

        errors.push(this._validatePasswords(body));
        errors.push(this._validateUsername(body.username));
        errors.push(this._validateEmail(body.email));

        return errors.filter(function (error) {
            if (error) {
                return error;
            }
        });
    },

    /**
     * Validates passwords for existence, match, length, allowed symbols.
     * @param body - Request body
     * @returns {string} Error message
     * @private
     */
    _validatePasswords: function (body) {
        // Check if the password are present
        if (!body.password || !body.confirmPassword) {
            return "Missing password(s).";
        }

        // Check if the passwords are the same
        if (body.password !== body.confirmPassword) {
            return "The passwords aren't the same.";
        }

        if (body.password.length < 8 || 25 < body.password.length) {
            return "The password length must be between 8 and 25 symbols.";
        }

        return null;
    },

    /**
     * Validates username for existence, length and allowed symbols.
     * @param {string} username
     * @returns {string} Error message
     * @private
     */
    _validateUsername: function (username) {
        if (!username) {
            return "Missing username.";
        }

        if (username.length < 6 || 25 < username.length) {
            return "The username length must be between 6 and 25 symbols.";
        }

        if (!/^[\w.]+$/.test(username)) {
            return "The username can contain only A-Z, a-z, 0-9, _, . symbols.";
        }

        return "";
    },

    /**
     * Validates email address.
     * @param {string} email
     * @returns {string} Error message
     * @private
     */
    _validateEmail: function (email) {
        if (!email) {
            return "Missing email.";
        }

        if (!/^[\w.+-]+@[a-zA-Z\d-]+\.[a-zA-Z0-9-.]+$/.test(email)) {
            return "The email address is invalid.";
        }

        return "";
    },

    /**
     * All errors related to MongoDB which occur when attempting 'create'.
     * @param error - Error object
     * @returns {string} Error message
     * @private
     */
    _mongoValidation: function (error) {
        var unique = ["username", "email"],
            duplicated;

        // Duplicated field errors
        if (error.code === DUPL_ERR_CODE) {
            unique.forEach(function (field) {
                if (error.errmsg.indexOf(field) !== -1) {
                    duplicated = field;
                }
            });

            return "The " + duplicated + " is already in use.";
        }

        // Anything else
        // todo dev only
        return error.errmsg;
    }
};

module.exports = {
    createUser: UserController.createUser
};