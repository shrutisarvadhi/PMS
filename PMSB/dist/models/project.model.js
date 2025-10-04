"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = exports.ProjectStatus = void 0;
const sequelize_1 = require("sequelize");
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["Planning"] = "Planning";
    ProjectStatus["InProgress"] = "InProgress";
    ProjectStatus["Completed"] = "Completed";
    ProjectStatus["OnHold"] = "OnHold";
    ProjectStatus["Cancelled"] = "Cancelled";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
class Project extends sequelize_1.Model {
    static initModel(sequelize) {
        Project.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            pmId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: true,
            },
            status: {
                type: sequelize_1.DataTypes.ENUM(...Object.values(ProjectStatus)),
                allowNull: false,
                defaultValue: ProjectStatus.Planning,
            },
            startDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            endDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            createdAt: {
                allowNull: false,
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            updatedAt: {
                allowNull: false,
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
        }, {
            sequelize,
            tableName: 'Projects',
            modelName: 'Project',
        });
        return Project;
    }
}
exports.Project = Project;
