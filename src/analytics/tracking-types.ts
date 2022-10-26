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

import { TypeDefinitionsAnalyticsResults } from "./analytics";

export interface TrackingTBIntrospect {
    screen: "query editor" | "type definitions" | "initial modal";
    status?: "success" | "failure";
    errorMessage?: string;
}

export interface TrackingTBEditorThemeToggle {
    screen: "query editor" | "type definitions";
    theme: "light" | "dark";
}

export interface TrackingTBFavorite {
    screen: "query editor" | "type definitions";
}

export interface TrackingTBSchemaSettingsCheckbox {
    screen: "query editor" | "type definitions";
    box: "debug" | "regex";
    action: "check" | "uncheck";
}

export interface TrackingTBSchemaConstraints {
    screen: "query editor" | "type definitions";
    value: "check" | "create" | "ignore";
}

export interface TrackingTBChangeDatabase {
    screen: "query editor" | "type definitions";
}

export interface TrackingTBExplorerExecutionTypeAdd {
    screen: "query editor" | "type definitions";
    actionLabel: "query" | "mutation";
}

export interface TrackingTBSchemaDocsToggle {
    screen: "query editor" | "type definitions";
    action: "on" | "off";
    origin: "explorer" | "help drawer";
}

export interface TrackingTBHelpLearnLinkClick {
    screen: "query editor" | "type definitions";
    actionLabel:
        | "schema documentation"
        | "github repository"
        | "issue tracker"
        | "library documentation"
        | "neo4j graph academy"
        | "community"
        | "send feedback";
}

export interface TrackingTBBuildSchemaClick extends TypeDefinitionsAnalyticsResults {
    screen: "query editor" | "type definitions";
}

export interface TrackingTBExecuteQuery {
    screen: "query editor" | "type definitions";
    queryComplexity: number;
}
