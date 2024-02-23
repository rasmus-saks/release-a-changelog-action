# Release-a-Changelog action
This GitHub action creates a release based on your `CHANGELOG.md` file. 
You must use [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format or this will not work.

A release is created every time a new version header is added to your `CHANGELOG.md` file. The content of the release is the entire text up to the next version header (the previously released version).
```markdown
## [<version>] - yyyy-mm-dd
<content>

## [<previous version>] - yyyy-mm-dd
```



# Installation

Add the following to a new `.github/workflows/release_a_changelog.yml` file (or as part of your existing workflow):
```yaml
name: Release a Changelog

on:
  push:
    branches:
      - master

jobs:
  release_a_changelog:
    name: Release a Changelog
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Release a Changelog
        uses: rasmus-saks/release-a-changelog-action@v1.2.0
        with:
          github-token: '${{ secrets.GITHUB_TOKEN }}'
          # Optional - path to your changelog file. Defaults to 'CHANGELOG.md'
          path: 'path/to/my/CHANGELOG.md'
          # Optional - format of the release title. Defaults to '{version}'
          title-template: 'My Project {version}'
          # Optional - format of the release tag. Defaults to '{version}'
          tag-template: 'my-project-{version}'
```

> :warning: Make sure you have a `checkout` action before `release-a-changelog`, otherwise it won't be able to read your `CHANGELOG.md` file

## Multi-project setup

Use the `title-template` and `tag-template` inputs to define the format of the release title and tag for each separate project in your repository.
Use `{version}` as a placeholder for the version number.

> :warning: Make sure the `tag-template` is unique for each project in the repository, otherwise releases may clash with each other.

```yaml
name: Release a Changelog

on:
  push:
    branches:
      - master

jobs:
  release_a_changelog:
    name: Release a Changelog
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Release a Changelog
        uses: rasmus-saks/release-a-changelog-action@v1.2.0
        with:
          github-token: '${{ secrets.GITHUB_TOKEN }}'
          path: 'my-sub-project/CHANGELOG.md'
          title-template: 'My Sub Project {version}'
          tag-template: 'my-sub-project-{version}'
```


# Usage
1. Add a new version to `CHANGELOG.md` according to [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
2. Push/merge to master
3. ???
4. Profit
