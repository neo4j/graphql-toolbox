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

import { Menu } from "@neo4j-ndl/react";
import { CheckIconOutline } from "@neo4j-ndl/react/icons";

import { AuthContext } from "../../contexts/auth";
import { Screen, ScreenContext } from "../../contexts/screen";

interface Props {
    menuButtonRef: React.RefObject<HTMLDivElement | null>;
    dbmsUrlWithUsername: string;
    openConnectionMenu: boolean;
    onNextSelectedDatabaseName: (databaseName: string) => void;
}

export const ConnectionMenu = ({
    menuButtonRef,
    dbmsUrlWithUsername,
    openConnectionMenu,
    onNextSelectedDatabaseName,
}: Props) => {
    const auth = useContext(AuthContext);
    const screen = useContext(ScreenContext);

    return (
        <Menu isOpen={openConnectionMenu} anchorRef={menuButtonRef} className="mt-2 ndl-theme-light">
            <Menu.Items>
                {auth.databases?.length ? (
                    <>
                        <Menu.CategoryItem>Databases</Menu.CategoryItem>
                        {auth.databases.map((db) => {
                            return (
                                <Menu.Item
                                    key={db.name}
                                    htmlAttributes={{
                                        "data-test-topbar-database": db.name,
                                    }}
                                    title={db.name.length > 50 ? `${db.name.substring(0, 48)}...` : db.name}
                                    isDisabled={screen.view !== Screen.TYPEDEFS}
                                    leadingVisual={
                                        db.name === auth.selectedDatabaseName ? <CheckIconOutline /> : <span />
                                    }
                                    onClick={() => onNextSelectedDatabaseName(db.name)}
                                />
                            );
                        })}
                    </>
                ) : null}
                {!auth.isNeo4jDesktop ? (
                    <>
                        <Menu.Divider />
                        <Menu.Item
                            htmlAttributes={{
                                "data-test-topbar-disconnect": "true",
                            }}
                            className="text-hibiscus-45"
                            title="Disconnect"
                            description={<span className="text-neutral-80">{dbmsUrlWithUsername}</span>}
                            onClick={() => auth?.logout()}
                        />
                    </>
                ) : null}
            </Menu.Items>
        </Menu>
    );
};
