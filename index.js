const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const VERSION_REGEX = /## \[(.+)] - (.+)/

async function run() {
  const octokit = github.getOctokit(core.getInput("github-token", { required: true }));
  const changelogFile = core.getInput("path")
  const entry = getLatestChangelogEntry(changelogFile)
  const releaseTitle = core.getInput("title-template").replaceAll("{version}", entry.version)
  const releaseTag = core.getInput("tag-template").replaceAll("{version}", entry.version)
  if (!entry) {
    console.log(`Could not find the latest release from ${changelogFile}`)
    return
  }

  try {
    await octokit.rest.repos.getReleaseByTag({
      ...github.context.repo,
      tag: releaseTag
    })
    console.log(`A release already exists for ${releaseTag}, skipping`)
  } catch (error) {
    console.log(`Could not find a GitHub release for ${releaseTag}, creating one`)
    octokit.rest.repos.createRelease({
      ...github.context.repo,
      tag_name: releaseTag,
      name: releaseTitle,
      target_commitish: github.context.sha,
      body: entry.changelog,
      draft: false,
      prerelease: false
    })
  }
}

function getLatestChangelogEntry(changelogFile) {
  if (fs.existsSync(changelogFile)) {
    const content = fs.readFileSync(changelogFile);
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
