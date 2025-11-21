# Privacy Policy for OPFS Explorer

**Last Updated:** November 21, 2025

This Privacy Policy describes how **OPFS Explorer** ("we", "us", or "our") handles your information when you use our browser extension.

## 1. Data Collection and Usage
**We do not collect, store, or transmit any personal data.**

*   **Local Processing:** The extension operates entirely locally within your browser's Developer Tools environment.
*   **No Analytics:** We do not use any third-party analytics services to track your usage.
*   **No Remote Servers:** The extension does not communicate with any external servers. All file operations (reading, writing, listing) happen directly on your device between the extension and the specific web page you are inspecting.

## 2. Permissions
To function correctly, OPFS Explorer requires specific permissions:

*   **`activeTab`:** Used solely to inject a content script into the specific tab you are inspecting. This script acts as a bridge to access the Origin Private File System (OPFS) API of that page. It runs only when you explicitly open the DevTools panel.
*   **`clipboardWrite`:** Used solely to allow you to copy file paths or file contents to your clipboard upon your request.
*   **Host Permissions (`<all_urls>`):** Required to allow the extension to work on any website you choose to inspect during your development workflow (including `localhost`, staging environments, etc.).

## 3. Changes to This Policy
We may update this Privacy Policy from time to time. Since we do not collect user contact information, we encourage you to review this page periodically for any changes.

## 4. Contact Us
If you have any questions about this Privacy Policy, please contact us via our GitHub repository.
