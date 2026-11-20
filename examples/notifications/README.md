# Welcome to Your New Bails Project!

Congratulations on generating your Bails application! This README will guide you through the next steps to get your project up and running.

## Running on macOS with private APIs

This example configures a translucent macOS backdrop. The webview transparency needed to reveal that backdrop requires the `private_mac_apis` build tag. Without it, the example runs with an opaque webview above the native backdrop.

From this example directory, run:

```bash
bails build -tags private_mac_apis
bails task run
```

The build command generates bindings and builds the frontend; the run task then launches the resulting app. It requires the Bails CLI, Node.js/npm, and the usual macOS build prerequisites. To use live reload instead, run `EXTRA_TAGS=private_mac_apis bails dev`.

Omit `-tags private_mac_apis` from the build command to run with public macOS APIs only. The tag has no effect on Windows, Linux, iOS, or Android. See the [shared private API guide](../README.md#private-macos-apis) for production builds and fallback details.

## Getting Started

1. Navigate to your project directory in the terminal.

2. To run your application in development mode, use the following command:

   ```
   bails dev
   ```

   This will start your application and enable hot-reloading for both frontend and backend changes.

3. To build your application for production, use:

   ```
   bails build
   ```

   This will create a production-ready executable in the `build` directory.

## Exploring Bails Features

Now that you have your project set up, it's time to explore the features that Bails offers:

1. **Check out the examples**: The best way to learn is by example. Visit the `examples` directory in the `examples` directory to see various sample applications.

2. **Run an example**: To run any of the examples, navigate to the example's directory and use:

   ```
   go run .
   ```

   Note: Some examples may be under development during the alpha phase.

3. **Explore the documentation**: Visit the [Bails documentation](https://v3.wails.io/) for in-depth guides and API references.

4. **Join the community**: Have questions or want to share your progress? Join the [Bails Discord](https://discord.gg/JDdSxwjhGf) or visit the [Bails discussions on GitHub](https://github.com/wailsapp/wails/discussions).

## Project Structure

Take a moment to familiarize yourself with your project structure:

- `frontend/`: Contains your frontend code (HTML, CSS, JavaScript/TypeScript)
- `main.go`: The entry point of your Go backend
- `app.go`: Define your application structure and methods here
- `bails.json`: Configuration file for your Bails project

## Next Steps

1. Modify the frontend in the `frontend/` directory to create your desired UI.
2. Add backend functionality in `main.go`.
3. Use `bails dev` to see your changes in real-time.
4. When ready, build your application with `bails build`.

Happy coding with Bails! If you encounter any issues or have questions, don't hesitate to consult the documentation or reach out to the Bails community.
