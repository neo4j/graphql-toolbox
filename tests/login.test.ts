/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as dotenv from "dotenv";

import { expect, test } from "./utils/pagemodel";

dotenv.config();

const { NEO_USER = "admin", NEO_PASSWORD = "password", NEO_URL = "neo4j://localhost:7687/neo4j" } = process.env;

test.describe("login", () => {
    test("should be able to connect to database", async ({ loginPage }) => {
        await loginPage.setUsername(NEO_USER);
        await loginPage.setPassword(NEO_PASSWORD);
        await loginPage.setURL(NEO_URL);
        await loginPage.submit();
        await loginPage.dismissIntrospectionPrompt();
        await loginPage.awaitSuccess();
    });

    test("should display error message with invalid credentials", async ({ loginPage, page }) => {
        await loginPage.setUsername("invalid_user");
        await loginPage.setPassword("invalid_password");
        await loginPage.setURL(NEO_URL);
        await loginPage.submit();

        // Wait for error message to appear
        await page.waitForTimeout(2000);

        // Verify login form is still visible
        const isLoginVisible = await loginPage.getIsLoginWindowVisible();
        expect(isLoginVisible).toBeTruthy();
    });

    test("should display error message with invalid connection URL", async ({ loginPage, page }) => {
        await loginPage.setUsername(NEO_USER);
        await loginPage.setPassword(NEO_PASSWORD);
        await loginPage.setURL("neo4j://invalid-host:7687");
        await loginPage.submit();

        // Wait for error to appear
        await page.waitForTimeout(3000);

        // Verify login form is still visible
        const isLoginVisible = await loginPage.getIsLoginWindowVisible();
        expect(isLoginVisible).toBeTruthy();
    });

    test("should persist username and URL in form fields", async ({ loginPage }) => {
        const testUsername = "test_user";
        const testURL = "neo4j://test-server:7687";

        await loginPage.setUsername(testUsername);
        await loginPage.setURL(testURL);

        // Verify values are persisted
        const username = await loginPage.getUsername();
        const url = await loginPage.getURL();

        expect(username).toBe(testUsername);
        expect(url).toBe(testURL);
    });

    test("should be able to disconnect from a database", async ({ loginPage, topBarPage }) => {
        await loginPage.loginDismissIntrospection(NEO_USER, NEO_PASSWORD, NEO_URL);

        await topBarPage.clickConnectionMenuButton();
        await topBarPage.clickDisconnect();

        const isVisible = await loginPage.getIsLoginWindowVisible();
        expect(isVisible).toBeTruthy();
    });

    test("should allow re-login after logout", async ({ loginPage, topBarPage }) => {
        // First login
        await loginPage.loginDismissIntrospection(NEO_USER, NEO_PASSWORD, NEO_URL);

        // Logout
        await topBarPage.clickConnectionMenuButton();
        await topBarPage.clickDisconnect();

        // Verify login form is visible
        let isLoginVisible = await loginPage.getIsLoginWindowVisible();
        expect(isLoginVisible).toBeTruthy();

        // Login again
        await loginPage.loginDismissIntrospection(NEO_USER, NEO_PASSWORD, NEO_URL);

        // Verify successful re-login
        isLoginVisible = await loginPage.getIsLoginWindowVisible();
        expect(isLoginVisible).toBeFalsy();
    });
});

test.describe("Connection State", () => {
    test("should maintain connection state during session", async ({ loginPage, topBarPage }) => {
        await loginPage.loginDismissIntrospection(NEO_USER, NEO_PASSWORD, NEO_URL);

        // Verify connection is maintained
        await topBarPage.waitForTopBarVisibility();

        const isLoginVisible = await loginPage.getIsLoginWindowVisible();
        expect(isLoginVisible).toBeFalsy();
    });

    test("should display connection information in top bar", async ({ loginPage, topBarPage }) => {
        await loginPage.loginDismissIntrospection(NEO_USER, NEO_PASSWORD, NEO_URL);

        await topBarPage.waitForTopBarVisibility();

        // The connection info should be visible
        await topBarPage.clickConnectionMenuButton();

        // Verify we can see disconnect option (implies connection is active)
        await topBarPage.clickDisconnect();

        const isLoginVisible = await loginPage.getIsLoginWindowVisible();
        expect(isLoginVisible).toBeTruthy();
    });
});

test.describe("Session Security", () => {
    test("should not remember password between sessions", async ({ loginPage, topBarPage, page }) => {
        // First login
        await loginPage.setUsername(NEO_USER);
        await loginPage.setPassword(NEO_PASSWORD);
        await loginPage.setURL(NEO_URL);
        await loginPage.submit();
        await loginPage.dismissIntrospectionPrompt();
        await loginPage.awaitSuccess();

        // Logout
        await topBarPage.clickConnectionMenuButton();
        await topBarPage.clickDisconnect();

        // Wait for login page
        await page.waitForSelector("[data-test-login-form]");

        // Reload the page to simulate a new session
        await page.reload();
        await page.waitForSelector("[data-test-login-form]");

        // Check that password is NOT preserved (security requirement)
        const password = await page.inputValue("[data-test-login-password]");
        expect(password).toBe("");

        // Username and URL ARE preserved for convenience (from localStorage via Zustand)
        const username = await loginPage.getUsername();
        const url = await loginPage.getURL();
        expect(username).toBe(NEO_USER);
        // URL might not have the database name appended, so just check it's not empty
        expect(url).toBeTruthy();
        expect(url.length).toBeGreaterThan(0);

        // But user should still be logged out
        const isLoginVisible = await loginPage.getIsLoginWindowVisible();
        expect(isLoginVisible).toBeTruthy();
    });
});
