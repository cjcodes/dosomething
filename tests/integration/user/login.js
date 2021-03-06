var testUser;

casper.test.begin('Test that a user can authenticate correctly.', 5, {
  /*
   * Prepare user accounts for tests.
   */
  setUp: function() {
    casper.clearFloodTable();
    testUser = casper.createTestUser();
  },

  /*
   * Delete test user accounts.
   */
  tearDown: function() {
    casper.deleteUser(testUser.uid);
    phantom.clearCookies();
  },

  /*
   * Test that a user can authenticate correctly.
   */
  test: function(test) {
    casper.start(url);

    casper.thenWhenReady(function() {
      // We reference the login link's ID to avoid a crazy selector.
      test.assertExists("#link--login", "Login link exists on page for anonymous user");
    });

    casper.then(function() {
      // Click the login link in the header navigation menu.
      this.click("#link--login");

      // We should see a modal with the login form.
      this.waitUntilVisible("[data-modal]", function() {
        test.assertExists("[data-modal] form[action='/user/login']", "Clicking the login link shows modal login form");
      });
    });

    casper.then(function() {
      // Fill and submit bogus login credentials:
      this.fill('form[action="/user/login"]', {
        name: 'incorrect@example.com',
        pass: 'zzzzz'
      }, true);

      // We should get a specific error message.
      casper.waitForSelector('.messages', function() {
        test.assertSelectorHasText("div.error", "unrecognized username or password", "Error message appears after submitting invalid credentials");
      });
    });

    casper.thenOpenWhenReady(url, function() {
      // Now let's go back home and login using the login modal.
      this.waitUntilVisible("#link--login", function() {
        this.click("#link--login");
      });
      
      // We should see a modal with the login form.
      this.waitUntilVisible("[data-modal]", function() {
        this.fill('form[action="/user/login"]', {
          name: testUser.email,
          pass: testUser.password
        }, true);
      });

      this.waitUntilVisible(".navigation__dropdown", function() {
        test.assertExists(".navigation__dropdown", "User dropdown is shown for logged in users");
      });
    });

    casper.thenOpenWhenReady(url, function() {
      // Let's log out using the logout button.
      this.click(".navigation__dropdown-toggle");
      this.click("#link--logout");

      this.waitUntilVisible("#link--login", function() {
        test.assertExists("#link--login", "Login link is shown again after logging out");
      });
    });

    casper.run(function() {
      test.done();
    });
  }
});

