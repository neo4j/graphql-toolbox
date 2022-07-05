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

import { toGraphQLTypeDefs } from "@neo4j/introspector";
import * as neo4j from "neo4j-driver";
import { test, describe, expect, beforeAll, afterAll } from "./utils/pagemodel";

const { NEO_USER = "admin", NEO_PASSWORD = "password", NEO_URL = "neo4j://localhost:7687/neo4j" } = process.env;

describe("introspection", () => {
    let driver: neo4j.Driver;

    beforeAll(async () => {
        driver = neo4j.driver(NEO_URL, neo4j.auth.basic(NEO_USER, NEO_PASSWORD));
    });

    afterAll(async () => {
        await driver.close();
    });

    test("should introspect database and output result", async ({ page, loginPage, schemaEditorPage }) => {
        await loginPage.login();

        const sessionFactory = () => driver?.session({ defaultAccessMode: neo4j.session.WRITE }) as neo4j.Session;
        const session = await sessionFactory();

        try {
            await session.run(`
                CALL {
                    MATCH (a)
                    DETACH DELETE a
                    RETURN "x"
                }
                CALL {
                    CREATE (:Movie { id: randomUUID() })
                    RETURN "y"
                }
                RETURN "z"
            `);
        } finally {
            await session.close();
        }

        await schemaEditorPage.introspect();
        await page.waitForTimeout(2000);
        const generatedTypeDefs = await schemaEditorPage.getTypeDefs();

        const actualTypeDefs = await toGraphQLTypeDefs(sessionFactory);

        expect(generatedTypeDefs).toEqual(actualTypeDefs);
    });
});