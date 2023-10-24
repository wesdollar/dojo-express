# DollarDojo Express Generator

Scaffold an Express app with a single command. This generator will create a new directory with the name of your app, install all dependencies, and create a basic file structure for your app. Several things are configured out of the box, including:

- [Express](https://expressjs.com/)
- [Prettier](https://prettier.io/)
- [ESLint](https://eslint.org/)
- [Jest](https://jestjs.io/)
- [Prisma](https://www.prisma.io/)
- [Swagger UI](https://swagger.io/)

#### Installation

`npm i -g @dollardojo/express-generator generate <directory-name>`
`@dollardojo/express-generator generate <directory-name>`

If you do not wish to install globally, you can use `npx` to run the generator:

`npx @dollardojo/express-generator generate <directory-name>`

> *Note:* Project directory will be created in current working directory. Directory will be converted to kebab-case.

#### Running the Project

For additional details, see the README contained within the generated project.

The generator will default the server to port 3002. You can update the port number by configuring the `PORT` environment variable in the project's `.env`.

To start the server in development mode, run `npm run dev` from the project's root directory. Additional commands can be found in the project's `package.json` and README.
