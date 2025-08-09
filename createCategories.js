const db = require('./models');

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('DB connected');

    const categories = [
      { name: 'Work' },
      { name: 'Home' },
      { name: 'Hobby' }
    ];

    for (const cat of categories) {
      const [record, created] = await db.Category.findOrCreate({ where: { name: cat.name }, defaults: cat });
      if (created) console.log('Created category', cat.name);
    }

    console.log('Categories ready');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
