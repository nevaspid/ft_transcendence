To maintain consistency regarding __commits__ and __branch__ usage.

---
## Commit Rules

We strictly use [conventionnal commit](https://www.conventionalcommits.org/en/v1.0.0/#summary) as a reference to ensure ensure the commit history is easier to read.

## Mandatory commit message structure

```sh
<type>: <description>

[optional body]
```
__type__: Indicates the nature of the commit:
- `feature/feat`:	to implement a new feature
- `fix`:	to fix a bug or a typo
- `docs`:	to make documentation changes
- `refactor`: refactoring code without changing functionality
- `test`: adding or modifying tests
- `chore`: miscellaneous tasks that do not affect the production code

Each commit should ideally contain a __single__, __coherant__ change.


## Branching Rules

We use the following branching model:
- `main`: the main branch, always stable and deployable
- `dev`: the development branch, where all the features are merged
- `feature/...`: a branch for a new feature
- `bugfix/...[/#issue]`: a branch for a bug fix
- `hotfix/...[/#issue]`: a branch for a critical bug fix
- `chore/...`: a branch for miscellaneous tasks
- `docs/...`: a branch for documentation changes
- `experiment/...`: a branch for experiments
