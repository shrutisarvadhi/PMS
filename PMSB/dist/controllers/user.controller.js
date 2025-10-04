"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.listUsers = void 0;
const user_service_1 = require("../services/user.service");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.listUsers = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const users = await user_service_1.UserService.list();
    res.json(users);
});
exports.getUserById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await user_service_1.UserService.findById(req.params.id);
    res.json(user);
});
exports.createUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await user_service_1.UserService.create(req.body);
    res.status(201).json(user);
});
exports.updateUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await user_service_1.UserService.update(req.params.id, req.body);
    res.json(user);
});
exports.deleteUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await user_service_1.UserService.remove(req.params.id);
    res.status(204).send();
});
