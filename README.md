# Sunburst Smorgasbord

This is a tool to help you discuss and explore the relationships you'd like with your loved ones.

## Documentation

- [The board](docs/board.md): the data model, selecting flavours, rotating and editing.
- [Local storage](docs/local-storage.md): how the board is saved, restored and reset.
- [Image download](docs/image-download.md): saving the board as a PNG.
- [Markdown format](docs/markdown-format.md): the import/export file format.
- [Internationalization](docs/i18n.md): available languages, language detection and adding a translation.

## Running the project

Requires [Node.js](https://nodejs.org/) 24 (the version CI uses).

| Command          | What it does                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| `npm install`    | Install dependencies.                                                                          |
| `npm start`      | Run the app locally at [http://localhost:3000](http://localhost:3000), reloading on changes.   |
| `npm test`       | Run the tests in watch mode. Use `npm test -- --watchAll=false` for a single run.              |
| `npm run lint`   | Lint the sources with ESLint.                                                                  |
| `npm run build`  | Build the production bundle into `build/`.                                                     |

Tests use [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) and live next to the code they test (`*.test.tsx`). Components that read board state are wrapped in a `RecoilRoot`; use the file-based i18n instance from `src/i18n.tests.tsx` so translations load without a server.

## Continuous integration and deployment

- Every pull request to `main` runs lint, tests and a production build ([`pull-request.yml`](.github/workflows/pull-request.yml)). The build runs with `CI=true`, which turns lint warnings into errors, so run `CI=true npm run build` locally if in doubt.
- Every push to `main` runs the same checks and then deploys the build to AWS S3 and CloudFront ([`main.yml`](.github/workflows/main.yml)).

## Contributing to the project

We're open for pull requests - best discuss your suggestion first by opening an issue.
New translations are welcome; see [Adding a language](docs/i18n.md#adding-a-language) for the steps.
