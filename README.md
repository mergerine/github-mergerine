# github-mergerine

> Merging as easy as a hot knife through margarine.

A GitHub bot to automatically merge pull requests (PRs) matching certain search query, once passing status and approved by user with write permisssions to base branch, if matches configured labels, etc.

Helps resolve contention in large applications due to the serialization of merges and long continuous integration jobs.

**_Work-in-progress._**

## Usage

```
npm install -g github-mergerine
```

or:

```
yarn global add github-mergerine
```

or use `npx` (see below).

### Configure

```
# Required:
export MERGERINE_GITHUB_TOKEN=ABCDEFGHIJLMNOPQRSTUVWXYZ123

# Optional, config path, default="./mergerine.json", for example see below:
export MERGERINE_CONFIG=/path/to/your/config/mergerine.json

# Optional, number of seconds for poll interval, default=120000 (2 minutes):
export MERGERINE_INTERVAL=120000

# Optional, dry mode, if "true" then don't actually execute decision, default=undefined:
export MERGERINE_DRY=true

# Optional, for logs:
export DEBUG=mergerine:*
```

#### Example Configs

* [`mergerine.example.json`](https://unpkg.com/github-mergerine/mergerine.example.json)

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
* some kind of prioritization mechanism beyond chronological by PR number - e.g, "high priority" label, etc.
