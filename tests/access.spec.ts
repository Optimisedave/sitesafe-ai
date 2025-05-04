import { test, expect } from "@playwright/test";

test.describe("Access Control", () => {

  test("should block non-subscriber/logged-out user from accessing dashboard", async ({ page }) => {
    // 1. Ensure user is logged out (or has no active subscription)
    // For this test, we simply navigate directly without logging in.
    // Playwright starts with a clean context (no cookies/session) by default.
    
    // 2. Attempt to navigate directly to the protected dashboard page
    await page.goto("/app");

    // 3. Verify redirection to the sign-in page
    // Wait for the URL to change to the sign-in page.
    await page.waitForURL("**/api/auth/signin**"); // Adjust URL pattern if using custom sign-in page

    // 4. Verify that the sign-in page content is displayed
    await expect(page.locator("h1, h2")).toContainText(/Sign in/i);
    
    // 5. Verify that the dashboard content is NOT displayed
    await expect(page.locator("h1:has-text(\"Dashboard\")")).not.toBeVisible();
  });

  // Add more tests as needed, e.g.:
  // - Test user with expired subscription
  // - Test user during trial period (should have access)
  // - Test different user roles (if implemented)
});

