# Contributing to OPFS Explorer

Thank you for your interest in contributing! We welcome bug reports, feature requests, and pull requests.

## Gets Started

1.  **Fork and Clone** the repository.
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    *Note: Since this is a DevTools extension, full testing requires loading the `dist` folder into Chrome.*

4.  **Build for Chrome:**
    ```bash
    npm run build
    ```
    Load the `dist/` folder in `chrome://extensions` (Developer Mode).

## Code Style
*   This project uses **React 19**, **TypeScript**, and **Tailwind CSS v4**.
*   Please ensure your code passes linting before submitting:
    ```bash
    npm run lint
    ```

## Submitting a Pull Request
1.  Create a new branch for your feature or fix.
2.  Make your changes.
3.  Run the build `npm run build` to ensure no errors.
4.  Push your branch and open a Pull Request.
5.  Provide a clear description of what changed and why.

## Reporting Bugs
Please open an issue on GitHub with:
*   Browser version (e.g., Chrome 120).
*   Steps to reproduce.
*   Expected vs. Actual behavior.
*   Screenshots (if applicable).

## License
By contributing, you agree that your contributions will be licensed under its MIT License.
