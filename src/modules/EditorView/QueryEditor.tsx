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

import { useContext, useEffect, useMemo, useRef, useState } from "react";

import {
    acceptCompletion,
    autocompletion,
    closeBrackets,
    closeBracketsKeymap,
    completionKeymap,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { bracketMatching, foldGutter, foldKeymap, indentOnInput } from "@codemirror/language";
import { lintGutter, lintKeymap } from "@codemirror/lint";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { Annotation, EditorState, Prec, StateEffect } from "@codemirror/state";
import type { ViewUpdate } from "@codemirror/view";
import { drawSelection, dropCursor, highlightSpecialChars, keymap, lineNumbers } from "@codemirror/view";
import { dracula, tomorrow } from "@mjfwebb/thememirror";
import { tokens } from "@neo4j-ndl/base";
import { CleanIconButton, OutlinedButton } from "@neo4j-ndl/react";
import { PlayIconOutline } from "@neo4j-ndl/react/icons";
import classNames from "classnames";
import { graphql as graphqlExtension } from "cm6-graphql";
import type { EditorView as CodeMirrorEditorView } from "codemirror";
import { EditorView } from "codemirror";
import type { GraphQLSchema } from "graphql";
import { useMount } from "react-use";

import { Extension, FileName } from "../../components/Filename";
import { EDITOR_QUERY_INPUT } from "../../constants";
import { AppSettingsContext } from "../../contexts/appsettings";
import { Theme, ThemeContext } from "../../contexts/theme";
import { useStore } from "../../store";
import { customKeybindings } from "./customKeybindings";
import { formatCode, handleEditorDisableState, ParserOptions } from "./utils";

export interface Props {
    loading: boolean;
    onSubmit: (override?: string) => Promise<void>;
    schema: GraphQLSchema;
}

const External = Annotation.define<boolean>();

export const QueryEditor = ({ loading, onSubmit, schema }: Props) => {
    const store = useStore();
    const theme = useContext(ThemeContext);
    const appSettings = useContext(AppSettingsContext);
    const elementRef = useRef<HTMLDivElement | null>(null);
    const [value, setValue] = useState<string>();
    const [editorView, setEditorView] = useState<CodeMirrorEditorView | null>(null);

    const formatTheCode = (): void => {
        if (!editorView) return;
        formatCode(editorView, ParserOptions.GRAPH_QL);
    };

    // Taken from https://github.com/uiwjs/react-codemirror/blob/master/core/src/useCodeMirror.ts
    const updateListener = EditorView.updateListener.of((vu: ViewUpdate) => {
        if (
            vu.docChanged &&
            // Fix echoing of the remote changes:
            // If transaction is marked as remote we don't have to call `onChange` handler again
            !vu.transactions.some((tr) => tr.annotation(External))
        ) {
            const doc = vu.state.doc;
            const value = doc.toString();
            store.updateQuery(value, useStore.getState().activeTabIndex);
        }
    });

    const extensions = useMemo(
        () => [
            lineNumbers(),
            highlightSpecialChars(),
            bracketMatching(),
            closeBrackets(),
            history(),
            dropCursor(),
            drawSelection(),
            indentOnInput(),
            autocompletion({ defaultKeymap: true, maxRenderedOptions: 5 }),
            highlightSelectionMatches(),
            EditorView.lineWrapping,
            keymap.of([
                ...customKeybindings,
                ...closeBracketsKeymap,
                ...defaultKeymap,
                ...searchKeymap,
                ...historyKeymap,
                ...foldKeymap,
                ...completionKeymap,
                ...lintKeymap,
            ]),
            Prec.highest(
                keymap.of([
                    {
                        key: "Mod-Enter",
                        run: (view) => {
                            onSubmit(view.state.doc.toString()).catch(() => null);
                            return true;
                        },
                    },
                    {
                        key: "Mod-m",
                        run: (view) => {
                            formatCode(view, ParserOptions.GRAPH_QL);
                            return true;
                        },
                        preventDefault: true,
                    },
                    { key: "Tab", run: acceptCompletion },
                ])
            ),
            foldGutter({
                closedText: "▶",
                openText: "▼",
            }),
            graphqlExtension(schema),
            theme.theme === Theme.LIGHT ? tomorrow : dracula,
            appSettings.showLintMarkers ? lintGutter() : [],
            updateListener,
        ],
        [appSettings.showLintMarkers, onSubmit, schema, theme.theme, updateListener]
    );

    useMount(() => {
        if (elementRef.current === null) {
            return;
        }

        const state = EditorState.create({
            doc: "",
            extensions,
        });

        const view = new EditorView({
            state,
            parent: elementRef.current,
        });

        setEditorView(view);

        return () => {
            view.destroy();
            setEditorView(null);
        };
    });

    useEffect(() => {
        if (editorView) {
            editorView.dispatch({ effects: StateEffect.reconfigure.of(extensions) });
        }
    }, [theme.theme, appSettings.showLintMarkers, extensions, editorView]);

    useEffect(() => {
        if (value === undefined) {
            return;
        }
        const currentValue = editorView ? editorView.state.doc.toString() : "";
        if (editorView && value !== currentValue) {
            editorView.dispatch({
                changes: { from: 0, to: currentValue.length, insert: value || "" },
                annotations: [External.of(true)],
            });
        }
    }, [value, editorView]);

    const activeTabQuery = useStore.getState().getActiveTab().query;

    useEffect(() => {
        setValue(activeTabQuery);
    }, [activeTabQuery]);

    useEffect(() => {
        handleEditorDisableState(elementRef.current, loading);
    }, [loading]);

    return (
        <div className="w-full h-full relative rounded-b-xl">
            <FileName
                name={"query"}
                extension={Extension.GRAPHQL}
                rightButtons={
                    <>
                        <OutlinedButton
                            aria-label="Prettify code"
                            className={classNames(
                                "mr-2",
                                theme.theme === Theme.LIGHT ? "ndl-theme-light" : "ndl-theme-dark"
                            )}
                            variant="neutral"
                            size="small"
                            onClick={formatTheCode}
                            isDisabled={loading}
                        >
                            Prettify
                        </OutlinedButton>
                        <CleanIconButton
                            htmlAttributes={{
                                "data-test-editor-query-button": "true",
                            }}
                            description="Execute query"
                            style={{ height: "1.7rem" }}
                            className={classNames(theme.theme === Theme.LIGHT ? "ndl-theme-light" : "ndl-theme-dark")}
                            onClick={() => onSubmit()}
                            isDisabled={!schema || loading}
                        >
                            <PlayIconOutline
                                style={{
                                    color: tokens.palette.baltic[50],
                                }}
                            />
                        </CleanIconButton>
                    </>
                }
                borderRadiusTop={false}
            />
            <div
                id={EDITOR_QUERY_INPUT}
                ref={elementRef}
                className={classNames(
                    "w-full h-[calc(100%-3rem)] absolute",
                    theme.theme === Theme.LIGHT ? "cm-light" : "cm-dark"
                )}
            />
        </div>
    );
};
