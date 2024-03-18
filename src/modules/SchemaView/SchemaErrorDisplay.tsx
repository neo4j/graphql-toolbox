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

import { Banner } from "@neo4j-ndl/react";

import { useSessionStore } from "../../store/session";

export const SchemaErrorDisplay = () => {
    const schemaViewError = useSessionStore((state) => state.schemaViewError);

    if (!schemaViewError) {
        return null;
    }

    const errors = Array.isArray(schemaViewError) ? schemaViewError : [schemaViewError];

    return (
        <Banner
            icon
            closeable
            onClose={() => useSessionStore.getState().setSchemaViewError(null)}
            type="danger"
            title="Errors"
        >
            <ol>
                {errors.map((error, index) => (
                    <li key={index}>
                        {error.locations ? (
                            <span>
                                <code>{JSON.stringify(error.locations)}</code>:{" "}
                            </span>
                        ) : null}
                        {error.message}
                    </li>
                ))}
            </ol>
        </Banner>
    );
};
