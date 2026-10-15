const fs = require("fs");
const path = require("path");
const schema = require("../src/config/schema");

const configPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, "../public/config/config.json");

try {
  const rawConfig = fs.readFileSync(configPath, "utf8");
  const config = JSON.parse(rawConfig);

  const { error } = schema.validate(config);

  if (error) {
    console.error(`\nInvalid configuration: ${configPath}\n`);

    error.details.forEach((detail) => {
      console.error(`- ${detail.message}`);
    });

    console.error("\nConfiguration validation failed.\n");
    process.exit(1);
  }

  console.log(`\nConfiguration is valid: ${configPath}\n`);
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error(`\nInvalid JSON in configuration file: ${configPath}`);
    console.error(error.message);
  } else {
    console.error(`\nUnable to validate configuration: ${configPath}`);
    console.error(error.message);
  }

  process.exit(1);
}
