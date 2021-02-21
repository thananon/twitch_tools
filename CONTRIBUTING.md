# Contributing to 9ArmBot

We would love for you to contribute to 9ArmBot and help make it even better than it is
today! As a contributor, here are the guidelines we would like you to follow:

 - [Submitting a Pull Request (PR)](#submit-pr)

### <a name="submit-pr"></a> Submitting a Pull Request (PR)
Before you submit your Pull Request (PR) consider the following guidelines:
#### Type
Must be one of the following:

* **docs**: Documentation only changes
* **feat**: A new feature
* **fix**: A bug fix
* **perf**: A code change that improves performance
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
##
* Search [GitHub](https://github.com/thananon/twitch_tools/pulls) for an open or closed PR
  that relates to your submission. You don't want to duplicate effort.
* Make your changes in a new git branch:

     ```shell
     git checkout -b fix/my-fix-branch main
     ```
* Commit your changes using a descriptive commit message that follows our
  [commit message conventions](#commit).

     ```shell
     git commit -a
     ```
  Note: the optional commit `-a` command line option will automatically "add" and "rm" edited files.

* Push your branch to GitHub:

    ```shell
    git push origin fix/my-fix-branch
    ```

* In GitHub, send a pull request to `twitch_tools:main`.
* If we suggest changes then:
  * Make the required updates.
  * Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

    ```shell
    git rebase main -i
    git push -f
    ```

That's it! Thank you for your contribution!

#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes
from the main (upstream) repository:

* Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

    ```shell
    git push origin --delete fix/my-fix-branch
    ```

* Check out the master branch:

    ```shell
    git checkout main -f
    ```

* Delete the local branch:

    ```shell
    git branch -D fix/my-fix-branch
    ```

* Update your master with the latest upstream version:

    ```shell
    git pull --ff upstream master
    ```


## <a name="commit"></a> Commit Message Guidelines

```
docs(changedocs): update change README.md
```
```
fix(release): need to depend on latest axios
```
