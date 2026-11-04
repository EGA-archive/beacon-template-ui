# Beacon Template UI

The **Beacon Template UI** is a configurable web interface for [Beacon v2](https://beacon-project.io/) instances. It can be used with Single Beacon or Beacon Network deployments, depending on the connected API and runtime configuration.

For detailed information about its features, configuration, and usage, see the [official Beacon Template UI documentation](https://beacon-documentation-demo.ega-archive.org/ui-introduction).

## Development and Collaboration

## Development and Collaboration

The Beacon Template UI has been developed by the [**European Genome-phenome Archive (EGA)**](https://ega-archive.org/) team at the [**Centre for Genomic Regulation (CRG)**](https://www.crg.eu/), building on the framework developed in collaboration with the [**Barcelona Supercomputing Center (BSC)**](https://www.bsc.es/).

## UI Deployment

### 1. Prerequisites

**Docker and Docker Compose**

Make sure Docker and Docker Compose are installed on your machine.

You can verify this by opening a terminal and running:

```bash
docker --version
docker compose version
```

Both commands should display a version number.

**Git**

Git is required to clone the repository. You can verify it with:

```bash
git --version
```

**Code Editor (recommended)**

Use a code editor, such as Visual Studio Code, to edit `config.json` and customize the UI.

### 2. Clone the Repository

Open your terminal and navigate to the folder where you want to store the project (for example, your Desktop on macOS or Linux):

```bash
cd ~/Desktop
```

Clone the Beacon Template UI repository:

```bash
git clone https://github.com/EGA-archive/beacon-template-ui.git
```

Once cloning is complete, enter the project directory:

```bash
cd beacon-template-ui
```

Run the remaining Docker commands from this directory.

### 3. Configure the Template UI

Before starting the application, review the following files and directories:

- **Runtime configuration:** Edit `client/public/config/config.json` to configure your Beacon instance and UI settings.
- **Example configuration:** Use `client/config/config.example.json` as a reference when creating or updating your configuration.
- **Logos:** Place the required local `.svg` files in `client/public/assets/logos`. You can also use externally hosted image URLs where supported by the configuration.

The UI loads and validates `config.json` at runtime.

Docker Compose mounts `client/public/config` into the running container, allowing you to update **only the runtime JSON configuration** without rebuilding the application. Refresh or reopen the browser to load the updated settings.

**Note:** Changes to local logo files or application source code require a Docker rebuild, since these files are included in the built application rather than mounted as runtime configuration.

For a detailed explanation of the available settings, see the [official UI configuration documentation](https://beacon-documentation-demo.ega-archive.org/ui-configuration-file#configuration-file).

### 4. Start the Application with Docker

From the repository's root directory, run:

```bash
docker compose up -d --build
```

Docker Compose will build the UI image and start the container in the background.

### 5. Verify the Container

To confirm the container is running:

```bash
docker compose ps
```

The `client` service (container name `template-ui`) should be running.

With the provided Docker Compose configuration, the application is available locally at:

[http://localhost:3000](http://localhost:3000)

### 6. Stop or Restart the Application

To stop the application:

```bash
docker compose down
```

To start it again without rebuilding:

```bash
docker compose up -d
```

If you modify **only** `client/public/config/config.json`, you do not need to rebuild or restart the application. Refresh the browser to load the updated runtime configuration.

If you modify the application source code or local assets, rebuild and restart the UI:

```bash
docker compose up -d --build
```

## Updating to a New Beacon Template UI Version

The runtime configuration file (`client/public/config/config.json`) can be reused across Beacon Template UI releases, **as long as it remains compatible with the new version**.

When a new version is published, follow these steps:

### 1. Back Up Your Custom Files

Save a copy of the following files and any other customizations outside the repository:

- `client/public/config/config.json`
- Custom logo files from `client/public/assets/logos`
- Any additional local customizations

### 2. Update the Template UI Code

Pull the latest changes using Git or clone the new version into a separate directory.

**Important:** Since `config.json` is tracked by Git, local modifications may conflict with `git pull`. Keep a backup and resolve any Git conflicts before continuing.

Alternatively, clone the new version into a separate directory and copy your existing configuration into it.

### 3. Review Configuration Changes

Compare your saved `config.json` with `client/config/config.example.json` from the new release.

Add or update configuration fields if required, and restore any custom logo files.

### 4. Rebuild and Restart the UI

If you cloned the new version into a separate directory, first stop the existing application from the **old project directory**:

```bash
docker compose down
```

Then, from the updated repository directory, run:

```bash
docker compose up -d --build
```

A rebuild is required whenever the application source code or local assets change.

Changes to **only the runtime JSON configuration** do not require a rebuild or container restart.

As long as your existing `config.json` remains compatible with the new release, it can be reused without modification.

For further information, see the [official Beacon Template UI configuration documentation](https://beacon-documentation-demo.ega-archive.org/ui-configuration-file#configuration-file).
