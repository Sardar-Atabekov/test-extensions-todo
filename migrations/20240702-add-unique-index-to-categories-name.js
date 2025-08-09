"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex("Categories", ["name"], {
      unique: true,
      name: "categories_name_unique",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("Categories", "categories_name_unique");
  },
};
