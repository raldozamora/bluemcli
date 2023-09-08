#!/bin/bash  -v
echo "Updating src/config/config.ts"
NEW_PACKAGE_VERSION=$(jq '.version' package.json)
echo "NEW_PACKAGE_VERSION : $NEW_PACKAGE_VERSION"
sed -i "s/'VERSION_VALUE_TO_BE_REPLACED_BEFORE_BUILD_TIME'/$NEW_PACKAGE_VERSION/" src/config/config.ts
