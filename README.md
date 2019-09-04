# github-mergerine

> Merging as easy as a hot knife through margarine.

[![npm](https://img.shields.io/npm/v/github-mergerine.svg)](https://www.npmjs.com/package/github-mergerine)
[![Travis](https://img.shields.io/travis/mergerine/github-mergerine.svg)](https://github.com/mergerine/github-mergerine)

A GitHub bot to automatically merge pull requests (PRs) matching certain search query, once passing status and approved by user with write permisssions to base branch, if matches configured labels, etc.

Helps resolve contention in large applications due to the serialization of merges and long continuous integration jobs.

## Usage

[![npm install -g github-mergerine (copy)](https://copyhaste.com/i?t=npm%20install%20-g%20github-mergerine)](https://copyhaste.com/c?t=npm%20install%20-g%20github-mergerine 'npm install -g github-mergerine (copy)')

or:

[![yarn global add github-mergerine (copy)](https://copyhaste.com/i?t=yarn%20global%20add%20github-mergerine)](https://copyhaste.com/c?t=yarn%20global%20add%20github-mergerine 'yarn global add github-mergerine (copy)')

or use `npx` ([see below](#cli)).

### Configure

Mergerine can be configured variously with environment variables and/or a configuration file.

#### Configuration file

Example: [`mergerine.example.json`](https://unpkg.com/github-mergerine/mergerine.example.json)

##### `token`

`String` Optional.

GitHub API token to use for read/write operations.

Overridden by environment variable `MERGERINE_GITHUB_TOKEN`.

##### `dry`

`Boolean` Optional. Default: `false`

Whether or not to actually merge or do any write operations.

Overridden by environment variable `MERGERINE_DRY`.

##### `interval`

`Number|String` Optional. Default: `2 min`

The poll interval - how often to check for pull requests.
Supports an integer as milliseconds or a human duration format supported by [timestring][timestring],
such as "2 min" or "1m 30secs" or "1 hr 25m 18s".

Overridden by environment variable `MERGERINE_INTERVAL`.

##### `deleteBranchAfterMerge`

`Boolean` Optional. Default: `false`

Whether to delete pull request branches after merging.

Overridden by environment variable `MERGERINE_DELETE_BRANCH_AFTER_MERGE`.

##### `mergeCommitMessageSimple`

`Boolean` Optional. Default `false`.

Whether to override the default GitHub merge commit message with a simple one
with the format `${pull.title} (#${pull.number})`.

##### `commitlint`

`Object` Optional.

A commitlint configuration if you want to ensure pull request titles match a pattern,
since they become the merge commit message with `mergeCommitMessageSimple`.

##### `repos`

`Array` Required.

A list of repositories to manage.

###### `repos[].baseUrl`

`String` Optional. Default: `https://api.github.com`

Base URL for the API endpoint of your GitHub host, e.g., `https://github.example.com/api/v3`.

###### `repos[].owner`

`String` Required.

Owner (user or organization) of the repository.

###### `repos[].name`

`String` Required.

Name of the repository.

###### `repos[].query`

`String` Required.

A GitHub search query to generate the initial list of pull requests to consider.

Example:

```
"repo:your-owner/your-repo is:pr is:open review:approved label:merge -label:\"no merge\" base:master"
```

Supports additional special syntax for relative dates (note the minus sign for past)
using, e.g., `${date(-2w)}`, with [timestring][timestring] syntax:

```
"created:<${date(-2d)} updated:<${date(-4w)}"
```

See:

* https://help.github.com/articles/understanding-the-search-syntax
* https://developer.github.com/v3/search/#search-issues

###### `repos[].labels`

`Array<String>` Optional.

Labels to require before considering pull requests.

###### `repos[].notLabels`

`Array<String>` Optional.

Labels with which to exclude pull requests.

###### `repos[].priorityLabels`

`Array<String>` Optional.

Labels with which to prioritize pull requests at the front of the queue.

###### `repos[].sort`

`"created"|"updated"` Optional. Default: `"created"`

Date field by which to sort the pull requests, which direction in `repos[].direction`.

###### `repos[].direction`

`"asc"|"desc"` Optional. Default: `"desc"`

Direction which to sort the pull requests, given `repos[].sort`.
Defaults to last in, first out - latest are merged first.

###### `repos[].merge_method`

`"merge"|"squash"|"rebase"` Optional. Default: `"merge"`

Merge method to use, per https://developer.github.com/v3/pulls/#input-2.

###### `repos[].phases`

Repo-level override for [phases](#phases).

###### `repos[].mergeCommitMessageSimple`

Repo-level override for [mergeCommitMessageSimple](#mergeCommitMessageSimple).

##### `logDataUrlPattern`

`String` Optional. Default: `undefined`

A regular expression string to match URLs for which to use full request/response logging.

##### `phases`

`Array<String>` Optional: Default `["merge", "update"]`.

Controls which phases are run - use this to disable either updating or merging,
if you only want one or the other of these behaviors.

##### `health`

`Boolean|Number` Optional. Default `undefined`.

Setting this to a port number (or to `true` or `0` for automatic port selection)
will, when polling, start server to expose a health endpoint at `/health` that will,
when the running instance is operating normally, respond with HTTP 200 and body:

```js
{"status":"pass"}
```

which is of content type `application/health+json` per the [IETF RFC](https://tools.ietf.org/id/draft-inadarei-api-health-check-01.html).

This can be used by systems hosting or managing a mergerine instance
to ping to check that it is still running and hasn't crashed.

#### Environment variables

```
# Required (if not in configuration file):
export MERGERINE_GITHUB_TOKEN=ABCDEFGHIJLMNOPQRSTUVWXYZ123

# Optional, config path, default="./mergerine.json", for example see below:
export MERGERINE_CONFIG=/path/to/your/config/mergerine.json

# Optional, number of milliseconds for poll interval, default=120000 (2 minutes):
#  (also supports human durations like "2min" or "1 hour" via https://www.npmjs.com/package/timestring)
export MERGERINE_INTERVAL=120000

# Optional, dry mode, if "true" then don't actually execute decision, default=undefined:
export MERGERINE_DRY=true

# Optional, for logs:
export DEBUG=mergerine:*
```

### CLI

If you installed globally, or have local node modules bin in your `PATH`, you can use this command to start polling:

```
mergerine
```

or use `npx` so you don't have to explicitly install globally:

```
npx github-mergerine
```

To configure inline:

```
MERGERINE_GITHUB_TOKEN=ABCDEFGHIJLMNOPQRSTUVWXYZ123 mergerine
```

### API

This will simply start polling immediately. We may expose other methods in the future.

```
import mergerine from 'github-mergerine'

// now running...
```

## TODO

* add branch whitelist/blacklist for pull list mode (already supported in search mode)
* add status checks in pull list mode (already supported in search mode)
* token per repo in config
* dry mode per repo in config
* additional sorting/prioritization options

[timestring]: https://www.npmjs.com/package/timestring
