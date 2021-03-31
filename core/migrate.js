const upOrDown = (fromVersion, toVersion) => {
  const fromNumbers = fromVersion.split(".").map(el => Number(el));
  const toNumbers = toVersion.split(".").map(el => Number(el));
  const longestLength = Math.max(fromNumbers.length, toNumbers.length);
  for (let i = 0; i < longestLength; i++) {
    if (!fromNumbers[i]) fromNumbers[i] = 0;
    if (!toNumbers[i]) toNumbers[i] = 0;
    if (fromNumbers[i] != toNumbers[i]) {
      return (fromNumbers[i] < toNumbers[i]) ? "up" : "down";
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
