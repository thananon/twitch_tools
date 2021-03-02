const migrations = [
    {
        from: "1.0",
        to: "1.1",
        up: schema => {
            const newSchema = {
                version: "1.1",
                username: schema.username,
                level: schema.level,
                coins: schema.coins,
                status: schema.status,
                exp: schema.exp,
                rollCounter: 0,
                role: schema.role
            };
            return newSchema;
        },
        down: schema => {
            const newSchema = {
                version: "1.0",
                username: schema.username,
                level: schema.level,
                coins: schema.coins,
                status: schema.status,
                exp: schema.exp,
                role: schema.role
            };
            return newSchema;
        }
    },
];

module.exports = migrations