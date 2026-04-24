# Hint 03 — Lab 04 (quasi-solution)

```yaml
name: Claude PR Review
on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  review:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }

      - name: Claude review
        id: review
        uses: anthropics/claude-code-action@v1
        with:
          prompt: |
            Review cette PR vs la base. Produis UNIQUEMENT du JSON :
            {"score": 0-10, "summary": "...", "comments": ["..."]}
          allowed_tools: "Read,Grep,Glob,Bash(git diff:*)"
          model: "claude-sonnet-4-6"
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

      - name: Parse + comment
        id: parse
        run: |
          payload='${{ steps.review.outputs.result }}'
          echo "$payload" | jq '.' > verdict.json
          score=$(jq -r .score verdict.json)
          echo "score=$score" >> "$GITHUB_OUTPUT"
          {
            echo "## Claude PR Review — score $score/10"
            echo
            jq -r .summary verdict.json
            echo
            echo "### Commentaires"
            jq -r '.comments[] | "- " + .' verdict.json
          } > body.md
          gh pr comment ${{ github.event.pull_request.number }} --body-file body.md
        env:
          GH_TOKEN: ${{ github.token }}

      - name: Gate on score
        if: ${{ steps.parse.outputs.score && steps.parse.outputs.score != '' }}
        run: |
          if [ "${{ steps.parse.outputs.score }}" -lt 7 ]; then
            echo "::error::Score ${{ steps.parse.outputs.score }} < 7 — merge bloqué."
            exit 1
          fi
```
