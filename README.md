# Beacon Template UI

Welcome to the new template UI for Beacon v2 instances. Please, follow the [official documentation website](https://beacon-documentation-demo.ega-archive.org/ui-introduction) for detailed aspects on how the Beacon template UI works.

## UI Deployment

1. Prerequisites

* Docker

Make sure Docker and Docker Compose are installed on your machine.
You can verify this by opening up the terminal on your computer and input the following:

```bash
docker --version
docker compose version
```

You should expect both commands printing a version, for example:
```bash
Docker version 27.3.1, build ce12230
Docker Compose version v2.29.7-desktop.1
```

* Code Editor

You will need a code editor (e.g. Visual Studio Code) to:

* Edit the config.json
* Create and edit your.env file (if login is enabled)

2. Clone the repository

Open your terminal and navigate to the folder where you want to store the project (for example, your Desktop):

```bash
cd Desktop
```

Then, clone the Beacon Template UI repository:

```bash
git clone https://github.com/EGA-archive/beacon-template-ui.git
```

Once the cloning process finishes, you can open the app inside your code editor, and then go inside the project directory:

```bash
cd beacon-template-ui
```

This means you’re in the correct directory and ready to start editing the configuration.

3. Edit and Customize the Template UI

There is an extended section that you will find by navigating to the Configuration File paragraph.
Before proceeding make sure that the following files are edited:

*  config.json (location: client/src/config/config.json)
*  client/public/assets/logos is populated with the correct .svg(s)
    Remember that you can also use relative URLs if your images are hosted externally.

Only if the login is enabled:

* .env file is added in client folder with the credentials

4. Start the application with Docker

In your terminal run:

```bash
docker compose up -d --build
```

Docker will automatically build the image and start the UI container.

5. Verify the Container

To confirm the container is running:

```bash
docker ps
```

Expected output:


CONTAINER ID IMAGE COMMAND STATUS PORTS 123abc456def beacon-template-ui-client:latest "node /opt/yarn..." Up 10 seconds 0.0.0.0:3025->3000/tcp

If it’s visible, the UI is running locally at: http://localhost:3000

6. Stop or Restart the Application

To stop the container:

```bash
docker compose down
```

To rebuild and restart after modifying files:

```bash
docker compose up -d --build
```



## Updating to a new Beacon Template UI Version

The configuration file (client/src/config/config.json) is designed to be reusable across Beacon Template UI releases.
When a new version is published, you do not need to recreate your configuration from scratch.
To update to a newer version:

1. Keep your existing configuration files

    * client/src/config/config.json
    * client/.env (if login is enabled)

2. Update the Template UI code
    

    * Either pull the latest changes from the repository (for example with git fetch/git pull), or clone the new version and copy your existing config.json and.env into it.

3. Rebuild and restart the UI

    * Run:

```bash
docker compose down
docker compose up -d --build
```

This step is required every time the Beacon Template UI code changes, because the Docker image must be rebuilt to include the updated UI.
As long as your existing config.json matches the schema expected by the new release, it can be reused without modification. If new fields are introduced in future versions, you can compare your configuration with config.example.json and extend it as needed.
For further information on how to configure your UI editing the config.json file, please visit the [official documentation UI configuration part](https://beacon-documentation-demo.ega-archive.org/ui-configuration-file#configuration-file)
