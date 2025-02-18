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

import { useContext, useEffect, useState } from "react";

import { EditorContextProvider, StorageContextProvider } from "@graphiql/react";
import { NeedleThemeProvider } from "@neo4j-ndl/react";
import type { GraphQLSchema } from "graphql";

import { invokeSegmentAnalytics } from "../../analytics/segment-snippet";
import { CannySDK } from "../../common/canny";
import { ViewSelector } from "../../components/ViewSelector";
import { AuthContext } from "../../contexts/auth";
import { Screen, ScreenContext } from "../../contexts/screen";
import { EditorView } from "../EditorView/EditorView";
import { Login } from "../Login/Login";
import { SchemaView } from "../SchemaView/SchemaView";
import { TopBar } from "../TopBar/TopBar";

export const Main = () => {
    const auth = useContext(AuthContext);
    const screen = useContext(ScreenContext);
    const [schema, setSchema] = useState<GraphQLSchema | undefined>(undefined);

    useEffect(() => {
        const segmentKey = process.env.SEGMENT_GRAPHQL_TOOLBOX_PROD_SOURCE;
        if (!segmentKey) {
            console.log("Did not find Segment key, will not initialize Segment");
            return;
        }
        invokeSegmentAnalytics(segmentKey);
        console.log("Initialized app.");
    }, []);

    useEffect(() => {
        const cannyAppId = process.env.CANNY_GRAPHQL_TOOLBOX_APP_ID;
        if (!cannyAppId) {
            console.log("Did not find Canny App ID, will not initialize Canny");
            window.CannyIsLoaded = false;
            return;
        }

        CannySDK.init()
            .then(() => {
                console.log("Canny SDK loaded");
                window.CannyIsLoaded = true;
            })
            .catch((err) => {
                console.error("Canny SDK failed to load", err);
                window.CannyIsLoaded = false;
            });
    }, []);

    const Banner = () => {
        return (
            <div className="h-8 w-full bg-lavender-45 text-neutral-10 text-center leading-8">
                Win $250 by testing the GraphQL for Neo4j AuraDB.{` `}
                <a
                    href="https://neo4j.com/developer-blog/build-conways-game-of-life/"
                    className="underline"
                    target="_blank"
                    rel="noreferrer"
                >
                    See Developer Blog for details
                </a>
                .
            </div>
        );
    };

    if (!auth.driver) {
        return (
            <div className="flex">
                <div className="flex w-full h-full flex-col">
                    <Banner />
                    <Login />
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full h-full flex-col">
            <EditorContextProvider>
                <StorageContextProvider>
                    <NeedleThemeProvider theme="dark">
                        <Banner />
                        <TopBar />
                    </NeedleThemeProvider>
                    <ViewSelector hasSchema={!!schema} />
                    <div className="h-content-container w-full overflow-y-auto bg-neutral-15">
                        {screen.view === Screen.TYPEDEFS ? (
                            <SchemaView
                                onSchemaChange={(schema) => {
                                    setSchema(schema);
                                    screen.setScreen(Screen.EDITOR);
                                }}
                            />
                        ) : (
                            <EditorView schema={schema} />
                        )}
                    </div>
                </StorageContextProvider>
            </EditorContextProvider>
        </div>
    );
};
