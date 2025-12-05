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

import React, { useCallback, useEffect, useRef, useState } from "react";

import * as neo4j from "neo4j-driver";

import { VERIFY_CONNECTION_INTERVAL_MS } from "../constants";
import { useStore } from "../store";
import { useSessionStore } from "../store/session";
import type { LoginPayload, Neo4jDatabase, Neo4jDatabaseInfo } from "../types";
import { getAuraDBIdFromText, getURLProtocolFromText } from "../utils/utils";
import {
    checkDatabaseHasData,
    getDatabaseInformation,
    getDatabases,
    resolveNeo4jDesktopLoginPayload,
    resolveSelectedDatabaseName,
} from "./utils";

interface LoginOptions {
    username: string;
    password: string;
    url: string;
}

export interface State {
    driver?: neo4j.Driver;
    connectUrl?: string;
    username?: string;
    isConnected?: boolean;
    isNeo4jDesktop?: boolean;
    databases?: Neo4jDatabase[];
    databaseInformation?: Neo4jDatabaseInfo;
    selectedDatabaseName?: string;
    showIntrospectionPrompt?: boolean;
    login: (options: LoginOptions) => Promise<void>;
    logout: () => void;
    setSelectedDatabaseName: (databaseName: string) => void;
    setShowIntrospectionPrompt: (nextState: boolean) => void;
}

export const AuthContext = React.createContext({} as State);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const intervalIdRef = useRef<number | undefined>(undefined);
    const store = useStore();
    const sessionStore = useSessionStore();

    const [driver, setDriver] = useState<neo4j.Driver | undefined>();
    const [connectUrl, setConnectUrl] = useState<string | undefined>();
    const [username, setUsername] = useState<string | undefined>();
    const [isConnected, setIsConnected] = useState<boolean | undefined>();
    const [isNeo4jDesktop, setIsNeo4jDesktop] = useState<boolean | undefined>();
    const [databases, setDatabases] = useState<Neo4jDatabase[] | undefined>();
    const [databaseInformation, setDatabaseInformation] = useState<Neo4jDatabaseInfo | undefined>();
    const [selectedDatabaseName, setSelectedDatabaseNameState] = useState<string | undefined>();
    const [showIntrospectionPrompt, setShowIntrospectionPrompt] = useState<boolean | undefined>();

    const checkForDatabaseUpdates = useCallback(async (driver: neo4j.Driver) => {
        try {
            await driver.verifyConnectivity();
            const databases = await getDatabases(driver);
            setIsConnected(true);
            setDatabases(databases || []);
        } catch {
            setIsConnected(false);
        }
    }, []);

    const login = useCallback(
        async (options: LoginOptions) => {
            const auth = neo4j.auth.basic(options.username, options.password);
            const protocol = getURLProtocolFromText(options.url);
            sessionStore.setAuraDbId(getAuraDBIdFromText(options.url));
            // Manually set the encryption to off if it's not specified in the Connection URI to avoid implicit encryption in https domain
            const newDriver = protocol.includes("+s")
                ? neo4j.driver(options.url, auth)
                : neo4j.driver(options.url, auth, { encrypted: "ENCRYPTION_OFF" });

            await newDriver.verifyConnectivity();

            const dbs = await getDatabases(newDriver);
            const dbInfo = await getDatabaseInformation(newDriver);
            const selectedDb = resolveSelectedDatabaseName(dbs || []);

            let isShowIntrospectionPrompt = false;
            if (!store.hideIntrospectionPrompt) {
                isShowIntrospectionPrompt = await checkDatabaseHasData(newDriver, selectedDb);
                store.setHideIntrospectionPrompt(true);
            }

            store.setConnectionUsername(options.username);
            store.setConnectionUrl(options.url);

            intervalIdRef.current = window.setInterval(async () => {
                await checkForDatabaseUpdates(newDriver);
            }, VERIFY_CONNECTION_INTERVAL_MS);

            setDriver(newDriver);
            setUsername(options.username);
            setConnectUrl(options.url);
            setIsConnected(true);
            setShowIntrospectionPrompt(isShowIntrospectionPrompt);
            setDatabases(dbs);
            setDatabaseInformation(dbInfo);
            setSelectedDatabaseNameState(selectedDb);
        },
        [store, sessionStore, checkForDatabaseUpdates]
    );

    const logout = useCallback(() => {
        store.setConnectionUsername(null);
        store.setConnectionUrl(null);
        store.setHideIntrospectionPrompt(false);
        sessionStore.clearAuraDbId();
        if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
        }

        setDriver(undefined);
        setConnectUrl(undefined);
        setIsConnected(false);
        setShowIntrospectionPrompt(false);
    }, [store, sessionStore]);

    const setSelectedDatabaseName = useCallback(
        (databaseName: string) => {
            store.setSelectedDatabaseName(databaseName);
            setSelectedDatabaseNameState(databaseName);
        },
        [store]
    );

    const processLoginPayload = useCallback(
        (loginPayloadFromDesktop: LoginPayload | null) => {
            let loginPayload: LoginPayload | null = null;
            if (loginPayloadFromDesktop) {
                loginPayload = loginPayloadFromDesktop;
                setIsNeo4jDesktop(true);
            } else {
                if (store.connectionUrl && store.connectionUsername) {
                    loginPayload = {
                        username: store.connectionUsername,
                        url: store.connectionUrl,
                    };
                }
            }
            if (loginPayload?.password && !driver) {
                login({
                    username: loginPayload.username,
                    password: loginPayload.password,
                    url: loginPayload.url,
                }).catch((error) => console.log(error));
            }
        },
        [store.connectionUrl, store.connectionUsername, driver, login]
    );

    useEffect(() => {
        resolveNeo4jDesktopLoginPayload().then(processLoginPayload).catch(console.error);
    }, [processLoginPayload]);

    return (
        <AuthContext.Provider
            value={{
                driver,
                connectUrl,
                username,
                isConnected,
                isNeo4jDesktop,
                databases,
                databaseInformation,
                selectedDatabaseName,
                showIntrospectionPrompt,
                login,
                logout,
                setSelectedDatabaseName,
                setShowIntrospectionPrompt,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
