# Beacon Template UI

Welcome to the Template UI for Beacon v2 instances.

Please refer to the [official documentation website](https://beacon-documentation-demo.ega-archive.org/ui-introduction) for detailed information on how the Beacon Template UI works.

## UI Deployment

### 1. Prerequisites

**Docker**

Make sure Docker and Docker Compose are installed on your machine. Verify them by running:

```bash
docker --version
docker compose version
```

Both commands should print a version, for example:

```text
Docker version 27.3.1, build ce12230
Docker Compose version v2.29.7-desktop.1
```

**Code editor**

You will need a code editor (e.g. Visual Studio Code) to edit `config.json` and customize the UI.

### 2. Clone the Repository

Open a terminal and navigate to the folder where you want to store the project (for example, your Desktop):

```bash
cd ~/Desktop
```

Clone the Beacon Template UI repository and navigate into it:

```bash
git clone https://github.com/EGA-archive/beacon-template-ui.git
cd beacon-template-ui
```

For the IMPaCT Beacon Network Browser, switch to its dedicated branch:

```bash
git switch impact-network-ui
```

### 3. Edit and Customize the Template UI

Before deploying, check these locations:

- `client/public/config/config.json`: Runtime configuration of the UI.
- `client/config/config.example.json`: Example of available configuration options.
- `client/public/assets/logos`: Logos and other instance-specific images. External image URLs can also be used.

The application loads `config.json` at runtime. You can update this file after deployment without rebuilding the UI. Refresh or reopen the application to load the updated configuration.

**IMPaCT-specific login configuration**

IMPaCT keeps the login option visible while disabling authentication:

```json
{
  "showLogin": true,
  "disableLogin": true,
  "demoMode": true
}
```

These fields are shown here as an excerpt of the `ui` configuration object, not as a standalone `config.json`. The `disableLogin` and `demoMode` settings are specific to the IMPaCT branch.

For more detail, see the [official UI configuration documentation](https://beacon-documentation-demo.ega-archive.org/ui-configuration-file#configuration-file).

### 4. Start the Application with Docker

From the repository root, run:

```bash
docker compose up -d --build
```

Docker builds the image and starts the UI container.

### 5. Verify the Container

Check the container status:

```bash
docker compose ps
```

The IMPaCT container should be named `template-impact-ui`, have a healthy status, and expose port `3006` on your machine (mapped to container port `80`).

Open the application at [http://localhost:3006](http://localhost:3006).

### 6. Stop or Restart the Application

To stop the application:

```bash
docker compose down
```

If you change only `client/public/config/config.json`, refresh the browser; a rebuild is not required.

If you change application source code, rebuild and restart:

```bash
docker compose up -d --build
```

## Updating to a New Beacon Template UI Version

The runtime configuration file (`client/public/config/config.json`) can be reused across compatible releases, but a new version may change the required format or validation rules.

1. **Preserve your configuration and assets.** Keep a copy of `client/public/config/config.json` and any IMPaCT-specific images.
2. **Update the application code.** Integrate changes from the appropriate repository branch, preserving IMPaCT-only functionality.
3. **Review configuration compatibility.** Compare your current file with `client/config/config.example.json`, and migrate any fields whose structure or validation has changed. Keep the intended IMPaCT values.
4. **Validate the configuration.** From the `client` directory, run `yarn validate-config` (with dependencies installed).
5. **Rebuild and restart.** From the repository root, run:

   ```bash
   docker compose down
   docker compose up -d --build
   ```

Code changes require an image rebuild. Changes to the mounted runtime configuration alone do not.

For further information, see the [official UI configuration documentation](https://beacon-documentation-demo.ega-archive.org/ui-configuration-file#configuration-file).
