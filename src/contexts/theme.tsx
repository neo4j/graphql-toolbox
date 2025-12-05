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

import React, { useEffect, useState } from "react";

import { useStore } from "../store";

export enum Theme {
    LIGHT,
    DARK,
}

export interface State {
    theme: Theme;
    setTheme: (v: Theme) => void;
}

export const ThemeContext = React.createContext({} as State);

export function ThemeProvider(props: React.PropsWithChildren) {
    const loadEditorTheme = () => {
        const editorTheme = useStore.getState().editorTheme;
        if (editorTheme) {
            return editorTheme === Theme.LIGHT.toString() ? Theme.LIGHT : Theme.DARK;
        }

        // If no theme is saved, use system preference
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? Theme.DARK : Theme.LIGHT;
    };

    const [theme, setThemeState] = useState<Theme>(loadEditorTheme());

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        useStore.setState({ editorTheme: newTheme.toString() });
    };

    // Automatically detect if the user changed the color scheme/theme, also on OS level.
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (event: MediaQueryListEvent) => {
            setTheme(event.matches ? Theme.DARK : Theme.LIGHT);
        };

        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    const value: State = {
        theme,
        setTheme,
    };

    return <ThemeContext.Provider value={value}>{props.children}</ThemeContext.Provider>;
}
