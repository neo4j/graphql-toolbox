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

import { tokens } from "@neo4j-ndl/base";
import { Dialog, FilledButton, OutlinedButton } from "@neo4j-ndl/react";

interface Props {
    open: boolean;
    onClose: () => void;
    onIntrospect: () => void;
    onDisconnect: () => void;
}

export const IntrospectionPrompt = ({ open, onClose, onDisconnect, onIntrospect }: Props) => {
    return (
        <Dialog
            ndl-id="introspectioprompt"
            htmlAttributes={{
                "data-test-introspect-prompt": "true",
            }}
            isOpen={open}
            onClose={() => onClose()}
        >
            <Dialog.Header className="h4">Generate type definitions</Dialog.Header>
            <Dialog.Description>
                Your current connection already has data. Would you like to introspect this database to generate type
                definitions automatically?
            </Dialog.Description>
            <Dialog.Actions className="flex w-full">
                <OutlinedButton
                    htmlAttributes={{
                        "data-test-introspect-prompt-cancel": "true",
                    }}
                    variant="neutral"
                    aria-label="Close introspection prompt"
                    onClick={() => onClose()}
                >
                    Cancel
                </OutlinedButton>
                <div className="mr-0 ml-auto">
                    <OutlinedButton
                        htmlAttributes={{
                            "data-test-introspect-prompt-logout": "true",
                        }}
                        className="mr-3"
                        variant="primary"
                        aria-label="Switch connection"
                        onClick={() => onDisconnect()}
                    >
                        Switch connection
                    </OutlinedButton>
                    <FilledButton
                        htmlAttributes={{
                            "data-test-introspect-prompt-introspect": "true",
                        }}
                        style={{ backgroundColor: tokens.palette.baltic[50] }}
                        variant="primary"
                        aria-label="Introspect database"
                        onClick={() => onIntrospect()}
                    >
                        Introspect
                    </FilledButton>
                </div>
            </Dialog.Actions>
        </Dialog>
    );
};
