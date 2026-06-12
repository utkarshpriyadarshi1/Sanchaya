# Contributing to e-Patra

Thank you for your interest in contributing to **e-Patra**! We welcome contributions from developers of all skill levels to help make e-Patra a better secure, local-first document management system.

Please take a moment to review this document before submitting your contribution.

---

## Code of Conduct

By participating in this project, you agree to abide by standard open-source community guidelines:
* Maintain a respectful and inclusive tone in all issues, pull requests, and discussions.
* Focus on constructive collaboration to solve problems and improve the product.

---

## How to Contribute

### 1. Reporting Bugs
If you find a bug:
1. Search the existing issues to see if it has already been reported.
2. If it hasn't, open a new issue detailing:
   * The operating system and version.
   * Steps to reproduce the bug.
   * Expected vs. actual behavior.
   * Any relevant logs or screenshots.

### 2. Suggesting Enhancements
If you have an idea for a new feature or improvement:
1. Open an issue describing the proposed change and its benefits.
2. Discuss the design with the maintainers to align on the approach before coding.

### 3. Submitting Pull Requests
We accept pull requests (PRs) for bug fixes and new features. To submit a PR:
1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Set up your local development environment and write code.
3. Verify that your changes build and run successfully:
   * Run clean scripts to verify freshness: `node builder/clean.js`
   * Run a production compilation test: `node builder/build.js`
4. Commit your changes with clear, descriptive commit messages.
5. Push to your fork and submit a PR to the `main` branch.

---

## Local Development Standards

### Code Style Guidelines
* **Backend (Java):** Follow standard Spring Boot and Oracle Java conventions. Use clear, descriptive class/method names and Javadoc comments for API surfaces.
* **Frontend (React + JavaScript):** Use modern functional components, standard React Hooks, and clean CSS styling. Write declarative, self-documenting code.
* **Documentation:** Keep documentation, comments, and logs updated to match your changes.

### Git Commit Conventions
We recommend clear commit messages to help maintain clean history:
* Use the imperative mood (e.g., `add packaging builder`, `fix duplicate file upload`).
* Reference issues in the commit message or PR description (e.g., `Closes #12`).
