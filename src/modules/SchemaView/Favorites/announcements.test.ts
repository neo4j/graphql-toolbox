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

import type { Active, Over } from "@dnd-kit/core";

import { announcements } from "./announcements";

const active = (id: string) => ({ active: { id } as Active, over: null });
const over = (activeId: string, overId: string) => ({
    active: { id: activeId } as Active,
    over: { id: overId } as Over,
});

describe("announcements", () => {
    test("skips the first drag-over after each drag start and announces later ones", () => {
        const a = announcements(["a", "b", "c"]);

        expect(a.onDragStart(active("a"))).toBe("Picked up sortable item a. Sortable item a is in position 1 of 3");
        expect(a.onDragOver?.(over("a", "a"))).toBeUndefined();
        expect(a.onDragOver?.(over("a", "c"))).toBe("Sortable item a was moved into position 3 of 3");
        expect(a.onDragEnd(over("a", "c"))).toBe("Sortable item a was dropped at position 3 of 3");

        a.onDragStart(active("b"));
        expect(a.onDragOver?.(over("b", "b"))).toBeUndefined();
        expect(a.onDragOver?.(over("b", "a"))).toBe("Sortable item b was moved into position 1 of 3");
    });
});
