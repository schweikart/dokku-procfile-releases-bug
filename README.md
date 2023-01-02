# Dokku Procfile releases bug
This repo demonstrates a bug in the execution of release scripts in conjunction
with the
[`heroku-community/multi-procfile`](https://github.com/heroku/heroku-buildpack-multi-procfile)
buildpack.

While Heroku runs the `release` script from `express-app/Procfile` (if
instructed through the `multi-procfile` buildpack as shown below), dokku
runs the `release` script from the `Procfile` at the root of the repository,
ignoring the `Procfile` copied by the buildpack.

In contradiction to this divergence, both Heroku and dokku will execute the
correct `web` script from `express-app/Procfile`, as expected.

Removing the root `Procfile` (see branch `no-procfile`) won't change the
behaviour on Heroku (as expected) but on dokku, a `release` script is found
as indicated by herokuish
```
remote: -----> Discovering process types
remote:        Procfile declares types -> release, web
```
but it is not executed since dokku itself can't find the script
```
remote: -----> Checking for release task
remote:        No release task found, skipping
```

## Dokku
Set up the app as follows:

```bash
# on the dokku server
dokku apps:create procfile-bug
dokku buildpacks:set procfile-bug --index 1 heroku-community/multi-procfile
dokku buildpacks:set procfile-bug --index 2 heroku/nodejs
dokku config:set procfile-bug PROCFILE=express-app/Procfile

# in this repository, make sure to use your own dokku server address
git remote add dokku dokku@dokku.me:procfile-bug
git push dokku
```

This will yield an output like the following:
```
Enumerating objects: 19, done.
Counting objects: 100% (19/19), done.
Delta compression using up to 8 threads
Compressing objects: 100% (16/16), done.
Writing objects: 100% (19/19), 11.67 KiB | 663.00 KiB/s, done.
Total 19 (delta 3), reused 0 (delta 0), pack-reused 0
remote: -----> Set main to DOKKU_DEPLOY_BRANCH.
remote: -----> Cleaning up...
remote: -----> Building procfile-bug from herokuish
remote: -----> Adding BUILD_ENV to build environment...
remote:        BUILD_ENV added successfully
remote:        -----> Warning: Multiple default buildpacks reported the ability to handle this app. The first buildpack in the list below will be used.
remote:               Detected buildpacks: multi nodejs
remote:        -----> Multipack app detected
remote: =====> Downloading Buildpack: https://github.com/heroku/heroku-buildpack-multi-procfile.git
remote: =====> Detected Framework: Multi-procfile
remote:        Copied express-app/Procfile as Procfile successfully
remote:        Using release configuration from last framework (Multi-procfile).
remote:        -----> Discovering process types
remote:        Procfile declares types -> release, web
remote: -----> Releasing procfile-bug...
remote: -----> Checking for predeploy task
remote:        No predeploy task found, skipping
remote: -----> Checking for release task
remote: -----> Executing release task from Procfile: echo "release hook from root procfile should never be called" && exit -1
remote: =====> Start of procfile-bug release task (48dbbd6f5) output
remote:        release hook from root procfile should never be called
remote: =====> End of procfile-bug release task (48dbbd6f5) output
remote:  !     Execution of release task failed: echo "release hook from root procfile should never be called" && exit -1
remote:  !     exit status 1
To dokku.me:procfile-bug
 ! [remote rejected] main -> main (pre-receive hook declined)
error: failed to push some refs to 'dokku.me:procfile-bug'
```

## Heroku
Set up the app as follows:

```bash
heroku apps:create procfile-bug
heroku buildpacks:set --app=procfile-bug --index=1 heroku-community/multi-procfile
heroku buildpacks:set --app=procfile-bug --index=2 heroku/nodejs
heroku config:set --app=procfile-bug PROCFILE=express-app/Procfile

# in this repository
heroku git:remote --app=procfile-bug
git push heroku
```

This will yield an output like the following:
```
Enumerating objects: 19, done.
Counting objects: 100% (19/19), done.
Delta compression using up to 8 threads
Compressing objects: 100% (16/16), done.
Writing objects: 100% (19/19), 11.67 KiB | 2.92 MiB/s, done.
Total 19 (delta 3), reused 0 (delta 0), pack-reused 0
remote: Compressing source files... done.
remote: Building source:
remote: 
remote: -----> Building on the Heroku-22 stack
remote: -----> Using buildpacks:
remote:        1. heroku-community/multi-procfile
remote:        2. heroku/nodejs
remote: -----> Multi-procfile app detected
remote:        Copied express-app/Procfile as Procfile successfully
remote: -----> Node.js app detected
remote:
remote: -----> Creating runtime environment
remote:
remote:        NPM_CONFIG_LOGLEVEL=error
remote:        NODE_VERBOSE=false
remote:        NODE_ENV=production
remote:        NODE_MODULES_CACHE=true
remote:
remote: -----> Installing binaries
remote:        engines.node (package.json):  unspecified
remote:        engines.npm (package.json):   unspecified (use default)
remote:
remote:        Resolving node version 18.x...
remote:        Downloading and installing node 18.12.1...
remote:        Using default npm version: 8.19.2
remote:
remote: -----> Installing dependencies
remote:        Installing node modules
remote:
remote:        added 58 packages, and audited 60 packages in 807ms
remote:
remote:        7 packages are looking for funding
remote:          run `npm fund` for details
remote:
remote:        found 0 vulnerabilities
remote:
remote: -----> Build
remote:
remote: -----> Caching build
remote:        - npm cache
remote:
remote: -----> Pruning devDependencies
remote:
remote:        up to date, audited 60 packages in 438ms
remote:
remote:        7 packages are looking for funding
remote:          run `npm fund` for details
remote:
remote:        found 0 vulnerabilities
remote:
remote: -----> Build succeeded!
remote: -----> Discovering process types
remote:        Procfile declares types -> release, web
remote:
remote: -----> Compressing...
remote:        Done: 42.2M
remote: -----> Launching...
remote:  !     Release command declared: this new release will not be available until the command succeeds.
remote:        Released v4
remote:        https://procfile-bug.herokuapp.com/ deployed to Heroku
remote:
remote: Verifying deploy... done.
remote: Running release command.....
remote:
remote: express-app release script
remote: Waiting for release.... done.
To https://git.heroku.com/procfile-bug.git
 * [new branch]      main -> main
```

## License
(c) 2023 Max Schweikart

MIT-licensed, see [`LICENSE`](./LICENSE).