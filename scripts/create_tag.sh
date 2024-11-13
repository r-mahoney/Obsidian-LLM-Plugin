#!/bin/bash

# Get the most recent tag
latest_tag=$(git describe --tags --abbrev=0)

# Extract the base version and rc number
base_version=$(echo $latest_tag | cut -d'-' -f1)
rc_num=$(echo $latest_tag | grep -o 'rc[0-9]*' | grep -o '[0-9]*')

# Increment rc number
new_rc=$((rc_num + 1))

# Create new tag
new_tag="${base_version}-rc${new_rc}"

# Create and push tag
git tag -a $new_tag -m "$new_tag"
git push origin $new_tag

echo "Created and pushed tag: $new_tag" 