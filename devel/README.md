# Development script

This directory contains scripts useful for Agama development.

## Git autosubmission to OBS

The [branch2obs.sh](./branch2obs.sh) script creates an OBS project and configures the GitHub Actions
for submission.

### Used tools

The script requires the `git`, `gh`, `jq` and `osc` command line tools to be installed. The `osc`
and `gh` tools need to be configured/authenticated against OBS respective GitHub. Do not worry the
script checks for that.

### GitHub configuration

TODO:

var

`https://github.com/<user>/agama/settings/variables/actions/new`
`gh -R <user>/agama variable set OBS_USER --body <OBS_USER>`


secret

`https://github.com/<user>/agama/settings/secrets/actions/new`
`gh -R <user>/agama secret set OBS_PASSWORD`

### Testing builds

TODO:

### Release builds

TODO:
