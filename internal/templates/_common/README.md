# Welcome to Your New Bails Project!

Congratulations on generating your Bails application! This README will guide you through the next steps to get your project up and running.

## Getting Started

1. Navigate to your project directory in the terminal.

   The frontend installs `@bails/runtime` from a private registry
   (see `frontend/.npmrc`). If you haven't yet, authenticate once:

   ```
   npm login --registry=https://npm.bgcl.dev/ --scope=@bails
   ```

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

3. **Explore the documentation**: Visit the [Bails documentation](https://github.com/blakeglucas/bails) for in-depth guides and API references.

4. **Join the community**: Have questions or want to share your progress? Open an issue on the [Bails repository](https://github.com/blakeglucas/bails/issues).

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
