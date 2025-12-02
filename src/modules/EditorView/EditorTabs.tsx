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

import { Tabs } from "@neo4j-ndl/react";
import { PlusIconOutline, XMarkIconOutline } from "@neo4j-ndl/react/icons";
import classNames from "classnames";

import { tracking } from "../../analytics/tracking";
import { Screen } from "../../contexts/screen";
import { Theme, ThemeContext } from "../../contexts/theme";
import { useStore } from "../../store";

export const EditorTabs = () => {
    const store = useStore();
    const theme = useContext(ThemeContext);

    const closeTab = (idx: number) => {
        store.closeTab(idx);
    };

    const handleTabsChange = (idx: string) => {
        if (idx === "new") return;
        store.changeActiveTabIndex(Number.parseInt(idx));
    };

    const handleAddTab = () => {
        store.addTab();
        tracking.trackAddQueryTab({ screen: Screen.EDITOR });
    };

    const handleCloseTab = (event: React.MouseEvent<HTMLElement, MouseEvent>, idx: number) => {
        event.stopPropagation();
        closeTab(idx);
        tracking.trackDeleteQueryTab({ screen: Screen.EDITOR });
    };

    return (
        <Tabs
            size="small"
            fill="underline"
            value={useStore.getState().activeTabIndex.toString()}
            onChange={handleTabsChange}
            className={classNames(
                "w-full pt-2 px-1 overflow-hidden whitespace-nowrap rounded-t-xl border-b-0 z-0",
                theme.theme === Theme.LIGHT ? "bg-neutral-10" : "bg-draculaDark"
            )}
        >
            {useStore.getState().tabs?.map((tab, idx) => {
                return (
                    <Tabs.Tab
                        key={idx.toString()}
                        id={idx.toString()}
                        className={theme.theme === Theme.LIGHT ? "ndl-theme-light" : "ndl-theme-dark"}
                    >
                        <div className="flex justify-center items-center" data-test-query-editor-tab={tab.title}>
                            <span className="truncate" style={{ maxWidth: "7rem" }} title={tab.title}>
                                {tab.title}
                            </span>

                            {useStore.getState().tabs.length > 1 && (
                                <button
                                    data-test-close-icon-query-editor-tab="true"
                                    aria-label="Close Icon"
                                    onClick={(event) => {
                                        handleCloseTab(event, idx);
                                    }}
                                    className="flex items-center bg-transparent border-0 p-0 cursor-pointer"
                                >
                                    <XMarkIconOutline
                                        className={classNames(
                                            "h-5 w-5 ml-2",
                                            theme.theme === Theme.LIGHT ? "hover:bg-neutral-10" : "hover:bg-neutral-50"
                                        )}
                                    />
                                </button>
                            )}
                        </div>
                    </Tabs.Tab>
                );
            })}
            <Tabs.Tab key="new" id="new" className="vertical-align-bottom">
                <button
                    data-test-new-query-editor-tab="true"
                    aria-label="Add tab Icon"
                    onClick={handleAddTab}
                    className="flex items-center bg-transparent border-0 p-0 cursor-pointer"
                >
                    <PlusIconOutline
                        className={classNames(
                            "h-5 w-5",
                            theme.theme === Theme.LIGHT ? "hover:bg-neutral-10" : "text-neutral-10 hover:bg-neutral-50"
                        )}
                    />
                </button>
            </Tabs.Tab>
        </Tabs>
    );
};
