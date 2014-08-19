#!/bin/bash

# ==============================================================================
# BEFORE TESTS
# Tasks to run before functional testing.
# ==============================================================================

printf "\033[1;33mPerforming pre-test steps...\033[00m\n"

cd $WEB_PATH

# Clear out localhost from flood table (prevents "more than 5 failed login attempts" error)
echo "Clearing localhost from flood table..."
drush sql-query "DELETE FROM flood WHERE identifier LIKE '%127.0.0.1';"

# Create fresh test accounts
drush_get_uid_from_email() {
  drush user-information $1 | grep "User ID" | sed -e 's/[ ]*User ID[ ]*\:[ ]*//g' | sed -e 's/[ ]*//g'
}

drush_create_test_user() {
  USERNAME=$1
  drush user-create $USERNAME --mail="$USERNAME@example.com" --password="$USERNAME"
}

drush_delete_user_with_email() {
  uid=$(drush_get_uid_from_email $1)
  {
    if [[ $uid -ne 0 ]]
    then
      drush user-cancel "$uid" -y --quiet
    fi
  } &> /dev/null
}

drush_signup_user() {
  uid=$(drush_get_uid_from_email $2)
  drush php-eval "dosomething_signup_create($1, $uid)"
}

drush_create_campaign() {
  drush campaign-create ../tests/fixtures/$1 | sed -e 's/Created node nid //g' | sed -e 's/\.//g'
}

echo "Deleting nodes created during previous test runs..."
drush test-node-delete

echo "Deleting users created during previous test runs..."
drush_delete_user_with_email QA_TEST_ACCOUNT@example.com
drush_delete_user_with_email QA_TEST_USER_REGISTER@example.com
drush_delete_user_with_email QA_TEST_CAMPAIGN_SIGNUP_EXISTING@example.com 
drush_delete_user_with_email QA_TEST_CAMPAIGN_SIGNUP_NEW@example.com
drush_delete_user_with_email QA_TEST_CAMPAIGN_ACTION@example.com

echo "Making fresh test accounts..."
drush_create_test_user QA_TEST_ACCOUNT
drush_create_test_user QA_TEST_CAMPAIGN_SIGNUP_EXISTING
drush_create_test_user QA_TEST_CAMPAIGN_ACTION

echo "Creating test campaign node from 'campaign.json' fixture..."
export CAMPAIGN_NID=$(drush_create_campaign campaign.json)

echo "Creating some extra campaign nodes to show as related..."
drush_create_campaign campaign.json &> /dev/null
drush_create_campaign campaign.json &> /dev/null
drush_create_campaign campaign.json &> /dev/null

echo "Signing action page test account up for test campaign..."
drush_signup_user $CAMPAIGN_NID QA_TEST_CAMPAIGN_ACTION@example.com