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

import React from "react";
import { Checkbox, HeroIcon } from "@neo4j-ndl/react";
import { ProTooltip } from "../../components/ProTooltip";
import { Storage } from "src/utils/storage";
import {
    LOCAL_STATE_CHECK_CONSTRAINT,
    LOCAL_STATE_CREATE_CONSTRAINT,
    LOCAL_STATE_ENABLE_DEBUG,
    LOCAL_STATE_ENABLE_REGEX,
} from "src/constants";

interface Props {
    isRegexChecked: string | null;
    isDebugChecked: string | null;
    isCheckConstraintChecked: string | null;
    isCreateConstraintChecked: string | null;
    setIsRegexChecked: React.Dispatch<React.SetStateAction<string | null>>;
    setIsDebugChecked: React.Dispatch<React.SetStateAction<string | null>>;
    setIsCheckConstraintChecked: React.Dispatch<React.SetStateAction<string | null>>;
    setIsCreateConstraintChecked: React.Dispatch<React.SetStateAction<string | null>>;
}

export const SchemaSettings = ({
    isRegexChecked,
    isDebugChecked,
    isCheckConstraintChecked,
    isCreateConstraintChecked,
    setIsRegexChecked,
    setIsDebugChecked,
    setIsCheckConstraintChecked,
    setIsCreateConstraintChecked,
}: Props) => {
    const onChangeDebugCheckbox = (): void => {
        const next = isDebugChecked === "true" ? "false" : "true";
        setIsDebugChecked(next);
        Storage.store(LOCAL_STATE_ENABLE_DEBUG, next);
    };

    const onChangeCheckConstraintCheckbox = (): void => {
        const nextCheck = isCheckConstraintChecked === "true" ? "false" : "true";
        if (isCreateConstraintChecked === "true") return;
        setIsCheckConstraintChecked(nextCheck);
        Storage.store(LOCAL_STATE_CHECK_CONSTRAINT, nextCheck);
    };

    const onChangeCreateConstraintCheckbox = (): void => {
        const nextCreate = isCreateConstraintChecked === "true" ? "false" : "true";
        if (isCheckConstraintChecked === "true") return;
        setIsCreateConstraintChecked(nextCreate);
        Storage.store(LOCAL_STATE_CREATE_CONSTRAINT, nextCreate);
    };

    const onChangeRegexCheckbox = (): void => {
        const next = isRegexChecked === "true" ? "false" : "true";
        setIsRegexChecked(next);
        Storage.store(LOCAL_STATE_ENABLE_REGEX, next);
    };

    return (
        <React.Fragment>
            <span className="h5">Schema settings</span>
            <div className="pt-4">
                <div className="mb-1">
                    <Checkbox
                        className="m-0"
                        label="Enable Regex"
                        checked={isRegexChecked === "true"}
                        onChange={onChangeRegexCheckbox}
                    />
                </div>
                <div className="mb-1 flex items-baseline">
                    <Checkbox
                        className="m-0"
                        label="Enable Debug"
                        checked={isDebugChecked === "true"}
                        onChange={onChangeDebugCheckbox}
                    />
                    <ProTooltip
                        tooltipText={
                            <span>
                                Enable "verbose" logging in browser. See{" "}
                                <a
                                    className="underline"
                                    href="https://github.com/debug-js/debug#browser-support"
                                    target="_blank"
                                >
                                    here
                                </a>
                            </span>
                        }
                        arrowPositionLeft={true}
                        blockVisibility={false}
                        width={280}
                        left={28}
                        top={-13}
                    >
                        <HeroIcon className="ml-1 h-4 w-4" iconName="QuestionMarkCircleIcon" type="outline" />
                    </ProTooltip>
                </div>
                <div className="mb-1">
                    <Checkbox
                        className="m-0"
                        label="Check Constraint"
                        checked={isCheckConstraintChecked === "true"}
                        onChange={onChangeCheckConstraintCheckbox}
                    />
                </div>
                <div className="mb-1">
                    <Checkbox
                        className="m-0"
                        label="Create Constraint"
                        checked={isCreateConstraintChecked === "true"}
                        onChange={onChangeCreateConstraintCheckbox}
                    />
                </div>
            </div>
        </React.Fragment>
    );
};
