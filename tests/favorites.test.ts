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

import { expect } from "@playwright/test";
import * as dotenv from "dotenv";

import { test } from "./utils/pagemodel";

dotenv.config();

const { NEO_USER = "admin", NEO_PASSWORD = "password", NEO_URL = "neo4j://localhost:7687/neo4j" } = process.env;

test.describe("favorites", () => {
    test("should rename and reorder favorites, announcing each drag step", async ({
        page,
        loginPage,
        schemaEditorPage,
    }) => {
        await loginPage.loginDismissIntrospection(NEO_USER, NEO_PASSWORD, NEO_URL);

        await schemaEditorPage.setTypeDefs("type Alpha @node { a: String }");
        await page.click("[data-test-schema-editor-favourite-button]");
        await schemaEditorPage.setTypeDefs("type Beta @node { b: String }");
        await page.click("[data-test-schema-editor-favourite-button]");

        const rows = page.locator("ul.h-favorite > div");
        await expect(rows).toHaveCount(2);

        await rows.nth(0).hover();
        await rows.nth(0).getByRole("button", { name: "Edit favorite name" }).click();
        const input = page.getByLabel("Input for new name for the favorite snippet");
        await input.pressSequentially("renamed");
        await input.press("Enter");
        await expect(rows.nth(0)).toContainText("renamed");
        await expect(rows.nth(1)).toContainText("type Beta");

        const liveRegion = page.locator("[id^=DndLiveRegion]");
        const moveFirstFavoriteDown = async () => {
            await rows.nth(0).hover();
            await rows.nth(0).getByRole("button", { name: "Reorder favorite snippet" }).focus();
            await page.keyboard.press("Space");
            // dnd-kit fires a drag-over for the picked-up item right after pick-up; it must not replace this announcement.
            await expect(liveRegion).toContainText("is in position 1 of 2");
            await page.keyboard.press("ArrowDown");
            await expect(liveRegion).toContainText("was moved into position 2 of 2");
            await page.keyboard.press("Space");
            await expect(liveRegion).toContainText("was dropped at position 2 of 2");
        };

        await moveFirstFavoriteDown();
        await expect(rows.nth(0)).toContainText("type Beta");
        await expect(rows.nth(1)).toContainText("renamed");

        await moveFirstFavoriteDown();
        await expect(rows.nth(0)).toContainText("renamed");
        await expect(rows.nth(1)).toContainText("type Beta");
    });
});
