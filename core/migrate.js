const upOrDown = (fromVersion, toVersion) => {
  const fromNumbers = fromVersion.split(".").map(el => Number(el));
  const toNumbers = toVersion.split(".").map(el => Number(el));
  for (let i = 0; i < fromNumbers.length; i++) {
    if (fromNumbers[i] < toNumbers[i]) {
      return "up";
    }
    if (fromNumbers[i] > toNumbers[i]) {
      return "down";
    }
  }
  return "same";
};

const migrate = (schema, migrations, toVersion) => {
  let fromVersion = "1.0";
  if (schema.hasOwnProperty("version")) {
      fromVersion = schema.version;
  }
  const direction = upOrDown(fromVersion, toVersion);
  if (direction === "same") {
    return schema;
  }
  const currentMigration = migrations.find(
    migration => migration[direction === "up" ? "from" : "to"] === fromVersion
  );
  const newSchema = currentMigration[direction](schema);
  return migrate(newSchema, migrations, toVersion);
};

module.exports = migrate;
