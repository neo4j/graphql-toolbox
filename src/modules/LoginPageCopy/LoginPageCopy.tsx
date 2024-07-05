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

import { CheckCircleIconOutline } from '@neo4j-ndl/react/icons';

// @ts-ignore - PNG Import
import neo4jIcon from "../../assets/neo4j-full-color.png";



export const LoginPageCopy = () => {
    return (
        <div data-test-login-form className="grid place-items-center h-screen">
        <div className="w-[900px] min-h-[640px] place-items-center ml-16 mt-16">
            <div className="inline-flex min-h-[145px] items-start ml-8">
                <img src={neo4jIcon} alt="Neo4j Logo" className="object-scale-down h-24"></img>
                <h2 className="h2 text-6xl ml-2 mt-2 mb-8">GraphQL Toolbox</h2>
            </div>
            <div>
                <p className="text-3xl ml-8 mt-2 mb-8">Quickly Try GraphQL With Neo4j  </p>
            </div>

            <div className="m-8">
                <ul className="list-outside">
                    <li className="flex mt-4 mb-6">
                        <div className="behind">
                            <CheckCircleIconOutline className="h-8 w-8"/>
                        </div>
                        <p className="text-2xl ml-2">Works With Aura And Self-Managed Neo4j</p>
                    </li>
                    <li className="flex mt-4 mb-6">
                        <div className="behind">
                            <CheckCircleIconOutline className="h-8 w-8"/>
                        </div>
                        <p className="text-2xl ml-2">Automatically Generate Type Definitions With Introspection</p>
                    </li>
                    <li className="flex mt-4 mb-6">
                        <div className="behind">
                            <CheckCircleIconOutline className="h-8 w-8"/>
                        </div>
                        <p className="text-2xl ml-2">Explore Your Graph Database using GraphQL</p>
                    </li>
                    <li className="flex mt-4 mb-6">
                        <div className="behind">
                            <CheckCircleIconOutline className="h-8 w-8"/>
                        </div>
                        <p className="text-2xl ml-2">Completely Browser Based</p>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    );
};
