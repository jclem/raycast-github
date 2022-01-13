# Raycast GitHub

This is a custom Raycast extension I've built for myself for GitHub.

## Installation

For now, you'll need to clone the repository and install it from within Raycast.

```shell
git clone https://github.com/jclem/raycast-github
cd raycast-github
npm install
npm run build
```

Then, from within Raycast with developer mode enabled, import the extension.

### Personal Access Token (PAT)

When attempting to execute the first command from this extension, you'll be prompted to enter a Personal Access Token (PAT). You can generate a PAT on GitHub, by going to:

User settings ➡️ Developer settings ➡️ Personal access tokens ➡️ Generate new token
https://github.com/settings/tokens

1. Add a description to the "Note" field, e.g. "Raycast GitHub"

2. Select the following scopes from the list:
  - [x] **repo**
  - [x] **codespace**

Generate the token and copy and paste it into the Raycast input.

## Commands

### Codespaces

This command allows you to search, open, start, stop, and remove existing Codespaces.

To create new Codespaces, see the "Search Repositories" command below.

#### Actions

- Open the Codespace in VSCode.
- Open the Codespace in a web browser.
- Start the Codespace.
- Stop the Codespace.
- Delete the Codespace.

### Search Code

This allows you to search code on GitHub, for example by entering a query such as "ActiveRecord repo:rails/rails".

#### Actions

- Open the search result in a web browser.
- Open the search result in GitHub.dev. _You can also do this by hitting the "."
  key while highlighting a search result._

### Search Commits

This allows you to search Git commits on GitHub, for example by entering a query
such as "Finally actually fix layout bug".

#### Actions

- Open the commit in a web browser.
- Open the commit in GitHub.dev. _You can also do this by hitting the "."
  key while highlighting a commit._

### Search Issues & Pull Requests

This allows you to search issues and PRs on GitHub.

#### Actions

- Open the issue or PR in a web browser.
- View the full issue or PR body in Raycast.

### Search Repositories

This allows you to search repositories on GitHub.

#### Actions

- Open the repo in a web browser.
- Open the repo readme in Raycast.
- Open the repo issues in a web browser.
- Open the repo pull requests in a web browser.
- Open the repo in GitHub.dev. _You can also do this by hitting the "." key
  while highlighting a repo._
- Open or create a Codespace for the repo. _This will try and find an existing
  Codespace and open it, or it will create a new Codespace and open it._

### Search Users

This allows you to search users on GitHub.

#### Actions

- Open the user's profile in a web browser.
- View the user's profile readme in Raycast.
