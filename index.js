const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const CHANGELOG_FILE = 'CHANGELOG.md'
const VERSION_REGEX = /## \[(.+)] - (.+)/

async function run() {
  const octokit = github.getOctokit(core.getInput("github-token"));
  const entry = getLatestChangelogEntry()
  if (!entry) {
    console.log(`Could not find the latest release from ${CHANGELOG_FILE}`)
    return
  }

  try {
    await octokit.repos.getReleaseByTag({
      ...github.context.repo,
      tag: entry.version
    })
    console.log(`A release already exists for ${entry.version}, skipping`)
  } catch (error) {
    console.log(`Could not find a GitHub release for ${entry.version}, creating one`)
    octokit.repos.createRelease({
      ...github.context.repo,
      tag_name: entry.version,
      name: entry.version,
      target_commitish: github.context.sha,
      body: entry.changelog,
      draft: false,
      prerelease: false
    })
  }
}

function getLatestChangelogEntry() {
  if (fs.existsSync(CHANGELOG_FILE)) {
    const content = fs.readFileSync(CHANGELOG_FILE);
    const entry = {
      version: "",
      changelog: ""
    }
    let inLatestEntry = false
    for (const line of content.toString().split(/\r?\n/)) {
      const result = line.match(VERSION_REGEX)
      if (result) {
        if (!inLatestEntry) {
          // Started reading the latest entry
          inLatestEntry = true;
          entry.version = result[1];
        } else {
          break;
        }
      } else if (inLatestEntry) {
        entry.changelog += line + "\n";
      }
    }
    return entry;
  }
}


run().catch(error => {
  core.setFailed(error)
});
