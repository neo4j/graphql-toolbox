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


/* Look here for how the needle container component for login does this */
/* https://github.com/neo4j-labs/neo4j-needle-starterkit/blob/2.0/src/templates/shared/components/ConnectionModal.tsx */

import { useCallback, useContext, useState } from "react";

import { Banner, Button, Dropdown, Tooltip, Typography } from "@neo4j-ndl/react";
import { ExclamationTriangleIconOutline } from "@neo4j-ndl/react/icons";

import { DEFAULT_URL, DEFAULT_USERNAME } from "../../constants";
import { AuthContext } from "../../contexts/auth";
import { getConnectUrlSearchParamValue } from "../../contexts/utils";
import { getURLProtocolFromText } from "../../utils/utils";
import { FormInput } from "./FormInput";

// @ts-ignore - PNG Import

export const Login = () => {
    const auth = useContext(AuthContext);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const { url: searchParamUrl, username: searchParamUsername } = getConnectUrlSearchParamValue() || {};
    const [url, setUrl] = useState<string>(searchParamUrl || DEFAULT_URL);
    const [username, setUsername] = useState<string>(searchParamUsername || DEFAULT_USERNAME);
    const [password, setPassword] = useState<string>("");
    const showWarningToolTip =
        window.location.protocol.includes("https") && !getURLProtocolFromText(url).includes("+s");
    
    const protocols = ['neo4j://', 'neo4j+s://', 'bolt://', 'bolt+s://'];
    const [protocol, setProtocol] = useState<string>('neo4j://');

    const onSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setLoading(true);
            try {
                await auth.login({
                    username,
                    password,
                    protocol,
                    url,
                });
            } catch (error) {
                setError((error as Error).message);
            } finally {
                setLoading(false);
            }
        },
        [protocol, url, username, password]
    );

    const WarningToolTip = ({ text }: { text: React.ReactNode }): JSX.Element => {
        const [isHovering, setIsHovering] = useState<boolean>(false);

        return (
            <div
                className="pr-2"
                onMouseOver={() => setIsHovering(true)}
                onFocus={() => setIsHovering(true)}
                onMouseOut={() => setIsHovering(false)}
                onBlur={() => setIsHovering(false)}
            >
                <ExclamationTriangleIconOutline className="text-lemon-55 h-7 w-7" />
                {isHovering ? (
                    <Tooltip
                        arrowPosition="left"
                        className="absolute mt-[-5.2rem] ml-[2.2rem] z-20"
                        style={{ width: "20rem" }}
                    >
                        {text}
                    </Tooltip>
                ) : null}
            </div>
        );
    };

    return (
        <div data-test-login-form className="grid place-items-center h-screen bg-neutral-10">
            <div className="place-items-center w-[500px]">
            <div className="inline-flex min-h-[145px] items-start">
            <Typography
                variant="h2"
                >
                Connect to Neo4j
            </Typography>
            </div>
                {error && (
                    <Banner
                        className="mb-8"
                        title="Neo4j Error"
                        description={error}
                        icon
                        type="danger"
                        closeable={false}
                    />
                )}
                <form
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onSubmit={onSubmit}
                    className="grid"
                >
                    <div className="flex flex-row ">
                        <div  className="basis-1/3">
                            <Dropdown
                                id="data-test-login-protocol"
                                className="bg-gray-50 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                label="Protocol"
                                name="protocol"
                                type="select"
                                size="large"
                                selectProps={{
                                    onChange: (newValue) => newValue && setProtocol(newValue.value),
                                    options: protocols.map((option) => ({ label: option, value: option })),
                                    value: { label: protocol, value: protocol },
                                }} 
                            />
                        </div>
                        <div className="basis-2/3">
                            <FormInput
                                testtag="data-test-login-url"
                                label="URL"
                                name="url"
                                value={url}
                                onChange={(event) => setUrl(event.currentTarget.value)}
                                placeholder={DEFAULT_URL}
                                required={true}
                                type="text"
                                disabled={loading}
                            />
                        </div>

                    </div>

                    {showWarningToolTip ? (
                        <div className="absolute ml-[-28rem] mt-[2.5rem]">
                            <WarningToolTip
                                text={
                                    <span>
                                        This protocol will not establish a secure connection. Please consider accessing
                                        the Neo4j database using either the bolt+s or neo4j+s protocol. More
                                        information:{" "}
                                        <a
                                            className="underline"
                                            href="https://neo4j.com/developer/javascript/#driver-configuration"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            here
                                        </a>
                                    </span>
                                }
                            />
                        </div>
                    ) : null}

                    <FormInput
                        testtag="data-test-login-username"
                        label="Database user"
                        name="username"
                        placeholder="neo4j"
                        value={username}
                        onChange={(event) => setUsername(event.currentTarget.value)}
                        required={true}
                        type="text"
                        disabled={loading}
                        autoComplete="username"
                    />

                    <FormInput
                        testtag="data-test-login-password"
                        label="Password"
                        name="password"
                        placeholder="password"
                        value={password}
                        onChange={(event) => setPassword(event.currentTarget.value)}
                        required={true}
                        type="password"
                        disabled={loading}
                        autoComplete="current-password"
                    />

                    <Button
                        data-test-login-button
                        className="mr-2 ml-2 mt-8"
                        fill="filled"
                        type="submit"
                        size="large"
                        loading={loading}
                        disabled={loading || !url || !username || !password}
                    >
                        Connect
                    </Button>
                </form>
            </div>
        </div>
    );
};
