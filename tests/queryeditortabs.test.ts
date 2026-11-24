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

import { EDITOR_QUERY_INPUT } from "../src/constants";
import { expect, test } from "./utils/pagemodel";

dotenv.config();

const { NEO_USER = "admin", NEO_PASSWORD = "password", NEO_URL = "neo4j://localhost:7687/neo4j" } = process.env;

test.describe("query editor tabs", () => {
    const typeDefs = /* GraphQL */ `
        type Movie @node {
            id: ID!
        }
    `;

    const queryOne = /* GraphQL */ `
        query MyTest1 {
            movies {
                id
            }
        }
    `;

    const queryTwo = /* GraphQL */ `
        query MyTest2 {
            movies {
                id
            }
        }
    `;

    test("should be able to add a new tab including a query and then remove it again", async ({
        page,
        loginPage,
        schemaEditorPage,
        editorPage,
    }) => {
        await loginPage.loginDismissIntrospection(NEO_USER, NEO_PASSWORD, NEO_URL);

        await schemaEditorPage.setTypeDefs(typeDefs);
        await schemaEditorPage.buildSchema();

        await editorPage.addNewTab();
        await editorPage.setQuery(queryOne);
        await editorPage.closeTabByTabName("MyTest1");

        await expect(page.getByRole("tab", { name: "Unnamed" })).toBeVisible();
        await expect(page.getByRole("tab", { name: "MyTest1" })).not.toBeVisible();
    });

    test("create a tab, set two queries and delete one of them", async ({
        page,
        loginPage,
        schemaEditorPage,
        editorPage,
    }) => {
        await loginPage.loginDismissIntrospection(NEO_USER, NEO_PASSWORD, NEO_URL);

        await schemaEditorPage.setTypeDefs(typeDefs);
        await schemaEditorPage.buildSchema();

        await editorPage.addNewTab();
        await editorPage.setQuery(queryOne);
        await editorPage.selectTabByTabName("Unnamed");
        await editorPage.setQuery(queryTwo);
        await editorPage.closeTabByTabName("MyTest2");

        await expect(page.getByRole("tab", { name: "MyTest1" })).toBeVisible();
        await expect(page.getByRole("tab", { name: "MyTest2" })).not.toBeVisible();
    });

    test("should display typed query in the editor", async ({ loginPage, schemaEditorPage, editorPage }) => {
        await loginPage.loginDismissIntrospection(NEO_USER, NEO_PASSWORD, NEO_URL);

        await schemaEditorPage.setTypeDefs(typeDefs);
        await schemaEditorPage.buildSchema();

        await editorPage.addNewTab();

        const testQuery = `
            query TestQuery {
                movies {
                    id
                }
            }
        `;

        await editorPage.setQuery(testQuery);

        const currentQuery = await editorPage.getQuery();
        expect(currentQuery.replace(/\s/g, "")).toContain("queryTestQuery{movies{id}}");
    });

    // https://github.com/neo4j/graphql-toolbox/issues/9
    test("should not carry an argument from the previous tab's query into a new tab", async ({
        page,
        loginPage,
        schemaEditorPage,
        editorPage,
    }) => {
        await loginPage.loginDismissIntrospection(NEO_USER, NEO_PASSWORD, NEO_URL);

        await schemaEditorPage.setTypeDefs(typeDefs);
        await schemaEditorPage.buildSchema();

        await editorPage.setQuery(`query WithLimit { movies(limit: 10) { id } }`);
        await editorPage.addNewTab();
        await page.locator(`#${EDITOR_QUERY_INPUT} .cm-content`).click();
        // A partial query does not parse, so the explorer falls back to the last query it parsed.
        await page.keyboard.type("query NewTab");

        const currentQuery = await editorPage.getQuery();
        expect(currentQuery.trim()).toBe("query NewTab");
        // The explorer shows nothing of the previous tab's query either.
        await expect(page.locator(".graphiql-explorer-root input[type='text']")).toHaveCount(0);
    });

    test("should keep focus in the query editor when a typed query adds an argument", async ({
        page,
        loginPage,
        schemaEditorPage,
        editorPage,
    }) => {
        await loginPage.loginDismissIntrospection(NEO_USER, NEO_PASSWORD, NEO_URL);

        await schemaEditorPage.setTypeDefs(typeDefs);
        await schemaEditorPage.buildSchema();

        await editorPage.setQuery("");
        await page.locator(`#${EDITOR_QUERY_INPUT} .cm-content`).click();
        // The query parses once "1" is typed (closeBrackets supplies the closing brackets), which
        // shows an input for the argument in the explorer.
        await page.keyboard.type("query Typed { movies(limit: 1) { id } }");

        const currentQuery = await editorPage.getQuery();
        expect(currentQuery.trim()).toBe("query Typed { movies(limit: 1) { id } }");
    });

    test("should not show a closed tab's query in the explorer of the tab that takes its place", async ({
        page,
        loginPage,
        schemaEditorPage,
        editorPage,
    }) => {
        await loginPage.loginDismissIntrospection(NEO_USER, NEO_PASSWORD, NEO_URL);

        await schemaEditorPage.setTypeDefs(typeDefs);
        await schemaEditorPage.buildSchema();

        await editorPage.setQuery(`query WithLimit { movies(limit: 10) { id } }`);
        await editorPage.addNewTab();
        await editorPage.setQuery("query NewTab");
        await editorPage.selectTabByTabName("WithLimit");
        // Closing the active first tab makes the other tab active at the same index.
        await editorPage.closeTabByTabName("WithLimit");

        await expect(page.getByRole("tab", { name: "WithLimit" })).not.toBeVisible();
        expect((await editorPage.getQuery()).trim()).toBe("query NewTab");
        await expect(page.locator(".graphiql-explorer-root input[type='text']")).toHaveCount(0);
    });

    test("should not move focus into the explorer when switching to a tab whose query has an argument", async ({
        page,
        loginPage,
        schemaEditorPage,
        editorPage,
    }) => {
        await loginPage.loginDismissIntrospection(NEO_USER, NEO_PASSWORD, NEO_URL);

        await schemaEditorPage.setTypeDefs(typeDefs);
        await schemaEditorPage.buildSchema();

        await editorPage.setQuery(`query First { movies(limit: 10) { id } }`);
        await editorPage.addNewTab();
        await editorPage.setQuery(`query Second { movies(limit: 5) { id } }`);
        await editorPage.selectTabByTabName("First");

        await expect(page.locator(".graphiql-explorer-root input[type='text']")).toHaveValue("10");
        await expect(page.locator(".graphiql-explorer-root input:focus")).toHaveCount(0);
    });

    test("should focus the input of an argument added in the explorer", async ({
        page,
        loginPage,
        schemaEditorPage,
        editorPage,
    }) => {
        await loginPage.loginDismissIntrospection(NEO_USER, NEO_PASSWORD, NEO_URL);

        await schemaEditorPage.setTypeDefs(typeDefs);
        await schemaEditorPage.buildSchema();

        await editorPage.setQuery(`query AddArg { movies { id } }`);
        await page.locator(".graphiql-explorer-root [data-arg-name='limit'] > span").first().click();

        await expect(page.locator(".graphiql-explorer-root input:focus")).toHaveCount(1);
        expect((await editorPage.getQuery()).replace(/\s/g, "")).toContain("movies(limit:");
    });
});
