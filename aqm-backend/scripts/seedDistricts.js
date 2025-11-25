const sequelize = require("../src/db");
const District = require("../src/models/District");

const districts = [
    "Алмалинский район",
    "Медеуский район",
    "Ауэзовский район",
    "Наурызбайский район",
    "Бостандыкский район",
    "Алатауский район",
    "Жетысуский район",
    "Турксибский район"
];

async function seed() {
    try {
        await sequelize.authenticate();
        console.log("Connected to DB");

        await sequelize.sync(); // Ensure tables exist

        for (const name of districts) {
            const [district, created] = await District.findOrCreate({
                where: { name },
                defaults: { name }
            });
            if (created) {
                console.log(`Created: ${name}`);
            } else {
                console.log(`Exists: ${name}`);
            }
        }

        console.log("Seeding completed.");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seed();
