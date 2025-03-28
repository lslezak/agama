/*
 * Copyright (c) [2025] SUSE LLC
 *
 * All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 2 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, contact SUSE LLC.
 *
 * To contact SUSE LLC about this file by physical or electronic mail, you may
 * find current contact information at www.suse.com.
 */

import React from "react";
import { screen } from "@testing-library/react";
import { plainRender } from "~/test-utils";
import SubtleContent from "./SubtleContent";

describe("SubtleContent", () => {
  it("wraps content in a PF/Content", () => {
    plainRender(<SubtleContent>Something</SubtleContent>);
    const content = screen.getByText("Something");
    expect(content.classList.contains("pf-v6-c-content")).toBe(true);
  });

  it("uses subtle text color", () => {
    plainRender(<SubtleContent>Something</SubtleContent>);
    const content = screen.getByText("Something");
    expect(content.classList.contains("pf-v6-u-text-color-subtle")).toBe(true);
  });

  it("allows PF/Content props", () => {
    plainRender(<SubtleContent isEditorial>Something</SubtleContent>);
    const content = screen.getByText("Something");
    expect(content.classList.contains("pf-m-editorial")).toBe(true);
  });
});
