const playerMigrations = [
    {
        from: "1.0",
        to: "1.1",
        up: schema => {
            schema.version = "1.1";
            schema.rollCounter = 0;
            return schema;
        },
        down: schema => {
            schema.version = "1.0";
            delete schema.rollCounter;
            return schema;
        }
    },
];

module.exports = {
    playerMigrations
};
