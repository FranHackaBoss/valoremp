const listUsers = require('./listUsers');
const getUser = require("./getUser");
const newUser = require("./newUser");
const editUser = require('./editUser');
const deleteUser = require("./deleteUser");
const userVote = require("./userVote");
const addUserComp = require("./addUserComp");

module.exports = { listUsers, getUser, newUser, editUser, deleteUser, userVote, addUserComp };