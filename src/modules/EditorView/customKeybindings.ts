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

import { EditorSelection } from "@codemirror/state";
import type { EditorView, KeyBinding } from "@codemirror/view";

const indentation = "  "; // Two spaces

export const customKeybindings: readonly KeyBinding[] = [
    {
        key: "Tab",
        run: (view) => {
            const transaction = view.state.changeByRange((range) => ({
                changes: { from: range.from, insert: indentation },
                range: EditorSelection.cursor(range.from + 2), // Move cursor after tab
            }));
            view.dispatch(transaction);
            return true; // Prevent default behavior
        },
    },
    {
        key: "Enter",
        run: (view: EditorView) => {
            const { state } = view;
            const { from } = state.selection.main;
            const line = state.doc.lineAt(from);
            const beforeCursor = line.text.slice(0, from - line.from).trim();
            const afterCursor = line.text.slice(from - line.from).trim();

            const indent = line.text.match(/^\s*/)?.[0] || "";
            let insertText = "\n";

            if (beforeCursor.endsWith("{") && afterCursor === "}") {
                insertText += indent + `${indentation}\n${indent}`;
            } else if (beforeCursor.endsWith("{")) {
                insertText += indent + indentation;
            } else {
                insertText += indent;
            }

            const transaction = state.update({
                changes: { from, to: from, insert: insertText },
                selection: EditorSelection.cursor(
                    from + insertText.length - (afterCursor === "}" ? indent.length + 1 : 0)
                ),
            });

            view.dispatch(transaction);
            return true; // Prevent default behavior
        },
    },
];
