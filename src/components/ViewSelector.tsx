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

import { useContext } from "react";

import { Tabs, Tooltip } from "@neo4j-ndl/react";

import { Screen, ScreenContext } from "../contexts/screen";

interface Props {
    hasSchema: boolean;
}

export const ViewSelector = ({ hasSchema }: Props) => {
    const screen = useContext(ScreenContext);

    const handleOnScreenChange = (selectedScreen: string) => {
        const next = selectedScreen === Screen.TYPEDEFS.toString() ? Screen.TYPEDEFS : Screen.EDITOR;
        screen.setScreen(next);
    };

    return (
        <Tabs fill="underline" onChange={handleOnScreenChange} value={screen.view.toString()} className="pt-3">
            <Tabs.Tab
                htmlAttributes={{
                    "data-test-view-selector-type-defs": "true",
                }}
                id={Screen.TYPEDEFS.toString()}
            >
                Type definitions
            </Tabs.Tab>
            <Tooltip placement="right" type="simple">
                <Tooltip.Trigger>
                    <Tabs.Tab
                        htmlAttributes={{
                            "data-test-view-selector-editor": "true",
                        }}
                        id={Screen.EDITOR.toString()}
                        as="div"
                        isDisabled={!hasSchema}
                    >
                        Query editor
                    </Tabs.Tab>
                </Tooltip.Trigger>
                {!hasSchema && <Tooltip.Content>Build the schema to use the Query editor</Tooltip.Content>}
            </Tooltip>
        </Tabs>
    );
};
