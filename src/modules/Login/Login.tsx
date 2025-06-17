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

import { useCallback, useContext, useState } from "react";

import { Banner, Button, Tooltip } from "@neo4j-ndl/react";
import { ExclamationTriangleIconOutline } from "@neo4j-ndl/react/icons";
import type { JSX } from "react";

import neo4jIcon from "../../assets/neo4j-full-color.png";
import { DEFAULT_BOLT_URL, DEFAULT_USERNAME } from "../../constants";
import { AuthContext } from "../../contexts/auth";
import { getConnectUrlSearchParamValue } from "../../contexts/utils";
import { getURLProtocolFromText } from "../../utils/utils";
import { FormInput } from "./FormInput";

export const Login = () => {
    const auth = useContext(AuthContext);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const { url: searchParamUrl, username: searchParamUsername } = getConnectUrlSearchParamValue() || {};
    const [url, setUrl] = useState<string>(searchParamUrl || DEFAULT_BOLT_URL);
    const [username, setUsername] = useState<string>(searchParamUsername || DEFAULT_USERNAME);
    const [password, setPassword] = useState<string>("");
    const showWarningToolTip =
        window.location.protocol.includes("https") && !getURLProtocolFromText(url).includes("+s");

    const onSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setLoading(true);

            try {
                await auth.login({
                    username,
                    password,
                    url,
                });
            } catch (error) {
                setError((error as Error).message);
            } finally {
                setLoading(false);
            }
        },
        [url, username, password, auth]
    );

    const WarningToolTip = ({ text }: { text: React.ReactNode }): JSX.Element => {
        return (
            <Tooltip type="rich" placement="right">
                <Tooltip.Trigger hasButtonWrapper>
                    <ExclamationTriangleIconOutline className="text-lemon-55 h-7 w-7" />
                </Tooltip.Trigger>
                <Tooltip.Content style={{ width: "20rem" }}>
                    <Tooltip.Body>{text}</Tooltip.Body>
                </Tooltip.Content>
            </Tooltip>
        );
    };

    return (
        <div data-test-login-form className="grid place-items-center h-login-container bg-neutral-30 login-bg">
            <div className="w-[600px] min-h-[740px] flex flex-col justify-start shadow-overlay rounded-3xl py-8 px-24 bg-neutral-10">
                <img src={neo4jIcon} alt="Neo4j Logo" className="mx-auto mt-4 h-14" />

                <h2 className="h2 text-3xl text-center mt-16 mb-8">Neo4j GraphQL Toolbox</h2>

                {error && (
                    <Banner
                        className="mb-8"
                        title="Neo4j Error"
                        description={error}
                        hasIcon
                        type="danger"
                        isCloseable={false}
                    />
                )}

                <form onSubmit={onSubmit} className="flex flex-col items-center gap-4 mt-auto mb-24">
                    <FormInput
                        label={"Connection URL"}
                        htmlAttributes={{ name: "url", type: "text", "data-test-login-url": "true" }}
                        value={url}
                        onChange={(event) => setUrl(event.currentTarget.value)}
                        placeholder={DEFAULT_BOLT_URL}
                        isRequired={true}
                        isDisabled={loading}
                    />
                    {showWarningToolTip ? (
                        <div className="absolute ml-[-28rem] mt-[2.5rem]">
                            <WarningToolTip
                                text={
                                    <span>
                                        This protocol will not establish a secure connection. Please consider accessing
                                        the Neo4j database using either the bolt+s or neo4j+s protocol.{" "}
                                        <a
                                            className="underline"
                                            href="https://neo4j.com/developer/javascript/#driver-configuration"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            More information
                                        </a>
                                    </span>
                                }
                            />
                        </div>
                    ) : null}
                    <FormInput
                        label="Database user"
                        htmlAttributes={{
                            name: "username",
                            type: "text",
                            autoComplete: "username",
                            "data-test-login-username": "true",
                        }}
                        placeholder="neo4j"
                        value={username}
                        onChange={(event) => setUsername(event.currentTarget.value)}
                        isRequired={true}
                        isDisabled={loading}
                    />

                    <FormInput
                        label="Password"
                        htmlAttributes={{
                            name: "password",
                            autoComplete: "current-password",
                            autoCorrect: "off",
                            spellCheck: "false",
                            type: "password",
                            "data-test-login-password": "true",
                        }}
                        placeholder="password"
                        value={password}
                        onChange={(event) => setPassword(event.currentTarget.value)}
                        isRequired={true}
                        isDisabled={loading}
                    />

                    <Button
                        htmlAttributes={{
                            "data-test-login-button": "true",
                        }}
                        className="w-60 mt-8"
                        fill="filled"
                        type="submit"
                        size="large"
                        isLoading={loading}
                        isDisabled={loading || !url || !username || !password}
                    >
                        Connect
                    </Button>
                </form>
            </div>
        </div>
    );
};
