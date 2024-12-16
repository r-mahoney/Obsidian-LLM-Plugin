#!/bin/bash

# Read version from versions.json (get the first key)
version=$(cat versions.json | jq -r 'keys[0]')

# Create and push tag
git tag -a "$version" -m "$version"
git push origin "$version"

echo "Created and pushed tag: $version" 