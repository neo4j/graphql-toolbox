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

test.describe("variables editor", () => {
    const typeDefs = /* GraphQL */ `
        type Movie @node {
            id: ID!
        }
    `;

    const query = /* GraphQL */ `
        query MyTest1 {
            movies {
                id
            }
        }
    `;

    test("should display typed variables in the editor", async ({ loginPage, schemaEditorPage, editorPage }) => {
        await loginPage.loginDismissIntrospection(NEO_USER, NEO_PASSWORD, NEO_URL);
        await schemaEditorPage.setTypeDefs(typeDefs);
        await schemaEditorPage.buildSchema();
        await editorPage.addNewTab();
        await editorPage.setQuery(query);

        const testVariables = '{ "id": "123", "name": "The Matrix" }';
        await editorPage.setParams(testVariables);
        const currentVariables = await editorPage.getParams();
        expect(currentVariables.replace(/\s/g, "")).toContain('"id":"123","name":"TheMatrix"');
    });

    test("variables editor prettifies JSON correctly", async ({ loginPage, schemaEditorPage, editorPage }) => {
        await loginPage.loginDismissIntrospection(NEO_USER, NEO_PASSWORD, NEO_URL);
        await schemaEditorPage.setTypeDefs(typeDefs);
        await schemaEditorPage.buildSchema();
        await editorPage.addNewTab();
        await editorPage.setQuery(query);

        const uglyJson = '{"id":1,"name":"Test"}';
        await editorPage.setParams(uglyJson);
        await editorPage.prettifyVariables();
        const prettyJson = await editorPage.getParams();
        expect(prettyJson).toMatch(/\s+"id": 1,?\s+"name": "Test"/);
    });
});
